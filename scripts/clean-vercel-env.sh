#!/bin/bash

# Remove duplicate env keys on Vercel and re-add unique values from local env
# Requires Vercel CLI and VERCEL_TOKEN exported (use scripts/source-env.sh first)

set -euo pipefail

# Keys to ensure exist (unique, non-duplicated)
KEYS=(
  NEXT_PUBLIC_APPWRITE_ENDPOINT
  NEXT_PUBLIC_APPWRITE_PROJECT_ID
  NEXT_PUBLIC_APPWRITE_DATABASE_ID
  CFBD_API_KEY
  ROTOWIRE_API_KEY
)

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "VERCEL_TOKEN not set. Run: source scripts/source-env.sh" >&2
  exit 1
fi

# Pull current env list (info only)
echo "Fetching Vercel env vars..." >&2
vercel env ls --token "$VERCEL_TOKEN" | cat

echo "Cleaning and re-applying keys..." >&2
for key in "${KEYS[@]}"; do
  # Remove existing occurrences across all environments to avoid duplicates
  for env in development preview production; do
    vercel env rm "$key" "$env" --yes --token "$VERCEL_TOKEN" 2>/dev/null || true
  done
  # Re-add if present locally
  val="${!key-}"
  if [ -n "$val" ]; then
    vercel env add "$key" production --token "$VERCEL_TOKEN" <<< "$val"
    vercel env add "$key" preview --token "$VERCEL_TOKEN" <<< "$val"
    vercel env add "$key" development --token "$VERCEL_TOKEN" <<< "$val"
  fi
done

echo "Done. Consider redeploying: vercel --yes --token $VERCEL_TOKEN" >&2

