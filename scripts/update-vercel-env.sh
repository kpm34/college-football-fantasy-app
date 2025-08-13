#!/bin/bash

echo "Updating Vercel environment variables..."

# Update critical environment variables
vercel env rm APPWRITE_API_KEY production --yes 2>/dev/null
vercel env add APPWRITE_API_KEY production <<< "standard_c63261941dc9ffcd31b7dbd5ba6706c0335d4543d78630ebe88a0e6899b770f334e22d032aa0e709c24ea84e8c907d314881a1408beb6f61db97d94e614333e004e353d078791d02f26581741c9ed454fc6d9bb2d2414dfed0d8b68c5b957f3fc2fad22ff87ceadad110c9bdb34a98ee1071c46952ab142d7580a83e3db8186b"

vercel env rm NEXT_PUBLIC_APPWRITE_DATABASE_ID production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_DATABASE_ID production <<< "college-football-fantasy"

vercel env rm NEXT_PUBLIC_APPWRITE_ENDPOINT production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_ENDPOINT production <<< "https://nyc.cloud.appwrite.io/v1"

vercel env rm NEXT_PUBLIC_APPWRITE_PROJECT_ID production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production <<< "college-football-fantasy-app"

echo "Environment variables updated. Redeploying..."
vercel --prod --yes