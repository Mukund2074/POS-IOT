# Marketing Campaigns Redux Architecture

## Overview

This document provides a visual representation of how the Marketing Campaigns system works via Redux.

---

## 1. Redux Store Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    REDUX STORE                              │
│  (configureStore with redux-persist)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │    user      │  │   settings   │  │    route     │       │
│  │  (persisted) │  │  (persisted) │  │  (persisted) │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            campaigns (persisted)                    │    │
│  │  Key: 'campaigns' in localStorage                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Campaigns Slice State Structure

```
┌─────────────────────────────────────────────────────────────┐
│              CampaignState (campaignsSlice)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  currentStep: number                    (0-6)               │
│  stepsCompleted: boolean[]              [false×4]           │
│  isCreating: boolean                    false               │
│  editingCampaignId: string | null       null                │
│  createdCampaign: CreatedCampaign | null null               │
│  campaignType: PostApiCampaignsBodyCampaignType  EMAIL      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │            campaignData: CampaignData               │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                     │    │
│  │  step1: {                                           │    │
│  │    campaignName: string                             │    │
│  │    isExpanded: boolean                              │    │
│  │  }                                                  │    │
│  │                                                     │    │
│  │  step2: {                                           │    │
│  │    selectedGroup: string | null                     │    │
│  │    selectedGroups?: string[]                        │    │
│  │    customerGroupNames?: Record<string, string>      │    │
│  │    filters: {                                       │    │
│  │      fromDate?: string                              │    │
│  │      toDate?: string                                │    │
│  │      employee?: string                              │    │
│  │      treatments?: string[]                          │    │
│  │    }                                                │    │
│  │    isExpanded: boolean                              │    │
│  │    serviceGroups?: any[]                            │    │
│  │  }                                                  │    │
│  │                                                     │    │
│  │  step3: {                                           │    │
│  │    subject: string                                  │    │
│  │    senderName: string                               │    │
│  │    replyTo: string                                  │    │
│  │    content: string                                  │    │
│  │    isExpanded: boolean                              │    │
│  │  }                                                  │    │
│  │                                                     │    │
│  │  step4: {                                           │    │
│  │    sendDateTime: string                             │    │
│  │    isManualTrigger: boolean                         │    │
│  │    isExpanded: boolean                              │    │
│  │  }                                                  │    │
│  │                                                     │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Redux Actions Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ACTIONS (Exported)                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  • setCurrentStep(number)                                   │
│    └─> Updates current step & auto-expands accordion        │
│                                                             │
│  • updateStepData({ step, data })                           │
│    └─> Updates specific step data in campaignData           │
│                                                             │
│  • toggleStepExpansion(number)                              │
│    └─> Toggles accordion expanded/collapsed state           │
│                                                             │
│  • setStepCompleted({ step, completed })                    │
│    └─> Marks step as completed/incomplete                   │
│                                                             │
│  • resetCampaignForm()                                      │
│    └─> Resets entire form to initial state                  │
│                                                             │
│  • setCreatedCampaign(CreatedCampaign | null)               │
│    └─> Stores created/updated campaign from API             │
│                                                             │
│  • setEditingCampaignId(string | null)                      │
│    └─> Tracks which campaign is being edited                │
│                                                             │
│  • loadCampaignData(CampaignData)                           │
│    └─> Loads campaign data (from API or form)               │
│                                                             │
│  • setIsCreating(boolean)                                   │
│    └─> Tracks if campaign creation is in progress           │
│                                                             │
│  • setCampaignType(PostApiCampaignsBodyCampaignType)        │
│    └─> Sets campaign type (EMAIL, SMS, TRIGGER)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Component Hierarchy & Redux Usage

```
┌─────────────────────────────────────────────────────────────┐
│              EmailCampaigns.index.tsx                       │
│  • dispatch(resetCampaignForm()) on mount                   │
│  • Renders: EmailCampaignStats, EmailCampaignsList          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            EmailCampgainWizard.tsx                          │
│  ────────────────────────────────────────────────────────   │
│  • useSelector: state.campaigns (full state)                │
│  • dispatch: All campaign actions                           │
│  • Manages: Campaign creation/editing flow                  │
│  • Handles: API calls (GET, POST, PUT)                      │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Stepper.tsx                                        │    │
│  │  • useSelector: state.campaigns                     │    │
│  │  • dispatch: setCurrentStep()                       │    │
│  │  • Shows: Step indicators & navigation              │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Step1Details.tsx                                   │    │
│  │  • useSelector: state.campaigns.campaignData.step1  │    │
│  │  • useSelector: state.campaigns.stepsCompleted      │    │
│  │  • dispatch: updateStepData('step1', {...})         │    │
│  │  • dispatch: toggleStepExpansion(1)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Step2CustomerGroup.tsx                             │    │
│  │  • useSelector: state.campaigns.campaignData.step2  │    │
│  │  • useSelector: state.campaigns.stepsCompleted      │    │
│  │  • dispatch: updateStepData('step2', {...})         │    │
│  │  • dispatch: toggleStepExpansion(2)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Step3Content.tsx                                   │    │
│  │  • useSelector: state.campaigns.campaignData.step3  │    │
│  │  • useSelector: state.campaigns.stepsCompleted      │    │
│  │  • dispatch: updateStepData('step3', {...})         |    │
│  │  • dispatch: toggleStepExpansion(3)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Step4Sender.tsx                                    │    │
│  │  • useSelector: state.campaigns.campaignData.step4  │    │
│  │  • useSelector: state.campaigns.stepsCompleted      │    │
│  │  • dispatch: updateStepData('step4', {...})         │    │
│  │  • dispatch: toggleStepExpansion(4)                 │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Step6PriceReceivers.tsx                            │    │
│  │  • useSelector: state.campaigns.createdCampaign     │    │
│  │  • Shows: Summary & pricing info                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  WizardFooter.tsx                                   │    │
│  │  • useSelector: state.campaigns (full state)        │    │
│  │  • dispatch: resetCampaignForm()                    │    │
│  │  • dispatch: setStepCompleted()                     │    │
│  │  • Handles: Next/Back/Delete/Trigger actions        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Data Flow: Creating a Campaign

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Step Components (1-4)                          │
│  • User fills form fields                                   │
│  • dispatch(updateStepData({ step: 'step1', data: {...} })) │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Redux Store (campaigns)                        │
│  • campaignData.step1, step2, step3, step4 updated          │
│  • State persisted to localStorage                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         WizardFooter.tsx (Step 4 Next Click)                │
│  • Validates all steps                                      │
│  • dispatch(setIsCreating(true))                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         EmailCampgainWizard.tsx                             │
│  • Reads: useSelector(state => state.campaigns)             │
│  • Calls: prepareCampaignPayload(campaignsState)            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         campaignDataUtils.ts                                │
│  ────────────────────────────────────────────────────────   │
│  prepareCampaignPayload(state: CampaignState)               │
│  • Reads: campaignData from state                           │
│  • Reads: campaignType from state                           │
│  • Maps: campaignType → messageType & contentType           │
│  • Builds: API payload with conditions                      │
│  • Returns: PostApiCampaignsBody                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API Call (POST /api/campaigns)                 │
│  • getApi().postApiCampaigns(payload)                       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         EmailCampgainWizard.tsx                             │
│  • dispatch(setCreatedCampaign(response))                   │
│  • dispatch(setIsCreating(false))                           │
│  • dispatch(setCurrentStep(6)) // Navigate to summary       │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Redux Store Updated                            │
│  • createdCampaign: CreatedCampaign                         │
│  • currentStep: 6                                           │
│  • isCreating: false                                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────-----────────────────────┐
│         Step6PriceReceivers.tsx                                  │
│  • Reads: useSelector(state => state.campaigns.createdCampaign)  │
│  • Displays: Campaign summary & pricing                          │
└───────────────────────────────────────────────────────────-----──┘
```

---

## 6. Data Flow: Editing a Campaign

```
┌─────────────────────────────────────────────────────────────┐
│         User navigates to /campaigns/:id                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         EmailCampgainWizard.tsx (useEffect)                 │
│  • Reads: params.id from URL                                │
│  • dispatch(resetCampaignForm())                            │
│  • dispatch(setEditingCampaignId(campaignId))               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API Call (GET /api/campaigns/:id)              │
│  • getApi().getApiCampaignsId(campaignId)                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         campaignDataMapper.ts                               │
│  ────────────────────────────────────────────────────────   │
│  mapApiResponseToCampaignData(apiData)                      │
│  • Maps: API response → CampaignData format                 │
│  • Extracts: conditions, filters, content, schedule         │
│  • Returns: CampaignData                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         EmailCampgainWizard.tsx                             │
│  • dispatch(loadCampaignData(mappedData))                   │
│  • dispatch(setCampaignType(apiData.campaignType))          │
│  • dispatch(setCurrentStep(1))                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Redux Store Updated                            │
│  • campaignData: CampaignData (from API)                    │
│  • campaignType: EMAIL/SMS/TRIGGER                          │
│  • editingCampaignId: campaignId                            │
│  • currentStep: 1                                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         Step Components (1-4)                               │
│  • Read: useSelector(state => state.campaigns.campaignData) │
│  • Display: Pre-filled form fields                          │
│  • User edits: dispatch(updateStepData(...))                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         On Save (PUT /api/campaigns/:id)                    │
│  • prepareCampaignUpdatePayload(campaignsState)             │
│  • getApi().putApiCampaignsId(id, payload)                  │
│  • dispatch(setCreatedCampaign(response))                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. Utility Functions

