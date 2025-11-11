/**
 * RECRUITMENT APP - DATA ARCHITECTURE
 * ====================================
 *
 * This file documents the complete data architecture of the recruitment platform.
 * All data structures are designed for efficient storage, retrieval, and persistence.
 */

// ============================================
// CORE DATA TYPES
// ============================================

/**
 * JOB - Main job posting entity
 *
 * Represents a job opening with nested candidates
 * Each job can have multiple candidates in different stages
 */
export interface Job {
  // Basic Info
  id: string; // Unique identifier
  title: string; // Job title (e.g., "Site Engineer")
  company: string; // Company name
  location: string; // Job location
  employmentType: string; // "Full Time", "Part Time", "Contract"
  salaryRange: string; // Salary range string

  // Metrics
  openPositions: number; // Number of open positions
  hired: number; // Number of hired candidates
  target: number; // Target number to hire

  // Details
  description: string; // Job description
  tags: string[]; // Skills/requirements tags

  // Nested Data
  candidates: Candidate[]; // Array of candidates for this job
}

/**
 * CANDIDATE - Candidate in a job
 *
 * Represents a candidate in the recruitment pipeline
 * Can move between different statuses in the kanban board
 */
export interface Candidate {
  // Basic Info
  id: string; // Unique identifier
  name: string; // Full name
  phone: string; // Phone number
  email?: string; // Email address (optional)

  // Status
  status: // Current pipeline stage
  "not-contacted" | "interested" | "started-work" | "rejected" | "interview";

  // Nested Data
  notes?: CandidateNote[]; // Array of notes about this candidate
}

/**
 * CANDIDATE NOTE - Note about a candidate
 *
 * Represents a note or action item for a candidate
 * Used for tracking interactions and follow-ups
 */
export interface CandidateNote {
  // Basic Info
  id: string; // Unique identifier
  text: string; // Note content
  timestamp: string; // When note was created
  author: string; // Who created the note

  // Action Details (optional)
  actionType?: string; // "call", "email", "meeting", "whatsapp"
  actionDate?: string; // Scheduled action date
}

// ============================================
// CAMPAIGN DATA TYPES
// ============================================

/**
 * CAMPAIGN - Marketing/outreach campaign
 *
 * Represents a campaign to reach out to candidates
 * Contains targets, matrices, and campaign-specific candidates
 */
export interface Campaign {
  // Basic Info
  id: string; // Unique identifier
  name: string; // Campaign name
  jobId: string; // Associated job ID
  jobTitle: string; // Job title for reference
  linkJob?: string; // Optional linked job

  // Dates
  startDate: string; // Campaign start date
  endDate: string; // Campaign end date
  createdAt: string; // When campaign was created

  // Configuration
  channels: Array<"WhatsApp" | "Call" | "Email">; // Communication channels
  targets: CampaignTarget[]; // Campaign targets/goals
  matrices: CampaignMatrix[]; // Campaign matrices/scripts

  // Metrics
  totalCandidates: number; // Total candidates in campaign
  hired: number; // Number hired through campaign
  responseRate: number; // Response rate percentage

  // Status
  status: "active" | "draft" | "completed";

  // Nested Data
  candidates?: CampaignCandidate[]; // Campaign-specific candidates
}

/**
 * CAMPAIGN TARGET - Goal/target for a campaign
 *
 * Represents a specific goal or data point to collect
 */
export interface CampaignTarget {
  id: string; // Unique identifier
  name: string; // Target name
  type: "column" | "custom"; // Target type
  description?: string; // Target description
  goalType?: "text" | "number" | "boolean"; // Data type
}

/**
 * CAMPAIGN MATRIX - Script/template for a campaign
 *
 * Represents a message template or script
 */
export interface CampaignMatrix {
  id: string; // Unique identifier
  name: string; // Matrix name
  description?: string; // Matrix description
  whatsappMessage?: string; // WhatsApp message template
  callScript?: string; // Call script template
}

