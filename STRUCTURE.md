# ResumeIQ - Project Structure

**Smart Resume Analysis, Powered by AI**

## Complete File Tree

```
resumeiq/
├── README.md                          # Complete setup and usage guide
├── LICENSE                            # MIT License
├── .env.example                       # Environment variables template
├── .gitignore                         # Git ignore rules
├── .eslintrc.json                     # ESLint configuration
├── docker-compose.yml                 # Docker orchestration
├── postman_collection.json            # API testing collection
├── STRUCTURE.md                       # This file
│
├── .github/
│   └── workflows/
│       └── ci.yml                     # GitHub Actions CI/CD pipeline
│
├── backend/
│   ├── package.json                   # Backend dependencies
│   ├── Dockerfile                     # Backend container config
│   │
│   ├── src/
│   │   ├── index.js                   # Express server entry point
│   │   ├── config.js                  # Environment config & provider abstraction
│   │   │
│   │   ├── routes/
│   │   │   ├── auth.js                # Authentication routes
│   │   │   ├── resume.js              # Resume upload/management routes
│   │   │   └── match.js               # Match analysis routes
│   │   │
│   │   ├── controllers/
│   │   │   ├── authController.js      # Auth logic (signup/login/delete)
│   │   │   ├── resumeController.js    # Resume operations
│   │   │   └── matchController.js     # Full match flow orchestration
│   │   │
│   │   ├── models/
│   │   │   ├── User.js                # User schema (Mongoose)
│   │   │   ├── Resume.js              # Resume schema with chunks & embeddings
│   │   │   └── Match.js               # Match results schema
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js      # JWT verification
│   │   │   ├── multerUpload.js        # File upload handling
│   │   │   └── rateLimiter.js         # Rate limiting (general & AI)
│   │   │
│   │   ├── services/
│   │   │   ├── parserService.js       # PDF/DOCX/TXT parsing
│   │   │   ├── chunkService.js        # Token-aware text chunking
│   │   │   ├── embeddingService.js    # Provider-agnostic embeddings
│   │   │   ├── similarityService.js   # Cosine similarity & scoring
│   │   │   ├── llmService.js          # Provider-agnostic LLM calls
│   │   │   ├── pdfService.js          # HTML to PDF generation
│   │   │   └── vectorStore/
│   │   │       └── memoryStore.js     # In-memory vector store + hooks
│   │   │
│   │   └── prompts/
│   │       ├── match_prompt.md        # Match analysis prompt template
│   │       ├── rewrite_prompt.md      # Resume rewrite prompt template
│   │       └── ats_prompt.md          # ATS check prompt template
│   │
│   ├── tests/
│   │   ├── similarity.test.js         # Similarity service unit tests
│   │   └── match.test.js              # Match endpoint integration tests
│   │
│   ├── scripts/
│   │   └── seed.js                    # Database seeding script
│   │
│   └── uploads/
│       └── .gitkeep                   # Ensure directory exists
│
└── frontend/
    ├── package.json                   # Frontend dependencies
    ├── Dockerfile                     # Frontend container config
    ├── nginx.conf                     # Nginx configuration for production
    ├── vite.config.js                 # Vite build configuration
    ├── tailwind.config.js             # Tailwind CSS configuration
    ├── postcss.config.js              # PostCSS configuration
    ├── index.html                     # HTML entry point
    ├── .env.example                   # Frontend env template
    │
    ├── src/
    │   ├── main.jsx                   # React entry point
    │   ├── App.jsx                    # Main app component with routing
    │   ├── api.js                     # Axios API wrapper
    │   │
    │   ├── styles/
    │   │   └── index.css              # Global styles with Tailwind
    │   │
    │   ├── pages/
    │   │   ├── Landing.jsx            # Landing page
    │   │   ├── Auth.jsx               # Login/signup page
    │   │   ├── Upload.jsx             # Resume upload & JD input
    │   │   ├── Results.jsx            # Match results display
    │   │   └── Dashboard.jsx          # User dashboard with history
    │   │
    │   ├── components/
    │   │   ├── Navbar.jsx             # Navigation bar
    │   │   ├── UploadForm.jsx         # File upload component
    │   │   ├── ScoreCard.jsx          # Score display card
    │   │   ├── SnippetList.jsx        # Original vs tailored bullets
    │   │   ├── EditResumeModal.jsx    # Resume editing modal
    │   │   └── PDFDownloadButton.jsx  # PDF download handler
    │   │
    │   └── test/
    │       └── setup.js               # Test setup configuration
    │
    └── tests/
        └── Upload.test.jsx            # Upload flow tests
```

## Key Features Implemented

### Backend
- ✅ JWT authentication with signup/login/delete
- ✅ Resume upload (PDF/DOCX/TXT) with parsing
- ✅ Token-aware chunking (200-400 tokens)
- ✅ Provider-agnostic embeddings (OpenAI/Cohere/HuggingFace)
- ✅ In-memory vector store with Pinecone/Redis hooks
- ✅ Cosine similarity matching
- ✅ Provider-agnostic LLM (OpenAI/Gemini/Anthropic)
- ✅ Structured prompt templates
- ✅ Match scoring with breakdown
- ✅ AI-powered resume rewriting
- ✅ ATS compatibility check
- ✅ Rate limiting (general + AI endpoints)
- ✅ User data deletion
- ✅ Feedback collection
- ✅ Unit & integration tests
- ✅ Docker support

### Frontend
- ✅ Landing page with features
- ✅ Authentication (login/signup)
- ✅ Resume upload with drag-and-drop
- ✅ Job description input
- ✅ Match results with visualizations
- ✅ Score breakdown (skills/experience/keywords)
- ✅ Missing skills display
- ✅ Tailored bullets with original comparison
- ✅ ATS warnings and recommendations
- ✅ Feedback submission
- ✅ Dashboard with match history
- ✅ Responsive design with Tailwind CSS
- ✅ Docker support with Nginx

## Quick Start Commands

```bash
# Local development
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev

# Docker
docker-compose up --build

# Tests
cd backend && npm test
cd frontend && npm test

# Seed database
cd backend && npm run seed
```

## Environment Setup

1. Copy `.env.example` to `.env` in both backend and frontend
2. Add your API keys (OpenAI, Gemini, etc.)
3. Configure MongoDB URI
4. Set JWT secret

## Provider Switching

Change `AI_PROVIDER` in backend `.env`:
- `openai` - OpenAI GPT models
- `gemini` - Google Gemini
- `anthropic` - Anthropic Claude
- `mock` - Testing without API calls

## Architecture Highlights

- **Modular Services**: Each service is independent and swappable
- **Provider Abstraction**: Easy to switch AI providers
- **Caching**: Embeddings cached in database
- **Rate Limiting**: Prevents abuse of expensive AI operations
- **Error Handling**: Comprehensive error handling throughout
- **Testing**: Unit tests for core logic, integration tests for APIs
- **Docker Ready**: Full containerization support
- **CI/CD**: GitHub Actions workflow included

## Next Steps for Production

1. Add Redis for caching and sessions
2. Implement Pinecone/Weaviate for vector storage
3. Add email verification
4. Implement password reset
5. Add admin dashboard
6. Implement batch resume processing
7. Add analytics and monitoring
8. Set up proper logging (Winston/Pino)
9. Add rate limiting per user
10. Implement file cleanup cron jobs
