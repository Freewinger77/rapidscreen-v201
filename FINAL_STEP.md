# 🎯 FINAL STEP - Add Service Role Key

## ✅ What's Working

- ✅ Supabase client installed
- ✅ Connection successful
- ✅ Database tables ready
- ✅ Migration script ready

## 🔐 One More Thing Needed

The **service role key** to bypass Row Level Security for migrations.

---

## 📝 Quick Fix (2 minutes)

### Step 1: Get Service Role Key

1. Go to: **https://supabase.com/dashboard**
2. Click your project
3. Go to **Settings** → **API**
4. Scroll to **Project API keys**
5. Find **`service_role`** (secret key)
6. Click **Reveal** and **Copy**

### Step 2: Add to .env

Open `/Users/arslan/Desktop/rapidscreen-v2/.env` and add:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://suawkwvaevvucyeupdnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YXdrd3ZhZXZ2dWN5ZXVwZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTQzNzksImV4cCI6MjA3Nzc5MDM3OX0.1fTFP1PWNvOl2ajuFbx39hTxEDAMkgr0yh_XSpazfhU
VITE_SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE  ← ADD THIS LINE
```

### Step 3: Run Migration

```bash
npm run db:migrate
```

### Expected Output:

```
✅ Using service role key (RLS bypassed)

🚀 Starting data migration to Supabase...

Step 1: Testing database connection...
✅ Connected to database

Step 2: Migrating jobs...
  📋 Creating job: "Site Engineer"
     ✅ Job created with 10 candidates
  📋 Creating job: "Project Manager"
     ✅ Job created with 3 candidates

✅ Jobs migrated: 2 jobs, 13 candidates, 11 notes

Step 3: Migrating campaigns...
  📢 Creating campaign: "Plumber - London"
     ✅ Campaign created with 30 candidates
  📢 Creating campaign: "Plumber - London"
     ✅ Campaign created with 30 candidates

✅ Campaigns migrated: 2 campaigns, 60 candidates, 1 calls, 3 WhatsApp messages

Step 4: Migrating datasets...
  📊 Creating dataset: "Steel Fixers - London"
     ✅ Dataset created with 8 candidates
  📊 Creating dataset: "Site Engineers - UK Wide"
     ✅ Dataset created with 6 candidates
  📊 Creating dataset: "Plumbers - South East"
     ✅ Dataset created with 7 candidates

✅ Datasets migrated: 3 datasets, 21 candidates

═══════════════════════════════════════════════════════
🎉 MIGRATION COMPLETE!
═══════════════════════════════════════════════════════

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

✨ All data is now in Supabase!
```

---

## ⚠️ Security Note

The **service role key** bypasses ALL security rules. 

- ✅ **DO**: Use for migrations and admin tasks
- ❌ **DON'T**: Use in client-side code
- ❌ **DON'T**: Commit to git (already in .gitignore)

For your React app, always use the **anon key**!

---

## 🎉 After Migration

Once migration completes, you can:

1. ✅ Keep using anon key in your React app (it's already set up!)
2. ✅ Fetch data from database
3. ✅ Real-time updates
4. ✅ Persistent storage

---

**That's it! Just add the service role key and run the migration! 🚀**

