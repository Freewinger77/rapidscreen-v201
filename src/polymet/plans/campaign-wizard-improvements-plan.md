# Campaign Wizard Improvements Plan

## User Request
1. Create enhanced dataset data with candidate details (names, phone numbers, postcodes, locations, trades, blue/green cards)
2. Show datasets in the datasets page with 2-3 different datasets
3. When selecting "Select Existing Group", show dataset names and allow selection
4. Fix campaign wizard color scheme to match platform theme (remove dark hardcoded colors)
5. Change channels from "WhatsApp, Call, Email" to "Phone, WhatsApp, SMS"

## Related Files
- @/polymet/data/datasets-data (to update) - Add detailed candidate information
- @/polymet/components/dataset-selector-dialog (to create) - Dialog for selecting datasets with candidate preview
- @/polymet/components/campaign-wizard (to update) - Fix color scheme and integrate dataset selector
- @/polymet/pages/datasets (to view) - Understand current dataset display

## TODO List
- [x] Update datasets-data with detailed candidate information (names, phone numbers, postcodes, trades, cards)
- [x] Create dataset-selector-dialog component with candidate preview
- [x] Update campaign-wizard to use dataset-selector-dialog when "Select Existing Group" is clicked
- [x] Fix campaign-wizard color scheme to use semantic Tailwind classes instead of hardcoded dark colors
- [x] Change channels from ["WhatsApp", "Call", "Email"] to ["Phone", "WhatsApp", "SMS"]

## Important Notes
- Campaign wizard is a large file (1205 lines) - avoid making it larger
- Use semantic Tailwind classes (bg-background, bg-card, text-foreground, etc.) instead of hardcoded colors
- Datasets should have realistic candidate data with some fields missing to show variety
- Dataset selector should show candidate count and preview of candidates when clicked
  
## Plan Information
*This plan is created when the project is at iteration 11, and date 2025-10-13T20:52:34.217Z*
