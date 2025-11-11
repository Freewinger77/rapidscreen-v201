# Zoom Animation and Campaign Improvements Plan

## User Request
1. Add zoom-in animation to all popup dialogs (similar to Magnific Popup zoom effect)
2. Add campaign progress bar to campaign cards showing "Campaign End: {date}" with time-based progress
3. Show active campaign name on job cards with a small green dot indicator

## Related Files
- @/polymet/components/campaign-card (to update) - Add campaign end date progress bar
- @/polymet/pages/dashboard (to update) - Add active campaign name and green dot to job cards
- @/polymet/data/campaigns-data (to view) - Check campaign data structure
- @/polymet/components/campaign-wizard (to update) - Add zoom animation
- @/polymet/components/candidate-detail-dialog (to update) - Add zoom animation
- @/polymet/components/call-transcript-dialog (to update) - Add zoom animation
- @/polymet/components/dataset-selector-dialog (to update) - Add zoom animation
- @/polymet/components/whatsapp-agent-tester (to update) - Add zoom animation
- @/polymet/components/call-agent-tester (to update) - Add zoom animation
- @/polymet/components/matrix-editor-dialog (to update) - Add zoom animation

## TODO List
- [x] View campaign-card component
- [x] View dashboard page
- [x] View campaigns-data
- [x] Update campaign-card to show "Campaign End: {date}" with progress bar
- [x] Update dashboard page to show active campaign name with green dot
- [x] View campaign-wizard component
- [x] Create a dialog wrapper component with zoom animation
- [x] Apply zoom animation to all dialog components (campaign-wizard, candidate-detail-dialog, dataset-selector-dialog, whatsapp-agent-tester, call-agent-tester)

## Important Notes
- Zoom animation uses CSS transitions with scale and opacity
- Progress bar should match the style used in job cards (same color scheme)
- Green dot indicator should be small and positioned next to campaign name
- All dialogs need the zoom animation class applied
  
## Plan Information
*This plan is created when the project is at iteration 21, and date 2025-10-15T09:09:08.901Z*
