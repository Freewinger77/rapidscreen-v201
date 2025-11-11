/**
 * Supabase Storage Manager
 * 
 * Replaces localStorage with Supabase database operations
 */

import { supabase } from '@/lib/supabase';
import type { Job, Candidate, CandidateNote } from "@/polymet/data/jobs-data";
import type {
  Campaign,
  CampaignCandidate,
  CampaignTarget,
  CampaignMatrix,
  CallRecord,
  WhatsAppMessage,
} from "@/polymet/data/campaigns-data";
import type { Dataset } from "@/polymet/data/datasets-data";

// ============================================
// JOBS - Supabase Operations
// ============================================

export async function loadJobs(): Promise<Job[]> {
  const { data: jobs, error } = await supabase
    .from('jobs')
    .select(`
      *,
      candidates:candidates(
        *,
        notes:candidate_notes(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading jobs:', error);
    return [];
  }

  // Transform database format to app format
  return (jobs || []).map(job => ({
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    employmentType: job.employment_type,
    salaryRange: job.salary_range,
    openPositions: job.open_positions,
    hired: job.hired,
    target: job.target,
    description: job.description || '',
    tags: job.tags || [],
    candidates: (job.candidates || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      status: c.status,
      notes: (c.notes || []).map((n: any) => ({
        id: n.id,
        text: n.text,
        timestamp: n.created_at,
        author: n.author,
        actionType: n.action_type,
        actionDate: n.action_date,
      })),
    })),
  }));
}

export async function saveJob(job: Partial<Job>): Promise<string | null> {
  const { data, error } = await supabase
    .from('jobs')
    .insert({
      title: job.title,
      company: job.company,
      location: job.location,
      employment_type: job.employmentType,
      salary_range: job.salaryRange,
      open_positions: job.openPositions,
      hired: job.hired,
      target: job.target,
      description: job.description,
      tags: job.tags,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving job:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<boolean> {
  const updateData: any = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.company) updateData.company = updates.company;
  if (updates.location) updateData.location = updates.location;
  if (updates.employmentType) updateData.employment_type = updates.employmentType;
  if (updates.salaryRange) updateData.salary_range = updates.salaryRange;
  if (updates.openPositions !== undefined) updateData.open_positions = updates.openPositions;
  if (updates.hired !== undefined) updateData.hired = updates.hired;
  if (updates.target !== undefined) updateData.target = updates.target;
  if (updates.description) updateData.description = updates.description;
  if (updates.tags) updateData.tags = updates.tags;

  const { error } = await supabase
    .from('jobs')
    .update(updateData)
    .eq('id', jobId);

  if (error) {
    console.error('Error updating job:', error);
    return false;
  }

  return true;
}

export async function deleteJob(jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) {
    console.error('Error deleting job:', error);
    return false;
  }

  return true;
}

// ============================================
// CANDIDATES - Supabase Operations
// ============================================

export async function saveCandidate(jobId: string, candidate: Partial<Candidate>): Promise<string | null> {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      job_id: jobId,
      name: candidate.name,
      phone: candidate.phone,
      email: candidate.email,
      status: candidate.status || 'not-contacted',
      position: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving candidate:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateCandidate(candidateId: string, updates: Partial<Candidate>): Promise<boolean> {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.phone) updateData.phone = updates.phone;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.status) updateData.status = updates.status;

  const { error } = await supabase
    .from('candidates')
    .update(updateData)
    .eq('id', candidateId);

  if (error) {
    console.error('Error updating candidate:', error);
    return false;
  }

  return true;
}

export async function moveCandidateToStatus(
  candidateId: string,
  newStatus: string,
  newPosition: number = 0
): Promise<boolean> {
  const { error } = await supabase
    .from('candidates')
    .update({
      status: newStatus,
      position: newPosition,
    })
    .eq('id', candidateId);

  if (error) {
    console.error('Error moving candidate:', error);
    return false;
  }

  return true;
}

export async function deleteCandidate(candidateId: string): Promise<boolean> {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId);

  if (error) {
    console.error('Error deleting candidate:', error);
    return false;
  }

  return true;
}

// ============================================
// CANDIDATE NOTES - Supabase Operations
// ============================================

export async function addCandidateNote(
  candidateId: string,
  note: Omit<CandidateNote, 'id' | 'timestamp'>
): Promise<string | null> {
  const { data, error } = await supabase
    .from('candidate_notes')
    .insert({
      candidate_id: candidateId,
      text: note.text,
      author: note.author,
      action_type: note.actionType || null,
      action_date: note.actionDate || null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding note:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateCandidateNote(
  noteId: string,
  updates: Partial<CandidateNote>
): Promise<boolean> {
  const updateData: any = {};
  if (updates.text) updateData.text = updates.text;
  if (updates.author) updateData.author = updates.author;
  if (updates.actionType !== undefined) updateData.action_type = updates.actionType;
  if (updates.actionDate !== undefined) updateData.action_date = updates.actionDate;

  const { error } = await supabase
    .from('candidate_notes')
    .update(updateData)
    .eq('id', noteId);

  if (error) {
    console.error('Error updating note:', error);
    return false;
  }

  return true;
}

export async function deleteCandidateNote(noteId: string): Promise<boolean> {
  const { error } = await supabase
    .from('candidate_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    console.error('Error deleting note:', error);
    return false;
  }

  return true;
}

// ============================================
// CAMPAIGNS - Supabase Operations
// ============================================

export async function loadCampaigns(): Promise<Campaign[]> {
  const { data: campaigns, error } = await supabase
    .from('campaigns')
    .select(`
      *,
      targets:campaign_targets(*),
      matrices:campaign_matrices(*),
      candidates:campaign_candidates(
        *,
        calls:call_records(
          *,
          transcript:call_transcript_messages(*)
        ),
        whatsappMessages:whatsapp_messages(*),
        notes:campaign_candidate_notes(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading campaigns:', error);
    return [];
  }

  // Transform database format to app format
  return (campaigns || []).map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    jobId: campaign.job_id,
    jobTitle: campaign.job_title,
    linkJob: campaign.link_job,
    startDate: campaign.start_date,
    endDate: campaign.end_date,
    channels: campaign.channels || [],
    targets: (campaign.targets || []).map((t: any) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      description: t.description,
      goalType: t.goal_type,
    })),
    matrices: (campaign.matrices || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      description: m.description,
      whatsappMessage: m.whatsapp_message,
      callScript: m.call_script,
    })),
    totalCandidates: campaign.total_candidates || 0,
    hired: campaign.hired || 0,
    responseRate: campaign.response_rate || 0,
    status: campaign.status,
    createdAt: campaign.created_at,
    candidates: (campaign.candidates || []).map((c: any) => ({
      id: c.id,
      forename: c.forename,
      surname: c.surname,
      telMobile: c.tel_mobile,
      email: c.email,
      callStatus: c.call_status,
      availableToWork: c.available_to_work,
      interested: c.interested,
      knowReferee: c.know_referee,
      lastContact: c.last_contact,
      experience: c.experience,
      calls: (c.calls || []).map((call: any) => ({
        id: call.id,
        callId: call.call_id,
        phoneFrom: call.phone_from,
        phoneTo: call.phone_to,
        duration: call.duration,
        timestamp: call.created_at,
        availableToWork: call.available_to_work,
        interested: call.interested,
        knowReferee: call.know_referee,
        transcript: (call.transcript || []).map((t: any) => ({
          id: t.id,
          speaker: t.speaker,
          message: t.message,
          timestamp: t.timestamp,
        })),
      })),
      whatsappMessages: (c.whatsappMessages || []).map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.created_at,
        status: msg.status,
      })),
      notes: (c.notes || []).map((n: any) => ({
        id: n.id,
        text: n.text,
        timestamp: n.created_at,
        author: n.author,
        actionType: n.action_type,
        actionDate: n.action_date,
      })),
    })),
  }));
}

