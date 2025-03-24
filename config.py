# import os

# class Config:
#     # Use environment variables if available, otherwise use default values
#     SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'your-default-secret-key-for-development')
#     CLIENT_ID = os.environ.get('CLIENT_ID', '')
#     CLIENT_SECRET = os.environ.get('CLIENT_SECRET', '')
#     REDIRECT_URI = os.environ.get('REDIRECT_URI', 'http://localhost:5000/oauth2callback')
#     AUTH_URI = 'https://accounts.google.com/o/oauth2/auth'
#     TOKEN_URI = 'https://oauth2.googleapis.com/token'
#     AUTH_PROVIDER_X509_CERT_URL = 'https://www.googleapis.com/oauth2/v1/certs'
#     SCOPES = ['https://www.googleapis.com/auth/adwords']
#     DEBUG = os.environ.get('FLASK_ENV') != 'production'
#     HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', "hf_your_api_key_here")  # Replace with your actual Hugging Face API key


import os

class Config:
    # Flask configuration
    SECRET_KEY = os.environ.get('FLASK_SECRET_KEY', 'dev-key-for-local-testing-only')
    
    # Google OAuth configuration
    CLIENT_ID = os.environ.get('CLIENT_ID', '')
    CLIENT_SECRET = os.environ.get('CLIENT_SECRET', '')
    REDIRECT_URI = os.environ.get('REDIRECT_URI', 'http://localhost:5000/oauth2callback')
    
    # Google OAuth endpoints
    AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
    TOKEN_URI = "https://oauth2.googleapis.com/token"
    AUTH_PROVIDER_X509_CERT_URL = "https://www.googleapis.com/oauth2/v1/certs"
    
    # Google Ads API scope
    SCOPES = ['https://www.googleapis.com/auth/adwords']
    
    # Flask environment
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    DEBUG = FLASK_ENV == 'development'
    
    # Hugging Face API key
    HUGGINGFACE_API_KEY = os.environ.get('HUGGINGFACE_API_KEY', "hf_your_api_key_here")  # Replace with your actual Hugging Face API key

