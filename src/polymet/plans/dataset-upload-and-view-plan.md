# Dataset Upload and View Plan

## User Request
1. Add "View Details" functionality to show candidates when clicking the button (element ID: wmzd2l)
2. Add CSV upload flow with column mapping to "Create New Dataset" button (element ID: wekpn5)
3. Include "Connect to Attio" as coming soon option

## Related Files
- @/polymet/pages/datasets (to update) - Main datasets page with view and upload functionality
- @/polymet/components/dataset-detail-dialog (to create) - Dialog to show dataset candidates
- @/polymet/components/csv-upload-dialog (to create) - Dialog for CSV upload with column mapping
- @/polymet/data/datasets-data (to view) - Understand dataset structure

## TODO List
- [x] Create dataset-detail-dialog component to show candidates in a table
- [x] Create csv-upload-dialog component with upload flow and column mapping
- [x] Update datasets page to integrate both dialogs
- [x] Add state management for viewing dataset details
- [x] Add CSV file parsing logic
- [x] Implement column mapping UI similar to reference image

## Important Notes
- Element wmzd2l is the "View Details" button in dataset cards
- Element wekpn5 is the "Create New Dataset" button in header
- Column mapping should show file columns on left, attributes on right
- Need to support mapping for: name (full/first/last), phone, postcode, location, trade, blue card, green card
- "Connect to Attio" should be shown as "Coming Soon"

  
## Plan Information
*This plan is created when the project is at iteration 27, and date 2025-10-15T10:55:56.951Z*
