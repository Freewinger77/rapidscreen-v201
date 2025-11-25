# 🔄 Component Update Guide for Supabase Storage

## Overview

This guide shows how to update your React components to use Supabase instead of localStorage.

## Key Changes

### 1. **All Operations Are Now Async**

```typescript
// ❌ OLD (localStorage - synchronous)
const jobs = loadJobs([]);

// ✅ NEW (Supabase - async)
const jobs = await loadJobs();
```

### 2. **Import from New Location**

```typescript
// ❌ OLD
import { loadJobs, updateJob } from '@/polymet/data/storage-manager';

// ✅ NEW
import { loadJobs, updateJob } from '@/lib/supabase-storage';
```

### 3. **Error Handling Required**

```typescript
// ✅ Always wrap in try/catch
try {
  const jobs = await loadJobs();
  setJobs(jobs);
} catch (error) {
  console.error('Failed to load jobs:', error);
  toast.error('Failed to load jobs');
}
```

## Component Update Patterns

### Pattern 1: Loading Data (useEffect)

**Before (localStorage):**
```typescript
import { loadJobs } from '@/polymet/data/storage-manager';

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  
  useEffect(() => {
    const loadedJobs = loadJobs(jobsData);
    setJobs(loadedJobs);
  }, []);
  
  // ...
}
```

**After (Supabase):**
```typescript
import { loadJobs } from '@/lib/supabase-storage';
import { toast } from 'sonner';

function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        setError(null);
        const loadedJobs = await loadJobs();
        setJobs(loadedJobs);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setError('Failed to load jobs');
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    }
    
    fetchJobs();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // ...
}
```

### Pattern 2: Creating New Records

**Before (localStorage):**
```typescript
import { addJob, loadJobs } from '@/polymet/data/storage-manager';

function handleCreateJob(jobData: Omit<Job, 'id'>) {
  const newJob: Job = {
    ...jobData,
    id: `job_${Date.now()}`,
    candidates: [],
  };
  
  addJob(newJob);
  const updatedJobs = loadJobs([]);
  setJobs(updatedJobs);
}
```

**After (Supabase):**
```typescript
import { addJob, loadJobs } from '@/lib/supabase-storage';
import { toast } from 'sonner';

async function handleCreateJob(jobData: Omit<Job, 'id' | 'candidates'>) {
  try {
    const newJobId = await addJob({
      ...jobData,
      candidates: [],
    });
    
    // Reload jobs to get fresh data
    const updatedJobs = await loadJobs();
    setJobs(updatedJobs);
    
    toast.success('Job created successfully');
    return newJobId;
  } catch (error) {
    console.error('Failed to create job:', error);
    toast.error('Failed to create job');
    throw error;
  }
}
```

### Pattern 3: Updating Records

**Before (localStorage):**
```typescript
import { updateJob, loadJobs } from '@/polymet/data/storage-manager';

function handleUpdateJob(jobId: string, updates: Partial<Job>) {
  updateJob(jobId, updates);
  const updatedJobs = loadJobs([]);
  setJobs(updatedJobs);
}
```

**After (Supabase):**
```typescript
import { updateJob, loadJobs } from '@/lib/supabase-storage';
import { toast } from 'sonner';

async function handleUpdateJob(jobId: string, updates: Partial<Job>) {
  try {
    await updateJob(jobId, updates);
    
    // Reload jobs to get fresh data
    const updatedJobs = await loadJobs();
    setJobs(updatedJobs);
    
    toast.success('Job updated successfully');
  } catch (error) {
    console.error('Failed to update job:', error);
    toast.error('Failed to update job');
    throw error;
  }
}
```

### Pattern 4: Deleting Records

**Before (localStorage):**
```typescript
import { deleteJob, loadJobs } from '@/polymet/data/storage-manager';

function handleDeleteJob(jobId: string) {
  deleteJob(jobId);
  const updatedJobs = loadJobs([]);
  setJobs(updatedJobs);
}
```

**After (Supabase):**
```typescript
import { deleteJob, loadJobs } from '@/lib/supabase-storage';
import { toast } from 'sonner';

async function handleDeleteJob(jobId: string) {
  try {
    await deleteJob(jobId);
    
    // Reload jobs to get fresh data
    const updatedJobs = await loadJobs();
    setJobs(updatedJobs);
    
    toast.success('Job deleted successfully');
  } catch (error) {
    console.error('Failed to delete job:', error);
    toast.error('Failed to delete job');
    throw error;
  }
}
```

### Pattern 5: Nested Data (Candidates, Notes)

