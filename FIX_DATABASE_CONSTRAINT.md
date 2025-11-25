# 🔧 FIX: Add 'stopped' Status to Database

## ❌ Problem:
Database constraint doesn't allow `'stopped'` as a campaign status.

**Error:**
```
new row for relation "campaigns" violates check constraint "campaigns_status_check"
```

---

## ✅ SOLUTION: Run This SQL

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/jtdqqbswhhrrhckyuicp
2. Click **SQL Editor** in left sidebar
3. Click **New query**

### Step 2: Copy and Paste This SQL

```sql
-- Add 'stopped' to allowed campaign status values

-- Drop the existing constraint
ALTER TABLE campaigns 
DROP CONSTRAINT IF EXISTS campaigns_status_check;

-- Add new constraint with 'stopped' included
ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_status_check 
CHECK (status IN ('active', 'draft', 'completed', 'stopped'));
```

### Step 3: Run It

1. Click **Run** (or press Cmd/Ctrl + Enter)
2. **See:** "Success. No rows returned"

---

## 🧪 Test It Works

After running the SQL, test by running:

```bash
npx tsx test-stop-campaign.ts 9b4501e3-1035-4f9e-b4e2-921d475594cd
```

**Expected output:**
```
✅ After: { id: '...', name: 'ad', status: 'stopped' }
✅ Campaign stopped successfully!
```

---

## 🚀 Then Test in App

1. Refresh your browser: Cmd+Shift+R
2. Go to campaign
3. Click "Stop Campaign"
4. **Should work!** ✅

---

## 📋 What This Does

**Before:**
- Allowed statuses: `'active'`, `'draft'`, `'completed'`

**After:**
- Allowed statuses: `'active'`, `'draft'`, `'completed'`, `'stopped'`

---

## ⚠️ Important Notes

- This is a **one-time database migration**
- Safe to run (just adds 'stopped' option)
- Doesn't change any existing data
- Required for stop campaign feature to work

---

**RUN THE SQL NOW TO FIX!** 🔧✨

