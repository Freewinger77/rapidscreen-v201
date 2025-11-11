/**
 * RECRUITMENT APP - DATA STORAGE GUIDE
 * =====================================
 *
 * This guide explains the complete data structure and storage system
 * for the recruitment platform. All data is persisted to localStorage
 * and automatically synced across the application.
 */

import {
  // Jobs
  saveJobs,
  loadJobs,
  addJob,
  updateJob,
  deleteJob,

  // Candidates (in Jobs)
  updateCandidate,
  updateCandidates,
  addCandidateToJob,
  deleteCandidateFromJob,

  // Candidate Notes
  addCandidateNote,
  updateCandidateNote,
  deleteCandidateNote,

  // Campaigns
  saveCampaigns,
  loadCampaigns,
  addCampaign,
  updateCampaign,
  deleteCampaign,

  // Campaign Candidates
  updateCampaignCandidate,
  addCampaignCandidate,
  deleteCampaignCandidate,
  updateCampaignCandidateNotes,

  // Campaign Targets
  addCampaignTarget,
  updateCampaignTarget,
  deleteCampaignTarget,

  // Campaign Matrices
  addCampaignMatrix,
  updateCampaignMatrix,
  deleteCampaignMatrix,

  // Campaign Call Records
  addCampaignCandidateCall,

  // Campaign WhatsApp Messages
  addCampaignCandidateWhatsAppMessage,

  // Datasets
  saveDatasets,
  loadDatasets,
  addDataset,
  updateDataset,
  deleteDataset,

  // Dataset Candidates
  addDatasetCandidate,
  updateDatasetCandidate,
  deleteDatasetCandidate,
  bulkUpdateCandidates,

  // Utilities
  clearAllStorage,
  exportAllData,
  importAllData,
  getStorageSize,
  getStorageMetadata,
} from "@/polymet/data/storage-manager";

/**
 * DATA STRUCTURE OVERVIEW
 * ========================
 *
 * The recruitment app has 3 main data entities:
 *
 * 1. JOBS - Job postings with nested candidates
 *    └── Candidates (array)
 *        └── Notes (array)
 *
 * 2. CAMPAIGNS - Marketing campaigns with nested data
 *    ├── Targets (array)
 *    ├── Matrices (array)
 *    └── Candidates (array)
 *        ├── Notes (array)
 *        ├── Calls (array)
 *        └── WhatsApp Messages (array)
 *
 * 3. DATASETS - Candidate databases
 *    └── Candidates (array)
 */

// ============================================
// EXAMPLE 1: Working with Jobs
// ============================================

export function exampleJobOperations() {
  // Load all jobs
  const jobs = loadJobs([]);

  // Add a new job
  const newJob = {
    id: "job_" + Date.now(),
    title: "Senior Developer",
    company: "Tech Corp",
    location: "London, UK",
    employmentType: "Full Time",
    salaryRange: "$50,000 - $70,000",
    openPositions: 3,
    hired: 0,
    target: 3,
    description: "We are looking for an experienced developer...",
    tags: ["React", "TypeScript", "Node.js"],
    candidates: [],
  };
  addJob(newJob);

  // Update job details
  updateJob("job_123", {
    title: "Lead Developer",
    openPositions: 5,
  });

  // Delete a job
  deleteJob("job_456");
}

// ============================================
// EXAMPLE 2: Working with Candidates in Jobs
// ============================================

export function exampleCandidateOperations() {
  // Add a candidate to a job
  const newCandidate = {
    id: "cand_" + Date.now(),
    name: "John Smith",
    phone: "+447700900001",
    email: "john.smith@example.com",
    status: "not-contacted" as const,
    notes: [],
  };
  addCandidateToJob("job_123", newCandidate);

  // Update candidate status (e.g., drag-and-drop in kanban)
  updateCandidate("job_123", "cand_456", {
    status: "interested",
  });

  // Update multiple candidates at once (e.g., reordering)
  const reorderedCandidates = [
    /* array of candidates in new order */
  ];

  updateCandidates("job_123", reorderedCandidates);

  // Delete a candidate
  deleteCandidateFromJob("job_123", "cand_789");
}

// ============================================
// EXAMPLE 3: Working with Candidate Notes
// ============================================

export function exampleNoteOperations() {
  // Add a note to a candidate
  const newNote = {
    id: "note_" + Date.now(),
    text: "Called candidate, very interested in the position",
    timestamp: new Date().toISOString(),
    author: "Sarah Johnson",
    actionType: "call",
    actionDate: "2024-01-20",
  };
  addCandidateNote("job_123", "cand_456", newNote);

  // Update a note
  updateCandidateNote("job_123", "cand_456", "note_789", {
    text: "Updated: Candidate confirmed availability",
  });

  // Delete a note
  deleteCandidateNote("job_123", "cand_456", "note_789");
}

// ============================================
// EXAMPLE 4: Working with Campaigns
// ============================================

