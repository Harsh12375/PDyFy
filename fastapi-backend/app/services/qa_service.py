from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.text_splitter import RecursiveCharacterTextSplitter
from typing import Optional, Dict, List
from pathlib import Path
from ..schemas.document import QuestionResponse
from ..config import get_settings
import json

class QAService:
    def __init__(self):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-pro",
            temperature=0,
            max_tokens=None,
            google_api_key=get_settings().GOOGLE_API_KEY
        )
        self.storage_dir = "./storage/documents"
        Path(self.storage_dir).mkdir(parents=True, exist_ok=True)
        self.document_chunks: Dict[int, List[str]] = {}

    async def process_document(self, text_content: str, document_id: int):
        chunks = self.text_splitter.split_text(text_content)
        if not chunks:
            raise ValueError("No text chunks were generated")
            
        self.document_chunks[document_id] = chunks
        
        doc_path = Path(self.storage_dir) / f"doc_{document_id}.json"
        with open(doc_path, 'w', encoding='utf-8') as f:
            json.dump(chunks, f)

    def _simple_search(self, question: str, chunks: List[str], k: int = 3) -> List[str]:
        #TODO: Implement a more sophisticated search algorithm (Vector Embeddings)
        q_words = question.lower().split()



        
        chunk_scores = []
        for chunk in chunks:
            score = sum(1 for word in q_words if word in chunk.lower())
            chunk_scores.append((score, chunk))
        
        if not chunk_scores:
            return chunks
        
        return [chunk for _, chunk in sorted(chunk_scores, reverse=True)[:k]]

    async def answer_question(
        self,
        question: str,
        document_id: Optional[int] = None
    ) -> QuestionResponse:
        if document_id:
            if document_id not in self.document_chunks:
                doc_path = Path(self.storage_dir) / f"doc_{document_id}.json"
                if not doc_path.exists():
                    raise ValueError(f"Document {document_id} not found")
                with open(doc_path, 'r', encoding='utf-8') as f:
                    self.document_chunks[document_id] = json.load(f)
            
            chunks = self.document_chunks[document_id]
        else:
            chunks = []
            for doc_id in self.document_chunks.keys():
                chunks.extend(self.document_chunks[doc_id])
        
        relevant_chunks = self._simple_search(question, chunks)
        
        if not relevant_chunks:
            return QuestionResponse(
                answer="No relevant information found",
                confidence=0.0,
                source_document=""
            )
        
        context = "\n\n".join(relevant_chunks)
        prompt = f"""Answer the following question using only the context provided. If you cannot answer from the context, say "I cannot answer based on the provided context."

Context:
{context}

Question: {question}"""

        result = await self.llm.ainvoke(prompt)
        
        return QuestionResponse(
            answer=result.content,
            confidence=len(relevant_chunks) / 3, 
            source_document=f"Used {len(relevant_chunks)} relevant text chunks"
        )

    async def cleanup(self):
        self.document_chunks.clear()
        for file in Path(self.storage_dir).glob("doc_*.json"):
            file.unlink()