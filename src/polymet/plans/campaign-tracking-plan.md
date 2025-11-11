# Campaign Tracking Implementation Plan

## User Request
Create a campaign management flow similar to the reference images that allows tracking candidates in a tabular format with call transcripts, call status, and detailed candidate information.

## Related Files
- @/polymet/pages/campaign-details (to create) - Main campaign tracking page with tabular view
- @/polymet/components/candidates-table (to create) - Table component for candidate listing
- @/polymet/components/call-transcript-dialog (to create) - Dialog to view call transcripts
- @/polymet/components/campaign-stats-cards (to create) - Stats cards for Not Called, No Answer, Voicemail
- @/polymet/data/campaigns-data (to update) - Add call tracking data
- @/polymet/prototypes/recruitment-app (to update) - Add new route

## TODO List
- [x] Update campaigns data with call tracking information (call status, transcripts, timestamps)
- [x] Create campaign stats cards component (Not Called, No Answer, Voicemail)
- [x] Create candidates table component with filters and sorting
- [x] Create call transcript dialog component
- [x] Create campaign details page combining all components
- [x] Update prototype to add campaign details route
- [x] Update campaign card to link to campaign details

## Important Notes
- Reference design shows dark theme with tabular layout
- Key features: search, filters (Available to Work, Interested, Know Referee), sortable columns
- Call transcript shows conversation between User and Agent with timestamps
- Stats cards show counts for different call statuses
- Table columns: Forename, Tel Mobile, Call Status, Available to Work, Interested, Know Referee, Actions (view/delete)

  
## Plan Information
*This plan is created when the project is at iteration 4, and date 2025-10-13T17:56:22.640Z*
