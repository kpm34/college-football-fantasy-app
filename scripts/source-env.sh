#!/bin/bash

# Usage: Source .env
# This script safely exports variables from .env.local (and .env) into the current shell.
# Call with:  source scripts/source-env.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

load_file() {
  local file="$1"
  if [ -f "$file" ]; then
    # Filter out comments and blank lines, then export
    while IFS='=' read -r key val; do
      [ -z "$key" ] && continue
      [[ "$key" =~ ^# ]] && continue
      if [ -n "$val" ]; then
        export "$key"="$val"
      fi
    done < <(grep -v '^#' "$file" | grep -v '^$')
  fi
}

load_file "$ROOT_DIR/.env"
load_file "$ROOT_DIR/.env.local"

echo "Environment variables loaded from .env and .env.local into current shell." 1>&2


