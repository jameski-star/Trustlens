# Deployment Guide

## Deploying to GitHub Pages (Frontend)

### One-time setup

1. Push repo to GitHub
2. Go to **Settings > Pages** in your repo
3. Under **Build and deployment**, select **GitHub Actions**
4. Add a repository variable (Settings > Secrets and variables > Actions > Variables):
   - `VITE_API_URL` — your Render backend URL + `/api/v1` (e.g., `https://trustlens-api.onrender.com/api/v1`)

### Deploy

Push to `main` — the GitHub Actions workflow at `.github/workflows/deploy.yml` will build and deploy automatically.

Your site will be live at `https://<username>.github.io/trustlens/`

## Deploying to Render (Backend)

1. Go to [render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `trustlens-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random string
   - `JWT_REFRESH_SECRET`: Strong random string
   - `CORS_ORIGIN`: Your GitHub Pages URL (`https://<username>.github.io`)
6. Deploy

## MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user
4. Network Access: Add IP `0.0.0.0/0` (allow all for Render)
5. Copy the connection string to your backend env vars

## Notes

- The frontend is a single-page app — GitHub Pages serves `index.html` for all routes via the 404 fallback trick
- Make sure `CORS_ORIGIN` on the backend matches your frontend URL exactly
- For local dev, use `npm run dev` in both `frontend/` and `backend/`
