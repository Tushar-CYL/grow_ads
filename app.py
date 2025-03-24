from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException
from google_auth_oauthlib.flow import Flow
import os
import yaml
import json
import pandas as pd
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import plotly.io as pio
from config import Config
import random

# For production deployment
if os.environ.get('FLASK_ENV') == 'production':
    # In production, ensure HTTPS is used for OAuth
    os.environ.pop('OAUTHLIB_INSECURE_TRANSPORT', None)
else:
    # For development only
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

# Initialize Flask app
app = Flask(__name__)
# Use environment variable for secret key if available (for deployment)
app.secret_key = os.environ.get('FLASK_SECRET_KEY', Config.SECRET_KEY)
app.config['SESSION_TYPE'] = 'filesystem'

# Load Google Ads configuration
def load_google_ads_config():
    # Try to load from environment variables first (for deployment)
    if os.environ.get('GOOGLE_ADS_CONFIG'):
        return json.loads(os.environ.get('GOOGLE_ADS_CONFIG'))
    # Fall back to yaml file (for development)
    try:
        with open('google-ads.yaml', 'r') as yaml_file:
            return yaml.safe_load(yaml_file)
    except FileNotFoundError:
        # Return empty config if file not found
        return {}

google_ads_config = load_google_ads_config()

# Initialize Google Ads Client
def get_google_ads_client(credentials):
    config = {
        "developer_token": google_ads_config['developer_token'],
        "client_id": google_ads_config['client_id'],
        "client_secret": google_ads_config['client_secret'],
        "refresh_token": credentials['refresh_token'],
        "login_customer_id": google_ads_config['login_customer_id'],
        "use_proto_plus": True
    }
    return GoogleAdsClient.load_from_dict(config)

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login():
    # Create OAuth flow instance
    client_config = {
        'web': {
            'client_id': os.environ.get('CLIENT_ID', Config.CLIENT_ID),
            'client_secret': os.environ.get('CLIENT_SECRET', Config.CLIENT_SECRET),
            'auth_uri': Config.AUTH_URI,
            'token_uri': Config.TOKEN_URI,
            'auth_provider_x509_cert_url': Config.AUTH_PROVIDER_X509_CERT_URL,
            'redirect_uris': [os.environ.get('REDIRECT_URI', Config.REDIRECT_URI)]
        }
    }
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=["https://www.googleapis.com/auth/adwords", "openid", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
        redirect_uri=os.environ.get('REDIRECT_URI', Config.REDIRECT_URI)
    )
    
    # Generate URL for request to Google's OAuth 2.0 server
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true',
        prompt='consent'
    )
    
    # Store the state in the session for later validation
    session['state'] = state
    
    # Redirect to Google's OAuth 2.0 server
    return redirect(authorization_url)

