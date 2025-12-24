# Bookings API Update Summary

## Overview
This document summarizes all frontend updates made to align with the new backend Booking Management API documentation.

**Date:** January 2025  
**Backend API Version:** Updated Admin Booking Management API

---

## Key Changes

### 1. Status Values Updated

**Old Format:**
- `"pending payment"`
- `"pending approval"`
- `"approved"`

**New Format:**
- `"PENDING_PAYMENT"`
- `"PENDING_APPROVAL"`
- `"APPROVED"`
- `"ROOM_ALLOCATED"` (new)
- `"COMPLETED"` (new)
- `"CANCELLED"` (new)
- `"REJECTED"` (new)
- `"EXPIRED"` (new)

**Implementation:**
- Updated `BookingStatus` type in `src/types/booking.ts`
- Added normalization helper function to convert old format to new format
- All status values are normalized when received from API
- Frontend handles both old and new formats for backward compatibility

---

### 2. New Booking Status Flow

**Updated Flow:**
```
PENDING_PAYMENT → (Approve Payment) → PENDING_APPROVAL 
→ (Approve Booking) → APPROVED → (Assign Room) → ROOM_ALLOCATED 
→ (Complete Onboarding) → COMPLETED → Member
```

**Changes:**
- Added separate `approveBooking` action (different from `approvePayment`)
- `assignRoom` now changes status to `ROOM_ALLOCATED` (not just sets room number)
- `completeOnboarding` now requires `ROOM_ALLOCATED` status (not just `APPROVED` with room)

---

### 3. New API Endpoints

#### Approve Booking
- **Endpoint:** `POST /api/v1/bookings/:id/approve`
- **Action:** Changes status from `PENDING_APPROVAL` to `APPROVED`
- **Store Action:** `useBookingsStore.approveBooking(id)`

#### Cancel Booking
- **Endpoint:** `DELETE /api/v1/bookings/:id/cancel`
- **Request Body:** `{ reason?: string }` (optional)
- **Action:** Cancels booking at any status (except COMPLETED)
- **Store Action:** `useBookingsStore.cancelBooking(id, reason?)`

---

### 4. Updated API Endpoints

#### List Bookings
- **Response Format:** `{ success: true, data: { bookings: [...], total, page, pageSize } }`
- **Updated:** Response parsing now handles `data.bookings` structure

#### Assign Room
- **Status Change:** Now returns status `ROOM_ALLOCATED` (was `APPROVED`)
- **Prerequisite:** Booking must be in `APPROVED` status

#### Complete Onboarding
- **Prerequisite:** Booking must be in `ROOM_ALLOCATED` status (not just `APPROVED` with room)
- **Validation:** Added check for `ROOM_ALLOCATED` status before allowing completion

#### Delete Booking
- **Restriction:** Can only delete bookings with `PENDING_PAYMENT` status
- **Validation:** Added client-side check before API call

---

### 5. UI Component Updates

#### Status Display
- **Format:** Status values displayed in readable format (e.g., "Pending Payment" instead of "PENDING_PAYMENT")
- **Badge Colors:** Updated to handle all new status values
- **Status Filter:** Updated dropdown options to include all new statuses

#### Action Buttons (Edit Contact Dialog)
- **Approve Payment:** Only shown for `PENDING_PAYMENT` status
- **Approve Booking:** Only shown for `PENDING_APPROVAL` status (new button)
- **Assign Room:** Only shown for `APPROVED` status
- **Complete Onboarding:** Only shown for `ROOM_ALLOCATED` status
- **Cancel Booking:** Shown for all statuses except `COMPLETED` (new button)

#### Status Filter Dropdown
- **Options:** Updated to include all new status values
- **Display:** Formatted for readability (e.g., "Pending Payment" in UI, "PENDING_PAYMENT" in API)

---

## Files Modified

### Core Files
1. **`src/types/booking.ts`**
   - Updated `BookingStatus` type to include all new statuses
   - Added legacy support for old format

