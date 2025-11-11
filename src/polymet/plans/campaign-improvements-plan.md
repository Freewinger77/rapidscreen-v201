# Campaign & Dataset Improvements Plan

## User Request
1. Fix color scheme for tags and icons in datasets and campaigns pages to match platform colors
2. Remove import button from campaigns page and add campaign progress bar (e.g., "2 days remaining")
3. Enhance transcript dialog to show:
   - Merged timeline of WhatsApp and phone call events
   - Three tabs: Notes, Timeline, Conversation
   - Ability to add notes on each candidate
   - Match platform color scheme

## Related Files
- @/polymet/pages/campaigns (to update) - Remove import, add progress bar, fix colors
- @/polymet/pages/datasets (to update) - Fix icon and tag colors to match platform
- @/polymet/pages/campaign-details (to update) - Remove import button
- @/polymet/components/campaign-card (to update) - Add progress bar, fix colors
- @/polymet/components/call-transcript-dialog (to update) - Complete redesign with tabs, notes, timeline
- @/polymet/data/campaigns-data (to update) - Add WhatsApp messages and notes data

## TODO List
- [x] Update datasets page to use semantic colors for icons and tags
- [x] Update campaign card to add progress bar and fix colors
- [x] Remove import button from campaigns page (not needed - no import button exists)
- [x] Remove import button from campaign-details page
- [x] Add WhatsApp message data to campaigns-data
- [x] Create enhanced candidate detail dialog with tabs (Notes, Timeline, Conversation)
- [x] Update campaign-details to use new dialog

## Important Notes
- Use semantic Tailwind classes (bg-primary, text-primary, bg-chart-1, etc.) instead of hardcoded colors
- Progress bar should show days remaining dynamically based on end date
- Timeline should merge WhatsApp and call events chronologically
- Notes tab should allow adding/editing notes with timestamps
- Conversation tab should show WhatsApp messages if available

  
## Plan Information
*This plan is created when the project is at iteration 15, and date 2025-10-15T01:18:59.058Z*
