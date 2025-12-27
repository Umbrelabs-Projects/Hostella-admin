# Backend Integration Documentation: Payments & Notifications

## 📋 Overview

This document outlines the **frontend expectations** for the backend API regarding **Paystack payments** and **admin notifications**. It covers:

1. **Payment Endpoints** - What the frontend calls and expects
2. **Notification System** - When notifications should be created
3. **Data Formats** - Expected request/response structures
4. **Integration Points** - Critical flows that must work together

---

## 🔔 Part 1: Notification System

### 1.1 Notification Endpoint

**Frontend Endpoint Used:**
```typescript
GET /api/v1/notifications?page={page}&pageSize={pageSize}&unreadOnly={boolean}
Authorization: Bearer <admin_token>
```

**Expected Response Format:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "notification_id",
      "type": "PAYMENT_RECEIVED",
      "title": "New Paystack Payment Received",
      "description": "Ama Bemah (BK-XXXX) has made a payment of GHS 9000 via mtn. Reference: BKG_1766848931990_zyez6ern9. Please verify and approve the payment.",
      "read": false,
      "relatedId": "payment_id",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 50,
  "unreadCount": 5,
  "page": 1,
  "pageSize": 50,
  "totalPages": 1
}
```

**Alternative Acceptable Format:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "total": 50,
    "unreadCount": 5,
    "page": 1,
    "pageSize": 50,
    "totalPages": 1
  }
}
```

### 1.2 Notification Types

**Frontend Expects These Notification Types:**

| Type | When Created | Description |
|------|-------------|-------------|
| `PAYMENT_RECEIVED` | When Paystack payment is verified | New payment received notification |
| `new-booking` | When new booking is created | New booking notification |
| `payment-received` | When payment is confirmed | Payment confirmation notification |
| `system-alert` | System-wide alerts | General system notifications |

### 1.3 When Notifications Should Be Created

#### ✅ **CRITICAL: Paystack Payment Verification**

**When a Paystack payment is verified (either via webhook OR manual verification), the backend MUST:**

1. **Update Payment Status:**
   - `INITIATED` → `CONFIRMED`
   - Update payment record with verification data

2. **Update Booking Status:**
   - `PENDING_PAYMENT` → `PENDING_APPROVAL`
   - Update booking record

3. **Create Admin Notifications (REQUIRED):**
   ```javascript
   // For EACH admin assigned to the hostel:
   {
     type: "PAYMENT_RECEIVED",
     title: "New Paystack Payment Received",
     description: "{Student Name} ({Booking ID}) has made a payment of GHS {Amount} via {Provider}. Reference: {Reference}. Please verify and approve the payment.",
     relatedId: "{payment_id}",
     read: false
   }
   ```

4. **Send Email Notifications (REQUIRED):**
   - Send email to all admins assigned to the hostel
   - Include payment details, student info, and booking reference

#### ✅ **Webhook Flow (Automatic)**

```
Student makes payment → Paystack sends webhook → Backend processes webhook → 
Backend verifies payment → Backend creates notifications → Frontend polls and displays
```

**Backend must:**
- Receive webhook from Paystack
- Verify payment status with Paystack
- Update payment status to `CONFIRMED`
- Update booking status to `PENDING_APPROVAL`
- **Create in-app notifications for all admins**
- **Send email notifications to all admins**

#### ✅ **Manual Verification Flow (Fallback)**

```
Admin clicks "Verify with Paystack" → Frontend calls verification endpoint → 
Backend verifies payment → Backend creates notifications → Frontend refreshes and displays
```

**Backend must:**
- Verify payment with Paystack API
- Update payment status to `CONFIRMED`
- Update booking status to `PENDING_APPROVAL`
- **Create in-app notifications for all admins**
- **Send email notifications to all admins**

### 1.4 Notification Marking as Read

