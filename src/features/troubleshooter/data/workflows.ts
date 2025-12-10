/**
 * Troubleshooting workflow data based on LifePass documentation
 * Contains step-by-step processes for resolving common issues
 */

import { type TroubleshootingWorkflow } from "../types"

export const troubleshootingWorkflows: TroubleshootingWorkflow[] = [
  {
    id: "BOOKING-1",
    title: "Excessive Number of Devices",
    description: "Customer received more devices than they ordered, due to user error or system error.",
    category: "booking",
    priority: 5,
    commonality: "low",
    estimatedTime: "5 min",
    icon: "ShoppingCart",
    color: "bg-blue-500",
    startStepId: "ask-devices-wanted",
    steps: {
      "ask-devices-wanted": {
        id: "ask-devices-wanted",
        type: "action",
        title: "Ask how many LPs they wanted to order",
        actions: ["Ask the user how many LPs they wanted to order and how many they received."],
        nextStepId: "verify-devices-in-portal",
      },
      "verify-devices-in-portal": {
        id: "verify-devices-in-portal",
        type: "decision",
        title: "Verify Devices in Booking Portal",
        description: "Verify in the booking portal the number of LifePasses that should have been included in this order. Did the user receive more devices than needed?",
        options: [
          {
            id: "more-devices-received",
            label: "Yes, received more than ordered",
            nextStepId: "was-extra-pass-used",
          },
          {
            id: "correct-devices-received",
            label: "No, the number of devices is correct",
            nextStepId: "happy-skiing",
          },
        ],
      },
      "was-extra-pass-used": {
        id: "was-extra-pass-used",
        type: "decision",
        title: "Check Extra Pass Usage",
        description: "Was the extra ski pass used?",
        options: [
          {
            id: "extra-pass-used",
            label: "Yes, extra pass has been used",
            nextStepId: "inform-no-refund",
          },
          {
            id: "extra-pass-not-used",
            label: "No, extra pass is unused",
            nextStepId: "check-error-type",
          },
        ],
      },
      "inform-no-refund": {
        id: "inform-no-refund",
        type: "outcome",
        title: "No Refund Possible",
        content: "Inform the customer that a refund is not possible for passes that have been used.",
        resolutionType: "resolved",
      },
      "check-error-type": {
        id: "check-error-type",
        type: "decision",
        title: "Determine Error Source",
        description: "User error - ordered more LPs than needed - or system error - e.g., user ordered 4 and the kiosk gave 5?",
        options: [
          {
            id: "user-error",
            label: "User Error",
            nextStepId: "user-error-refund",
          },
          {
            id: "system-error",
            label: "System Error",
            nextStepId: "system-error-process",
          },
        ],
      },
      "user-error-refund": {
        id: "user-error-refund",
        type: "outcome",
        title: "Escalate for User Error Refund",
        content: "Let customer know that if a payment has been taken, it will be refunded on the day. Contact Line 2: Martin: issue a refund to the customer and cancel the extra ski pass with Ivana",
        resolutionType: "escalated",
        followUpActions: ["Contact Line 2 (Martin) to process refund.", "Provide order details for cancellation with Ivana."],
      },
      "system-error-process": {
        id: "system-error-process",
        type: "action",
        title: "Process System Error",
        actions: [
          "Check the order in the system: determine which LifePass is extra.",
          "Double Check it in TD9 POS that it is empty and set aside: label it with date and order.",
          "Inform Joe that kiosk n° xxx gave more LPs than ordered for investigation.",
        ],
        nextStepId: "happy-skiing",
      },
      "happy-skiing": {
        id: "happy-skiing",
        type: "outcome",
        title: "Happy Skiing!",
        content: "Issue resolved.",
        resolutionType: "resolved",
      },
    },
  },

  {
    id: "PAY-1",
    title: "Payment Processed but No LifePasses Dispensed",
    description: "Customer's payment was processed, but the kiosk did not dispense any LifePasses for the order.",
    category: "payment",
    priority: 1,
    commonality: "high",
    estimatedTime: "5 min",
    icon: "CreditCard",
    color: "bg-red-500",
    startStepId: "check-stripe-payment",
    steps: {
      "check-stripe-payment": {
        id: "check-stripe-payment",
        type: "decision",
        title: "Check Stripe for Payment",
        description: "Check Stripe: Payment Taken?",
        options: [
          { id: "payment-yes", label: "Yes, payment is on Stripe", nextStepId: "verify-kiosk-backend" },
          { id: "payment-no", label: "No, no payment on Stripe", nextStepId: "reason-for-no-payment" },
        ],
      },
      "reason-for-no-payment": {
        id: "reason-for-no-payment",
        type: "decision",
        title: "Determine Reason for No Payment",
        description: "What is the likely reason for the payment failure?",
        options: [
          { id: "card-issue", label: "Card not working / Insufficient funds", nextStepId: "try-new-order-different-card" },
          { id: "terminal-issue", label: "Terminal issue / Nothing on Stripe", nextStepId: "is-terminal-online" },
        ],
      },
      "try-new-order-different-card": {
        id: "try-new-order-different-card",
        type: "outcome",
        title: "Try New Order",
        content: "Try new order in same terminal with a different card.",
        resolutionType: "resolved",
      },
      "is-terminal-online": {
        id: "is-terminal-online",
        type: "decision",
        title: "Check Terminal Connectivity",
        description: "Is the terminal online and responsive?",
        options: [
          { id: "terminal-yes", label: "Yes, terminal is online", nextStepId: "try-again-same-terminal" },
          { id: "terminal-no", label: "No, terminal is offline", nextStepId: "do-order-different-terminal" },
        ],
      },
      "try-again-same-terminal": {
        id: "try-again-same-terminal",
        type: "outcome",
        title: "Retry on Same Terminal",
        content: "Try again on the same terminal.",
        resolutionType: "resolved",
      },
      "do-order-different-terminal": {
        id: "do-order-different-terminal",
        type: "action",
        title: "Use Different Terminal",
        actions: ["Do the order in a different terminal."],
        nextStepId: "inform-joe-offline"
      },
      "inform-joe-offline": {
          id: "inform-joe-offline",
          type: "outcome",
          title: "Inform Joe",
          content: "Inform Joe to investigate why the kiosk is offline.",
          resolutionType: "escalated",
          followUpActions: ["Inform Joe to investigate why the kiosk is offline."]
      },
      "verify-kiosk-backend": {
        id: "verify-kiosk-backend",
        type: "action",
        title: "Verify Kiosk Backend",
        actions: ["Verify the kiosk backend system and check the order status."],
        nextStepId: "are-devices-blocked",
      },
      "are-devices-blocked": {
        id: "are-devices-blocked",
        type: "decision",
        title: "Check for Blocked Devices",
        description: "Are the devices for this order showing as blocked in the backend?",
        options: [
          { id: "devices-blocked", label: "Yes, devices are blocked", nextStepId: "inform-joe-blocked" },
          { id: "devices-not-blocked", label: "No, devices are not blocked (likely connectivity)", nextStepId: "connectivity-problem" },
        ],
      },
      "inform-joe-blocked": {
        id: "inform-joe-blocked",
        type: "action",
        title: "Report Blocked Devices",
        actions: ["Inform Joe to investigate why the devices for this order were blocked."],
        nextStepId: "create-new-order-bypass",
      },
      "connectivity-problem": {
        id: "connectivity-problem",
        type: "action",
        title: "Report Connectivity Problem",
        actions: ["Inform Joe to investigate the connectivity problem that prevented device dispensing."],
        nextStepId: "create-new-order-bypass",
      },
      "create-new-order-bypass": {
        id: "create-new-order-bypass",
        type: "outcome",
        title: "Bypass Payment and Create New Order",
        content: "Create a new order for the customer using the 'bypass payment' feature. Ensure the amount matches the original payment.",
        resolutionType: "escalated",
        followUpActions: ["Create a new order with bypass payment.", "Ensure order amount matches original Stripe payment."],
      },
    },
  },
  {
    id: "PAY-2",
    title: "Payment Processed Twice",
    description: "Customer was charged twice for a single order.",
    category: "payment",
    priority: 5,
    commonality: "low",
    estimatedTime: "2 min",
    icon: "CreditCard",
    color: "bg-red-500",
    startStepId: "check-systems",
    steps: {
      "check-systems": {
        id: "check-systems",
        type: "action",
        title: "Check Ticketing System & Stripe",
        actions: ["Check ticketing system & Stripe (compare card last4, amount, time)"],
        nextStepId: "one-order-two-payments",
      },
      "one-order-two-payments": {
        id: "one-order-two-payments",
        type: "decision",
        title: "One Order, Two Payments?",
        description: "Were 2 payments created but only 1 order?",
        options: [
          { id: "yes-duplicate", label: "Yes, it's a duplicate charge", nextStepId: "inform-line2" },
          { id: "no-duplicate", label: "No, only one charge found", nextStepId: "claimed-double-charge" },
        ],
      },
      "inform-line2": {
          id: "inform-line2",
          type: "action",
          title: "Inform Line 2",
          actions: ["Inform Line 2 - Martin: Cancel second payment in Stripe", "Inform Line 2 - Joe: Problem with Stripe / Kiosk / Online"],
          nextStepId: "happy-skiing"
      },
      "claimed-double-charge": {
        id: "claimed-double-charge",
        type: "outcome",
        title: "Inform User of Single Charge",
        content: "User claimed double charge but only 1 payment exists. Inform user that only one payment was processed.",
        resolutionType: "resolved",
      },
      "happy-skiing": {
        id: "happy-skiing",
        type: "outcome",
        title: "Happy Skiing!",
        content: "Issue resolved.",
        resolutionType: "resolved",
      },
    },
  },
  {
    id: "KIOSK-1",
    title: "Not All LifePasses Dispensed",
    description: "Payment processed, but not all LifePasses from the order were dispensed from the kiosk.",
    category: "device-pickup",
    priority: 1,
    commonality: "high",
    estimatedTime: "5 min",
    icon: "Monitor",
    color: "bg-orange-500",
    startStepId: "check-order-details",
    steps: {
      "check-order-details": {
        id: "check-order-details",
        type: "action",
        title: "Check Order Details",
        actions: ["Check order number, check order for total devices ordered and check lifepasses n° that should have been dispensed"],
        nextStepId: "all-lps-received",
      },
      "all-lps-received": {
        id: "all-lps-received",
        type: "decision",
        title: "All Passes Received?",
        description: "Did user receive all expected LifePasses?",
        options: [
          { id: "no-not-all", label: "No, some or all are missing", nextStepId: "check-payment-stripe" },
          { id: "yes-all-received", label: "Yes, they have all the passes", nextStepId: "check-ids-match" },
        ],
      },
      "check-payment-stripe": {
        id: "check-payment-stripe",
        type: "action",
        title: "Check Payment on Stripe",
        actions: ["Check payment on Stripe - Ask the client the 4 last digits"],
        nextStepId: "payment-found",
      },
      "payment-found": {
        id: "payment-found",
        type: "decision",
        title: "Payment Found?",
        description: "Was a successful payment found on Stripe for this order?",
        options: [
          { id: "payment-yes", label: "Yes, payment confirmed", nextStepId: "escalate-bypass" },
          { id: "payment-no", label: "No, no payment record", nextStepId: "inform-booking-incomplete" },
        ],
      },
      "escalate-bypass": {
        id: "escalate-bypass",
        type: "outcome",
        title: "Escalate for Bypass Payment",
        content: "Escalate to 2nd line: bypass payment & issue new LifePass - New order - The amount and the new order and the original order of payment must match",
        resolutionType: "escalated",
        followUpActions: ["Contact 2nd line for bypass payment.", "Ensure new order amount matches original."],
      },
      "inform-booking-incomplete": {
        id: "inform-booking-incomplete",
        type: "outcome",
        title: "Booking Not Completed",
        content: "Inform client: booking not completed. New booking can be made, in the same kiosk or in a new one.",
        resolutionType: "resolved",
      },
      "check-ids-match": {
        id: "check-ids-match",
        type: "action",
        title: "Verify Device IDs and Payment",
        actions: ["Check that the LifePass IDs the customer has match the order details."],
        nextStepId: "check-payment-stripe-again",
      },
      "check-payment-stripe-again": {
          id: "check-payment-stripe-again",
          type: "action",
          title: "Verify Payment",
          actions: ["Check payment on Stripe - Ask the client the 4 last digits, it was successful?"],
          nextStepId: "happy-skiing"
      },
      "happy-skiing": {
        id: "happy-skiing",
        type: "outcome",
        title: "Happy Skiing!",
        content: "Issue resolved.",
        resolutionType: "resolved",
      },
    },
  },
  {
    id: "SMS-1",
    title: "SMS/OTP Not Received",
    description: "Customer is not receiving the SMS for OTP verification.",
    category: "sms-verification",
    priority: 3,
    commonality: "high",
    estimatedTime: "5 min",
    icon: "MessageSquare",
    color: "bg-green-500",
    startStepId: "check-signal",
    steps: {
      "check-signal": {
        id: "check-signal",
        type: "decision",
        title: "Check Phone Signal",
        description: "Signal OK?",
        options: [
          { id: "signal-yes", label: "Yes, signal is OK", nextStepId: "check-roaming" },
          { id: "signal-no", label: "No, signal is poor or absent", nextStepId: "restart-phone" },
        ],
      },
      "restart-phone": {
        id: "restart-phone",
        type: "action",
        title: "Restart Phone & Resend SMS",
        actions: ["Restart phone & resend SMS through kiosk. Wait until phone has connectivity"],
        nextStepId: "sms-arrived-after-restart",
      },
      "sms-arrived-after-restart": {
        id: "sms-arrived-after-restart",
        type: "decision",
        title: "SMS Arrived?",
        description: "Did the SMS arrive after restarting and resending?",
        options: [
          { id: "sms-yes", label: "Yes, SMS received", nextStepId: "happy-skiing" },
          { id: "sms-no", label: "No, still no SMS", nextStepId: "advise-regular-pass" },
        ],
      },
      "advise-regular-pass": {
        id: "advise-regular-pass",
        type: "action",
        title: "Advise Alternative",
        actions: ["If the client is in a rush, apologize and advise them to purchase a regular ski pass."],
        nextStepId: "escalate-to-slack",
      },
      "escalate-to-slack": {
        id: "escalate-to-slack",
        type: "outcome",
        title: "Escalate to Technical Team",
        content: "Escalate to Slack. Line 2: Jordan. Inform him to try to solve it ASAP. Is it an isolated case or is it going to happen again?",
        resolutionType: "escalated",
        followUpActions: ["Contact Jordan on Slack with user's phone number and issue details."],
      },
      "check-roaming": {
        id: "check-roaming",
        type: "decision",
        title: "Check Roaming Settings",
        description: "Roaming & receiving ON? Roaming shouldn’t be necessary for receiving an SMS, but it is required for logging into the app",
        options: [
          { id: "roaming-yes", label: "Yes, settings are correct", nextStepId: "check-phone-number" },
          { id: "roaming-no", label: "No, settings need to be enabled", nextStepId: "enable-settings" },
        ],
      },
      "enable-settings": {
        id: "enable-settings",
        type: "action",
        title: "Enable Phone Settings",
        actions: ["Guide the customer to enable the necessary settings on their phone."],
        nextStepId: "check-signal",
      },
      "check-phone-number": {
        id: "check-phone-number",
        type: "decision",
        title: "Verify Phone Number",
        description: "Is the phone number entered in the system, including country code, correct?",
        options: [
          { id: "number-yes", label: "Yes, phone number is correct", nextStepId: "resend-sms" },
          { id: "number-no", label: "No, phone number is incorrect", nextStepId: "correct-number" },
        ],
      },
      "correct-number": {
        id: "correct-number",
        type: "action",
        title: "Correct Number and Resend",
        actions: ["Correct the phone number in the system and resend the SMS."],
        nextStepId: "sms-arrived-after-resend",
      },
      "resend-sms": {
        id: "resend-sms",
        type: "action",
        title: "Resend SMS",
        actions: ["Resend the SMS to the confirmed correct number."],
        nextStepId: "sms-arrived-after-resend",
      },
      "sms-arrived-after-resend": {
        id: "sms-arrived-after-resend",
        type: "decision",
        title: "SMS Arrived?",
        description: "Did the SMS arrive now?",
        options: [
          { id: "sms-yes", label: "Yes, SMS received", nextStepId: "happy-skiing" },
          { id: "sms-no", label: "No, still no SMS", nextStepId: "advise-regular-pass" },
        ],
      },
      "happy-skiing": {
        id: "happy-skiing",
        type: "outcome",
        title: "Happy Skiing!",
        content: "SMS issue resolved.",
        resolutionType: "resolved",
      },
    }
  },

  {
    id: "GATE-1",
    title: "LifePass Not Working at Gate",
    description: "Customer's LifePass is not being accepted at ski area gates",
    category: "gate-access",
    priority: 1,
    commonality: "high",
    estimatedTime: "10 min",
    icon: "DoorOpen",
    color: "bg-purple-500",
    startStepId: "separate-and-retry",
    steps: {
      "separate-and-retry": {
        id: "separate-and-retry",
        type: "action",
        title: "Isolate and Retry",
        actions: ["Separate the device from other ski passes, place the Lifepass directly against the RFID reader and try using it at a different gate."],
        nextStepId: "did-it-work",
      },
      "did-it-work": {
        id: "did-it-work",
        type: "decision",
        title: "Did it work?",
        description: "Did guest manage to pass through the gate?",
        options: [
          { id: "yes-worked", label: "Yes, it worked", nextStepId: "happy-skiing" },
          { id: "no-did-not-work", label: "No, it still failed", nextStepId: "check-ids-and-payment" },
        ],
      },
      "check-ids-and-payment": {
        id: "check-ids-and-payment",
        type: "action",
        title: "Verify Order Details",
        actions: ["Check that LifePass IDs & order matches - Phisically and in the backend. Check on Stripe that payment went through."],
        nextStepId: "check-ids-payment-result",
      },
      "check-ids-payment-result": {
        id: "check-ids-payment-result",
        type: "decision",
        title: "Verification Result",
        description: "What was the result of the order verification?",
        options: [
          { id: "match", label: "IDs and payment match", nextStepId: "is-order-for-today" },
          { id: "mismatch", label: "IDs do not match order", nextStepId: "wrong-lp-id" },
          { id: "no-payment", label: "No payment registered", nextStepId: "no-payment-registered" },
        ],
      },
      "is-order-for-today": {
        id: "is-order-for-today",
        type: "decision",
        title: "Check Booking Date",
        description: "Is the order booked for today?",
        options: [
          { id: "yes-today", label: "Yes, booked for today", nextStepId: "issue-new-lifepass" },
          { id: "no-wrong-date", label: "No, booked for a different date", nextStepId: "inform-wrong-date" },
        ],
      },
      "inform-wrong-date": {
        id: "inform-wrong-date",
        type: "outcome",
        title: "Wrong Booking Date",
        content: "Inform guest: wrong date. Adjust ski pass days if possible. Swap + Line2: bypass payment. Keep the old ones label with date and order",
        resolutionType: "resolved",
      },
      "issue-new-lifepass": {
        id: "issue-new-lifepass",
        type: "action",
        title: "Issue New LifePass",
        actions: ["Issue new LifePass and verify at gate - Swap + bypass payment. Keep the old ones label with date and order"],
        nextStepId: "working-now",
      },
      "working-now": {
        id: "working-now",
        type: "decision",
        title: "Working Now?",
        description: "Is the new LifePass working?",
        options: [
          { id: "yes-working", label: "Yes, it works", nextStepId: "happy-skiing" },
          { id: "no-not-working", label: "No, still not working", nextStepId: "skidata-issue" },
        ],
      },
      "skidata-issue": {
        id: "skidata-issue",
        type: "action",
        title: "System Issue Detected",
        actions: ["Something internally it's not working. SkiData ticketing not working. Inform the client that our system is currently experiencing technical issues. They should purchase a regular ski pass, and they will be refunded for the Lifepass purchase."],
        nextStepId: "escalate-refund",
      },
      "escalate-refund": {
        id: "escalate-refund",
        type: "outcome",
        title: "Escalate for Full Refund and System Check",
        content: "Line 2: Martin: Refund & Cancel old order x2 with Ivana - Reason: Technical Issues. Line 2: Joe/Jordan: Check the system. Major technical problem – Tell them that we shouldn't sell any more until the problem is fixed.",
        resolutionType: "escalated",
        followUpActions: ["Martin to process refund and cancel with Ivana.", "Joe/Jordan to investigate critical system failure."],
      },
      "wrong-lp-id": {
        id: "wrong-lp-id",
        type: "outcome",
        title: "Incorrect LifePass ID",
        content: "The kiosk released a wrong LP ID. The LP it's empty and it should be an extra LP on the kiosk. Check Process KIOSK-1",
        resolutionType: "escalated",
      },
      "no-payment-registered": {
        id: "no-payment-registered",
        type: "outcome",
        title: "No Payment Found",
        content: "Guest has a LP but no payment. Likely found or took a LP, it is inactive and cannot be used. Inform Line 2: This person took a LP from somewhere and it will not work. Recover the LP.",
        resolutionType: "resolved",
        followUpActions: ["Inform Line 2 about the situation.", "Recover the unpaid LifePass from the guest."],
      },
      "happy-skiing": {
        id: "happy-skiing",
        type: "outcome",
        title: "Happy Skiing!",
        content: "Gate access issue resolved.",
        resolutionType: "resolved",
      },
    },
  },

  {
    id: "LOCATION-1",
    title: "Location Not Updating",
    description: "LifePass device location tracking is not working properly",
    category: "location",
    priority: 3,
    commonality: "medium",
    estimatedTime: "5 min",
    icon: "MapPin",
    color: "bg-indigo-500",
    startStepId: "check-user-phone-signal",
    steps: {
        "check-user-phone-signal": {
            id: "check-user-phone-signal",
            type: "decision",
            title: "Check User's Phone Signal",
            description: "Check if USER phone has signal. Signal available?",
            options: [
                {id: "signal-yes", label: "Yes, signal is available", nextStepId: "check-building-location"},
                {id: "signal-no", label: "No, no signal", nextStepId: "explain-no-signal"}
            ]
        },
        "explain-no-signal": {
            id: "explain-no-signal",
            type: "outcome",
            title: "No Signal Explanation",
            content: "Explain to guest: location not updating due to no signal on user phone.",
            resolutionType: "resolved"
        },
        "check-building-location": {
            id: "check-building-location",
            type: "action",
            title: "Check Environment",
            actions: ["Ask client to move away or out of the building they might be close to and if they are resort bounderies"],
            nextStepId: "still-no-update"
        },
        "still-no-update": {
            id: "still-no-update",
            type: "decision",
            title: "Still No Update?",
            description: "Is the location still not updating after moving?",
            options: [
                {id: "no-its-updating", label: "No, it's updating now", nextStepId: "happy-skiing"},
                {id: "yes-still-no-update", label: "Yes, still no update", nextStepId: "check-lifepass-battery"}
            ]
        },
        "check-lifepass-battery": {
            id: "check-lifepass-battery",
            type: "decision",
            title: "Check LifePass Battery",
            description: "Is the LifePass battery empty?",
            options: [
                {id: "battery-yes", label: "Yes, battery is empty", nextStepId: "swap-procedure"},
                {id: "battery-no", label: "No, battery is full", nextStepId: "wait-for-update"}
            ]
        },
        "swap-procedure": {
            id: "swap-procedure",
            type: "action",
            title: "SWAP Procedure",
            actions: ["Follow SWAP procedure: Swap LP without creating new order -enter old LifePass ID. Go to TD 1-8 and swap ski card info"],
            nextStepId: "hand-new-pass"
        },
        "hand-new-pass": {
            id: "hand-new-pass",
            type: "outcome",
            title: "Swap Complete",
            content: "Hand the new pass to customer and put to charge the old LP",
            resolutionType: "resolved"
        },
        "wait-for-update": {
            id: "wait-for-update",
            type: "action",
            title: "Wait for Update",
            actions: ["Wait 5 minutes for the location to update."],
            nextStepId: "location-accurate"
        },
        "location-accurate": {
            id: "location-accurate",
            type: "decision",
            title: "Location Accurate?",
            description: "Is the location accurate now?",
            options: [
                {id: "accurate-yes", label: "Yes, location is accurate", nextStepId: "happy-skiing"},
                {id: "accurate-no", label: "No, location is still inaccurate", nextStepId: "report-to-senior"}
            ]
        },
        "report-to-senior": {
            id: "report-to-senior",
            type: "outcome",
            title: "Report to Senior",
            content: "Report to senior colleague: Line 2: Mark",
            resolutionType: "escalated",
            followUpActions: ["Report issue to Mark with device ID and user details."]
        },
        "happy-skiing": {
            id: "happy-skiing",
            type: "outcome",
            title: "Happy Skiing!",
            content: "Location tracking issue resolved.",
            resolutionType: "resolved"
        }
    }
  },
  {
    id: "REFUND-1",
    title: "Client Requests Refund",
    description: "Customer is requesting a refund for their order.",
    category: "refund",
    priority: 1,
    commonality: "medium",
    estimatedTime: "10 min",
    icon: "CreditCard",
    color: "bg-yellow-500",
    startStepId: "find-reason",
    steps: {
        "find-reason": {
            id: "find-reason",
            type: "action",
            title: "Find out Reason for Refund",
            actions: ["Ask the customer for the reason they are requesting a refund."],
            nextStepId: "gate-used"
        },
        "gate-used": {
            id: "gate-used",
            type: "decision",
            title: "Has Gate Been Used?",
            description: "Has the ski pass been used at any gate?",
            options: [
                { id: "gate-yes", label: "Yes, gate has been used", nextStepId: "lifepass-issue" },
                { id: "gate-no", label: "No, gate not used", nextStepId: "escalate-line2" }
            ]
        },
        "escalate-line2": {
            id: "escalate-line2",
            type: "outcome",
            title: "Escalate to Line 2",
            content: "Escalate to Line 2: Inform Martin of the circumstances and define refund. Reason for refund - Ivana: Technical Issue",
            resolutionType: "escalated",
            followUpActions: ["Inform Martin to process the refund."]
        },
        "lifepass-issue": {
            id: "lifepass-issue",
            type: "decision",
            title: "Is Refund due to a LifePass Issue?",
            description: "Is the reason for the refund related to a LifePass malfunction or system error?",
            options: [
                { id: "issue-yes", label: "Yes, due to LifePass issue", nextStepId: "lifepass-pays" },
                { id: "issue-no", label: "No, not due to LifePass issue", nextStepId: "no-refund" }
            ]
        },
        "lifepass-pays": {
            id: "lifepass-pays",
            type: "outcome",
            title: "Escalate for Refund (LifePass Fault)",
            content: "Line 2: Martin: Refund. LifePass needs to pay for the used ski passes",
            resolutionType: "escalated",
            followUpActions: ["Inform Martin to process a full refund as it was a system fault."]
        },
        "no-refund": {
            id: "no-refund",
            type: "outcome",
            title: "No Refund Possible",
            content: "Inform client: No refunds are possible when the SkiPass has been used",
            resolutionType: "resolved"
        }
    }
  },
  {
    id: "BOOKING-2",
    title: "'Tomorrow' Booking Mistake",
    description: "Customer booked for the next day by mistake and wants to ski today.",
    category: "booking",
    priority: 3,
    commonality: "medium",
    estimatedTime: "10 min",
    icon: "ShoppingCart",
    color: "bg-blue-500",
    startStepId: "follow-protocol",
    steps: {
      "follow-protocol": {
        id: "follow-protocol",
        type: "action",
        title: "Follow La Thuile Protocol",
        description: "Follow La Thuile protocol: help when possible, but draw limits",
        actions: [
          "Physically keep the LifePasses from that order",
          "Create a new order with all of the same information",
        ],
        nextStepId: "escalate-for-transfer"
      },
      "escalate-for-transfer": {
        id: "escalate-for-transfer",
        type: "outcome",
        title: "Escalate for Payment Transfer and Cancellation",
        content: "Transfer the payment of the booking through Stripe. Declare cancellation with Ivana.",
        resolutionType: "escalated",
        followUpActions: ["Contact Line 2 to transfer Stripe payment to new order.", "Contact Line 2 to handle cancellation with Ivana."]
      }
    }
  },
  {
    id: "EARLY-RETURN",
    title: "Accidental Early Return",
    description: "Customer returned LP immediately without using it, or a few days after use, leaving them without a ski pass.",
    category: "device-pickup",
    priority: 3,
    commonality: "low",
    estimatedTime: "10 min",
    icon: "Monitor",
    color: "bg-orange-500",
    startStepId: "check-return-registered",
    steps: {
        "check-return-registered": {
            id: "check-return-registered",
            type: "decision",
            title: "Is Return Registered in System?",
            description: "Check the system to see if the device return was officially registered.",
            options: [
                {id: "return-no", label: "No, not registered", nextStepId: "where-was-it-returned-not-reg"},
                {id: "return-yes", label: "Yes, it was registered", nextStepId: "where-was-it-returned-reg"}
            ]
        },
        "where-was-it-returned-not-reg": {
            id: "where-was-it-returned-not-reg",
            type: "decision",
            title: "Where Was It Returned?",
            description: "Where did the customer return the LifePass?",
            options: [
                {id: "bin-not-reg", label: "Return Bin", nextStepId: "recover-from-bin-not-reg"},
                {id: "kiosk-not-reg", label: "Kiosk", nextStepId: "recover-from-kiosk-not-reg"}
            ]
        },
        "recover-from-bin-not-reg": {
            id: "recover-from-bin-not-reg",
            type: "outcome",
            title: "Recover and Return to Customer",
            content: "First ask the client to see the app and check the LP ID and then open the return bin and return the LP to the customer",
            resolutionType: "resolved"
        },
        "recover-from-kiosk-not-reg": {
            id: "recover-from-kiosk-not-reg",
            type: "outcome",
            title: "Eject from Kiosk",
            content: "First ask the client to see the app and check the LP ID and then access Ticketing system, find the LP ID in the kiosk, and eject it",
            resolutionType: "resolved"
        },
        "where-was-it-returned-reg": {
            id: "where-was-it-returned-reg",
            type: "decision",
            title: "Where Was It Returned?",
            description: "Where did the customer return the LifePass?",
            options: [
                {id: "bin-reg", label: "Return Bin", nextStepId: "recover-from-bin-reg"},
                {id: "kiosk-reg", label: "Kiosk", nextStepId: "recover-from-kiosk-reg"}
            ]
        },
        "recover-from-bin-reg": {
            id: "recover-from-bin-reg",
            type: "action",
            title: "Recover from Bin",
            actions: ["Open the return bin and retrieve the LP."],
            nextStepId: "add-lp-to-group"
        },
        "recover-from-kiosk-reg": {
            id: "recover-from-kiosk-reg",
            type: "action",
            title: "Recover from Kiosk",
            actions: ["Access Ticketing system, find the LP ID in the kiosk, and eject it."],
            nextStepId: "add-lp-to-group"
        },
        "add-lp-to-group": {
            id: "add-lp-to-group",
            type: "action",
            title: "Re-add LP to Group",
            actions: ["Ask the group leader to manually add the LP ID to the group"],
            nextStepId: "return-to-customer"
        },
        "return-to-customer": {
            id: "return-to-customer",
            type: "outcome",
            title: "Return to Customer",
            content: "Return the LifePass to the customer. They can now continue using it.",
            resolutionType: "resolved"
        }
    }
  },
  {
    id: "BOOKING-3",
    title: "Add LifePass to Existing Order",
    description: "Customer wants to add another LifePass to an order that has already been completed.",
    category: "booking",
    priority: 4,
    commonality: "medium",
    estimatedTime: "2 min",
    icon: "ShoppingCart",
    color: "bg-blue-500",
    startStepId: "tba",
    steps: {
      "tba": {
        id: "tba",
        type: "outcome",
        title: "To Be Announced",
        content: "The functionality to add a LifePass to an existing order is not yet available. For now, the user will have to create a new, separate order.",
        resolutionType: "resolved"
      }
    }
  }
]
