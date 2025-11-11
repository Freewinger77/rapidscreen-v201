#!/bin/bash

# Start Servers Script
# Run this to start both React app and Webhook server

echo "🚀 Starting RapidScreen servers..."
echo ""

# Kill any existing processes
pkill -9 node 2>/dev/null
sleep 1

# Start webhook server in background
echo "Starting webhook server on port 3001..."
cd "$(dirname "$0")"
node server.js > webhook-server.log 2>&1 &
WEBHOOK_PID=$!

# Wait for webhook server to start
sleep 3

# Test webhook server
if curl -s http://localhost:3001/health > /dev/null; then
  echo "✅ Webhook server running on port 3001"
else
  echo "❌ Webhook server failed to start"
  cat webhook-server.log
  exit 1
fi

# Start Vite dev server
echo "Starting React app..."
npm run dev

# Cleanup on exit
trap "kill $WEBHOOK_PID 2>/dev/null" EXIT

