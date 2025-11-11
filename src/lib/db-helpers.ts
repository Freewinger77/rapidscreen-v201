/**
 * Database Helper Functions
 * 
 * Common database queries and operations
 */

import sql from './db';
import type {
  Job,
  KanbanColumn,
  Candidate,
  CandidateNote,
  Campaign,
  CampaignCandidate,
  Dataset,
} from './database-types';

// ============================================
// JOBS
// ============================================

export async function getAllJobs(): Promise<Job[]> {
  return await sql<Job[]>`
    SELECT * FROM jobs 
    ORDER BY created_at DESC
  `;
}

export async function getJobById(jobId: string): Promise<Job | null> {
  const [job] = await sql<Job[]>`
    SELECT * FROM jobs 
    WHERE id = ${jobId}
  `;
  return job || null;
}

export async function createJob(jobData: {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  openPositions: number;
  target: number;
  description?: string;
  tags?: string[];
}): Promise<Job> {
  const [job] = await sql<Job[]>`
    INSERT INTO jobs (
      title, company, location, employment_type, salary_range, 
      open_positions, target, description, tags
    )
    VALUES (
      ${jobData.title}, 
      ${jobData.company}, 
      ${jobData.location}, 
      ${jobData.employmentType}, 
      ${jobData.salaryRange}, 
      ${jobData.openPositions}, 
      ${jobData.target}, 
      ${jobData.description || null}, 
      ${sql.array(jobData.tags || [])}
    )
    RETURNING *
  `;
  return job;
}

export async function updateJob(
  jobId: string,
  updates: Partial<Job>
): Promise<Job> {
  const [job] = await sql<Job[]>`
    UPDATE jobs 
    SET ${sql(updates, 'title', 'company', 'location', 'employment_type', 'salary_range', 'open_positions', 'hired', 'target', 'description', 'tags')}
    WHERE id = ${jobId}
    RETURNING *
  `;
  return job;
}

export async function deleteJob(jobId: string): Promise<void> {
  await sql`DELETE FROM jobs WHERE id = ${jobId}`;
}

// ============================================
// KANBAN COLUMNS
// ============================================

export async function getKanbanColumns(jobId: string): Promise<KanbanColumn[]> {
  return await sql<KanbanColumn[]>`
    SELECT * FROM kanban_columns 
    WHERE job_id = ${jobId}
    ORDER BY position ASC
  `;
}

export async function createKanbanColumn(columnData: {
  jobId: string;
  title: string;
  statusKey: string;
  color: string;
  position: number;
}): Promise<KanbanColumn> {
  const [column] = await sql<KanbanColumn[]>`
    INSERT INTO kanban_columns (job_id, title, status_key, color, position)
    VALUES (${columnData.jobId}, ${columnData.title}, ${columnData.statusKey}, ${columnData.color}, ${columnData.position})
    RETURNING *
  `;
  return column;
}

export async function updateKanbanColumn(
  columnId: string,
  updates: { title?: string; color?: string; position?: number }
): Promise<KanbanColumn> {
  const [column] = await sql<KanbanColumn[]>`
    UPDATE kanban_columns 
    SET ${sql(updates, 'title', 'color', 'position')}
    WHERE id = ${columnId}
    RETURNING *
  `;
  return column;
}

export async function deleteKanbanColumn(columnId: string): Promise<void> {
  await sql`DELETE FROM kanban_columns WHERE id = ${columnId}`;
}

// ============================================
// CANDIDATES
// ============================================

export async function getCandidatesByJob(jobId: string): Promise<Candidate[]> {
  return await sql<Candidate[]>`
    SELECT * FROM candidates 
    WHERE job_id = ${jobId}
    ORDER BY position ASC
  `;
}

export async function getCandidatesByStatus(
  jobId: string,
  status: string
): Promise<Candidate[]> {
  return await sql<Candidate[]>`
    SELECT * FROM candidates 
    WHERE job_id = ${jobId} AND status = ${status}
    ORDER BY position ASC
  `;
}

export async function createCandidate(candidateData: {
  jobId: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  position?: number;
}): Promise<Candidate> {
  const [candidate] = await sql<Candidate[]>`
    INSERT INTO candidates (job_id, name, phone, email, status, position)
    VALUES (
      ${candidateData.jobId}, 
      ${candidateData.name}, 
      ${candidateData.phone}, 
      ${candidateData.email || null}, 
      ${candidateData.status}, 
      ${candidateData.position || 0}
    )
    RETURNING *
  `;
  return candidate;
}

export async function updateCandidate(
  candidateId: string,
  updates: Partial<Candidate>
): Promise<Candidate> {
  const [candidate] = await sql<Candidate[]>`
    UPDATE candidates 
    SET ${sql(updates, 'name', 'phone', 'email', 'status', 'position')}
    WHERE id = ${candidateId}
    RETURNING *
  `;
  return candidate;
}

export async function moveCandidateToColumn(
  candidateId: string,
  newStatus: string,
  newPosition: number
): Promise<Candidate> {
  const [candidate] = await sql<Candidate[]>`
    UPDATE candidates 
    SET status = ${newStatus}, position = ${newPosition}
    WHERE id = ${candidateId}
    RETURNING *
  `;
  return candidate;
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  await sql`DELETE FROM candidates WHERE id = ${candidateId}`;
}

// ============================================
// CANDIDATE NOTES
// ============================================

