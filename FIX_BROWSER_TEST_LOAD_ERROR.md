# 🔧 Fix Browser Test "Load Failed" Error

## ❌ The Problem:

When you click "Start Test Call", it says "load failed"

## 🔍 Diagnosis:

The web token endpoint wasn't registered correctly in server.js

## ✅ The Fix:

I just fixed it! The endpoint is now properly registered.

---

## 🚀 To Fix It NOW:

### **Stop and restart the servers:**

```bash
# Press Ctrl+C to stop npm run dev:all

# Then restart:
npm run dev:all
```

**OR if dev:all isn't working:**

```bash
# Terminal 1: Start React app
npm run dev

# Terminal 2: Start webhook server
npm run webhook
```

---

## 🧪 Test if It's Working:

### **Test 1: Check server is running**
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","service":"retell-webhook-server"}`

### **Test 2: Check web token endpoint**
```bash
curl -X POST http://localhost:3001/api/retell-get-web-token \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_82d2d7765ebc09a20154621d70"}'
```

Should return: `{"access_token":"...","call_id":"...","agent_id":"..."}`

---

## 🎯 If Still Not Working:

### **Check these:**

1. **Is webhook server running?**
   ```bash
   # You should see this in terminal:
   🚀 WEBHOOK SERVER RUNNING
   🌐 Local URL: http://localhost:3001
   ```

2. **Check browser console for exact error:**
   - Open browser (F12)
   - Click "Start Test Call"
   - Look for error message
   - Tell me what it says!

3. **Try manual test:**
   ```bash
   # Test the endpoint directly
   curl http://localhost:3001/api/retell-get-web-token \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"agent_id":"agent_82d2d7765ebc09a20154621d70"}'
   ```

---

## 📊 What Should Happen:

### **Successful Flow:**
```
1. Click "Start Test Call"
   ↓
2. Frontend: "Connecting..."
   ↓
3. Calls: POST localhost:3001/api/retell-get-web-token
   ↓
4. Backend generates token from Retell
   ↓
5. Returns: { access_token, call_id }
   ↓
6. Frontend connects to Retell with token
   ↓
7. Browser requests microphone
   ↓
8. Call connects!
   ↓
9. You can speak with AI
   ↓
10. Transcript updates live!
```

---

## 🔧 Quick Debug Commands:

```bash
# Check if port 3001 is in use
lsof -i :3001

# Check if server is responding
curl http://localhost:3001/health

# Test web token endpoint
curl -X POST http://localhost:3001/api/retell-get-web-token \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent_82d2d7765ebc09a20154621d70"}'

# Check server logs
# Look in the terminal where you ran npm run dev:all
```

---

## ✅ Once Fixed:

You'll be able to:
- Click "Test in Browser"
- Speak with the AI agent
- See live transcripts
- Test your campaign questions
- All in the browser, no phone needed!

---

**Restart the servers with `npm run dev:all` and try again!**

