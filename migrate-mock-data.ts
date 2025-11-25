/**
 * MIGRATION SCRIPT: Mock Data → Supabase
 * 
 * This script migrates the mock data from data files to Supabase
 */

import 'dotenv/config';
import sql from './src/lib/db';
import { jobsData } from './src/polymet/data/jobs-data';
import { campaignsData } from './src/polymet/data/campaigns-data';
import { datasetsData } from './src/polymet/data/datasets-data';

// Use the same migration logic but with imported data
import type { Job } from './src/polymet/data/jobs-data';
import type { Campaign } from './src/polymet/data/campaigns-data';
import type { Dataset } from './src/polymet/data/datasets-data';

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

// Helper functions
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

// Migration functions (simplified versions)
async function migrateJobs(jobs: Job[]): Promise<Map<string, string>> {
  console.log('\n📋 Migrating Jobs...');
  migrationStatus.jobs.total = jobs.length;
  
  const jobIdMap = new Map<string, string>();
  
  for (const job of jobs) {
    try {
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
      
      // Migrate candidates
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

async function migrateCandidates(
  oldJobId: string,
  candidates: Job['candidates'],
  jobIdMap: Map<string, string>
) {
  const newJobId = jobIdMap.get(oldJobId);
  if (!newJobId) return;
  
  migrationStatus.candidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
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
      
      // Migrate notes
      if (candidate.notes && candidate.notes.length > 0) {
        await migrateCandidateNotes(insertedCandidate.id, candidate.notes);
      }
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate candidate: ${candidate.name}`, error);
      migrationStatus.candidates.failed++;
    }
  }
}

async function migrateCandidateNotes(
  candidateId: string,
  notes: NonNullable<Job['candidates'][0]['notes']>
) {
  migrationStatus.candidateNotes.total += notes.length;
  
  for (const note of notes) {
    try {
      // Parse the timestamp which is in format "15/01/2024 14:30"
      let createdAt: Date;
      try {
        const [datePart, timePart] = note.timestamp.split(' ');
        const [day, month, year] = datePart.split('/');
        createdAt = new Date(`${year}-${month}-${day}T${timePart || '00:00'}:00Z`);
      } catch {
        createdAt = new Date();
      }
      
      await sql`
        INSERT INTO candidate_notes (
          candidate_id, text, author, action_type, action_date, created_at
        ) VALUES (
          ${candidateId},
          ${note.text},
          ${note.author},
          ${note.actionType || null},
          ${note.actionDate || null},
          ${createdAt}
        )
      `;
      
      migrationStatus.candidateNotes.migrated++;
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate candidate note`, error);
      migrationStatus.candidateNotes.failed++;
    }
  }
}

