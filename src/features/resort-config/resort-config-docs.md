# Resort Configuration Feature Documentation

## Overview

The Resort Configuration feature provides a comprehensive admin interface for managing resort and sales channel configurations. It enables admins to:

- **Stream real-time Skidata pricing data** via Server-Sent Events (SSE)
- **Visualize HIGH/LOW season prices** in a dynamic table format
- **Configure active products/categories** for each sales channel (Kiosk, Cash Desk, Web)
- **Test API endpoints** to verify configuration changes
- **Manage catalog cache** invalidation

This feature integrates with the Hono backend API and supports real-time data streaming with proper error handling and state management.

## File Tree

```
resort-config/
├── resort-config-actions/
│   ├── resort-config-get-sales-channels.ts
│   │   → Fetches all sales channels for a resort from database
│   │   → Uses unstable_cache for performance with 1-hour revalidation
│   │   → Tagged with "sales-channels" for cache invalidation
│   │
│   ├── resort-config-invalidate-cache.ts
│   │   → Calls POST /api/script/invalidate-catalog-cache endpoint
│   │   → Clears KV cache and product_prices table
│   │   → Sends x-api-key header for authentication
│   │
│   ├── resort-config-stream-api-url.ts
│   │   → Server action to expose HONO_API_URL and HONO_API_KEY to client
│   │   → Required because env vars are not available on client side
│   │
│   ├── resort-config-test-endpoints.ts
│   │   → Tests kiosk, cash-desk, and web (click-and-collect) endpoints
│   │   → Sends POST requests with bustCache=true
│   │   → Returns catalogs array for verification
│   │
│   └── resort-config-update-sales-channel.ts
│       → Updates activeProductIds and activeConsumerCategoryIds
│       → Supports single and batch updates
│       → Invalidates sales-channels cache tag after update
│
├── resort-config-components/
│   ├── resort-config-client.tsx
│   │   → Main orchestrating client component
│   │   → Manages stream state, pending updates, dialogs
│   │   → Integrates all sub-components
│   │   → Handles save confirmation with warning modal
│   │
│   ├── resort-config-log-terminal.tsx
│   │   → Terminal-style log display for SSE stream events
│   │   → Auto-scrolls to latest logs
│   │   → Color-coded messages (error/success/processing)
│   │   → Clear logs functionality
│   │
│   ├── resort-config-price-table.tsx
│   │   → Displays prices in Products (cols) x Categories (rows) format
│   │   → Tab navigation for HIGH/LOW/DEPOT scenarios
│   │   → Horizontal scrolling for many products
│   │   → Sticky first column for category names
│   │
│   ├── resort-config-sales-channel-card.tsx
│   │   → Individual sales channel configuration card
│   │   → Expandable sections for products and categories
│   │   → Select All / Deselect All functionality
│   │   → Shows selected counts (X/Y products, X/Y categories)
│   │
│   └── resort-config-test-section.tsx
│       → Test buttons for kiosk, cash-desk, web endpoints
│       → Date picker for startDate parameter
│       → Displays JSON response in scrollable area
│       → Success/failure badges with status codes
│
├── resort-config-hooks/
│   └── resort-config-use-skidata-stream.ts
│       → Custom hook for SSE stream management
│       → Uses fetch with ReadableStream reader (not EventSource)
│       → Parses SSE events: log, metadata, scenario-start, prices, done, error
│       → Maintains session state with logs, metadata, priceData
│       → Supports abort/cancellation
│
├── resort-config-types/
│   └── resort-config-types.ts
│       → TSkidataStreamPrice: Individual price from stream
│       → TSkidataStreamRow: Price row with scenario and category
│       → TSkidataMetadata: Products and consumers from metadata event
│       → TSalesChannelConfigUpdate: Update payload for sales channels
│       → TPriceTableData: Organized prices by scenario
│       → TStreamSession: Complete stream session state
│       → Component prop types for all components
│
├── index.ts
│   → Public API exports (components, hooks, actions, types)
│
└── resort-config-docs.md
    → This documentation file
```

## Functions & Components

### useSkidataStream()

**Purpose**: Custom hook for managing Skidata SSE price streaming

**Parameters**: None