**Frontend Endpoints Used:**
```typescript
// Mark single notification as read
PATCH /api/v1/notifications/{notificationId}/read
Authorization: Bearer <admin_token>

// Mark all notifications as read
PATCH /api/v1/notifications/read-all
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 1.5 Notification Deletion

**Frontend Endpoints Used:**
```typescript
// Delete single notification
DELETE /api/v1/notifications/{notificationId}
Authorization: Bearer <admin_token>

// Delete all notifications
DELETE /api/v1/notifications
Authorization: Bearer <admin_token>
```

---

## 💳 Part 2: Payment System

### 2.1 Payment Endpoints (NEW - Use These!)

#### ✅ **Get All Payments (Unified Endpoint)**

**Frontend Endpoint Used:**
```typescript
GET /api/v1/payments?provider={PAYSTACK|BANK_TRANSFER}&status={INITIATED|AWAITING_VERIFICATION|CONFIRMED|FAILED}&page={page}&limit={limit}
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `provider` (optional): `PAYSTACK` or `BANK_TRANSFER`
- `status` (optional): `INITIATED`, `AWAITING_VERIFICATION`, `CONFIRMED`, `FAILED`
- `bookingId` (optional): Filter by booking ID
- `page` (default: 1): Page number
- `limit` (default: 10): Items per page

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "payment_id",
        "bookingId": "booking_internal_id",
        "amount": 9000,
        "provider": "PAYSTACK",
        "status": "INITIATED",
        "reference": "BKG_1766848931990_zyez6ern9",
        "receiptUrl": null,
        "payerPhone": "+233XXXXXXXXX",
        "verificationData": {
          "status": "success",
          "gateway_response": "Successful",
          "channel": "mobile_money",
          "authorization": {
            "channel": "mtn",
            "mobile_money_number": "+233XXXXXXXXX"
          }
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:30:00Z",
        "booking": {
          "id": "booking_internal_id",
          "bookingId": "BK-XXXX",
          "status": "PENDING_PAYMENT",
          "user": {
            "id": "user_id",
            "firstName": "Ama",
            "lastName": "Bemah",
            "email": "amabemah0802@gmail.com",
            "phone": "+233XXXXXXXXX",
            "studentId": "STU123456",
            "studentRefNumber": "STU123456"
          },
          "hostel": {
            "id": "hostel_id",
            "name": "Sunshine Hostel",
            "location": "Campus A",
            "campus": "Main Campus"
          }
        }
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "limit": 10,
      "pages": 1
    }
  }
}
```

**Alternative Acceptable Format:**
```json
{
  "success": true,
  "items": [...],
  "pagination": {...}
}
```

#### ✅ **Get Payment by Booking ID**

**Frontend Endpoint Used:**
```typescript
GET /api/v1/payments/booking/{bookingId}
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment_id",
      "bookingId": "booking_internal_id",
      "amount": 9000,
      "provider": "PAYSTACK",
      "status": "INITIATED",
      "reference": "BKG_1766848931990_zyez6ern9",
      "payerPhone": "+233XXXXXXXXX",
      "verificationData": {...},
      "booking": {...}
    }
  }
}
```

#### ✅ **Get Payment Details**

**Frontend Endpoint Used:**
```typescript
GET /api/v1/payments/{paymentId}
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment_id",
      "bookingId": "booking_internal_id",
      "amount": 9000,
      "provider": "PAYSTACK",
      "status": "INITIATED",
      "reference": "BKG_1766848931990_zyez6ern9",
      "payerPhone": "+233XXXXXXXXX",
      "verificationData": {...},
      "booking": {...}
    }
  }
}
```

#### ✅ **Verify Paystack Payment (CRITICAL ENDPOINT)**

**Frontend Endpoint Used:**
```typescript
GET /api/v1/payments/verify/paystack/{reference}
Authorization: Bearer <admin_token>
```

**What Frontend Expects:**

1. **Backend verifies payment with Paystack API**
2. **Backend updates payment status: `INITIATED` → `CONFIRMED`**
3. **Backend updates booking status: `PENDING_PAYMENT` → `PENDING_APPROVAL`**
4. **Backend creates admin notifications (REQUIRED)**
5. **Backend sends email notifications (REQUIRED)**

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "paystackVerification": {
      "status": true,
      "data": {
        "status": "success",
        "gateway_response": "Successful",
        "channel": "mobile_money",
        "reference": "BKG_1766848931990_zyez6ern9",
        "amount": 9000,
        "authorization": {
          "channel": "mtn",
          "mobile_money_number": "+233XXXXXXXXX"
        }
      }
    },
    "paymentUpdate": {
      "payment": {
        "id": "payment_id",
        "status": "CONFIRMED",
        "reference": "BKG_1766848931990_zyez6ern9",
        "amount": 9000,
        "provider": "PAYSTACK"
      },
      "booking": {
        "id": "booking_internal_id",
        "status": "PENDING_APPROVAL"
      }
    }
  }
}
```

