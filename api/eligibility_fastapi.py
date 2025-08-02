import os
from typing import Optional
from fastapi import FastAPI, HTTPException, Path
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.query import Query
from appwrite.exception import AppwriteException

# FastAPI app
app = FastAPI()

# Response model
class EligibilityResponse(BaseModel):
    player_id: str
    week: int
    eligible: bool
    reason: str

# Error response model
class ErrorResponse(BaseModel):
    error: str

# Environment variables
APPWRITE_ENDPOINT = os.environ.get('APPWRITE_ENDPOINT')
APPWRITE_PROJECT_ID = os.environ.get('APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.environ.get('APPWRITE_API_KEY')
DATABASE_ID = os.environ.get('APPWRITE_DATABASE_ID', 'default')

# Initialize Appwrite client globally for reuse
client = Client()
if APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY:
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)
else:
    databases = None

@app.get(
    "/api/eligibility/{player_id}/{week}",
    response_model=EligibilityResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Eligibility record not found"},
        400: {"model": ErrorResponse, "description": "Bad request"},
        500: {"model": ErrorResponse, "description": "Internal server error"}
    }
)
async def check_eligibility(
    player_id: str = Path(..., description="Player ID"),
    week: int = Path(..., gt=0, le=16, description="Week number (1-16)")
):
    """
    Check player eligibility for a specific week.
    
    Returns eligibility status and reason for the given player and week.
    """
    if not databases:
        raise HTTPException(
            status_code=500,
            detail="Appwrite configuration missing"
        )
    
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
        eligibility_doc = result['documents'][0]
        
        # Return structured response
        return EligibilityResponse(
            player_id=eligibility_doc.get('player_id', player_id),
            week=eligibility_doc.get('week', week),
            eligible=eligibility_doc.get('eligible', False),
            reason=eligibility_doc.get('reason', '')
        )
        
    except AppwriteException as e:
        if '404' in str(e):
            raise HTTPException(
                status_code=404,
                detail=f"No eligibility record found for player {player_id} in week {week}"
            )
        else:
            print(f"Appwrite error: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Database query failed"
            )
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )

# Health check endpoint
@app.get("/api/eligibility/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "eligibility-api"}

# For local testing
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)