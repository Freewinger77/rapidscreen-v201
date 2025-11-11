# Dark Mode and Candidates Enhancement Plan

## User Request
1. Remove the messages/map page from sidebar
2. Create dummy candidate data and associate it with campaigns
3. Implement dark mode toggle (currently only light mode exists)

## Related Files
- @/polymet/components/sidebar (to remove messages link)
- @/polymet/data/campaigns-data (to add more candidate dummy data)
- @/polymet/layouts/main-layout (to add dark mode toggle)
- @/polymet/components/theme-toggle (to create - new component for dark mode switch)

## TODO List
- [x] Remove messages/map navigation link from sidebar
- [x] Expand campaigns-data with more dummy candidates for both campaigns
- [x] Create theme-toggle component with light/dark mode switch
- [x] Add theme-toggle to sidebar
- [ ] Test dark mode functionality across the app

## Important Notes
- The app already supports dark mode via Tailwind's dark mode classes
- Need to implement a toggle to switch between light and dark modes
- Candidate data should be realistic and varied to show different call statuses
- Each campaign should have a good number of candidates (15-30 each)
  
## Plan Information
*This plan is created when the project is at iteration 20, and date 2025-10-15T08:52:03.674Z*
