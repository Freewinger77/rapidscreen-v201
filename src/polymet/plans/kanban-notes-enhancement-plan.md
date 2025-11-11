# Kanban Notes Enhancement Plan

## User Request
Add notes functionality to kanban board candidates with:
1. Dummy data for candidates with notes
2. Note count badge on candidate cards
3. Nested dialog for adding notes (opens on top of detail dialog)
4. Store notes for each candidate
5. Display existing notes in the main dialog

## Related Files
- @/polymet/data/jobs-data (to update) - Add notes field to Candidate interface and add dummy notes data
- @/polymet/components/candidate-card (to update) - Add note count badge display
- @/polymet/components/candidate-detail-dialog (to update) - Add nested add note dialog functionality
- @/polymet/components/add-note-dialog (to create) - New dialog component for adding notes

## TODO List
- [x] Update Candidate interface in jobs-data to include notes field
- [x] Add dummy notes data to existing candidates
- [x] Create add-note-dialog component for nested note creation
- [x] Update candidate-card to show note count badge
- [x] Update candidate-detail-dialog to use nested add-note-dialog
- [x] Ensure notes are properly stored and displayed

## Important Notes
- Notes should be stored per candidate in the jobs-data
- Note count badge should only show if there are notes (1+)
- Add note dialog should open on top of the detail dialog
- Main dialog should only display existing notes, not the add form
- Add button in main dialog opens the nested dialog

  
## Plan Information
*This plan is created when the project is at iteration 30, and date 2025-10-15T11:13:03.591Z*
