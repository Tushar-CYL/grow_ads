# Deploying to Render (Free Tier)

Render offers a generous free tier for web services that's perfect for hosting your Google Ads Dashboard. Here's how to deploy:

## Prerequisites

1. A Render account (sign up at https://render.com/)
2. Your Google Ads Dashboard code in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Prepare Your Application

Make sure your application has:
- `requirements.txt` - Lists all Python dependencies
- `wsgi.py` - Entry point for the application

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click "New +" and select "Web Service"
3. Connect your Git repository (GitHub, GitLab, etc.)
4. Select the repository containing your Google Ads Dashboard

### 3. Configure Your Web Service

1. Give your service a name (this will determine your URL)
2. Select the branch you want to deploy
3. Set the following configuration:
   - Runtime: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn wsgi:app`
   - Select the Free plan

### 4. Set Environment Variables

Add the following environment variables in the "Environment" section:

```
FLASK_SECRET_KEY=your_secret_key_here
CLIENT_ID=your_google_oauth_client_id
CLIENT_SECRET=your_google_oauth_client_secret
FLASK_ENV=production
```

### 5. Configure Google OAuth

1. Go to the Google Cloud Console
2. Navigate to your project's OAuth consent screen
3. Add your Render domain to the authorized domains
4. Update your OAuth credentials to include your Render URL in the authorized redirect URIs
   - Format: `https://your-app-name.onrender.com/oauth2callback`

### 6. Deploy Your App

1. Click "Create Web Service" to deploy
2. Render will build and deploy your application
3. Once deployed, you'll receive a URL for your application (e.g., `https://your-app-name.onrender.com`)

### 7. Update Google Ads API Configuration

You'll need to securely handle your Google Ads API credentials. Options include:

1. **Environment Variables**: Convert your `google-ads.yaml` to use environment variables
2. **Secrets Management**: Use Render's environment variables feature

### 8. Testing Your Deployment

1. Visit your app URL
2. Verify that you can log in with Google OAuth
3. Test that you can fetch and display Google Ads data

## Free Tier Limitations

Render's free tier includes:
- 750 hours of runtime per month
- 512MB RAM
- Shared CPU
- Automatic sleep after 15 minutes of inactivity (spins up again when accessed)
- 100GB bandwidth per month

## Troubleshooting

- **Application Sleeping**: On the free tier, your app will sleep after 15 minutes of inactivity. The first request after sleeping may take a few seconds to respond.
- **OAuth Issues**: Make sure your redirect URIs are correctly configured in Google Cloud Console
- **Application Errors**: Check the logs in Render's dashboard

## Upgrading Later

If you need more resources later, Render offers paid plans starting at $7/month with more RAM, dedicated CPU, and no sleeping.
