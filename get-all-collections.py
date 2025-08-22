#!/usr/bin/env python3
import requests
import os
import sys

def get_all_collections():
    api_key = os.environ.get('APPWRITE_API_KEY')
    if not api_key:
        print("Error: APPWRITE_API_KEY not found in environment")
        sys.exit(1)
    
    headers = {
        'X-Appwrite-Project': 'college-football-fantasy-app',
        'X-Appwrite-Key': api_key,
        'Content-Type': 'application/json'
    }
    
    all_collections = []
    offset = 0
    limit = 25
    
    while True:
        url = f"https://nyc.cloud.appwrite.io/v1/databases/college-football-fantasy/collections?limit={limit}&offset={offset}"
        
        try:
            response = requests.get(url, headers=headers)
            response.raise_for_status()
            
            data = response.json()
            collections = data.get('collections', [])
            
            if not collections:
                break
                
            all_collections.extend(collections)
            offset += limit
            
            # If we got less than the limit, we're done
            if len(collections) < limit:
                break
                
        except Exception as e:
            print(f"Error fetching collections: {e}")
            sys.exit(1)
    
    print(f"Total collections found: {len(all_collections)}")
    print("\nCollection IDs:")
    
    collection_ids = [col['$id'] for col in all_collections]
    for col_id in sorted(collection_ids):
        print(f"  {col_id}")
    
    return collection_ids

if __name__ == "__main__":
    get_all_collections()