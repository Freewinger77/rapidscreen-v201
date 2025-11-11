# 🎯 VAPI WhatsApp + AI Call Flow - Complete Plan

## System Architecture

### Flow Overview:
```
Campaign Launch
    ↓
WhatsApp Message (VAPI Agent)
    ↓
[Wait 3 hours] → Response?
    ↓ No
Send Reminder WhatsApp
    ↓
[Wait 6 hours] → Response?
    ↓ No
AI Phone Call (7pm or 12pm slot)
    ↓
Call Outcome → Follow-up WhatsApp
    ↓
Continue conversation on WhatsApp
```

---

## 📊 Database Schema

### 1. Conversation State Machine Table
```sql
CREATE TABLE conversation_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  
  -- Current state
  current_state TEXT NOT NULL, 
  -- 'whatsapp_initial', 'waiting_response_3h', 'reminder_sent', 
  -- 'waiting_response_6h', 'scheduling_call', 'call_scheduled', 
  -- 'call_completed', 'whatsapp_followup', 'completed'
  
  -- Timestamps for state transitions
  flow_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_state_change TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  initial_message_sent_at TIMESTAMP WITH TIME ZONE,
  first_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  second_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  call_scheduled_for TIMESTAMP WITH TIME ZONE,
  call_completed_at TIMESTAMP WITH TIME ZONE,
  flow_completed_at TIMESTAMP WITH TIME ZONE,
  
  -- State data
  response_received BOOLEAN DEFAULT false,
  response_count INTEGER DEFAULT 0,
  last_response_at TIMESTAMP WITH TIME ZONE,
  
  -- VAPI configuration
  vapi_assistant_id TEXT,
  vapi_conversation_id TEXT,
  
  -- Call tracking
  retell_call_id TEXT,
  call_outcome TEXT, -- 'answered', 'no_answer', 'voicemail', 'user_hangup'
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_conversation_flows_state ON conversation_flows(current_state);
CREATE INDEX idx_conversation_flows_candidate ON conversation_flows(candidate_id);
CREATE INDEX idx_conversation_flows_campaign ON conversation_flows(campaign_id);
CREATE INDEX idx_conversation_flows_next_action ON conversation_flows(current_state, last_state_change);
```

### 2. WhatsApp Messages Table (Enhanced)
```sql
CREATE TABLE whatsapp_messages_enhanced (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_flow_id UUID REFERENCES conversation_flows(id) ON DELETE CASCADE,
  campaign_candidate_id UUID REFERENCES campaign_candidates(id) ON DELETE CASCADE,
  
  -- Message details
  vapi_message_id TEXT,
  direction TEXT NOT NULL, -- 'outbound', 'inbound'
  message_type TEXT NOT NULL, -- 'text', 'image', 'document', 'audio', 'video'
  
  -- Content
  text_content TEXT,
  media_url TEXT,
  media_type TEXT,
  file_name TEXT,
  file_size INTEGER,
  
  -- Message context
  is_reminder BOOLEAN DEFAULT false,
  is_followup BOOLEAN DEFAULT false,
  prompt_template_used TEXT, -- Which message template was used
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'read', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_reason TEXT,
  
  -- WhatsApp metadata
  whatsapp_message_id TEXT UNIQUE,
  whatsapp_status TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_whatsapp_enhanced_flow ON whatsapp_messages_enhanced(conversation_flow_id);
CREATE INDEX idx_whatsapp_enhanced_candidate ON whatsapp_messages_enhanced(campaign_candidate_id);
CREATE INDEX idx_whatsapp_enhanced_direction ON whatsapp_messages_enhanced(direction);
```

### 3. File Uploads Table
```sql
CREATE TABLE conversation_file_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_flow_id UUID REFERENCES conversation_flows(id) ON DELETE CASCADE,
  whatsapp_message_id UUID REFERENCES whatsapp_messages_enhanced(id) ON DELETE CASCADE,
  
  -- File details
  file_type TEXT NOT NULL, -- 'cscs_card', 'cv', 'proof_of_address', 'other'
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  
  -- Processing
  processed BOOLEAN DEFAULT false,
  extracted_data JSONB, -- AI-extracted data from file
  
  -- Metadata
  uploaded_by TEXT DEFAULT 'candidate',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_file_uploads_flow ON conversation_file_uploads(conversation_flow_id);
CREATE INDEX idx_file_uploads_type ON conversation_file_uploads(file_type);
```

