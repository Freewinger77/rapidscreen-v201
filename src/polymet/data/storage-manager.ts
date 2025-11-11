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

// Storage keys for all data types
const STORAGE_KEYS = {
  JOBS: "recruitment_app_jobs",
  CAMPAIGNS: "recruitment_app_campaigns",
  DATASETS: "recruitment_app_datasets",
  METADATA: "recruitment_app_metadata",
} as const;

// Metadata for tracking changes and sync
interface StorageMetadata {
  lastUpdated: string;
  version: string;
  totalJobs: number;
  totalCampaigns: number;
  totalDatasets: number;
}

// Generic storage functions with error handling
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    updateMetadata();
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    // Handle quota exceeded error
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("LocalStorage quota exceeded. Consider clearing old data.");
    }
  }
}

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch (error) {
    console.error(`Error loading from localStorage (${key}):`, error);
    return defaultValue;
  }
}

// Update metadata after any storage operation
function updateMetadata(): void {
  const jobs = loadJobs([]);
  const campaigns = loadCampaigns([]);
  const datasets = loadDatasets([]);

  const metadata: StorageMetadata = {
    lastUpdated: new Date().toISOString(),
    version: "1.0.0",
    totalJobs: jobs.length,
    totalCampaigns: campaigns.length,
    totalDatasets: datasets.length,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.METADATA, JSON.stringify(metadata));
  } catch (error) {
    console.error("Error updating metadata:", error);
  }
}

// Get storage metadata
export function getStorageMetadata(): StorageMetadata | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.METADATA);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Error loading metadata:", error);
    return null;
  }
}

// ============================================
// JOBS STORAGE - Complete CRUD operations
// ============================================

export function saveJobs(jobs: Job[]): void {
  saveToStorage(STORAGE_KEYS.JOBS, jobs);
}

export function loadJobs(defaultJobs: Job[]): Job[] {
  return loadFromStorage(STORAGE_KEYS.JOBS, defaultJobs);
}

export function addJob(job: Job): void {
  const jobs = loadJobs([]);
  saveJobs([...jobs, job]);
}

export function updateJob(jobId: string, updates: Partial<Job>): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) =>
    job.id === jobId ? { ...job, ...updates } : job
  );
  saveJobs(updatedJobs);
}

export function deleteJob(jobId: string): void {
  const jobs = loadJobs([]);
  const filteredJobs = jobs.filter((job) => job.id !== jobId);
  saveJobs(filteredJobs);
}

// ============================================
// CANDIDATES STORAGE - Nested in Jobs
// ============================================

export function updateCandidate(
  jobId: string,
  candidateId: string,
  updates: Partial<Candidate>
): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) => {
    if (job.id === jobId) {
      return {
        ...job,
        candidates: job.candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, ...updates }
            : candidate
        ),
      };
    }
    return job;
  });
  saveJobs(updatedJobs);
}

export function updateCandidates(jobId: string, candidates: Candidate[]): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) =>
    job.id === jobId ? { ...job, candidates } : job
  );
  saveJobs(updatedJobs);
}

export function addCandidateToJob(jobId: string, candidate: Candidate): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) =>
    job.id === jobId
      ? { ...job, candidates: [...job.candidates, candidate] }
      : job
  );
  saveJobs(updatedJobs);
}

export function deleteCandidateFromJob(
  jobId: string,
  candidateId: string
): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) =>
    job.id === jobId
      ? {
          ...job,
          candidates: job.candidates.filter((c) => c.id !== candidateId),
        }
      : job
  );
  saveJobs(updatedJobs);
}

// ============================================
// CANDIDATE NOTES - Nested in Candidates
// ============================================

export function addCandidateNote(
  jobId: string,
  candidateId: string,
  note: CandidateNote
): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) => {
    if (job.id === jobId) {
      return {
        ...job,
        candidates: job.candidates.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              notes: [...(candidate.notes || []), note],
            };
          }
          return candidate;
        }),
      };
    }
    return job;
  });
  saveJobs(updatedJobs);
}

export function updateCandidateNote(
  jobId: string,
  candidateId: string,
  noteId: string,
  updates: Partial<CandidateNote>
): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) => {
    if (job.id === jobId) {
      return {
        ...job,
        candidates: job.candidates.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              notes: (candidate.notes || []).map((note) =>
                note.id === noteId ? { ...note, ...updates } : note
              ),
            };
          }
          return candidate;
        }),
      };
    }
    return job;
  });
  saveJobs(updatedJobs);
}

export function deleteCandidateNote(
  jobId: string,
  candidateId: string,
  noteId: string
): void {
  const jobs = loadJobs([]);
  const updatedJobs = jobs.map((job) => {
    if (job.id === jobId) {
      return {
        ...job,
        candidates: job.candidates.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              notes: (candidate.notes || []).filter(
                (note) => note.id !== noteId
              ),
            };
          }
          return candidate;
        }),
      };
    }
    return job;
  });
  saveJobs(updatedJobs);
}

// ============================================
// CAMPAIGNS STORAGE - Complete CRUD operations
// ============================================

