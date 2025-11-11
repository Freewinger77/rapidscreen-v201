# 🤖 Retell AI Campaign Integration Plan

## Executive Summary
Integrate Retell AI voice agents to automatically call campaign candidates with dynamic questions from the campaign matrix, track calls, and store post-call analysis.

---

## 📊 Database Schema Updates

### 1. New Tables Needed

```sql
-- Store Retell agent configurations per campaign
CREATE TABLE campaign_retell_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  retell_agent_id TEXT NOT NULL, -- Retell's agent ID
  agent_name TEXT NOT NULL,
  base_prompt TEXT NOT NULL,
  dynamic_questions JSONB, -- Questions from campaign matrix
  job_context JSONB, -- Job details for context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Track individual calls made through Retell
CREATE TABLE retell_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  candidate_id UUID REFERENCES campaign_candidates(id),
  retell_call_id TEXT UNIQUE NOT NULL, -- Retell's call ID
  retell_agent_id TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  call_status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'failed'
  duration_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Store post-call analysis from Retell
CREATE TABLE retell_call_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  retell_call_id TEXT REFERENCES retell_calls(retell_call_id),
  campaign_candidate_id UUID REFERENCES campaign_candidates(id),
  
  -- Standard analysis fields
  available_to_work BOOLEAN,
  interested BOOLEAN,
  know_referee BOOLEAN,
  
  -- Dynamic fields from campaign matrix
  custom_responses JSONB, -- { "question_id": "response" }
  
  -- Retell analysis
  call_summary TEXT,
  sentiment_score DECIMAL(3,2), -- 0-1 scale
  transcript_url TEXT,
  recording_url TEXT,
  
  -- Extracted data
  next_steps TEXT,
  objections TEXT[],
  key_points TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch call jobs
CREATE TABLE retell_batch_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id),
  total_candidates INTEGER NOT NULL,
  completed_calls INTEGER DEFAULT 0,
  failed_calls INTEGER DEFAULT 0,
  status TEXT NOT NULL, -- 'preparing', 'in_progress', 'completed', 'cancelled'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_retell_calls_campaign_id ON retell_calls(campaign_id);
CREATE INDEX idx_retell_calls_candidate_id ON retell_calls(candidate_id);
CREATE INDEX idx_retell_call_analysis_candidate_id ON retell_call_analysis(campaign_candidate_id);
CREATE INDEX idx_retell_batch_calls_campaign_id ON retell_batch_calls(campaign_id);
```

---

## 🔧 Retell AI Integration Architecture

### 1. Environment Variables
```env
VITE_RETELL_API_KEY=your_retell_api_key
VITE_RETELL_WEBHOOK_URL=https://yourapp.com/api/retell/webhook
VITE_RETELL_DEFAULT_VOICE_ID=voice_id
```

### 2. Core Integration Module
```typescript
// src/lib/retell-client.ts
import { RetellClient } from '@retell/sdk';

class RetellService {
  private client: RetellClient;
  
  constructor() {
    this.client = new RetellClient({
      apiKey: import.meta.env.VITE_RETELL_API_KEY
    });
  }

  // Create dynamic agent for campaign
  async createCampaignAgent(campaign: Campaign): Promise<string> {
    const job = await getJobById(campaign.jobId);
    const prompt = this.buildDynamicPrompt(campaign, job);
    
    const agent = await this.client.agents.create({
      name: `${campaign.name} Agent`,
      prompt: prompt,
      voice: import.meta.env.VITE_RETELL_DEFAULT_VOICE_ID,
      webhook_url: `${import.meta.env.VITE_RETELL_WEBHOOK_URL}/campaign/${campaign.id}`,
      post_call_analysis: {
        enabled: true,
        questions: this.buildAnalysisQuestions(campaign)
      }
    });
    
    return agent.id;
  }

  // Build dynamic prompt from campaign matrix
  private buildDynamicPrompt(campaign: Campaign, job: Job): string {
    const basePrompt = `
You are calling on behalf of ${job.company} regarding the ${job.title} position.

Job Details:
- Location: ${job.location}
- Salary: ${job.salaryRange}
- Type: ${job.employmentType}