**Returns**:
- `session: TStreamSession` - Current stream session state
- `startStream: () => Promise<void>` - Starts the SSE connection
- `stopStream: () => void` - Aborts the active stream
- `clearLogs: () => void` - Clears log messages
- `resetSession: () => void` - Resets entire session state
- `isStreaming: boolean` - Whether stream is active

**Side Effects**:
- Establishes SSE connection to `/api/script/generate-skidata-prices-stream`
- Updates session state as events arrive
- Logs activity to session.logs array

**Example Usage**:
```typescript
const { session, startStream, stopStream, isStreaming } = useSkidataStream()

// Start streaming
await startStream()

// Access metadata
console.log(session.metadata?.products)

// Access prices by scenario
console.log(session.priceData.highSeason)
```

**Internal Logic**:
1. Creates AbortController for cancellation support
2. Fetches API config from server action
3. Establishes fetch connection with x-api-key header
4. Reads response body as ReadableStream
5. Parses SSE "data: " lines and dispatches to handlers
6. Updates session state for each event type

**Dependencies**:
- `resort-config-stream-api-url.ts` - API configuration

---

### ResortConfigClient

**Purpose**: Main orchestrating component for resort configuration

**Props**:
- `resort: Resort` - The resort being configured
- `salesChannels: SalesChannel[]` - Initial sales channel data

**State**:
- `pendingUpdates: Map<number, TSalesChannelConfigUpdate>` - Unsaved changes
- `activeScenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"` - Active price tab
- `showSaveConfirm: boolean` - Save confirmation dialog visibility
- `isSaving: boolean` - Save operation loading state
- `isInvalidating: boolean` - Cache invalidation loading state

**Events**:
- Save button - Opens confirmation dialog, then calls batchUpdateSalesChannelConfigs
- Invalidate Cache - Calls invalidateCatalogCache
- Stream buttons - Controls useSkidataStream

**Example Usage**:
```typescript
<ResortConfigClient
  resort={resort}
  salesChannels={salesChannels}
/>
```

---

### ResortConfigPriceTable

**Purpose**: Displays Skidata prices in a table format

**Props**:
- `priceData: TPriceTableData` - Price data organized by scenario
- `products: TSkidataProduct[]` - Products for column headers
- `consumers: TSkidataConsumer[]` - Categories for row headers
- `activeScenario: "HIGH" | "LOW" | "HIGH-DEPOT" | "LOW-DEPOT"` - Active tab
- `onScenarioChange: (scenario) => void` - Tab change callback

**Rendering Logic**:
1. Shows tabs for each scenario (HIGH, LOW, HIGH-DEPOT, LOW-DEPOT)
2. Renders table with products as columns, categories as rows
3. First column is sticky for horizontal scrolling
4. Formats prices as €X.XX or shows error codes

---

### ResortConfigSalesChannelCard

**Purpose**: Configuration card for a single sales channel

**Props**:
- `salesChannel: SalesChannel` - Channel data
- `products: TSkidataProduct[]` - Available products
- `consumers: TSkidataConsumer[]` - Available categories
- `onChange: (update: TSalesChannelConfigUpdate) => void` - Change callback
- `isLoading?: boolean` - Disable interactions during save

**Features**:
- Expandable product/category sections
- Checkbox toggles for each item
- Select All / Deselect All buttons
- Badge showing selection counts

---

### ResortConfigTestSection

**Purpose**: API endpoint testing interface

**Props**:
- `resortId: number` - Resort ID to test

**Features**:
- Date picker for startDate parameter
- Test All button runs all three endpoints
- Individual test buttons for each endpoint
- JSON response display with syntax highlighting
- Success/failure status badges

---

### invalidateCatalogCache()

**Purpose**: Clears the catalog cache for a resort

**Parameters**:
- `resortId: number` - Resort ID

**Returns**: `Promise<TApiResult<TCacheInvalidationResponse>>`

**Side Effects**:
- Calls POST /api/script/invalidate-catalog-cache
- Clears KV cache and product_prices table

---

### testEndpoint()

**Purpose**: Tests a specific API endpoint

**Parameters**:
- `endpoint: "kiosk" | "cash-desk" | "web"` - Endpoint type
- `resortId: number` - Resort ID
- `startDate: string` - Date in YYYY-MM-DD format