**Backend Logs Should Show:**
```
✅ Paystack payment verified successfully
🔄 Updating payment status: INITIATED → CONFIRMED
✅ Payment status updated successfully. Booking status: PENDING_APPROVAL
✅ Admin notifications sent after manual verification
✅ Created in-app notifications for X admin(s)
📧 Paystack payment email notifications sent: X/X successful
```

#### ✅ **Update Payment Status**

**Frontend Endpoint Used:**
```typescript
PATCH /api/v1/payments/{paymentId}/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "CONFIRMED" | "FAILED"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "payment_id",
      "status": "CONFIRMED",
      "bookingId": "booking_internal_id",
      "amount": 9000,
      "provider": "PAYSTACK",
      "reference": "BKG_1766848931990_zyez6ern9"
    }
  },
  "message": "Payment status updated successfully"
}
```

**When status is set to `CONFIRMED`:**
- Backend should automatically update booking status to `PENDING_APPROVAL`
- Backend should create notifications if not already created

---

## 🔄 Part 3: Critical Integration Flows

### 3.1 Paystack Payment Flow (Complete)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Student Initiates Payment                                    │
│    - Student frontend calls: POST /api/v1/payments/initiate    │
│    - Backend creates payment with status: INITIATED              │
│    - Backend returns Paystack authorization URL                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Student Completes Payment on Paystack                        │
│    - Paystack processes payment                                 │
│    - Paystack sends webhook to backend                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend Receives Webhook (AUTOMATIC)                         │
│    ✅ Verify payment with Paystack API                          │
│    ✅ Update payment status: INITIATED → CONFIRMED              │
│    ✅ Update booking status: PENDING_PAYMENT → PENDING_APPROVAL │
│    ✅ Create in-app notifications for ALL admins                │
│    ✅ Send email notifications to ALL admins                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Frontend Polls for Notifications (Every 30 seconds)         │
│    - GET /api/v1/notifications                                 │
│    - Displays notification badge with count                     │
│    - Shows notification in dropdown                             │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Manual Verification Flow (Fallback)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Admin Views Payments Page                                    │
│    - GET /api/v1/payments?provider=PAYSTACK&status=INITIATED    │
│    - Frontend displays INITIATED payments                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Clicks "Verify with Paystack"                          │
│    - Frontend calls: GET /api/v1/payments/verify/paystack/{ref} │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend Verifies Payment (MANUAL)                             │
│    ✅ Verify payment with Paystack API                          │
│    ✅ Update payment status: INITIATED → CONFIRMED              │
│    ✅ Update booking status: PENDING_PAYMENT → PENDING_APPROVAL │
│    ✅ Create in-app notifications for ALL admins                │
│    ✅ Send email notifications to ALL admins                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Frontend Refreshes Data                                      │
│    - Refreshes notifications (multiple times to ensure catch)   │
│    - Refreshes payments list                                    │
│    - Refreshes bookings list                                    │
│    - Shows success toast                                        │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Payment Approval Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Admin Views CONFIRMED Payment                                │
│    - Payment status is CONFIRMED                                │
│    - Booking status is PENDING_APPROVAL                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Admin Clicks "Approve Payment"                                │
│    - Frontend calls: POST /api/v1/bookings/{id}/approve-payment │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Backend Approves Payment                                      │
│    ✅ Update booking status: PENDING_APPROVAL → APPROVED        │
│    ✅ (Payment is already CONFIRMED)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Part 4: Payment Status States

