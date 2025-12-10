# Kiosk Detail Feature

Comprehensive kiosk management feature providing detailed view and control capabilities for individual kiosks. Integrates with external Hono API endpoints to fetch real-time kiosk data, slot information, and battery status.

## Features

- **Real-time Kiosk Information**: Displays cabinet details, shop information, and pricing strategy
- **Slot Management**: Visual grid showing all kiosk slots with battery status and fault information
- **Force Eject**: Ability to remotely eject individual slots regardless of state
- **Battery Monitoring**: Track battery charge levels and temperature for each occupied slot
- **Auto-refresh**: Manual and automatic data refresh capabilities

## Structure

```
kiosk-detail/
├── actions/              # Server actions for API communication
│   ├── get-kiosk-info.ts    # Fetch kiosk information
│   ├── get-kiosk-slots.ts   # Fetch slot data
│   └── eject-slot.ts        # Force eject slot
├── components/           # UI components
│   ├── kiosk-info-card.tsx  # Display kiosk information
│   ├── kiosk-slots-grid.tsx # Grid view of slots with eject
│   └── kiosk-detail-page.tsx # Main page component
├── types/               # TypeScript type definitions
│   └── index.ts
└── index.ts            # Feature exports
```

## API Endpoints

This feature integrates with the following Hono API endpoints:

### 1. Get Kiosk Info
```
GET /api/kiosks/{kioskId}
Headers: x-api-key
```
Returns comprehensive kiosk information including cabinet details, shop info, price strategy, and current batteries.

### 2. Get Kiosk Slots
```
GET /api/kiosks/{kioskId}/slots
Headers: x-api-key
```
Returns detailed slot information including state, battery details, and fault information.

### 3. Force Eject Slot
```
POST /api/kiosks/{kioskId}/slots/{slotNumber}/eject
Headers: x-api-key
```
Forces a slot to eject regardless of current state.

## Environment Variables

Required environment variables:

```env
# Kiosk API Configuration
HONO_API_URL=http://127.0.0.1:8787  # API base URL
HONO_API_KEY=your-api-key-here                  # API authentication key
```

## Usage

### Accessing Kiosk Details

Navigate to a specific kiosk from the kiosks table by clicking "View Details" or by visiting:

```
/admin/{resortName}/settings/kiosks/{kioskId}
```

### Programmatic Usage

```typescript
import { getKioskInfo, getKioskSlots, ejectSlot } from '@/features/kiosk-detail'

// Fetch kiosk information
const kioskInfo = await getKioskInfo('DTN00143')

// Fetch slot data
const slotsData = await getKioskSlots('DTN00143')

// Eject a specific slot
const result = await ejectSlot('DTN00143', 1)
```

### Component Usage

```typescript
import { KioskDetailPage } from '@/features/kiosk-detail'

export default function Page() {
  return <KioskDetailPage kioskId="DTN00143" resortName="resort-name" />
}
```

## Data Flow

1. **Initial Load**: Component fetches kiosk info and slot data in parallel
2. **Display**: Information is rendered in organized cards and grids
3. **Actions**: User can refresh data or eject slots
4. **Updates**: After ejection, data is automatically refreshed

## Error Handling

All API calls include comprehensive error handling:

- **Timeout**: 30-second timeout for all requests
- **API Key Invalid**: Returns specific error type
- **Not Found**: Handles missing kiosks gracefully
- **Network Errors**: Catches and reports connection issues
- **Aborted Requests**: Supports request cancellation

## Components

### KioskInfoCard

Displays kiosk information in three organized cards:
- Cabinet Details (status, slots, signal, IP)
- Shop Information (location, pricing)
- Price Strategy (currency, deposit, timeout settings)

### KioskSlotsGrid

Grid layout showing all slots with:
- Slot state badges (Empty, Occupied, Fault)
- Battery charge indicators
- Temperature monitoring
- Fault information
- Force eject buttons
- Confirmation dialogs

### KioskDetailPage

Main page component that:
- Fetches and manages kiosk data
- Handles loading and error states
- Provides refresh functionality
- Coordinates child components

## Types

All types are fully documented in `types/index.ts`:

- `KioskInfoResponse` - Complete kiosk information
- `KioskSlotsResponse` - Slot data with battery details
- `SlotEjectResponse` - Eject confirmation
- `KioskApiError` - Standardized error format

## Logging

All API actions include detailed console logging for debugging:

```typescript
console.log('[API] Fetching kiosk info for: DTN00143')
console.log('[API] Successfully fetched slots for kiosk: DTN00143')
console.error('[API] Error fetching kiosk info:', error)
```

## Best Practices

1. **Always handle errors**: Check response success before accessing data
2. **Use AbortSignal**: Pass signal for request cancellation support
3. **Refresh after mutations**: Call refresh after ejecting slots
4. **Validate environment**: Ensure API key is configured before deployment

## Future Enhancements

Potential improvements:
- Real-time WebSocket updates for slot status
- Batch slot operations
- Historical data and analytics
- Maintenance scheduling
- Alert notifications for faults
- Export slot data to CSV