**Returns**: `Promise<TApiResult<TTestEndpointResponse>>`

---

### updateSalesChannelConfig()

**Purpose**: Updates a sales channel's configuration

**Parameters**:
- `update: TSalesChannelConfigUpdate` - Update payload

**Returns**: `Promise<TApiResult<SalesChannel>>`

**Side Effects**:
- Updates database record
- Invalidates "sales-channels" cache tag

## State Management

### Local State (ResortConfigClient)
- `pendingUpdates` - Tracks unsaved configuration changes
- `activeScenario` - Current price table tab
- `showSaveConfirm` - Confirmation dialog state
- `isSaving` / `isInvalidating` - Loading states

### Hook State (useSkidataStream)
- `session.state` - Stream connection state (idle/connecting/streaming/done/error)
- `session.logs` - Array of log messages
- `session.metadata` - Products and consumers from stream
- `session.priceData` - Organized prices by scenario

### Server State
- Fetched via `getSalesChannelsByResortId` with 1-hour cache
- Updated via `updateSalesChannelConfig` with cache invalidation

## External Dependencies

### Production Dependencies
- `react` (^18.x) - Component framework
- `lucide-react` - Icon library
- `drizzle-orm` - Database ORM

### Internal Dependencies
- `@/components/ui/*` - Shadcn UI components (Card, Button, Checkbox, etc.)
- `@/db` - Database connection
- `@/db/schema` - Database schemas (salesChannels)
- `@/lib/unstable-cache` - Caching utility

### API Endpoints Used
- `GET /api/script/generate-skidata-prices-stream` - SSE price stream
- `POST /api/script/invalidate-catalog-cache` - Cache invalidation
- `POST /api/kiosk/products` - Kiosk products test
- `POST /api/cash-desk/products` - Cash desk products test
- `POST /api/click-and-collect/products` - Web products test

## Usage Examples

### Basic Usage

```typescript
// In page.tsx
import { ResortConfigClient, getSalesChannelsByResortId } from "@/features/resort-config"
import { dbGetResortByName } from "@/features/resorts/resort-actions/db-get-resort-by-name"

export default async function Page({ params }) {
  const { resortName } = await params
  const resort = await dbGetResortByName(resortName)
  const salesChannels = await getSalesChannelsByResortId(resort.id)

  return (
    <ResortConfigClient
      resort={resort}
      salesChannels={salesChannels}
    />
  )
}
```

### Using Individual Components

```typescript
import {
  ResortConfigPriceTable,
  ResortConfigSalesChannelCard,
  useSkidataStream
} from "@/features/resort-config"

function MyComponent() {
  const { session, startStream } = useSkidataStream()

  return (
    <>
      <button onClick={startStream}>Fetch Prices</button>
      <ResortConfigPriceTable
        priceData={session.priceData}
        products={session.metadata?.products ?? []}
        consumers={session.metadata?.consumers ?? []}
        activeScenario="HIGH"
        onScenarioChange={() => {}}
      />
    </>
  )
}
```

## Testing Guidelines

### Unit Tests Required For
- `useSkidataStream` hook - Stream state management
- SSE parsing logic - Event type handling
- Price data organization - Map structure manipulation

### Integration Tests Required For
- Stream connection/disconnection
- Configuration save flow
- Cache invalidation
- Test endpoint calls

### Test Files Needed
- `resort-config-use-skidata-stream.test.ts`
- `resort-config-actions.test.ts`
- `resort-config-client.test.tsx`

## Known Issues & Limitations

### Current Limitations
1. SSE stream requires backend to be running
2. No offline support for configuration
3. No undo/redo for configuration changes
4. Limited error recovery on stream disconnect

### Browser Compatibility
- Chrome 90+ (ReadableStream support)
- Firefox 88+ (ReadableStream support)
- Safari 14+ (ReadableStream support)
- Edge 90+ (ReadableStream support)

### Performance Notes
- Price table may be slow with many products (100+)
- Consider virtualization for large catalogs
- Stream processing is single-threaded

## Change Log

### [1.0.0] - 2025-11-28
- Initial release
- SSE streaming for Skidata prices
- Sales channel configuration UI
- API endpoint testing
- Cache invalidation
- Save confirmation workflow

