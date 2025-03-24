# Deploying to Digital Ocean App Platform

Digital Ocean App Platform provides a simple way to deploy your Flask application without managing servers. Here's a step-by-step guide:

## Prerequisites

1. A Digital Ocean account (you can sign up at https://www.digitalocean.com/)
2. Your Google Ads Dashboard code in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Prepare Your Application

Make sure your application has the following files:
- `requirements.txt` - Lists all Python dependencies
- `wsgi.py` - Entry point for the application
- `Procfile` - Tells Digital Ocean how to run your app (already created)

### 2. Create a New App on Digital Ocean

1. Log in to your Digital Ocean account
2. Navigate to the App Platform section
3. Click "Create App"
4. Choose your Git provider (GitHub, GitLab, etc.) and connect your repository
5. Select the repository containing your Google Ads Dashboard

### 3. Configure Your App

1. Select the branch you want to deploy
2. Digital Ocean will automatically detect that it's a Python application
3. Set the following configuration:
   - Environment: Python
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `gunicorn wsgi:app`
   - HTTP Port: `8080`

### 4. Set Environment Variables

Add the following environment variables in the App settings:

```
FLASK_SECRET_KEY=your_secret_key_here
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
FLASK_ENV=production
```

### 5. Configure Google OAuth

1. Go to the Google Cloud Console
2. Navigate to your project's OAuth consent screen
3. Add your Digital Ocean app URL to the authorized domains
4. Update your OAuth credentials to include your Digital Ocean app URL in the authorized redirect URIs
   - Format: `https://your-app-name.ondigitalocean.app/oauth2callback`

### 6. Deploy Your App

1. Click "Launch App" to deploy
2. Digital Ocean will build and deploy your application
3. Once deployed, you'll receive a URL for your application (e.g., `https://your-app-name.ondigitalocean.app`)

### 7. Update Google Ads API Configuration

You'll need to securely handle your Google Ads API credentials. Options include:

1. **Environment Variables**: Convert your `google-ads.yaml` to use environment variables
2. **Secrets Management**: Use Digital Ocean's App Platform secrets feature

### 8. Testing Your Deployment

1. Visit your app URL
2. Verify that you can log in with Google OAuth
3. Test that you can fetch and display Google Ads data

## Troubleshooting

- **OAuth Issues**: Make sure your redirect URIs are correctly configured in Google Cloud Console
- **Application Errors**: Check the logs in Digital Ocean App Platform
- **API Connectivity**: Ensure your Google Ads API credentials are correctly configured

## Cost Considerations

Digital Ocean App Platform has a free tier for static sites, but for Python applications:
- Basic Plan: $5/month (512MB RAM, 1 vCPU)
- Professional Plan: $12/month (1GB RAM, 1 vCPU)

Choose a plan based on your expected traffic and resource needs.
