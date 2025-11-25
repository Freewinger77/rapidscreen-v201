/**
 * Supabase Storage Manager (Browser-Compatible)
 * 
 * Uses @supabase/supabase-js for browser compatibility
 */

import { supabase } from './supabase-client';
import type { Job, Candidate, CandidateNote } from '@/polymet/data/jobs-data';
import type { Campaign, CampaignCandidate } from '@/polymet/data/campaigns-data';
import type { Dataset } from '@/polymet/data/datasets-data';

// ============================================
// JOBS OPERATIONS
// ============================================

export async function loadJobs(): Promise<Job[]> {
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!jobs) return [];

    // Load candidates for each job
    const jobsWithCandidates = await Promise.all(
      jobs.map(async (job) => {
        const { data: candidates, error: candError } = await supabase
          .from('candidates')
          .select('*')
          .eq('job_id', job.id)
          .order('position', { ascending: true });

        if (candError) {
          console.error('Error loading candidates:', candError);
          return convertJobFromDB(job, []);
        }

        // Load notes for each candidate
        const candidatesWithNotes = await Promise.all(
          (candidates || []).map(async (candidate) => {
            const { data: notes, error: notesError } = await supabase
              .from('candidate_notes')
              .select('*')
              .eq('candidate_id', candidate.id)
              .order('created_at', { ascending: false });

            return {
              id: candidate.id,
              name: candidate.name,
              phone: candidate.phone,
              email: candidate.email,
              status: candidate.status,
              notes: (notes || []).map(note => ({
                id: note.id,
                text: note.text,
                author: note.author,
                timestamp: note.created_at,
                actionType: note.action_type,
                actionDate: note.action_date,
              })),
            };
          })
        );

        return convertJobFromDB(job, candidatesWithNotes);
      })
    );

    return jobsWithCandidates;
  } catch (error) {
    console.error('Error loading jobs:', error);
    return [];
  }
}

function convertJobFromDB(dbJob: any, candidates: Candidate[]): Job {
  return {
    id: dbJob.id,
    title: dbJob.title,
    company: dbJob.company,
    location: dbJob.location,
    employmentType: dbJob.employment_type,
    salaryRange: dbJob.salary_range,
    openPositions: dbJob.open_positions,
    hired: dbJob.hired,
    target: dbJob.target,
    description: dbJob.description,
    tags: dbJob.tags || [],
    candidates,
  };
}

export async function addJob(job: Omit<Job, 'id'>): Promise<string> {
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

  if (error) throw error;
  return data.id;
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  const dbUpdates: any = {};

  if (updates.title) dbUpdates.title = updates.title;
  if (updates.company) dbUpdates.company = updates.company;
  if (updates.location) dbUpdates.location = updates.location;
  if (updates.employmentType) dbUpdates.employment_type = updates.employmentType;
  if (updates.salaryRange) dbUpdates.salary_range = updates.salaryRange;
  if (updates.openPositions !== undefined) dbUpdates.open_positions = updates.openPositions;
  if (updates.hired !== undefined) dbUpdates.hired = updates.hired;
  if (updates.target !== undefined) dbUpdates.target = updates.target;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.tags) dbUpdates.tags = updates.tags;

  const { error } = await supabase
    .from('jobs')
    .update(dbUpdates)
    .eq('id', jobId);

  if (error) throw error;
}

export async function deleteJob(jobId: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', jobId);

  if (error) throw error;
}

// ============================================
// CANDIDATES OPERATIONS
// ============================================

