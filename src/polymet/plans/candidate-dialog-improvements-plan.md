# Candidate Dialog Improvements Plan

## User Request
1. Make kanban candidates clickable to open candidate detail dialog with "notes" tab by default
2. For campaign candidates, show only "conversation" and "timeline" tabs with "conversation" selected by default
3. Fix first-time dialog animation that bounces from bottom-right instead of using zoom animation

## Related Files
- @/polymet/components/candidate-detail-dialog (to update) - Add props for default tab and visible tabs
- @/polymet/components/candidate-card (to update) - Make clickable with onClick handler
- @/polymet/components/swimlane (to update) - Add candidate click handler
- @/polymet/components/kanban-board (to update) - Integrate candidate detail dialog
- @/polymet/pages/campaign-details (to update) - Pass correct props to dialog
- @/polymet/components/animated-dialog (to update) - Fix first-time animation issue
- @/polymet/data/jobs-data (to view) - Understand candidate structure for kanban

## TODO List
- [x] View all related files to understand current implementation
- [x] Fix animated-dialog to prevent first-time bottom-right bounce
- [x] Update candidate-detail-dialog to accept defaultTab and visibleTabs props
- [x] Make candidate-card clickable with onClick prop
- [x] Update swimlane to pass onClick handler to candidate cards
- [x] Update kanban-board to integrate candidate detail dialog
- [x] Update campaign-details page to pass correct props for conversation-first view
- [x] Test both scenarios (kanban with notes, campaign with conversation)

## Important Notes
- Kanban candidates use simple Candidate type from jobs-data (name, phone, status)
- Campaign candidates use CampaignCandidate type with more details (calls, messages, notes)
- Need to convert kanban Candidate to CampaignCandidate format for dialog
- Default tab for kanban: "notes", for campaigns: "conversation"
- Visible tabs for kanban: all three, for campaigns: only "conversation" and "timeline"
- Animation issue: Dialog has default Shadcn animation that conflicts with zoom animation on first open

  
## Plan Information
*This plan is created when the project is at iteration 29, and date 2025-10-15T11:06:53.367Z*
