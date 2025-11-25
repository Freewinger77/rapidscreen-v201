# 🚀 Campaign Architecture & Flow

## 🎯 Complete System Understanding

Your RapidScreen system has a **sophisticated bidirectional architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
│  ┌────────────┐  ┌─────────────┐  ┌────────────┐          │
│  │   Jobs     │  │  Campaigns  │  │  Datasets  │          │
│  │   Page     │  │    Page     │  │    Page    │          │
│  └────────────┘  └─────────────┘  └────────────┘          │
│        │                │                 │                 │
│        └────────────────┴─────────────────┘                │
│                         │                                   │
│                         ▼                                   │
│              ┌──────────────────────┐                      │
│              │  Frontend Database   │                      │
│              │  (Static Management) │                      │
│              │  - Jobs              │                      │
│              │  - Campaigns Config  │                      │
│              │  - Candidate Pools   │                      │
│              └──────────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ 1. Launch Campaign
                         │    (POST webhook)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  WEBHOOK (n8n)                              │
│  https://n8n-rapid...azurewebsites.net/webhook/...         │
│                                                             │
│  Receives: campaign name, tasks, objectives, job desc      │
│  Creates: sessions, sends messages, initiates calls        │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ 2. Process Campaign
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               BACKEND DATABASE (Live)                       │
│  ┌──────────────┐  ┌─────────────┐  ┌───────────────┐    │
│  │ session_info │  │chat_history │  │  call_info    │    │
│  │ (objectives) │  │ (messages)  │  │ (transcripts) │    │
│  └──────────────┘  └─────────────┘  └───────────────┘    │
│                                                             │
│  Real-time tracking of:                                    │
│  - WhatsApp conversations                                  │
│  - Phone calls & transcripts                               │
│  - Objective completion                                    │
│  - Session status                                          │
└─────────────────────────────────────────────────────────────┘
                         │
                         │ 3. Sync Back to Frontend
                         │    (periodic polling)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND (Updated Display)                     │
│  - Kanban shows updated statuses                           │
│  - Campaign shows live stats                               │
│  - Chat history displayed                                  │
│  - Call logs visible                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📋 Step-by-Step Flow

### Step 1: Campaign Creation (Frontend)

**Location:** Campaign Wizard Component

**User Actions:**
1. Select a job from jobs page
2. Click "Create Campaign"
3. Define campaign details:
   - Campaign name (e.g., "Plumber - London")
   - Date range
   - Communication channels (WhatsApp, Call, Email)
4. Select dataset or candidates
5. Define matrices/targets (objectives):
   ```
   - Available to Work (boolean)
   - Interested (boolean)
   - Experience (string)
   - Location (string)
   ```
6. Click "Launch Campaign"

**Backend Actions:**
```typescript
// Generated payload
{
  campaign: "plumber-london_abc123xyz",  // name_UID
  tasks: [
    {
      session: "plumberlondon_447853723604",
      phone_number: "+447853723604"
    },
    // ... more candidates
  ],
  job_description: "Job Title: Plumber\nCompany: ...\nLocation: ...",
  objectives: {
    available_to_work: {
      type: "boolean",
      description: "Is the candidate available to work?"
    },
    interested: {
      type: "boolean",
      description: "Is the candidate interested?"
    },
    experience: {
      type: "string",
      description: "Years of experience"
    }
  }
}
```

**POST to:** `https://n8n-rapid-czbff9cnafhkhmhf.eastus-01.azurewebsites.net/webhook/session-created`

### Step 2: Backend Processing

**What happens in n8n/backend:**

1. **Session Creation**
   - Creates entries in `session_info` for each task
   - Creates entries in `numbers` linking phone → session
   - Creates entry in `campaign_info` with objectives template
   - Links sessions to campaign in `campaigns` table

2. **Campaign Execution**
   - Sends initial WhatsApp message to each candidate
   - Records messages in `chat_history`
   - Initiates calls if configured
   - Records calls in `call_info`

3. **Real-time Tracking**
   - As conversations happen:
     - `chat_history` fills with messages
     - `session_info.objectives` updates as data collected
     - `session_objective_events` tracks changes
   - As calls complete:
     - `call_info` stores transcripts
     - AI analysis extracts objectives
     - Updates `session_info.objectives`

### Step 3: Display in Frontend

