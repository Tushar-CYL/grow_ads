# Setting Up Google Ads API Credentials for Render

When deploying to Render, you'll need to convert your Google Ads API credentials from the `google-ads.yaml` file to environment variables. Here's how to do it:

## 1. Extract Your Current Credentials

From your `google-ads.yaml` file, you'll need the following information:
- `developer_token`
- `login_customer_id` (if you have one)
- `client_id`
- `client_secret`
- `refresh_token` (if you have one)

## 2. Create a JSON String for GOOGLE_ADS_CONFIG

Create a JSON string that contains all your Google Ads API credentials. Here's a template:

```json
{
  "developer_token": "YOUR_DEVELOPER_TOKEN",
  "login_customer_id": "YOUR_LOGIN_CUSTOMER_ID",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "refresh_token": "YOUR_REFRESH_TOKEN"
}
```

Replace the placeholder values with your actual credentials.

## 3. Set Up Environment Variables on Render

When deploying to Render, you'll need to add the following environment variables:

1. `GOOGLE_ADS_CONFIG`: The JSON string you created in step 2
2. `CLIENT_ID`: Your Google OAuth client ID
3. `CLIENT_SECRET`: Your Google OAuth client secret
4. `FLASK_SECRET_KEY`: A secure random string for Flask session encryption
5. `FLASK_ENV`: Set to `production`
6. `REDIRECT_URI`: Your Render app URL + `/oauth2callback` (e.g., `https://your-app-name.onrender.com/oauth2callback`)

## 4. Update Google OAuth Consent Screen

In the Google Cloud Console:
1. Go to the OAuth consent screen
2. Add your Render domain (`your-app-name.onrender.com`) to the authorized domains
3. Go to the Credentials section
4. Edit your OAuth 2.0 Client ID
5. Add your Render callback URL to the authorized redirect URIs: `https://your-app-name.onrender.com/oauth2callback`

## Security Note

Keep your credentials secure! Never commit them to your repository or share them publicly. Render's environment variables are encrypted and secure for storing sensitive information.