export function exampleCampaignOperations() {
  // Add a new campaign
  const newCampaign = {
    id: "camp_" + Date.now(),
    name: "Steel Fixers - London Q1",
    jobId: "job_123",
    jobTitle: "Steel Fixer",
    startDate: "2025-01-01",
    endDate: "2025-03-31",
    channels: ["WhatsApp", "Call"] as const,
    targets: [],
    matrices: [],
    totalCandidates: 0,
    hired: 0,
    responseRate: 0,
    status: "active" as const,
    createdAt: new Date().toISOString(),
    candidates: [],
  };
  addCampaign(newCampaign);

  // Update campaign details
  updateCampaign("camp_123", {
    name: "Updated Campaign Name",
    responseRate: 75,
  });

  // Delete a campaign
  deleteCampaign("camp_456");
}

// ============================================
// EXAMPLE 5: Working with Campaign Candidates
// ============================================

export function exampleCampaignCandidateOperations() {
  // Add a candidate to a campaign
  const newCampaignCandidate = {
    id: "cc_" + Date.now(),
    forename: "John",
    surname: "Smith",
    telMobile: "+447700900001",
    email: "john.smith@example.com",
    callStatus: "not_called" as const,
    availableToWork: null,
    interested: null,
    knowReferee: null,
    calls: [],
    whatsappMessages: [],
    notes: [],
  };
  addCampaignCandidate("camp_123", newCampaignCandidate);

  // Update campaign candidate
  updateCampaignCandidate("camp_123", "cc_456", {
    callStatus: "voicemail",
    availableToWork: true,
    interested: true,
  });

  // Update campaign candidate notes
  const updatedNotes = [
    {
      id: "note_1",
      text: "Candidate very interested",
      timestamp: new Date().toISOString(),
      author: "Agent",
    },
  ];

  updateCampaignCandidateNotes("camp_123", "cc_456", updatedNotes);

  // Delete campaign candidate
  deleteCampaignCandidate("camp_123", "cc_789");
}

// ============================================
// EXAMPLE 6: Working with Campaign Targets
// ============================================

export function exampleCampaignTargetOperations() {
  // Add a target to a campaign
  const newTarget = {
    id: "target_" + Date.now(),
    name: "Available to Work",
    type: "column" as const,
    description: "Check if candidate is available",
    goalType: "boolean" as const,
  };
  addCampaignTarget("camp_123", newTarget);

  // Update a target
  updateCampaignTarget("camp_123", "target_456", {
    name: "Updated Target Name",
    description: "Updated description",
  });

  // Delete a target
  deleteCampaignTarget("camp_123", "target_789");
}

// ============================================
// EXAMPLE 7: Working with Campaign Matrices
// ============================================

export function exampleCampaignMatrixOperations() {
  // Add a matrix to a campaign
  const newMatrix = {
    id: "matrix_" + Date.now(),
    name: "Initial Outreach",
    description: "First contact with candidates",
    whatsappMessage: "Hi! We have an exciting opportunity...",
    callScript: "Hello, this is James from Nucleo Talent...",
  };
  addCampaignMatrix("camp_123", newMatrix);

  // Update a matrix
  updateCampaignMatrix("camp_123", "matrix_456", {
    name: "Updated Matrix",
    whatsappMessage: "Updated message...",
  });

  // Delete a matrix
  deleteCampaignMatrix("camp_123", "matrix_789");
}

// ============================================
// EXAMPLE 8: Working with Call Records
// ============================================

export function exampleCallRecordOperations() {
  // Add a call record to a campaign candidate
  const newCall = {
    id: "call_" + Date.now(),
    callId: "call_external_123",
    phoneFrom: "+447700900001",
    phoneTo: "+447700900002",
    duration: "05:30",
    timestamp: new Date().toISOString(),
    availableToWork: true,
    interested: true,
    knowReferee: false,
    transcript: [
      {
        id: "t1",
        speaker: "agent" as const,
        message: "Hi, this is James from Nucleo Talent...",
      },
      {
        id: "t2",
        speaker: "user" as const,
        message: "Yes, I'm interested...",
      },
    ],
  };
  addCampaignCandidateCall("camp_123", "cc_456", newCall);
}

// ============================================
// EXAMPLE 9: Working with WhatsApp Messages
// ============================================

export function exampleWhatsAppMessageOperations() {
  // Add a WhatsApp message to a campaign candidate
  const newMessage = {
    id: "wa_" + Date.now(),
    sender: "agent" as const,
    text: "Hi! We have an exciting opportunity for you...",
    timestamp: new Date().toISOString(),
    status: "sent" as const,
  };
  addCampaignCandidateWhatsAppMessage("camp_123", "cc_456", newMessage);
}

// ============================================
// EXAMPLE 10: Working with Datasets
// ============================================

