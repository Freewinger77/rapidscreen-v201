# 🚀 LocalStorage to Supabase Migration Guide

## Overview

This guide explains how to migrate your data from localStorage to Supabase database.

## ✅ What Was Done

### 1. **Database Schema** (Already Exists)
   - 14 tables created in Supabase
   - All relationships and foreign keys configured
   - Automatic triggers for updated_at timestamps
   - Row Level Security (RLS) enabled
   - Location: `supabase.md`

### 2. **Migration Script Created**
   - Comprehensive migration from localStorage → Supabase
   - Handles all nested data (candidates, notes, calls, etc.)
   - Progress tracking and error handling
   - Location: `src/lib/migrate-to-supabase.ts`

### 3. **New Supabase Storage Manager**
   - Drop-in replacement for localStorage operations
   - Same API as `storage-manager.ts` but uses database
   - Async operations for all CRUD functions
   - Location: `src/lib/supabase-storage.ts`

## 📊 Data Architecture Mapping

### LocalStorage → Supabase

```
localStorage Key                  →  Supabase Tables
─────────────────────────────────────────────────────────
recruitment_app_jobs              →  jobs
  ├─ candidates[]                 →    candidates
  │  └─ notes[]                   →      candidate_notes
  └─ (auto-creates)               →    kanban_columns

recruitment_app_campaigns         →  campaigns
  ├─ targets[]                    →    campaign_targets
  ├─ matrices[]                   →    campaign_matrices
  └─ candidates[]                 →    campaign_candidates
     ├─ calls[]                   →      call_records
     │  └─ transcript[]           →        call_transcript_messages
     ├─ whatsappMessages[]        →      whatsapp_messages
     └─ notes[]                   →      campaign_candidate_notes

recruitment_app_datasets          →  datasets
  └─ candidates[]                 →    dataset_candidates
```

## 🔧 Prerequisites

### 1. Fix Supabase Connection

The current connection string points to:
```
db.suawkwvaevvucyeupdnr.supabase.co
```

**This needs to be verified!** The connection test failed with `ENOTFOUND`, which means:

#### Option A: Get Correct Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open your project
3. Navigate to **Settings** → **Database**
4. Copy the **Connection String** (URI format)
5. Update `.env` file:
   ```bash
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```

#### Option B: Create New Supabase Project

If the project doesn't exist:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **New Project**
3. Name it "RapidScreen" (or your choice)
4. Set a secure password
5. Wait 2-3 minutes for provisioning
6. Get connection string from Settings → Database
7. Update `.env` file with new connection string
8. Run the SQL schema:
   - Go to **SQL Editor** in Supabase dashboard
   - Copy contents from `/Users/arslan/Desktop/rapidscreen-v2/supabase.md`
   - Execute the SQL

### 2. Verify Connection

```bash
npm run db:test
```

**Expected output:**
```
🔌 Testing Supabase connection...

Test 1: Basic connection
✅ Connected! Server time: 2025-11-18T...

Test 2: Checking tables
✅ Found 14 tables:
   - jobs
   - candidates
   - campaigns
   ...

Test 3: Counting records
✅ Record counts:
   - Jobs: 0
   - Campaigns: 0
   - Datasets: 0

🎉 All tests passed! Your database is ready to use.
```

## 🚀 Running the Migration

### Step 1: Backup Current Data (Optional but Recommended)

```javascript
// In browser console (while app is running):
const backup = {
  jobs: localStorage.getItem('recruitment_app_jobs'),
  campaigns: localStorage.getItem('recruitment_app_campaigns'),
  datasets: localStorage.getItem('recruitment_app_datasets'),
  metadata: localStorage.getItem('recruitment_app_metadata')
};
console.log('Backup:', backup);
// Copy this output somewhere safe
```

### Step 2: Run Migration Script

```bash
npm run db:migrate
```

**What it does:**
1. Tests database connection
2. Loads all data from localStorage
3. Clears existing Supabase data (if any)
4. Migrates in order:
   - Jobs → Candidates → Candidate Notes
   - Campaigns → Targets → Matrices → Campaign Candidates → Calls → Transcripts → WhatsApp Messages → Notes
   - Datasets → Dataset Candidates
5. Shows progress for each entity type
6. Reports final statistics

**Example output:**
```
🚀 Starting migration from localStorage to Supabase...

🔌 Testing database connection...
✅ Database connection successful!

📥 Loading data from localStorage...
  Found: 2 jobs, 2 campaigns, 3 datasets

⚠️  This will clear existing data and migrate from localStorage.
Press Ctrl+C to cancel, or wait 3 seconds to continue...

🗑️  Clearing existing data...
✅ Existing data cleared

📋 Migrating Jobs...
  ✅ Migrated job: Site Engineer
  ✅ Migrated job: Project Manager

📢 Migrating Campaigns...
  ✅ Migrated campaign: Plumber - London

📦 Migrating Datasets...
  ✅ Migrated dataset: Steel Fixers - London
  ✅ Migrated dataset: Site Engineers - UK Wide
  ✅ Migrated dataset: Plumbers - South East

============================================================
🎉 MIGRATION COMPLETE!
============================================================

📊 Migration Status:
  jobs: 2/2 (100.0%)
  candidates: 13/13 (100.0%)
  candidateNotes: 11/11 (100.0%)
  campaigns: 2/2 (100.0%)
  campaignCandidates: 60/60 (100.0%)
  campaignTargets: 3/3 (100.0%)
  campaignMatrices: 8/8 (100.0%)
  callRecords: 1/1 (100.0%)
  whatsappMessages: 3/3 (100.0%)
  campaignNotes: 2/2 (100.0%)
  datasets: 3/3 (100.0%)
  datasetCandidates: 21/21 (100.0%)

✅ Total migrated: 125

🚀 Next steps:
1. Update your app to use Supabase instead of localStorage
2. Test the application with the migrated data
3. Remove localStorage dependencies when ready
```

