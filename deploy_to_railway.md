# Deploying to Railway (Free Tier)

Railway offers a developer-friendly platform with a free tier that's perfect for hosting your Google Ads Dashboard. Here's how to deploy:

## Prerequisites

1. A Railway account (sign up at https://railway.app/ using GitHub)
2. Your Google Ads Dashboard code in a Git repository (GitHub)

## Deployment Steps

### 1. Prepare Your Application

Make sure your application has:
- `requirements.txt` - Lists all Python dependencies
- `Procfile` - Tells Railway how to run your app

### 2. Create a New Project on Railway

1. Log in to your Railway account
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account if not already connected
5. Select the repository containing your Google Ads Dashboard

### 3. Configure Your Project

1. After selecting your repository, Railway will automatically detect that it's a Python application
2. Click on the "Variables" tab and add the following environment variables:

```
FLASK_SECRET_KEY=your_secret_key_here
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
FLASK_ENV=production
PORT=8080
```

### 4. Configure Deployment Settings

1. Go to the "Settings" tab
2. Under "Start Command", enter: `gunicorn wsgi:app`
3. Railway will automatically build and deploy your application

### 5. Generate a Domain

1. Go to the "Settings" tab
2. Scroll down to "Domains"
3. Click "Generate Domain"
4. You'll receive a URL for your application (e.g., `https://google-ads-dashboard-production.up.railway.app`)

### 6. Configure Google OAuth

1. Go to the Google Cloud Console
2. Navigate to your project's OAuth consent screen
3. Add your Railway domain to the authorized domains
4. Update your OAuth credentials to include your Railway URL in the authorized redirect URIs
   - Format: `https://your-app-name.up.railway.app/oauth2callback`

### 7. Update Google Ads API Configuration

You'll need to securely handle your Google Ads API credentials. Options include:

1. **Environment Variables**: Convert your `google-ads.yaml` to use environment variables
2. **Secrets Management**: Use Railway's environment variables feature

### 8. Testing Your Deployment

1. Visit your app URL
2. Verify that you can log in with Google OAuth
3. Test that you can fetch and display Google Ads data

## Free Tier Limitations

Railway's free tier includes:
- $5 of free credits per month
- 512MB RAM
- Shared CPU
- 1GB of storage
- No credit card required for the free tier

## Troubleshooting

- **Deployment Issues**: Check the deployment logs in Railway's dashboard
- **OAuth Issues**: Make sure your redirect URIs are correctly configured in Google Cloud Console
- **Application Errors**: Check the logs in Railway's dashboard

## Upgrading Later

If you need more resources later, Railway offers paid plans starting at $5/month with more resources.
