# Campaign Wizard Enhancements Plan

## User Request
Enhance the campaign wizard with:
1. Change channels to Call, WhatsApp, SMS (instead of WhatsApp, Call, Email)
2. Add WhatsApp warmup checkbox
3. Add dataset management page and selection dialog for existing groups
4. Improve matrix creation with goal types (text, number, boolean), descriptions, and WhatsApp/Call message templates
5. Add WhatsApp preview UI and voice agent testing in preview step
6. Add checkbox for auto-calling unresponsive messages after 24h

## Related Files
- @/polymet/components/campaign-wizard (to update) - Main wizard component
- @/polymet/data/datasets-data (to create) - Mock datasets for candidate groups
- @/polymet/components/dataset-selector-dialog (to create) - Dialog for selecting existing datasets
- @/polymet/components/matrix-editor-dialog (to create) - Dialog for editing matrix with goals and messages
- @/polymet/components/whatsapp-preview (to create) - WhatsApp-style message preview
- @/polymet/components/voice-agent-tester (to create) - Voice agent testing component
- @/polymet/pages/datasets (to create) - Dataset management page
- @/polymet/components/sidebar (to update) - Add datasets navigation
- @/polymet/prototypes/recruitment-app (to update) - Add datasets route

## TODO List
- [x] Update channel options to Call, WhatsApp, SMS
- [x] Add WhatsApp warmup checkbox
- [x] Create datasets data file with mock data
- [x] Create dataset selector dialog component
- [x] Update campaign wizard to use dataset selector
- [x] Create matrix editor dialog with goal types and message templates
- [x] Update campaign wizard to use matrix editor
- [x] Create WhatsApp preview component
- [x] Create voice agent tester component
- [x] Update preview step with WhatsApp preview and voice testing
- [x] Add auto-call unresponsive checkbox
- [x] Create datasets management page
- [x] Update sidebar with datasets navigation
- [x] Add datasets route to prototype

## Important Notes
- WhatsApp preview should mimic the reference image with chat bubble UI
- Matrix editor needs goal types: text, number, boolean with descriptions
- Dataset selector should show candidate counts and allow multiple selections
- Voice agent tester should allow speaking to the agent with configured settings
- Auto-call checkbox only shows when WhatsApp is selected

  
## Plan Information
*This plan is created when the project is at iteration 7, and date 2025-10-13T18:19:49.424Z*