**Jobs Page (Kanban Board):**

```typescript
// Component checks backend for updates
const liveStats = await getCampaignLiveStats(campaignId);

// Updates candidate cards with:
- 📱 Message count badge
- 📞 Call count badge  
- ✅ Objectives met indicators
- 🕒 Last activity timestamp
```

**Campaigns Page:**

```typescript
// Real-time stats from backend
<CampaignCard>
  <LiveStats>
    📊 Contacted: {liveStats.totalContacted}
    💬 Messages: {liveStats.messagesSent}
    📞 Calls: {liveStats.callsMade}
    ✅ Objectives:
      - Available: {liveStats.objectivesAchieved.available_to_work}
      - Interested: {liveStats.objectivesAchieved.interested}
  </LiveStats>
</CampaignCard>
```

**Candidate Detail Dialog:**

```typescript
<Tabs>
  <Tab label="Info">
    {/* Frontend data */}
  </Tab>
  
  <Tab label="WhatsApp Chat">
    <WhatsAppChatView phoneNumber={candidate.phone} />
    {/* Shows real chat_history from backend */}
  </Tab>
  
  <Tab label="Call History">
    <CallHistoryView phoneNumber={candidate.phone} />
    {/* Shows call_info with transcripts */}
  </Tab>
  
  <Tab label="Objectives">
    <ObjectiveProgress objectives={backendObjectives} />
    {/* Shows session_info.objectives */}
  </Tab>
</Tabs>
```

### Step 4: Sync Backend → Frontend

**Auto-sync mechanism:**

```typescript
// Runs every 30 seconds for active campaigns
setInterval(async () => {
  for (const campaign of activeCampaigns) {
    // Get backend data
    const sessions = await getSessionsByCampaign(campaign.name);
    
    for (const session of sessions) {
      const phoneNumber = await getPhoneNumber(session.session_id);
      const candidate = findCandidateByPhone(phoneNumber);
      
      // Update frontend based on backend objectives
      if (session.objectives.interested === true) {
        await updateCandidate(jobId, candidate.id, {
          status: 'interested'
        });
      }
      
      if (session.objectives.started_work === true) {
        await updateCandidate(jobId, candidate.id, {
          status: 'started-work'
        });
      }
    }
  }
}, 30000);
```

## 🗃️ Data Mapping

### Frontend Database → Webhook Payload

| Frontend | Webhook Field | Transform |
|----------|---------------|-----------|
| `campaign.name` | `campaign` | Add `_${uid}` suffix |
| `campaign.candidates` | `tasks[]` | Map to session + phone |
| `job.description + details` | `job_description` | Concatenate job info |
| `campaign.targets` | `objectives{}` | Convert to type + description |
| `campaign.matrices` | `objectives{}` | Add as objectives |

### Backend Database → Frontend Display

| Backend Table | Frontend Location | What Displays |
|---------------|-------------------|---------------|
| `chat_history.message` | Candidate Detail → Chat Tab | WhatsApp conversation |
| `call_info.transcript` | Candidate Detail → Calls Tab | Call transcript |
| `session_info.objectives` | Kanban Card | Status badges |
| `session_info.updated_at` | Campaign Page | Last activity time |
| `session_objective_events` | Candidate Timeline | Activity history |

### Backend Objectives → Frontend Status

```typescript
// Mapping logic
const statusMap = {
  'objectives.interested = true' → 'interested',
  'objectives.started_work = true' → 'started-work',
  'objectives.rejected = true' → 'rejected',
  'objectives.interview_scheduled = true' → 'interview',
  'any objective set' → 'contacted' (no longer not-contacted)
};
```

## 🔧 Implementation Files

### Created Files

1. **`src/lib/campaign-webhook.ts`**
   - `launchCampaign()` - POST to webhook
   - `buildJobDescription()` - Format job data
   - `convertMatricesToObjectives()` - Format objectives
   - `generateUID()` - Create unique campaign IDs

2. **`src/lib/backend-sync.ts`**
   - `syncCampaignToFrontend()` - Sync backend → frontend
   - `getCampaignLiveStats()` - Real-time statistics
   - `autoSync()` - Periodic auto-sync
   - `determineStatusFromObjectives()` - Status mapping

3. **`src/lib/backend-api.ts`** (Already created)
   - All backend data access functions

