# AI Planet - FullStack Intern Assignment

This project consists of a **FastAPI backend** and **Next.js frontend** that allows users to upload PDF documents and ask questions about their content using AI.

## Features

### PDF Upload & Processing

- Upload PDF documents through the UI
- Automatic text extraction using PyMuPDF
- Document storage and management
- Progress tracking for document processing

### Q&A Capabilities

- Ask questions about uploaded documents
- AI-powered responses using Google's Gemini model
- Context-aware answers based on document content

### Example Files for Testing

- [**Sample PDF Document 1**](/ai-planet//Example%20Files%20For%20Test/example.pdf)
- [**Sample PDF Document 2**](/ai-planet//Example%20Files%20For%20Test/bitcoin-whitepaper.pdf)

## Setup & Running

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd fastapi-backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Replace Gemini Key in the `.env` file:
   ```plaintext
   GOOGLE_API_KEY=your_api_key_here
   ```
5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ai-planet
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. The application will be available at:
   - **Frontend**: [http://localhost:3000](http://localhost:3000)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

## Project Structure

### Backend (`fastapi-backend`)

- **app/** - FastAPI application
  - **api/** - API routes and endpoints
  - **services/** - Main Logic
    - **document_processor.py** - PDF processing
    - **qa_service.py** - Q&A functionality
  - **models/** - Database models
  - **schemas/** - Pydantic schemas

### Frontend (`ai-planet`)

- **app/** - Next.js application
  - **page.tsx** - Main UI component
  - **types/** - TypeScript interfaces

## Technologies Used

### Backend

- FastAPI
- SQLAlchemy
- Google Gemini AI
- PyMuPDF
- SQLite

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- React

## API Endpoints

### Document Upload

- **Endpoint**: `POST /api/v1/documents/upload/`
- **Input**:
  - `file`: File (PDF only)
- **Output**:
  - `id`: number
  - `filename`: string
  - `file_path`: string
  - `upload_date`: string
  - `processed`: Boolean

### Document Processing

- **Endpoint**: `POST /api/v1/documents/question/`
- **Input**:
  - `question`: string
  - `document_id`: number
- **Output**:
  - `answer`: string
  - `confidence`: number
  - `source_document`: string

## Application Architecture

### Backend Architecture (FastAPI)

1. **API Layer (`/app/api/v1/endpoints/`)**

   - Handles HTTP requests
   - Input validation
   - Route definitions
   - Response formatting

2. **Service Layer (`/app/services/`)**

   - `document_processor.py`: Handles PDF processing
   - `qa_service.py`: Manages Q&A functionality
   - Integration with external services (Gemini AI)

3. **Data Layer**

   - **Models (`/app/models/`)**: SQLAlchemy definitions
   - **Schemas (`/app/schemas/`)**: Pydantic models for validation
   - **Database** (`/app/database.py`): SQLite configuration

4. **Configuration**
   - Environment variables management
   - Application settings
   - Database configurations
