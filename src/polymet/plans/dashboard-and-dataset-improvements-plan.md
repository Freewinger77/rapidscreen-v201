# Dashboard and Dataset Improvements Plan

## User Request
1. Add ability to delete jobs from the dashboard
2. Match campaign card progress bar style to dashboard job progress bar (same style and theme)
3. Simplify CSV upload to only accept mapping for name and phone, display other columns as-is from the database

## Related Files
- @/polymet/pages/dashboard (to add) - Add delete functionality for jobs
- @/polymet/components/campaign-card (to update) - Match progress bar style to dashboard
- @/polymet/components/csv-upload-dialog (to update) - Simplify to only map name and phone
- @/polymet/data/jobs-data (to view) - Check if delete function exists

## TODO List
- [x] View jobs-data to understand data structure
- [x] Update dashboard page to add delete button/functionality for jobs
- [x] Update campaign-card progress bar to match dashboard style (same colors and styling)
- [x] Simplify CSV upload dialog to only require name and phone mapping
- [x] Remove other attribute options from CSV mapping
- [x] Update CSV upload to display unmapped columns as-is

## Important Notes
- Progress bar in dashboard uses: `<Progress value={progressPercentage} className="h-2" />` with primary color
- Campaign card progress bar (data-pol-id="4recqi") currently uses custom styling with #C96442FF color
- Need to match the campaign progress bar to use the same Progress component and styling as dashboard
- CSV upload currently has many attribute options - simplify to only name (full/first/last) and phone

  
## Plan Information
*This plan is created when the project is at iteration 32, and date 2025-10-15T12:43:25.183Z*
