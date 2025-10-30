# Deployment Guide

## Render Deployment

### Required Environment Variables

Make sure to set these environment variables in your Render dashboard:

**Core Required:**
- `GEMINI_API_KEY` - Your Google Gemini API key
- `DATABASE_URL` - PostgreSQL database connection string
- `JWT_SECRET_KEY` - Secret key for JWT token signing
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `OPENROUTER_API_KEY` - OpenRouter API key for AI services

**Optional (with defaults):**
- `FRONTEND_URL` - Frontend URL (default: http://localhost:3000)
- `BACKEND_URL` - Backend URL (default: http://localhost:8000)
- `OPENROUTER_API_KEY1` - Additional OpenRouter API key (optional)

### Build Command
```bash
pip install -r requirements.txt
```

### Start Command
Choose one of these options:

**Option 1: Using Gunicorn (Recommended)**
```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120 --worker-class uvicorn.workers.UvicornWorker
```

**Option 2: Using the startup script**
```bash
python start.py
```

**Option 3: Using the run script**
```bash
python run.py
```

### Troubleshooting

1. **502 Bad Gateway**: Usually means the app isn't starting properly
   - Check that all required environment variables are set
   - Check the logs for any startup errors
   - Ensure the PORT environment variable is being used

2. **Port binding issues**: Make sure your app binds to `0.0.0.0:$PORT`
   - Render provides the PORT environment variable
   - Don't hardcode port numbers

3. **Environment variable issues**: 
   - All required variables must be set before the app starts
   - The app will exit immediately if any required variables are missing
