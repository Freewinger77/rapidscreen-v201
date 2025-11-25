# 🎯 Test vs Launch - Complete Flow

## 📊 Two Different Flows

Your system has **two distinct flows** - one for testing, one for launching:

---

## 🧪 TESTING FLOW (Web Call - In Browser)

### Purpose
Test your AI agent **before** launching to real candidates

### Trigger
Click **"Test Call Agent"** button in campaign wizard (Step 4)

### What Happens
```
1. Click "Test Call Agent"
   ↓
2. Fetch prompts from webhook:
   POST /webhook/get-prompt-for-agent
   Payload: {
     campaign: "test-campaign",
     tasks: [],  ← EMPTY (no real candidates)
     job_description: "...",
     objectives: {...}
   }
   ↓
3. Webhook returns:
   {
     prompt_call: "You are James...",
     first_message_call: "Hi this is James..."
   }
   ↓
4. Create Retell WEB CALL:
   POST https://api.retellai.com/v2/create-web-call
   Body: {
     agent_id: "agent_3da99b...",
     retell_llm_dynamic_variables: {
       agent_prompt: "You are James...",
       first_message: "Hi this is James..."
     }
   }
   ↓
5. Popup opens in BROWSER
   ↓
6. YOU talk to AI (no phone needed!)
   ↓
7. Test conversation, verify behavior
```

### Key Points
- ✅ **NO phone calls** to candidates
- ✅ **Web call** in browser popup
- ✅ **FREE** - unlimited testing
- ✅ **tasks: []** - Empty array
- ✅ **Just testing** prompts and AI behavior

---

## 🚀 LAUNCH FLOW (Real Phone Calls)

### Purpose
Launch the **actual campaign** to real candidates

### Trigger
Click **"Launch Campaign"** button in campaign wizard (Step 4)

### What Happens
```
1. Click "Launch Campaign"
   ↓
2. Confirmation dialog:
   "Are you sure you want to launch [Campaign Name]?"
   ↓
3. Click "Yes, Launch Campaign"
   ↓
4. Build webhook payload with REAL TASKS:
   POST /webhook/session-created
   Payload: {
     campaign: "plumber-london_abc123xyz",
     tasks: [  ← FULL ARRAY with all candidates
       {
         session: "plumberlondon_447853723604",
         phone_number: "+447853723604"
       },
       {
         session: "plumberlondon_447949776830",
         phone_number: "+447949776830"
       },
       // ... one for each candidate
     ],
     job_description: "Job Title: Plumber\nCompany: ...",
     objectives: {
       available_to_work: {
         type: "boolean",
         description: "Check if available"
       },
       interested: {
         type: "boolean",
         description: "Assess interest"
       }
     }
   }
   ↓
5. n8n backend receives webhook
   ↓
6. Backend PROCESSES:
   - Creates session_info for each task
   - Creates numbers mapping
   - Creates campaign_info
   - Sends WhatsApp messages → chat_history
   - Makes PHONE CALLS → call_info
   ↓
7. REAL candidates get contacted!
   ↓
8. Backend tracks all interactions
   ↓
9. Auto-sync pulls data back to frontend
```

### Key Points
- ✅ **REAL phone calls** to candidates
- ✅ **tasks: [...]** - Full array with phone numbers
- ✅ **Backend processing** - n8n workflow
- ✅ **Production** - Actual campaign execution
- ✅ **Costs money** - Real calls/messages

---

## 📋 Side-by-Side Comparison

| Aspect | TEST (Web Call) | LAUNCH (Campaign) |
|--------|----------------|-------------------|
| **Button** | "Test Call Agent" | "Launch Campaign" |
| **Webhook** | `/webhook/get-prompt-for-agent` | `/webhook/session-created` |
| **Tasks** | `[]` (empty) | `[{session, phone}...]` (all candidates) |
| **Action** | Create web call | Create phone calls |
| **Target** | YOU (in browser) | CANDIDATES (real phones) |
| **Cost** | FREE | Paid (calls/messages) |
| **Purpose** | Testing | Production |
| **Result** | Popup window | Backend processing |
| **Phone Rings** | NO | YES (candidate phones) |

---

## 🎯 Implementation Details

### Test Flow Code