**Before (localStorage):**
```typescript
import { addCandidateToJob, loadJobs } from '@/polymet/data/storage-manager';

function handleAddCandidate(jobId: string, candidate: Omit<Candidate, 'id'>) {
  const newCandidate: Candidate = {
    ...candidate,
    id: `c_${Date.now()}`,
    notes: [],
  };
  
  addCandidateToJob(jobId, newCandidate);
  const updatedJobs = loadJobs([]);
  setJobs(updatedJobs);
}
```

**After (Supabase):**
```typescript
import { addCandidateToJob, loadJobs } from '@/lib/supabase-storage';
import { toast } from 'sonner';

async function handleAddCandidate(
  jobId: string, 
  candidate: Omit<Candidate, 'id' | 'notes'>
) {
  try {
    const newCandidateId = await addCandidateToJob(jobId, {
      ...candidate,
      notes: [],
    });
    
    // Reload jobs to get fresh data with nested candidates
    const updatedJobs = await loadJobs();
    setJobs(updatedJobs);
    
    toast.success('Candidate added successfully');
    return newCandidateId;
  } catch (error) {
    console.error('Failed to add candidate:', error);
    toast.error('Failed to add candidate');
    throw error;
  }
}
```

## Full Component Examples

### Example 1: Jobs Page

```typescript
import { useEffect, useState } from 'react';
import { loadJobs, addJob, updateJob, deleteJob } from '@/lib/supabase-storage';
import type { Job } from '@/polymet/data/jobs-data';
import { toast } from 'sonner';

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, []);

  async function fetchJobs() {
    try {
      setLoading(true);
      setError(null);
      const data = await loadJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
      setError('Failed to load jobs');
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateJob(jobData: Omit<Job, 'id' | 'candidates'>) {
    try {
      await addJob({
        ...jobData,
        candidates: [],
      });
      await fetchJobs(); // Reload
      toast.success('Job created successfully');
    } catch (error) {
      console.error('Failed to create job:', error);
      toast.error('Failed to create job');
    }
  }

  async function handleUpdateJob(jobId: string, updates: Partial<Job>) {
    try {
      await updateJob(jobId, updates);
      await fetchJobs(); // Reload
      toast.success('Job updated successfully');
    } catch (error) {
      console.error('Failed to update job:', error);
      toast.error('Failed to update job');
    }
  }

  async function handleDeleteJob(jobId: string) {
    try {
      await deleteJob(jobId);
      await fetchJobs(); // Reload
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Failed to delete job:', error);
      toast.error('Failed to delete job');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">
          <p>{error}</p>
          <button 
            onClick={fetchJobs}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Jobs</h1>
      {/* Your job list UI */}
    </div>
  );
}
```

### Example 2: Job Details with Candidates

```typescript
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
  loadJobs, 
  addCandidateToJob, 
  updateCandidate,
  deleteCandidateFromJob 
} from '@/lib/supabase-storage';
import type { Job, Candidate } from '@/polymet/data/jobs-data';
import { toast } from 'sonner';

export function JobDetailsPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  async function fetchJob() {
    try {
      setLoading(true);
      const jobs = await loadJobs();
      const foundJob = jobs.find(j => j.id === jobId);
      setJob(foundJob || null);
    } catch (error) {
      console.error('Failed to load job:', error);
      toast.error('Failed to load job');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCandidate(candidateData: Omit<Candidate, 'id' | 'notes'>) {
    if (!jobId) return;
    
    try {
      await addCandidateToJob(jobId, {
        ...candidateData,
        notes: [],
      });
      await fetchJob(); // Reload to get updated candidates
      toast.success('Candidate added successfully');
    } catch (error) {
      console.error('Failed to add candidate:', error);
      toast.error('Failed to add candidate');
    }
  }

  async function handleUpdateCandidate(
    candidateId: string, 
    updates: Partial<Candidate>
  ) {
    if (!jobId) return;
    
    try {
      await updateCandidate(jobId, candidateId, updates);
      await fetchJob(); // Reload
      toast.success('Candidate updated successfully');
    } catch (error) {
      console.error('Failed to update candidate:', error);
      toast.error('Failed to update candidate');
    }
  }

  async function handleDeleteCandidate(candidateId: string) {
    if (!jobId) return;
    
    try {
      await deleteCandidateFromJob(jobId, candidateId);
      await fetchJob(); // Reload
      toast.success('Candidate deleted successfully');
    } catch (error) {
      console.error('Failed to delete candidate:', error);
      toast.error('Failed to delete candidate');
    }
  }

  if (loading) return <div>Loading...</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div>
      <h1>{job.title}</h1>
      {/* Your job details and candidates UI */}
    </div>
  );
}
```

### Example 3: Campaign with Nested Data