Your goals:
1. Verify candidate availability for work
2. Gauge interest in the position
3. Ask if they know anyone at ${job.company}
`;

    // Add dynamic questions from campaign matrices
    let dynamicQuestions = '\n\nAdditional Questions:\n';
    campaign.matrices.forEach((matrix, index) => {
      dynamicQuestions += `${index + 1}. ${matrix.callScript}\n`;
    });

    // Add custom targets as questions
    let targetQuestions = '\n\nInformation to Gather:\n';
    campaign.targets.forEach((target) => {
      targetQuestions += `- ${target.description}\n`;
    });

    return basePrompt + dynamicQuestions + targetQuestions + `
    
Remember to:
- Be friendly and professional
- Take notes on all responses
- Schedule follow-ups if interested
- Thank them for their time`;
  }

  // Build analysis questions based on campaign
  private buildAnalysisQuestions(campaign: Campaign): string[] {
    const questions = [
      'Is the candidate available to work?',
      'Is the candidate interested in the position?',
      'Does the candidate know anyone at the company?'
    ];

    // Add custom questions from targets
    campaign.targets.forEach(target => {
      if (target.goalType === 'boolean') {
        questions.push(`${target.description}?`);
      } else {
        questions.push(`What is the candidate's ${target.name}?`);
      }
    });

    return questions;
  }

  // Make batch calls
  async launchBatchCalls(
    campaignId: string,
    candidateIds: string[]
  ): Promise<string> {
    const batchId = await createBatchCallJob(campaignId, candidateIds.length);
    
    // Process in chunks to avoid rate limits
    const chunkSize = 10;
    for (let i = 0; i < candidateIds.length; i += chunkSize) {
      const chunk = candidateIds.slice(i, i + chunkSize);
      await Promise.all(chunk.map(id => this.makeCall(campaignId, id)));
      
      // Wait between chunks
      if (i + chunkSize < candidateIds.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return batchId;
  }

  // Make individual call
  async makeCall(campaignId: string, candidateId: string): Promise<string> {
    const candidate = await getCandidateById(candidateId);
    const agent = await getAgentForCampaign(campaignId);
    
    const call = await this.client.calls.create({
      agent_id: agent.retell_agent_id,
      to_number: candidate.tel_mobile,
      metadata: {
        campaign_id: campaignId,
        candidate_id: candidateId
      }
    });
    
    // Save call record
    await saveRetellCall({
      campaign_id: campaignId,
      candidate_id: candidateId,
      retell_call_id: call.id,
      retell_agent_id: agent.retell_agent_id,
      phone_number: candidate.tel_mobile,
      call_status: 'pending'
    });
    
    return call.id;
  }
}
```

---

## 🎯 Campaign Flow Implementation

### 1. Campaign Creation Enhancement
```typescript
// When campaign is created/launched
async function launchCampaignWithRetell(campaignId: string) {
  const campaign = await loadCampaignWithDetails(campaignId);
  
  // Step 1: Create Retell agent with dynamic prompt
  const agentId = await retellService.createCampaignAgent(campaign);
  
  // Step 2: Save agent configuration
  await saveRetellAgent({
    campaign_id: campaignId,
    retell_agent_id: agentId,
    agent_name: `${campaign.name} Agent`,
    base_prompt: retellService.getBasePrompt(),
    dynamic_questions: campaign.matrices,
    job_context: campaign.jobDetails
  });
  
  // Step 3: Update campaign status
  await updateCampaign(campaignId, { 
    status: 'active',
    retell_agent_ready: true 
  });
}
```

### 2. Batch Call UI Component
```typescript
// src/polymet/components/campaign-call-launcher.tsx
export function CampaignCallLauncher({ campaign }: Props) {
  const [calling, setCalling] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleLaunchCalls = async () => {
    setCalling(true);
    
    // Get candidates to call
    const candidates = await getCandidatesForCalling(campaign.id);
    
    // Launch batch calls
    const batchId = await retellService.launchBatchCalls(
      campaign.id,
      candidates.map(c => c.id)
    );
    
    // Track progress via websocket
    subscribeToCallProgress(batchId, (update) => {
      setProgress(update.percentage);
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Launch Campaign Calls</CardTitle>
        <CardDescription>
          {campaign.totalCandidates} candidates ready to call
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Not Called" value={notCalledCount} />
            <Stat label="In Progress" value={inProgressCount} />
            <Stat label="Completed" value={completedCount} />
          </div>
          
          {calling ? (
            <Progress value={progress} />
          ) : (
            <Button onClick={handleLaunchCalls} className="w-full">
              <PhoneIcon className="mr-2" />
              Start Calling Campaign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 📞 Call Management & Tracking

### 1. Webhook Handler
```typescript
// api/retell/webhook.ts
export async function handleRetellWebhook(req: Request) {
  const event = await req.json();
  
  switch (event.type) {
    case 'call.started':
      await updateRetellCall(event.call_id, {
        call_status: 'in_progress',
        started_at: new Date()
      });
      break;
      
    case 'call.ended':
      await updateRetellCall(event.call_id, {
        call_status: 'completed',
        ended_at: new Date(),
        duration_seconds: event.duration
      });
      break;
      
    case 'call.analyzed':
      await saveCallAnalysis({
        retell_call_id: event.call_id,
        available_to_work: event.analysis.answers[0],
        interested: event.analysis.answers[1],
        know_referee: event.analysis.answers[2],
        custom_responses: event.analysis.custom_answers,
        call_summary: event.analysis.summary,
        sentiment_score: event.analysis.sentiment,
        transcript_url: event.transcript_url,
        recording_url: event.recording_url,
        key_points: event.analysis.key_points
      });
      
      // Update campaign candidate status
      await updateCampaignCandidateFromAnalysis(
        event.metadata.candidate_id,
        event.analysis
      );
      break;
      
    case 'call.failed':
      await updateRetellCall(event.call_id, {
        call_status: 'failed',
        error: event.error
      });
      break;
  }
  
  return Response.json({ received: true });
}
```

### 2. Real-time Call Dashboard
```typescript
// src/polymet/components/campaign-call-dashboard.tsx
export function CampaignCallDashboard({ campaignId }: Props) {
  const [calls, setCalls] = useState<RetellCall[]>([]);
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  
  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`campaign-calls-${campaignId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'retell_calls',
        filter: `campaign_id=eq.${campaignId}`
      }, (payload) => {
        // Update calls list
        if (payload.eventType === 'INSERT') {
          setCalls(prev => [...prev, payload.new]);
        } else if (payload.eventType === 'UPDATE') {
          setCalls(prev => prev.map(c => 
            c.id === payload.new.id ? payload.new : c
          ));
        }
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [campaignId]);
  
  return (
    <div className="space-y-6">
      {/* Live Call Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PhoneIcon className="h-4 w-4 text-green-500 animate-pulse" />
              <span className="text-2xl font-bold">{inProgressCount}</span>
            </div>
            <p className="text-sm text-muted-foreground">Active Calls</p>
          </CardContent>
        </Card>
        
        {/* More stats cards... */}
      </div>
      
      {/* Call List with Real-time Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Call Activity</CardTitle>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all">All Calls</TabsTrigger>
              <TabsTrigger value="in_progress">
                <Badge variant="secondary" className="ml-2">
                  {inProgressCount}
                </Badge>
                In Progress
              </TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredCalls.map(call => (
              <CallItem key={call.id} call={call} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📊 Post-Call Analysis View

### 1. Candidate Call History
```typescript
// src/polymet/components/candidate-call-analysis.tsx
export function CandidateCallAnalysis({ candidateId }: Props) {
  const [analysis, setAnalysis] = useState<CallAnalysis | null>(null);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Call Analysis</CardTitle>
        <CardDescription>
          AI-generated insights from the call
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Responses */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            {analysis?.available_to_work ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            <span>Available to Work</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {analysis?.interested ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            <span>Interested</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {analysis?.know_referee ? (
              <CheckCircle className="text-green-500" />
            ) : (
              <XCircle className="text-red-500" />
            )}
            <span>Knows Referee</span>
          </div>
        </div>
        
        {/* Call Summary */}
        <div>
          <Label>Call Summary</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {analysis?.call_summary}
          </p>
        </div>
        
        {/* Sentiment */}
        <div>
          <Label>Sentiment Score</Label>
          <Progress value={analysis?.sentiment_score * 100} />
          <span className="text-xs text-muted-foreground">
            {getSentimentLabel(analysis?.sentiment_score)}
          </span>
        </div>
        
        {/* Key Points */}
        <div>
          <Label>Key Points</Label>
          <ul className="list-disc list-inside text-sm space-y-1">
            {analysis?.key_points?.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
        
        {/* Custom Responses */}
        {analysis?.custom_responses && (
          <div>
            <Label>Additional Responses</Label>
            {Object.entries(analysis.custom_responses).map(([q, a]) => (
              <div key={q} className="mt-2">
                <p className="text-sm font-medium">{q}</p>
                <p className="text-sm text-muted-foreground">{a}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <PlayIcon className="mr-2 h-4 w-4" />
            Play Recording
          </Button>
          <Button size="sm" variant="outline">
            <FileTextIcon className="mr-2 h-4 w-4" />
            View Transcript
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🚀 Implementation Steps

### Phase 1: Foundation (Week 1)
1. ✅ Create database tables
2. ✅ Set up Retell AI account and API keys
3. ✅ Build RetellService class
4. ✅ Create webhook endpoint

### Phase 2: Campaign Integration (Week 2)
1. ✅ Modify campaign creation to generate Retell agents
2. ✅ Build dynamic prompt generator
3. ✅ Store agent configurations
4. ✅ Test agent creation with different matrices

### Phase 3: Call Management (Week 3)
1. ✅ Build batch call launcher UI
2. ✅ Implement call tracking
3. ✅ Create real-time dashboard
4. ✅ Handle webhook events

### Phase 4: Analysis & Reporting (Week 4)
1. ✅ Store post-call analysis
2. ✅ Update candidate statuses automatically
3. ✅ Build analysis UI components
4. ✅ Create campaign performance reports

---

## 📋 Testing Strategy

### 1. Test Retell Agent Creation
```typescript
describe('Retell Agent Creation', () => {
  it('should create agent with dynamic questions', async () => {
    const campaign = await createTestCampaign({
      matrices: [
        { callScript: 'What is your expected salary?' },
        { callScript: 'When can you start?' }
      ],
      targets: [
        { description: 'Has valid driver license', goalType: 'boolean' }
      ]
    });
    
    const agentId = await retellService.createCampaignAgent(campaign);
    const agent = await retellService.getAgent(agentId);
    
    expect(agent.prompt).toContain('expected salary');
    expect(agent.prompt).toContain('When can you start');
    expect(agent.post_call_analysis.questions).toContain('driver license');
  });
});
```

### 2. Test Call Tracking
```typescript
describe('Call Tracking', () => {
  it('should track call status updates', async () => {
    const callId = await retellService.makeCall(campaignId, candidateId);
    
    // Simulate webhook events
    await handleWebhook({
      type: 'call.started',
      call_id: callId
    });
    
    const call = await getRetellCall(callId);
    expect(call.call_status).toBe('in_progress');
  });
});
```

---

## 🔒 Security Considerations

1. **API Key Management**
   - Store Retell API key securely
   - Use environment variables
   - Rotate keys regularly

2. **Webhook Security**
   - Verify webhook signatures
   - Use HTTPS only
   - Implement rate limiting

3. **Data Privacy**
   - Encrypt call recordings
   - Comply with recording laws
   - Get candidate consent

4. **Access Control**
   - Only campaign owners can launch calls
   - Audit all call actions
   - Implement role-based permissions

---

## 📈 Success Metrics

1. **Call Completion Rate**: % of successful calls
2. **Response Rate**: % of candidates who answer
3. **Qualification Rate**: % meeting criteria
4. **Time Saved**: Hours saved vs manual calling
5. **Cost per Qualified Lead**: Total cost / qualified candidates

---

## 🎯 Next Steps

1. **Immediate Actions**:
   - Create Retell AI account
   - Get API keys
   - Run database migrations

2. **Development Priority**:
   - Build RetellService
   - Create webhook handler
   - Add call launcher to campaign UI

3. **Testing**:
   - Test with small batch first
   - Monitor call quality
   - Gather feedback

---

**This plan provides a complete integration of Retell AI with your campaign system, enabling automated, intelligent phone outreach with full tracking and analysis capabilities.**
