import os
import json
import requests
from datetime import datetime, timedelta, timezone
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.exception import AppwriteException

def handler(request):
    """
    Vercel serverless function to refresh AP Top-25 rankings.
    Fetches from CFBD API and updates Appwrite rankings collection.
    """
    try:
        # Environment variables
        CFBD_API_KEY = os.environ.get('CFBD_API_KEY')
        APPWRITE_ENDPOINT = os.environ.get('APPWRITE_ENDPOINT')
        APPWRITE_PROJECT_ID = os.environ.get('APPWRITE_PROJECT_ID')
        APPWRITE_API_KEY = os.environ.get('APPWRITE_API_KEY')
        SEASON_YEAR = os.environ.get('SEASON_YEAR', str(datetime.now().year))
        DATABASE_ID = os.environ.get('APPWRITE_DATABASE_ID', 'default')
        
        # Validate environment variables
        if not all([CFBD_API_KEY, APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY]):
            return json.dumps({"error": "Missing required environment variables"}), 500
        
        # Fetch AP Top-25 rankings from CFBD
        headers = {
            'Authorization': f'Bearer {CFBD_API_KEY}',
            'Accept': 'application/json'
        }
        
        cfbd_url = f'https://api.collegefootballdata.com/rankings?year={SEASON_YEAR}&seasonType=regular'
        response = requests.get(cfbd_url, headers=headers)
        
        if response.status_code != 200:
            return json.dumps({"error": f"CFBD API error: {response.status_code}"}), 500
        
        rankings_data = response.json()
        
        # Find the latest week's AP poll
        ap_rankings = None
        latest_week = 0
        
        for week_data in rankings_data:
            week_num = week_data.get('week', 0)
            if week_num > latest_week:
                polls = week_data.get('polls', [])
                for poll in polls:
                    if poll.get('poll') == 'AP Top 25':
                        ap_rankings = poll.get('ranks', [])
                        latest_week = week_num
                        break
        
        if not ap_rankings:
            return json.dumps({"error": "No AP Top 25 rankings found"}), 404
        
        # Initialize Appwrite client
        client = Client()
        client.set_endpoint(APPWRITE_ENDPOINT)
        client.set_project(APPWRITE_PROJECT_ID)
        client.set_key(APPWRITE_API_KEY)
        
        databases = Databases(client)
        
        # Calculate expiry date (35 days from now)
        expiry_date = datetime.now(timezone.utc) + timedelta(days=35)
        expiry_timestamp = int(expiry_date.timestamp())
        
        updated_count = 0
        
        # Process top 25 teams
        for ranking in ap_rankings[:25]:
            team = ranking.get('school')
            rank = ranking.get('rank')
            
            if not team or not rank:
                continue
            
            # Use team name as document ID (sanitized)
            team_id = team.lower().replace(' ', '_').replace('-', '_')
            
            document_data = {
                'team_id': team_id,
                'team_name': team,
                'rank': rank,
                'week': latest_week,
                'season': int(SEASON_YEAR),
                'poll': 'AP Top 25',
                'points': ranking.get('points', 0),
                'first_place_votes': ranking.get('firstPlaceVotes', 0),
                'updated_at': datetime.now(timezone.utc).isoformat(),
                '$expire': expiry_timestamp  # Appwrite TTL attribute
            }
            
            try:
                # Try to update existing document
                databases.update_document(
                    database_id=DATABASE_ID,
                    collection_id='rankings',
                    document_id=team_id,
                    data=document_data
                )
                updated_count += 1
            except AppwriteException:
                # If document doesn't exist, create it
                try:
                    databases.create_document(
                        database_id=DATABASE_ID,
                        collection_id='rankings',
                        document_id=team_id,
                        data=document_data
                    )
                    updated_count += 1
                except AppwriteException as e:
                    print(f"Error updating/creating document for {team}: {str(e)}")
                    continue
        
        # Return success response
        return json.dumps({"updated": updated_count}), 200
        
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return json.dumps({"error": "Internal server error"}), 500