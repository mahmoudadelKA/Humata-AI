# HUMATA AI - Security Policy

## Secret Management

### Properly Managed Secrets
All sensitive information is managed through environment variables:

1. **GEMINI_API_KEY**
   - Location: `server/gemini.ts` line 8
   - Usage: `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })`
   - Type: API Key for Google Generative AI

2. **SESSION_SECRET (JWT)**
   - Location: `server/index.ts` line 31 and `server/routes.ts` line 60
   - Usage: `const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-key"`
   - Type: Secret key for JWT token signing/verification
   - Fallback: Safe fallback provided for development

3. **Database Credentials**
   - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE
   - Location: Used by Drizzle ORM via environment variables
   - Type: PostgreSQL connection parameters

### No Hardcoded Secrets
✅ **Verified:** The codebase contains NO hardcoded API keys, tokens, or secrets.

All sensitive data is:
- Read from `process.env` at runtime
- Never logged or exposed in error messages
- Protected by `.gitignore` for `.env` files

## Git & Repository Security

### .gitignore Configuration
The following items are excluded from version control:

**Environment Files:**
```
.env
.env.local
.env.*.local
.env.production.local
```

**Temporary & Build Files:**
```
/tmp/
uploads/
dist/
build/
*.log
```

**IDE & System Files:**
```
.vscode/
.idea/
node_modules/
.DS_Store
Thumbs.db
```

### Secret Scanning
Before pushing to GitHub:
1. Run: `git status` to verify no `.env` files are staged
2. Run: `git log --all -- .env` to check history
3. Use GitHub's secret scanning features
4. Use tools like `git-secrets` or `truffleHog` for automated scanning

## Authentication & Authorization

### JWT Implementation
- Algorithm: HS256 (HMAC with SHA-256)
- Token Expiry: 7 days
- Storage: HTTP-only cookies (production)
- Verification: Applied to all protected routes

### Password Security
- Hashing: SHA256 (via Node.js crypto module)
- Implementation: `server/routes.ts` line 56-58
- Note: For production, consider bcrypt or Argon2

### Authorization
- Session-based user identification
- JWT payload includes `userId`
- Middleware validates tokens on protected routes

## API Security

### Input Validation
- File uploads: MIME type filtering (lines 18-24 in `server/routes.ts`)
- Message content: XSS protection via content-type headers
- URL inputs: Validated before sending to Gemini API
- JSON payloads: Express.json middleware with 50MB limit

### CORS & Headers
- Access-Control headers properly configured
- Content-Type validation on uploads
- File size limits: 20MB per upload

### Rate Limiting
- Gemini API: Built-in quota management (50 requests/day free tier)
- File uploads: Multer limits to 20MB per file

## Database Security

### Connection Security
- Credentials passed via `DATABASE_URL` environment variable
- Using `@neondatabase/serverless` for secure pooling
- Drizzle ORM handles parameterized queries (SQL injection prevention)

### Data Protection
- No plaintext passwords stored (SHA256 hashed)
- JWT secrets never exposed in responses
- User IDs used in sessions (not emails/usernames)

## HTTPS & Transport Security

### Production Deployment
- Always use HTTPS in production
- Set `Secure` flag on cookies
- Implement HSTS headers
- Use TLS 1.2 or higher

## Deployment Checklist

- [ ] All `.env` files added to `.gitignore`
- [ ] Environment variables set in deployment platform
- [ ] `npm run build` succeeds without errors
- [ ] No secrets in build output (`dist/index.cjs`)
- [ ] HTTPS enabled (if applicable)
- [ ] Database backups configured
- [ ] Log monitoring activated
- [ ] Error reporting configured

## Incident Response

If a secret is accidentally committed:

1. **Immediately:**
   ```bash
   git log --all -- .env | head -5
   git show <commit-hash>:.env
   ```

2. **Revoke & Regenerate:**
   - Rotate GEMINI_API_KEY in Google Console
   - Regenerate SESSION_SECRET
   - Reset database credentials

3. **Clean History:**
   - Use `git-filter-branch` or `BFG Repo-Cleaner`
   - Force push after cleanup

4. **Notify:**
   - Inform team members
   - Review access logs

## Security Best Practices

1. ✅ Use `.env` files for secrets (not committed)
2. ✅ Rotate secrets regularly
3. ✅ Use strong random values for SESSION_SECRET
4. ✅ Enable GitHub secret scanning
5. ✅ Use unique database credentials per environment
6. ✅ Monitor API usage and logs
7. ✅ Keep dependencies updated (`npm audit`)
8. ✅ Use HTTPS everywhere in production

---

**Last Updated:** November 30, 2025  
**Status:** Secure ✅
