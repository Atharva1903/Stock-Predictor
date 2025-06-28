# Vercel Deployment Guide - Stock Predictor

## Step-by-Step Instructions

### 1. **Prepare Your Project**
Your project is now ready with the correct `vercel.json` configuration.

### 2. **Deploy to Vercel**

#### Option A: Using Vercel CLI (Recommended)
1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from your project directory**:
   ```bash
   vercel
   ```

4. **Follow the prompts**:
   - Set up and deploy: `Y`
   - Which scope: Select your account
   - Link to existing project: `N`
   - Project name: `stock-predictor` (or any name)
   - In which directory is your code located: `./` (current directory)
   - Want to override the settings: `N`

#### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - Framework Preset: `Vite`
   - Root Directory: `./` (leave blank)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3. **Set Environment Variable**
After deployment, set your backend URL:

1. Go to your Vercel project dashboard
2. Click **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://stock-predictor-backend.onrender.com` (your actual backend URL)
   - **Environment**: Production, Preview, Development (check all)
4. Click **Save**

### 4. **Redeploy**
After setting the environment variable:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment

### 5. **Test Your Deployment**
1. Visit your Vercel URL
2. Your React app should load
3. Test the "Train Model" functionality
4. Check that API calls work with your backend

## Troubleshooting

### If you get a blank screen:
1. Check browser console for errors
2. Verify environment variable is set correctly
3. Make sure backend is running on Render

### If API calls fail:
1. Check `VITE_API_URL` environment variable
2. Verify backend URL is correct
3. Test backend URL directly in browser

### If build fails:
1. Check Vercel build logs
2. Make sure all dependencies are in `package.json`
3. Verify `vercel.json` is in project root

## Your Project Structure Should Look Like:
```
/Stock-Predictor
├── package.json
├── vercel.json          ← Fixed configuration
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   └── ...
├── dist/                ← Created after build
└── ...
```

## Environment Variables Summary:
- **VITE_API_URL**: Your Render backend URL (set in Vercel dashboard)

## Success Indicators:
✅ Vercel deployment completes without errors
✅ Your React app loads at your Vercel URL
✅ "Train Model" button works and calls your backend
✅ No console errors in browser

Let me know if you need help with any of these steps! 