2. **`src/stores/useBookingsStore.ts`**
   - Added `normalizeStatus` helper function
   - Added `approveBooking` action
   - Added `cancelBooking` action
   - Updated `assignRoom` to handle `ROOM_ALLOCATED` status
   - Updated `completeOnboarding` to require `ROOM_ALLOCATED` status
   - Updated `deleteBooking` to validate `PENDING_PAYMENT` status
   - Updated response parsing for `data.bookings` structure
   - Normalized all status values in API responses

3. **`src/app/dashboard/bookings/page.tsx`**
   - Added `approveBooking` handler
   - Added `cancelBooking` handler
   - Updated `handleCompleteOnboarding` validation
   - Updated status filter options

4. **`src/app/dashboard/components/_reusable_components/edit-contact-dialog.tsx`**
   - Updated status checks to use normalized values
   - Added `onCancel` prop and cancel button
   - Updated action button visibility logic
   - Added status normalization helper

5. **`src/app/dashboard/components/_reusable_components/columns.tsx`**
   - Updated status display formatting
   - Added status normalization and color mapping
   - Updated status badge colors for all new statuses

6. **`src/app/dashboard/components/_reusable_components/table-filters.tsx`**
   - Updated status display formatting in dropdown
   - Formats status values for readability

7. **`src/app/dashboard/bookings/_components/BookingsTable.tsx`**
   - Updated status filtering to normalize both filter and booking status
   - Added status normalization helper

8. **`src/app/dashboard/bookings/_components/BookingsDialogs.tsx`**
   - Added `onCancel` prop

9. **`src/app/dashboard/components/_reusable_components/add-contact-dialog.tsx`**
   - Updated default status to `"PENDING_PAYMENT"`

---

## Status Normalization

### Helper Function
```typescript
const normalizeStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    "pending payment": "PENDING_PAYMENT",
    "pending approval": "PENDING_APPROVAL",
    "approved": "APPROVED",
  };
  return statusMap[status.toLowerCase()] || status.toUpperCase().replace(/\s+/g, "_");
};
```

### Usage
- Applied to all status values received from API
- Applied to status filter values before API calls
- Applied to status comparisons in UI components

---

## API Request/Response Examples

### Create Booking
**Request:**
```json
{
  "hostelName": "Lienda Ville",
  "email": "student@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "gender": "female",
  "level": "200",
  "school": "KNUST",
  "studentId": "KNUST12345",
  "phone": "0244123456",
  "roomTitle": "One-in-one",
  "price": "400",
  "status": "PENDING_PAYMENT"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "status": "PENDING_PAYMENT",
    // ... other fields
  }
}
```

### List Bookings
**Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "booking_123",
        "status": "PENDING_PAYMENT",
        // ... other fields
      }
    ],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

### Approve Payment
**Request:** `POST /api/v1/bookings/:id/approve-payment`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "status": "PENDING_APPROVAL",
    // ... other fields
  }
}
```

### Approve Booking
**Request:** `POST /api/v1/bookings/:id/approve`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "status": "APPROVED",
    // ... other fields
  }
}
```

### Assign Room
**Request:** `PATCH /api/v1/bookings/:id/assign-room`
```json
{
  "roomNumber": 101
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_123",
    "status": "ROOM_ALLOCATED",
    "allocatedRoomNumber": 101,
    // ... other fields
  }
}
```

