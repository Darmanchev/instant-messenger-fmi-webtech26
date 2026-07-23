#!/bin/sh

# Render gives postgresql://, asyncpg needs postgresql+asyncpg://
if [ -n "$DATABASE_URL" ]; then
  export DATABASE_URL=$(echo "$DATABASE_URL" | sed 's|postgresql://|postgresql+asyncpg://|')
fi

echo "Starting server..."
uvicorn backend.main:app \
  --host 0.0.0.0 \
  --port "${PORT:-8000}" \
  --ws-max-size "${WS_MAX_FRAME_BYTES:-2048}"