async function migrateCampaigns(
  campaigns: Campaign[],
  jobIdMap: Map<string, string>
): Promise<Map<string, string>> {
  console.log('\n📢 Migrating Campaigns...');
  migrationStatus.campaigns.total = campaigns.length;
  
  const campaignIdMap = new Map<string, string>();
  
  for (const campaign of campaigns) {
    try {
      const newJobId = jobIdMap.get(campaign.jobId);
      if (!newJobId) {
        console.error(`  ⚠️  Job not found for campaign: ${campaign.name}`);
        migrationStatus.campaigns.failed++;
        continue;
      }
      
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
      
      // Migrate nested data
      if (campaign.targets) await migrateCampaignTargets(insertedCampaign.id, campaign.targets);
      if (campaign.matrices) await migrateCampaignMatrices(insertedCampaign.id, campaign.matrices);
      if (campaign.candidates) await migrateCampaignCandidates(insertedCampaign.id, campaign.candidates);
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate campaign: ${campaign.name}`, error);
      migrationStatus.campaigns.failed++;
    }
  }
  
  return campaignIdMap;
}

async function migrateCampaignTargets(campaignId: string, targets: Campaign['targets']) {
  migrationStatus.campaignTargets.total += targets.length;
  
  for (const target of targets) {
    try {
      await sql`
        INSERT INTO campaign_targets (campaign_id, name, type, description, goal_type)
        VALUES (${campaignId}, ${target.name}, ${target.type}, ${target.description || null}, ${target.goalType || null})
      `;
      migrationStatus.campaignTargets.migrated++;
    } catch (error) {
      migrationStatus.campaignTargets.failed++;
    }
  }
}

async function migrateCampaignMatrices(campaignId: string, matrices: Campaign['matrices']) {
  migrationStatus.campaignMatrices.total += matrices.length;
  
  for (const matrix of matrices) {
    try {
      await sql`
        INSERT INTO campaign_matrices (campaign_id, name, description, whatsapp_message, call_script)
        VALUES (${campaignId}, ${matrix.name}, ${matrix.description || null}, ${matrix.whatsappMessage || null}, ${matrix.callScript || null})
      `;
      migrationStatus.campaignMatrices.migrated++;
    } catch (error) {
      migrationStatus.campaignMatrices.failed++;
    }
  }
}

async function migrateCampaignCandidates(campaignId: string, candidates: NonNullable<Campaign['candidates']>) {
  migrationStatus.campaignCandidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
      const [insertedCandidate] = await sql<{ id: string }[]>`
        INSERT INTO campaign_candidates (
          campaign_id, forename, surname, tel_mobile, email,
          call_status, available_to_work, interested, know_referee,
          last_contact, experience
        ) VALUES (
          ${campaignId}, ${candidate.forename}, ${candidate.surname}, ${candidate.telMobile},
          ${candidate.email || null}, ${candidate.callStatus}, ${candidate.availableToWork},
          ${candidate.interested}, ${candidate.knowReferee}, ${candidate.lastContact || null},
          ${candidate.experience || null}
        )
        RETURNING id
      `;
      
      migrationStatus.campaignCandidates.migrated++;
      
      // Migrate calls, WhatsApp messages, and notes
      if (candidate.calls) await migrateCallRecords(insertedCandidate.id, candidate.calls);
      if (candidate.whatsappMessages) await migrateWhatsAppMessages(insertedCandidate.id, candidate.whatsappMessages);
      if (candidate.notes) await migrateCampaignCandidateNotes(insertedCandidate.id, candidate.notes);
      
    } catch (error) {
      migrationStatus.campaignCandidates.failed++;
    }
  }
}

async function migrateCallRecords(campaignCandidateId: string, calls: any[]) {
  migrationStatus.callRecords.total += calls.length;
  
  for (const call of calls) {
    try {
      const [insertedCall] = await sql<{ id: string }[]>`
        INSERT INTO call_records (
          campaign_candidate_id, call_id, phone_from, phone_to,
          duration, available_to_work, interested, know_referee, created_at
        ) VALUES (
          ${campaignCandidateId}, ${call.callId}, ${call.phoneFrom}, ${call.phoneTo},
          ${call.duration}, ${call.availableToWork}, ${call.interested}, ${call.knowReferee},
          ${call.timestamp}
        )
        RETURNING id
      `;
      
      migrationStatus.callRecords.migrated++;
      
      // Migrate transcripts
      if (call.transcript) {
        for (let i = 0; i < call.transcript.length; i++) {
          const t = call.transcript[i];
          await sql`
            INSERT INTO call_transcript_messages (call_record_id, speaker, message, timestamp, sequence)
            VALUES (${insertedCall.id}, ${t.speaker}, ${t.message}, ${t.timestamp || null}, ${i})
          `;
        }
      }
    } catch (error) {
      migrationStatus.callRecords.failed++;
    }
  }
}

async function migrateWhatsAppMessages(campaignCandidateId: string, messages: any[]) {
  migrationStatus.whatsappMessages.total += messages.length;
  
  for (const message of messages) {
    try {
      await sql`
        INSERT INTO whatsapp_messages (campaign_candidate_id, sender, text, status, created_at)
        VALUES (${campaignCandidateId}, ${message.sender}, ${message.text}, ${message.status || null}, ${message.timestamp})
      `;
      migrationStatus.whatsappMessages.migrated++;
    } catch (error) {
      migrationStatus.whatsappMessages.failed++;
    }
  }
}

async function migrateCampaignCandidateNotes(campaignCandidateId: string, notes: any[]) {
  migrationStatus.campaignNotes.total += notes.length;
  
  for (const note of notes) {
    try {
      await sql`
        INSERT INTO campaign_candidate_notes (campaign_candidate_id, text, author, action_type, action_date, created_at)
        VALUES (${campaignCandidateId}, ${note.text}, ${note.author}, ${note.actionType || null}, ${note.actionDate || null}, ${note.timestamp})
      `;
      migrationStatus.campaignNotes.migrated++;
    } catch (error) {
      migrationStatus.campaignNotes.failed++;
    }
  }
}

async function migrateDatasets(datasets: Dataset[]) {
  console.log('\n📦 Migrating Datasets...');
  migrationStatus.datasets.total = datasets.length;
  
  for (const dataset of datasets) {
    try {
      const [insertedDataset] = await sql<{ id: string }[]>`
        INSERT INTO datasets (name, description, candidate_count, source, created_at, updated_at)
        VALUES (${dataset.name}, ${dataset.description}, ${dataset.candidateCount}, ${dataset.source}, ${dataset.createdAt}, ${dataset.lastUpdated})
        RETURNING id
      `;
      
      migrationStatus.datasets.migrated++;
      console.log(`  ✅ Migrated dataset: ${dataset.name}`);
      
      // Migrate dataset candidates
      if (dataset.candidates) await migrateDatasetCandidates(insertedDataset.id, dataset.candidates);
      
    } catch (error) {
      console.error(`  ❌ Failed to migrate dataset: ${dataset.name}`, error);
      migrationStatus.datasets.failed++;
    }
  }
}

async function migrateDatasetCandidates(datasetId: string, candidates: Dataset['candidates']) {
  migrationStatus.datasetCandidates.total += candidates.length;
  
  for (const candidate of candidates) {
    try {
      await sql`
        INSERT INTO dataset_candidates (dataset_id, name, phone, postcode, location, trade, blue_card, green_card)
        VALUES (${datasetId}, ${candidate.name}, ${candidate.phone}, ${candidate.postcode || null}, 
                ${candidate.location || null}, ${candidate.trade || null}, ${candidate.blueCard || false}, 
                ${candidate.greenCard || false})
      `;
      migrationStatus.datasetCandidates.migrated++;
    } catch (error) {
      migrationStatus.datasetCandidates.failed++;
    }
  }
}

// Main migration function
async function migrateAllData() {
  console.log('🚀 Starting migration of mock data to Supabase...\n');
  
  try {
    // Test connection
    console.log('🔌 Testing database connection...');
    await sql`SELECT NOW()`;
    console.log('✅ Database connection successful!\n');
    
    console.log(`📥 Loading mock data...`);
    console.log(`  Found: ${jobsData.length} jobs, ${campaignsData.length} campaigns, ${datasetsData.length} datasets\n`);
    
    if (jobsData.length === 0 && campaignsData.length === 0 && datasetsData.length === 0) {
      console.log('⚠️  No data found. Nothing to migrate.');
      return;
    }
    
    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await sql`TRUNCATE TABLE jobs, campaigns, datasets CASCADE`;
    console.log('✅ Existing data cleared\n');
    
    // Migrate
    const jobIdMap = await migrateJobs(jobsData);
    const campaignIdMap = await migrateCampaigns(campaignsData, jobIdMap);
    await migrateDatasets(datasetsData);
    
    // Final status
    console.log('\n' + '='.repeat(60));
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('='.repeat(60));
    logStatus();
    
    const totalMigrated = Object.values(migrationStatus).reduce((sum, stat) => sum + stat.migrated, 0);
    const totalFailed = Object.values(migrationStatus).reduce((sum, stat) => sum + stat.failed, 0);
    
    console.log(`\n✅ Total migrated: ${totalMigrated}`);
    if (totalFailed > 0) {
      console.log(`⚠️  Total failed: ${totalFailed}`);
    }
    
    console.log('\n🚀 Next steps:');
    console.log('1. Run: npm run db:test');
    console.log('2. Update your app to use Supabase storage');
    console.log('3. Test the application\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrateAllData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

