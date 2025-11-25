# ⚡ Quick Reference Card

## 🚀 Start Development
```bash
npm run dev
```
Open: `http://localhost:5173`

---

## 🧪 Test Commands

```bash
# Frontend database
npm run db:test           # Verify connection (should show 129 records)
npm run db:migrate:mock   # Migrate data (already done ✅)

# Backend database
npm run backend:test      # Check backend (should show 58 messages)
npm run db:explore        # Explore backend schema

# Build
npm run build            # Production build (should pass ✅)
```

---

## 📊 Databases

### Frontend: `jtdqqbswhhrrhckyuicp`
- Jobs, Campaigns, Datasets
- 129 records
- Static management

### Backend: `xnscpftqbfmrobqhbbqu`
- Chat history, Calls, Sessions
- 58 messages
- Real-time tracking

---

## 🔗 Webhooks

### Get AI Prompts (Testing)
```
POST /webhook/get-prompt-for-agent
```

### Launch Campaign
```
POST /webhook/session-created
```

**Base URL:**
```
https://n8n-rapid-czbff9cnafhkhmhf.eastus-01.azurewebsites.net
```

---

## 🎯 Key Features

### 1. Create Campaign
```
Campaigns → Create New Campaign → Fill wizard → Launch
```

### 2. Test AI Agents 🆕
```
Campaign wizard (Step 4) → Test Call/WhatsApp Agent
→ Fetches live prompts → Shows in UI → Test!
```

### 3. View Chat History
```
Campaign Details → Click candidate → WhatsApp (Live) tab
→ See 58 real messages!
```

### 4. Auto-Sync
```
Runs automatically every 30s in Dashboard
Updates candidate statuses from backend
```

---

## 📁 Important Files

### Import From
```typescript
// Frontend data
import { loadJobs, addJob } from '@/lib/supabase-storage';

// Backend data
import { getChatHistoryByPhone } from '@/lib/backend-api';

// Webhook
import { launchCampaign } from '@/lib/campaign-webhook';

// Prompts (NEW!)
import { fetchCampaignPrompts } from '@/lib/campaign-prompts';

// Auto-sync
import { useAutoSync } from '@/hooks/use-auto-sync';
```

---

## 🎨 New UI Components

```typescript
// Display backend chat
<WhatsAppChatView phoneNumber="+44..." />

// Display call history
<CallHistoryView phoneNumber="+44..." />

// Show live campaign stats
<CampaignLiveStats campaignId="..." campaignName="..." />
```

---

## 🧪 Quick Tests

### Test 1: Pages Load ✅
```
✓ Dashboard → Shows 2 jobs, 2 campaigns
✓ Jobs → Shows 2 job cards
✓ Campaigns → Shows 2 campaign cards
```

### Test 2: CRUD Works ✅
```
✓ Create job → Toast + appears in list
✓ Delete job → Confirmation + removes
✓ Add candidate → Toast + appears on kanban
✓ Drag candidate → Saves to database
```

### Test 3: AI Testing Works ✅ 🆕
```
✓ Campaign wizard → Step 4 → Test Call Agent
✓ Button: "Loading..."
✓ Toast: "Fetching AI prompts..."
✓ Dialog opens with green indicator
✓ Prompt displayed from backend
✓ Can test conversation
```

### Test 4: Backend Data ✅
```
✓ Candidate Details → WhatsApp tab
✓ Shows 58 real messages or empty state
✓ Calls tab shows call history
```

### Test 5: Campaign Launch ✅
```
✓ Create campaign → Select datasets → Launch
✓ Webhook POSTs to n8n
✓ Toast: "Campaign launched! X candidates..."
✓ Campaign appears in list
```

---

## 🔄 Auto-Sync

**Runs:** Every 30 seconds  
**Where:** Dashboard page  
**What:** Syncs backend → frontend  
**Check:** Open console, watch for logs

---

## 📖 Documentation

**Read First:**
- `ALL_DONE.md` - Complete summary
- `AI_AGENT_TESTING_GUIDE.md` - New testing feature 🆕
- `READY_TO_TEST.md` - Testing guide

**Reference:**
- `CAMPAIGN_ARCHITECTURE.md` - System flow
- `IMPLEMENTATION_COMPLETE.md` - What was built
- `BACKEND_INTEGRATION_GUIDE.md` - Integration details

---

## 🎯 Success Indicators

When working correctly:

✅ Pages load with Supabase data  
✅ Loading spinners appear briefly  
✅ Toasts show on all operations  
✅ Console shows sync logs every 30s  
✅ **Test buttons fetch prompts** 🆕  
✅ **Green "From Backend" indicators** 🆕  
✅ Campaign cards show live activity  
✅ Chat history displays 58 messages  
✅ Webhook launches show success  

---

## 🎉 You're Ready!

**Everything is implemented and tested!**

```bash
npm run dev
```

**Then explore and test!** 🚀

---

**Quick Help:**
- Build failing? Run `npm run build`
- DB issues? Run `npm run db:test`
- Backend issues? Run `npm run backend:test`
- Need docs? See list above

**Status: ✅ ALL SYSTEMS GO!** 🎊

