/**
 * MIGRATION SCRIPT: LocalStorage → Supabase
 * 
 * This script migrates all data from localStorage to Supabase database
 * Run with: npm run migrate
 */

import 'dotenv/config';
import sql from './db';
import { 
  loadJobs, 
  loadCampaigns, 
  loadDatasets 
} from '@/polymet/data/storage-manager';
import type { Job } from '@/polymet/data/jobs-data';
import type { Campaign } from '@/polymet/data/campaigns-data';
import type { Dataset } from '@/polymet/data/datasets-data';

// ============================================
// MIGRATION STATUS TRACKING
// ============================================

interface MigrationStatus {
  jobs: { total: number; migrated: number; failed: number };
  candidates: { total: number; migrated: number; failed: number };
  candidateNotes: { total: number; migrated: number; failed: number };
  campaigns: { total: number; migrated: number; failed: number };
  campaignCandidates: { total: number; migrated: number; failed: number };
  campaignTargets: { total: number; migrated: number; failed: number };
  campaignMatrices: { total: number; migrated: number; failed: number };
  callRecords: { total: number; migrated: number; failed: number };
  whatsappMessages: { total: number; migrated: number; failed: number };
  campaignNotes: { total: number; migrated: number; failed: number };
  datasets: { total: number; migrated: number; failed: number };
  datasetCandidates: { total: number; migrated: number; failed: number };
}

