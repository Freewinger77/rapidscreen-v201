# Campaign Flow Integration Plan

## User Request
Implement the imported campaign creation flow design and connect campaigns with job boards. The flow includes:
- Multi-step campaign creation wizard (4 steps)
- Campaign details, targets, matrix creation, and preview
- Campaign listing page
- Integration between campaigns and jobs

## Related Files
- @/polymet/data/campaigns-data (to update) - Add more comprehensive campaign data structure
- @/polymet/components/campaign-wizard (to create) - Multi-step campaign creation dialog
- @/polymet/components/campaign-card (to create) - Campaign card for listings
- @/polymet/pages/campaigns (to create) - Main campaigns listing page
- @/polymet/pages/dashboard (to update) - Update to show jobs with campaign connections
- @/polymet/components/sidebar (to view) - Check navigation structure
- @/polymet/prototypes/recruitment-app (to update) - Add campaign routes

## TODO List
- [x] View existing sidebar and data files to understand current structure
- [x] Update campaigns data with comprehensive structure
- [x] Create campaign wizard component with 4 steps
- [x] Create campaign card component
- [x] Create campaigns listing page
- [x] Update dashboard to show campaign connections
- [x] Update prototype with campaign routes
- [x] Add campaign creation button to job details page
- [x] Test and verify the complete flow

## Important Notes
- Campaign wizard has 4 steps: Details, Target, Create Matrix, Preview & Publish
- Dark theme design with orange/coral accent color (#FF6B4A)
- Need to connect campaigns to specific jobs
- Support for multiple channels (WhatsApp, Call, Email)
- Target groups can be custom or from existing columns

  
## Plan Information
*This plan is created when the project is at iteration 3, and date 2025-10-13T17:44:18.344Z*
