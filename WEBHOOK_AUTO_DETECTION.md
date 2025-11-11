# 🔔 Webhook Auto-Detection System

## ✅ How It Works:

The system **automatically detects** the correct webhook URL based on environment:

---

## 🎯 Auto-Detection Logic:

### **In Development (localhost):**
```
1. Frontend detects it's on localhost
2. Assumes webhook server on port 3001 (default)
3. Uses: http://localhost:3001/api/retell-webhook
```

### **In Production (deployed):**
```
1. Frontend detects production domain
2. Uses same domain as the app
3. Uses: https://yourapp.vercel.app/api/retell-webhook
```

### **Manual Override (if needed):**
```
Set in .env:
VITE_RETELL_WEBHOOK_URL=http://localhost:3001/api

This overrides auto-detection
```

---

## 🖥️ Webhook Server Port Detection:

The webhook server (`server.js`) now:

1. **Uses port from env** or defaults to 3001:
   ```bash
   # Default: 3001
   npm run webhook
   
   # Custom port:
   WEBHOOK_PORT=4000 npm run webhook
   ```

2. **Logs the full webhook URL** when it starts:
   ```
   ═══════════════════════════════════════
   🚀 WEBHOOK SERVER RUNNING
   ═══════════════════════════════════════
   
   🌐 Local URL: http://localhost:3001
   🔔 Webhook URL: http://localhost:3001/api/retell-webhook
   ✅ Status: Ready to receive Retell events
   ```

3. **Writes config to `.webhook-info.json`**:
   ```json
   {
     "port": 3001,
     "localWebhookUrl": "http://localhost:3001/api/retell-webhook",
     "timestamp": "2025-11-05T...",
     "instructions": {
       "local": "Use ngrok: npx ngrok http 3001",
       "production": "Deploy and use: https://yourapp.vercel.app/api/retell-webhook"
     }
   }
   ```

---

## 🎯 Standard Setup:

### **Development:**
```bash
# Terminal 1: Start both servers (uses standard ports)
npm run dev:all

# Vite → port 5173
# Webhook → port 3001

# Terminal 2 (optional): Expose webhook publicly
npx ngrok http 3001
```

### **Custom Ports:**
```bash
# Custom webhook port
WEBHOOK_PORT=4000 npm run webhook

# Frontend will still use port from env var:
VITE_RETELL_WEBHOOK_URL=http://localhost:4000/api
```

### **Production:**
```bash
# Deploy to Vercel
vercel deploy

# Webhook auto-available at:
# https://yourapp.vercel.app/api/retell-webhook

# No port config needed - serverless!
```

---

## 📊 How Frontend Finds Webhook:

```typescript
// In retell-client.ts constructor:

1. Check VITE_RETELL_WEBHOOK_URL env var
   ↓ If set: Use it
   ↓ If not set: Auto-detect
   
2. Auto-detection:
   ↓ Check window.location.hostname
   ↓ If 'localhost': http://localhost:3001/api
   ↓ If production: https://{current-domain}/api
   
3. Result: Always uses correct URL! ✨
```

---

## 🎯 For Your Use Case:

### **Localhost Testing:**
```
Frontend: http://localhost:5173
Webhook: http://localhost:3001/api/retell-webhook

Auto-detected ✅
No config needed!
```

### **With ngrok (for Retell to reach localhost):**
```
Run: npx ngrok http 3001
Get: https://abc-123.ngrok.io

Configure in Retell:
Webhook URL: https://abc-123.ngrok.io/api/retell-webhook

Frontend still uses: http://localhost:3001/api (internally)
Retell uses: https://abc-123.ngrok.io/api (externally)
```

### **Production Deployment:**
```
Deploy to: https://rapidscreen.vercel.app

Frontend auto-detects: https://rapidscreen.vercel.app/api/retell-webhook
Configure in Retell: https://rapidscreen.vercel.app/api/retell-webhook

Same URL for both! ✅
```

---

## 🚀 Why This Is Smart:

1. **No hardcoding** - adapts to environment automatically
2. **Works in dev** - localhost:3001 by default
3. **Works in production** - uses deployed domain
4. **Override available** - set env var if needed
5. **Clear logging** - server shows webhook URL on startup
6. **Portable** - works on any machine

---

## 📋 Summary:

**You asked:** "Can it detect which port it's running on?"

**Answer:** **YES! It does now!**

- ✅ Server logs its own webhook URL on startup
- ✅ Frontend auto-detects localhost:3001 for dev
- ✅ Frontend auto-detects production domain when deployed
- ✅ Manual override available via env var
- ✅ Port configurable via WEBHOOK_PORT env var
- ✅ Works seamlessly in all environments

**Standard setup (works automatically):**
```bash
npm run dev:all
```

**Custom port:**
```bash
WEBHOOK_PORT=4000 npm run webhook
```

Frontend will find it! 🎯