const migrationStatus: MigrationStatus = {
  jobs: { total: 0, migrated: 0, failed: 0 },
  candidates: { total: 0, migrated: 0, failed: 0 },
  candidateNotes: { total: 0, migrated: 0, failed: 0 },
  campaigns: { total: 0, migrated: 0, failed: 0 },
  campaignCandidates: { total: 0, migrated: 0, failed: 0 },
  campaignTargets: { total: 0, migrated: 0, failed: 0 },
  campaignMatrices: { total: 0, migrated: 0, failed: 0 },
  callRecords: { total: 0, migrated: 0, failed: 0 },
  whatsappMessages: { total: 0, migrated: 0, failed: 0 },
  campaignNotes: { total: 0, migrated: 0, failed: 0 },
  datasets: { total: 0, migrated: 0, failed: 0 },
  datasetCandidates: { total: 0, migrated: 0, failed: 0 },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function logProgress(category: string, current: number, total: number) {
  const percentage = total > 0 ? ((current / total) * 100).toFixed(1) : '0.0';
  console.log(`  ${category}: ${current}/${total} (${percentage}%)`);
}

function logStatus() {
  console.log('\n📊 Migration Status:');
  Object.entries(migrationStatus).forEach(([key, stats]) => {
    if (stats.total > 0) {
      logProgress(key, stats.migrated, stats.total);
      if (stats.failed > 0) {
        console.log(`    ⚠️  Failed: ${stats.failed}`);
      }
    }
  });
}

// ============================================
// JOBS MIGRATION
// ============================================

async function migrateJobs(jobs: Job[]): Promise<Map<string, string>> {
  console.log('\n📋 Migrating Jobs...');
  migrationStatus.jobs.total = jobs.length;
  
  const jobIdMap = new Map<string, string>(); // old ID -> new UUID
  
  for (const job of jobs) {
    try {
      // Insert job
      const [insertedJob] = await sql<{ id: string }[]>`
        INSERT INTO jobs (
          title, company, location, employment_type, salary_range,
          open_positions, hired, target, description, tags
        ) VALUES (
          ${job.title},
          ${job.company},
          ${job.location},
          ${job.employmentType},
          ${job.salaryRange},
          ${job.openPositions},
          ${job.hired},
          ${job.target},
          ${job.description},
          ${sql.array(job.tags)}
        )
        RETURNING id
      `;
      
      jobIdMap.set(job.id, insertedJob.id);
      migrationStatus.jobs.migrated++;
      console.log(`  ✅ Migrated job: ${job.title}`);
      
      // Migrate candidates for this job
      if (job.candidates && job.candidates.length > 0) {
        await migrateCandidates(job.id, job.candidates, jobIdMap);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate job: ${job.title}`, error);
      migrationStatus.jobs.failed++;
    }
  }
  
  return jobIdMap;
}

// ============================================
// CANDIDATES MIGRATION
// ============================================

async function migrateCandidates(
  oldJobId: string,
  candidates: Job['candidates'],
  jobIdMap: Map<string, string>
) {
  const newJobId = jobIdMap.get(oldJobId);
  if (!newJobId) {
    console.error(`  ❌ Job ID not found for candidates migration: ${oldJobId}`);
    return;
  }
  
  migrationStatus.candidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
      // Insert candidate
      const [insertedCandidate] = await sql<{ id: string }[]>`
        INSERT INTO candidates (
          job_id, name, phone, email, status
        ) VALUES (
          ${newJobId},
          ${candidate.name},
          ${candidate.phone},
          ${candidate.email || null},
          ${candidate.status}
        )
        RETURNING id
      `;
      
      migrationStatus.candidates.migrated++;
      
      // Migrate notes for this candidate
      if (candidate.notes && candidate.notes.length > 0) {
        await migrateCandidateNotes(insertedCandidate.id, candidate.notes);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate candidate: ${candidate.name}`, error);
      migrationStatus.candidates.failed++;
    }
  }
}

// ============================================
// CANDIDATE NOTES MIGRATION
// ============================================

async function migrateCandidateNotes(
  candidateId: string,
  notes: NonNullable<Job['candidates'][0]['notes']>
) {
  migrationStatus.candidateNotes.total += notes.length;
  
  for (const note of notes) {
    try {
      await sql`
        INSERT INTO candidate_notes (
          candidate_id, text, author, action_type, action_date, created_at
        ) VALUES (
          ${candidateId},
          ${note.text},
          ${note.author},
          ${note.actionType || null},
          ${note.actionDate || null},
          ${note.timestamp ? new Date(note.timestamp.split('/').reverse().join('-')) : new Date()}
        )
      `;
      
      migrationStatus.candidateNotes.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate candidate note`, error);
      migrationStatus.candidateNotes.failed++;
    }
  }
}

// ============================================
// CAMPAIGNS MIGRATION
// ============================================

async function migrateCampaigns(
  campaigns: Campaign[],
  jobIdMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('\n📢 Migrating Campaigns...');
  migrationStatus.campaigns.total = campaigns.length;
  
  const campaignIdMap = new Map<string, string>(); // old ID -> new UUID
  
  for (const campaign of campaigns) {
    try {
      // Map old job ID to new job ID
      const newJobId = jobIdMap.get(campaign.jobId);
      if (!newJobId) {
        console.error(`  ⚠️  Job not found for campaign: ${campaign.name} (jobId: ${campaign.jobId})`);
        migrationStatus.campaigns.failed++;
        continue;
      }
      
      // Insert campaign
      const [insertedCampaign] = await sql<{ id: string }[]>`
        INSERT INTO campaigns (
          name, job_id, job_title, link_job, start_date, end_date,
          channels, total_candidates, hired, response_rate, status, created_at
        ) VALUES (
          ${campaign.name},
          ${newJobId},
          ${campaign.jobTitle},
          ${campaign.linkJob || null},
          ${campaign.startDate},
          ${campaign.endDate},
          ${sql.array(campaign.channels)},
          ${campaign.totalCandidates},
          ${campaign.hired},
          ${campaign.responseRate},
          ${campaign.status},
          ${campaign.createdAt}
        )
        RETURNING id
      `;
      
      campaignIdMap.set(campaign.id, insertedCampaign.id);
      migrationStatus.campaigns.migrated++;
      console.log(`  ✅ Migrated campaign: ${campaign.name}`);
      
      // Migrate campaign targets
      if (campaign.targets && campaign.targets.length > 0) {
        await migrateCampaignTargets(insertedCampaign.id, campaign.targets);
      }
      
      // Migrate campaign matrices
      if (campaign.matrices && campaign.matrices.length > 0) {
        await migrateCampaignMatrices(insertedCampaign.id, campaign.matrices);
      }
      
      // Migrate campaign candidates
      if (campaign.candidates && campaign.candidates.length > 0) {
        await migrateCampaignCandidates(insertedCampaign.id, campaign.candidates);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign: ${campaign.name}`, error);
      migrationStatus.campaigns.failed++;
    }
  }
  
  return campaignIdMap;
}

// ============================================
// CAMPAIGN TARGETS MIGRATION
// ============================================

async function migrateCampaignTargets(
  campaignId: string,
  targets: Campaign['targets']
) {
  migrationStatus.campaignTargets.total += targets.length;
  
  for (const target of targets) {
    try {
      await sql`
        INSERT INTO campaign_targets (
          campaign_id, name, type, description, goal_type
        ) VALUES (
          ${campaignId},
          ${target.name},
          ${target.type},
          ${target.description || null},
          ${target.goalType || null}
        )
      `;
      
      migrationStatus.campaignTargets.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign target: ${target.name}`, error);
      migrationStatus.campaignTargets.failed++;
    }
  }
}

// ============================================
// CAMPAIGN MATRICES MIGRATION
// ============================================

async function migrateCampaignMatrices(
  campaignId: string,
  matrices: Campaign['matrices']
) {
  migrationStatus.campaignMatrices.total += matrices.length;
  
  for (const matrix of matrices) {
    try {
      await sql`
        INSERT INTO campaign_matrices (
          campaign_id, name, description, whatsapp_message, call_script
        ) VALUES (
          ${campaignId},
          ${matrix.name},
          ${matrix.description || null},
          ${matrix.whatsappMessage || null},
          ${matrix.callScript || null}
        )
      `;
      
      migrationStatus.campaignMatrices.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign matrix: ${matrix.name}`, error);
      migrationStatus.campaignMatrices.failed++;
    }
  }
}

