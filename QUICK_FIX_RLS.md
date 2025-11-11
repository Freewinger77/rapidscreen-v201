# 🚀 Quick Fix - Disable RLS for Migration

## The Problem
Row Level Security (RLS) is blocking data inserts with the anon key.

## ✅ Quick Solution (3 steps, 2 minutes)

### Step 1: Disable RLS

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Click your project
3. Go to **SQL Editor** (left sidebar)
4. Click **"+ New query"**
5. Copy ALL the content from `disable-rls-for-migration.sql`
6. Paste into SQL Editor
7. Click **Run** (or press Cmd+Enter)
8. You should see: ✅ Success message

### Step 2: Run Migration

```bash
npm run db:migrate
```

You should see:
```
🎉 MIGRATION COMPLETE!

📊 Summary:
   Jobs:                2
   Job Candidates:      13
   Candidate Notes:     11
   Campaigns:           2
   Campaign Candidates: 60
   Call Records:        1
   WhatsApp Messages:   3
   Datasets:            3
   Dataset Candidates:  21
```

### Step 3: Re-Enable RLS

1. Go back to **Supabase SQL Editor**
2. Click **"+ New query"**
3. Copy ALL the content from `enable-rls-after-migration.sql`
4. Paste into SQL Editor
5. Click **Run**
6. You should see: ✅ RLS re-enabled

---

## 🎯 That's It!

Your data is now in Supabase and RLS is back on for security! 🎉

---

## 📋 Quick Reference

**Files to use:**
1. `disable-rls-for-migration.sql` - Run BEFORE migration
2. `enable-rls-after-migration.sql` - Run AFTER migration

**Command:**
```bash
npm run db:migrate
```

---

## ⚠️ Why This Works

- **Anon key**: Limited permissions (for client apps)
- **RLS disabled**: Allows inserts temporarily
- **RLS re-enabled**: Restores security after migration

---

**You're literally 2 minutes away from having all your data in Supabase! 💪**

