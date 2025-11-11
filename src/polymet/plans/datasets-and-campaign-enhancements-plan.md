# Datasets and Campaign Enhancements Plan

## User Request
1. Connect datasets page to the recruitment-app prototype using path `/datasets`
2. Update campaign wizard with:
   - Descriptive targets with title, description, and type (number, text, boolean)
   - Matrix with title and description
   - Live WhatsApp preview when typing first message for WhatsApp outreach
   - First message for call part

## Related Files
- @/polymet/prototypes/recruitment-app (to update) - Add datasets route
- @/polymet/components/campaign-wizard (to update) - Add target descriptions, matrix descriptions, and live WhatsApp preview
- @/polymet/data/campaigns-data (to view) - Understand data structure
- @/polymet/components/whatsapp-preview (to use) - For live preview
- @/polymet/pages/datasets (exists) - Already created

## TODO List
- [x] View existing files to understand structure
- [x] Connect datasets page to prototype with /datasets route
- [x] Update CampaignTarget interface to include description and goalType
- [x] Update CampaignMatrix interface to include description
- [x] Update campaign wizard step 2 (targets) to show description and type fields
- [x] Update campaign wizard step 3 (matrix) to show description field
- [x] Add outreach message fields (WhatsApp first message, Call script)
- [x] Add live WhatsApp preview component in step 3 or 4
- [x] Test all changes

## Important Notes
- Datasets page already exists at @/polymet/pages/datasets
- Need to add route to prototype
- WhatsApp preview component already exists
- Target types should be: text, number, boolean
- Live preview should update as user types
  
## Plan Information
*This plan is created when the project is at iteration 8, and date 2025-10-13T18:33:07.881Z*