```typescript
// When user clicks "Test Call Agent"
handleFetchPromptsAndTest('call')
    ↓
// 1. Fetch prompts (NO tasks)
const prompts = await fetchCampaignPrompts(
  campaignName,
  jobDescription,
  objectives
);
// Webhook gets: { campaign, tasks: [], job_description, objectives }
    ↓
// 2. Create web call
const result = await createRetellWebCall(prompts);
// Retell gets: { agent_id, retell_llm_dynamic_variables: {...} }
    ↓
// 3. Open in browser
openRetellWebCall(result.access_token, result.call_id);
```

### Launch Flow Code

```typescript
// When user clicks "Launch Campaign"
handleLaunchCampaign()
    ↓
// 1. Build tasks array with ALL candidates
const tasks = candidates.map(c => ({
  session: generateSessionId(campaignName, c.phone),
  phone_number: c.phone
}));
    ↓
// 2. Launch via webhook (WITH tasks)
const result = await launchCampaign({
  campaignName,
  candidates: allCandidates,  // All from selected datasets
  jobDescription,
  objectives
});
// Webhook gets: { campaign, tasks: [...], job_description, objectives }
    ↓
// 3. Backend processes
// - Creates sessions
// - Makes REAL phone calls
// - Sends WhatsApp messages
// - Tracks in backend DB
```

---

## 🌊 Complete User Journey

### Phase 1: Create & Test
```
1. Create campaign wizard
2. Define job, objectives, scripts
3. Click "Test Call Agent"
4. Popup opens → Talk to AI in browser
5. Verify AI asks right questions
6. Verify conversation flows well
7. Close popup
8. Adjust objectives if needed
9. Test again (repeat until perfect)
```

### Phase 2: Launch
```
10. Click "Select Datasets"
11. Choose datasets (candidates)
12. Click "Launch Campaign"
13. Confirm in dialog
14. Webhook fires with tasks array
15. Backend starts contacting candidates
16. Real phone calls begin
17. Monitor in frontend (auto-sync)
```

### Phase 3: Monitor
```
18. Campaign cards show live stats
19. Candidates appear in chat_history
20. Calls appear in call_info
21. Auto-sync updates statuses
22. View chat history in candidate details
23. Track objectives completion
```

---

## 📝 Payload Examples

### Test Webhook (get-prompt-for-agent)

```json
{
  "campaign": "test-campaign",
  "tasks": [],  ← EMPTY!
  "job_description": "Job Title: Site Engineer\nCompany: Barrows and Sons...",
  "objectives": {
    "available_to_work": {
      "type": "boolean",
      "description": "Check if candidate is available to work"
    }
  }
}
```

**Returns:**
```json
{
  "prompt_call": "You are James a recruitment consultant...",
  "first_message_call": "Hi this is James from Nucleo Talent..."
}
```

### Launch Webhook (session-created)

```json
{
  "campaign": "plumber-london_abc123xyz",
  "tasks": [  ← FULL ARRAY!
    {
      "session": "plumberlondon_447853723604",
      "phone_number": "+447853723604"
    },
    {
      "session": "plumberlondon_447949776830",
      "phone_number": "+447949776830"
    }
    // ... 50 more candidates
  ],
  "job_description": "Job Title: Plumber\nCompany: ...",
  "objectives": {
    "available_to_work": {
      "type": "boolean",
      "description": "Check if available"
    },
    "interested": {
      "type": "boolean",
      "description": "Assess interest"
    }
  }
}
```

**Backend processes:** Creates sessions, makes calls, sends messages!

---

## ✅ Summary

**Your system perfectly separates:**

### Testing (Web Call)
- Purpose: Test AI behavior
- Method: Web call in browser
- Target: You
- Cost: Free
- Tasks: Empty array
- Result: Confidence in campaign

### Launching (Real Calls)
- Purpose: Contact candidates
- Method: Phone calls + WhatsApp
- Target: Real candidates
- Cost: Per call/message
- Tasks: Full array with all phones
- Result: Active campaign

**Both use the same prompts, so testing = production!** ✅

---

## 🎊 You're Ready!

```bash
npm run dev
```

**Then:**
1. **Test:** Campaign wizard → "Test Call Agent" → Browser popup
2. **Iterate:** Adjust, test again
3. **Launch:** "Launch Campaign" → Real phone calls
4. **Monitor:** Auto-sync, chat history, live stats

**Perfect testing, perfect launch!** 🚀✨

---

**Status:** ✅ COMPLETE  
**Build:** ✅ PASSING  
**Ready:** ✅ 100%

**Go test your AI, then launch your campaign!** 🎉📞


