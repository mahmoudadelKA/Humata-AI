# Neon AI Hub - Cyberpunk Vision AI Console

## Overview
A cyberpunk-themed web application powered by Google's Gemini 2.5 Flash model with multimodal capabilities. Features a stunning neon UI with file upload support for images and PDFs.

## Recent Changes
- **November 29, 2025**: Initial build complete
  - Implemented cyberpunk neon theme with #0D0B2E deep dark background
  - Built card-based hub layout with 6 feature cards
  - Created console-style chat interface with message bubbles
  - Integrated Gemini 2.5 Flash for AI responses
  - Added file upload support for images and PDFs
  - Implemented session-based chat history (in-memory)

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Components**: Shadcn/ui

### Backend (server/)
- **Framework**: Express.js
- **AI Integration**: Google Gemini API (@google/genai)
- **File Upload**: Multer
- **Storage**: In-memory session storage

### Key Files
- `client/src/pages/Hub.tsx` - Main hub with feature cards
- `client/src/pages/Chat.tsx` - Chat interface with file upload
- `server/routes.ts` - API endpoints
- `server/gemini.ts` - Gemini AI service
- `shared/schema.ts` - TypeScript types and schemas

## API Endpoints
- `POST /api/chat` - Send chat messages with optional file references
- `POST /api/upload` - Upload images/PDFs for Gemini Vision analysis
- `GET /api/health` - System health check

## Environment Variables
- `GEMINI_API_KEY` - Required for Gemini API access

## User Preferences
- Cyberpunk neon aesthetic with Electric Blue (#00F0FF) and Magenta (#FF006E) accents
- Monospace fonts (Fira Code, JetBrains Mono, Space Mono)
- No sidebar - card-based central layout
- Console/terminal style interface

## Running the Project
```bash
npm run dev
```
The application runs on port 5000.

## Feature Cards
1. **NEURAL CHAT** - General AI conversation
2. **VISION CORE** - Image analysis mode
3. **DOC SCANNER** - PDF/document analysis
4. **KHEDIVE AI** - Strategic advisor persona
5. **MED CONSUL** - Medical information assistant
6. **QUICK SYNC** - Rapid Q&A mode
