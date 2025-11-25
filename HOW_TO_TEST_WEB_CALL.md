# 🎤 How to Test Web Call - Step by Step

## ✅ Web Call Created Successfully!

I can see from your logs that the web call **IS being created** successfully:

```
✅ Web call created!
📞 Call ID: call_f15fc51510dac1e4983a03cb52d
🔑 Access Token: eyJhbGciOiJIUzI1NiJ9...
```

The issue is the SDK loading. I've updated it to try multiple CDN sources.

## 🚀 Test It Now

```bash
# Restart the dev server
npm run dev
```

### Then:
1. **Hard refresh browser:** Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Go to Campaigns → Create New Campaign
3. Fill Steps 1-3
4. Step 4 → Click "Test Call Agent"
5. **Open browser console (F12)** - Watch for SDK loading
6. Dialog appears with "Connecting to AI Agent..."
7. **ALLOW MICROPHONE** when browser asks! ← CRITICAL
8. AI starts talking!

## 🔍 What to Watch in Console

Success looks like:
```
✅ Retell SDK loaded from CDN
🎤 Initializing Retell Web Call...
📞 Call ID: call_f15fc51...
🔑 Access Token: eyJhbGci...
🚀 Starting web call...
✅ Web call connected!
✅ Call started
🗣️ Agent speaking
```

## 🎤 CRITICAL: Allow Microphone!

When the dialog opens, browser will show:
```
┌────────────────────────────────────┐
│ localhost:5173 wants to            │
│ Use your microphone                │
│                                    │
│  [Block]  [Allow]                  │
└────────────────────────────────────┘
```

**CLICK ALLOW!** Otherwise the call won't work!

## 🚨 If SDK Still Fails to Load

The widget will try **3 different CDN sources**:
1. `cdn.jsdelivr.net/npm/retell-client-js-sdk`
2. `unpkg.com/retell-client-js-sdk`
3. Fallback handling

Check console - it will tell you which one worked!

## 📝 Expected Console Output

```
🔍 Retell configured? true
🔑 API Key: key_de54dbc177b53d8b4a7f8f650adf
🤖 Agent ID: agent_3da99b2b4c0e47546a10a99ef4
🚀 Launching web call...
============================================================
🤖 CREATING RETELL WEB CALL
============================================================
📤 POST https://api.retellai.com/v2/create-web-call
📨 Response status: 201 Created
✅ Web call created!
📞 Call ID: call_f15fc51510dac1e4983a03cb52d
🔑 Access Token: eyJhbGciOiJIUzI1NiJ9...
============================================================
✅ Retell SDK loaded from CDN  ← NEW!
🎤 Initializing Retell Web Call...
🚀 Starting web call...
✅ Web call connected!
✅ Call started
```

Then you should hear the AI speak!

## 💡 Troubleshooting

### "Failed to load SDK"
- **Check:** Internet connection
- **Try:** Different browser (Chrome works best)
- **Check:** Console for which CDN failed
- **Wait:** Sometimes takes a few seconds

### Microphone not working
- **Check:** Browser permissions
- **Fix:** Settings → Privacy → Microphone → Allow localhost
- **Try:** Different browser

### No audio
- **Check:** Volume is up
- **Check:** Correct audio output device
- **Try:** Unplug/replug headphones

### Call connects but AI doesn't speak
- **Check:** Dynamic variables were sent (console logs)
- **Check:** Retell agent is configured properly
- **Try:** Test with Retell dashboard first

---

**Status:** ✅ Updated with proper SDK loading  
**Build:** ✅ Successful  
**Ready:** ✅ Test NOW!

**Try it - allow microphone when asked!** 🎤✨


