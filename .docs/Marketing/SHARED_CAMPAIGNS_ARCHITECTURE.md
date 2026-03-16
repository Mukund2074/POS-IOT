# Shared Campaigns Architecture Proposal

## Overview

This document proposes a new shared architecture for Email and SMS campaigns to eliminate code duplication and improve maintainability.

## Current Structure Issues

- **Duplication**: EmailCampaignsList and SMSCampaignsList are ~95% identical
- **Duplication**: EmailCampaignStats and SMSCampaignStats are ~95% identical
- **Scattered Shared Code**: CampaignWizard is in EmailCampaigns folder but used by both
- **Maintenance Burden**: Changes need to be made in multiple places

## Proposed Structure

```
src/scenes/Marketing/
├── Campaigns/                          # NEW: Shared campaigns folder
│   ├── CampaignForm/                   # Shared form components
│   │   ├── CampaignWizard.tsx         # Main wizard (already shared)
│   │   ├── Stepper.tsx                 # Step indicator
│   │   ├── WizardFooter.tsx            # Footer with Next/Back buttons
│   │   └── steps/                      # Form steps (shared)
│   │       ├── Step1Details.tsx
│   │       ├── Step2CustomerGroup.tsx
│   │       ├── Step3Content.tsx
│   │       ├── Step4Sender.tsx
│   │       ├── Step6PriceReceivers.tsx
│   │       └── Step6Summary.tsx
│   ├── CampaignsList.tsx              # NEW: Shared list component
│   ├── CampaignStats.tsx              # NEW: Shared stats component
│   └── types.ts                        # NEW: Shared types and constants
│
├── EmailCampaigns/                     # Email-specific wrappers
│   ├── EmailCampaigns.index.tsx       # Main page (uses shared components)
│   ├── EmailCampaigns.layout.tsx       # Layout wrapper
│   └── EmailCampaignWizard.tsx         # Wrapper for CampaignWizard
│
└── SMSCampaigns/                       # SMS-specific wrappers
    ├── SMSCampaigns.index.tsx          # Main page (uses shared components)
    ├── SMSCampaigns.layout.tsx         # Layout wrapper
    └── SMSCampaignWizard.tsx           # Wrapper for CampaignWizard
```

## Component Design

### 1. Shared CampaignsList Component

**Location**: `src/scenes/Marketing/Campaigns/CampaignsList.tsx`

**Props**:

```typescript
interface CampaignsListProps {
    campaigns: GetApiCampaigns200CampaignsItem[];
    isLoading?: boolean;
    campaignType: 'EMAIL' | 'SMS';
    baseRoute: string; // e.g., '/marketing/email-campaigns' or '/marketing/sms-campaigns'
    translationKeys: {
        campaignName: string;
        customerGroup: string;
        created: string;
        recipient: string;
        revenue: string;
    };
}
```

**Benefits**:

- Single source of truth for list logic
- Accepts campaignType and translation keys as props
- Handles navigation based on baseRoute

### 2. Shared CampaignStats Component

**Location**: `src/scenes/Marketing/Campaigns/CampaignStats.tsx`

**Props**:

```typescript
interface CampaignStatsProps {
    campaigns: GetApiCampaigns200CampaignsItem[];
    isLoading?: boolean;
    translationKeys: {
        preference: string; // "Email preference" or "SMS preference"
        revenue: string;
    };
}
```

**Benefits**:

- Single source of truth for stats logic
- Accepts translation keys as props
- Same statistics calculation for both types

### 3. Campaign Type Configuration

**Location**: `src/scenes/Marketing/Campaigns/types.ts`

**Content**:

```typescript
export interface CampaignTypeConfig {
    type: 'EMAIL' | 'SMS';
    baseRoute: string;
    translationKeys: {
        title: string;
        description: string;
        createCampaign: string;
        createdCampaigns: string;
        // ... all translation keys
    };
}

export const EMAIL_CAMPAIGN_CONFIG: CampaignTypeConfig = { ... };
export const SMS_CAMPAIGN_CONFIG: CampaignTypeConfig = { ... };
```

## Migration Plan

### Phase 1: Create Shared Components

1. Create `Campaigns/` folder structure
2. Move `CampaignForm/` from `EmailCampaigns/` to `Campaigns/`
3. Create shared `CampaignsList.tsx` (accepts props)
4. Create shared `CampaignStats.tsx` (accepts props)
5. Create `types.ts` with configuration

### Phase 2: Update Email Campaigns

1. Update `EmailCampaigns.index.tsx` to use shared components
2. Create `EmailCampaignWizard.tsx` wrapper
3. Update imports

### Phase 3: Update SMS Campaigns

1. Update `SMSCampaigns.index.tsx` to use shared components
2. Update `SMSCampaignWizard.tsx` to use shared CampaignWizard
3. Update imports

### Phase 4: Cleanup

1. Remove duplicate `EmailCampaignsList.tsx`
2. Remove duplicate `SMSCampaignsList.tsx`
3. Remove duplicate `EmailCampaignStats.tsx`
4. Remove duplicate `SMSCampaignStats.tsx`
5. Update router imports if needed

## Benefits

1. **DRY Principle**: Single source of truth for shared logic
2. **Maintainability**: Changes in one place affect both campaign types
3. **Consistency**: Ensures both types behave identically
4. **Scalability**: Easy to add new campaign types (e.g., PUSH, WHATSAPP)
5. **Type Safety**: Centralized types and configurations
6. **Testing**: Test shared components once, reuse everywhere

## Example Usage

### EmailCampaigns.index.tsx

```typescript
import CampaignsList from '../Campaigns/CampaignsList';
import CampaignStats from '../Campaigns/CampaignStats';
import { EMAIL_CAMPAIGN_CONFIG } from '../Campaigns/types';

export default function EmailCampaigns() {
    // ... fetch campaigns

    return (
        <>
            <CampaignStats
                campaigns={campaigns}
                isLoading={isLoading}
                translationKeys={EMAIL_CAMPAIGN_CONFIG.translationKeys}
            />
            <CampaignsList
                campaigns={campaigns}
                isLoading={isLoading}
                campaignType="EMAIL"
                baseRoute="/marketing/email-campaigns"
                translationKeys={EMAIL_CAMPAIGN_CONFIG.translationKeys}
            />
        </>
    );
}
```

## Considerations

1. **Translation Keys**: Need to ensure all translation keys are properly passed
2. **Route Handling**: baseRoute prop ensures correct navigation
3. **Type Safety**: TypeScript will catch missing props
4. **Backward Compatibility**: Existing routes remain unchanged
5. **Testing**: Shared components need comprehensive tests

## Approval Checklist

- [ ] Architecture structure approved
- [ ] Component props design approved
- [ ] Migration plan approved
- [ ] Translation key strategy approved
- [ ] Ready to implement
