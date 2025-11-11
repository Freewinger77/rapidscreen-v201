# Campaign Wizard Testing Enhancements

## User Request
1. Remove 'Select Existing Group' button - should only be 'Select Dataset'
2. For matrix creation, only "Initial Outreach" should have call and WhatsApp first messages. Other matrices should only have name and description
3. Add "Test Agent in Browser" button on final page (step 4)
4. Depending on selected channels (Call or WhatsApp), show appropriate test buttons
5. Call test: Opens popup simulating a conversation
6. WhatsApp test: Opens popup with chat agent interface

## Related Files
- @/polymet/components/campaign-wizard (to edit) - Main wizard component, needs changes to step 1, step 3, and step 4
- @/polymet/components/call-agent-tester (to create) - New component for testing call agent with conversation simulation
- @/polymet/components/whatsapp-agent-tester (to create) - New component for testing WhatsApp agent with chat interface

## TODO List
- [x] View campaign-wizard to understand current structure
- [x] Update Step 1: Change "Select Existing Group" to "Select Dataset"
- [x] Update Step 3: Modify matrix creation to only show call/WhatsApp messages for "Initial Outreach" matrix
- [x] Create call-agent-tester component for simulating call conversations
- [x] Create whatsapp-agent-tester component for chat interface
- [x] Update Step 4: Add "Test Agent in Browser" section with conditional buttons based on selected channels
- [x] Test all changes work correctly

## Important Notes
- campaign-wizard is a LARGE FILE (1280 lines) - avoid making it larger
- For new testing components, create separate dialog components
- Only "Initial Outreach" matrix should have message fields, others just name + description
- Test buttons should be conditional based on selectedChannels state
- Call tester should simulate a conversation flow
- WhatsApp tester should be a chat interface

  
## Plan Information
*This plan is created when the project is at iteration 12, and date 2025-10-15T00:29:19.845Z*
