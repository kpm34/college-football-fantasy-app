import os
from fastapi import FastAPI, HTTPException, Path
from fastapi.responses import JSONResponse
from mangum import Mangum
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# Create FastAPI app
app = FastAPI()

# Environment variables
APPWRITE_ENDPOINT = os.environ.get('APPWRITE_ENDPOINT')
APPWRITE_PROJECT_ID = os.environ.get('APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.environ.get('APPWRITE_API_KEY')
DATABASE_ID = os.environ.get('APPWRITE_DATABASE_ID', 'default')

# Initialize Appwrite client globally for connection reuse
client = None
databases = None

if APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY:
    client = Client()
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)

@app.get("/api/eligibility/{player_id}/{week}")
async def check_eligibility(
    player_id: str = Path(..., description="Player ID"),
    week: int = Path(..., gt=0, le=16, description="Week number (1-16)")
):
    """
    Check player eligibility for a specific week.
    Returns eligibility status and reason.
    """
    if not databases:
        raise HTTPException(status_code=500, detail="Appwrite configuration missing")
    
    try:
        # Query Appwrite for eligibility record
        result = databases.list_documents(
            database_id=DATABASE_ID,
            collection_id='player_game_eligibility',
            queries=[
                Query.equal('player_id', player_id),
                Query.equal('week', week)
            ]
        )
        
        if result['total'] == 0:
            raise HTTPException(
                status_code=404,
                detail=f"No eligibility record found for player {player_id} in week {week}"
            )
        
        # Get the first document
        doc = result['documents'][0]
        
        # Return structured response with cache header
        return JSONResponse(
            content={
                "player_id": doc.get('player_id', player_id),
                "week": doc.get('week', week),
                "eligible": doc.get('eligible', False),
                "reason": doc.get('reason', '')
            },
            headers={
                "Cache-Control": "public, max-age=60"  # Cache for 1 minute
            }
        )
        
    except HTTPException:
        raise
    except AppwriteException as e:
        if '404' in str(e):
            raise HTTPException(
                status_code=404,
                detail=f"No eligibility record found for player {player_id} in week {week}"
            )
        raise HTTPException(status_code=500, detail="Database query failed")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Create the Vercel handler using Mangum
handler = Mangum(app, lifespan="off")