### Step 3: Verify Migration

Check your Supabase dashboard:
1. Go to **Table Editor**
2. Verify data in tables:
   - `jobs` - should have your jobs
   - `candidates` - should have all candidates
   - `campaigns` - should have your campaigns
   - `datasets` - should have your datasets

Or run queries:
```bash
npm run db:test
```

## 🔄 Updating Your Application

### Option 1: Switch Entirely to Supabase (Recommended)

Update imports in your components from:
```typescript
import { loadJobs, updateJob, ... } from '@/polymet/data/storage-manager';
```

To:
```typescript
import { loadJobs, updateJob, ... } from '@/lib/supabase-storage';
```

**Key differences:**
- All functions are now `async` - you need to use `await`
- Returns Promises instead of synchronous values

**Example change:**
```typescript
// OLD (localStorage - synchronous)
const jobs = loadJobs([]);
setJobs(jobs);

// NEW (Supabase - asynchronous)
const jobs = await loadJobs();
setJobs(jobs);
```

### Option 2: Create Hybrid Storage Manager

You can update `storage-manager.ts` to use Supabase internally:

```typescript
// At the top of storage-manager.ts
import * as supabaseStorage from '@/lib/supabase-storage';

// Update functions to use Supabase
export async function loadJobs(defaultJobs: Job[]): Promise<Job[]> {
  return await supabaseStorage.loadJobs();
}
```

## 📝 Manual Migration (Alternative)

If you prefer to migrate specific data manually:

```typescript
// Load from localStorage
const jobs = JSON.parse(localStorage.getItem('recruitment_app_jobs') || '[]');

// Insert into Supabase
for (const job of jobs) {
  await addJob(job);
}
```

## ⚠️ Important Notes

### 1. **ID Changes**
- localStorage uses string IDs (e.g., "1", "2", "c1")
- Supabase uses UUIDs (e.g., "550e8400-e29b-41d4-a716-446655440000")
- The migration handles this automatically
- Any hardcoded ID references in your code will need updating

### 2. **Async/Await Required**
- All database operations are asynchronous
- Must use `async/await` or `.then()/.catch()`
- Update all components accordingly

### 3. **Error Handling**
- Database operations can fail (network, permissions, etc.)
- Always wrap in try/catch blocks:
  ```typescript
  try {
    const jobs = await loadJobs();
    setJobs(jobs);
  } catch (error) {
    console.error('Failed to load jobs:', error);
    toast.error('Failed to load jobs');
  }
  ```

### 4. **Row Level Security (RLS)**
- Currently set to allow all authenticated users
- You may want to customize RLS policies
- Go to Supabase Dashboard → Authentication → Policies

### 5. **Timestamps**
- Supabase uses PostgreSQL TIMESTAMPTZ
- Automatic `created_at` and `updated_at` fields
- No need to manage timestamps manually

## 🎯 Next Steps After Migration

1. **Test thoroughly** - Verify all CRUD operations work
2. **Update components** - Switch to async operations
3. **Add error handling** - Handle database failures gracefully
4. **Remove localStorage** - Once confident, remove old code
5. **Setup authentication** - Add proper user authentication
6. **Customize RLS** - Fine-tune security policies

## 🆘 Troubleshooting

### Migration fails with connection error
```
Error: getaddrinfo ENOTFOUND db.suawkwvaevvucyeupdnr.supabase.co
```
**Fix:** Update DATABASE_URL in `.env` with correct Supabase connection string

### Some data missing after migration
- Check migration output for failed items
- Look for error messages in console
- Verify data exists in localStorage before migration
- Run migration again (it clears and re-imports)

### App breaks after migration
- Ensure all storage function calls use `await`
- Check console for async/await errors
- Verify imports point to correct storage module

### Permission denied errors
- Check RLS policies in Supabase dashboard
- Ensure service role key is used for admin operations
- Or temporarily disable RLS for testing

## 📚 Files Created/Modified

### New Files
- `src/lib/migrate-to-supabase.ts` - Migration script
- `src/lib/supabase-storage.ts` - New storage manager
- `MIGRATION_GUIDE.md` - This guide

### Modified Files
- `package.json` - Added `db:migrate` script

### Existing Files (Already Created)
- `.env` - Database credentials
- `supabase.md` - Database schema
- `src/lib/db.ts` - Database connection
- `src/lib/database-types.ts` - TypeScript types
- `src/lib/db-helpers.ts` - Helper functions
- `test-db-connection.ts` - Connection test script

## ✅ Summary

You now have:
- ✅ Complete database schema in Supabase
- ✅ Migration script ready to use
- ✅ New Supabase-based storage manager
- ✅ Clear migration path forward

**To proceed:**
1. Fix Supabase connection string
2. Run `npm run db:test` to verify
3. Run `npm run db:migrate` to migrate data
4. Update components to use async storage functions
5. Test thoroughly

Need help? The migration script has detailed logging and error messages to guide you through any issues.

---

**Created:** November 18, 2025  
**Database Schema Version:** 1.0.0  
**Migration Script Version:** 1.0.0

