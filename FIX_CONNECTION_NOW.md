# 🚨 URGENT: Fix Database Connection

## The Issue
The hostname `db.suawkwvaevvucyeupdnr.supabase.co` cannot be reached.

This means either:
1. ❌ The project reference is incorrect
2. ❌ The project doesn't exist yet
3. ❌ The project is paused/inactive

---

## ✅ HOW TO FIX (5-MINUTE GUIDE)

### Step 1: Go to Supabase Dashboard
Open: **https://supabase.com/dashboard**

### Step 2A: If You Have an Existing Project

1. Click on your **RapidScreen** project (or whatever you named it)
2. Go to **Settings** (⚙️ icon on the left sidebar)
3. Click **Database** in the settings menu
4. Scroll to **Connection String** section
5. Click the **URI** tab (NOT "Transaction Pooler")
6. You'll see something like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```

7. **Copy this entire string**

### Step 2B: If You DON'T Have a Project Yet

1. Click **"+ New Project"** button
2. Fill in:
   - **Name**: RapidScreen (or any name)
   - **Database Password**: `rapidscreen123` (or choose your own)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (for now)
3. Click **Create new project**
4. ⏳ **WAIT 2-3 MINUTES** for project to provision
5. Once ready, follow **Step 2A** above to get connection string

### Step 3: Update Your .env File

Open: `/Users/arslan/Desktop/rapidscreen-v2/.env`

Replace the entire content with:
```bash
# Supabase Database Connection
DATABASE_URL=YOUR_COPIED_CONNECTION_STRING_HERE
```

**IMPORTANT**: Make sure to replace `[YOUR-PASSWORD]` with your actual password!

Example:
```bash
DATABASE_URL=postgresql://postgres:rapidscreen123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

### Step 4: Run SQL Schema (If New Project)

If you created a NEW project, you need to run the schema:

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"+ New query"**
3. Open the file: `/Users/arslan/Desktop/rapidscreen-v2/supabase.md`
4. Copy the entire SQL script from that file
5. Paste it into the SQL Editor
6. Click **Run** (or press Cmd+Enter)
7. Wait for "Success. No rows returned" message

### Step 5: Test Connection

```bash
npm run db:test
```

You should see:
```
✅ Connected! Server time: ...
✅ Found 14 tables
✅ Record counts ready
🎉 All tests passed!
```

### Step 6: Migrate Your Data

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

✨ All data is now in Supabase!
```

---

## 🎯 Quick Checklist

- [ ] Go to https://supabase.com/dashboard
- [ ] Find/create your RapidScreen project  
- [ ] Get the correct connection string from Settings → Database
- [ ] Update `.env` file with the correct string
- [ ] If new project: Run the SQL schema from `supabase.md`
- [ ] Run `npm run db:test`
- [ ] Run `npm run db:migrate`
- [ ] 🎉 Done!

---

## 🆘 Still Having Issues?

### Error: "password authentication failed"
→ Wrong password in connection string
→ Go to Supabase → Settings → Database → Reset database password

### Error: "relation 'jobs' does not exist"
→ You haven't run the SQL schema yet
→ Run the SQL from `supabase.md` in Supabase SQL Editor

### Error: "ENOTFOUND" (still)
→ Connection string is still wrong
→ Double-check you copied the correct string from Supabase
→ Make sure there are no extra spaces or line breaks

---

## 📱 Need Visual Guide?

1. Supabase Dashboard: https://supabase.com/dashboard
2. Click your project → Settings → Database → Connection String
3. Copy the URI
4. Update `.env`
5. Done!

---

**Once you fix the connection string, everything will work perfectly!** 💪

The migration script is already created and ready to go. Just need the correct Supabase URL! 🚀

