# Anem.ai Backend API

Simple Node.js backend for Anem.ai Android app.

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user |
| POST | /auth/login | Login user |
| GET | /users/:id | Get user details |
| GET | /articles | Get all articles |
| GET | /articles/:id | Get article by ID |
| POST | /predict | Predict anemia from eye scan |
| GET | /history/:id | Get detection history |

## Deploy to Railway (Free, Always On)

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Upload this folder to a new GitHub repository first:
   - Go to github.com → New repository → name it "anem-ai-backend"
   - Upload all files
4. Connect Railway to your GitHub repo
5. Railway will auto-deploy and give you a URL like:
   https://anem-ai-backend-production.up.railway.app

6. Copy that URL and update your Android app's build.gradle:
   buildConfigField("String", "BASE_URL_GENERAL", '"https://YOUR-URL.up.railway.app/"')

## Run Locally

```bash
npm install
npm start
```

Server runs on http://localhost:3000
