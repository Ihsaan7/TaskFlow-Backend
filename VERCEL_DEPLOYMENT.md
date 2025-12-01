# TaskFlow Backend - Vercel Deployment Guide

## ✅ Pre-Deployment Checklist

Your backend is now properly configured for Vercel deployment. Here's what's been set up:

### Files Structure
```
TaskFlow-Backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── src/
│   ├── app.js            # Express app configuration
│   ├── routes/           # All API routes
│   ├── controllers/      # Business logic
│   ├── models/           # MongoDB models
│   └── ...
├── package.json          # Dependencies
├── vercel.json           # Vercel configuration
└── .env                  # Environment variables (NOT deployed)
```

### Configuration Files

#### ✅ `vercel.json`
- Configured to use `api/index.js` as the serverless function entry point
- Routes all requests to the serverless function
- Sets NODE_ENV to production

#### ✅ `api/index.js`
- Imports the Express app from `src/app.js`
- Implements MongoDB connection caching (Vercel best practice)
- Handles database connection before processing requests

#### ✅ `package.json`
- Type: "module" (ES6 imports)
- All dependencies properly listed

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Configure backend for Vercel deployment"
git push origin main
```

### 2. Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd TaskFlow-Backend
vercel

# For production deployment
vercel --prod
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Select the `TaskFlow-Backend` folder as the root directory
5. Vercel will auto-detect the configuration
6. Click "Deploy"

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

**Required:**
- `MONGODB_URI` - Your MongoDB connection string
  ```
  mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority
  ```

- `JWT_SECRET` - Your JWT secret key
  ```
  your-super-secret-jwt-key-here
  ```

**Optional:**
- `FRONTEND_URL` - Your frontend URL (for CORS)
  ```
  https://your-frontend.vercel.app
  ```

- `CLOUDINARY_CLOUD_NAME` - If using Cloudinary
- `CLOUDINARY_API_KEY` - If using Cloudinary
- `CLOUDINARY_API_SECRET` - If using Cloudinary

### 4. Redeploy After Adding Environment Variables
After adding environment variables, trigger a new deployment:
- Go to Deployments tab
- Click the three dots on the latest deployment
- Click "Redeploy"

## 🔍 Testing Your Deployment

Once deployed, test these endpoints:

```bash
# Health check
curl https://your-backend.vercel.app/

# API health
curl https://your-backend.vercel.app/api/health

# Test user registration (example)
curl -X POST https://your-backend.vercel.app/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"test123"}'
```

## 📊 Monitoring

### View Logs
1. Go to Vercel Dashboard → Your Project
2. Click on "Deployments"
3. Click on a deployment
4. Click "Functions" tab to see serverless function logs

### Common Issues

#### 500 Error - Function Invocation Failed
- **Cause**: Missing environment variables or import errors
- **Solution**: Check Vercel function logs, verify all env vars are set

#### Database Connection Timeout
- **Cause**: MongoDB URI incorrect or network issues
- **Solution**: Verify MONGODB_URI, check MongoDB Atlas network access

#### CORS Errors
- **Cause**: Frontend URL not whitelisted
- **Solution**: Update CORS origin in `src/app.js` or set FRONTEND_URL env var

## 🔧 Troubleshooting

### Check Function Logs
```bash
vercel logs your-deployment-url
```

### Test Locally with Vercel Dev
```bash
cd TaskFlow-Backend
vercel dev
```

This will run your serverless function locally with the same environment as Vercel.

## 📝 Important Notes

1. **Cold Starts**: First request after inactivity may be slow (serverless nature)
2. **Connection Caching**: MongoDB connection is cached globally to improve performance
3. **File Uploads**: If using file uploads, consider using Cloudinary or S3
4. **Execution Time**: Vercel free tier has 10-second execution limit per function
5. **Environment Variables**: Never commit `.env` file to Git

## ✨ Your Backend is Ready!

Your backend is now properly configured for Vercel deployment. Follow the steps above to deploy.

**Deployment URL Format:**
- `https://your-project-name.vercel.app`
- Or custom domain if configured

**API Base URL:**
- `https://your-project-name.vercel.app/api/v1`

Update your frontend's API configuration to use this URL!
