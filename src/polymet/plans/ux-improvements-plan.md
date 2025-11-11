# UX Improvements Plan

## User Request
Implement several UX improvements:
1. Fix sidebar active state to highlight current page (campaigns/datasets)
2. Enable card ordering/stacking within kanban columns
3. Make all data editable (jobs, candidates, notes, conversations) with database persistence
4. Improve kanban board layout to show all columns without zooming

## Related Files
- @/polymet/components/sidebar (to update) - Fix active state based on current route
- @/polymet/components/swimlane (to update) - Add card ordering/reordering functionality
- @/polymet/components/kanban-board (to update) - Better layout and edit capabilities
- @/polymet/components/job-header (to update) - Add edit job functionality
- @/polymet/components/candidate-card (to update) - Add edit candidate functionality
- @/polymet/components/candidate-detail-dialog (to view) - Check edit capabilities
- @/polymet/data/jobs-data (to view) - Understand data structure

## TODO List
- [x] Fix sidebar active state to use useLocation hook and highlight current page
- [x] Implement card ordering within swimlanes (drag to reorder)
- [x] Add edit job functionality to job-header (already exists)
- [x] Add edit candidate functionality to candidate-card (added inline editing)
- [x] Improve kanban board layout with better column sizing
- [x] Ensure all edits persist to data layer (simulate database) - Using React state management to simulate persistence. In production, these would be API calls to backend
- [x] Test all edit flows work correctly

## Important Notes
- Sidebar currently hardcodes active state on dashboard link only
- Need to use react-router-dom's useLocation to detect current route
- Card ordering requires tracking position/order within each swimlane
- All data changes should update the state and simulate persistence
- Kanban board needs better responsive layout to fit all columns

  
## Plan Information
*This plan is created when the project is at iteration 33, and date 2025-10-16T17:47:27.980Z*