### 4.1 Payment Status Flow

```
INITIATED
  ↓ (Webhook received OR Manual verification)
CONFIRMED
  ↓ (Admin approves)
APPROVED (via booking status)
```

### 4.2 Frontend Behavior by Status

| Status | Frontend Shows | Actions Available |
|--------|---------------|-------------------|
| `INITIATED` | ⚠️ Orange badge "Initiated - Verify Now" | "Verify with Paystack" button |
| `AWAITING_VERIFICATION` | Blue badge "Pending" | "Verify with Paystack" button, "Verify & Approve" button |
| `CONFIRMED` | Green badge "Confirmed" | "Approve Payment" button |
| `FAILED` | Red badge "Failed" | "Reject" button (already rejected) |

### 4.3 Booking Status Flow

```
PENDING_PAYMENT
  ↓ (Payment verified)
PENDING_APPROVAL
  ↓ (Admin approves payment)
APPROVED
  ↓ (Admin assigns room)
ASSIGNED
```

---

## 🚨 Part 5: Critical Requirements

### 5.1 Notification Creation (MANDATORY)

**When a Paystack payment is verified (webhook OR manual), the backend MUST:**

1. ✅ **Create in-app notifications** for ALL admins assigned to the hostel
2. ✅ **Send email notifications** to ALL admins assigned to the hostel
3. ✅ **Include payment details** in notification (amount, student name, booking ID, reference)
4. ✅ **Set `relatedId`** to payment ID for navigation
5. ✅ **Set `type`** to `PAYMENT_RECEIVED` or `payment-received`

**Notification Format:**
```json
{
  "type": "PAYMENT_RECEIVED",
  "title": "New Paystack Payment Received",
  "description": "{Student Name} ({Booking ID}) has made a payment of GHS {Amount} via {Provider}. Reference: {Reference}. Please verify and approve the payment.",
  "relatedId": "{payment_id}",
  "read": false
}
```

### 5.2 Payment Data Requirements

**For Paystack payments, the backend MUST return:**

1. ✅ **`payerPhone`** - Phone number used for payment
2. ✅ **`verificationData`** - Complete Paystack verification response:
   ```json
   {
     "status": "success",
     "gateway_response": "Successful",
     "channel": "mobile_money",
     "authorization": {
       "channel": "mtn",
       "mobile_money_number": "+233XXXXXXXXX"
     }
   }
   ```
3. ✅ **`booking`** object with full user and hostel details
4. ✅ **`reference`** - Payment reference from Paystack

### 5.3 Endpoint Consistency

**The backend MUST support:**

1. ✅ **Unified `/api/v1/payments` endpoint** with filters (NOT just `/payments/admin/pending-receipts`)
2. ✅ **Payment verification endpoint** that creates notifications
3. ✅ **Booking-specific payment lookup** endpoint

---

## 🧪 Part 6: Testing Checklist

### 6.1 Notification Testing

- [ ] **Webhook Flow:**
  - [ ] Make a Paystack payment
  - [ ] Check backend logs for webhook receipt
  - [ ] Verify notifications are created in database
  - [ ] Verify emails are sent to admins
  - [ ] Check frontend notification badge updates (within 30 seconds)

- [ ] **Manual Verification Flow:**
  - [ ] Find INITIATED payment in frontend
  - [ ] Click "Verify with Paystack"
  - [ ] Check backend logs for: "Admin notifications sent after manual verification"
  - [ ] Verify notifications appear in frontend immediately
  - [ ] Verify emails are sent to admins

