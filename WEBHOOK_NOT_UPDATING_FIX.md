# 🔧 Webhook Not Updating - Debug Guide

## Issue: Data Still Empty After Call

### What Should Happen:
```
Call completes
  ↓
Retell analyzes
  ↓
Webhook fires → api/retell-webhook
  ↓
Saves to retell_call_analysis
  ↓
Updates campaign_candidates
  ↓
Table shows new data
```

### What to Check:

#### 1. Is Webhook Server Running?
```bash
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

#### 2. Is Webhook Configured in Retell?
- Go to: https://dashboard.retellai.com/dashboard/settings
- Check "Webhook URL" field
- For localhost: Use ngrok URL (e.g., https://abc-123.ngrok.io/api/retell-webhook)
- For production: Use your deployed URL

#### 3. Check Webhook Logs
Look in terminal where `npm run webhook` is running.

After a call, you should see:
```
📨 Retell webhook received
   Event: call_analyzed
   Call ID: call_abc123

🧠 Call analyzed: call_abc123
📊 Full analysis data: {...}
📝 Analysis data received: {...}
✅ Analysis saved to retell_call_analysis
💾 Updating campaign_candidates table...
✅ Candidate updated in database!
   Available: YES
   Interested: YES
```

**If you DON'T see these logs:**
→ Webhook isn't being called
→ Check Retell dashboard webhook settings

#### 4. Test Webhook Manually
```bash
# Simulate a webhook call
curl -X POST http://localhost:3001/api/retell-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "call_analyzed",
    "call": {
      "call_id": "test_123",
      "metadata": {
        "campaign_id": "your-campaign-id",
        "candidate_id": "your-candidate-id"
      }
    },
    "call_analysis": {
      "post_call_analysis_data": {
        "question_0": "yes",
        "question_1": "yes",
        "question_2": "no"
      },
      "call_summary": "Test summary",
      "call_successful": true
    }
  }'
```

Should see logs in webhook terminal.

---

## For Localhost Testing:

### Need ngrok to expose webhook:

```bash
# Terminal 3:
npx ngrok http 3001

# Copy the URL (e.g., https://abc-123.ngrok.io)

# Add to Retell Dashboard:
Webhook URL: https://abc-123.ngrok.io/api/retell-webhook
```

**Without ngrok, Retell can't reach your localhost webhook!**

---

## Quick Fix:

### Without Webhooks (For Now):

The calls will work but you won't get automatic updates. You can manually check results in:
- Retell Dashboard: https://dashboard.retellai.com/calls
- See transcripts, recordings, analysis there

### With Webhooks (Proper Solution):

1. Run ngrok: `npx ngrok http 3001`
2. Add ngrok URL to Retell dashboard
3. Make test call
4. Check webhook terminal for logs
5. Data should update!

---

**Try ngrok and send me what the webhook logs show!**



