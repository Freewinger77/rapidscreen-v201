/**
 * Data Migration Script
 * 
 * Migrates all mock data from localStorage to Supabase database
 * Run: npm run db:migrate
 */

import 'dotenv/config';
import sql from './src/lib/db';
import { jobsData } from './src/polymet/data/jobs-data';
import { campaignsData } from './src/polymet/data/campaigns-data';
import { datasetsData } from './src/polymet/data/datasets-data';

async function migrateData() {
  console.log('🚀 Starting data migration to Supabase...\n');

  try {
    // Test connection first
    console.log('Step 1: Testing database connection...');
    await sql`SELECT 1`;
    console.log('✅ Connected to database\n');

    // ============================================
    // MIGRATE JOBS
    // ============================================
    console.log('Step 2: Migrating jobs...');
    
    for (const job of jobsData) {
      console.log(`  📋 Creating job: "${job.title}"`);
      
      // Insert job
      const [newJob] = await sql`
        INSERT INTO jobs (
          id, title, company, location, employment_type, salary_range,
          open_positions, hired, target, description, tags
        )
        VALUES (
          ${job.id},
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
        ON CONFLICT (id) DO UPDATE
        SET title = EXCLUDED.title,
            company = EXCLUDED.company,
            location = EXCLUDED.location,
            employment_type = EXCLUDED.employment_type,
            salary_range = EXCLUDED.salary_range,
            open_positions = EXCLUDED.open_positions,
            hired = EXCLUDED.hired,
            target = EXCLUDED.target,
            description = EXCLUDED.description,
            tags = EXCLUDED.tags
        RETURNING *
      `;

      console.log(`     ✅ Job created with ${job.candidates.length} candidates`);

      // Migrate candidates for this job
      if (job.candidates && job.candidates.length > 0) {
        for (const candidate of job.candidates) {
          await sql`
            INSERT INTO candidates (
              id, job_id, name, phone, email, status, position
            )
            VALUES (
              ${candidate.id},
              ${newJob.id},
              ${candidate.name},
              ${candidate.phone},
              ${candidate.email || null},
              ${candidate.status},
              0
            )
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                email = EXCLUDED.email,
                status = EXCLUDED.status
          `;

          // Migrate candidate notes
          if (candidate.notes && candidate.notes.length > 0) {
            for (const note of candidate.notes) {
              await sql`
                INSERT INTO candidate_notes (
                  id, candidate_id, text, author, action_type, action_date
                )
                VALUES (
                  ${note.id},
                  ${candidate.id},
                  ${note.text},
                  ${note.author},
                  ${note.actionType || null},
                  ${note.actionDate || null}
                )
                ON CONFLICT (id) DO UPDATE
                SET text = EXCLUDED.text,
                    author = EXCLUDED.author,
                    action_type = EXCLUDED.action_type,
                    action_date = EXCLUDED.action_date
              `;
            }
          }
        }
      }
    }

    const jobCount = await sql`SELECT COUNT(*) as count FROM jobs`;
    const candidateCount = await sql`SELECT COUNT(*) as count FROM candidates`;
    const notesCount = await sql`SELECT COUNT(*) as count FROM candidate_notes`;
    
    console.log(`\n✅ Jobs migrated: ${jobCount[0].count} jobs, ${candidateCount[0].count} candidates, ${notesCount[0].count} notes\n`);

    // ============================================
    // MIGRATE CAMPAIGNS
    // ============================================
    console.log('Step 3: Migrating campaigns...');

    for (const campaign of campaignsData) {
      console.log(`  📢 Creating campaign: "${campaign.name}"`);

      // Insert campaign
      const [newCampaign] = await sql`
        INSERT INTO campaigns (
          id, name, job_id, job_title, link_job, start_date, end_date,
          channels, total_candidates, hired, response_rate, status, created_at
        )
        VALUES (
          ${campaign.id},
          ${campaign.name},
          ${campaign.jobId},
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
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            job_id = EXCLUDED.job_id,
            job_title = EXCLUDED.job_title,
            channels = EXCLUDED.channels,
            total_candidates = EXCLUDED.total_candidates,
            hired = EXCLUDED.hired,
            response_rate = EXCLUDED.response_rate,
            status = EXCLUDED.status
        RETURNING *
      `;

      // Migrate campaign targets
      if (campaign.targets && campaign.targets.length > 0) {
        for (const target of campaign.targets) {
          await sql`
            INSERT INTO campaign_targets (
              id, campaign_id, name, type, description, goal_type
            )
            VALUES (
              ${target.id},
              ${newCampaign.id},
              ${target.name},
              ${target.type},
              ${target.description || null},
              ${target.goalType || null}
            )
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                type = EXCLUDED.type,
                description = EXCLUDED.description,
                goal_type = EXCLUDED.goal_type
          `;
        }
      }

      // Migrate campaign matrices
      if (campaign.matrices && campaign.matrices.length > 0) {
        for (const matrix of campaign.matrices) {
          await sql`
            INSERT INTO campaign_matrices (
              id, campaign_id, name, description, whatsapp_message, call_script
            )
            VALUES (
              ${matrix.id},
              ${newCampaign.id},
              ${matrix.name},
              ${matrix.description || null},
              ${matrix.whatsappMessage || null},
              ${matrix.callScript || null}
            )
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                description = EXCLUDED.description,
                whatsapp_message = EXCLUDED.whatsapp_message,
                call_script = EXCLUDED.call_script
          `;
        }
      }

      // Migrate campaign candidates
      if (campaign.candidates && campaign.candidates.length > 0) {
        for (const candidate of campaign.candidates) {
          await sql`
            INSERT INTO campaign_candidates (
              id, campaign_id, forename, surname, tel_mobile, email,
              call_status, available_to_work, interested, know_referee,
              last_contact, experience
            )
            VALUES (
              ${candidate.id},
              ${newCampaign.id},
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
            ON CONFLICT (id) DO UPDATE
            SET forename = EXCLUDED.forename,
                surname = EXCLUDED.surname,
                tel_mobile = EXCLUDED.tel_mobile,
                email = EXCLUDED.email,
                call_status = EXCLUDED.call_status,
                available_to_work = EXCLUDED.available_to_work,
                interested = EXCLUDED.interested,
                know_referee = EXCLUDED.know_referee,
                last_contact = EXCLUDED.last_contact,
                experience = EXCLUDED.experience
          `;

          // Migrate call records
          if (candidate.calls && candidate.calls.length > 0) {
            for (const call of candidate.calls) {
              const [newCall] = await sql`
                INSERT INTO call_records (
                  id, campaign_candidate_id, call_id, phone_from, phone_to,
                  duration, available_to_work, interested, know_referee, created_at
                )
                VALUES (
                  ${call.id},
                  ${candidate.id},
                  ${call.callId},
                  ${call.phoneFrom},
                  ${call.phoneTo},
                  ${call.duration},
                  ${call.availableToWork},
                  ${call.interested},
                  ${call.knowReferee},
                  ${call.timestamp}
                )
                ON CONFLICT (id) DO UPDATE
                SET duration = EXCLUDED.duration,
                    available_to_work = EXCLUDED.available_to_work,
                    interested = EXCLUDED.interested,
                    know_referee = EXCLUDED.know_referee
                RETURNING *
              `;

              // Migrate call transcript
              if (call.transcript && call.transcript.length > 0) {
                for (let i = 0; i < call.transcript.length; i++) {
                  const message = call.transcript[i];
                  await sql`
                    INSERT INTO call_transcript_messages (
                      id, call_record_id, speaker, message, timestamp, sequence
                    )
                    VALUES (
                      ${message.id},
                      ${newCall.id},
                      ${message.speaker},
                      ${message.message},
                      ${message.timestamp || null},
                      ${i}
                    )
                    ON CONFLICT (id) DO UPDATE
                    SET speaker = EXCLUDED.speaker,
                        message = EXCLUDED.message,
                        timestamp = EXCLUDED.timestamp,
                        sequence = EXCLUDED.sequence
                  `;
                }
              }
            }
          }

          // Migrate WhatsApp messages
          if (candidate.whatsappMessages && candidate.whatsappMessages.length > 0) {
            for (const msg of candidate.whatsappMessages) {
              await sql`
                INSERT INTO whatsapp_messages (
                  id, campaign_candidate_id, sender, text, status, created_at
                )
                VALUES (
                  ${msg.id},
                  ${candidate.id},
                  ${msg.sender},
                  ${msg.text},
                  ${msg.status || null},
                  ${msg.timestamp}
                )
                ON CONFLICT (id) DO UPDATE
                SET sender = EXCLUDED.sender,
                    text = EXCLUDED.text,
                    status = EXCLUDED.status
              `;
            }
          }

          // Migrate campaign candidate notes
          if (candidate.notes && candidate.notes.length > 0) {
            for (const note of candidate.notes) {
              await sql`
                INSERT INTO campaign_candidate_notes (
                  id, campaign_candidate_id, text, author, action_type, action_date, created_at
                )
                VALUES (
                  ${note.id},
                  ${candidate.id},
                  ${note.text},
                  ${note.author},
                  ${note.actionType || null},
                  ${note.actionDate || null},
                  ${note.timestamp}
                )
                ON CONFLICT (id) DO UPDATE
                SET text = EXCLUDED.text,
                    author = EXCLUDED.author,
                    action_type = EXCLUDED.action_type,
                    action_date = EXCLUDED.action_date
              `;
            }
          }
        }
      }

      console.log(`     ✅ Campaign created with ${campaign.candidates?.length || 0} candidates`);
    }

    const campaignCount = await sql`SELECT COUNT(*) as count FROM campaigns`;
    const campaignCandidatesCount = await sql`SELECT COUNT(*) as count FROM campaign_candidates`;
    const callRecordsCount = await sql`SELECT COUNT(*) as count FROM call_records`;
    const whatsappCount = await sql`SELECT COUNT(*) as count FROM whatsapp_messages`;
    
    console.log(`\n✅ Campaigns migrated: ${campaignCount[0].count} campaigns, ${campaignCandidatesCount[0].count} candidates, ${callRecordsCount[0].count} calls, ${whatsappCount[0].count} WhatsApp messages\n`);

    // ============================================
    // MIGRATE DATASETS
    // ============================================
    console.log('Step 4: Migrating datasets...');

    for (const dataset of datasetsData) {
      console.log(`  📊 Creating dataset: "${dataset.name}"`);

      // Insert dataset
      const [newDataset] = await sql`
        INSERT INTO datasets (
          id, name, description, candidate_count, source, created_at
        )
        VALUES (
          ${dataset.id},
          ${dataset.name},
          ${dataset.description},
          ${dataset.candidateCount},
          ${dataset.source},
          ${dataset.createdAt}
        )
        ON CONFLICT (id) DO UPDATE
        SET name = EXCLUDED.name,
            description = EXCLUDED.description,
            source = EXCLUDED.source
        RETURNING *
      `;

      // Migrate dataset candidates
      if (dataset.candidates && dataset.candidates.length > 0) {
        for (const candidate of dataset.candidates) {
          await sql`
            INSERT INTO dataset_candidates (
              id, dataset_id, name, phone, postcode, location, trade, blue_card, green_card
            )
            VALUES (
              ${candidate.id},
              ${newDataset.id},
              ${candidate.name},
              ${candidate.phone},
              ${candidate.postcode || null},
              ${candidate.location || null},
              ${candidate.trade || null},
              ${candidate.blueCard || false},
              ${candidate.greenCard || false}
            )
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name,
                phone = EXCLUDED.phone,
                postcode = EXCLUDED.postcode,
                location = EXCLUDED.location,
                trade = EXCLUDED.trade,
                blue_card = EXCLUDED.blue_card,
                green_card = EXCLUDED.green_card
          `;
        }
      }

      console.log(`     ✅ Dataset created with ${dataset.candidates.length} candidates`);
    }

    const datasetCount = await sql`SELECT COUNT(*) as count FROM datasets`;
    const datasetCandidatesCount = await sql`SELECT COUNT(*) as count FROM dataset_candidates`;
    
    console.log(`\n✅ Datasets migrated: ${datasetCount[0].count} datasets, ${datasetCandidatesCount[0].count} candidates\n`);

    // ============================================
    // SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════════════════════');
    console.log('🎉 MIGRATION COMPLETE!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 Summary:');
    console.log(`   Jobs:                ${jobCount[0].count}`);
    console.log(`   Job Candidates:      ${candidateCount[0].count}`);
    console.log(`   Candidate Notes:     ${notesCount[0].count}`);
    console.log(`   Campaigns:           ${campaignCount[0].count}`);
    console.log(`   Campaign Candidates: ${campaignCandidatesCount[0].count}`);
    console.log(`   Call Records:        ${callRecordsCount[0].count}`);
    console.log(`   WhatsApp Messages:   ${whatsappCount[0].count}`);
    console.log(`   Datasets:            ${datasetCount[0].count}`);
    console.log(`   Dataset Candidates:  ${datasetCandidatesCount[0].count}`);
    console.log('\n✨ All data is now in Supabase!');
    console.log('🚀 You can now update your app to fetch from the database.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('\n📝 Troubleshooting:');
    console.error('1. Make sure your Supabase project is running');
    console.error('2. Verify DATABASE_URL in .env is correct');
    console.error('3. Check that you ran the schema SQL in Supabase');
    console.error('4. Ensure you have network connectivity\n');
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration
migrateData();