/**
 * CAMPAIGN CANDIDATE - Candidate in a campaign
 *
 * Represents a candidate being contacted through a campaign
 * More detailed than regular candidates with call/message history
 */
export interface CampaignCandidate {
  // Basic Info
  id: string; // Unique identifier
  forename: string; // First name
  surname: string; // Last name
  telMobile: string; // Mobile phone
  email?: string; // Email address

  // Call Status
  callStatus: // Current call status
  | "not_called"
    | "agent_hangup"
    | "user_declined"
    | "user_hangup"
    | "no_answer"
    | "voicemail"
    | "invalid_destination";

  // Campaign Data
  availableToWork: boolean | null; // Availability status
  interested: boolean | null; // Interest level
  knowReferee: boolean | null; // Knows referee
  lastContact?: string; // Last contact description
  experience?: string; // Experience level

  // Nested Data
  calls: CallRecord[]; // Array of call records
  whatsappMessages?: WhatsAppMessage[]; // WhatsApp message history
  notes?: CandidateNote[]; // Notes about candidate
}

/**
 * CALL RECORD - Record of a phone call
 *
 * Represents a completed phone call with transcript
 */
export interface CallRecord {
  id: string; // Unique identifier
  callId: string; // External call ID
  phoneFrom: string; // Caller phone number
  phoneTo: string; // Recipient phone number
  duration: string; // Call duration
  timestamp: string; // When call occurred

  // Call Results
  availableToWork: boolean | null;
  interested: boolean | null;
  knowReferee: boolean | null;

  // Transcript
  transcript: CallTranscriptMessage[];
}

/**
 * CALL TRANSCRIPT MESSAGE - Single message in call transcript
 */
export interface CallTranscriptMessage {
  id: string; // Unique identifier
  speaker: "user" | "agent"; // Who spoke
  message: string; // What was said
  timestamp?: string; // When it was said
}

/**
 * WHATSAPP MESSAGE - WhatsApp message
 *
 * Represents a WhatsApp message in a conversation
 */
export interface WhatsAppMessage {
  id: string; // Unique identifier
  sender: "user" | "agent"; // Who sent the message
  text: string; // Message content
  timestamp: string; // When message was sent
  status?: "sent" | "delivered" | "read"; // Message status
}

// ============================================
// DATASET DATA TYPES
// ============================================

/**
 * DATASET - Collection of candidates
 *
 * Represents a dataset/database of candidates
 * Can be imported from CSV or created manually
 */
export interface Dataset {
  // Basic Info
  id: string; // Unique identifier
  name: string; // Dataset name
  description: string; // Dataset description

  // Metadata
  candidateCount: number; // Number of candidates
  createdAt: string; // When dataset was created
  lastUpdated: string; // Last update timestamp
  source: "csv" | "manual" | "imported"; // Data source

  // Nested Data
  candidates: DatasetCandidate[]; // Array of candidates
}

/**
 * DATASET CANDIDATE - Candidate in a dataset
 *
 * Represents a candidate in a dataset
 * Simpler structure focused on basic info
 */
export interface DatasetCandidate {
  // Basic Info
  id: string; // Unique identifier
  name: string; // Full name
  phone: string; // Phone number

  // Optional Details
  postcode?: string; // Postal code
  location?: string; // Location/city
  trade?: string; // Trade/skill
  blueCard?: boolean; // Has blue card
  greenCard?: boolean; // Has green card
}

// ============================================
// STORAGE METADATA
// ============================================

/**
 * STORAGE METADATA - Metadata about stored data
 *
 * Tracks information about the storage system
 */
export interface StorageMetadata {
  lastUpdated: string; // Last update timestamp
  version: string; // Data version
  totalJobs: number; // Total number of jobs
  totalCampaigns: number; // Total number of campaigns
  totalDatasets: number; // Total number of datasets
}

// ============================================
// DATA RELATIONSHIPS
// ============================================

