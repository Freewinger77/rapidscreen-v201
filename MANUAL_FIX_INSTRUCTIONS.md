# 🔧 MANUAL FIX REQUIRED - 2 Minutes

## ⚠️ API can't modify database schema - need manual SQL run

---

## 📋 **EXACT STEPS:**

### 1. Open Supabase Dashboard
Go to: **https://supabase.com/dashboard/project/jtdqqbswhhrrhckyuicp**

### 2. Click SQL Editor
In the left sidebar, click **SQL Editor**

### 3. Click "New query"
Top right corner, click **+ New query**

### 4. Copy & Paste This EXACT SQL:

```sql
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;

ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'draft', 'completed', 'stopped'));
```

### 5. Click RUN
Bottom right, click **RUN** (or press Cmd+Enter)

### 6. Should See:
```
Success. No rows returned
```

---

## ✅ **Then Test:**

Come back here and run:

```bash
npx tsx test-stop-campaign.ts 9b4501e3-1035-4f9e-b4e2-921d475594cd
```

**Should see:**
```
✅ Campaign stopped successfully!
```

---

## 🚀 **Then in Browser:**

1. Hard refresh: **Cmd+Shift+R**
2. Go to campaign  
3. Click "Stop Campaign"
4. **WORKS!** ✅

---

**Takes 2 minutes - DO IT NOW!** 🔧✨

