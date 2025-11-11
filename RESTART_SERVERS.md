# 🔄 RESTART SERVERS - FIXED!

## ✅ I Fixed the Server Configuration

The web token endpoint is now properly configured!

---

## 🚀 HOW TO RESTART:

### **Option 1: Run Both Together (Recommended)**

```bash
npm run dev:all
```

This starts:
- React app (port 5173 or 5174)
- Webhook + API server (port 3001)

---

### **Option 2: Run Separately**

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run webhook
```

---

## ✅ **What You Should See:**

### **In Terminal (Webhook Server):**
```
═══════════════════════════════════════════════════════
🚀 WEBHOOK & API SERVER RUNNING
═══════════════════════════════════════════════════════

   🌐 Local URL: http://localhost:3001
   🔔 Webhook URL: http://localhost:3001/api/retell-webhook
   🎤 Web Token URL: http://localhost:3001/api/retell-get-web-token
   ✅ Status: Ready!

───────────────────────────────────────────────────────

📋 AVAILABLE ENDPOINTS:

   GET  /health
   POST /api/retell-webhook
   POST /api/retell-get-web-token  (for browser testing)

═══════════════════════════════════════════════════════
```

---

## 🧪 **Test It Works:**

```bash
# Test health endpoint
curl http://localhost:3001/health

# Should return:
# {"status":"ok","service":"retell-webhook-server"}

# Test web token endpoint
curl -X POST http://localhost:3001/api/retell-get-web-token \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_82d2d7765ebc09a20154621d70"}'

# Should return:
# {"access_token":"...","call_id":"...","agent_id":"..."}
```

---

## 🎯 **Then Test Browser Calling:**

1. **Open browser:** http://localhost:5174 (or 5173)
2. **Go to campaign**
3. **Click "Test in Browser"**
4. **Click "Start Test Call"**
5. **Allow microphone**
6. **Speak!** Should work now! 🎤

---

## 📋 **Checklist:**

- [ ] Stop all servers (Ctrl+C)
- [ ] Run: `npm run dev:all`
- [ ] See both servers start successfully
- [ ] Test health endpoint (optional)
- [ ] Open browser
- [ ] Click "Test in Browser"
- [ ] Click "Start Test Call"
- [ ] Should connect now!

---

**The server is configured correctly now. Just restart and try again!** ✅

