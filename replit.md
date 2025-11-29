# Neon AI Hub - Cyberpunk Vision AI Console

## Overview
A fully Arabic-localized cyberpunk-themed web application powered by Google's Gemini 2.5 Pro with multimodal capabilities. Features a stunning neon UI with complete RTL support, file upload capabilities for images and PDFs, Cairo Bold typography in Arabic mode, and clean AI output.

## Recent Changes
- **November 29, 2025**: Final Implementation Complete
  - Implemented full Arabic/English localization with Wouter routing
  - Applied Cairo Bold font globally in Arabic mode with increased font sizes
  - Built responsive card-based hub with 8 feature modules
  - Integrated chat interface with real-time Gemini 2.5 Pro responses
  - Added file upload support (images/PDFs) with vision capabilities
  - Implemented session-based chat history with in-memory storage
  - Added chat input box directly on Hub page for quick access
  - Replaced generic icons with descriptive ones matching module functions
  - Configured clean AI output (no Markdown formatting)
  - Theme switching (light/dark mode) with persistent localStorage

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Routing**: Wouter
- **State Management**: TanStack Query
- **Styling**: Tailwind CSS with custom cyberpunk theme
- **Typography**: Cairo Bold font in Arabic mode
- **Components**: Shadcn/ui

### Backend (server/)
- **Framework**: Express.js
- **AI Integration**: Google Gemini 2.5 Pro API
- **File Upload**: Multer with base64 encoding
- **Storage**: In-memory session storage

### Key Files
- `client/src/pages/Hub.tsx` - Main hub with feature cards and quick chat
- `client/src/pages/Chat.tsx` - Full chat interface
- `client/src/lib/appContext.ts` - Global app state management
- `client/src/lib/translations.ts` - Complete Arabic/English translations
- `server/routes.ts` - API endpoints
- `server/gemini.ts` - Gemini integration service
- `shared/schema.ts` - TypeScript types

## API Endpoints
- `POST /api/chat` - Send chat messages with optional files
- `POST /api/upload` - Upload images/PDFs for analysis
- `GET /api/health` - System health check

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini API key (required)
- `SESSION_SECRET` - Session encryption key

## User Preferences
- Cyberpunk neon aesthetic with Electric Blue (#00F0FF) and Magenta (#FF006E)
- Full Arabic localization with Cairo Bold typography
- Light/Dark theme toggle with persistence
- Card-based central layout (no sidebar)
- Clean, professional AI output format
- RTL support for Arabic, LTR for English

## Running the Project
```bash
npm run dev
```
Application runs on port 5000 with automatic hot reload.

## Feature Modules (8)
1. **الدردشة** (Chat) - General AI conversation with MessageSquare icon
2. **أسال** (Ask) - Quick Q&A with HelpCircle icon
3. **البحث العلمي** (Research) - Document search with Search icon
4. **الاختبارات** (Tests) - Verification and assessment with CheckCircle icon
5. **توليد الصور** (Image Generation) - Create images with Wand2 icon
6. **المساعد العلمي** (Scientific Assistant) - Expert support with Users icon
7. **الخديوي** (Khedive Advisor) - Strategic consulting with Crown icon
8. **التزامن** (Quick Sync) - Rapid synchronization with RefreshCw icon

## Localization
- Full Arabic and English support
- Dynamic language switching with localStorage persistence
- All UI text translated and contextually appropriate
- Cairo Bold font automatically applied to Arabic text
- Increased font sizes for optimal readability in Arabic

## Theme Support
- Light mode: Clean white/blue aesthetic
- Dark mode: Cyberpunk neon cyan/magenta
- Persistent theme preference using localStorage
- Smooth transitions between themes
