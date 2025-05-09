# PDF Chat Assistant

A powerful PDF document interaction system that allows users to chat with their PDF documents using advanced language models and vector search capabilities. This system combines the power of Next.js for the frontend, FastAPI for the backend, and leverages AWS services for robust document management and storage.

## 🌟 Features

- **Interactive PDF Chat**: Have natural conversations with your PDF documents using advanced language models
- **Multiple Document Support**: Upload and manage multiple PDF files simultaneously
- **Real-time Chat Interface**: Modern, responsive chat interface built with Next.js and TailwindCSS
- **Vector Search**: Efficient document search using vector embeddings for accurate information retrieval
- **Secure Storage**: Document storage and management using AWS S3 and DynamoDB
- **Cross-Platform**: Works seamlessly on any modern web browser
- **Document Processing**: Advanced PDF processing with PyMuPDF
- **Chat History**: Persistent chat history for each document
- **Secure File Handling**: Built-in validation and secure file processing
- **Responsive Design**: Mobile-friendly interface that works across all devices

## 🏗️ Technology Stack

### Backend (FastAPI)
- FastAPI for high-performance API development
- SQLAlchemy for robust database ORM and management
- LangChain for sophisticated document processing and chat capabilities
- ChromaDB for efficient vector storage and similarity search
- PyMuPDF for comprehensive PDF processing
- AWS SDK for cloud integration
- SQLite for local development database
- Pydantic for data validation

### Frontend (Next.js)
- Next.js 15.0.2 for server-side rendering and optimal performance
- React 19.0.0 for dynamic UI components
- TailwindCSS for modern, responsive styling
- AWS SDK for seamless S3 and DynamoDB integration
- Axios for reliable API communication
- TypeScript for type-safe development
- Custom chat interface components
- Responsive file upload system

## 🚀 Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher
- npm or yarn
- AWS account with appropriate permissions
- Git for version control

### Backend Setup
1. Clone the repository and navigate to the backend directory:
   ```bash
   cd fastapi-backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables in `.env`:
   ```env
   APP_NAME=PDF Chat Assistant
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=your_region
   DATABASE_URL=sqlite:///sql_app.db
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ai-planet
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_AWS_REGION=your_region
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## 📚 API Documentation

Comprehensive API documentation is available at http://localhost:8000/docs when the backend server is running.

### Key Endpoints:
- `POST /api/v1/documents/upload`: Upload new PDF documents
- `POST /api/v1/documents/{document_id}/chat`: Interact with documents through chat
- `GET /api/v1/documents`: Retrieve all uploaded documents
- `GET /api/v1/documents/{document_id}`: Get specific document details
- `GET /api/v1/documents/{document_id}/chat-history`: Retrieve chat history

## 🔧 Configuration

### AWS Setup
1. Create an S3 bucket for document storage
2. Set up a DynamoDB table for metadata
3. Configure IAM user with appropriate permissions
4. Update environment variables with AWS credentials

### Security Considerations
- Implement proper CORS settings in `fastapi-backend/app/main.py`
- Use secure environment variables
- Follow AWS security best practices
- Implement file type validation
- Set up proper AWS IAM roles and permissions

## 🔍 Project Structure
```
├── ai-planet/                # Frontend Next.js application
│   ├── app/                  # Next.js app directory
│   ├── components/           # React components
│   └── libs/                 # Utility functions and AWS configs
└── fastapi-backend/         # Backend FastAPI application
    ├── app/                 # Main application code
    ├── models/             # Database models
    ├── schemas/            # Pydantic schemas
    └── services/           # Business logic services
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 style guide for Python code
- Use TypeScript for frontend development
- Write tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- FastAPI for the efficient Python web framework
- Next.js team for the powerful React framework
- LangChain for document processing capabilities
- AWS for reliable cloud infrastructure
- All contributors who have helped improve this project

## 🐛 Known Issues & Roadmap

### Current Issues
- [Create an issue in the repository]

### Future Improvements
- Implementation of real-time collaboration features
- Support for additional document formats
- Enhanced security features
- Advanced document parsing capabilities

## 📧 Contact & Support

For questions, support, or contributions:
- Open an issue in the GitHub repository
- Contact the maintainers
- Join our community discussions

---
Made with ❤️ by Harsh
