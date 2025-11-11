/**
 * Database Types
 * 
 * TypeScript types matching the Supabase schema
 */

// ============================================
// JOBS & KANBAN
// ============================================

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  employment_type: string;
  salary_range: string;
  open_positions: number;
  hired: number;
  target: number;
  description: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: string;
  job_id: string;
  title: string;
  status_key: string;
  color: string;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidate {
  id: string;
  job_id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface CandidateNote {
  id: string;
  candidate_id: string;
  text: string;
  author: string;
  action_type: string | null;
  action_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// CAMPAIGNS
// ============================================

export interface Campaign {
  id: string;
  name: string;
  job_id: string;
  job_title: string;
  link_job: string | null;
  start_date: string;
  end_date: string;
  channels: string[];
  total_candidates: number;
  hired: number;
  response_rate: number;
  status: 'active' | 'draft' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface CampaignTarget {
  id: string;
  campaign_id: string;
  name: string;
  type: 'column' | 'custom';
  description: string | null;
  goal_type: 'text' | 'number' | 'boolean' | null;
  created_at: string;
}

export interface CampaignMatrix {
  id: string;
  campaign_id: string;
  name: string;
  description: string | null;
  whatsapp_message: string | null;
  call_script: string | null;
  created_at: string;
  updated_at: string;
}

export interface CampaignCandidate {
  id: string;
  campaign_id: string;
  forename: string;
  surname: string;
  tel_mobile: string;
  email: string | null;
  call_status:
    | 'not_called'
    | 'agent_hangup'
    | 'user_declined'
    | 'user_hangup'
    | 'no_answer'
    | 'voicemail'
    | 'invalid_destination';
  available_to_work: boolean | null;
  interested: boolean | null;
  know_referee: boolean | null;
  last_contact: string | null;
  experience: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallRecord {
  id: string;
  campaign_candidate_id: string;
  call_id: string;
  phone_from: string;
  phone_to: string;
  duration: string;
  available_to_work: boolean | null;
  interested: boolean | null;
  know_referee: boolean | null;
  created_at: string;
}

export interface CallTranscriptMessage {
  id: string;
  call_record_id: string;
  speaker: 'user' | 'agent';
  message: string;
  timestamp: string | null;
  sequence: number;
  created_at: string;
}

export interface WhatsAppMessage {
  id: string;
  campaign_candidate_id: string;
  sender: 'user' | 'agent';
  text: string;
  status: 'sent' | 'delivered' | 'read' | null;
  created_at: string;
}

export interface CampaignCandidateNote {
  id: string;
  campaign_candidate_id: string;
  text: string;
  author: string;
  action_type: string | null;
  action_date: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================
// DATASETS
// ============================================

export interface Dataset {
  id: string;
  name: string;
  description: string | null;
  candidate_count: number;
  source: 'csv' | 'manual' | 'imported';
  created_at: string;
  updated_at: string;
}

export interface DatasetCandidate {
  id: string;
  dataset_id: string;
  name: string;
  phone: string;
  postcode: string | null;
  location: string | null;
  trade: string | null;
  blue_card: boolean;
  green_card: boolean;
  created_at: string;
  updated_at: string;
}

