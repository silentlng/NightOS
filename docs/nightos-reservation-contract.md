# NightOS Reservation Contract

## Why this contract matters

NightOS should only become a trusted operating layer if the reservation writer sends enough structure to support:

- reservation visibility
- RP attribution
- client relationship history
- auditability
- direction-grade reporting

## Required writer fields

These fields should exist on the reservation side before NightOS is approved as a production reader.

| Field | Priority | Why it matters |
| --- | --- | --- |
| `booking_id` | Required | Stable external identity for deduplication and updates |
| `event_id` | Required | Anchors a booking to a specific event or night |
| `reservation_date` | Required | Supports operational windows and historical reporting |
| `arrival_time` | Recommended | Helps pressure planning and arrival pacing |
| `booking_status` | Required | Prevents silent cancellations or stale occupancy |
| `created_at` | Required | Enables auditability and time-based reporting |
| `updated_at` | Required | Needed for sync conflict resolution and freshness |
| `guest_count` | Required | Supports quality scoring and staffing decisions |
| `table_id` or `slot_id` | Required | Anchors occupancy to a real plan location |
| `table_label` | Recommended | Needed for clear manager-facing table visibility |
| `source_label` or `rp_label` | Required for RP analytics | Bridges writer activity to NightOS performance views |
| `client_full_name` | Required for CRM | Minimum identity anchor for VIP history |
| `client_phone` | Strongly recommended | Enables relaunches and contact workflows |
| `client_email` | Strongly recommended | Enables CRM segmentation and confirmations |
| `spend_estimate` or `minimum_spend` | Recommended | Supports revenue structure and value ranking |
| `notes_internal` | Optional | Useful for direction or floor notes without polluting analytics |
| `source_event_id` | Recommended | Creates clean lineage for updates and source-side audit |
| `source_client_id` | Recommended | Helps merge repeated visitors into a real CRM profile |

## Fields NightOS already prepares internally

- `external_source`
- `external_booking_id`
- `sync_status`
- `imported_at`
- `last_synced_at`
- `created_from`
- `updated_from_source`
- `source_event_id`
- `source_client_id`

## What NightOS should calculate

These should be calculated by NightOS, not stored as the writer’s business truth:

- fill rate
- active promoters
- RP revenue structure
- reservation quality signals
- VIP recurrence
- operational alerts
- inactive RP detection
- relaunch opportunities

## Approval checklist

Approve the writer-to-reader link only when:

1. booking identity is stable
2. status changes are explicit
3. update timestamps are reliable
4. RP attribution is coherent
5. identity fields are sufficient for CRM
6. data ownership is agreed
7. NightOS persistence is tested against real updates and cancellations