4. **`src/lib/backend-types.ts`** (Already created)
   - TypeScript types for backend schema

## 🎨 UI Components to Create/Update

### 1. Campaign Wizard (Update)

**Add webhook integration:**

```typescript
// When user clicks "Launch Campaign"
const handleLaunch = async () => {
  // Build payload
  const config = {
    campaignName: campaign.name,
    candidates: selectedCandidates,
    jobDescription: buildJobDescription(selectedJob),
    objectives: convertMatricesToObjectives(matrices, targets),
  };
  
  // Launch via webhook
  const result = await launchCampaign(config);
  
  if (result.success) {
    // Save campaign to frontend DB with full campaignId (including UID)
    await addCampaign({
      ...campaign,
      id: result.campaignId, // Store the campaign_uid
      status: 'active',
    });
    
    toast.success('Campaign launched!');
    router.push(`/campaigns/${result.campaignId}`);
  } else {
    toast.error(`Launch failed: ${result.error}`);
  }
};
```

### 2. Campaign Card (Update)

**Add live stats display:**

```typescript
function CampaignCard({ campaign }) {
  const [liveStats, setLiveStats] = useState(null);
  
  useEffect(() => {
    async function loadStats() {
      const stats = await getCampaignLiveStats(campaign.id);
      setLiveStats(stats);
    }
    
    loadStats();
    const interval = setInterval(loadStats, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [campaign.id]);
  
  return (
    <Card>
      <h3>{campaign.name}</h3>
      
      {liveStats && (
        <div className="live-stats">
          <Stat label="Contacted" value={liveStats.totalContacted} />
          <Stat label="Active" value={liveStats.activeConversations} />
          <Stat label="Messages" value={liveStats.messagesSent} />
          <Stat label="Calls" value={liveStats.callsMade} />
          
          <ObjectivesList objectives={liveStats.objectivesAchieved} />
        </div>
      )}
    </Card>
  );
}
```

### 3. Kanban Board (Update)

**Add sync button and auto-refresh:**

```typescript
function KanbanBoard({ jobId, candidates }) {
  const [syncing, setSyncing] = useState(false);
  
  const handleSync = async () => {
    setSyncing(true);
    try {
      // Find active campaigns for this job
      const campaigns = await loadCampaigns();
      const activeCampaigns = campaigns.filter(
        c => c.jobId === jobId && c.status === 'active'
      );
      
      // Sync each campaign
      for (const campaign of activeCampaigns) {
        await syncCampaignToFrontend(campaign.id, jobId, candidates);
      }
      
      // Reload candidates to show updates
      const jobs = await loadJobs();
      const job = jobs.find(j => j.id === jobId);
      setCandidates(job.candidates);
      
      toast.success('Synced with backend!');
    } catch (error) {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };
  
  return (
    <div>
      <Button onClick={handleSync} disabled={syncing}>
        {syncing ? 'Syncing...' : '🔄 Sync from Backend'}
      </Button>
      
      <KanbanColumns candidates={candidates} />
    </div>
  );
}
```

### 4. Auto-Sync Hook (New)

**Create a React hook for auto-syncing:**

```typescript
// src/hooks/use-auto-sync.ts
import { useEffect } from 'react';
import { autoSync } from '@/lib/backend-sync';
import { loadJobs, loadCampaigns } from '@/lib/supabase-storage';

export function useAutoSync(intervalMs: number = 30000) {
  useEffect(() => {
    async function sync() {
      try {
        const [jobs, campaigns] = await Promise.all([
          loadJobs(),
          loadCampaigns(),
        ]);
        
        const result = await autoSync(campaigns, jobs);
        
        if (result.candidatesUpdated > 0) {
          console.log(`Auto-sync updated ${result.candidatesUpdated} candidates`);
        }
      } catch (error) {
        console.error('Auto-sync failed:', error);
      }
    }
    
    // Run immediately
    sync();
    
    // Then periodically
    const interval = setInterval(sync, intervalMs);
    
    return () => clearInterval(interval);
  }, [intervalMs]);
}

// Usage in main App or Dashboard:
function Dashboard() {
  useAutoSync(30000); // Auto-sync every 30 seconds
  
  return <div>...</div>;
}
```

## 🎯 Critical Points

### 1. Campaign ID Format

