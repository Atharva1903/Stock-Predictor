# Stock Predictor Deployment Guide

This guide will help you deploy your Stock Predictor application to both Render (full-stack) and Vercel (frontend-only).

## ⚠️ Important: Render Free Tier Sleep Behavior

**Render's free tier services sleep after 15 minutes of inactivity!**

- **Sleep Time**: 15 minutes of no requests
- **Wake-up Time**: 10-30 seconds when someone visits
- **Impact**: Users experience delays on first visit

## Solutions for Render Sleep Issue

### Option 1: Upgrade to Paid Plan (Recommended)
- **$7/month** for "Always On" services
- No sleep, instant response
- Best for production applications

### Option 2: Free Wake-up Service (GitHub Actions)
Your repository includes a GitHub Actions workflow that automatically pings your services:

1. **Automatic**: Runs every 10 minutes
2. **Free**: Uses GitHub's free tier
3. **Reliable**: Keeps services awake

**To enable:**
- Push your code to GitHub
- Go to your repository → Actions tab
- The workflow will start automatically
- You can also manually trigger it

### Option 3: External Monitoring Services
- **UptimeRobot**: Free monitoring service
- **Cron-job.org**: Free cron job service
- **Pingdom**: Free uptime monitoring

## Option 1: Deploy to Render (Recommended - Full-Stack)

Render is perfect for full-stack applications as it can host both your Flask backend and serve your React frontend.

### Prerequisites
- GitHub account
- Render account (free at [render.com](https://render.com))

### Step 1: Prepare Your Repository

Your repository should now have these files:
- `render.yaml` - Render configuration
- `runtime.txt` - Python version specification
- `Procfile` - Process definition for Flask app
- `requirements.txt` - Python dependencies
- `package.json` - Node.js dependencies
- `.github/workflows/wake-up.yml` - Auto wake-up service

### Step 2: Deploy to Render

1. **Create a Render account**:
   - Go to [render.com](https://render.com)
   - Sign up with your GitHub account

2. **Deploy using Blueprint**:
   - In your Render dashboard, click "New +" → "Blueprint"
   - Connect your GitHub account if not already connected
   - Select your `Stock-Predictor` repository
   - Render will automatically detect the `render.yaml` file
   - Click "Apply" to deploy both services

3. **Wait for deployment**:
   - Backend service: `stock-predictor-backend`
   - Frontend service: `stock-predictor-frontend`
   - Both will be deployed automatically

4. **Update frontend API URL**:
   - Go to your frontend service settings
   - Update the `VITE_API_URL` environment variable to point to your backend URL
   - Example: `https://stock-predictor-backend.onrender.com`

### Step 3: Enable Wake-up Service

1. **Push to GitHub** (if not already done)
2. **Check GitHub Actions**:
   - Go to your repository → Actions tab
   - Verify the "Wake Up Render Services" workflow is running
   - It will ping your services every 10 minutes

### Step 4: Test Your Deployment

1. Visit your frontend URL (e.g., `https://stock-predictor-frontend.onrender.com`)
2. Test the stock prediction functionality
3. Verify that the API calls work correctly
4. Wait 15+ minutes and test again to ensure wake-up works

## Option 2: Deploy to Vercel (Frontend Only)

Vercel is excellent for frontend applications. You'll need to deploy your Flask backend separately.

### Prerequisites
- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Backend deployed somewhere (Render, Heroku, Railway, etc.)

### Step 1: Deploy Backend First

Deploy your Flask backend to Render using the steps above, or choose another platform:
- **Railway**: [railway.app](https://railway.app) (no sleep on free tier)
- **Heroku**: [heroku.com](https://heroku.com) (sleeps on free tier)
- **DigitalOcean App Platform**: [digitalocean.com](https://digitalocean.com)

### Step 2: Deploy Frontend to Vercel

1. **Create a Vercel account**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up with your GitHub account

2. **Import your project**:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it's a Vite project

3. **Configure environment variables**:
   - In the project settings, go to "Environment Variables"
   - Add `VITE_API_URL` with your backend URL
   - Example: `https://your-backend-url.com`

4. **Deploy**:
   - Click "Deploy"
   - Vercel will build and deploy your frontend

### Step 3: Test Your Deployment

1. Visit your Vercel URL
2. Test the stock prediction functionality
3. Verify API calls work with your backend

## Alternative Platforms (No Sleep)

If you want to avoid the sleep issue entirely, consider these alternatives:

### Railway
- **Free tier**: No sleep, 500 hours/month
- **Pros**: No sleep, easy deployment
- **Cons**: Limited hours on free tier

### Fly.io
- **Free tier**: 3 shared-cpu VMs, 3GB persistent volume
- **Pros**: No sleep, global deployment
- **Cons**: More complex setup

### DigitalOcean App Platform
- **Free tier**: 3 static sites, 1 container
- **Pros**: No sleep, reliable
- **Cons**: Limited on free tier

## Environment Variables

### For Render (Backend)
- `FLASK_ENV`: `production`
- `PYTHON_VERSION`: `3.11.0`

### For Render (Frontend)
- `VITE_API_URL`: Your backend URL (e.g., `https://stock-predictor-backend.onrender.com`)

### For Vercel (Frontend)
- `VITE_API_URL`: Your backend URL

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Make sure your Flask backend has CORS enabled (already done in `app.py`)
   - Verify the frontend is calling the correct backend URL

2. **Build Failures**:
   - Check that all dependencies are in `requirements.txt` and `package.json`
   - Verify Python and Node.js versions are compatible

3. **API Connection Issues**:
   - Ensure the `VITE_API_URL` environment variable is set correctly
   - Test your backend URL directly in a browser

4. **Memory Issues**:
   - TensorFlow can be memory-intensive
   - Consider using a paid Render plan for more resources

5. **Sleep Issues**:
   - Check GitHub Actions to ensure wake-up service is running
   - Consider upgrading to paid plan for production use

### Performance Optimization

1. **Backend**:
   - Add caching for API responses
   - Optimize the machine learning model
   - Consider using a CDN for static assets

2. **Frontend**:
   - Enable gzip compression
   - Optimize bundle size
   - Use lazy loading for components

## Monitoring and Maintenance

### Render
- Monitor your services in the Render dashboard
- Set up alerts for downtime
- Check logs for errors
- Monitor wake-up service in GitHub Actions

### Vercel
- Monitor deployments in the Vercel dashboard
- Set up analytics
- Configure custom domains if needed

## Cost Considerations

### Render (Free Tier)
- 750 hours/month for web services
- 100 hours/month for static sites
- Automatic sleep after 15 minutes of inactivity
- **Paid**: $7/month for always-on services

### Vercel (Free Tier)
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS
- No sleep issues

## Next Steps

1. **Custom Domain**: Set up a custom domain for your application
2. **SSL Certificate**: Ensure HTTPS is enabled (automatic on both platforms)
3. **Monitoring**: Set up monitoring and alerting
4. **Backup**: Implement database backups if you add a database
5. **CI/CD**: Set up automatic deployments on code changes
6. **Wake-up Service**: Ensure GitHub Actions is running for Render

## Support

- **Render**: [docs.render.com](https://docs.render.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **GitHub Actions**: [docs.github.com/en/actions](https://docs.github.com/en/actions)
- **GitHub Issues**: Create issues in your repository for project-specific problems 