export async function saveCampaign(campaign: Partial<Campaign>): Promise<string | null> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: campaign.name,
      job_id: campaign.jobId,
      job_title: campaign.jobTitle,
      link_job: campaign.linkJob,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      channels: campaign.channels,
      total_candidates: campaign.totalCandidates || 0,
      hired: campaign.hired || 0,
      response_rate: campaign.responseRate || 0,
      status: campaign.status || 'draft',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving campaign:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateCampaign(campaignId: string, updates: Partial<Campaign>): Promise<boolean> {
  const updateData: any = {};
  if (updates.name) updateData.name = updates.name;
  if (updates.jobId) updateData.job_id = updates.jobId;
  if (updates.jobTitle) updateData.job_title = updates.jobTitle;
  if (updates.totalCandidates !== undefined) updateData.total_candidates = updates.totalCandidates;
  if (updates.hired !== undefined) updateData.hired = updates.hired;
  if (updates.responseRate !== undefined) updateData.response_rate = updates.responseRate;
  if (updates.status) updateData.status = updates.status;

  const { error } = await supabase
    .from('campaigns')
    .update(updateData)
    .eq('id', campaignId);

  if (error) {
    console.error('Error updating campaign:', error);
    return false;
  }

  return true;
}

export async function saveCampaignTargets(
  campaignId: string,
  targets: any[]
): Promise<boolean> {
  const targetsToInsert = targets.map(t => ({
    campaign_id: campaignId,
    name: t.name,
    type: t.type,
    description: t.description,
    goal_type: t.goalType,
  }));

  const { error } = await supabase
    .from('campaign_targets')
    .insert(targetsToInsert);

  if (error) {
    console.error('Error saving campaign targets:', error);
    return false;
  }

  return true;
}

