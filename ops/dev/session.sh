#!/usr/bin/env bash
set -euo pipefail

ACTION="${1:-start}"
PORT="${PORT:-3001}"

free_port() {
  if command -v lsof >/dev/null 2>&1; then
    local pids
    pids=$(lsof -ti tcp:"$PORT" || true)
    if [[ -n "$pids" ]]; then
      echo "Killing processes on port $PORT: $pids"
      kill -9 $pids || true
    fi
  else
    echo "lsof not found; skipping port free"
  fi
}

preflight() {
  echo "Running quick preflight (lint, typecheck)"
  npm run lint || true
  npm run typecheck || true
}

open_tabs() {
  local base="http://localhost:$PORT"
  if [[ "$(uname)" == "Darwin" ]]; then
    command -v open >/dev/null 2>&1 && {
      open "$base" || true
      open "$base/admin/draft-diagrams" || true
      open "$base/api/health" || true
    }
  fi
}

case "$ACTION" in
  fixport)
    free_port
    ;;
  preflight)
    preflight
    ;;
  start)
    free_port
    preflight || true
    echo "Starting dev server on :$PORT"
    npm run dev -- --port "$PORT"
    ;;
  *)
    echo "Usage: $0 [fixport|preflight|start]"
    exit 1
    ;;
esac


