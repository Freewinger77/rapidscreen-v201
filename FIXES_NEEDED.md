# 🔧 Fixes Needed - Quick Guide

## ⚠️ Issue 1: Backend 401 Errors (CRITICAL)

### Problem
Backend Supabase anon key is missing. You're using frontend key for both projects.

### Fix
Add backend anon key to `.env`:

```bash
# Get the backend project anon key:
# 1. Go to https://supabase.com/dashboard
# 2. Open project: xnscpftqbfmrobqhbbqu
# 3. Settings → API
# 4. Copy "anon" key (public)
# 5. Add to .env:

VITE_BACKEND_SUPABASE_ANON_KEY=eyJ... (backend project anon key)
```

**Current issue:** Using frontend key `jtdqqbswhhrrhckyuicp` for backend `xnscpftqbfmrobqhbbqu`

### Quick Fix (Temporary)
For now, the backend calls will just return empty arrays instead of crashing. But you need the correct key to see backend data!

---

## ⚠️ Issue 2: CSV Candidates Not Showing

### Problem
CSV upload likely succeeding but candidates not being inserted into database.

### Check
1. Open Supabase Dashboard
2. Go to Table Editor → `dataset_candidates` table
3. Check if rows exist

### Likely Issue
The `addDataset` function needs to handle candidates properly.

Let me check the CSV upload dialog...

---

## ⚠️ Issue 3: Active Campaigns Not Filtered

### Problem
Job details shows ALL active campaigns, not just for that job.

### Fix Coming
Will update Job Header to filter campaigns by job ID.

---

## ⚠️ Issue 4: Can't Test Existing Campaigns

### Problem
Test buttons only in campaign wizard, not in campaign details.

### Fix Coming
Will add test buttons to campaign details page.

---

## 🚀 Quick Actions

### 1. Fix Backend Access (Do This First!)
```bash
# Add to .env file:
VITE_BACKEND_SUPABASE_ANON_KEY=your_backend_anon_key_here
```

### 2. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 3. Test Again
- Campaigns should load faster
- No more 401 errors in console
- Backend data will work

---

Let me fix the other issues now...