// ============================================
// CAMPAIGN CANDIDATES MIGRATION
// ============================================

async function migrateCampaignCandidates(
  campaignId: string,
  candidates: NonNullable<Campaign['candidates']>
) {
  migrationStatus.campaignCandidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
      // Insert campaign candidate
      const [insertedCandidate] = await sql<{ id: string }[]>`
        INSERT INTO campaign_candidates (
          campaign_id, forename, surname, tel_mobile, email,
          call_status, available_to_work, interested, know_referee,
          last_contact, experience
        ) VALUES (
          ${campaignId},
          ${candidate.forename},
          ${candidate.surname},
          ${candidate.telMobile},
          ${candidate.email || null},
          ${candidate.callStatus},
          ${candidate.availableToWork},
          ${candidate.interested},
          ${candidate.knowReferee},
          ${candidate.lastContact || null},
          ${candidate.experience || null}
        )
        RETURNING id
      `;
      
      migrationStatus.campaignCandidates.migrated++;
      
      // Migrate call records
      if (candidate.calls && candidate.calls.length > 0) {
        await migrateCallRecords(insertedCandidate.id, candidate.calls);
      }
      
      // Migrate WhatsApp messages
      if (candidate.whatsappMessages && candidate.whatsappMessages.length > 0) {
        await migrateWhatsAppMessages(insertedCandidate.id, candidate.whatsappMessages);
      }
      
      // Migrate notes
      if (candidate.notes && candidate.notes.length > 0) {
        await migrateCampaignCandidateNotes(insertedCandidate.id, candidate.notes);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign candidate: ${candidate.forename} ${candidate.surname}`, error);
      migrationStatus.campaignCandidates.failed++;
    }
  }
}

// ============================================
// CALL RECORDS MIGRATION
// ============================================

async function migrateCallRecords(
  campaignCandidateId: string,
  calls: NonNullable<Campaign['candidates']>[0]['calls']
) {
  migrationStatus.callRecords.total += calls.length;
  
  for (const call of calls) {
    try {
      // Insert call record
      const [insertedCall] = await sql<{ id: string }[]>`
        INSERT INTO call_records (
          campaign_candidate_id, call_id, phone_from, phone_to,
          duration, available_to_work, interested, know_referee,
          created_at
        ) VALUES (
          ${campaignCandidateId},
          ${call.callId},
          ${call.phoneFrom},
          ${call.phoneTo},
          ${call.duration},
          ${call.availableToWork},
          ${call.interested},
          ${call.knowReferee},
          ${call.timestamp}
        )
        RETURNING id
      `;
      
      migrationStatus.callRecords.migrated++;
      
      // Migrate transcript messages
      if (call.transcript && call.transcript.length > 0) {
        await migrateCallTranscripts(insertedCall.id, call.transcript);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate call record: ${call.callId}`, error);
      migrationStatus.callRecords.failed++;
    }
  }
}

// ============================================
// CALL TRANSCRIPTS MIGRATION
// ============================================

async function migrateCallTranscripts(
  callRecordId: string,
  transcripts: NonNullable<Campaign['candidates']>[0]['calls'][0]['transcript']
) {
  for (let i = 0; i < transcripts.length; i++) {
    const transcript = transcripts[i];
    try {
      await sql`
        INSERT INTO call_transcript_messages (
          call_record_id, speaker, message, timestamp, sequence
        ) VALUES (
          ${callRecordId},
          ${transcript.speaker},
          ${transcript.message},
          ${transcript.timestamp || null},
          ${i}
        )
      `;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate call transcript message`, error);
    }
  }
}

// ============================================
// WHATSAPP MESSAGES MIGRATION
// ============================================

async function migrateWhatsAppMessages(
  campaignCandidateId: string,
  messages: NonNullable<Campaign['candidates']>[0]['whatsappMessages']
) {
  if (!messages) return;
  
  migrationStatus.whatsappMessages.total += messages.length;
  
  for (const message of messages) {
    try {
      await sql`
        INSERT INTO whatsapp_messages (
          campaign_candidate_id, sender, text, status, created_at
        ) VALUES (
          ${campaignCandidateId},
          ${message.sender},
          ${message.text},
          ${message.status || null},
          ${message.timestamp}
        )
      `;
      
      migrationStatus.whatsappMessages.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate WhatsApp message`, error);
      migrationStatus.whatsappMessages.failed++;
    }
  }
}

// ============================================
// CAMPAIGN CANDIDATE NOTES MIGRATION
// ============================================