export function exampleDatasetOperations() {
  // Add a new dataset
  const newDataset = {
    id: "ds_" + Date.now(),
    name: "Steel Fixers - London",
    description: "Experienced steel fixers in London area",
    candidateCount: 0,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    source: "csv" as const,
    candidates: [],
  };
  addDataset(newDataset);

  // Update dataset details
  updateDataset("ds_123", {
    name: "Updated Dataset Name",
    description: "Updated description",
  });

  // Delete a dataset
  deleteDataset("ds_456");
}

// ============================================
// EXAMPLE 11: Working with Dataset Candidates
// ============================================

export function exampleDatasetCandidateOperations() {
  // Add a candidate to a dataset
  const newCandidate = {
    id: "dc_" + Date.now(),
    name: "John Smith",
    phone: "+447700900001",
    postcode: "E1 6AN",
    location: "London",
    trade: "Steel Fixer",
    blueCard: true,
    greenCard: false,
  };
  addDatasetCandidate("ds_123", newCandidate);

  // Update a dataset candidate
  updateDatasetCandidate("ds_123", "dc_456", {
    name: "John Smith Jr.",
    blueCard: true,
  });

  // Bulk update candidates (e.g., after CSV import)
  const allCandidates = [
    /* array of all candidates */
  ];

  bulkUpdateCandidates("ds_123", allCandidates);

  // Delete a dataset candidate
  deleteDatasetCandidate("ds_123", "dc_789");
}

// ============================================
// EXAMPLE 12: Utility Functions
// ============================================

export function exampleUtilityOperations() {
  // Get storage metadata
  const metadata = getStorageMetadata();
  console.log("Last updated:", metadata?.lastUpdated);
  console.log("Total jobs:", metadata?.totalJobs);

  // Get storage size
  const size = getStorageSize();
  console.log("Total storage:", size.total, "bytes");
  console.log("Jobs:", size.jobs, "bytes");
  console.log("Campaigns:", size.campaigns, "bytes");
  console.log("Datasets:", size.datasets, "bytes");

  // Export all data for backup
  const backup = exportAllData();
  console.log("Backup created:", backup);

  // Import data from backup
  importAllData({
    jobs: backup.jobs,
    campaigns: backup.campaigns,
    datasets: backup.datasets,
  });

  // Clear all storage (use with caution!)
  // clearAllStorage();
}

// ============================================
// BEST PRACTICES
// ============================================

/**
 * 1. ALWAYS use the storage manager functions
 *    - Never directly manipulate localStorage
 *    - All functions automatically save changes
 *
 * 2. LOAD data at component mount
 *    - Use useEffect to load data when component mounts
 *    - Pass default data from imports as fallback
 *
 * 3. UPDATE state AND storage together
 *    - Update local state for immediate UI feedback
 *    - Call storage functions to persist changes
 *
 * 4. HANDLE errors gracefully
 *    - Storage functions catch errors automatically
 *    - Check console for error messages
 *
 * 5. USE unique IDs
 *    - Generate IDs with: "prefix_" + Date.now()
 *    - Or use UUID library for production
 *
 * 6. BACKUP regularly
 *    - Use exportAllData() to create backups
 *    - Store backups externally
 *
 * 7. MONITOR storage size
 *    - Use getStorageSize() to check usage
 *    - localStorage has ~5-10MB limit
 */

// ============================================
// COMMON PATTERNS
// ============================================

/**
 * Pattern 1: Load data on component mount
 */
export function PatternLoadData() {
  // In your component:
  // const [jobs, setJobs] = useState<Job[]>([]);
  //
  // useEffect(() => {
  //   const loadedJobs = loadJobs(jobsData);
  //   setJobs(loadedJobs);
  // }, []);
}
/**
 * Pattern 2: Update and persist data
 */ export function PatternUpdateData() {
  // In your component:
  // const handleUpdateJob = (jobId: string, updates: Partial<Job>) => {
  //   // Update local state
  //   setJobs(jobs.map(job =>
  //     job.id === jobId ? { ...job, ...updates } : job
  //   ));
  //
  //   // Persist to storage
  //   updateJob(jobId, updates);
  // };
}
/**
 * Pattern 3: Add new item
 */ export function PatternAddItem() {
  // In your component:
  // const handleAddJob = (newJob: Job) => {
  //   // Update local state
  //   setJobs([...jobs, newJob]);
  //
  //   // Persist to storage
  //   addJob(newJob);
  // };
}
/**
 * Pattern 4: Delete item
 */ export function PatternDeleteItem() {
  // In your component:
  // const handleDeleteJob = (jobId: string) => {
  //   // Update local state
  //   setJobs(jobs.filter(job => job.id !== jobId));
  //
  //   // Persist to storage
  //   deleteJob(jobId);
  // };
}
export default {
  exampleJobOperations,
  exampleCandidateOperations,
  exampleNoteOperations,
  exampleCampaignOperations,
  exampleCampaignCandidateOperations,
  exampleCampaignTargetOperations,
  exampleCampaignMatrixOperations,
  exampleCallRecordOperations,
  exampleWhatsAppMessageOperations,
  exampleDatasetOperations,
  exampleDatasetCandidateOperations,
  exampleUtilityOperations,
};