### Complete Onboarding
**Request:** `POST /api/v1/bookings/:id/complete-onboarding`

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Onboarding completed successfully"
  }
}
```

### Cancel Booking
**Request:** `DELETE /api/v1/bookings/:id/cancel`
```json
{
  "reason": "Policy violation"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "booking_123",
      "status": "CANCELLED",
      // ... other fields
    }
  }
}
```

---

## Status-Based Actions

### PENDING_PAYMENT
- ✅ Approve Payment
- ✅ Delete Booking
- ✅ Cancel Booking
- ✅ View Details

### PENDING_APPROVAL
- ✅ Approve Booking
- ✅ Reject Booking (via cancel)
- ✅ Cancel Booking
- ✅ View Details

### APPROVED
- ✅ Assign Room
- ✅ Cancel Booking
- ✅ View Details

### ROOM_ALLOCATED
- ✅ Complete Onboarding
- ✅ Cancel Booking
- ✅ View Details

### COMPLETED
- ✅ View Details (read-only)

### CANCELLED / REJECTED / EXPIRED
- ✅ View Details (read-only)

---

## Validation Rules

### Delete Booking
- **Allowed:** Only `PENDING_PAYMENT` status
- **Validation:** Client-side check before API call
- **Error:** "Only bookings with 'pending payment' status can be deleted"

### Complete Onboarding
- **Required:** `ROOM_ALLOCATED` status
- **Required:** `allocatedRoomNumber` must be set
- **Validation:** Client-side checks before API call
- **Error:** "Cannot complete onboarding. Booking status must be 'room_allocated'"

### Assign Room
- **Required:** `APPROVED` status
- **Backend Validates:** Room availability, type match, gender compatibility

---

## Backward Compatibility

The frontend maintains backward compatibility by:
1. **Normalizing status values** - Converts old format to new format automatically
2. **Handling multiple response formats** - Supports both old and new API response structures
3. **Flexible status comparison** - Compares normalized values in filters and UI

---

## Testing Checklist

### Booking Creation
- [x] Create booking with new status format
- [x] Form defaults to `PENDING_PAYMENT`
- [x] Response normalization works

### Payment Approval
- [x] Approve payment changes status to `PENDING_APPROVAL`
- [x] Button only shows for `PENDING_PAYMENT`

### Booking Approval
- [x] Approve booking changes status to `APPROVED`
- [x] Button only shows for `PENDING_APPROVAL`
- [x] Separate from payment approval

### Room Assignment
- [x] Assign room changes status to `ROOM_ALLOCATED`
- [x] Button only shows for `APPROVED`
- [x] Room number is set correctly

### Complete Onboarding
- [x] Requires `ROOM_ALLOCATED` status
- [x] Requires `allocatedRoomNumber` to be set
- [x] Button only shows for `ROOM_ALLOCATED`
- [x] Booking removed from list after completion

### Cancel Booking
- [x] Cancel button available for all statuses except `COMPLETED`
- [x] Optional reason can be provided
- [x] Status changes to `CANCELLED`

### Delete Booking
- [x] Only allowed for `PENDING_PAYMENT` status
- [x] Validation error shown for other statuses

### Status Filtering
- [x] All new statuses available in filter
- [x] Status values formatted for display
- [x] Filter works with normalized status values

### Status Display
- [x] All statuses display correctly
- [x] Badge colors appropriate for each status
- [x] Readable format in UI

---

## Migration Notes

### For Developers

1. **Status Comparisons:** Always use normalized status values when comparing
2. **API Calls:** Send status in uppercase with underscores format
3. **UI Display:** Format status for readability (replace underscores with spaces, capitalize)
4. **New Actions:** Use `approveBooking` for booking approval (separate from payment approval)
5. **Room Assignment:** Status changes to `ROOM_ALLOCATED` after assignment
6. **Onboarding:** Requires `ROOM_ALLOCATED` status, not just `APPROVED` with room

### Breaking Changes

1. **Status Format:** Backend now uses uppercase with underscores
2. **Status Flow:** Added `ROOM_ALLOCATED` status between `APPROVED` and `COMPLETED`
3. **Approve Action:** Split into `approvePayment` and `approveBooking`
4. **Delete Restriction:** Can only delete `PENDING_PAYMENT` bookings

---

## Summary

All frontend code has been updated to match the new backend API:
- ✅ Status values normalized and updated
- ✅ New `approveBooking` action added
- ✅ New `cancelBooking` action added
- ✅ Response parsing updated for new format
- ✅ UI components updated for new status flow
- ✅ Validation rules implemented
- ✅ Backward compatibility maintained

The frontend is now fully aligned with the backend Admin Booking Management API.