async function migrateCampaignCandidateNotes(
  campaignCandidateId: string,
  notes: NonNullable<Campaign['candidates']>[0]['notes']
) {
  if (!notes) return;
  
  migrationStatus.campaignNotes.total += notes.length;
  
  for (const note of notes) {
    try {
      await sql`
        INSERT INTO campaign_candidate_notes (
          campaign_candidate_id, text, author, action_type, action_date, created_at
        ) VALUES (
          ${campaignCandidateId},
          ${note.text},
          ${note.author},
          ${note.actionType || null},
          ${note.actionDate || null},
          ${note.timestamp}
        )
      `;
      
      migrationStatus.campaignNotes.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign candidate note`, error);
      migrationStatus.campaignNotes.failed++;
    }
  }
}

// ============================================
// DATASETS MIGRATION
// ============================================

async function migrateDatasets(datasets: Dataset[]) {
  console.log('\n📦 Migrating Datasets...');
  migrationStatus.datasets.total = datasets.length;
  
  for (const dataset of datasets) {
    try {
      // Insert dataset
      const [insertedDataset] = await sql<{ id: string }[]>`
        INSERT INTO datasets (
          name, description, candidate_count, source, created_at, updated_at
        ) VALUES (
          ${dataset.name},
          ${dataset.description},
          ${dataset.candidateCount},
          ${dataset.source},
          ${dataset.createdAt},
          ${dataset.lastUpdated}
        )
        RETURNING id
      `;
      
      migrationStatus.datasets.migrated++;
      console.log(`  ✅ Migrated dataset: ${dataset.name}`);
      
      // Migrate dataset candidates
      if (dataset.candidates && dataset.candidates.length > 0) {
        await migrateDatasetCandidates(insertedDataset.id, dataset.candidates);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate dataset: ${dataset.name}`, error);
      migrationStatus.datasets.failed++;
    }
  }
}

// ============================================
// DATASET CANDIDATES MIGRATION
// ============================================

async function migrateDatasetCandidates(
  datasetId: string,
  candidates: Dataset['candidates']
) {
  migrationStatus.datasetCandidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
      await sql`
        INSERT INTO dataset_candidates (
          dataset_id, name, phone, postcode, location, trade, blue_card, green_card
        ) VALUES (
          ${datasetId},
          ${candidate.name},
          ${candidate.phone},
          ${candidate.postcode || null},
          ${candidate.location || null},
          ${candidate.trade || null},
          ${candidate.blueCard || false},
          ${candidate.greenCard || false}
        )
      `;
      
      migrationStatus.datasetCandidates.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate dataset candidate: ${candidate.name}`, error);
      migrationStatus.datasetCandidates.failed++;
    }
  }
}

// ============================================
// MAIN MIGRATION FUNCTION
// ============================================

export async function migrateAllData() {
  console.log('🚀 Starting migration from localStorage to Supabase...\n');
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await sql`SELECT NOW()`;
    console.log('✅ Database connection successful!\n');
    
    // Load data from localStorage
    console.log('📥 Loading data from localStorage...');
    const jobs = loadJobs([]);
    const campaigns = loadCampaigns([]);
    const datasets = loadDatasets([]);
    
    console.log(`  Found: ${jobs.length} jobs, ${campaigns.length} campaigns, ${datasets.length} datasets\n`);
    
    if (jobs.length === 0 && campaigns.length === 0 && datasets.length === 0) {
      console.log('⚠️  No data found in localStorage. Nothing to migrate.');
      return;
    }
    
    // Confirm migration
    console.log('⚠️  This will clear existing data and migrate from localStorage.');
    console.log('Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sql`TRUNCATE TABLE jobs, campaigns, datasets CASCADE`;
    console.log('✅ Existing data cleared\n');
    
    // Migrate jobs (includes candidates and notes)
    const jobIdMap = await migrateJobs(jobs);
    
    // Migrate campaigns (includes all nested data)
    const campaignIdMap = await migrateCampaigns(campaigns, jobIdMap);
    
    // Migrate datasets (includes dataset candidates)
    await migrateDatasets(datasets);
    
    // Final status
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    logStatus();
    
    // Summary
    const totalMigrated = Object.values(migrationStatus).reduce((sum, stat) => sum + stat.migrated, 0);
    const totalFailed = Object.values(migrationStatus).reduce((sum, stat) => sum + stat.failed, 0);
    
    console.log(`\n✅ Total migrated: ${totalMigrated}`);
    if (totalFailed > 0) {
      console.log(`⚠️  Total failed: ${totalFailed}`);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Update your app to use Supabase instead of localStorage');
    console.log('2. Test the application with the migrated data');
    console.log('3. Remove localStorage dependencies when ready\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration if called directly (ES modules don't have require.main)
// This will run when executed with tsx
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateAllData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

