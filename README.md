# GrowLeads Ads Dashboard

A responsive 3D dashboard for visualizing Google Ads campaign data.

## Deployment Guide

### Option 1: PythonAnywhere

1. Create an account on [PythonAnywhere](https://www.pythonanywhere.com/)
2. Go to the Dashboard and click on "Web" tab
3. Click "Add a new web app"
4. Choose "Manual configuration" and select Python 3.9
5. Set the source code directory to your project path
6. Set the WSGI configuration file to point to your wsgi.py
7. In the "Files" tab, upload your project files
8. Create a virtual environment and install dependencies:
   ```
   mkvirtualenv --python=/usr/bin/python3.9 myenv
   pip install -r requirements.txt
   ```
9. Configure environment variables in the "Web" tab under "WSGI configuration file"
10. Update your OAuth redirect URIs in the Google Cloud Console to include your PythonAnywhere domain
11. Reload your web app

### Option 2: AWS Elastic Beanstalk

1. Install the AWS CLI and EB CLI
2. Initialize your EB application:
   ```
   eb init -p python-3.9 growleads-dashboard
   ```
3. Create an environment:
   ```
   eb create growleads-dashboard-env
   ```
4. Deploy your application:
   ```
   eb deploy
   ```
5. Configure environment variables:
   ```
   eb setenv CLIENT_ID=your_client_id CLIENT_SECRET=your_client_secret
   ```
6. Update your OAuth redirect URIs in the Google Cloud Console

### Option 3: Digital Ocean App Platform

1. Create a Digital Ocean account
2. Go to the App Platform and click "Create App"
3. Connect your GitHub repository or upload your files
4. Select Python as the runtime
5. Configure environment variables
6. Deploy your application
7. Update your OAuth redirect URIs in the Google Cloud Console

## Security Considerations

1. Store sensitive credentials as environment variables
2. Use HTTPS for all production deployments
3. Ensure your `google-ads.yaml` file is properly secured
4. Set up proper session management and timeout

## Customization

To customize the dashboard for your brand:

1. Update the logo and favicon in the static/img directory
2. Modify the color scheme in static/css/style.css
3. Adjust the dashboard layout in templates/dashboard.html