### 6.2 Payment Endpoint Testing

- [ ] **Get Paystack Payments:**
  - [ ] `GET /api/v1/payments?provider=PAYSTACK&status=INITIATED` returns INITIATED payments
  - [ ] `GET /api/v1/payments?provider=PAYSTACK&status=CONFIRMED` returns CONFIRMED payments
  - [ ] Response includes `verificationData` for verified payments
  - [ ] Response includes `payerPhone` for Paystack payments

- [ ] **Get Payment by Booking:**
  - [ ] `GET /api/v1/payments/booking/{bookingId}` returns payment for booking
  - [ ] Returns null/404 if no payment exists

- [ ] **Verify Payment:**
  - [ ] `GET /api/v1/payments/verify/paystack/{reference}` verifies payment
  - [ ] Updates payment status to CONFIRMED
  - [ ] Updates booking status to PENDING_APPROVAL
  - [ ] Creates notifications
  - [ ] Sends emails

### 6.3 Integration Testing

- [ ] **Complete Flow:**
  - [ ] Student makes payment → Payment appears in admin panel
  - [ ] Admin verifies payment → Notifications appear
  - [ ] Admin approves payment → Booking status updates
  - [ ] Admin assigns room → Booking completes

---

## 📝 Part 7: Common Issues & Solutions

### Issue 1: Notifications Not Appearing

**Possible Causes:**
- ❌ Notifications not created when payment is verified
- ❌ Admin not assigned to hostel
- ❌ Invalid admin email addresses
- ❌ Notification endpoint returning wrong format

**Solution:**
- ✅ Ensure notifications are created in BOTH webhook and manual verification flows
- ✅ Verify admin-hostel assignments
- ✅ Check notification creation logs
- ✅ Verify notification endpoint response format

### Issue 2: Payment Status Not Updating

**Possible Causes:**
- ❌ Webhook not being received
- ❌ Webhook processing failing silently
- ❌ Payment verification endpoint not updating status

**Solution:**
- ✅ Check webhook endpoint configuration
- ✅ Add logging to webhook handler
- ✅ Verify Paystack webhook secret
- ✅ Test manual verification endpoint

### Issue 3: Missing Payment Data

**Possible Causes:**
- ❌ `verificationData` not stored after verification
- ❌ `payerPhone` not captured from Paystack
- ❌ `booking` object not populated in response

**Solution:**
- ✅ Store complete Paystack verification response
- ✅ Extract phone number from Paystack response
- ✅ Include booking details in payment queries

---

## 📞 Part 8: Frontend Contact Points

**If backend needs to verify frontend behavior:**

1. **Payment Store:** `src/stores/usePaymentsStore.ts`
   - Handles all payment API calls
   - Manages payment state

2. **Notification Store:** `src/stores/useNotificationsStore.ts`
   - Handles all notification API calls
   - Manages notification state
   - Polls every 30 seconds

3. **Payment Card Component:** `src/app/dashboard/payments/_components/PaymentNotificationCard.tsx`
   - Displays payment cards
   - Handles verification actions

4. **Notification Components:**
   - `src/app/dashboard/components/layout/header/HeaderRight.tsx` - Notification badge
   - `src/app/dashboard/components/layout/header/NotificationDropdown.tsx` - Notification dropdown
   - `src/app/dashboard/notifications/page.tsx` - Full notifications page

---

## ✅ Summary

**Critical Backend Requirements:**

1. ✅ **Unified `/api/v1/payments` endpoint** with provider and status filters
2. ✅ **Payment verification endpoint** that creates notifications
3. ✅ **Notification creation** when payments are verified (webhook OR manual)
4. ✅ **Email notifications** sent to all admins
5. ✅ **Complete payment data** including `verificationData` and `payerPhone`
6. ✅ **Booking status updates** when payment is verified
7. ✅ **Consistent response formats** across all endpoints

**Frontend is ready and waiting for these backend features!** 🚀

