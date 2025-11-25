# 🔍 Backend Database Schema Analysis

## Overview

**Backend Database:** `https://xnscpftqbfmrobqhbbqu.supabase.co`  
**Purpose:** Tracks real-time campaign interactions, calls, and WhatsApp conversations

## 📊 Tables Summary

| Table | Rows | Purpose |
|-------|------|---------|
| `session_info` | 0 | Main session tracking (conversation state) |
| `chat_history` | 58 | WhatsApp message history |
| `call_info` | 0 | Call records with transcripts |
| `campaign_info` | 0 | Campaign configuration and templates |
| `campaigns` | 0 | Links sessions to campaigns |
| `numbers` | 0 | Phone numbers for sessions |
| `session_objective_events` | 0 | Tracks objective changes |
| `DEPRECATED` | 1 | Old data (ignore) |

## 🗂️ Detailed Table Structures

### 1. `session_info` (Core Session Tracking)

**Purpose:** Central table tracking each conversation/session with a candidate

```sql
session_id              text PRIMARY KEY
created_at              timestamp with time zone
updated_at              timestamp with time zone
user_updated            timestamp with time zone      -- Last user message time
agent_updated           timestamp with time zone      -- Last agent message time
last_action             text                          -- Last action taken
action_status           text                          -- Status of last action
session_status          text = 'active'               -- Session state
last_user_msg_at        timestamp with time zone
last_agent_msg_at       timestamp with time zone
last_outbound_at        timestamp with time zone
next_reminder_at        timestamp with time zone
reminder_count          integer = 0
tz                      text = 'Europe/London'
campaign                text -> campaign_info.campaign
objectives              jsonb                          -- Campaign objectives data
latest_batch_call_id    text
```

**Key Fields:**
- `session_id` - Unique identifier for each conversation
- `campaign` - Which campaign this session belongs to
- `objectives` - JSON data tracking campaign goals (available, interested, etc.)
- `session_status` - 'active', 'completed', etc.
- `last_user_msg_at` / `last_agent_msg_at` - Message timing

**Indexes:**
- `session_info_campaign_idx` - Fast campaign lookups
- `session_info_session_status_next_reminder_at_idx` - Reminder scheduling

### 2. `chat_history` (WhatsApp Messages)

**Purpose:** Stores all WhatsApp messages for each session

```sql
id                      integer PRIMARY KEY AUTO INCREMENT
session_id              varchar(255)
message                 jsonb                          -- Full message object
```

**Message JSONB Structure:**
```json
{
  "sender": "user" | "agent",
  "text": "message content",
  "timestamp": "ISO date string",
  "status": "sent" | "delivered" | "read"
}
```

**Data Available:** 58 messages currently in the database!

**Use Case:**
- Display chat history for a phone number
- Show conversation timeline
- Filter by sender (user/agent)

### 3. `call_info` (Phone Calls)

**Purpose:** Stores call records with transcripts and analysis

```sql
call_id                 text PRIMARY KEY
status                  text                           -- Call outcome
called_at               timestamp with time zone
duration                interval                       -- Call length
transcript              text                           -- Full transcript
recording_url           text                           -- Audio recording
analysis                jsonb                          -- AI analysis results
session_id              text -> session_info.session_id
batch_call_id           text
```

**Key Fields:**
- `call_id` - Unique call identifier
- `transcript` - Full conversation text
- `analysis` - JSONB with AI-extracted data
- `recording_url` - Link to call audio
- `session_id` - Links to conversation session

**Indexes:**
- `call_info_called_at_idx` - Sort by call time

### 4. `campaign_info` (Campaign Templates)

**Purpose:** Defines campaign configuration and templates

```sql
campaign                text PRIMARY KEY               -- Campaign name
job_info                text                           -- Job description
objectives_template     jsonb                          -- Objective definitions
prompt_chat             text                           -- WhatsApp AI prompt
prompt_call             text                           -- Call AI prompt
first_message_chat      text                           -- Initial WhatsApp message
first_message_call      text                           -- Call opening script
start                   timestamp with time zone
end                     timestamp with time zone
```

**Key Fields:**
- `campaign` - Campaign identifier (e.g., "Plumber - London")
- `objectives_template` - Defines what data to collect
- `prompt_chat` / `prompt_call` - AI agent instructions
- `first_message_chat` / `first_message_call` - Opening messages

**Use Case:**
- Display campaign configuration
- Show AI prompts and templates
- Track campaign date ranges

