# 🚀 Database Setup Guide

## Step 1: Create .env File

Create a `.env` file in the root directory with your database connection:

```bash
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:rapidscreen123@db.suawkwvaevvucyeupdnr.supabase.co:5432/postgres
```

## Step 2: Verify Installation

The following packages have been installed:
- ✅ `postgres` - PostgreSQL client for Node.js

## Step 3: Database Connection

The database connection is set up in `/src/lib/db.ts`:

```typescript
import sql from '@/lib/db';

// Example usage:
const jobs = await sql`SELECT * FROM jobs`;
```

## Step 4: Test Connection

Create a test file to verify the connection works:

```typescript
// test-db.ts
import sql from './src/lib/db';

async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connected:', result);
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
}

testConnection();
```

## Database Schema

Your database has been created with the following tables:

### Core Tables
- `jobs` - Job postings
- `kanban_columns` - Dynamic Kanban columns per job
- `candidates` - Job candidates on Kanban board
- `candidate_notes` - Timeline notes for candidates

### Campaign Tables
- `campaigns` - Outreach campaigns
- `campaign_targets` - Campaign goals/metrics
- `campaign_matrices` - Message templates/scripts
- `campaign_candidates` - Candidates in campaigns
- `call_records` - Phone call records
- `call_transcript_messages` - Call transcripts
- `whatsapp_messages` - WhatsApp conversations
- `campaign_candidate_notes` - Campaign candidate notes

### Dataset Tables
- `datasets` - Candidate databases
- `dataset_candidates` - Candidates in datasets

### Helper Views
- `candidates_with_columns` - Candidates with column info
- `campaign_candidates_with_stats` - Campaign candidates with stats
- `campaign_summary_stats` - Campaign aggregate statistics

## Usage Examples

### Fetch Jobs
```typescript
import sql from '@/lib/db';

const jobs = await sql`
  SELECT * FROM jobs 
  ORDER BY created_at DESC
`;
```

### Fetch Candidates with Kanban Columns
```typescript
const candidates = await sql`
  SELECT * FROM candidates_with_columns
  WHERE job_id = ${jobId}
  ORDER BY position ASC
`;
```

### Create a New Job (auto-creates default Kanban columns)
```typescript
const [newJob] = await sql`
  INSERT INTO jobs (title, company, location, employment_type, salary_range, open_positions, target, description, tags)
  VALUES (${title}, ${company}, ${location}, ${employmentType}, ${salaryRange}, ${openPositions}, ${target}, ${description}, ${tags})
  RETURNING *
`;
```

### Move Candidate Between Columns
```typescript
await sql`
  UPDATE candidates 
  SET status = ${newStatus}, position = ${newPosition}
  WHERE id = ${candidateId}
`;
```

### Add Note to Candidate
```typescript
await sql`
  INSERT INTO candidate_notes (candidate_id, text, author, action_type, action_date)
  VALUES (${candidateId}, ${noteText}, ${author}, ${actionType}, ${actionDate})
`;
```

## Environment Variables in Vite

Vite exposes environment variables prefixed with `VITE_` by default. However, since we're using `DATABASE_URL` directly in the backend, make sure you're importing it correctly:

```typescript
// Use import.meta.env in Vite
const connectionString = import.meta.env.DATABASE_URL;
```

## Security Notes

⚠️ **Important**: Never commit your `.env` file to version control!

The `.gitignore` file has been updated to exclude:
- `.env`
- `.env.local`
- `.env.*.local`

## Next Steps

1. ✅ Install postgres package - DONE
2. ✅ Create database connection file - DONE
3. ✅ Set up TypeScript types - DONE
4. 🔄 Create .env file with your credentials - **YOU NEED TO DO THIS**
5. 🔄 Test the connection
6. 🔄 Migrate data from localStorage to Supabase
7. 🔄 Update your components to use SQL queries

## Troubleshooting

### Connection Issues
If you get connection errors, check:
- Is the `.env` file in the root directory?
- Is `DATABASE_URL` correctly formatted?
- Is your Supabase project running?
- Are you on the correct network (some networks block database connections)?

### Type Errors
- Make sure to use `import.meta.env` instead of `process.env` in Vite
- TypeScript types are available in `/src/lib/database-types.ts`

## Support

For more information:
- [Postgres.js Documentation](https://github.com/porsager/postgres)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

