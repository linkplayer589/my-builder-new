# Troubleshooter Feature Documentation

## Overview

The troubleshooter feature provides guided step-by-step workflows to help customer service staff resolve common LifePass issues. It includes workflows for booking, payment, device pickup, SMS verification, gate access, location tracking, refunds, and more.

## Implementation Status

### ✅ Completed Tasks

All workflows have been successfully implemented:

- [x] Update `BOOKING-1` workflow in `workflows.ts` - Excessive Number of Devices
- [x] Update `PAY-1` workflow in `workflows.ts` - Payment Processed but No LifePasses Dispensed
- [x] Add `PAY-2` workflow to `workflows.ts` - Payment Processed Twice
- [x] Update `KIOSK-1` workflow in `workflows.ts` - Not All LifePasses Dispensed
- [x] Update `SMS-1` workflow in `workflows.ts` - SMS/OTP Not Received
- [x] Update `GATE-1` workflow in `workflows.ts` - LifePass Not Working at Gate
- [x] Update `LOCATION-1` workflow in `workflows.ts` - Location Not Updating
- [x] Add `REFUND-1` workflow to `workflows.ts` - Client Requests Refund
- [x] Add `EARLYRETURN` workflow to `workflows.ts` - Accidental Early Return
- [x] Add `BOOKING-2` workflow to `workflows.ts` - 'Tomorrow' Booking Mistake
- [x] Add `BOOKING-3` workflow to `workflows.ts` - Add LifePass to Existing Order (TBA)

## Features

### Main Components

- **TroubleshooterMain** (`troubleshooter-main.tsx`) - Main interface for workflow selection
- **TroubleshootingWorkflowComponent** (`workflow-component.tsx`) - Step-by-step workflow execution
- **workflows.ts** - All troubleshooting workflow data

### Workflow Categories

1. **Booking** (3 workflows)
   - BOOKING-1: Excessive Number of Devices (Priority 5, Low commonality)
   - BOOKING-2: 'Tomorrow' Booking Mistake (Priority 3, Medium commonality)
   - BOOKING-3: Add LifePass to Existing Order (Priority 4, Medium commonality, TBA)

2. **Payment** (2 workflows)
   - PAY-1: Payment Processed but No LifePasses Dispensed (Priority 1, High commonality)
   - PAY-2: Payment Processed Twice (Priority 5, Low commonality)

3. **Device Pickup** (2 workflows)
   - KIOSK-1: Not All LifePasses Dispensed (Priority 1, High commonality)
   - EARLY-RETURN: Accidental Early Return (Priority 3, Low commonality)

4. **SMS/Verification** (1 workflow)
   - SMS-1: SMS/OTP Not Received (Priority 3, High commonality)

5. **Gate Access** (1 workflow)
   - GATE-1: LifePass Not Working at Gate (Priority 1, High commonality)

6. **Location** (1 workflow)
   - LOCATION-1: Location Not Updating (Priority 3, Medium commonality)

7. **Refund** (1 workflow)
   - REFUND-1: Client Requests Refund (Priority 1, Medium commonality)

## Workflow Structure

Each workflow consists of:

- **Metadata**: ID, title, description, category, priority, commonality, estimated time, icon, color
- **Steps**: Decision points, action items, and outcome resolutions
- **Navigation**: Step-by-step guidance with back navigation support

### Step Types

1. **Decision Steps**: Present options for the user to choose from
2. **Action Steps**: List of actions to perform with optional completion tracking
3. **Outcome Steps**: Final resolution with optional follow-up actions

## Priority Levels

- **Priority 1**: Critical issues requiring immediate attention (PAY-1, KIOSK-1, GATE-1, REFUND-1)
- **Priority 3**: Medium priority issues (SMS-1, LOCATION-1, BOOKING-2, EARLY-RETURN)
- **Priority 4**: Lower priority issues (BOOKING-3)
- **Priority 5**: Rare issues, easily fixable (BOOKING-1, PAY-2)

## Commonality Levels

- **High**: Frequent issues (PAY-1, KIOSK-1, SMS-1, GATE-1)
- **Medium**: Moderately common (LOCATION-1, REFUND-1, BOOKING-2, BOOKING-3)
- **Low**: Rare occurrences (BOOKING-1, PAY-2, EARLY-RETURN)

## Usage

### For Staff

1. Open the troubleshooter interface
2. Select the issue that matches the customer's problem
3. Follow the step-by-step guidance
4. Complete actions and make decisions as prompted
5. Add session notes for future reference
6. Complete the workflow with resolution notes

### PostHog Logging

The feature logs all workflow interactions:

- `troubleshooting_workflow_started` - When a workflow begins
- `troubleshooting_step_navigation` - Navigation between steps
- `troubleshooting_decision_made` - User decision selections
- `troubleshooting_action_completed` - Action completion tracking
- `troubleshooting_workflow_completed` - Workflow completion
- `troubleshooting_session_abandoned` - User exits before completion

## Integration Points

- **Stripe**: Payment verification and refund processing
- **Kiosk System**: Device dispensing and status checks
- **TD9 POS**: SkiPass management and swapping
- **Line 2 Support**: Escalation to Martin, Joe, Jordan, Mark
- **Ivana**: Cancellation processing

## Escalation Protocol

### Line 2 Contacts

- **Martin**: Payment refunds, Stripe transfers, cancellations with Ivana
- **Joe**: Kiosk issues, technical problems, system investigations
- **Jordan**: SMS issues, technical support
- **Mark**: Location tracking issues

### Escalation Triggers

- System errors affecting multiple customers
- Payment issues requiring refunds
- Technical problems needing investigation
- Issues that cannot be resolved at first-line level

## File Structure

```
troubleshooter/
├── components/
│   ├── index.ts
│   ├── troubleshooter-main.tsx
│   └── workflow-component.tsx
├── data/
│   └── workflows.ts
├── types/
│   └── index.ts
├── index.ts
└── troubleshooter-docs.md
```

## Future Enhancements

- Add analytics dashboard for workflow usage statistics
- Implement workflow versioning for seasonal updates
- Add staff feedback mechanism for workflow improvements
- Create workflow builder for non-technical staff to create/edit flows
- Integrate with Freshdesk for automatic ticket creation
- Add multilingual support for international resorts

## Related Documentation

- LifePass Troubleshooting Notion Page: https://www.notion.so/LifePass-Troubleshooting-25a54cd270a380b4aa01e817b76efdf8
- Click and Collect Complete Guide: `docs/click-and-collect-complete-guide.md`
- Staff Training Plan (included in Notion documentation)

