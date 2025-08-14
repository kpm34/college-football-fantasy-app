#!/bin/bash

echo "Updating Vercel environment variables..."

# Update critical environment variables
vercel env rm APPWRITE_API_KEY production --yes 2>/dev/null
vercel env add APPWRITE_API_KEY production <<< "standard_aab226bb45e4cb9ee0349c9ff0fda2df9124a993f75c1182c78900929f96e1d48756d968594825a571ce273d2adad954aad78d2c152c4f39eb4a53785fc51bbabeccd4734ae28d5cb227d5bc2d77fa20c6522812042924c44296eca173526891c9ad19c66ad34a29035dcbca611d6703189cf95a7575cc085afe363466478891"

vercel env rm NEXT_PUBLIC_APPWRITE_DATABASE_ID production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_DATABASE_ID production <<< "college-football-fantasy"

vercel env rm NEXT_PUBLIC_APPWRITE_ENDPOINT production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_ENDPOINT production <<< "https://nyc.cloud.appwrite.io/v1"

vercel env rm NEXT_PUBLIC_APPWRITE_PROJECT_ID production --yes 2>/dev/null
vercel env add NEXT_PUBLIC_APPWRITE_PROJECT_ID production <<< "college-football-fantasy-app"

echo "Environment variables updated. Redeploying..."
vercel --prod --yes