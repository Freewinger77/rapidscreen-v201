/**
 * Campaign Webhook Integration
 * 
 * Handles launching campaigns via webhook to backend system
 */

export interface CampaignTask {
  session: string;
  phone_number: string;
}

export interface CampaignObjective {
  type: 'string' | 'number' | 'boolean';
  description: string;
}

export interface CampaignWebhookPayload {
  campaign: string; // Format: "campaign-name_uid"
  tasks: CampaignTask[];
  job_description: string;
  objectives: {
    [key: string]: CampaignObjective;
  };
}

export interface CampaignLaunchConfig {
  campaignName: string;
  candidates: Array<{
    phone: string;
    name?: string;
  }>;
  jobDescription: string;
  objectives: {
    [key: string]: CampaignObjective;
  };
}

const WEBHOOK_URL = 'https://n8n-rapid-czbff9cnafhkhmhf.eastus-01.azurewebsites.net/webhook/session-created';

/**
 * Generate a unique identifier for campaign
 */
function generateUID(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Generate session ID for a candidate
 */
function generateSessionId(campaignName: string, phoneNumber: string): string {
  // Format: campaignname_phonenumber (simplified)
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const cleanCampaign = campaignName.toLowerCase().replace(/[^a-z0-9]/g, '');
  return `${cleanCampaign}_${cleanPhone}`;
}

/**
 * Launch a campaign via webhook
 */
export async function launchCampaign(config: CampaignLaunchConfig): Promise<{
  success: boolean;
  campaignId: string; // The full campaign ID with UID
  error?: string;
}> {
  try {
    // Generate unique campaign ID
    const uid = generateUID();
    const campaignId = `${config.campaignName}_${uid}`;
    
    // Build tasks for each candidate
    const tasks: CampaignTask[] = config.candidates.map(candidate => ({
      session: generateSessionId(config.campaignName, candidate.phone),
      phone_number: candidate.phone,
    }));
    
    // Build webhook payload
    const payload: CampaignWebhookPayload = {
      campaign: campaignId,
      tasks,
      job_description: config.jobDescription,
      objectives: config.objectives,
    };
    
    console.log('🚀 Launching campaign:', campaignId);
    console.log('📞 Contacting', tasks.length, 'candidates');
    console.log('🎯 Tracking', Object.keys(config.objectives).length, 'objectives');
    
    // Send to webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('✅ Campaign launched successfully');
    
    return {
      success: true,
      campaignId,
    };
    
  } catch (error) {
    console.error('❌ Failed to launch campaign:', error);
    return {
      success: false,
      campaignId: '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Extract base campaign name from campaign ID (removes UID)
 */
export function getBaseCampaignName(campaignIdWithUID: string): string {
  // Remove the _uid suffix to get base campaign name
  const parts = campaignIdWithUID.split('_');
  parts.pop(); // Remove last part (UID)
  return parts.join('_');
}

/**
 * Build job description from job data
 */
export function buildJobDescription(job: {
  title: string;
  company: string;
  location: string;
  employmentType: string;
  salaryRange: string;
  description: string;
  tags: string[];
}): string {
  return `
Job Title: ${job.title}
Company: ${job.company}
Location: ${job.location}
Employment Type: ${job.employmentType}
Salary Range: ${job.salaryRange}

Description:
${job.description}

Required Skills: ${job.tags.join(', ')}
`.trim();
}

/**
 * Convert campaign matrices to webhook objectives format
 */
export function convertMatricesToObjectives(
  matrices: Array<{
    name: string;
    description?: string;
  }>,
  targets: Array<{
    name: string;
    type: 'column' | 'custom';
    goalType?: 'text' | 'number' | 'boolean';
    description?: string;
  }>
): { [key: string]: CampaignObjective } {
  const objectives: { [key: string]: CampaignObjective } = {};
  
  // Convert targets to objectives
  targets.forEach(target => {
    const objectiveKey = target.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    
    objectives[objectiveKey] = {
      type: target.goalType || 'string',
      description: target.description || target.name,
    };
  });
  
  // Add matrices as additional context (optional)
  matrices.forEach(matrix => {
    const key = `matrix_${matrix.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    objectives[key] = {
      type: 'string',
      description: matrix.description || `Matrix: ${matrix.name}`,
    };
  });
  
  return objectives;
}

/**
 * Test webhook connectivity
 */
export async function testWebhook(): Promise<boolean> {
  try {
    const testPayload: CampaignWebhookPayload = {
      campaign: 'test_' + generateUID(),
      tasks: [
        {
          session: 'test_session',
          phone_number: '+447000000000',
        },
      ],
      job_description: 'Test job description',
      objectives: {
        test_objective: {
          type: 'boolean',
          description: 'Test objective',
        },
      },
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Webhook test failed:', error);
    return false;
  }
}