export async function saveCampaignMatrices(
  campaignId: string,
  matrices: any[]
): Promise<boolean> {
  const matricesToInsert = matrices.map(m => ({
    campaign_id: campaignId,
    name: m.name,
    description: m.description,
    whatsapp_message: m.whatsappMessage,
    call_script: m.callScript,
  }));

  const { error } = await supabase
    .from('campaign_matrices')
    .insert(matricesToInsert);

  if (error) {
    console.error('Error saving campaign matrices:', error);
    return false;
  }

  return true;
}

export async function linkDatasetCandidatesToCampaign(
  campaignId: string,
  datasetIds: string[]
): Promise<number> {
  let totalLinked = 0;

  for (const datasetId of datasetIds) {
    // Get all candidates from this dataset
    const { data: datasetCandidates, error: fetchError } = await supabase
      .from('dataset_candidates')
      .select('*')
      .eq('dataset_id', datasetId);

    if (fetchError || !datasetCandidates) {
      console.error('Error fetching dataset candidates:', fetchError);
      continue;
    }

    // Create campaign candidates from dataset candidates
    const campaignCandidates = datasetCandidates.map(dc => ({
      campaign_id: campaignId,
      forename: dc.name.split(' ')[0] || dc.name,
      surname: dc.name.split(' ').slice(1).join(' ') || '',
      tel_mobile: dc.phone,
      email: '', // Dataset candidates might not have email
      call_status: 'not_called',
      available_to_work: null,
      interested: null,
      know_referee: null,
      last_contact: null,
      experience: dc.trade || null,
    }));

    const { error: insertError } = await supabase
      .from('campaign_candidates')
      .insert(campaignCandidates);

    if (insertError) {
      console.error('Error linking candidates to campaign:', insertError);
    } else {
      totalLinked += campaignCandidates.length;
    }
  }

  return totalLinked;
}

// ============================================
// DATASETS - Supabase Operations
// ============================================

export async function loadDatasets(): Promise<Dataset[]> {
  const { data: datasets, error } = await supabase
    .from('datasets')
    .select(`
      *,
      candidates:dataset_candidates(*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading datasets:', error);
    return [];
  }

  return (datasets || []).map(dataset => ({
    id: dataset.id,
    name: dataset.name,
    description: dataset.description || '',
    candidateCount: dataset.candidate_count || 0,
    createdAt: dataset.created_at,
    lastUpdated: dataset.updated_at,
    source: dataset.source as 'csv' | 'manual' | 'imported',
    candidates: (dataset.candidates || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      postcode: c.postcode,
      location: c.location,
      trade: c.trade,
      blueCard: c.blue_card,
      greenCard: c.green_card,
    })),
  }));
}

export async function saveDataset(dataset: Partial<Dataset>): Promise<string | null> {
  const { data, error } = await supabase
    .from('datasets')
    .insert({
      name: dataset.name,
      description: dataset.description,
      candidate_count: dataset.candidateCount || 0,
      source: dataset.source || 'manual',
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving dataset:', error);
    return null;
  }

  return data?.id || null;
}

// ============================================
// JOB COLUMNS (KANBAN) - Supabase Operations
// ============================================

export interface JobColumn {
  id: string;
  jobId: string;
  title: string;
  status: string;
  color: string;
  position: number;
}

export async function loadJobColumns(jobId: string): Promise<JobColumn[]> {
  const { data, error } = await supabase
    .from('job_columns')
    .select('*')
    .eq('job_id', jobId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error loading job columns:', error);
    return [];
  }

  return (data || []).map(col => ({
    id: col.id,
    jobId: col.job_id,
    title: col.title,
    status: col.status,
    color: col.color,
    position: col.position,
  }));
}

export async function saveJobColumn(column: Omit<JobColumn, 'id'>): Promise<string | null> {
  const { data, error } = await supabase
    .from('job_columns')
    .insert({
      job_id: column.jobId,
      title: column.title,
      status: column.status,
      color: column.color,
      position: column.position,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving job column:', error);
    return null;
  }

  return data?.id || null;
}

export async function updateJobColumn(columnId: string, updates: Partial<JobColumn>): Promise<boolean> {
  const updateData: any = {};
  if (updates.title) updateData.title = updates.title;
  if (updates.status) updateData.status = updates.status;
  if (updates.color) updateData.color = updates.color;
  if (updates.position !== undefined) updateData.position = updates.position;

  const { error } = await supabase
    .from('job_columns')
    .update(updateData)
    .eq('id', columnId);

  if (error) {
    console.error('Error updating job column:', error);
    return false;
  }

  return true;
}

export async function deleteJobColumn(columnId: string): Promise<boolean> {
  const { error } = await supabase
    .from('job_columns')
    .delete()
    .eq('id', columnId);

  if (error) {
    console.error('Error deleting job column:', error);
    return false;
  }

  return true;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('jobs').select('count').limit(1);
    return !error;
  } catch {
    return false;
  }
}

