from sqlalchemy import Column, Integer, String, DateTime , Boolean
from datetime import datetime
from ..database import Base

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, unique=True, index=True)
    file_path = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)