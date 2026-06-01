#!/bin/bash
set -euo pipefail

PRODUCT="${PRODUCT_NAME:-saas}"
ENV="production"
DIR="$HOME/apps/$PRODUCT/$ENV"

cd "$DIR"

echo "Pulling latest images..."
docker compose pull

echo "Running migrations..."
docker compose run --rm api npx drizzle-kit migrate

echo "Restarting services..."
docker compose up -d --remove-orphans

echo "Checking health..."
sleep 5
docker compose ps

echo "Deploy complete."