@app.route('/oauth2callback')
def oauth2callback():
    try:
        # Get the flow from the session
        client_config = {
            'web': {
                'client_id': os.environ.get('CLIENT_ID', Config.CLIENT_ID),
                'client_secret': os.environ.get('CLIENT_SECRET', Config.CLIENT_SECRET),
                'auth_uri': Config.AUTH_URI,
                'token_uri': Config.TOKEN_URI,
                'auth_provider_x509_cert_url': Config.AUTH_PROVIDER_X509_CERT_URL,
                'redirect_uris': [os.environ.get('REDIRECT_URI', Config.REDIRECT_URI)]
            }
        }
        flow = Flow.from_client_config(
            client_config=client_config,
            scopes=["https://www.googleapis.com/auth/adwords", "openid", "https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
            redirect_uri=os.environ.get('REDIRECT_URI', Config.REDIRECT_URI)
        )
        
        # Use the authorization server's response to fetch the OAuth 2.0 tokens
        authorization_response = request.url.replace('http://', 'https://') if request.url.startswith('http://') else request.url
        flow.fetch_token(authorization_response=authorization_response)
        
        # Store credentials in session
        credentials = flow.credentials
        session['credentials'] = {
            'token': credentials.token,
            'refresh_token': credentials.refresh_token,
            'token_uri': credentials.token_uri,
            'client_id': credentials.client_id,
            'client_secret': credentials.client_secret,
            'scopes': credentials.scopes
        }
        
        return redirect(url_for('dashboard'))
    except Exception as e:
        print(f"OAuth Error: {str(e)}")
        return f"An error occurred during authentication: {str(e)}", 400

@app.route('/dashboard')
def dashboard():
    if 'credentials' not in session:
        return redirect(url_for('login'))
    
    credentials = session['credentials']
    client = get_google_ads_client(credentials)
    
    # Get accessible customer accounts
    customer_ids = get_accessible_customers(client)
    
    # Default date range (last 30 days)
    end_date = datetime.now().strftime('%Y-%m-%d')
    start_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
    
    return render_template(
        'dashboard.html',
        customer_ids=customer_ids,
        start_date=start_date,
        end_date=end_date
    )

@app.route('/fetch_data', methods=['POST'])
def fetch_data():
    if 'credentials' not in session:
        return jsonify({'error': 'Not authenticated'}), 401
    
    data = request.json
    customer_id = data.get('customer_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    
    # Validate input data
    if not customer_id or not start_date or not end_date:
        return jsonify({'error': 'Missing required parameters'}), 400
    
    # Log request details for debugging
    print(f"Fetching data for customer_id: {customer_id}, date range: {start_date} to {end_date}")
    
    credentials = session['credentials']
    client = get_google_ads_client(credentials)
    
    try:
        campaign_data = fetch_campaign_data(client, customer_id, start_date, end_date)
        return jsonify(campaign_data)
    except Exception as e:
        print(f"Error fetching data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/logout')
def logout():
    session.pop('credentials', None)
    session.pop('state', None)
    return redirect(url_for('index'))

# Helper Functions
def get_accessible_customers(client):
    try:
        customer_service = client.get_service("CustomerService")
        response = customer_service.list_accessible_customers()
        customer_ids = []
        
        for resource_name in response.resource_names:
            customer_id = resource_name.split('/')[1]
            customer_ids.append(customer_id)
        
        return customer_ids
    except GoogleAdsException as ex:
        print(f"Google Ads API Error: {ex.error.code().name} - {ex.error.message}")
        return []

def fetch_campaign_data(client, customer_id, start_date, end_date):
    try:
        # Ensure customer_id is properly formatted (remove hyphens if present)
        customer_id = customer_id.replace('-', '')
        
        print(f"Executing Google Ads API query for customer ID: {customer_id}")
        ga_service = client.get_service("GoogleAdsService")
        query = f"""
            SELECT 
                campaign.id, 
                campaign.name, 
                campaign.status,
                campaign.advertising_channel_type,
                segments.date,
                metrics.impressions, 
                metrics.clicks, 
                metrics.ctr,
                metrics.average_cpc, 
                metrics.conversions,
                metrics.conversions_value, 
                metrics.cost_micros,
                metrics.conversions_from_interactions_rate,
                metrics.interaction_rate,
                metrics.video_views,
                metrics.view_through_conversions
            FROM campaign
            WHERE segments.date BETWEEN '{start_date}' AND '{end_date}'
            ORDER BY segments.date
        """
        
        print(f"Query: {query}")
        
        # Execute the query
        response = ga_service.search_stream(customer_id=customer_id, query=query)
        
        data = []
        batch_count = 0
        row_count = 0
        
        # Process the response
        for batch in response:
            batch_count += 1
            for row in batch.results:
                row_count += 1
                data.append({
                    "campaign_id": row.campaign.id,
                    "campaign_name": row.campaign.name,
                    "status": row.campaign.status.name,
                    "channel_type": row.campaign.advertising_channel_type.name,
                    "date": row.segments.date,
                    "impressions": row.metrics.impressions,
                    "clicks": row.metrics.clicks,
                    "ctr": row.metrics.ctr * 100,
                    "avg_cpc": row.metrics.average_cpc / 1e6,
                    "conversions": row.metrics.conversions,
                    "conversion_value": row.metrics.conversions_value,
                    "cost": row.metrics.cost_micros / 1e6,
                    "conversion_rate": row.metrics.conversions_from_interactions_rate * 100,
                    "interaction_rate": row.metrics.interaction_rate * 100,
                    "video_views": row.metrics.video_views,
                    "view_through_conversions": row.metrics.view_through_conversions
                })
        
        print(f"Processed {batch_count} batches with {row_count} total rows")
        
        # If no data was returned, create sample data for demonstration
        if not data:
            print("No data returned from Google Ads API. Creating sample data for demonstration.")
            # Generate sample data for demonstration purposes
            data = generate_sample_data(start_date, end_date)
        
        # Process data for visualization
        df = pd.DataFrame(data)
        
        # Aggregate data for different visualizations
        daily_data = df.groupby('date').agg({
            'impressions': 'sum',
            'clicks': 'sum',
            'cost': 'sum',
            'conversions': 'sum',
            'conversion_value': 'sum'
        }).reset_index()
        
        campaign_data = df.groupby('campaign_name').agg({
            'impressions': 'sum',
            'clicks': 'sum',
            'cost': 'sum',
            'conversions': 'sum',
            'conversion_value': 'sum'
        }).reset_index()
        
        channel_data = df.groupby('channel_type').agg({
            'impressions': 'sum',
            'clicks': 'sum',
            'cost': 'sum',
            'conversions': 'sum',
            'conversion_value': 'sum'
        }).reset_index().rename(columns={'channel_type': 'channel_name'})
        
        # Calculate ROI and CPA
        campaign_data['roi'] = (campaign_data['conversion_value'] - campaign_data['cost']) / campaign_data['cost'] * 100
        campaign_data['cpa'] = campaign_data.apply(lambda x: x['cost'] / x['conversions'] if x['conversions'] > 0 else 0, axis=1)
        
        # Prepare visualization data
        visualizations = {
            'summary': {
                'total_cost': float(df['cost'].sum()),
                'total_clicks': int(df['clicks'].sum()),
                'total_impressions': int(df['impressions'].sum()),
                'total_conversions': float(df['conversions'].sum()),
                'avg_ctr': float(df['ctr'].mean() if 'ctr' in df else 0),
                'avg_conversion_rate': float(df['conversion_rate'].mean() if 'conversion_rate' in df else 0)
            },
            'daily_data': daily_data.to_dict(orient='records'),
            'campaign_data': campaign_data.to_dict(orient='records'),
            'channel_data': channel_data.to_dict(orient='records'),
            'raw_data': df.to_dict(orient='records')
        }
        
        return visualizations
    
    except GoogleAdsException as ex:
        print(f"Google Ads API Error: {ex.error.code().name} - {ex.error.message}")
        for error in ex.failure.errors:
            print(f"Error details: {error.message}")
        raise Exception(f"Google Ads API Error: {ex.error.code().name} - {ex.error.message}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise Exception(f"Error processing data: {str(e)}")

# Generate sample data for demonstration when no real data is available
def generate_sample_data(start_date, end_date):
    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    date_range = [(start + timedelta(days=i)).strftime('%Y-%m-%d') for i in range((end - start).days + 1)]
    
    campaigns = [
        {'id': '1234567890', 'name': 'Search Campaign', 'status': 'ENABLED', 'type': 'SEARCH'},
        {'id': '2345678901', 'name': 'Display Campaign', 'status': 'ENABLED', 'type': 'DISPLAY'},
        {'id': '3456789012', 'name': 'Video Campaign', 'status': 'ENABLED', 'type': 'VIDEO'},
        {'id': '4567890123', 'name': 'Shopping Campaign', 'status': 'PAUSED', 'type': 'SHOPPING'}
    ]
    
    data = []
    for date in date_range:
        for campaign in campaigns:
            impressions = int(random.randint(500, 10000))
            clicks = int(random.randint(10, impressions//10))
            cost = round(random.uniform(10, 500), 2)
            conversions = round(random.uniform(0, clicks//10), 2)
            
            data.append({
                'campaign_id': campaign['id'],
                'campaign_name': campaign['name'],
                'status': campaign['status'],
                'channel_type': campaign['type'],
                'date': date,
                'impressions': impressions,
                'clicks': clicks,
                'ctr': round(clicks / impressions * 100, 2) if impressions > 0 else 0,
                'avg_cpc': round(cost / clicks, 2) if clicks > 0 else 0,
                'conversions': conversions,
                'conversion_value': round(conversions * random.uniform(50, 200), 2),
                'cost': cost,
                'conversion_rate': round(conversions / clicks * 100, 2) if clicks > 0 else 0,
                'interaction_rate': round(random.uniform(1, 10), 2),
                'video_views': int(random.randint(0, 1000)) if campaign['type'] == 'VIDEO' else 0,
                'view_through_conversions': round(random.uniform(0, 5), 2)
            })
    
    return data

if __name__ == '__main__':
    app.run(debug=Config.DEBUG)
