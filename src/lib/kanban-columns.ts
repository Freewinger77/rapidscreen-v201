/**
 * Kanban Columns Database Operations
 */

import { supabase } from './supabase-client';

export interface KanbanColumn {
  id: string;
  jobId: string;
  title: string;
  statusKey: string;
  color: string;
  position: number;
  isDefault: boolean;
  isPostHire: boolean;  // Onboarding, training, etc. still count as hired
}

/**
 * Load kanban columns for a job
 */
export async function loadKanbanColumns(jobId: string): Promise<KanbanColumn[]> {
  const { data, error } = await supabase
    .from('kanban_columns')
    .select('*')
    .eq('job_id', jobId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error loading kanban columns:', error);
    return getDefaultColumns(jobId);
  }

  if (!data || data.length === 0) {
    // No columns yet, create defaults
    const defaults = await createDefaultColumns(jobId);
    return defaults;
  }

  return data.map(col => ({
    id: col.id,
    jobId: col.job_id,
    title: col.title,
    statusKey: col.status_key,
    color: col.color,
    position: col.position,
    isDefault: col.is_default || false,
    isPostHire: col.is_post_hire || false,
  }));
}

/**
 * Create default columns for a job
 */
async function createDefaultColumns(jobId: string): Promise<KanbanColumn[]> {
  const defaults = [
    { title: 'Not Contacted', statusKey: 'not-contacted', color: 'hsl(var(--chart-1))', position: 0, isDefault: true, isPostHire: false },
    { title: 'Interested', statusKey: 'interested', color: 'hsl(var(--chart-2))', position: 1, isDefault: true, isPostHire: false },
    { title: 'Interview', statusKey: 'interview', color: 'hsl(var(--chart-3))', position: 2, isDefault: true, isPostHire: false },
    { title: 'Hired', statusKey: 'hired', color: 'hsl(var(--primary))', position: 3, isDefault: true, isPostHire: false },
    { title: 'Started Work', statusKey: 'started-work', color: 'hsl(var(--chart-4))', position: 4, isDefault: true, isPostHire: true },
  ];

  const { data, error } = await supabase
    .from('kanban_columns')
    .insert(defaults.map(d => ({
      job_id: jobId,
      title: d.title,
      status_key: d.statusKey,
      color: d.color,
      position: d.position,
      is_default: d.isDefault,
      is_post_hire: d.isPostHire,
    })))
    .select();

  if (error) {
    console.error('Error creating default columns:', error);
    return getDefaultColumns(jobId);
  }

  return data.map(col => ({
    id: col.id,
    jobId: col.job_id,
    title: col.title,
    statusKey: col.status_key,
    color: col.color,
    position: col.position,
    isDefault: col.is_default,
    isPostHire: col.is_post_hire,
  }));
}

function getDefaultColumns(jobId: string): KanbanColumn[] {
  return [
    { id: '1', jobId, title: 'Not Contacted', statusKey: 'not-contacted', color: 'hsl(var(--chart-1))', position: 0, isDefault: true, isPostHire: false },
    { id: '2', jobId, title: 'Interested', statusKey: 'interested', color: 'hsl(var(--chart-2))', position: 1, isDefault: true, isPostHire: false },
    { id: '3', jobId, title: 'Interview', statusKey: 'interview', color: 'hsl(var(--chart-3))', position: 2, isDefault: true, isPostHire: false },
    { id: '4', jobId, title: 'Hired', statusKey: 'hired', color: 'hsl(var(--primary))', position: 3, isDefault: true, isPostHire: false },
    { id: '5', jobId, title: 'Started Work', statusKey: 'started-work', color: 'hsl(var(--chart-4))', position: 4, isDefault: true, isPostHire: true },
  ];
}

/**
 * Add new kanban column
 */
export async function addKanbanColumn(column: Omit<KanbanColumn, 'id'>): Promise<KanbanColumn> {
  const { data, error } = await supabase
    .from('kanban_columns')
    .insert({
      job_id: column.jobId,
      title: column.title,
      status_key: column.statusKey,
      color: column.color,
      position: column.position,
      is_default: false,
      is_post_hire: column.isPostHire,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    jobId: data.job_id,
    title: data.title,
    statusKey: data.status_key,
    color: data.color,
    position: data.position,
    isDefault: data.is_default,
    isPostHire: data.is_post_hire,
  };
}

/**
 * Update kanban column
 */
export async function updateKanbanColumn(
  columnId: string,
  updates: Partial<Pick<KanbanColumn, 'title' | 'color' | 'isPostHire'>>
): Promise<void> {
  const dbUpdates: any = {};
  
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.color) dbUpdates.color = updates.color;
  if (updates.isPostHire !== undefined) dbUpdates.is_post_hire = updates.isPostHire;

  const { error } = await supabase
    .from('kanban_columns')
    .update(dbUpdates)
    .eq('id', columnId);

  if (error) throw error;
}

/**
 * Delete kanban column
 */
export async function deleteKanbanColumn(columnId: string): Promise<void> {
  const { error } = await supabase
    .from('kanban_columns')
    .delete()
    .eq('id', columnId);

  if (error) throw error;
}

/**
 * Check if column counts as hired
 */
export function isHiredColumn(column: KanbanColumn): boolean {
  return column.statusKey === 'hired' || column.isPostHire;
}

