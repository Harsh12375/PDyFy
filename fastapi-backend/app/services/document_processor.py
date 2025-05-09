from pathlib import Path
from fastapi import HTTPException
import logging
from typing import Optional, List
from ..models.document import Document
from ..config import get_settings
import shutil
import pymupdf
import base64
from datetime import datetime, timedelta
import time
from concurrent.futures import ThreadPoolExecutor
from functools import partial
import asyncio

# Initialize Together client only if API key is available
together_client = None
try:
    from together import Together
    api_key = get_settings().TOGETHER_API
    if api_key:
        together_client = Together(api_key=api_key)
except (ImportError, Exception) as e:
    logging.warning(f"Together API initialization failed: {str(e)}")
    together_client = None

# Rate limiting configuration
FREE_TIER_LIMITS = {
    "requests_per_minute": 60,
    "tokens_per_minute": 60000,
    "max_concurrent_requests": 10  # Adjust based on your needs
}

class RateLimiter:
    def __init__(self, requests_per_minute, tokens_per_minute, max_concurrent):
        self.requests_per_minute = requests_per_minute
        self.tokens_per_minute = tokens_per_minute
        self.requests = []
        self.tokens = []
        self.semaphore = asyncio.Semaphore(max_concurrent)
        self.lock = asyncio.Lock()

    async def wait_for_request(self):
        async with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=1)

            # Clean up old requests
            self.requests = [req for req in self.requests if req > cutoff]

            if len(self.requests) >= self.requests_per_minute:
                wait_time = (self.requests[0] - cutoff).total_seconds()
                if wait_time > 0:
                    await asyncio.sleep(wait_time)
                    return await self.wait_for_request()

            self.requests.append(now)

    async def wait_for_tokens(self, token_count):
        async with self.lock:
            now = datetime.now()
            cutoff = now - timedelta(minutes=1)

            # Clean up old token usage
            self.tokens = [(t, c) for t, c in self.tokens if t > cutoff]
            current_tokens = sum(count for _, count in self.tokens)

            if current_tokens + token_count > self.tokens_per_minute:
                wait_time = (self.tokens[0][0] - cutoff).total_seconds()
                if wait_time > 0:
                    await asyncio.sleep(wait_time)
                    return await self.wait_for_tokens(token_count)

            self.tokens.append((now, token_count))

    async def acquire(self):
        return await self.semaphore.acquire()

    def release(self):
        self.semaphore.release()

rate_limiter = RateLimiter(
    requests_per_minute=FREE_TIER_LIMITS["requests_per_minute"],
    tokens_per_minute=FREE_TIER_LIMITS["tokens_per_minute"],
    max_concurrent=FREE_TIER_LIMITS["max_concurrent_requests"]
)

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

settings = get_settings()

async def save_uploaded_file(file, filename: str) -> Path:
    file_path = Path(settings.STORAGE_PATH) / filename
    file_path.parent.mkdir(parents=True, exist_ok=True)

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path

async def process_page(page, page_num, executor):
    """Process a single page with rate limiting"""
    try:
        page_text = page.get_text()

        if page_text and page_text.strip():
            logger.debug(f"Extracted {len(page_text)} characters from page {page_num + 1}")
            return page_text

        elif len(page_text) < 50:
            await rate_limiter.acquire()
            try:
                await rate_limiter.wait_for_request()

                # Run image processing in thread pool to avoid blocking
                loop = asyncio.get_event_loop()
                pix = await loop.run_in_executor(executor, page.get_pixmap)
                img_bytes = await loop.run_in_executor(executor, pix.tobytes)
                base64_image = base64.b64encode(img_bytes).decode()

                try:
                    if together_client is None:
                        logger.warning("Together API client not available. Skipping OCR for image-based content.")
                        return f"[Image content on page {page_num + 1} - OCR not available]"

                    response_text = together_client.chat.completions.create(
                        model="meta-llama/Llama-3.2-11B-Vision-Instruct-Turbo",
                        messages=[
                            {
                                "role": "user",
                                "content": [
                                    {"type": "text", "text": "Extract text from the following image"},
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": f"data:image/jpeg;base64,{base64_image}",
                                        },
                                    },
                                ],
                            }
                        ],
                        stream=False,
                    )

                    response_tokens = len(response_text.choices[0].message.content.split()) * 1.3
                    await rate_limiter.wait_for_tokens(int(response_tokens))

                    extracted_text = response_text.choices[0].message.content
                    logger.debug(f"Extracted {len(extracted_text)} characters from page {page_num + 1}")
                    return extracted_text

                except Exception as api_error:
                    if "429" in str(api_error):
                        logger.warning("Rate limit exceeded, waiting before retry...")
                        await asyncio.sleep(60)
                        return await process_page(page, page_num, executor)
                    raise
            finally:
                rate_limiter.release()

        logger.warning(f"No text extracted from page {page_num + 1}")
        return ""

    except Exception as e:
        logger.error(f"Error processing page {page_num + 1}: {str(e)}")
        return ""

async def extract_text_from_pdf(file_path: Path) -> str:
    """Extract text from PDF using PyMuPDF with concurrent processing"""
    if not file_path.exists():
        raise HTTPException(status_code=404, detail=f"File not found: {file_path}")

    try:
        doc = pymupdf.open(str(file_path))
        logger.debug(f"Opened PDF with {len(doc)} pages")

        if len(doc) == 0:
            raise HTTPException(status_code=400, detail="PDF file appears to be empty")

        # Create thread pool for CPU-bound tasks
        with ThreadPoolExecutor(max_workers=FREE_TIER_LIMITS["max_concurrent_requests"]) as executor:
            # Process pages concurrently
            tasks = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                task = process_page(page, page_num, executor)
                tasks.append(task)

            # Wait for all pages to be processed
            text_content = await asyncio.gather(*tasks)

        # Filter out empty strings and join results
        full_text = "\n\n".join(text for text in text_content if text.strip())

        if not full_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract text - PDF may be scanned/image-based"
            )

        return full_text

    except Exception as e:
        logger.error(f"Error extracting text: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error extracting text: {str(e)}"
        )
    finally:
        if 'doc' in locals():
            doc.close()