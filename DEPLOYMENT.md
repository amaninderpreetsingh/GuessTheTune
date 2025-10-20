# GuessTheTune - Production Deployment Guide

This guide will walk you through deploying GuessTheTune to production using:
- **Backend**: Google Cloud Run (Node.js + Express + Socket.IO)
- **Frontend**: Cloudflare Pages (React)

This setup provides generous free tiers and is perfect for hobby projects!

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Google Cloud Run)](#backend-deployment-google-cloud-run)
3. [Frontend Deployment (Cloudflare Pages)](#frontend-deployment-cloudflare-pages)
4. [Update Spotify OAuth Settings](#update-spotify-oauth-settings)
5. [Testing Your Deployment](#testing-your-deployment)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have:

- [x] A Google Cloud account (new accounts get $200 in free credits)
- [x] [gcloud CLI](https://cloud.google.com/sdk/docs/install) installed
- [x] A GitHub account
- [x] A Cloudflare account (free)
- [x] Your Spotify API credentials (Client ID & Secret)
- [x] Your code pushed to a GitHub repository

---

## Backend Deployment (Google Cloud Run)

### Step 1: Set Up Google Cloud

1. **Create a new project** in [Google Cloud Console](https://console.cloud.google.com/)
   ```bash
   gcloud projects create guessthetune-app --name="GuessTheTune"
   gcloud config set project guessthetune-app
   ```

2. **Enable required APIs**
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **Authenticate gcloud CLI**
   ```bash
   gcloud auth login
   gcloud config set project guessthetune-app
   ```

### Step 2: Deploy Your Backend

1. **Navigate to the server directory**
   ```bash
   cd server
   ```

2. **Deploy to Cloud Run**
   ```bash
   gcloud run deploy guessthetune-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --timeout 3600 \
     --max-instances 10 \
     --memory 512Mi
   ```

   **Important flags explained:**
   - `--timeout 3600`: Sets 60-minute timeout (max for Cloud Run) to support long WebSocket connections
   - `--allow-unauthenticated`: Makes your API publicly accessible
   - `--max-instances 10`: Limits instances to control costs
   - `--memory 512Mi`: Allocates enough memory for Node.js + Socket.IO

3. **Save your backend URL**

   After deployment, you'll see output like:
   ```
   Service URL: https://guessthetune-backend-xxxxx-uc.a.run.app
   ```

   **Save this URL!** You'll need it for the frontend and Spotify settings.

### Step 3: Set Environment Variables

Set your environment variables in Cloud Run:

```bash
gcloud run services update guessthetune-backend \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production" \
  --set-env-vars="CLIENT_URL=https://your-app.pages.dev" \
  --set-env-vars="SPOTIFY_CLIENT_ID=your_spotify_client_id" \
  --set-env-vars="SPOTIFY_CLIENT_SECRET=your_spotify_client_secret" \
  --set-env-vars="SPOTIFY_REDIRECT_URI=https://guessthetune-backend-xxxxx-uc.a.run.app/auth/callback" \
  --set-env-vars="SESSION_SECRET=your_random_session_secret_here"
```

**Replace:**
- `your-app.pages.dev` → Your Cloudflare Pages URL (you'll get this in the next section)
- `your_spotify_client_id` → Your Spotify Client ID
- `your_spotify_client_secret` → Your Spotify Client Secret
- `guessthetune-backend-xxxxx-uc.a.run.app` → Your actual Cloud Run URL
- `your_random_session_secret_here` → A random string (generate with `openssl rand -base64 32`)

### Step 4: Verify Backend Deployment

Test your backend is running:
```bash
curl https://guessthetune-backend-xxxxx-uc.a.run.app/health
```

You should see:
```json
{"status":"ok","message":"GuessTheTune server is running"}
```

---

## Frontend Deployment (Cloudflare Pages)

### Step 1: Push Your Code to GitHub

If you haven't already, push your code to GitHub:
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Create Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **"Workers & Pages"** in the sidebar
3. Click **"Create application"** → **"Pages"** → **"Connect to Git"**
4. Select your GitHub repository: `GuessTheTune`
5. Configure build settings:
   - **Project name**: `guessthetune` (or your preferred name)
   - **Production branch**: `main`
   - **Framework preset**: `Create React App`
   - **Build command**: `npm run build`
   - **Build output directory**: `build`
   - **Root directory**: `client`

6. Click **"Save and Deploy"**

### Step 3: Set Environment Variables in Cloudflare Pages

1. In your Cloudflare Pages project, go to **Settings** → **Environment variables**
2. Add the following variable:
   - **Variable name**: `REACT_APP_SERVER_URL`
   - **Value**: `https://guessthetune-backend-xxxxx-uc.a.run.app` (your Cloud Run URL)
   - **Environment**: Production

3. Click **"Save"**

4. **Redeploy** your site:
   - Go to **Deployments**
   - Click **"Retry deployment"** on the latest deployment

### Step 4: Get Your Frontend URL

After deployment completes, you'll see your site URL:
```
https://guessthetune.pages.dev
```

**Save this URL!** You need to add it to your backend's `CLIENT_URL` environment variable.

### Step 5: Update Backend CLIENT_URL

Go back and update your backend's `CLIENT_URL`:

```bash
gcloud run services update guessthetune-backend \
  --region us-central1 \
  --update-env-vars="CLIENT_URL=https://guessthetune.pages.dev"
```

---

## Update Spotify OAuth Settings

1. Go to your [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Select your app
3. Click **"Edit Settings"**
4. Under **"Redirect URIs"**, add:
   ```
   https://guessthetune-backend-313254367359.us-central1.run.app/auth/callback
   ```
   (Replace with your actual Cloud Run URL)

5. Click **"Save"**

---

## Testing Your Deployment

1. **Open your frontend**: Visit `https://guessthetune.pages.dev`

2. **Test hosting a game**:
   - Click "Host a Game"
   - Login with Spotify (should redirect to your Cloud Run backend)
   - Select a playlist
   - Note the room code

3. **Test joining a game** (open in incognito/private window):
   - Click "Join a Game"
   - Enter a display name and the room code
   - Verify you can join the room

4. **Test gameplay**:
   - Start the game as host
   - Play a song
   - Buzz in as a player
   - Award points

---

## Troubleshooting

### CORS Errors

**Problem**: Frontend can't connect to backend, seeing CORS errors in console.

**Solution**:
1. Verify `CLIENT_URL` environment variable in Cloud Run matches your Cloudflare Pages URL exactly (including `https://`)
2. Check Cloud Run logs:
   ```bash
   gcloud run services logs read guessthetune-backend --region us-central1
   ```
3. Look for "CORS blocked origin" warnings

### WebSocket Connection Failures

**Problem**: "WebSocket connection failed" or disconnects after a few seconds.

**Solution**:
1. Verify timeout is set to 3600 seconds:
   ```bash
   gcloud run services describe guessthetune-backend --region us-central1 | grep timeout
   ```
2. If not, update it:
   ```bash
   gcloud run services update guessthetune-backend \
     --region us-central1 \
     --timeout 3600
   ```

### Spotify Authentication Fails

**Problem**: "Invalid redirect URI" error after Spotify login.

**Solution**:
1. Double-check your `SPOTIFY_REDIRECT_URI` environment variable in Cloud Run
2. Verify it's added to your Spotify app's Redirect URIs (with no trailing slash)
3. Make sure both use `https://` (not `http://`)

### Backend Not Startingx

**Problem**: Cloud Run service fails to deploy or keeps restarting.

**Solution**:
1. Check Cloud Run logs:
   ```bash
   gcloud run services logs read guessthetune-backend --region us-central1
   ```
2. Common issues:
   - Missing environment variables (especially Spotify credentials)
   - Port mismatch (Cloud Run sets `PORT` automatically, code should use `process.env.PORT`)
   - Dependencies not installing (check `package.json`)

### Frontend Build Fails

**Problem**: Cloudflare Pages build fails.

**Solution**:
1. Check build logs in Cloudflare Pages dashboard
2. Common issues:
   - Root directory not set to `client`
   - Missing `REACT_APP_SERVER_URL` environment variable
   - Node version incompatibility (set Node version in Pages settings if needed)

### Game Session Disconnects After 60 Minutes

**Note**: This is a Cloud Run limitation. WebSocket connections have a maximum timeout of 60 minutes. To handle this:
1. Implement reconnection logic in your client (Socket.IO has built-in reconnection)
2. Save game state periodically
3. For longer sessions, consider upgrading to Google Compute Engine or another platform

---

## Cost Estimates

### Google Cloud Run (Backend)
- **Free tier**: 2 million requests/month, 180k vCPU-seconds, 360k GiB-seconds
- **After free tier**: ~$8-15/month for moderate usage (few hours of gameplay per week)
- **Always-on cost**: ~$8/month if running 24/7

### Cloudflare Pages (Frontend)
- **Free tier**: UNLIMITED sites, UNLIMITED bandwidth
- **Cost**: $0/month (stays free forever)

**Total estimated cost**: $0-15/month depending on usage

---

## Custom Domain (Optional)

### For Cloudflare Pages:
1. Go to your Pages project → **Custom domains**
2. Click **"Set up a custom domain"**
3. Follow Cloudflare's instructions to add DNS records

### For Cloud Run:
1. Go to Cloud Run service → **Manage custom domains**
2. Follow Google's domain mapping instructions
3. Update all references to use your custom domain

---

## Updating Your Deployment

### Backend Updates:
```bash
cd server
gcloud run deploy guessthetune-backend \
  --source . \
  --region us-central1
```

### Frontend Updates:
Just push to GitHub - Cloudflare Pages auto-deploys:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

---

## Support & Resources

- **Google Cloud Run Docs**: https://cloud.google.com/run/docs
- **Cloudflare Pages Docs**: https://developers.cloudflare.com/pages/
- **Spotify API Docs**: https://developer.spotify.com/documentation/web-api
- **Socket.IO Docs**: https://socket.io/docs/

---

## Security Best Practices

1. **Never commit `.env` files** - They're gitignored by default
2. **Rotate secrets regularly** - Especially `SESSION_SECRET`
3. **Monitor usage** - Set up billing alerts in Google Cloud Console
4. **Use strong session secrets** - Generate with `openssl rand -base64 32`
5. **Review CORS settings** - Only allow your frontend domain in production

---

Congrats! Your GuessTheTune game is now live and ready for your friends to play! 🎵🎉

---

## Managing Costs: Stopping and Starting Your Backend

### Understanding Cloud Run's "Scale to Zero"
The most important feature of Google Cloud Run for cost management is its ability to **scale to zero**.

- **You Pay Only for Usage**: You are not billed for a 24/7 running server. You are billed only for the CPU and memory consumed while your service is actively processing requests.
- **Automatic Shutdown**: If your service receives no traffic for a few minutes, Cloud Run automatically scales its container count to zero. At this point, it is not consuming resources and you are not being charged.
- **Automatic Restart**: When a new request comes in, Cloud Run automatically starts a new container to handle it.

For a hobby project, it's very likely you will remain within the generous free tier just by letting the service scale to zero when you're not playing.

### How to Manually "Stop" Your Backend
If you want to guarantee the service is offline and cannot be started by incoming traffic, you can make it private by removing its public access permissions.

**To make the service private (stop it):**
```bash
gcloud run services remove-iam-policy-binding guessthetune-backend \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/run.invoker
```

### How to Manually "Start" Your Backend
To bring the service back online, you simply restore the public access permissions. The next request will then start the container automatically.

**To make the service public again (start it):**
```bash
gcloud run services add-iam-policy-binding guessthetune-backend \
  --region=us-central1 \
  --member=allUsers \
  --role=roles/run.invoker
```
