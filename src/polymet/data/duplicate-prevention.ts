/**
 * Duplicate Contact Prevention System
 * Prevents same candidate from being contacted multiple times across campaigns
 */

import { supabase } from '@/lib/supabase';

export interface ContactHistory {
  campaignName: string;
  lastContact: string;
  callStatus: string;
  daysSinceContact: number;
  interested: boolean;
  available: boolean;
}

/**
 * Check if a phone number was recently contacted
 */
export async function checkRecentContact(
  phoneNumber: string,
  daysAgo: number = 30
): Promise<ContactHistory[]> {
  const { data, error } = await supabase
    .from('campaign_candidates')
    .select(`
      campaign_id,
      last_contact,
      call_status,
      interested,
      available_to_work,
      campaigns!inner(name)
    `)
    .eq('tel_mobile', phoneNumber)
    .not('last_contact', 'is', null)
    .gte('last_contact', new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString())
    .order('last_contact', { ascending: false });

  if (error || !data) {
    console.error('Error checking contact history:', error);
    return [];
  }

  return data.map((record: any) => ({
    campaignName: record.campaigns.name,
    lastContact: record.last_contact,
    callStatus: record.call_status,
    daysSinceContact: Math.floor((Date.now() - new Date(record.last_contact).getTime()) / (1000 * 60 * 60 * 24)),
    interested: record.interested || false,
    available: record.available_to_work || false,
  }));
}

/**
 * Find duplicate phone numbers across campaigns
 */
export async function findDuplicateCandidates(campaignId: string): Promise<Array<{
  phone: string;
  name: string;
  existingCampaigns: string[];
}>> {
  // Get candidates for this campaign
  const { data: candidates } = await supabase
    .from('campaign_candidates')
    .select('tel_mobile, forename, surname')
    .eq('campaign_id', campaignId);

  if (!candidates) return [];

  const duplicates = [];

  for (const candidate of candidates) {
    // Check if this phone exists in OTHER campaigns
    const { data: others } = await supabase
      .from('campaign_candidates')
      .select('campaign_id, campaigns!inner(name)')
      .eq('tel_mobile', candidate.tel_mobile)
      .neq('campaign_id', campaignId);

    if (others && others.length > 0) {
      duplicates.push({
        phone: candidate.tel_mobile,
        name: `${candidate.forename} ${candidate.surname}`,
        existingCampaigns: others.map((o: any) => o.campaigns.name),
      });
    }
  }

  return duplicates;
}

/**
 * Warn about duplicates before launching campaign
 */
export async function warnAboutDuplicates(campaignId: string): Promise<boolean> {
  const duplicates = await findDuplicateCandidates(campaignId);

  if (duplicates.length === 0) {
    return true; // No duplicates, proceed
  }

  const message = `⚠️ Duplicate Contacts Detected!\n\n` +
    `${duplicates.length} candidate${duplicates.length > 1 ? 's' : ''} in this campaign ` +
    `${duplicates.length > 1 ? 'have' : 'has'} been contacted in other campaigns:\n\n` +
    duplicates.slice(0, 5).map(d => 
      `• ${d.name} (${d.phone})\n  Previous: ${d.existingCampaigns.join(', ')}`
    ).join('\n\n') +
    (duplicates.length > 5 ? `\n\n... and ${duplicates.length - 5} more` : '') +
    `\n\nContinue anyway?`;

  return confirm(message);
}

