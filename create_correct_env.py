#!/usr/bin/env python3
"""
Create a correct .env file with the API key on a single line
"""

def create_correct_env():
    print("🔧 Creating correct .env file...")
    
    # The correct API key (single line)
    api_key = "standard_d489f8f9d5fa1880d3a38f3033ea0117f732238c57c2270f11ec720a0957d5ea09915bdb490cf631a3f9fda132007e2d8a7e793ae4fe971509da898a1281e53090f5e1bf9489f7247487c5bc214f5e678123e0a791c52eb61253bfac2939235a10e969702fd756c372a2952b982460456bc5bf8a53639ed86346e95818428c73"
    
    # Create the correct .env content
    env_content = f"""# API Keys - You need to get these from the respective services
CFBD_API_KEY=YKG446gILGiO5q+OIgOClYsBO9ztbPfGyBBrz40V1c3LBshdTIbFjHzFcu6iOhGz
CFBD_API_KEY_BACKUP=rEyNJxUagogtNdrndiKGMNjV03gRaVWr+hcTYDKbFXhzVR3V8WoCeUxo+h6S8okK
ODDS_API_KEY=your_key_here  # Get from OddsAPI.io for Vegas odds
ROTOWIRE_API_KEY=your_key_here  # Get from Rotowire for injury data (optional)

# Appwrite Configuration
APPWRITE_ENDPOINT=https://nyc.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=688ccd49002eacc6c020
APPWRITE_API_KEY={api_key}

# Database configuration
DATABASE_ID=college-football-fantasy
"""
    
    # Create backup of current .env
    import os
    if os.path.exists('.env'):
        import shutil
        shutil.copy('.env', '.env.backup.before_fix')
        print("📝 Backup created: .env.backup.before_fix")
    
    # Write the correct .env file
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Correct .env file created!")
    
    # Verify
    print("\n🔍 Verifying the fix...")
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('APPWRITE_API_KEY='):
                print(f"API Key length: {len(line.strip())} characters")
                if '\n' in line:
                    print("❌ Still has newlines")
                else:
                    print("✅ Fixed - no newlines")
                break

if __name__ == "__main__":
    create_correct_env() 