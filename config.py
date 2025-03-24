class Config:
    SECRET_KEY = 'your-secret-key-here'  # Change this to a random string
    DEBUG = True
    REDIRECT_URI = "http://localhost:5000/oauth2callback"
    HUGGINGFACE_API_KEY = "hf_your_api_key_here"  # Replace with your actual Hugging Face API key
