# 🚀 Retell AI - Step by Step Setup

## ✅ Already Completed:

1. ✅ Retell SDK installed
2. ✅ API key validated (working!)
3. ✅ Phone number available: **+442046203701**
4. ✅ Campaign Call Launcher component created
5. ✅ Integrated into campaign details page
6. ✅ RetellService class implemented

---

## 🔧 What YOU Need to Do Now:

### Step 1: Add Environment Variables (2 minutes)

**Open your `.env` file and add these lines:**

```env
VITE_RETELL_API_KEY=key_a3eb5eac6d8df939b486cbbb46c2
VITE_RETELL_PHONE_NUMBER=+442046203701
VITE_RETELL_VOICE_ID=11labs-Adrian
VITE_RETELL_WEBHOOK_URL=https://yourapp.com/api/retell/webhook
```

(You can copy from `ADD_TO_ENV.txt`)

---

### Step 2: Run Database Migration (1 minute)

**Go to Supabase SQL Editor and run:**

```sql
-- Copy the entire contents of: retell-tables-migration.sql
```

This creates 4 new tables:
- `campaign_retell_agents` - Stores AI agents per campaign
- `retell_calls` - Tracks all calls  
- `retell_call_analysis` - Stores post-call AI analysis
- `retell_batch_calls` - Tracks batch call jobs

**Direct link to your SQL Editor:**
https://supabase.com/dashboard/project/suawkwvaevvucyeupdnr/editor

---

### Step 3: Restart Dev Server (30 seconds)

After adding env vars:

```bash
# Stop your dev server (Ctrl+C if running)
npm run dev
```

---

### Step 4: Test the Integration! (5 minutes)

1. **Go to a Campaign** in your app
2. **Click the "🤖 AI Calling" tab**
3. **You should see**:
   - Call statistics
   - "Launch Calls" button
   - Real-time call dashboard

4. **Click "Launch Calls"**:
   - System creates a custom AI agent for this campaign
   - Agent gets dynamic questions from your campaign matrix
   - Starts calling candidates automatically

---

## 🎯 How It Works:

### When You Launch a Campaign:

```
1. System creates Retell AI agent
   ↓
2. Agent gets custom prompt with:
   - Job details (company, role, salary)
   - Your campaign questions (from matrices)
   - Your targets (what to find out)
   ↓
3. System starts calling candidates
   ↓
4. After each call:
   - Retell analyzes the conversation
   - Extracts answers to your questions
   - Saves to database
   - Updates candidate status
   ↓
5. You see results in real-time!
```

### Example Agent Prompt:

```
You are calling for Barrows and Sons about Site Engineer position.

Job Details:
- Location: London  
- Salary: £40,000-60,000
- Type: Full Time

Core Questions:
1. Are you available to work?
2. Are you interested in the position?
3. Do you know anyone at Barrows and Sons?

Campaign Questions (from YOUR matrix):
4. What is your expected salary?
5. When can you start?
6. Do you have CSCS card?

[Auto-generated based on your campaign configuration]
```

---

## 📊 What You'll Get:

### Real-Time Dashboard Shows:
- 📞 Total candidates
- ⏰ Not called yet
- ✅ Calls completed
- ❤️ Interested candidates  
- 👍 Available to work
- ⚡ Active calls (live)

### Post-Call Analysis Includes:
- ✅ Availability (Yes/No)
- ❤️ Interest level (Yes/No)
- 🤝 Know referee (Yes/No)
- 📝 Custom responses to YOUR questions
- 📊 Sentiment score (0-1)
- 💬 Call summary
- 🎯 Key points extracted
- 🔗 Recording URL
- 📜 Transcript URL

---

## 🧪 Quick Test:

### Test with YOUR phone number first:

1. Go to any campaign
2. Add yourself as a test candidate
3. Click "🤖 AI Calling" tab
4. Click "Launch Calls"
5. Your phone will ring!
6. Have a conversation with the AI
7. Check the analysis results

---

## 💡 Pro Tips:

1. **Start small** - Test with 5-10 candidates first
2. **Check your voice** - Try different voice IDs (11labs-Adrian, 11labs-Amy, etc.)
3. **Refine prompts** - Adjust campaign questions based on results
4. **Monitor costs** - Each call uses Retell credits
5. **Check recordings** - Listen to calls to improve prompts

---

## 📞 Phone Numbers:

You currently have: **+442046203701** (UK number)

To add more numbers:
1. Go to Retell Dashboard
2. Phone Numbers → Buy Number
3. Add to `.env` file

---

## 🚨 Troubleshooting:

### "Failed to create agent"
- Check `.env` file has all variables
- Restart dev server after adding env vars

### "No candidates to call"
- Make sure campaign has candidates
- Check `call_status` is 'not_called'

### Calls not connecting
- Verify phone number format (+country_code)
- Check Retell account credits
- Verify phone number is active in Retell

---

## 🎉 You're Almost Done!

Just complete Steps 1-3 above and you'll have **fully automated AI calling** for your recruitment campaigns!

**Total time**: ~5 minutes
**Result**: Autonomous AI recruitment agent 🤖📞

Let me know once you've added the env vars and run the migration!
