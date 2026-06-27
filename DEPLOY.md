# Deployment Guide

## Deploying to Vercel (Frontend)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api/v1`
6. Deploy

## Deploying to Render (Backend)

1. Go to [render.com](https://render.com)
2. Create a new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - Name: `trustlens-api`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: Strong random string
   - `JWT_REFRESH_SECRET`: Strong random string
   - `CORS_ORIGIN`: Your Vercel frontend URL
6. Deploy

## Setting up MongoDB Atlas

1. Go to [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Create a database user (username/password)
4. Network Access: Add IP `0.0.0.0/0` (allow all for Render)
5. Get connection string and add to backend env vars

## Docker Deployment

```bash
# Build and run all services
docker-compose up -d

# Or build individually
docker build -t trustlens-backend ./backend
docker build -t trustlens-frontend ./frontend
```