```typescript
import { useEffect, useState } from 'react';
import { 
  loadCampaigns, 
  addCampaignCandidate,
  updateCampaignCandidate 
} from '@/lib/supabase-storage';
import type { Campaign, CampaignCandidate } from '@/polymet/data/campaigns-data';
import { toast } from 'sonner';

export function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      setLoading(true);
      const data = await loadCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast.error('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddCandidateToCampaign(
    campaignId: string,
    candidateData: Omit<CampaignCandidate, 'id' | 'calls' | 'whatsappMessages' | 'notes'>
  ) {
    try {
      await addCampaignCandidate(campaignId, {
        ...candidateData,
        calls: [],
        whatsappMessages: [],
        notes: [],
      });
      await fetchCampaigns(); // Reload
      toast.success('Candidate added to campaign');
    } catch (error) {
      console.error('Failed to add candidate:', error);
      toast.error('Failed to add candidate');
    }
  }

  async function handleUpdateCampaignCandidate(
    campaignId: string,
    candidateId: string,
    updates: Partial<CampaignCandidate>
  ) {
    try {
      await updateCampaignCandidate(campaignId, candidateId, updates);
      await fetchCampaigns(); // Reload
      toast.success('Candidate updated');
    } catch (error) {
      console.error('Failed to update candidate:', error);
      toast.error('Failed to update candidate');
    }
  }

  if (loading) return <div>Loading campaigns...</div>;

  return (
    <div>
      <h1>Campaigns</h1>
      {/* Your campaigns UI */}
    </div>
  );
}
```

## Loading States Best Practices

### 1. **Component-Level Loading**

```typescript
function MyComponent() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return <div>{/* content */}</div>;
}
```

### 2. **Skeleton Loaders**

```typescript
import { Skeleton } from '@/components/ui/skeleton';

function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    );
  }
  
  return <div>{/* actual jobs */}</div>;
}
```

### 3. **Optimistic Updates**

```typescript
async function handleUpdateJob(jobId: string, updates: Partial<Job>) {
  // Optimistically update UI
  setJobs(prev => prev.map(j => 
    j.id === jobId ? { ...j, ...updates } : j
  ));
  
  try {
    // Then sync with database
    await updateJob(jobId, updates);
    toast.success('Job updated');
  } catch (error) {
    // Revert on error
    await fetchJobs();
    toast.error('Failed to update job');
  }
}
```

## Error Handling Strategies

### 1. **Component-Level Errors**

```typescript
function MyComponent() {
  const [error, setError] = useState<string | null>(null);
  
  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }
  
  return <div>{/* content */}</div>;
}
```

### 2. **Toast Notifications**

```typescript
import { toast } from 'sonner';

async function saveData() {
  try {
    await updateJob(jobId, data);
    toast.success('Saved successfully');
  } catch (error) {
    toast.error('Failed to save');
  }
}
```

### 3. **Error Boundary**

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => console.error('Error:', error)}
    >
      <YourApp />
    </ErrorBoundary>
  );
}
```

## Migration Checklist

For each page/component:

- [ ] Import from `@/lib/supabase-storage` instead of `@/polymet/data/storage-manager`
- [ ] Add `async` to functions that use storage
- [ ] Add `await` before storage function calls
- [ ] Add loading state
- [ ] Add error handling (try/catch)
- [ ] Add error state display
- [ ] Add loading UI (spinner/skeleton)
- [ ] Add success/error toasts
- [ ] Test create operations
- [ ] Test read operations
- [ ] Test update operations
- [ ] Test delete operations
- [ ] Test nested data operations

## Files to Update

Based on your project structure, update these files:

### Pages
- `src/polymet/pages/jobs.tsx`
- `src/polymet/pages/job-details.tsx`
- `src/polymet/pages/campaigns.tsx`
- `src/polymet/pages/campaign-details.tsx`
- `src/polymet/pages/datasets.tsx`
- `src/polymet/pages/dashboard.tsx`

### Components
- `src/polymet/components/job-creation-dialog.tsx`
- `src/polymet/components/job-editor-dialog.tsx`
- `src/polymet/components/campaign-wizard.tsx`
- `src/polymet/components/campaign-editor-dialog.tsx`
- `src/polymet/components/candidates-table.tsx`
- `src/polymet/components/kanban-board.tsx`
- `src/polymet/components/csv-upload-dialog.tsx`
- Any other components that use storage functions

## Testing Strategy

1. **Start with read-only pages** (dashboard, lists)
2. **Then update create operations** (dialogs, forms)
3. **Then update operations** (edit dialogs)
4. **Finally delete operations** (delete buttons)
5. **Test each page thoroughly** before moving to next

## Summary

The main changes are:
1. **Async/await everywhere** - All storage operations are now async
2. **Error handling** - Wrap in try/catch and show user feedback
3. **Loading states** - Show spinners/skeletons while loading
4. **Import changes** - Use new supabase-storage module

Take it one component at a time, test thoroughly, and you'll have a fully database-backed application!