export async function getCandidateNotes(
  candidateId: string
): Promise<CandidateNote[]> {
  return await sql<CandidateNote[]>`
    SELECT * FROM candidate_notes 
    WHERE candidate_id = ${candidateId}
    ORDER BY created_at DESC
  `;
}

export async function createCandidateNote(noteData: {
  candidateId: string;
  text: string;
  author: string;
  actionType?: string;
  actionDate?: string;
}): Promise<CandidateNote> {
  const [note] = await sql<CandidateNote[]>`
    INSERT INTO candidate_notes (candidate_id, text, author, action_type, action_date)
    VALUES (
      ${noteData.candidateId}, 
      ${noteData.text}, 
      ${noteData.author}, 
      ${noteData.actionType || null}, 
      ${noteData.actionDate || null}
    )
    RETURNING *
  `;
  return note;
}

export async function updateCandidateNote(
  noteId: string,
  updates: { text?: string; actionType?: string; actionDate?: string }
): Promise<CandidateNote> {
  const [note] = await sql<CandidateNote[]>`
    UPDATE candidate_notes 
    SET ${sql(updates, 'text', 'action_type', 'action_date')}
    WHERE id = ${noteId}
    RETURNING *
  `;
  return note;
}

export async function deleteCandidateNote(noteId: string): Promise<void> {
  await sql`DELETE FROM candidate_notes WHERE id = ${noteId}`;
}

// ============================================
// CAMPAIGNS
// ============================================

export async function getAllCampaigns(): Promise<Campaign[]> {
  return await sql<Campaign[]>`
    SELECT * FROM campaigns 
    ORDER BY created_at DESC
  `;
}

export async function getCampaignById(campaignId: string): Promise<Campaign | null> {
  const [campaign] = await sql<Campaign[]>`
    SELECT * FROM campaigns 
    WHERE id = ${campaignId}
  `;
  return campaign || null;
}

export async function getCampaignsByJob(jobId: string): Promise<Campaign[]> {
  return await sql<Campaign[]>`
    SELECT * FROM campaigns 
    WHERE job_id = ${jobId}
    ORDER BY created_at DESC
  `;
}

export async function createCampaign(campaignData: {
  name: string;
  jobId: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  channels: string[];
  status?: 'active' | 'draft' | 'completed';
}): Promise<Campaign> {
  const [campaign] = await sql<Campaign[]>`
    INSERT INTO campaigns (
      name, job_id, job_title, start_date, end_date, channels, status
    )
    VALUES (
      ${campaignData.name},
      ${campaignData.jobId},
      ${campaignData.jobTitle},
      ${campaignData.startDate},
      ${campaignData.endDate},
      ${sql.array(campaignData.channels)},
      ${campaignData.status || 'draft'}
    )
    RETURNING *
  `;
  return campaign;
}

export async function updateCampaign(
  campaignId: string,
  updates: Partial<Campaign>
): Promise<Campaign> {
  const [campaign] = await sql<Campaign[]>`
    UPDATE campaigns 
    SET ${sql(updates, 'name', 'start_date', 'end_date', 'channels', 'status', 'hired', 'response_rate')}
    WHERE id = ${campaignId}
    RETURNING *
  `;
  return campaign;
}

export async function deleteCampaign(campaignId: string): Promise<void> {
  await sql`DELETE FROM campaigns WHERE id = ${campaignId}`;
}

// ============================================
// CAMPAIGN CANDIDATES
// ============================================

export async function getCampaignCandidates(
  campaignId: string
): Promise<CampaignCandidate[]> {
  return await sql<CampaignCandidate[]>`
    SELECT * FROM campaign_candidates 
    WHERE campaign_id = ${campaignId}
    ORDER BY created_at DESC
  `;
}

export async function createCampaignCandidate(
  candidateData: Omit<CampaignCandidate, 'id' | 'created_at' | 'updated_at'>
): Promise<CampaignCandidate> {
  const [candidate] = await sql<CampaignCandidate[]>`
    INSERT INTO campaign_candidates (
      campaign_id, forename, surname, tel_mobile, email, call_status,
      available_to_work, interested, know_referee, last_contact, experience
    )
    VALUES (
      ${candidateData.campaign_id},
      ${candidateData.forename},
      ${candidateData.surname},
      ${candidateData.tel_mobile},
      ${candidateData.email || null},
      ${candidateData.call_status || 'not_called'},
      ${candidateData.available_to_work},
      ${candidateData.interested},
      ${candidateData.know_referee},
      ${candidateData.last_contact || null},
      ${candidateData.experience || null}
    )
    RETURNING *
  `;
  return candidate;
}

// ============================================
// DATASETS
// ============================================

export async function getAllDatasets(): Promise<Dataset[]> {
  return await sql<Dataset[]>`
    SELECT * FROM datasets 
    ORDER BY created_at DESC
  `;
}

export async function getDatasetById(datasetId: string): Promise<Dataset | null> {
  const [dataset] = await sql<Dataset[]>`
    SELECT * FROM datasets 
    WHERE id = ${datasetId}
  `;
  return dataset || null;
}

export async function createDataset(datasetData: {
  name: string;
  description?: string;
  source: 'csv' | 'manual' | 'imported';
}): Promise<Dataset> {
  const [dataset] = await sql<Dataset[]>`
    INSERT INTO datasets (name, description, source)
    VALUES (${datasetData.name}, ${datasetData.description || null}, ${datasetData.source})
    RETURNING *
  `;
  return dataset;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

