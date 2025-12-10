# Orders Table Order Details Dropdown Documentation

## Overview

The `orders-table-order-details-dropdown` is a sub-feature within the orders table that provides an expandable, comprehensive view of all order information. Instead of using a modal dialog, it expands inline within the table row to display detailed information about:

- Order overview (status, dates, client info, pricing)
- Myth submission details with device actions (swap/return passes)
- Skidata submission details with cancel functionality (cancel order/ticket)
- Stripe payment information with invoices and payment intents
- Order sessions with log viewer (fetched internally by orderId)

This component consolidates all order-related dialogs into a single, unified interface that provides a better user experience by keeping the context within the table view.

## File Tree

```
orders-table-order-details-dropdown/
├── orders-table-order-details-dropdown-components/
│   ├── orders-table-order-details-dropdown.tsx
│   │   → Main component with expandable row and tab navigation
│   │   → Manages tab switching and session logs panel
│   │   → Fetches sessions internally using order.sessionIds
│   │   → Uses forceMount on tabs to pre-fetch data when dropdown opens
│   │
│   ├── orders-table-order-details-dropdown-overview.tsx
│   │   → Overview section showing order info, client details, items, pricing
│   │   → Displays high-level order information at a glance
│   │   → Uses resort context for product/category names
│   │
│   ├── orders-table-order-details-dropdown-device-card.tsx
│   │   → Device card for displaying device information
│   │   → Shows device status, allows returning and swapping passes
│   │   → Includes technical details and action buttons
│   │
│   ├── orders-table-order-details-dropdown-myth-section.tsx
│   │   → Myth order details matching orders-table-myth-dialog functionality
│   │   → Device actions with swap/return functionality
│   │   → Return all devices functionality
│   │   → QR code display for registration
│   │   → Real-time refresh capability
│   │
│   ├── orders-table-order-details-dropdown-skidata-section.tsx
│   │   → Skidata order details matching orders-table-skidata-dialog functionality
│   │   → Cancel order and cancel ticket buttons
│   │   → Device identifier display with serialMap lookup
│   │   → Multiple submission tabs for different Skidata orders
│   │   → Error handling with visible error messages
│   │
│   └── orders-table-order-details-dropdown-stripe-section.tsx
│       → Stripe payment information matching orders-table-stripe-dialog
│       → Invoice display with line items and status timeline
│       → Payment intent tabs for multiple payments
│       → Charge details (paid/refunded/captured)
│       → External links to Stripe dashboard
│
├── orders-table-order-details-dropdown-types/
│   └── orders-table-order-details-dropdown-types.ts
│       → TOrdersTableOrderDetailsDropdownProps: Component props
│       → TOrderDetailsDropdownTab: Tab type definitions
│
├── orders-table-order-details-dropdown-docs.md
│   → This documentation file
│
└── index.ts
    → Public API exports
```

## Functions & Components

### OrdersTableOrderDetailsDropdown

**Purpose**: Main component that renders the expandable order details dropdown view

**Props**:
- `order: Order` - Complete order object with all related data
- `isExpanded: boolean` - Whether the details are currently expanded
- `onToggle: () => void` - Callback to toggle expansion state

**State Management**:
- Tab state managed internally with Tabs component
- Sessions fetched internally using React Query and order.sessionIds
- Session logs panel state for viewing selected session

**Key Features**:
- Fetches sessions internally using `dbGetOrderSessions(order.sessionIds)`
- Uses `forceMount` on data tabs to pre-fetch immediately when opened
- Sessions displayed in table format with status, HTTP code, path, etc.
- Click on session to open logs panel

### OrdersTableOrderDetailsDropdownMythSection

**Purpose**: Displays Myth order details with full device management

**Features**:
- Device swap and return functionality
- Return all devices button with confirmation dialog
- Product details display
- Contact details
- Registration URL with QR code
- Real-time refresh capability

### OrdersTableOrderDetailsDropdownSkidataSection

**Purpose**: Displays Skidata order details with cancel functionality

**Features**:
- Cancel order button (per submission)
- Cancel ticket button (per ticket)
- Device identifier lookup using serialMap
- Multiple submission tabs
- Error display with JSON output
- Order items with ticket details
- Valid from/until dates with RelativeDayBadge

### OrdersTableOrderDetailsDropdownStripeSection

**Purpose**: Displays Stripe payment details with invoices

**Features**:
- Invoice tab with line items
- Payment intent tabs for multiple payments
- Charge details (paid/refunded/captured status)
- External links to Stripe dashboard
- Invoice hosted URL link
- Status timeline display

### Sessions Tab

**Purpose**: Display and navigate order sessions

**Features**:
- Sessions table with columns: ID, Label, Path, Status, HTTP, Created, Action
- HTTP status color coding (green for 2xx, yellow for 4xx, red for 5xx)
- Request path extracted from sessionLog
- Click session to open SessionLogsPanel
- Refresh button to refetch sessions

## State Management

### Server State (React Query)
- Myth order data: Cache key `["mythOrder", orderId]`
- Skidata order data: Cache key `["skidataOrder", orderId]`
- Stripe transaction data: Cache key `["stripeTransaction", orderId]`
- Order sessions: Cache key `["orderSessions", orderId, sessionIds]`
- Manual refetch capability via refresh buttons
- Toast notifications only on manual refresh, not initial load

## External Dependencies

### Production Dependencies
- `react` (^18.2.0) - Component framework
- `@tanstack/react-query` - Data fetching and caching
- `lucide-react` - Icons
- `sonner` - Toast notifications

### Internal Dependencies
- `@/db/schema` - Order type definition
- `@/db/server-actions/order-actions/db-get-order-sessions` - Sessions fetching
- `@/features/resorts` - useResort hook for context
- `@/features/sessions/session-components/session-logs-panel` - Session logs viewer
- `@/components/ui/*` - UI components
- `../../orders-table-myth-dialog/...` - Myth API actions
- `../../orders-table-skidata-dialog/...` - Skidata API actions
- `@/features/stripe/stripe-actions/...` - Stripe API actions

## Usage Examples

### Basic Usage in Custom Table

```typescript
import { OrdersTableOrderDetailsDropdown } from "@/features/orders-table/orders-table-features/orders-table-order-details-dropdown"

// In table row expansion
{expandedRowId === row.original.id && (
  <OrdersTableOrderDetailsDropdown
    order={row.original}
    isExpanded={true}
    onToggle={() => setExpandedRowId(null)}
  />
)}
```

## Change Log

### [3.0.0] - 2025-11-29
- Updated all sections to match their dialog component counterparts
- Myth section: Added device swap/return actions, return all devices button, QR code display
- Skidata section: Added cancel order/ticket functionality, device identifier lookup, multiple submissions
- Stripe section: Added invoice display with line items, payment intent tabs, charge details
- Sessions tab: Now fetches sessions internally using order.sessionIds
- Sessions display: Table format with ID, Label, Path, Status, HTTP code, Created date
- Removed session props from parent components (sessions now fetched internally)
- Added SessionLogsPanel integration for viewing session details

### [2.0.0] - 2025-11-29
- Renamed from `orders-table-order-details` to `orders-table-order-details-dropdown`
- Added auto-fetch for Myth, Skidata, and Stripe data when dropdown opens
- Added `forceMount` to data tabs for immediate fetching
- Added manual refresh tracking to prevent toast spam on initial load

### [1.0.0] - 2025-10-03
- Initial release as `orders-table-order-details`
