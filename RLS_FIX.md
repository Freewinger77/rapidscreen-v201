# 🔒 Row Level Security (RLS) Issue

## The Problem

The migration is being blocked by Row Level Security. The `VITE_SUPABASE_ANON_KEY` doesn't have permission to INSERT data.

## ✅ Solution: Use Service Role Key for Migration

### Step 1: Get Your Service Role Key

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Find the **service_role** key (NOT the anon key!)
5. Copy the **service_role secret** key

⚠️ **IMPORTANT**: The service role key bypasses RLS - keep it secret!

### Step 2: Add to .env

Add this line to your `.env` file:

```bash
VITE_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Your `.env` should look like:
```bash
VITE_SUPABASE_URL=https://suawkwvaevvucyeupdnr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  <-- ADD THIS
```

### Step 3: Run Migration Again

```bash
npm run db:migrate
```

---

## 🎯 Why This Happens

- **Anon Key**: For public/client-side access, respects RLS
- **Service Role Key**: For server/admin operations, bypasses RLS

For migrations and seeding data, we need the service role key!

---

## Alternative: Temporarily Disable RLS (Not Recommended)

If you can't find the service role key, you can temporarily disable RLS:

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this SQL:

```sql
-- Disable RLS temporarily
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_matrices DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidates DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcript_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidate_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE datasets DISABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_candidates DISABLE ROW LEVEL SECURITY;
```

3. Run migration: `npm run db:migrate`

4. Re-enable RLS after migration:

```sql
-- Re-enable RLS after migration
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_matrices ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcript_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_candidate_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_candidates ENABLE ROW LEVEL SECURITY;
```

---

**Recommended**: Use the service role key approach! ✅

