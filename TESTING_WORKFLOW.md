# 🧪 Complete Testing Workflow

## 🎯 How to Test Your Campaigns with Real AI

### Full Flow (5-10 minutes)

```
Step 1: Create Campaign in Wizard
    ↓
Step 2: Fill in Campaign Details
    - Name: "Test Campaign"
    - Select job
    - Set dates
    - Select channels (Phone)
    ↓
Step 3: Define Targets (Objectives)
    - Available to Work (boolean)
    - Interested (boolean)
    - Experience (text)
    ↓
Step 4: Create Matrices
    - Initial Outreach script
    - Follow-up messages
    ↓
Step 5: Preview & Publish
    ↓
Step 6: Click "Test Call Agent" 🆕
    ↓
System automatically:
    1. Builds payload from campaign data
    2. POSTs to /webhook/get-prompt-for-agent
    3. Gets back dynamic prompts:
       - prompt_call
       - first_message_call
    ↓
Dialog shows:
    - Agent Prompt (from webhook) ✅
    - First Message (from webhook) ✅
    - Phone number input
    - Retell configuration
    ↓
Step 7: Enter Your Phone Number
    - Type: +44 7700 900000
    ↓
Step 8: Click "🚀 Launch Test Call"
    ↓
System:
    1. Updates Retell agent with:
       - agent_prompt = prompt_call
       - first_message = first_message_call
    2. Calls Retell API to initiate call
    ↓
YOUR PHONE RINGS! 📱
    ↓
Answer and talk to AI agent
    - Agent uses dynamic prompts
    - Asks objective questions
    - Follows campaign script
    ↓
Verify behavior, adjust campaign if needed
    ↓
Launch full campaign when ready!
```

## 📞 What Happens During Test Call

### The AI Agent Will:
1. **Introduce itself** using `first_message_call`
   - Generated from your job description
   - Personalized to campaign
2. **Follow instructions** from `agent_prompt`
   - Acts as the persona defined
   - Uses job context
3. **Ask objective questions**
   - Based on your targets
   - Collects data you defined
4. **Behave naturally**
   - Dynamic responses
   - Contextual conversation

### Example Test Call

**You answer:**
"Hello?"

**AI Agent (first_message_call):**
"Hi this is James from Nucleo Talent, How are you today?"

**You:**
"I'm good, thanks. What's this about?"

**AI Agent (following agent_prompt):**
"We have a Steel Fixer position at Hinkley Point C offering up to £18.50 per hour. Are you interested?"

**You:**
"Yes, tell me more..."

**AI Agent (collecting objectives):**
"Great! Are you currently available to work?" ← Collecting "Available to Work" objective

And so on...

## 🔧 Technical Details

### Webhook Endpoints Used

**1. Get Prompts (for testing):**
```
POST https://n8n-rapid-.../webhook/get-prompt-for-agent

Request: {
  campaign: "test-campaign",
  tasks: [],
  job_description: "...",
  objectives: {...}
}

Response: {
  prompt_call: "...",
  first_message_call: "...",
  prompt_chat: "...",
  first_message_chat: "..."
}
```

**2. Retell API Calls:**
```
PATCH https://api.retellai.com/update-agent/{agent_id}
Body: {
  agent_prompt: "...",  ← prompt_call
  first_message: "..."  ← first_message_call
}

POST https://api.retellai.com/create-phone-call
Body: {
  from_number: "+447874497138",
  to_number: "+44...",
  agent_id: "agent_3da99b..."
}
```

### Dynamic Variables Mapping

| Webhook Response | Retell AI Parameter | What It Does |
|------------------|---------------------|--------------|
| `prompt_call` | `agent_prompt` | AI personality & instructions |
| `first_message_call` | `first_message` | What AI says first |
| `prompt_chat` | (WhatsApp) | Chat agent instructions |
| `first_message_chat` | (WhatsApp) | First WhatsApp message |

## ✅ Success Indicators

When working correctly:

✅ **Button click** → Shows "Loading..."
✅ **Toast** → "Fetching AI prompts..."
✅ **Dialog opens** → Shows prompts with green indicators
✅ **Prompts display** → Full text from backend
✅ **Enter phone** → Button enables
✅ **Click launch** → Button shows "📞 Calling..."
✅ **Toast** → "Call initiated! Call ID: call_xxx"
✅ **Phone rings** → Real call!
✅ **Answer** → AI speaks with dynamic prompts
✅ **Conversation** → AI follows campaign definition

## 🎨 Visual Indicators

### Green Dot + "From Backend"
```
🟢 Agent Prompt (Dynamic)
🟢 First Message (Dynamic)
```

Means the text came from your webhook, not static templates!

### Retell Configuration Box (Blue)
```
Retell AI Configuration
• Agent ID: agent_3da99b...
• From Number: +447874497138
• Prompts: Fetched from backend ✅
```

Shows Retell is configured and ready!

## 🚨 Error Handling

### Scenario 1: Webhook Fails
```
❌ Toast: "Failed to fetch AI prompts"
✅ Fallback: Uses matrix scripts
✅ Still can test: Yes (with defaults)
```

### Scenario 2: Retell Not Configured
```
❌ Toast: "Retell AI not configured"
✅ Fallback: Opens simulator
✅ Still can test: Yes (simulated)
```

### Scenario 3: Call Launch Fails
```
❌ Toast: "Failed to launch call: [error]"
✅ Dialog stays open
✅ Can retry: Yes
✅ Check: Console for details
```

## 💡 Use Cases

### 1. Verify AI Behavior
- Test if AI asks the right questions
- Check if objectives are collected properly
- Ensure natural conversation flow

### 2. Quality Assurance
- Listen to voice quality
- Check pronunciation
- Verify script accuracy

### 3. Iteration
- Test → Adjust objectives → Test again
- Refine matrices → Test → Launch
- Perfect the flow before real campaign

### 4. Training
- Show team how calls will sound
- Demonstrate AI capabilities
- Get buy-in before launch

## 🎓 Best Practices

1. **Always test first** - Don't launch untested campaigns
2. **Use your own number** - Experience the candidate journey
3. **Test multiple times** - Try different responses
4. **Check console** - Monitor prompts being sent
5. **Adjust and retest** - Iterate until perfect

## 📋 Checklist Before Launching Real Campaign

- [ ] Tested call agent with real call
- [ ] Verified AI prompt makes sense
- [ ] Confirmed first message is professional
- [ ] Checked AI asks objective questions
- [ ] AI conversation sounds natural
- [ ] No awkward pauses or errors
- [ ] Voice quality is good
- [ ] Ready to launch to candidates

## 🎉 Summary

**What You Can Do Now:**

1. ✅ **Create campaign** in wizard
2. ✅ **Define objectives** (targets)
3. ✅ **Create scripts** (matrices)
4. ✅ **Fetch dynamic prompts** from webhook
5. ✅ **Launch REAL test call** via Retell AI
6. ✅ **Experience actual AI conversation**
7. ✅ **Iterate and improve**
8. ✅ **Launch full campaign** when ready

**This is PRODUCTION-LEVEL testing!**

You're literally calling yourself with the same AI that will call candidates. No guesswork. No surprises. Perfect testing! 🎯

---

**Status:** ✅ Complete
**Build:** ✅ Successful  
**Ready:** ✅ Yes!

**Try it now:** Create a campaign and test! 📞🤖

Your phone will ring with a real AI recruiter! 🎉


