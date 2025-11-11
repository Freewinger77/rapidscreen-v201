/**
 * Data Migration Script (Supabase Client)
 * 
 * Migrates all mock data to Supabase database using Supabase JS client
 * Run: npm run db:migrate
 */

import { createClient } from '@supabase/supabase-js';
import { jobsData } from './src/polymet/data/jobs-data';
import { campaignsData } from './src/polymet/data/campaigns-data';
import { datasetsData } from './src/polymet/data/datasets-data';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://suawkwvaevvucyeupdnr.supabase.co';
// Use service role key for migrations (bypasses RLS)
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1YXdrd3ZhZXZ2dWN5ZXVwZG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMTQzNzksImV4cCI6MjA3Nzc5MDM3OX0.1fTFP1PWNvOl2ajuFbx39hTxEDAMkgr0yh_XSpazfhU';

if (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY) {
  console.log('✅ Using service role key (RLS bypassed)\n');
} else {
  console.log('⚠️  Using anon key - migration may fail due to RLS');
  console.log('📝 Add VITE_SUPABASE_SERVICE_ROLE_KEY to .env for migrations');
  console.log('   See RLS_FIX.md for details\n');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('🚀 Starting data migration to Supabase...\n');

  try {
    // Test connection first
    console.log('Step 1: Testing database connection...');
    const { error: testError } = await supabase.from('jobs').select('count').limit(1);
    
    if (testError) {
      console.error('❌ Connection failed:', testError.message);
      console.log('\n📝 Make sure you ran the SQL schema in Supabase SQL Editor!');
      return;
    }
    
    console.log('✅ Connected to database\n');

    // ============================================
    // MIGRATE JOBS
    // ============================================
    console.log('Step 2: Migrating jobs...');
    
    for (const job of jobsData) {
      console.log(`  📋 Creating job: "${job.title}"`);
      
      // Insert job (let Supabase generate UUID)
      const { data: newJob, error: jobError } = await supabase
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
          tags: job.tags
        })
        .select()
        .single();

      if (jobError) {
        console.error(`     ❌ Error creating job:`, jobError.message);
        continue;
      }

      console.log(`     ✅ Job created with ${job.candidates.length} candidates`);

      // Migrate candidates for this job
      if (job.candidates && job.candidates.length > 0) {
        for (const candidate of job.candidates) {
          const { data: newCandidate, error: candidateError } = await supabase
            .from('candidates')
            .insert({
              job_id: newJob.id,
              name: candidate.name,
              phone: candidate.phone,
              email: candidate.email || null,
              status: candidate.status,
              position: 0
            })
            .select()
            .single();

          if (candidateError) {
            console.error(`        ❌ Error creating candidate:`, candidateError.message);
            continue;
          }

          // Migrate candidate notes
          if (candidateError || !newCandidate) continue;
          
          if (candidate.notes && candidate.notes.length > 0) {
            for (const note of candidate.notes) {
              await supabase
                .from('candidate_notes')
                .insert({
                  candidate_id: newCandidate.id,
                  text: note.text,
                  author: note.author,
                  action_type: note.actionType || null,
                  action_date: note.actionDate || null
                });
            }
          }
        }
      }
    }

    const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
    const { count: candidateCount } = await supabase.from('candidates').select('*', { count: 'exact', head: true });
    const { count: notesCount } = await supabase.from('candidate_notes').select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Jobs migrated: ${jobCount} jobs, ${candidateCount} candidates, ${notesCount} notes\n`);

    // ============================================
    // MIGRATE CAMPAIGNS
    // ============================================
    console.log('Step 3: Migrating campaigns...');

    for (const campaign of campaignsData) {
      console.log(`  📢 Creating campaign: "${campaign.name}"`);

      // Get the job ID (we need to match by job title since IDs changed)
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('title', campaign.jobTitle)
        .single();
      
      if (!existingJob) continue;

      // Insert campaign
      const { data: newCampaign, error: campaignError } = await supabase
        .from('campaigns')
        .insert({
          name: campaign.name,
          job_id: existingJob.id,
          job_title: campaign.jobTitle,
          link_job: campaign.linkJob || null,
          start_date: campaign.startDate,
          end_date: campaign.endDate,
          channels: campaign.channels,
          total_candidates: campaign.totalCandidates,
          hired: campaign.hired,
          response_rate: campaign.responseRate,
          status: campaign.status
        })
        .select()
        .single();

      if (campaignError) {
        console.error(`     ❌ Error creating campaign:`, campaignError.message);
        continue;
      }

      // Migrate campaign targets
      if (campaign.targets && campaign.targets.length > 0) {
        for (const target of campaign.targets) {
          await supabase
            .from('campaign_targets')
            .insert({
              campaign_id: newCampaign.id,
              name: target.name,
              type: target.type,
              description: target.description || null,
              goal_type: target.goalType || null
            });
        }
      }

      // Migrate campaign matrices
      if (campaign.matrices && campaign.matrices.length > 0) {
        for (const matrix of campaign.matrices) {
          await supabase
            .from('campaign_matrices')
            .insert({
              campaign_id: newCampaign.id,
              name: matrix.name,
              description: matrix.description || null,
              whatsapp_message: matrix.whatsappMessage || null,
              call_script: matrix.callScript || null
            });
        }
      }

      // Migrate campaign candidates
      if (campaign.candidates && campaign.candidates.length > 0) {
        for (const candidate of campaign.candidates) {
          const { data: newCampaignCandidate, error: candidateError } = await supabase
            .from('campaign_candidates')
            .insert({
              campaign_id: newCampaign.id,
              forename: candidate.forename,
              surname: candidate.surname,
              tel_mobile: candidate.telMobile,
              email: candidate.email || null,
              call_status: candidate.callStatus,
              available_to_work: candidate.availableToWork,
              interested: candidate.interested,
              know_referee: candidate.knowReferee,
              last_contact: candidate.lastContact || null,
              experience: candidate.experience || null
            })
            .select()
            .single();

          if (candidateError || !newCampaignCandidate) continue;

          // Migrate call records
          if (candidate.calls && candidate.calls.length > 0) {
            for (const call of candidate.calls) {
              const { data: newCall, error: callError } = await supabase
                .from('call_records')
                .insert({
                  campaign_candidate_id: newCampaignCandidate.id,
                  call_id: call.callId,
                  phone_from: call.phoneFrom,
                  phone_to: call.phoneTo,
                  duration: call.duration,
                  available_to_work: call.availableToWork,
                  interested: call.interested,
                  know_referee: call.knowReferee
                })
                .select()
                .single();

              if (callError || !newCall) continue;

              // Migrate call transcript
              if (call.transcript && call.transcript.length > 0) {
                for (let i = 0; i < call.transcript.length; i++) {
                  const message = call.transcript[i];
                  await supabase
                    .from('call_transcript_messages')
                    .insert({
                      call_record_id: newCall.id,
                      speaker: message.speaker,
                      message: message.message,
                      timestamp: message.timestamp || null,
                      sequence: i
                    });
                }
              }
            }
          }

          // Migrate WhatsApp messages
          if (candidate.whatsappMessages && candidate.whatsappMessages.length > 0) {
            for (const msg of candidate.whatsappMessages) {
              await supabase
                .from('whatsapp_messages')
                .insert({
                  campaign_candidate_id: newCampaignCandidate.id,
                  sender: msg.sender,
                  text: msg.text,
                  status: msg.status || null
                });
            }
          }

          // Migrate campaign candidate notes
          if (candidate.notes && candidate.notes.length > 0) {
            for (const note of candidate.notes) {
              await supabase
                .from('campaign_candidate_notes')
                .insert({
                  campaign_candidate_id: newCampaignCandidate.id,
                  text: note.text,
                  author: note.author,
                  action_type: note.actionType || null,
                  action_date: note.actionDate || null
                });
            }
          }
        }
      }

      console.log(`     ✅ Campaign created with ${campaign.candidates?.length || 0} candidates`);
    }

    const { count: campaignCount } = await supabase.from('campaigns').select('*', { count: 'exact', head: true });
    const { count: campaignCandidatesCount } = await supabase.from('campaign_candidates').select('*', { count: 'exact', head: true });
    const { count: callRecordsCount } = await supabase.from('call_records').select('*', { count: 'exact', head: true });
    const { count: whatsappCount } = await supabase.from('whatsapp_messages').select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Campaigns migrated: ${campaignCount} campaigns, ${campaignCandidatesCount} candidates, ${callRecordsCount} calls, ${whatsappCount} WhatsApp messages\n`);

    // ============================================
    // MIGRATE DATASETS
    // ============================================
    console.log('Step 4: Migrating datasets...');

    for (const dataset of datasetsData) {
      console.log(`  📊 Creating dataset: "${dataset.name}"`);

      // Insert dataset
      const { data: newDataset, error: datasetError } = await supabase
        .from('datasets')
        .insert({
          name: dataset.name,
          description: dataset.description,
          candidate_count: dataset.candidateCount,
          source: dataset.source
        })
        .select()
        .single();

      if (datasetError) {
        console.error(`     ❌ Error creating dataset:`, datasetError.message);
        continue;
      }

      // Migrate dataset candidates
      if (dataset.candidates && dataset.candidates.length > 0) {
        for (const candidate of dataset.candidates) {
          await supabase
            .from('dataset_candidates')
            .insert({
              dataset_id: newDataset.id,
              name: candidate.name,
              phone: candidate.phone,
              postcode: candidate.postcode || null,
              location: candidate.location || null,
              trade: candidate.trade || null,
              blue_card: candidate.blueCard || false,
              green_card: candidate.greenCard || false
            });
        }
      }

      console.log(`     ✅ Dataset created with ${dataset.candidates.length} candidates`);
    }

    const { count: datasetCount } = await supabase.from('datasets').select('*', { count: 'exact', head: true });
    const { count: datasetCandidatesCount } = await supabase.from('dataset_candidates').select('*', { count: 'exact', head: true });
    
    console.log(`\n✅ Datasets migrated: ${datasetCount} datasets, ${datasetCandidatesCount} candidates\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   Jobs:                ${jobCount}`);
    console.log(`   Job Candidates:      ${candidateCount}`);
    console.log(`   Candidate Notes:     ${notesCount}`);
    console.log(`   Campaigns:           ${campaignCount}`);
    console.log(`   Campaign Candidates: ${campaignCandidatesCount}`);
    console.log(`   Call Records:        ${callRecordsCount}`);
    console.log(`   WhatsApp Messages:   ${whatsappCount}`);
    console.log(`   Datasets:            ${datasetCount}`);
    console.log(`   Dataset Candidates:  ${datasetCandidatesCount}`);
    console.log('\n✨ All data is now in Supabase!');
    console.log('🚀 You can now update your app to fetch from the database.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n📝 Troubleshooting:');
    console.error('1. Make sure your Supabase project is running');
    console.error('2. Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
    console.error('3. Check that you ran the schema SQL in Supabase');
    console.error('4. Ensure you have network connectivity\n');
    process.exit(1);
  }
}

// Run migration
migrateData();