export async function addCandidateToJob(
  jobId: string,
  candidate: Omit<Candidate, 'id'>
): Promise<string> {
  const { data, error } = await supabase
    .from('candidates')
    .insert({
      job_id: jobId,
      name: candidate.name,
      phone: candidate.phone,
      email: candidate.email || null,
      status: candidate.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateCandidate(
  jobId: string,
  candidateId: string,
  updates: Partial<Candidate>
): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .update(updates)
    .eq('id', candidateId)
    .eq('job_id', jobId);

  if (error) throw error;
}

export async function updateCandidates(jobId: string, candidates: Candidate[]): Promise<void> {
  // Delete existing candidates for this job
  const { error: deleteError } = await supabase
    .from('candidates')
    .delete()
    .eq('job_id', jobId);

  if (deleteError) throw deleteError;

  // Insert new candidates (batch)
  if (candidates.length > 0) {
    const { error: insertError } = await supabase
      .from('candidates')
      .insert(
        candidates.map((c) => ({
          job_id: jobId,
          id: c.id, // Preserve existing IDs
          name: c.name,
          phone: c.phone,
          email: c.email || null,
          status: c.status,
        }))
      );

    if (insertError) throw insertError;

    // Insert notes for each candidate
    for (const candidate of candidates) {
      if (candidate.notes && candidate.notes.length > 0) {
        const { error: notesError } = await supabase
          .from('candidate_notes')
          .insert(
            candidate.notes.map((note) => ({
              candidate_id: candidate.id,
              text: note.text,
              author: note.author,
              action_type: note.actionType || null,
              action_date: note.actionDate || null,
            }))
          );

        if (notesError) console.error('Error inserting notes:', notesError);
      }
    }
  }
}

export async function deleteCandidateFromJob(
  jobId: string,
  candidateId: string
): Promise<void> {
  const { error } = await supabase
    .from('candidates')
    .delete()
    .eq('id', candidateId)
    .eq('job_id', jobId);

  if (error) throw error;
}

// ============================================
// CANDIDATE NOTES OPERATIONS
// ============================================

export async function addCandidateNote(
  jobId: string,
  candidateId: string,
  note: Omit<CandidateNote, 'id'>
): Promise<string> {
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

  if (error) throw error;
  return data.id;
}

// ============================================
// CAMPAIGNS OPERATIONS
// ============================================

export async function loadCampaigns(): Promise<Campaign[]> {
  try {
    const { data: campaigns, error } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!campaigns) return [];

    const campaignsWithData = await Promise.all(
      campaigns.map(async (campaign) => {
        // Load targets, matrices, candidates in parallel
        const [targetsResult, matricesResult, candidatesResult] = await Promise.all([
          supabase.from('campaign_targets').select('*').eq('campaign_id', campaign.id),
          supabase.from('campaign_matrices').select('*').eq('campaign_id', campaign.id),
          supabase.from('campaign_candidates').select('*').eq('campaign_id', campaign.id),
        ]);

        return {
          id: campaign.id,
          name: campaign.name,
          jobId: campaign.job_id,
          jobTitle: campaign.job_title,
          linkJob: campaign.link_job,
          startDate: campaign.start_date,
          endDate: campaign.end_date,
          channels: campaign.channels || [],
          targets: (targetsResult.data || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            type: t.type,
            description: t.description,
            goalType: t.goal_type,
          })),
          matrices: (matricesResult.data || []).map((m: any) => ({
            id: m.id,
            name: m.name,
            description: m.description,
            whatsappMessage: m.whatsapp_message,
            callScript: m.call_script,
          })),
          totalCandidates: campaign.total_candidates,
          hired: campaign.hired,
          responseRate: campaign.response_rate,
          status: campaign.status,
          createdAt: campaign.created_at,
          candidates: (candidatesResult.data || []).map((c: any) => ({
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
            calls: [],
            whatsappMessages: [],
            notes: [],
          })),
        };
      })
    );

    return campaignsWithData;
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return [];
  }
}

