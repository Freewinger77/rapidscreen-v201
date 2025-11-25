# 🔌 Backend Integration Guide

## Overview

This guide shows how to integrate backend data (chat history, calls, live campaign stats) into your frontend components.

## ✅ What's Ready

- ✅ Backend database connection (`src/lib/backend-db.ts`)
- ✅ TypeScript types (`src/lib/backend-types.ts`)  
- ✅ API helper functions (`src/lib/backend-api.ts`)
- ✅ 58 messages in `chat_history` table ready to display!
- ✅ Schema documentation (`BACKEND_SCHEMA_ANALYSIS.md`)
- ✅ Test scripts working

## 📚 Available API Functions

### Chat History
```typescript
import { getChatHistoryByPhone, getChatHistoryBySession } from '@/lib/backend-api';

// Get messages for a phone number
const messages = await getChatHistoryByPhone('+447853723604');

// Get messages for a session
const messages = await getChatHistoryBySession('general_447835156367');
```

### Session Info
```typescript
import { getSessionByPhone, getSessionById } from '@/lib/backend-api';

// Get session by phone
const session = await getSessionByPhone('+447853723604');

// Get session by ID
const session = await getSessionById('general_447835156367');
```

### Calls
```typescript
import { getCallsByPhone, getCallsBySession } from '@/lib/backend-api';

// Get calls for a phone number
const calls = await getCallsByPhone('+447853723604');

// Get calls for a session
const calls = await getCallsBySession('general_447835156367');
```

### Campaign Data
```typescript
import { getCampaignInfo, getCampaignStats, getSessionsByCampaign } from '@/lib/backend-api';

// Get campaign configuration
const info = await getCampaignInfo('Plumber - London');

// Get real-time stats
const stats = await getCampaignStats('Plumber - London');
// Returns: { totalSessions, activeSessions, totalMessages, totalCalls, objectivesAchieved, ... }

// Get all sessions in a campaign
const sessions = await getSessionsByCampaign('Plumber - London');
```

### Complete Profiles
```typescript
import { getCandidateProfile, getLiveSessions } from '@/lib/backend-api';

// Get everything for a candidate
const profile = await getCandidateProfile('+447853723604');
// Returns: { phoneNumber, sessionId, sessionInfo, campaignInfo, chatHistory, callHistory, objectiveTimeline }

// Get active conversations
const live = await getLiveSessions(20);
```

## 🎨 UI Component Examples

### Example 1: WhatsApp Chat View

Create a new component to display chat history:

```typescript
// src/polymet/components/whatsapp-chat-view.tsx
import { useEffect, useState } from 'react';
import { getChatHistoryByPhone } from '@/lib/backend-api';
import type { ChatMessage } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface WhatsAppChatViewProps {
  phoneNumber: string;
}

export function WhatsAppChatView({ phoneNumber }: WhatsAppChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        const chatHistory = await getChatHistoryByPhone(phoneNumber);
        setMessages(chatHistory);
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMessages();
  }, [phoneNumber]);

  if (loading) {
    return <div>Loading chat history...</div>;
  }

  if (messages.length === 0) {
    return <div>No messages found for {phoneNumber}</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <div className="p-4 border-b">
        <h2 className="font-semibold">WhatsApp Chat</h2>
        <p className="text-sm text-muted-foreground">{phoneNumber}</p>
      </div>
      
      <ScrollArea className="h-[500px] p-4">
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <span className="text-xs opacity-70">
                  {new Date(msg.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
```

### Example 2: Add to Candidate Detail Dialog

Update your existing candidate detail to show chat history:

