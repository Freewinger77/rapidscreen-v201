#!/bin/bash

# Quick ngrok setup for Retell webhooks

echo "🚀 Setting up ngrok for Retell webhooks..."
echo ""

# Check if webhook server is running
if ! curl -s http://localhost:3001/health > /dev/null; then
  echo "❌ Webhook server not running!"
  echo "   Run in another terminal: npm run webhook"
  echo ""
  exit 1
fi

echo "✅ Webhook server is running on port 3001"
echo ""
echo "🌐 Starting ngrok tunnel..."
echo ""

# Start ngrok
npx ngrok http 3001 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Extract the public URL
if [ -f ngrok.log ]; then
  NGROK_URL=$(grep -o 'https://[a-z0-9-]*\.ngrok[a-z.-]*' ngrok.log | head -1)
  
  if [ -n "$NGROK_URL" ]; then
    echo "═══════════════════════════════════════════════════════════"
    echo "✅ NGROK TUNNEL ACTIVE!"
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📍 Public URL: $NGROK_URL"
    echo "🔔 Webhook URL: $NGROK_URL/api/retell-webhook"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "📋 NEXT STEPS:"
    echo ""
    echo "1. Copy this URL:"
    echo "   $NGROK_URL/api/retell-webhook"
    echo ""
    echo "2. Go to Retell Dashboard:"
    echo "   https://dashboard.retellai.com/dashboard/settings"
    echo ""
    echo "3. Find 'Webhook URL' field"
    echo ""
    echo "4. Paste: $NGROK_URL/api/retell-webhook"
    echo ""
    echo "5. Save"
    echo ""
    echo "═══════════════════════════════════════════════════════════"
    echo ""
    echo "✅ Then test a call - webhook will receive events!"
    echo ""
    echo "Press Ctrl+C to stop ngrok"
    
    # Keep ngrok running
    wait $NGROK_PID
  else
    echo "❌ Could not get ngrok URL"
    cat ngrok.log
  fi
else
  echo "❌ ngrok failed to start"
fi