### 4. Scheduled Actions Table
```sql
CREATE TABLE conversation_scheduled_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_flow_id UUID REFERENCES conversation_flows(id) ON DELETE CASCADE,
  
  -- Action details
  action_type TEXT NOT NULL, 
  -- 'send_reminder', 'schedule_call', 'send_followup', 'escalate'
  
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Action config
  action_config JSONB DEFAULT '{}', -- Message template, call time preference, etc.
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'executing', 'completed', 'failed', 'cancelled'
  execution_result JSONB,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scheduled_actions_pending ON conversation_scheduled_actions(status, scheduled_for)
  WHERE status = 'pending';
CREATE INDEX idx_scheduled_actions_flow ON conversation_scheduled_actions(conversation_flow_id);
```

### 5. VAPI Assistants Configuration
```sql
CREATE TABLE vapi_assistants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  
  -- VAPI configuration
  vapi_assistant_id TEXT UNIQUE NOT NULL,
  assistant_name TEXT NOT NULL,
  assistant_type TEXT NOT NULL, -- 'whatsapp_initial', 'whatsapp_followup', 'phone_call'
  
  -- Configuration
  system_prompt TEXT NOT NULL,
  first_message TEXT,
  model TEXT DEFAULT 'gpt-4',
  voice_id TEXT,
  
  -- WhatsApp specific
  whatsapp_number TEXT,
  whatsapp_template_id TEXT,
  
  -- Metadata
  configuration JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vapi_assistants_campaign ON vapi_assistants(campaign_id);
CREATE INDEX idx_vapi_assistants_type ON vapi_assistants(assistant_type);
```

---

## 🔧 Technical Implementation

### Phase 1: VAPI Integration (Week 1)

#### 1.1 VAPI Client Setup
```typescript
// src/lib/vapi-client.ts
import Vapi from '@vapi-ai/web';

export class VapiService {
  private apiKey: string;
  private baseUrl = 'https://api.vapi.ai';
  
  constructor() {
    this.apiKey = import.meta.env.VITE_VAPI_API_KEY;
  }

  // Create WhatsApp assistant for campaign
  async createWhatsAppAssistant(
    campaign: Campaign,
    job: Job,
    type: 'initial' | 'followup'
  ): Promise<string> {
    const prompt = this.buildWhatsAppPrompt(campaign, job, type);
    
    const assistant = await fetch(`${this.baseUrl}/assistant`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `${campaign.name} - WhatsApp ${type}`,
        model: {
          provider: 'openai',
          model: 'gpt-4',
          messages: [{
            role: 'system',
            content: prompt
          }]
        },
        voice: {
          provider: '11labs',
          voiceId: 'voice_id'
        },
        firstMessage: campaign.matrices?.[0]?.whatsappMessage || 
                     `Hi! This is regarding the ${job.title} position.`,
      })
    });
    
    const data = await assistant.json();
    return data.id;
  }

  // Send WhatsApp message
  async sendWhatsAppMessage(
    phoneNumber: string,
    message: string,
    assistantId: string,
    metadata: Record<string, any>
  ): Promise<string> {
    const response = await fetch(`${this.baseUrl}/call/whatsapp`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        assistantId: assistantId,
        customer: {
          number: phoneNumber,
        },
        metadata: metadata,
      })
    });
    
    const data = await response.json();
    return data.id; // Conversation ID
  }
}
```

#### 1.2 WhatsApp Prompt Builder
```typescript
private buildWhatsAppPrompt(
  campaign: Campaign,
  job: Job,
  type: 'initial' | 'followup'
): string {
  if (type === 'initial') {
    return `You are a recruitment assistant for ${job.company} via WhatsApp.

Role: Introduce the ${job.title} opportunity and gather initial interest.

Job Details:
- Position: ${job.title}
- Company: ${job.company}
- Location: ${job.location}
- Salary: ${job.salaryRange}

Your Goals:
1. Confirm they received the message
2. Gauge initial interest
3. ${campaign.matrices?.map(m => m.description).join('\n3. ')}

Keep responses:
- Short (WhatsApp style)
- Friendly and casual
- Use emojis occasionally 
- Ask one question at a time

If they show interest:
- Ask when they can chat more
- Request any documents (CV, CSCS card, etc.)
- Schedule a follow-up call if needed