export function saveCampaigns(campaigns: Campaign[]): void {
  saveToStorage(STORAGE_KEYS.CAMPAIGNS, campaigns);
}

export function loadCampaigns(defaultCampaigns: Campaign[]): Campaign[] {
  return loadFromStorage(STORAGE_KEYS.CAMPAIGNS, defaultCampaigns);
}

export function addCampaign(campaign: Campaign): void {
  const campaigns = loadCampaigns([]);
  saveCampaigns([...campaigns, campaign]);
}

export function updateCampaign(
  campaignId: string,
  updates: Partial<Campaign>
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId ? { ...campaign, ...updates } : campaign
  );
  saveCampaigns(updatedCampaigns);
}

export function deleteCampaign(campaignId: string): void {
  const campaigns = loadCampaigns([]);
  const filteredCampaigns = campaigns.filter(
    (campaign) => campaign.id !== campaignId
  );
  saveCampaigns(filteredCampaigns);
}

// ============================================
// CAMPAIGN CANDIDATES - Nested in Campaigns
// ============================================

export function updateCampaignCandidate(
  campaignId: string,
  candidateId: string,
  updates: Partial<CampaignCandidate>
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) => {
    if (campaign.id === campaignId && campaign.candidates) {
      return {
        ...campaign,
        candidates: campaign.candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, ...updates }
            : candidate
        ),
      };
    }
    return campaign;
  });
  saveCampaigns(updatedCampaigns);
}

export function addCampaignCandidate(
  campaignId: string,
  candidate: CampaignCandidate
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          candidates: [...(campaign.candidates || []), candidate],
          totalCandidates: (campaign.totalCandidates || 0) + 1,
        }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

export function deleteCampaignCandidate(
  campaignId: string,
  candidateId: string
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId && campaign.candidates
      ? {
          ...campaign,
          candidates: campaign.candidates.filter((c) => c.id !== candidateId),
          totalCandidates: Math.max(0, (campaign.totalCandidates || 0) - 1),
        }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

// ============================================
// CAMPAIGN CANDIDATE NOTES
// ============================================

export function updateCampaignCandidateNotes(
  campaignId: string,
  candidateId: string,
  notes: CandidateNote[]
): void {
  updateCampaignCandidate(campaignId, candidateId, { notes });
}

// ============================================
// CAMPAIGN TARGETS
// ============================================

export function addCampaignTarget(
  campaignId: string,
  target: CampaignTarget
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? { ...campaign, targets: [...campaign.targets, target] }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

export function updateCampaignTarget(
  campaignId: string,
  targetId: string,
  updates: Partial<CampaignTarget>
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) => {
    if (campaign.id === campaignId) {
      return {
        ...campaign,
        targets: campaign.targets.map((target) =>
          target.id === targetId ? { ...target, ...updates } : target
        ),
      };
    }
    return campaign;
  });
  saveCampaigns(updatedCampaigns);
}

export function deleteCampaignTarget(
  campaignId: string,
  targetId: string
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          targets: campaign.targets.filter((t) => t.id !== targetId),
        }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

// ============================================
// CAMPAIGN MATRICES
// ============================================

export function addCampaignMatrix(
  campaignId: string,
  matrix: CampaignMatrix
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? { ...campaign, matrices: [...campaign.matrices, matrix] }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

export function updateCampaignMatrix(
  campaignId: string,
  matrixId: string,
  updates: Partial<CampaignMatrix>
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) => {
    if (campaign.id === campaignId) {
      return {
        ...campaign,
        matrices: campaign.matrices.map((matrix) =>
          matrix.id === matrixId ? { ...matrix, ...updates } : matrix
        ),
      };
    }
    return campaign;
  });
  saveCampaigns(updatedCampaigns);
}

export function deleteCampaignMatrix(
  campaignId: string,
  matrixId: string
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) =>
    campaign.id === campaignId
      ? {
          ...campaign,
          matrices: campaign.matrices.filter((m) => m.id !== matrixId),
        }
      : campaign
  );
  saveCampaigns(updatedCampaigns);
}

// ============================================
// CAMPAIGN CALL RECORDS
// ============================================

export function addCampaignCandidateCall(
  campaignId: string,
  candidateId: string,
  call: CallRecord
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) => {
    if (campaign.id === campaignId && campaign.candidates) {
      return {
        ...campaign,
        candidates: campaign.candidates.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              calls: [...candidate.calls, call],
            };
          }
          return candidate;
        }),
      };
    }
    return campaign;
  });
  saveCampaigns(updatedCampaigns);
}

// ============================================
// CAMPAIGN WHATSAPP MESSAGES
// ============================================

export function addCampaignCandidateWhatsAppMessage(
  campaignId: string,
  candidateId: string,
  message: WhatsAppMessage
): void {
  const campaigns = loadCampaigns([]);
  const updatedCampaigns = campaigns.map((campaign) => {
    if (campaign.id === campaignId && campaign.candidates) {
      return {
        ...campaign,
        candidates: campaign.candidates.map((candidate) => {
          if (candidate.id === candidateId) {
            return {
              ...candidate,
              whatsappMessages: [
                ...(candidate.whatsappMessages || []),
                message,
              ],
            };
          }
          return candidate;
        }),
      };
    }
    return campaign;
  });
  saveCampaigns(updatedCampaigns);
}

