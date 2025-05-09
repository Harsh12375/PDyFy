from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from .api.v1.endpoints import documents
from .database import Base, engine
from .config import get_settings
import app.services.qa_service as qa_service


app = FastAPI(title=get_settings().APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)