export async function addCampaign(campaign: Omit<Campaign, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .from('campaigns')
    .insert({
      name: campaign.name,
      job_id: campaign.jobId,
      job_title: campaign.jobTitle,
      link_job: campaign.linkJob || null,
      start_date: campaign.startDate,
      end_date: campaign.endDate,
      channels: campaign.channels,
      total_candidates: campaign.totalCandidates,
      hired: campaign.hired,
      response_rate: campaign.responseRate,
      status: campaign.status,
    })
    .select()
    .single();

  if (error) throw error;
  
  const campaignId = data.id;

  // Insert targets
  if (campaign.targets && campaign.targets.length > 0) {
    await supabase.from('campaign_targets').insert(
      campaign.targets.map((t) => ({
        campaign_id: campaignId,
        name: t.name,
        type: t.type,
        description: t.description || null,
        goal_type: t.goalType || null,
      }))
    );
  }

  // Insert matrices
  if (campaign.matrices && campaign.matrices.length > 0) {
    await supabase.from('campaign_matrices').insert(
      campaign.matrices.map((m) => ({
        campaign_id: campaignId,
        name: m.name,
        description: m.description || null,
        whatsapp_message: m.whatsappMessage || null,
        call_script: m.callScript || null,
      }))
    );
  }

  return campaignId;
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<Campaign>
): Promise<void> {
  const dbUpdates: any = {};

  if (updates.name) dbUpdates.name = updates.name;
  if (updates.jobId) dbUpdates.job_id = updates.jobId;
  if (updates.jobTitle) dbUpdates.job_title = updates.jobTitle;
  if (updates.linkJob) dbUpdates.link_job = updates.linkJob;
  if (updates.startDate) dbUpdates.start_date = updates.startDate;
  if (updates.endDate) dbUpdates.end_date = updates.endDate;
  if (updates.channels) dbUpdates.channels = updates.channels;
  if (updates.totalCandidates !== undefined) dbUpdates.total_candidates = updates.totalCandidates;
  if (updates.hired !== undefined) dbUpdates.hired = updates.hired;
  if (updates.responseRate !== undefined) dbUpdates.response_rate = updates.responseRate;
  if (updates.status) dbUpdates.status = updates.status;

  const { error } = await supabase
    .from('campaigns')
    .update(dbUpdates)
    .eq('id', campaignId);

  if (error) throw error;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  const { error } = await supabase
    .from('campaigns')
    .delete()
    .eq('id', campaignId);

  if (error) throw error;
}

// ============================================
// DATASETS OPERATIONS
// ============================================

export async function loadDatasets(): Promise<Dataset[]> {
  try {
    const { data: datasets, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!datasets) return [];

    const datasetsWithCandidates = await Promise.all(
      datasets.map(async (dataset) => {
        const { data: candidates, error: candError } = await supabase
          .from('dataset_candidates')
          .select('*')
          .eq('dataset_id', dataset.id);

        if (candError) {
          console.error('Error loading dataset candidates:', candError);
          return convertDatasetFromDB(dataset, []);
        }

        const convertedCandidates = (candidates || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          postcode: c.postcode,
          location: c.location,
          trade: c.trade,
          blueCard: c.blue_card,
          greenCard: c.green_card,
        }));

        return convertDatasetFromDB(dataset, convertedCandidates);
      })
    );

    return datasetsWithCandidates;
  } catch (error) {
    console.error('Error loading datasets:', error);
    return [];
  }
}

function convertDatasetFromDB(dbDataset: any, candidates: any[]): Dataset {
  return {
    id: dbDataset.id,
    name: dbDataset.name,
    description: dbDataset.description,
    candidateCount: dbDataset.candidate_count,
    createdAt: dbDataset.created_at,
    lastUpdated: dbDataset.updated_at,
    source: dbDataset.source,
    candidates,
  };
}

export async function addDataset(dataset: Omit<Dataset, 'id'>): Promise<string> {
  const { data, error } = await supabase
    .from('datasets')
    .insert({
      name: dataset.name,
      description: dataset.description,
      candidate_count: dataset.candidateCount,
      source: dataset.source,
    })
    .select()
    .single();

  if (error) throw error;

  const datasetId = data.id;

  // Insert candidates if provided
  if (dataset.candidates && dataset.candidates.length > 0) {
    const { error: candError } = await supabase
      .from('dataset_candidates')
      .insert(
        dataset.candidates.map((c) => ({
          dataset_id: datasetId,
          name: c.name,
          phone: c.phone,
          postcode: c.postcode || null,
          location: c.location || null,
          trade: c.trade || null,
          blue_card: c.blueCard || false,
          green_card: c.greenCard || false,
        }))
      );

    if (candError) console.error('Error inserting candidates:', candError);
  }

  return datasetId;
}

export async function updateDataset(
  datasetId: string,
  updates: Partial<Dataset>
): Promise<void> {
  const dbUpdates: any = {};

  if (updates.name) dbUpdates.name = updates.name;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.candidateCount !== undefined) dbUpdates.candidate_count = updates.candidateCount;
  if (updates.source) dbUpdates.source = updates.source;

  const { error } = await supabase
    .from('datasets')
    .update(dbUpdates)
    .eq('id', datasetId);

  if (error) throw error;
}

export async function deleteDataset(datasetId: string): Promise<void> {
  const { error } = await supabase
    .from('datasets')
    .delete()
    .eq('id', datasetId);

  if (error) throw error;
}

// Re-export for compatibility
export { supabase };