```
┌─────────────────────────────────────────────────────────────┐
│         campaignDataUtils.ts                                │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  getMessageTypeFromCampaignType(campaignType)               │
│  └─> Maps: EMAIL → EMAIL, SMS → SMS, TRIGGER → EMAIL        │
│                                                             │
│  getContentTypeFromCampaignType(campaignType)               │
│  └─> Maps: EMAIL → EMAIL, SMS → SMS, TRIGGER → EMAIL        │
│                                                             │
│  prepareCampaignPayload(state: CampaignState)               │
│  └─> Converts Redux state → API POST payload                │
│      • Builds conditions from step2 filters                 │
│      • Maps campaignType to messageType/contentType         │
│      • Formats schedule data                                │
│                                                             │
│  prepareCampaignUpdatePayload(state: CampaignState)         │
│  └─> Converts Redux state → API PUT payload                 │
│      • Uses prepareCampaignPayload internally               │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         campaignDataMapper.ts                               │
│  ────────────────────────────────────────────────────────   │
│                                                             │
│  mapApiResponseToCampaignData(apiData: GetApiCampaignsId200)│
│  └─> Converts API response → CampaignData                   │
│      • Extracts conditions → selectedGroups                 │
│      • Maps filters (dates, employee, treatments)           │
│      • Formats sendDateTime                                 │
│      • Maps content fields                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. State Persistence (redux-persist)

```
┌─────────────────────────────────────────────────────────────┐
│         Redux Store                                         │
│  campaigns: CampaignState                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         redux-persist                                       │
│  • Key: 'campaigns'                                         │
│  • Storage: localStorage                                    │
│  • Persists: Entire campaigns state                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         localStorage                                        │
│  {                                                          │
│    "campaigns": {                                           │
│      "currentStep": 2,                                      │
│      "campaignData": { ... },                               │
│      "campaignType": "EMAIL",                               │
│      ...                                                    │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         On App Reload                                       │
│  • Redux state restored from localStorage                   │
│  • User can continue where they left off                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. Campaign Type Flow (EMAIL/SMS/TRIGGER)

```
┌───────────────────────────────────────────────────────────────┐
│         Setting Campaign Type                                 │
│  • dispatch(setCampaignType(PostApiCampaignsBodyCampaignType))│
│  • Stored in: state.campaigns.campaignType                    │
└───────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         prepareCampaignPayload()                            │
│  • Reads: state.campaignType                                │
│  • Calls: getMessageTypeFromCampaignType()                  │
│  • Calls: getContentTypeFromCampaignType()                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│         API Payload                                         │
│  {                                                          │
│    "messageType": "EMAIL" | "SMS",                          │
│    "campaignType": "EMAIL" | "SMS" | "TRIGGER",             │
│    "content": {                                             │
│      "contentType": "EMAIL" | "SMS"                         │
│    }                                                        │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Key Design Patterns

### **Single Source of Truth**

- All campaign form data lives in `state.campaigns.campaignData`
- Step components read from Redux, not local state

### **Unidirectional Data Flow**

- User Input → dispatch(action) → Redux Store → Component Re-render
- No direct state mutations

### **Separation of Concerns**

- **Slice**: State management & actions
- **Utils**: Data transformation (Redux ↔ API)
- **Mapper**: API response → Redux format
- **Components**: UI & user interactions

### **Persistence**

- Campaign state persists across page reloads
- User can resume form editing

### **Type Safety**

- TypeScript interfaces for all state shapes
- Type-safe actions with PayloadAction

---

## Summary

The Marketing Campaigns system uses Redux Toolkit with:

- **1 slice** (`campaignsSlice`) managing all campaign state
- **10 actions** for state updates
- **Persistent storage** via redux-persist
- **Utility functions** for API payload transformation
- **Mapper function** for API response conversion
- **Multi-step wizard** with step-by-step state management
- **Support for multiple campaign types** (EMAIL, SMS, TRIGGER)

All components follow a consistent pattern:

1. Read state via `useSelector`
2. Update state via `dispatch(action)`
3. State changes trigger re-renders
4. Form data persists automatically
