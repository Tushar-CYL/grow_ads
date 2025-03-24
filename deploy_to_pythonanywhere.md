# Deploying to PythonAnywhere

PythonAnywhere is an excellent platform for hosting Python web applications with minimal configuration. Here's a step-by-step guide to deploy your Google Ads Dashboard:

## Prerequisites

1. A PythonAnywhere account (you can sign up for a free account at https://www.pythonanywhere.com/)
2. Your Google Ads Dashboard code ready to deploy

## Deployment Steps

### 1. Create a PythonAnywhere Account

1. Go to https://www.pythonanywhere.com/ and sign up for an account
2. Choose the appropriate plan based on your needs (free tier is available for testing)

### 2. Upload Your Code

#### Option A: Using Git

1. Log in to PythonAnywhere and open a Bash console
2. Clone your repository:
   ```
   git clone https://github.com/yourusername/google-ads-3d-dashboard.git
   ```

#### Option B: Manual Upload

1. Compress your project folder into a ZIP file
2. Log in to PythonAnywhere and navigate to the Files tab
3. Upload the ZIP file
4. Open a Bash console and unzip the file:
   ```
   unzip google-ads-3d-dashboard.zip
   ```

### 3. Set Up a Virtual Environment

1. Open a Bash console on PythonAnywhere
2. Create a virtual environment:
   ```
   mkvirtualenv --python=python3.9 ads-dashboard-env
   ```
3. Navigate to your project directory:
   ```
   cd google-ads-3d-dashboard
   ```
4. Install the required packages:
   ```
   pip install -r requirements.txt
   ```

### 4. Configure Web App

1. Go to the Web tab on PythonAnywhere
2. Click "Add a new web app"
3. Choose your domain name (it will be yourusername.pythonanywhere.com)
4. Select "Manual configuration"
5. Choose Python 3.9

### 5. Configure WSGI File

1. In the Web tab, look for the WSGI configuration file link and click it
2. Replace the contents with the following (adjust paths as needed):

```python
import sys
path = '/home/yourusername/google-ads-3d-dashboard'
if path not in sys.path:
    sys.path.append(path)

from app import app as application

# For Google OAuth to work properly
import os
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
```

### 6. Configure Virtual Environment

1. In the Web tab, under "Virtualenv", enter:
   ```
   /home/yourusername/.virtualenvs/ads-dashboard-env
   ```

### 7. Set Environment Variables

1. In the Web tab, under "Environment variables", add:
   - FLASK_SECRET_KEY: your_secret_key_here
   - CLIENT_ID: your_google_oauth_client_id
   - CLIENT_SECRET: your_google_oauth_client_secret
   - FLASK_ENV: production

### 8. Configure Static Files

1. In the Web tab, under "Static files", add:
   - URL: /static/
   - Directory: /home/yourusername/google-ads-3d-dashboard/static/

### 9. Update Google OAuth Configuration

1. Go to the Google Cloud Console
2. Navigate to your project's OAuth consent screen
3. Add your PythonAnywhere domain to the authorized domains
4. Update your OAuth credentials to include your PythonAnywhere URL in the authorized redirect URIs
   - Format: `https://yourusername.pythonanywhere.com/oauth2callback`

### 10. Secure Google Ads API Credentials

You'll need to handle your Google Ads API credentials securely. Options include:

1. **Update the google-ads.yaml file** with your credentials
2. **Create environment variables** and modify your app to use them instead of the YAML file

### 11. Reload Your Web App

1. Go back to the Web tab
2. Click the "Reload" button for your web app

### 12. Test Your Deployment

1. Visit your PythonAnywhere URL (yourusername.pythonanywhere.com)
2. Verify that you can log in with Google OAuth
3. Test that you can fetch and display Google Ads data

## Troubleshooting

- **Application Error**: Check the error logs in the Web tab
- **OAuth Issues**: Verify your redirect URIs in Google Cloud Console
- **Import Errors**: Ensure all dependencies are installed in your virtual environment
- **Permission Errors**: Check file permissions for your project files

## Upgrading Your Application

To update your application after making changes:

1. Upload the new code (via Git pull or manual upload)
2. Go to the Web tab and click "Reload"

## Cost Considerations

PythonAnywhere offers several plans:
- Free: Good for testing, but with limited CPU time and bandwidth
- Paid plans: Starting at $5/month with more resources and custom domains

Choose a plan based on your expected traffic and resource needs.
