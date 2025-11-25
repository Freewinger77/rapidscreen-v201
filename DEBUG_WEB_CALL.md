# 🔍 Debug Web Call Testing

## ✅ Simulator Removed - Only Web Calls Now!

The fake simulator has been **completely removed**. Now it will **ONLY** launch real Retell web calls.

## 🧪 How to Test & Debug

### 1. Start the App
```bash
npm run dev
```

### 2. Open Browser Console
**IMPORTANT:** Open the console **BEFORE** clicking the button!

- **Chrome/Edge:** Press `F12` or `Cmd+Option+J` (Mac) or `Ctrl+Shift+J` (Windows)
- **Firefox:** Press `F12` or `Cmd+Option+K` (Mac) or `Ctrl+Shift+K` (Windows)
- **Safari:** `Cmd+Option+C`

### 3. Create Campaign & Test
```
1. Campaigns → Create New Campaign
2. Fill Steps 1-3 (name, job, objectives, matrix)
3. Step 4: Preview & Publish
4. Scroll to "Test AI Agent"
5. Click "Test Call Agent"
```

### 4. Watch Console Output

You should see detailed logs like this:

```
🔍 Retell configured? true
🔑 API Key: key_de54dbc177b53d8b4a7f8f650adf
🤖 Agent ID: agent_3da99b2b4c0e47546a10a99ef4
🚀 Launching web call...
============================================================
🤖 CREATING RETELL WEB CALL
============================================================
🔑 API Key: ***50adf
🤖 Agent ID: agent_3da99b2b4c0e47546a10a99ef4
📝 Agent Prompt: You are James a recruitment consultant...
💬 First Message: Hi this is James from Nucleo Talent...
============================================================
📤 POST https://api.retellai.com/v2/create-web-call
📦 Payload: {
  "agent_id": "agent_3da99b2b4c0e47546a10a99ef4",
  "retell_llm_dynamic_variables": {
    "agent_prompt": "You are James...",
    "first_message": "Hi this is James..."
  }
}
📨 Response status: 201 Created
✅ Web call created successfully!
📞 Call ID: call_abc123...
🔑 Access Token: eyJhbGciOiJIUzI1NiJ9...
📊 Call Status: registered
============================================================
🌐 OPENING WEB CALL IN BROWSER
============================================================
📞 Call ID: call_abc123...
🔑 Access Token: eyJhbGci...
🔗 URL: https://app.retellai.com/call/call_abc123...?token=eyJ...
🪟 Opening popup window...
✅ Popup window opened successfully!
💡 If you don't see it, check if popup was blocked
============================================================
```

## 🚨 Error Scenarios & Solutions

### Scenario 1: Retell Not Configured
**Console shows:**
```
🔍 Retell configured? false
🔑 API Key: MISSING!
🤖 Agent ID: MISSING!
```

**Fix:**
- Check `.env` file exists
- Verify it has:
  ```
  VITE_RETELL_API_KEY=key_de54dbc177b53d8b4a7f8f650adf
  VITE_RETELL_AGENT_ID=agent_3da99b2b4c0e47546a10a99ef4
  ```
- Restart dev server: `npm run dev`

### Scenario 2: Prompts Not Fetched
**Console shows:**
```
Failed to fetch prompts: [error]
❌ Failed to fetch prompts. Cannot test without prompts.
```

**Fix:**
- Check webhook endpoint is accessible
- Verify n8n is running
- Check network tab for 404/500 errors
- Ensure job is selected in Step 1

### Scenario 3: Retell API Error
**Console shows:**
```
📨 Response status: 401 Unauthorized
❌ Retell API error response: {"error":"Invalid API key"}
```

**Fix:**
- Verify Retell API key is correct
- Check it's not expired
- Confirm it's for the right environment

### Scenario 4: Popup Blocked
**Console shows:**
```
❌ POPUP BLOCKED! Opening in same tab instead...
```

**Fix:**
- Allow popups for `localhost:5173`
- Browser settings → Site permissions → Popups → Allow

### Scenario 5: Wrong Agent ID
**Console shows:**
```
📨 Response status: 404 Not Found
❌ Retell API error response: {"error":"Agent not found"}
```

**Fix:**
- Check agent ID in Retell dashboard
- Verify agent exists
- Update `.env` with correct agent ID

## ✅ Success Indicators

When everything works, you'll see:

1. **Console:** All green checkmarks ✅
2. **Toasts:** 
   - "AI prompts loaded! Launching web call..."
   - "Opening AI call in browser..."
   - "Web call opened! Start talking to test your AI agent."
3. **Popup:** New window opens with Retell interface
4. **UI:** "Connect" or "Join Call" button
5. **Microphone:** Browser asks for mic permission
6. **AI Speaks:** "Hi this is James from Nucleo Talent..."

## 🎯 What Should Happen

### Timeline
```
00:00 - Click "Test Call Agent"
00:01 - Toast: "Fetching AI prompts..."
00:03 - Toast: "AI prompts loaded! Launching web call..."
00:04 - Console logs (see above)
00:05 - Toast: "Creating web call..."
00:06 - POST to Retell API
00:07 - Response received
00:08 - Toast: "Opening AI call in browser..."
00:09 - POPUP OPENS! 🌐
00:10 - You see Retell web interface
00:11 - Click "Connect"
00:12 - Allow microphone
00:13 - AI starts speaking!
```

**Total time: ~13 seconds from click to talking**

## 🔧 Debugging Steps

### Step 1: Check Environment
```bash
# In terminal
cat .env | grep RETELL

# Should show:
VITE_RETELL_API_KEY=key_de54dbc177b53d8b4a7f8f650adf
VITE_RETELL_AGENT_ID=agent_3da99b2b4c0e47546a10a99ef4
```

### Step 2: Check Console Logs
- Open console BEFORE clicking button
- Look for the detailed logs
- Check for any ❌ errors
- Note the exact error message

### Step 3: Check Network Tab
- Open Network tab in DevTools
- Click "Test Call Agent"
- Look for:
  - POST to `/webhook/get-prompt-for-agent` → Should be 200
  - POST to `api.retellai.com/v2/create-web-call` → Should be 201

### Step 4: Check Popup Blocker
- Look for popup blocked icon in address bar
- Allow popups for localhost:5173
- Try again

## 📝 Quick Test Checklist

- [ ] `.env` file has VITE_RETELL_API_KEY
- [ ] `.env` file has VITE_RETELL_AGENT_ID
- [ ] Dev server restarted after .env changes
- [ ] Browser console open
- [ ] Campaign wizard on Step 4
- [ ] Job selected in Step 1
- [ ] Clicked "Test Call Agent"
- [ ] Watched console logs
- [ ] Saw POST requests in Network tab
- [ ] Popup opened (or same tab if blocked)
- [ ] Retell interface loaded
- [ ] Clicked "Connect"
- [ ] Allowed microphone
- [ ] AI started speaking

## 🚀 If Still Not Working

**Post in console:**
1. The EXACT console output when you click the button
2. Any errors (red text)
3. Network tab showing the requests

**I need to see:**
- Are prompts being fetched?
- Is Retell API being called?
- What's the response status?
- Are there any errors?

---

**Status:** ✅ Simulator removed  
**Debug Logs:** ✅ Added  
**Build:** ✅ Successful  

**Now test and check console!** 🔍