### 5. `campaigns` (Session-Campaign Links)

**Purpose:** Links sessions to campaigns

```sql
session_id              text -> session_info.session_id
campaign                text -> campaign_info.campaign
```

**Use Case:**
- Find all sessions for a campaign
- Get campaign details for a session

### 6. `numbers` (Phone Numbers)

**Purpose:** Associates phone numbers with sessions

```sql
session_id              text -> session_info.session_id
phone_number            text
```

**Use Case:**
- Get all conversations for a phone number
- Link phone numbers to sessions

### 7. `session_objective_events` (Objective Tracking)

**Purpose:** Tracks changes to session objectives over time

```sql
id                      bigint PRIMARY KEY AUTO INCREMENT
session_id              text -> session_info.session_id
objective               text                           -- Objective name
old_value               jsonb                          -- Previous value
new_value               jsonb                          -- New value
source                  text                           -- What caused change
occurred_at             timestamp with time zone
```

**Key Fields:**
- `objective` - Name of objective (e.g., "interested", "available_to_work")
- `old_value` / `new_value` - Value changes
- `source` - "call", "chat", "manual"
- `occurred_at` - When it changed

**Use Case:**
- Track objective progression
- Show timeline of candidate engagement
- Audit trail of data changes

## 🔗 Relationships

```
session_info (Central Hub)
    ├─> chat_history (1:many)         // All messages for session
    ├─> call_info (1:many)            // All calls for session
    ├─> numbers (1:1)                 // Phone number
    ├─> campaigns (1:1)               // Campaign link
    │   └─> campaign_info             // Campaign details
    └─> session_objective_events      // Objective changes
```

**Key Insight:** `session_id` is the central linking key for everything!

## 📱 Integration Use Cases

### Use Case 1: Display Chat History for Phone Number

**Flow:**
1. Get `session_id` from `numbers` table by `phone_number`
2. Query `chat_history` by `session_id`
3. Parse JSONB messages
4. Display in chat UI component

**Query:**
```typescript
// Get session for phone number
const [session] = await backendDb`
  SELECT session_id FROM numbers 
  WHERE phone_number = ${phoneNumber}
`;

// Get all messages
const messages = await backendDb`
  SELECT message, id
  FROM chat_history
  WHERE session_id = ${session.session_id}
  ORDER BY id ASC
`;

// Parse JSONB
const parsedMessages = messages.map(m => m.message);
```

### Use Case 2: Display Campaign Data

**Flow:**
1. Get campaign details from `campaign_info`
2. Get all sessions for campaign from `campaigns`
3. Aggregate statistics from `session_info`
4. Get related calls and messages

**Query:**
```typescript
// Get campaign details
const [campaign] = await backendDb`
  SELECT * FROM campaign_info
  WHERE campaign = ${campaignName}
`;

// Get all sessions for campaign
const sessions = await backendDb`
  SELECT si.*
  FROM session_info si
  WHERE si.campaign = ${campaignName}
`;

// Count statistics
const stats = {
  totalSessions: sessions.length,
  active: sessions.filter(s => s.session_status === 'active').length,
  // Extract from objectives JSONB
  interested: sessions.filter(s => s.objectives?.interested === true).length,
};
```

### Use Case 3: Display Call Data

**Flow:**
1. Get calls from `call_info` by `session_id`
2. Parse transcript and analysis
3. Display in call history UI

**Query:**
```typescript
// Get all calls for session
const calls = await backendDb`
  SELECT *
  FROM call_info
  WHERE session_id = ${sessionId}
  ORDER BY called_at DESC
`;

// Each call has:
// - transcript (text)
// - recording_url (string)
// - analysis (JSONB with extracted data)
// - duration (interval)
```

### Use Case 4: Show Candidate Profile with All Interactions

**Flow:**
1. Get session by phone number
2. Get session details with objectives
3. Get all chat messages
4. Get all calls
5. Get objective change timeline
6. Display complete profile

**Query:**
```typescript
// Get complete candidate data
const [phoneSession] = await backendDb`
  SELECT n.phone_number, si.*, ci.campaign as campaign_name, ci.job_info
  FROM numbers n
  JOIN session_info si ON si.session_id = n.session_id
  LEFT JOIN campaign_info ci ON ci.campaign = si.campaign
  WHERE n.phone_number = ${phoneNumber}
