# 🛑 Campaign Stop/Pause Controls - How It Works

## ⚠️ Retell API Limitation:

**Retell does NOT support forcefully terminating in-progress calls.**

Once a call is ringing or connected, it MUST complete naturally.

---

## ✅ What I Built Instead:

### **Smart Stop System:**

When you click "Pause Batch" or "Stop All":

1. **Cancels PENDING calls** (not yet dialed)
   ```sql
   UPDATE retell_calls
   SET call_status = 'failed',
       error_message = 'Batch cancelled by user'
   WHERE call_status = 'pending';
   ```

2. **Marks batch as cancelled**
   ```sql
   UPDATE retell_batch_calls
   SET status = 'cancelled'
   WHERE id = batch_id;
   ```

3. **Prevents NEW calls** from being made

4. **In-progress calls complete naturally** (can't be stopped)

---

## 🎮 **Two Control Options:**

### **1. Pause Batch (Yellow Button)**
```
Action: Cancels remaining calls in current batch
Effect: 
  ✅ Pending calls → Cancelled
  🔄 In-progress calls → Complete naturally
  ❌ No new calls started
Result: Batch stops, can resume with new batch
```

### **2. Stop All (Red Button)**
```
Action: Stops ALL calling for the campaign
Effect:
  ✅ All batches → Cancelled
  ✅ All pending calls → Cancelled  
  🔄 In-progress calls → Complete naturally
  ✅ Campaign status → Paused
Result: Campaign calling completely stopped
```

---

## 📊 **What Happens:**

### **Scenario: 30 Candidates, 5 Concurrent**

```
Batch starts calling 30 candidates:

Chunk 1 (calls 1-5):  IN PROGRESS (ringing/connected)
Chunk 2 (calls 6-10): PENDING (not yet dialed)
Chunk 3 (calls 11-15): PENDING
Chunk 4 (calls 16-20): PENDING
Chunk 5 (calls 21-25): PENDING
Chunk 6 (calls 26-30): PENDING

You click "Pause Batch":
  ✅ Chunks 2-6 (25 calls) → CANCELLED
  🔄 Chunk 1 (5 calls) → COMPLETE NATURALLY
  
Result:
  - 5 calls finish
  - 25 calls cancelled
  - No more calls made
```

---

## 💻 **UI Controls:**

### **While Batch Running:**
```
┌──────────────────────────────────────┐
│  Call Progress: ███░░░ 60%           │
│                                      │
│  [Pause Batch] [Stop All] [Refresh] │
└──────────────────────────────────────┘
```

**Pause Batch:**
- Stops current batch
- Cancels pending calls
- Shows alert with details

**Stop All:**
- Stops ALL batches for this campaign
- Cancels ALL pending calls across batches
- Updates campaign status to 'paused'
- Requires confirmation

**Refresh:**
- Updates statistics
- Shows current progress

---

## 🔍 **Database Tracking:**

### **Batch Status:**
```sql
SELECT 
  id,
  status,  -- 'in_progress', 'completed', 'cancelled'
  total_candidates,
  completed_calls,
  failed_calls
FROM retell_batch_calls
WHERE campaign_id = 'your-campaign';
```

### **Individual Calls:**
```sql
SELECT 
  retell_call_id,
  call_status,  -- 'pending', 'in_progress', 'completed', 'failed'
  error_message,
  phone_number
FROM retell_calls
WHERE campaign_id = 'your-campaign'
AND call_status = 'failed'
AND error_message = 'Batch cancelled by user';
```

---

## 🎯 **How to Use:**

### **Pause Mid-Batch:**
```
1. Calls are running (progress bar at 40%)
2. Click "Pause Batch"
3. Pending calls cancelled
4. Current calls finish
5. No new calls started
6. To resume: Click "Launch Calls" again (starts fresh batch)
```

### **Stop Campaign Completely:**
```
1. Click "Stop All"
2. Confirm the dialog
3. ALL batches for campaign cancelled
4. Campaign status → 'paused'
5. All pending calls cancelled
6. To restart: Change campaign status to 'active', then launch
```

---

## ⚠️ **Important Limitations:**

### **CAN Stop:**
✅ Calls that haven't started yet (status: 'pending')
✅ Future batches
✅ The batch job itself

### **CANNOT Stop:**
❌ Calls already ringing (Retell limitation)
❌ Calls already connected (Retell limitation)
❌ Calls in-progress (they complete naturally)

**This is a Retell platform limitation, not our system!**

---

## 💡 **Workaround:**

For in-progress calls, the system:
1. Marks batch as cancelled
2. Prevents new calls
3. Lets active calls complete (1-5 min each)
4. Updates database when they finish
5. Shows accurate final stats

**Typical scenario:**
- 100 calls planned
- 5 in progress, 95 pending
- Click "Stop"
- 95 cancelled immediately ✅
- 5 complete in ~5 minutes 🔄
- Total: 5 completed, 95 cancelled

---

## ✅ **What I Built:**

1. ✅ `cancelBatchCalls(batchId)` - Stops a specific batch
2. ✅ `stopCampaignCalling(campaignId)` - Stops ALL batches
3. ✅ UI buttons: "Pause Batch" and "Stop All"
4. ✅ Database updates for cancelled calls
5. ✅ Confirmation dialogs
6. ✅ Status tracking

---

**Try it: Launch calls, then click "Pause Batch" - pending calls will be cancelled!** 🛑

