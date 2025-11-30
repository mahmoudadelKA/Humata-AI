# HUMATA AI - Cyberpunk Vision AI Console

## Overview
A fully Arabic-localized cyberpunk-themed web application powered by Google's Gemini 2.5 Pro with multimodal capabilities. Features 8 specialized AI modules with stunning neon UI, complete RTL support, file upload capabilities, and clean AI output. Credited to "المبرمج محمود عادل" (Programmer: Mahmoud Adel).

## Status: ✅ FULLY COMPLETE (8 Modules)
Application is production-ready with all 8 primary modules fully integrated and tested.

## Recent Changes
- **November 30, 2025**: Final Completion
  - Added 8th module: "المساعد العلمي" (Scientific Assistant) with Math/Physics/Chemistry/Arabic support
  - Implemented comprehensive error handling with Arabic messages
  - Enhanced error display for API quota limits with user-friendly notifications
  - Full file upload + URL input support for Doctor and Scientific Assistant modules
  - Auto-grounding enabled for Research, Doctor, and Scientific Assistant modules
  - Fullscreen Kiira AI iframe for AI Image Generation
  - Quiz settings panel with custom configurations (questions count, type, difficulty)

## Project Architecture

### Frontend (client/)
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query v5 with React hooks
- **Styling**: Tailwind CSS with custom cyberpunk neon theme
- **Typography**: Cairo Bold font in Arabic mode with RTL support
- **Components**: Shadcn/ui with custom cyberpunk styling
- **Localization**: Full Arabic/English support with localStorage persistence

### Backend (server/)
- **Framework**: Express.js with TypeScript
- **AI Integration**: Google Gemini 2.5 Pro API with web search (grounding)
- **File Upload**: Multer for image/PDF processing
- **Storage**: In-memory session storage
- **Error Handling**: Comprehensive API error handling with user-friendly Arabic messages

### Key Files
- `client/src/pages/Hub.tsx` - Main hub with 8 feature cards
- `client/src/pages/Chat.tsx` - Unified chat interface for all personas
- `client/src/lib/appContext.ts` - Global app state and language management
- `client/src/lib/translations.ts` - Complete Arabic/English translation dictionary
- `server/routes.ts` - All API endpoints with error handling
- `server/gemini.ts` - Gemini 2.5 Pro integration service
- `shared/schema.ts` - TypeScript type definitions

## API Endpoints
- `POST /api/chat` - Send messages with optional files and persona context
- `POST /api/upload` - Upload images/PDFs for analysis
- `POST /api/auth/verify` - JWT session verification
- `GET /api/conversations` - Fetch user conversations
- `GET /api/conversations/:id` - Fetch specific conversation messages

## Environment Variables
- `GEMINI_API_KEY` - Google Gemini 2.5 Pro API key (required)
- `SESSION_SECRET` - JWT session encryption key
- Database variables (PostgreSQL): `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`

## User Preferences
- Cyberpunk neon aesthetic: Electric Blue (#00F0FF) and Magenta (#FF006E)
- Full Arabic localization with Cairo Bold typography and RTL layout
- Light/Dark theme toggle with persistent localStorage
- Card-based central hub layout (no sidebar)
- Clean, professional AI output (no Markdown decorations)
- Contextual help text and error messages in user's language

## Running the Project
```bash
npm run dev
```
Application runs on `0.0.0.0:5000` with automatic hot reload.

## Feature Modules (8) - All Active ✅

### 1. **الدردشة** (Chat) 
- General AI conversation
- Icon: MessageSquare (Cyan glow)
- Supports file uploads
- No grounding (AI-only responses)

### 2. **اسأل** (Ask)
- Quick Q&A with web search
- Icon: HelpCircle (Magenta glow)
- Auto-grounding enabled
- Perfect for factual questions

### 3. **البحث العلمي** (Research)
- Academic research from trusted sources
- Icon: BookOpen (Green glow)
- Auto-grounding + PubMed/Google Scholar
- File + URL support for document analysis

### 4. **توليد الصور** (Image Generation/Search)
- Search images from Wikimedia Commons
- Icon: Image (Yellow glow)
- Returns structured JSON image URLs
- Reliable free image API

### 5. **الاختبارات** (Quizzes)
- Generate interactive quizzes
- Icon: CheckCircle (Cyan glow)
- Custom settings: questions count (1-50), type (MC/TF/Mixed), difficulty (Easy/Medium/Hard)
- File + URL support for source material

### 6. **صور ذكاء اصطناعي** (AI Image Generation)
- Kiira AI image generation
- Icon: Sparkles (Magenta glow)
- Fullscreen iframe integration
- Direct access to AI image generation service

### 7. **الدكتور** (Doctor)
- Medical consultations from trusted sources
- Icon: Stethoscope (Green glow)
- Auto-grounding + PubMed/Google Scholar
- File + URL support for medical documents
- Comprehensive medical knowledge with disclaimers

### 8. **المساعد العلمي** (Scientific Assistant)
- Solves math, physics, chemistry, Arabic language problems
- Icon: Users (Cyan glow)
- Auto-grounding + Google Scholar/Khan Academy
- File + URL support for problem analysis
- Step-by-step explanations with formulas

## System Prompts & Intelligence
- Each module has specialized system instructions
- Gemini 2.5 Pro is configured with:
  - Technical transparency instruction (reveal model name)
  - Clean output requirement (no Markdown)
  - Web search capability (grounding) for Research/Doctor/Scientific Assistant
  - Custom domain expertise for each module

## Localization Features
- Full Arabic (RTL) and English (LTR) support
- Dynamic language switching via app context
- All UI text translated (50+ keys)
- Cairo Bold font auto-applied to Arabic text
- Increased font sizes for Arabic readability
- LocalStorage persistence for language preference

## Theme Support
- **Light Mode**: Clean white/blue aesthetic with professional appearance
- **Dark Mode**: Cyberpunk neon cyan/magenta with glowing effects
- Persistent theme preference using localStorage
- Smooth CSS transitions between themes

## Error Handling
- API quota errors: User-friendly Arabic messages
- Network errors: Clear error notifications
- File upload errors: Detailed feedback
- Chat errors: Specific error types with contextual help

## Known Limitations
- Gemini 2.5 Pro Free Tier: 50 requests/day limit
- Image generation requires active internet
- File uploads limited to images/PDFs
- Session storage: In-memory (lost on server restart)

## Future Enhancements
- PostgreSQL conversation persistence
- User authentication/profiles
- Conversation export (PDF/JSON)
- Advanced file analysis (videos, audio)
- Voice input/output capabilities
- Custom model fine-tuning

## Testing Notes
- All 8 modules fully functional
- Error handling tested and working
- Responsive design on mobile/tablet/desktop
- Theme switching works smoothly
- Language switching is immediate
- File uploads process correctly

## Credits
**Programmer**: محمود عادل (Mahmoud Adel)  
**Framework**: Google Gemini 2.5 Pro API  
**UI Components**: Shadcn + Tailwind CSS  
**Deployment**: Replit  

---
Last Updated: November 30, 2025  
Status: Production Ready ✅