If no response within 3 hours:
- System will send automatic reminder
- Don't send multiple messages yourself`;
  } else {
    // Follow-up after call
    return `You are following up via WhatsApp after a phone conversation about ${job.title}.

The candidate was called and the conversation outcome was: [OUTCOME]

Your Goals:
1. Collect any missing information:
   ${campaign.targets?.map(t => `- ${t.description}`).join('\n   ')}
2. Request required documents
3. Answer any questions
4. Confirm next steps

Keep it brief and action-oriented.
Reference the phone call: "Following up on our call earlier..."`;
  }
}
```

---

### Phase 2: Conversation Flow Engine (Week 2)

#### 2.1 State Machine Manager
```typescript
// src/lib/conversation-flow-manager.ts
export class ConversationFlowManager {
  
  async initializeFlow(
    campaignId: string,
    candidateId: string
  ): Promise<string> {
    // Create conversation flow record
    const { data, error } = await supabase
      .from('conversation_flows')
      .insert({
        campaign_id: campaignId,
        candidate_id: candidateId,
        current_state: 'whatsapp_initial',
        flow_started_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error || !data) {
      throw new Error('Failed to create conversation flow');
    }
    
    // Schedule 3-hour check
    await this.scheduleAction(data.id, 'check_response_3h', 3);
    
    return data.id;
  }

  async handleStateTransition(
    flowId: string,
    newState: string,
    metadata?: Record<string, any>
  ) {
    const { data: flow } = await supabase
      .from('conversation_flows')
      .select('*')
      .eq('id', flowId)
      .single();
    
    if (!flow) return;
    
    // Update state
    await supabase
      .from('conversation_flows')
      .update({
        current_state: newState,
        last_state_change: new Date().toISOString(),
        metadata: { ...flow.metadata, ...metadata }
      })
      .eq('id', flowId);
    
    // Handle state-specific logic
    switch (newState) {
      case 'waiting_response_3h':
        await this.scheduleAction(flowId, 'send_reminder_1', 3);
        break;
      
      case 'waiting_response_6h':
        await this.scheduleAction(flowId, 'schedule_call', 6);
        break;
      
      case 'call_scheduled':
        await this.schedulePhoneCall(flowId);
        break;
      
      case 'whatsapp_followup':
        await this.sendFollowUpMessage(flowId);
        break;
    }
  }

  async checkResponseTimeout(flowId: string) {
    const { data: flow } = await supabase
      .from('conversation_flows')
      .select('*, messages:whatsapp_messages_enhanced(*)')
      .eq('id', flowId)
      .single();
    
    if (!flow) return;
    
    const lastMessage = flow.messages
      ?.filter((m: any) => m.direction === 'inbound')
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    
    const hoursSinceLastMessage = lastMessage
      ? (Date.now() - new Date(lastMessage.created_at).getTime()) / (1000 * 60 * 60)
      : 999;
    
    if (flow.current_state === 'waiting_response_3h' && hoursSinceLastMessage >= 3) {
      await this.sendReminder(flowId, 1);
      await this.handleStateTransition(flowId, 'waiting_response_6h');
    } else if (flow.current_state === 'waiting_response_6h' && hoursSinceLastMessage >= 6) {
      await this.schedulePhoneCall(flowId);
      await this.handleStateTransition(flowId, 'call_scheduled');
    }
  }

  async sendReminder(flowId: string, reminderNumber: number) {
    const { data: flow } = await supabase
      .from('conversation_flows')
      .select('*, candidate:campaign_candidates(*)')
      .eq('id', flowId)
      .single();
    
    if (!flow) return;
    
    const reminderMessage = reminderNumber === 1
      ? "Hi! Just following up on my earlier message about the opportunity. Still interested?"
      : "Quick reminder about the opportunity I mentioned. Let me know if you'd like to discuss!";
    
    await vapiService.sendWhatsAppMessage(
      flow.candidate.tel_mobile,
      reminderMessage,
      flow.vapi_assistant_id,
      { conversation_flow_id: flowId, type: 'reminder' }
    );
    
    // Update flow
    const updateField = reminderNumber === 1 
      ? 'first_reminder_sent_at' 
      : 'second_reminder_sent_at';
    
    await supabase
      .from('conversation_flows')
      .update({ [updateField]: new Date().toISOString() })
      .eq('id', flowId);
  }

  async schedulePhoneCall(flowId: string) {
    const now = new Date();
    const hour = now.getHours();
    
    // Determine next call slot: 7pm or 12pm
    let callTime: Date;
    if (hour < 12) {
      // Schedule for 12pm today
      callTime = new Date(now.setHours(12, 0, 0, 0));
    } else if (hour < 19) {
      // Schedule for 7pm today
      callTime = new Date(now.setHours(19, 0, 0, 0));
    } else {
      // Schedule for 12pm tomorrow
      callTime = new Date(now.setDate(now.getDate() + 1));
      callTime.setHours(12, 0, 0, 0);
    }
    
    await supabase
      .from('conversation_flows')
      .update({
        call_scheduled_for: callTime.toISOString(),
      })
      .eq('id', flowId);
    
    await this.scheduleAction(flowId, 'make_call', 
      (callTime.getTime() - Date.now()) / (1000 * 60 * 60));
  }

  private async scheduleAction(
    flowId: string,
    actionType: string,
    hoursFromNow: number
  ) {
    const scheduledFor = new Date(Date.now() + hoursFromNow * 60 * 60 * 1000);
    
    await supabase
      .from('conversation_scheduled_actions')
      .insert({
        conversation_flow_id: flowId,
        action_type: actionType,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      });
  }
}
```

---

### Phase 3: Scheduler Service (Week 3)

#### 3.1 Background Job Processor
```typescript
// src/services/conversation-scheduler.ts
export class ConversationScheduler {
  private isRunning = false;
  
