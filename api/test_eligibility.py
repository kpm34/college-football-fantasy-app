import requests
import json

def test_eligibility_api():
    """Test the eligibility API locally"""
    
    # Test cases
    test_cases = [
        {
            "player_id": "123456",
            "week": 1,
            "description": "Valid player and week"
        },
        {
            "player_id": "999999",
            "week": 1,
            "description": "Non-existent player"
        },
        {
            "player_id": "123456",
            "week": 17,
            "description": "Invalid week (>16)"
        },
        {
            "player_id": "123456",
            "week": 0,
            "description": "Invalid week (0)"
        }
    ]
    
    base_url = "http://localhost:3000/api/eligibility"
    
    for test in test_cases:
        print(f"\nTest: {test['description']}")
        print(f"Request: GET {base_url}/{test['player_id']}/{test['week']}")
        
        try:
            response = requests.get(f"{base_url}/{test['player_id']}/{test['week']}")
            print(f"Status: {response.status_code}")
            print(f"Response: {json.dumps(response.json(), indent=2)}")
            
            # Check cache header
            cache_control = response.headers.get('Cache-Control')
            if cache_control:
                print(f"Cache-Control: {cache_control}")
                
        except Exception as e:
            print(f"Error: {e}")

def create_sample_data():
    """Create sample eligibility data in Appwrite"""
    print("""
Sample Appwrite document for 'player_game_eligibility' collection:

{
    "player_id": "123456",
    "week": 1,
    "eligible": true,
    "reason": "Opponent is AP #4"
}

{
    "player_id": "789012",
    "week": 1,
    "eligible": false,
    "reason": "Player is injured"
}

{
    "player_id": "345678",
    "week": 2,
    "eligible": true,
    "reason": "Opponent is AP #8"
}
""")

if __name__ == "__main__":
    print("=== Eligibility API Test ===")
    create_sample_data()
    
    print("\n=== Running API Tests ===")
    print("Make sure the API is running locally on port 3000")
    print("You can start it with: vercel dev")
    
    input("\nPress Enter to run tests...")
    test_eligibility_api()