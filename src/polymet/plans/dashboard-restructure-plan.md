# Dashboard Restructure Plan

## User Request
Transform the dashboard into an analytics home page with metrics, charts, and activity feed. Move the jobs listing to a separate "Jobs" page accessible from the sidebar.

## Related Files
- @/polymet/pages/dashboard (to update) - Convert to analytics dashboard with charts
- @/polymet/pages/jobs (to create) - New page for jobs listing
- @/polymet/components/sidebar (to update) - Add Jobs navigation item
- @/polymet/prototypes/recruitment-app (to update) - Add /jobs route
- @/polymet/data/campaigns-data (to view) - For analytics data

## TODO List
- [x] Create new jobs page with the current dashboard job listing functionality
- [x] Update sidebar to add "Jobs" navigation item
- [x] Create analytics dashboard with:
  - [x] Call costs metrics card
  - [x] Contacted candidates donut chart
  - [x] Pickup rate vs call rate graph
  - [x] WhatsApp engagement chart
  - [x] Latest activity feed
- [x] Update prototype to add /jobs route
- [x] Update sidebar active state logic for jobs page

## Important Notes
- Dashboard should be the home page showing overview metrics
- Jobs page will have the job cards with create/delete functionality
- Use chart-1 through chart-5 colors from theme for consistency
- Charts should use recharts library with ChartContainer
- Activity feed should show recent campaign activities

  
## Plan Information
*This plan is created when the project is at iteration 45, and date 2025-11-04T00:06:58.955Z*