/**
 * DATA RELATIONSHIP DIAGRAM
 *
 * Job (1) ──→ (N) Candidate
 *                    │
 *                    └──→ (N) CandidateNote
 *
 * Campaign (1) ──→ (N) CampaignTarget
 *              ├──→ (N) CampaignMatrix
 *              └──→ (N) CampaignCandidate
 *                         ├──→ (N) CallRecord
 *                         │         └──→ (N) CallTranscriptMessage
 *                         ├──→ (N) WhatsAppMessage
 *                         └──→ (N) CandidateNote
 *
 * Dataset (1) ──→ (N) DatasetCandidate
 *
 * Job (1) ←──→ (N) Campaign (via jobId)
 */

// ============================================
// STORAGE KEYS
// ============================================

/**
 * LOCALSTORAGE KEYS
 *
 * All data is stored in localStorage with these keys:
 *
 * - recruitment_app_jobs       → Array<Job>
 * - recruitment_app_campaigns  → Array<Campaign>
 * - recruitment_app_datasets   → Array<Dataset>
 * - recruitment_app_metadata   → StorageMetadata
 */

// ============================================
// DATA FLOW
// ============================================

/**
 * DATA FLOW DIAGRAM
 *
 * 1. USER ACTION (UI)
 *    ↓
 * 2. UPDATE LOCAL STATE (React useState)
 *    ↓
 * 3. CALL STORAGE MANAGER FUNCTION
 *    ↓
 * 4. UPDATE LOCALSTORAGE
 *    ↓
 * 5. UPDATE METADATA
 *    ↓
 * 6. UI REFLECTS CHANGES
 *
 * Example:
 * User edits job → setJobs(updated) → updateJob(id, data) → localStorage.setItem()
 */

// ============================================
// BEST PRACTICES
// ============================================

/**
 * 1. ALWAYS use storage manager functions
 *    ✅ updateJob(id, data)
 *    ❌ localStorage.setItem('jobs', ...)
 *
 * 2. UPDATE state and storage together
 *    ✅ setJobs(updated); updateJob(id, data);
 *    ❌ Only updating state without persisting
 *
 * 3. LOAD data on mount
 *    ✅ useEffect(() => setJobs(loadJobs(defaultJobs)), [])
 *    ❌ Using only default data without loading
 *
 * 4. USE unique IDs
 *    ✅ id: "job_" + Date.now()
 *    ❌ id: Math.random().toString()
 *
 * 5. HANDLE nested updates properly
 *    ✅ updateCandidateNote(jobId, candidateId, noteId, data)
 *    ❌ Manually updating nested arrays
 *
 * 6. BACKUP regularly
 *    ✅ const backup = exportAllData()
 *    ❌ Never backing up data
 */

// ============================================
// PERFORMANCE CONSIDERATIONS
// ============================================

/**
 * 1. LOCALSTORAGE LIMITS
 *    - Typical limit: 5-10 MB
 *    - Monitor with: getStorageSize()
 *    - Clear old data if needed
 *
 * 2. LARGE ARRAYS
 *    - Campaigns with 1000+ candidates may be slow
 *    - Consider pagination for large lists
 *    - Use virtualization for rendering
 *
 * 3. FREQUENT UPDATES
 *    - Debounce rapid updates
 *    - Batch multiple changes
 *    - Use optimistic UI updates
 *
 * 4. SEARCH & FILTER
 *    - Filter in memory, not storage
 *    - Index frequently searched fields
 *    - Cache search results
 */

// ============================================
// MIGRATION & VERSIONING
// ============================================

/**
 * DATA VERSION: 1.0.0
 *
 * When data structure changes:
 * 1. Increment version number
 * 2. Create migration function
 * 3. Run migration on load
 * 4. Update metadata version
 *
 * Example migration:
 *
 * function migrateV1toV2(data: any) {
 *   return data.map(item => ({
 *     ...item,
 *     newField: "default value"
 *   }));
 * }
 */

export default {
  // Export types for use in other files
  // (TypeScript interfaces are automatically exported)
};