// ============================================
// DATASETS STORAGE - Complete CRUD operations
// ============================================

export function saveDatasets(datasets: Dataset[]): void {
  saveToStorage(STORAGE_KEYS.DATASETS, datasets);
}

export function loadDatasets(defaultDatasets: Dataset[]): Dataset[] {
  return loadFromStorage(STORAGE_KEYS.DATASETS, defaultDatasets);
}

export function addDataset(dataset: Dataset): void {
  const datasets = loadDatasets([]);
  saveDatasets([...datasets, dataset]);
}

export function updateDataset(
  datasetId: string,
  updates: Partial<Dataset>
): void {
  const datasets = loadDatasets([]);
  const updatedDatasets = datasets.map((dataset) =>
    dataset.id === datasetId
      ? { ...dataset, ...updates, lastUpdated: new Date().toISOString() }
      : dataset
  );
  saveDatasets(updatedDatasets);
}

export function deleteDataset(datasetId: string): void {
  const datasets = loadDatasets([]);
  const filteredDatasets = datasets.filter(
    (dataset) => dataset.id !== datasetId
  );
  saveDatasets(filteredDatasets);
}

// ============================================
// DATASET CANDIDATES - Nested in Datasets
// ============================================

export function addDatasetCandidate(
  datasetId: string,
  candidate: Dataset["candidates"][0]
): void {
  const datasets = loadDatasets([]);
  const updatedDatasets = datasets.map((dataset) =>
    dataset.id === datasetId
      ? {
          ...dataset,
          candidates: [...dataset.candidates, candidate],
          candidateCount: dataset.candidates.length + 1,
          lastUpdated: new Date().toISOString(),
        }
      : dataset
  );
  saveDatasets(updatedDatasets);
}

export function updateDatasetCandidate(
  datasetId: string,
  candidateId: string,
  updates: Partial<Dataset["candidates"][0]>
): void {
  const datasets = loadDatasets([]);
  const updatedDatasets = datasets.map((dataset) => {
    if (dataset.id === datasetId) {
      return {
        ...dataset,
        candidates: dataset.candidates.map((candidate) =>
          candidate.id === candidateId
            ? { ...candidate, ...updates }
            : candidate
        ),
        lastUpdated: new Date().toISOString(),
      };
    }
    return dataset;
  });
  saveDatasets(updatedDatasets);
}

export function deleteDatasetCandidate(
  datasetId: string,
  candidateId: string
): void {
  const datasets = loadDatasets([]);
  const updatedDatasets = datasets.map((dataset) =>
    dataset.id === datasetId
      ? {
          ...dataset,
          candidates: dataset.candidates.filter((c) => c.id !== candidateId),
          candidateCount: Math.max(0, dataset.candidates.length - 1),
          lastUpdated: new Date().toISOString(),
        }
      : dataset
  );
  saveDatasets(updatedDatasets);
}

// ============================================
// BULK OPERATIONS
// ============================================

export function bulkUpdateCandidates(
  datasetId: string,
  candidates: Dataset["candidates"]
): void {
  const datasets = loadDatasets([]);
  const updatedDatasets = datasets.map((dataset) =>
    dataset.id === datasetId
      ? {
          ...dataset,
          candidates,
          candidateCount: candidates.length,
          lastUpdated: new Date().toISOString(),
        }
      : dataset
  );
  saveDatasets(updatedDatasets);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clear all storage (useful for testing/reset)
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

// Export all data for backup
export function exportAllData(): {
  jobs: Job[];
  campaigns: Campaign[];
  datasets: Dataset[];
  metadata: StorageMetadata | null;
} {
  return {
    jobs: loadJobs([]),
    campaigns: loadCampaigns([]),
    datasets: loadDatasets([]),
    metadata: getStorageMetadata(),
  };
}

// Import all data from backup
export function importAllData(data: {
  jobs?: Job[];
  campaigns?: Campaign[];
  datasets?: Dataset[];
}): void {
  if (data.jobs) saveJobs(data.jobs);
  if (data.campaigns) saveCampaigns(data.campaigns);
  if (data.datasets) saveDatasets(data.datasets);
}

// Get storage size estimate
export function getStorageSize(): {
  jobs: number;
  campaigns: number;
  datasets: number;
  total: number;
} {
  const getSize = (key: string): number => {
    const item = localStorage.getItem(key);
    return item ? new Blob([item]).size : 0;
  };

  const jobsSize = getSize(STORAGE_KEYS.JOBS);
  const campaignsSize = getSize(STORAGE_KEYS.CAMPAIGNS);
  const datasetsSize = getSize(STORAGE_KEYS.DATASETS);

  return {
    jobs: jobsSize,
    campaigns: campaignsSize,
    datasets: datasetsSize,
    total: jobsSize + campaignsSize + datasetsSize,
  };
}