```typescript
// In src/polymet/components/candidate-detail-dialog.tsx

import { WhatsAppChatView } from './whatsapp-chat-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Inside your CandidateDetailDialog component:

<Tabs defaultValue="info">
  <TabsList>
    <TabsTrigger value="info">Info</TabsTrigger>
    <TabsTrigger value="notes">Notes</TabsTrigger>
    <TabsTrigger value="chat">WhatsApp Chat</TabsTrigger>
    <TabsTrigger value="calls">Calls</TabsTrigger>
  </TabsList>

  <TabsContent value="info">
    {/* Existing candidate info */}
  </TabsContent>

  <TabsContent value="notes">
    {/* Existing notes */}
  </TabsContent>

  <TabsContent value="chat">
    <WhatsAppChatView phoneNumber={candidate.phone} />
  </TabsContent>

  <TabsContent value="calls">
    <CallHistoryView phoneNumber={candidate.phone} />
  </TabsContent>
</Tabs>
```

### Example 3: Campaign Live Stats

Add real-time stats to campaign cards:

```typescript
// src/polymet/components/campaign-live-stats.tsx
import { useEffect, useState } from 'react';
import { getCampaignStats } from '@/lib/backend-api';
import type { BackendCampaignStats } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';

interface CampaignLiveStatsProps {
  campaignName: string;
}

export function CampaignLiveStats({ campaignName }: CampaignLiveStatsProps) {
  const [stats, setStats] = useState<BackendCampaignStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      try {
        const data = await getCampaignStats(campaignName);
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, [campaignName]);

  if (loading || !stats) {
    return <div>Loading stats...</div>;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4">Live Statistics</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
          <p className="text-sm text-muted-foreground">Total Contacts</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.activeSessions}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.totalMessages}</p>
          <p className="text-sm text-muted-foreground">Messages Sent</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{stats.totalCalls}</p>
          <p className="text-sm text-muted-foreground">Calls Made</p>
        </div>
      </div>
      
      {Object.keys(stats.objectivesAchieved).length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-medium mb-2">Objectives</p>
          <div className="space-y-1">
            {Object.entries(stats.objectivesAchieved).map(([key, count]) => (
              <div key={key} className="flex justify-between text-sm">
                <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
```

### Example 4: Call History View

Display call transcripts and recordings:

```typescript
// src/polymet/components/call-history-view.tsx
import { useEffect, useState } from 'react';
import { getCallsByPhone } from '@/lib/backend-api';
import type { CallInfo } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface CallHistoryViewProps {
  phoneNumber: string;
}

export function CallHistoryView({ phoneNumber }: CallHistoryViewProps) {
  const [calls, setCalls] = useState<CallInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCall, setSelectedCall] = useState<CallInfo | null>(null);

  useEffect(() => {
    async function loadCalls() {
      setLoading(true);
      try {
        const callHistory = await getCallsByPhone(phoneNumber);
        setCalls(callHistory);
      } catch (error) {
        console.error('Failed to load calls:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCalls();
  }, [phoneNumber]);

  if (loading) {
    return <div>Loading call history...</div>;
  }

  if (calls.length === 0) {
    return <div>No calls found for {phoneNumber}</div>;
  }

  return (
    <>
      <div className="space-y-4">
        {calls.map(call => (
          <Card key={call.call_id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{new Date(call.called_at).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  Duration: {call.duration || 'N/A'}
                </p>
                <p className="text-sm">Status: {call.status || 'N/A'}</p>
              </div>
              <div className="space-x-2">
                {call.transcript && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedCall(call)}
                  >
                    View Transcript
                  </Button>
                )}
                {call.recording_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(call.recording_url!, '_blank')}
                  >
                    Play Recording
                  </Button>
                )}
              </div>
            </div>
            
            {call.analysis && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">AI Analysis</p>
                <pre className="text-xs bg-muted p-2 rounded">
                  {JSON.stringify(call.analysis, null, 2)}
                </pre>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Transcript Dialog */}
      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Call Transcript</DialogTitle>
          </DialogHeader>
          {selectedCall && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedCall.called_at).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Duration: {selectedCall.duration}
                </p>
              </div>
              <div className="whitespace-pre-wrap bg-muted p-4 rounded">
                {selectedCall.transcript}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Example 5: Live Activity Dashboard

Create a dashboard showing all active conversations:

```typescript
// src/polymet/components/live-activity-dashboard.tsx
import { useEffect, useState } from 'react';
import { getLiveSessions } from '@/lib/backend-api';
import type { LiveSessionData } from '@/lib/backend-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function LiveActivityDashboard() {
  const [sessions, setSessions] = useState<LiveSessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      try {
        const data = await getLiveSessions(20);
        setSessions(data);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadSessions, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading active sessions...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Live Activity</h2>
      <p className="text-muted-foreground">
        {sessions.length} active conversations
      </p>

      <div className="grid gap-4">
        {sessions.map(session => (
          <Card key={session.sessionId} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{session.phoneNumber}</p>
                <p className="text-sm text-muted-foreground">{session.campaign}</p>
              </div>
              <Badge variant="outline">{session.status}</Badge>
            </div>
            
            <div className="mt-4 flex gap-4 text-sm">
              <span>💬 {session.messageCount} messages</span>
              <span>📞 {session.callCount} calls</span>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Last activity: {new Date(session.lastActivity).toLocaleString()}
            </div>
            
            {Object.keys(session.objectives).length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(session.objectives).map(([key, value]) => (
                    <Badge key={key} variant="secondary" className="text-xs">
                      {key}: {String(value)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## 🔄 Real-time Updates (Optional)

For real-time updates when new messages arrive, you can use Supabase Realtime:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_BACKEND_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Subscribe to new messages
const channel = supabase
  .channel('chat_updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_history',
      filter: `session_id=eq.${sessionId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
      // Update your state with the new message
    }
  )
  .subscribe();

// Cleanup
return () => {
  supabase.removeChannel(channel);
};
```

## 🎯 Implementation Checklist

### Phase 1: Basic Integration
- [ ] Create `WhatsAppChatView` component
- [ ] Add "View Chat" button to candidate cards
- [ ] Test with existing 58 messages
- [ ] Style chat bubbles (user vs agent)

### Phase 2: Campaign Stats
- [ ] Create `CampaignLiveStats` component
- [ ] Add to campaign cards/details
- [ ] Show real-time message/call counts
- [ ] Display objectives progress

### Phase 3: Call Integration
- [ ] Create `CallHistoryView` component
- [ ] Show call transcripts
- [ ] Add audio player for recordings
- [ ] Display AI analysis

### Phase 4: Live Dashboard
- [ ] Create `LiveActivityDashboard` component
- [ ] Show all active conversations
- [ ] Auto-refresh every 10-30 seconds
- [ ] Add filters (by campaign, status)

### Phase 5: Profile Integration
- [ ] Use `getCandidateProfile()` for complete view
- [ ] Show timeline of all interactions
- [ ] Combine frontend + backend data
- [ ] Add "Refresh" button

## 📝 Testing

```bash
# Test backend API functions
npm run backend:test

# Explore backend schema
npm run db:explore
```

## 🔐 Environment Variables

Make sure your `.env` has:
```bash
BACKEND_DATABASE_URL=postgresql://postgres.xnscpftqbfmrobqhbbqu:...
VITE_BACKEND_SUPABASE_URL=https://xnscpftqbfmrobqhbbqu.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (same for both DBs)
```

## 🎓 Key Concepts

1. **Two Databases**: Frontend (jobs, campaigns) + Backend (real-time interactions)
2. **session_id** is the linking key between phone numbers and all their data
3. **JSONB fields** (objectives, message, analysis) store flexible data
4. **58 messages** are currently available to display!
5. **Phone numbers** link to sessions via the `numbers` table

## 🚀 Next Steps

1. Start with `WhatsAppChatView` - simplest and has real data (58 messages!)
2. Add to existing candidate detail dialog
3. Test with a real phone number that has messages
4. Expand to other components gradually
5. Consider real-time subscriptions for live updates

---

**Ready to go!** All the infrastructure is in place. Just create the UI components and connect them to the API functions. 🎉

