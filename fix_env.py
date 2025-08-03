#!/usr/bin/env python3
"""
Fix .env file by combining split API key lines
"""

import re
import os
from datetime import datetime

def fix_env_file():
    print("🔧 Fixing .env file...")
    
    # Read the current .env file
    with open('.env', 'r') as f:
        content = f.read()
    
    # Create backup
    backup_name = f'.env.backup.{datetime.now().strftime("%Y%m%d_%H%M%S")}'
    with open(backup_name, 'w') as f:
        f.write(content)
    print(f"📝 Backup created: {backup_name}")
    
    # Find and fix the APPWRITE_API_KEY
    # Look for the pattern: APPWRITE_API_KEY=... followed by a line starting with bf...
    pattern = r'(APPWRITE_API_KEY=standard_d489f8f9d5fa1880d3a38f3033ea0117f732238c57c2270f11ec720a0957d5ea09915bdb490cf631a3f9fda132007e2d8a7e793ae4fe971509da898a1281e53090f5e1)\s*\n(bf9489f7247487c5bc214f5e678123e0a791c52eb61253bfac2939235a10e969702fd756c372a2952b982460456bc5bf8a53639ed86346e95818428c73)'
    
    replacement = r'\1\2'
    
    # Replace the pattern
    fixed_content = re.sub(pattern, replacement, content)
    
    # Write the fixed content back
    with open('.env', 'w') as f:
        f.write(fixed_content)
    
    print("✅ .env file fixed!")
    
    # Verify the fix
    print("\n🔍 Verifying the fix...")
    with open('.env', 'r') as f:
        for line in f:
            if line.startswith('APPWRITE_API_KEY='):
                print(f"API Key: {line.strip()[:50]}...")
                if '\n' in line:
                    print("❌ Still has newlines")
                else:
                    print("✅ Fixed - no newlines")
                break

if __name__ == "__main__":
    fix_env_file() 