`;

// Get chat history
const chats = await backendDb`
  SELECT message FROM chat_history
  WHERE session_id = ${phoneSession.session_id}
  ORDER BY id ASC
`;

// Get calls
const calls = await backendDb`
  SELECT * FROM call_info
  WHERE session_id = ${phoneSession.session_id}
  ORDER BY called_at DESC
`;

// Get objective timeline
const objectiveHistory = await backendDb`
  SELECT * FROM session_objective_events
  WHERE session_id = ${phoneSession.session_id}
  ORDER BY occurred_at DESC
`;
```

## 🎯 Frontend Display Mapping

### Campaigns Page Enhancement
```
Frontend Campaign Card
├─ Name, Dates (from frontend DB)
├─ Real-time stats:
│  ├─ Active conversations (backend: session_info.session_status)
│  ├─ Messages sent (backend: count chat_history)
│  ├─ Calls made (backend: count call_info)
│  └─ Objectives met (backend: session_info.objectives)
└─ Latest activity (backend: latest message/call timestamps)
```

### Candidate Details Enhancement
```
Frontend Candidate Card
├─ Basic info (from frontend DB)
├─ Real-time interaction data:
│  ├─ WhatsApp chat history (backend: chat_history)
│  ├─ Call history with transcripts (backend: call_info)
│  ├─ Session status (backend: session_info.session_status)
│  ├─ Objectives progress (backend: session_info.objectives)
│  └─ Activity timeline (backend: all timestamps)
```

### New: Live Chat View
```
WhatsApp Chat Component
├─ Phone number input/select
├─ Fetch messages from backend.chat_history
├─ Display conversation (user/agent messages)
├─ Show timestamps and status
└─ Real-time updates (optional: Supabase realtime)
```

### New: Call Center View
```
Call History Component
├─ List all calls from backend.call_info
├─ Display call status and duration
├─ Show transcript
├─ Play recording (recording_url)
└─ Show AI analysis results
```

## 🔧 Implementation Strategy

### Phase 1: Backend Data Access Layer
Create `src/lib/backend-db.ts`:
- Connection to backend database
- Query helpers for each table
- Type definitions matching backend schema

### Phase 2: API Helpers
Create `src/lib/backend-api.ts`:
- `getChatHistory(phoneNumber)`
- `getSessionDetails(sessionId)`
- `getCampaignSessions(campaignName)`
- `getCallRecords(sessionId)`
- `getCandidateProfile(phoneNumber)`

### Phase 3: UI Components
- `<WhatsAppChatView />` - Display chat history
- `<CallHistoryView />` - Display call records
- `<CampaignLiveStats />` - Real-time campaign metrics
- `<CandidateTimeline />` - Complete interaction timeline

### Phase 4: Real-time Updates (Optional)
- Use Supabase Realtime subscriptions
- Auto-update when new messages arrive
- Live campaign statistics

## 📊 Data Flow Example

```
User clicks "View Chat" on candidate
         ↓
Frontend gets phone number (+447853723604)
         ↓
Query backend: numbers.phone_number → session_id
         ↓
Query backend: chat_history WHERE session_id
         ↓
Parse JSONB messages
         ↓
Display in WhatsApp-style chat UI
```

## 🚀 Next Steps

1. **Create Backend DB Connection**
   - Add to `src/lib/backend-db.ts`
   - Similar to frontend DB but points to backend

2. **Create API Helpers**
   - Functions to fetch chat history
   - Functions to get campaign data
   - Functions to get call records

3. **Update Components**
   - Add "View Chat" button to candidates
   - Add "Live Stats" to campaigns
   - Create new chat/call views

4. **Test Integration**
   - Use existing 58 messages in chat_history
   - Verify data displays correctly
   - Test with real phone numbers

## 💡 Key Insights

1. **session_id is Central** - All data links through session_id
2. **JSONB Fields** - objectives, message, analysis are flexible JSON
3. **58 Messages Ready** - Real data exists in chat_history!
4. **No Calls Yet** - call_info is empty (0 rows)
5. **Campaign Link** - Frontend campaigns can show backend activity
6. **Phone Number Key** - numbers table links phones to sessions

## 🔐 Security Notes

- Backend DB has different connection (pooler port 6543)
- Same anon keys work for both databases
- Use Row Level Security for production
- Consider API layer instead of direct DB access

---

**Created:** November 18, 2025  
**Backend Database:** xnscpftqbfmrobqhbbqu  
**Frontend Database:** jtdqqbswhhrrhckyuicp

