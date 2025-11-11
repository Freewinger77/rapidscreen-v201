# 📞 Retell AI Integration Setup Guide

## Quick Start

Follow these steps to integrate Retell AI with your recruitment platform for automated campaign calls.

---

## Step 1: Create Retell AI Account

1. **Sign up** at [Retell AI](https://www.retellai.com)
2. **Get your API Key**:
   - Go to Dashboard → API Keys
   - Create a new API key
   - Copy it (you'll need it in Step 2)

3. **Get a Phone Number** (for outbound calls):
   - Go to Phone Numbers → Buy Number
   - Choose a local number in your region
   - Note the phone number

---

## Step 2: Configure Environment Variables

Add these to your `.env` file:

```env
# Retell AI Configuration
VITE_RETELL_API_KEY=your_retell_api_key_here
VITE_RETELL_PHONE_NUMBER=+1234567890  # Your Retell phone number
VITE_RETELL_VOICE_ID=voice_id_here    # Optional: specific voice
VITE_RETELL_WEBHOOK_URL=https://yourapp.com/api/retell/webhook
```

---

## Step 3: Create Database Tables

1. Open Supabase SQL Editor
2. Run the migration script:

```sql
-- Copy contents from retell-tables-migration.sql
-- This creates all necessary tables for Retell integration
```

Or run directly:
```bash
# If you have Supabase CLI
supabase db push retell-tables-migration.sql
```

---

## Step 4: Set Up Webhook Endpoint

Create a webhook endpoint to receive Retell events:

### Option A: Using Vercel/Next.js
```typescript
// app/api/retell/webhook/route.ts
import { retellService } from '@/lib/retell-client';

export async function POST(req: Request) {
  const event = await req.json();
  
  // Verify webhook signature (optional but recommended)
  const signature = req.headers.get('x-retell-signature');
  // TODO: Verify signature
  
  // Process the event
  await retellService.processWebhook(event);
  
  return Response.json({ received: true });
}
```

### Option B: Using Express/Node.js
```typescript
// server.ts
app.post('/api/retell/webhook', async (req, res) => {
  const event = req.body;
  await retellService.processWebhook(event);
  res.json({ received: true });
});
```

---

## Step 5: Add UI Components to Campaign Page

Update your campaign details page to include the call launcher:

```typescript
// src/polymet/pages/campaign-details.tsx
import { CampaignCallLauncher } from '@/polymet/components/campaign-call-launcher';

export function CampaignDetailsPage() {
  // ... existing code

  return (
    <div>
      {/* Existing campaign UI */}
      
      {/* Add Call Launcher */}
      <CampaignCallLauncher 
        campaign={campaign} 
        jobId={campaign.jobId}
      />
    </div>
  );
}
```

---

## Step 6: Test the Integration

### 1. Create a Test Campaign
```typescript
// Test with a small campaign first
const testCampaign = {
  name: "Test Retell Campaign",
  matrices: [
    { 
      callScript: "Are you currently looking for work?",
      name: "Availability Check"
    },
    {
      callScript: "What is your expected salary range?",
      name: "Salary Expectations"
    }
  ],
  targets: [
    {
      description: "Has valid driver's license",
      goalType: "boolean"
    }
  ]
};
```

### 2. Test with Your Own Number First
- Add yourself as a candidate with your phone number
- Launch a single call to test the flow
- Verify the agent asks the right questions

### 3. Monitor in Real-Time
- Check the Retell Dashboard for call logs
- Monitor your Supabase tables for updates
- Review the call analysis results

---

## Usage Flow

### 1. Campaign Creation with Dynamic Questions

When creating a campaign, the system:
1. Takes your campaign matrices (questions/scripts)
2. Takes your campaign targets (what to find out)
3. Combines with job details
4. Creates a custom Retell AI agent with these prompts

### 2. Launching Calls

```
User clicks "Launch Calls" → 
System creates AI agent (if needed) →
Fetches uncalled candidates →
Makes calls in batches →
Updates status in real-time
```

### 3. Call Analysis

After each call:
```
Call ends →
Retell analyzes recording →
Sends webhook with results →
System saves analysis →
Updates candidate status →
Shows in dashboard
```

---

## Key Features Implemented

### ✅ Dynamic Agent Creation
- Each campaign gets its own AI agent
- Agent prompt includes job details
- Questions from campaign matrix
- Custom analysis based on targets

### ✅ Batch Calling
- Calls multiple candidates automatically
- Rate limiting to avoid overload
- Progress tracking
- Pause/resume capability

### ✅ Real-Time Monitoring
- Live call status updates
- Progress bars
- Active call display
- Success/failure tracking

### ✅ Post-Call Analysis
- Automatic transcription
- Sentiment analysis
- Key points extraction
- Custom question responses
- Candidate status updates

---

## Webhook Events

Your webhook will receive these events:

### `call.started`
```json
{
  "type": "call.started",
  "call_id": "call_123",
  "timestamp": "2024-01-01T10:00:00Z",
  "metadata": {
    "campaign_id": "uuid",
    "candidate_id": "uuid"
  }
}
```

### `call.ended`
```json
{
  "type": "call.ended",
  "call_id": "call_123",
  "duration": 180,
  "timestamp": "2024-01-01T10:03:00Z"
}
```

### `call.analyzed`
```json
{
  "type": "call.analyzed",
  "call_id": "call_123",
  "analysis": {
    "answers": [true, true, false],
    "custom_answers": {
      "salary_expectation": "$60,000-70,000"
    },
    "summary": "Candidate is interested and available...",
    "sentiment": 0.8,
    "key_points": ["Available immediately", "5 years experience"]
  },
  "transcript_url": "https://...",
  "recording_url": "https://..."
}
```

---

## Monitoring & Analytics

### View Call Results
```sql
-- Get campaign call performance
SELECT 
  c.name as campaign_name,
  COUNT(DISTINCT rc.id) as total_calls,
  COUNT(DISTINCT CASE WHEN rc.call_status = 'completed' THEN rc.id END) as completed,
  COUNT(DISTINCT CASE WHEN rca.interested = true THEN rca.id END) as interested,
  AVG(rca.sentiment_score) as avg_sentiment
FROM campaigns c
LEFT JOIN retell_calls rc ON rc.campaign_id = c.id
LEFT JOIN retell_call_analysis rca ON rca.campaign_id = c.id
GROUP BY c.id, c.name;
```

### Get Interested Candidates
```sql
-- Find all interested and available candidates
SELECT 
  cc.forename,
  cc.surname,
  cc.tel_mobile,
  rca.call_summary,
  rca.sentiment_score
FROM campaign_candidates cc
INNER JOIN retell_call_analysis rca ON rca.campaign_candidate_id = cc.id
WHERE 
  rca.interested = true 
  AND rca.available_to_work = true
  AND cc.campaign_id = 'your-campaign-id'
ORDER BY rca.sentiment_score DESC;
```

---

## Troubleshooting

### Issue: "Failed to create AI agent"
**Solution**: Check your Retell API key in `.env`

### Issue: "No candidates available to call"
**Solution**: Ensure candidates have `call_status = 'not_called'`

### Issue: Webhook not receiving events
**Solution**: 
1. Check webhook URL is publicly accessible
2. Verify URL in Retell dashboard
3. Check server logs for errors

### Issue: Calls failing immediately
**Solution**:
1. Verify phone number format (+country_code)
2. Check Retell account has credits
3. Ensure phone number is verified in Retell

---

## Cost Optimization

1. **Test with small batches** first
2. **Set max duration** for calls (default: 10 minutes)
3. **Use concurrent limits** to control rate
4. **Monitor usage** in Retell dashboard
5. **Filter candidates** before calling (valid numbers only)

---

## Security Best Practices

1. **Never expose API keys** in frontend code
2. **Verify webhook signatures** to prevent spoofing
3. **Use environment variables** for all sensitive data
4. **Implement rate limiting** on your webhook endpoint
5. **Log all calls** for audit purposes
6. **Get consent** before recording calls (legal requirement)

---

## Next Steps

1. ✅ Complete setup steps 1-6
2. ✅ Test with a small campaign
3. ✅ Monitor results and adjust prompts
4. ✅ Scale up gradually
5. ✅ Analyze performance metrics
6. ✅ Optimize agent prompts based on results

---

## Support

- **Retell Documentation**: https://docs.retellai.com
- **API Reference**: https://docs.retellai.com/api-reference
- **Dashboard**: https://dashboard.retellai.com

---

**Ready to Launch!** 🚀

Once setup is complete, you can start making automated calls with dynamic questions based on your campaign configuration!