- **Frontend displays:** "Plumber - London" (human-readable)
- **Stored in DB:** "plumber-london_abc123xyz" (with UID)
- **Querying backend:** Use base name without UID

```typescript
// When storing
const campaignId = `${name}_${uid}`; // plumber-london_abc123xyz

// When querying backend
const baseName = campaignId.split('_').slice(0, -1).join('_'); // plumber-london
```

### 2. Phone Number Matching

Backend and frontend must match phone numbers:

```typescript
// Normalize before comparing
const normalize = (phone: string) => phone.replace(/[^0-9]/g, '');

const match = normalize(frontendPhone) === normalize(backendPhone);
```

### 3. Objective Mapping

Define clear mappings between backend objectives and frontend statuses:

```typescript
// In campaign creation
const frontendTargets = ['Available to Work', 'Interested', 'Started Work'];

// Convert to backend format
const backendObjectives = {
  available_to_work: { type: 'boolean', description: '...' },
  interested: { type: 'boolean', description: '...' },
  started_work: { type: 'boolean', description: '...' },
};

// Reverse mapping for sync
const statusMapping = {
  interested: (obj) => obj.interested === true,
  'started-work': (obj) => obj.started_work === true,
  rejected: (obj) => obj.rejected === true,
};
```

### 4. Error Handling

Always handle webhook and sync failures gracefully:

```typescript
try {
  await launchCampaign(config);
} catch (error) {
  // Don't block user - save as draft and allow retry
  await addCampaign({ ...campaign, status: 'draft', error: error.message });
  toast.error('Launch failed - saved as draft. You can retry later.');
}
```

## 📝 Implementation Checklist

### Phase 1: Campaign Launch
- [ ] Update campaign wizard to collect all required data
- [ ] Integrate `launchCampaign()` webhook call
- [ ] Store campaign with full ID (including UID)
- [ ] Test webhook with real n8n endpoint
- [ ] Handle launch errors gracefully

### Phase 2: Backend Display
- [ ] Create `<WhatsAppChatView />` component
- [ ] Create `<CallHistoryView />` component
- [ ] Add tabs to candidate detail dialog
- [ ] Test with 58 real messages in backend

### Phase 3: Live Statistics
- [ ] Add `<CampaignLiveStats />` to campaign cards
- [ ] Show real-time message/call counts
- [ ] Display objective completion progress
- [ ] Auto-refresh every 30 seconds

### Phase 4: Sync Mechanism
- [ ] Implement sync button on kanban board
- [ ] Create `useAutoSync` hook
- [ ] Add to Dashboard or main layout
- [ ] Test status updates from backend → frontend

### Phase 5: Polish
- [ ] Loading states for all async operations
- [ ] Error handling and retry logic
- [ ] Refresh indicators
- [ ] Activity timestamps
- [ ] Success/error toasts

## 🚀 Testing Strategy

### 1. Test Webhook (Staging)

```typescript
// Test with single candidate first
const testConfig = {
  campaignName: 'test-campaign',
  candidates: [{ phone: '+447000000000', name: 'Test User' }],
  jobDescription: 'Test job',
  objectives: {
    test_objective: { type: 'boolean', description: 'Test' },
  },
};

const result = await launchCampaign(testConfig);
console.log('Launch result:', result);
```

### 2. Verify Backend Tables

```bash
npm run db:explore
# Check that campaign_info, session_info, numbers tables populated
```

### 3. Test Sync

```typescript
// Manually trigger sync
const result = await syncCampaignToFrontend(campaignId, jobId, candidates);
console.log('Sync result:', result);
```

### 4. Monitor Live Data

```typescript
// Watch for new messages
const messages = await getChatHistoryBySession(sessionId);
console.log(`${messages.length} messages`);

// Check every 5 seconds
setInterval(async () => {
  const stats = await getCampaignLiveStats(campaignId);
  console.log('Live stats:', stats);
}, 5000);
```

## 🎉 Summary

Your architecture is:
1. **Frontend** → Static management (jobs, campaigns, candidates)
2. **Webhook** → Campaign launch trigger
3. **Backend** → Real-time tracking (chats, calls, objectives)
4. **Sync** → Backend data flows back to frontend display

All the infrastructure is ready. Now implement the UI components that use these APIs!

---

**Next:** Update campaign wizard to integrate webhook launch ✨

