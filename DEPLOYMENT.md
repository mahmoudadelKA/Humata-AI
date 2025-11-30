# HUMATA AI - Deployment Guide

## Security Checklist ✅

### Environment Variables
All sensitive keys are properly managed using `process.env`:
- `GEMINI_API_KEY` - Google Gemini API key (used in `server/gemini.ts`)
- `SESSION_SECRET` - JWT secret for session authentication (used in `server/index.ts` and `server/routes.ts`)
- `DATABASE_URL` - PostgreSQL connection string (used in Drizzle config)
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` - PostgreSQL credentials

**Verification:**
- ✅ No hardcoded secrets in public code
- ✅ All keys loaded from `process.env` with safe fallbacks
- ✅ `.gitignore` updated to exclude `.env` files

### Git Security
Updated `.gitignore` to exclude:
- `.env` and all environment variable files
- `/tmp/` directory (temporary file uploads)
- `node_modules/` (dependencies)
- Build output files
- IDE configuration files
- OS-specific files

### Build & Production

**Development:**
```bash
npm run dev
```
Runs: `NODE_ENV=development tsx server/index.ts`

**Production Build:**
```bash
npm run build
```
Generates: `dist/index.cjs` (built with esbuild)

**Production Start:**
```bash
npm start
```
Runs: `NODE_ENV=production node dist/index.cjs`

### Deployment Instructions

1. **Clone Repository:**
   ```bash
   git clone <repository-url>
   cd humata-ai
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Set Environment Variables:**
   Create a `.env` file (not committed to git):
   ```
   GEMINI_API_KEY=your_gemini_api_key
   SESSION_SECRET=your_jwt_secret_key
   DATABASE_URL=postgresql://user:password@host:port/database
   PGHOST=host
   PGPORT=5432
   PGUSER=user
   PGPASSWORD=password
   PGDATABASE=database
   NODE_ENV=production
   PORT=5000
   ```

4. **Database Setup:**
   ```bash
   npm run db:push
   ```

5. **Build Application:**
   ```bash
   npm run build
   ```

6. **Start Server:**
   ```bash
   npm start
   ```
   Server will run on `http://0.0.0.0:5000`

### Platform-Specific Deployment

#### Replit
- Environment variables are managed through Replit Secrets
- Workflow automatically runs `npm run dev` in development
- Use publishing button for production deployment

#### Other Platforms (Vercel, Heroku, etc.)
- Set environment variables in platform dashboard
- Use `npm start` as the start command
- Ensure Node.js 18+ is available
- Port should be configurable via `PORT` env var (default: 5000)

### Security Checklist

- [x] All secrets use `process.env` (no hardcoded values)
- [x] `.gitignore` properly configured
- [x] `package.json` has correct start command
- [x] No sensitive files in git history
- [x] Dependencies pinned to specific versions
- [x] JWT authentication implemented
- [x] Database credentials managed via env vars

### Build Output

The production build creates `dist/index.cjs` which includes:
- Express server with API routes
- Authentication middleware
- Gemini API integration
- Database connectivity
- Frontend compiled as static assets

### Performance Notes

- Frontend built with Vite (optimized for production)
- Server uses Express with middleware for auth and logging
- Database pooling managed by `@neondatabase/serverless`
- Multer configured for 20MB file uploads

### Monitoring & Logging

- All API requests logged with timestamp, method, path, status, and duration
- Error handling with proper HTTP status codes
- Gemini API errors caught with user-friendly messages

---

**Last Updated:** November 30, 2025  
**Version:** 1.0.0  
**Status:** Production Ready ✅