  async start() {
    this.isRunning = true;
    console.log('🔄 Conversation scheduler started');
    
    // Check every minute for pending actions
    setInterval(() => this.processPendingActions(), 60 * 1000);
  }

  async processPendingActions() {
    if (!this.isRunning) return;
    
    const { data: actions } = await supabase
      .from('conversation_scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(50);
    
    if (!actions || actions.length === 0) return;
    
    console.log(`⏰ Processing ${actions.length} scheduled actions...`);
    
    for (const action of actions) {
      await this.executeAction(action);
    }
  }

  async executeAction(action: any) {
    console.log(`⚡ Executing action: ${action.action_type} for flow ${action.conversation_flow_id}`);
    
    // Mark as executing
    await supabase
      .from('conversation_scheduled_actions')
      .update({ status: 'executing' })
      .eq('id', action.id);
    
    try {
      switch (action.action_type) {
        case 'check_response_3h':
          await flowManager.checkResponseTimeout(action.conversation_flow_id);
          break;
        
        case 'send_reminder_1':
          await flowManager.sendReminder(action.conversation_flow_id, 1);
          break;
        
        case 'send_reminder_2':
          await flowManager.sendReminder(action.conversation_flow_id, 2);
          break;
        
        case 'make_call':
          await this.makeScheduledCall(action.conversation_flow_id);
          break;
        
        case 'send_followup':
          await flowManager.sendFollowUpMessage(action.conversation_flow_id);
          break;
      }
      
      // Mark as completed
      await supabase
        .from('conversation_scheduled_actions')
        .update({ 
          status: 'completed',
          executed_at: new Date().toISOString()
        })
        .eq('id', action.id);
        
    } catch (error) {
      console.error(`❌ Action failed:`, error);
      
      await supabase
        .from('conversation_scheduled_actions')
        .update({ 
          status: 'failed',
          error_message: error.message
        })
        .eq('id', action.id);
    }
  }

  async makeScheduledCall(flowId: string) {
    const { data: flow } = await supabase
      .from('conversation_flows')
      .select('*, candidate:campaign_candidates(*), campaign:campaigns(*)')
      .eq('id', flowId)
      .single();
    
    if (!flow) return;
    
    // Create Retell agent if not exists
    let agentId = flow.campaign.retell_agent_id;
    if (!agentId) {
      agentId = await retellService.createCampaignAgent(
        flow.campaign,
        flow.campaign.job
      );
    }
    
    // Make the call
    const callId = await retellService.makeCall(
      flow.campaign_id,
      flow.candidate_id,
      flow.candidate.tel_mobile,
      agentId
    );
    
    // Update flow
    await supabase
      .from('conversation_flows')
      .update({
        retell_call_id: callId,
        current_state: 'call_in_progress'
      })
      .eq('id', flowId);
  }
}
```

---

### Phase 4: WhatsApp Webhook Handler (Week 3)

#### 4.1 VAPI Webhook for WhatsApp
```typescript
// api/vapi-webhook.ts
export async function handleVapiWebhook(req: Request) {
  const event = await req.json();
  
  switch (event.type) {
    case 'message.received':
      await handleIncomingMessage(event);
      break;
    
    case 'file.uploaded':
      await handleFileUpload(event);
      break;
    
    case 'conversation.ended':
      await handleConversationEnd(event);
      break;
  }
  
  return Response.json({ received: true });
}

async function handleIncomingMessage(event: any) {
  const flowId = event.metadata?.conversation_flow_id;
  const message = event.message;
  
  // Save message
  await supabase
    .from('whatsapp_messages_enhanced')
    .insert({
      conversation_flow_id: flowId,
      direction: 'inbound',
      message_type: 'text',
      text_content: message.content,
      whatsapp_message_id: message.id,
      status: 'received',
    });
  
  // Update flow state
  await supabase
    .from('conversation_flows')
    .update({
      response_received: true,
      last_response_at: new Date().toISOString(),
      response_count: supabase.raw('response_count + 1'),
    })
    .eq('id', flowId);
  
  // Cancel any pending reminders
  await supabase
    .from('conversation_scheduled_actions')
    .update({ status: 'cancelled' })
    .eq('conversation_flow_id', flowId)
    .eq('status', 'pending');
}

async function handleFileUpload(event: any) {
  const flowId = event.metadata?.conversation_flow_id;
  
  await supabase
    .from('conversation_file_uploads')
    .insert({
      conversation_flow_id: flowId,
      file_type: event.file.type,
      file_url: event.file.url,
      file_name: event.file.name,
      file_size: event.file.size,
      mime_type: event.file.mimeType,
    });
}
```

---

### Phase 5: Integration with Existing System (Week 4)

#### 5.1 Campaign Launch with Flow
```typescript
// When launching campaign
async function launchCampaignWithFlow(campaignId: string) {
  const { data: candidates } = await supabase
    .from('campaign_candidates')
    .select('*')
    .eq('campaign_id', campaignId)
    .eq('call_status', 'not_called');
  
  // Create VAPI WhatsApp assistant
  const assistantId = await vapiService.createWhatsAppAssistant(
    campaign,
    job,
    'initial'
  );
  
  // Initialize flows for all candidates
  for (const candidate of candidates) {
    const flowId = await flowManager.initializeFlow(
      campaignId,
      candidate.id
    );
    
    // Send initial WhatsApp message
    const conversationId = await vapiService.sendWhatsAppMessage(
      candidate.tel_mobile,
      campaign.matrices[0].whatsappMessage,
      assistantId,
      {
        conversation_flow_id: flowId,
        candidate_id: candidate.id,
        campaign_id: campaignId,
      }
    );
    
    // Update flow with conversation ID
    await supabase
      .from('conversation_flows')
      .update({
        vapi_conversation_id: conversationId,
        vapi_assistant_id: assistantId,
        initial_message_sent_at: new Date().toISOString(),
        current_state: 'waiting_response_3h',
      })
      .eq('id', flowId);
  }
  
  console.log(`✅ Initialized ${candidates.length} conversation flows`);
}
```

---

## 📋 Implementation Checklist

### Setup (Week 1):
- [ ] Sign up for VAPI account
- [ ] Get API keys
- [ ] Connect WhatsApp Business number
- [ ] Create database tables (run SQL)
- [ ] Install VAPI SDK: `npm install @vapi-ai/web`

### Backend (Week 2):
- [ ] Build VapiService class
- [ ] Build ConversationFlowManager
- [ ] Create VAPI webhook endpoint
- [ ] Set up ngrok for local testing

### Scheduler (Week 3):
- [ ] Build ConversationScheduler
- [ ] Deploy as background service
- [ ] Test timeout logic
- [ ] Test reminder sending

### Integration (Week 4):
- [ ] Update campaign launcher
- [ ] Add flow monitoring UI
- [ ] Test complete flow end-to-end
- [ ] Handle edge cases

---

## 🎯 Environment Variables Needed

```env
# VAPI Configuration
VITE_VAPI_API_KEY=your_vapi_key
VITE_VAPI_PHONE_NUMBER=+1234567890
VITE_VAPI_WEBHOOK_URL=https://yourapp.com/api/vapi-webhook

# WhatsApp
VITE_WHATSAPP_BUSINESS_NUMBER=+1234567890
VITE_WHATSAPP_API_TOKEN=your_whatsapp_token
```

---

## 🚀 Next Steps

**Do you want me to:**
1. ✅ Build the complete VAPI integration?
2. ✅ Create all database tables?
3. ✅ Implement the conversation flow manager?
4. ✅ Set up the scheduler?

**This is a major feature - estimated 2-3 weeks of development.**

**Should I start building this system for you?**


