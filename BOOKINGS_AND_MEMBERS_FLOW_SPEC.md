# Bookings & Members Flow - Comprehensive Backend Integration Specification

## Document Purpose

This document provides a comprehensive specification for the Bookings and Members flows, including all API endpoints, data models, workflows, and frontend requirements. This should be used by the backend team to ensure API compatibility with the frontend implementation.

**Last Updated:** 2025-01-XX  
**Frontend Version:** Next.js 16.0.8  
**Base API URL:** `/api/v1`

---

## Table of Contents

1. [Overview](#overview)
2. [User Profile Requirements](#user-profile-requirements)
3. [Booking Flow](#booking-flow)
4. [Member Flow](#member-flow)
5. [API Endpoints Specification](#api-endpoints-specification)
6. [Data Models](#data-models)
7. [Response Format Standards](#response-format-standards)
8. [Error Handling](#error-handling)
9. [Frontend Implementation Details](#frontend-implementation-details)
10. [Testing Checklist](#testing-checklist)

---

## Overview

### Booking Lifecycle

```
[Create Booking] → [Pending Payment] → [Approve Payment] → [Pending Approval] 
→ [Assign Room] → [Complete Onboarding] → [Member]
```

### Key Concepts

- **Bookings**: Students who have submitted booking requests but haven't completed onboarding
- **Members**: Students who have completed onboarding (have an allocated room and completed the onboarding process)
- **Admin Scoping**: Each admin is assigned to one hostel. All bookings/members are automatically scoped to that admin's hostel.

---

## User Profile Requirements

### Updated User Profile Endpoint

**GET** `/user/profile` or **GET** `/auth/me`

The user profile endpoint **MUST** return the admin's assigned hostels array and school information for the booking creation form.

#### Required Response Format

```json
{
  "id": "admin_001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@hostella.com",
  "phone": "+233244123456",
  "avatar": "https://example.com/avatar.jpg",
  "role": "ADMIN",
  "hostelId": null,  // May be null if admin has multiple hostels
  "mustChangePassword": false,
  "assignedHostels": [  // ← REQUIRED: Array of admin's assigned hostels
    {
      "id": "hostel-id-1",
      "name": "Maple Hostel",
      "location": "Location",
      "campus": "Main Campus",  // ← REQUIRED: Campus information
      "phoneNumber": "+1234567890"
    },
    {
      "id": "hostel-id-2",
      "name": "Oak Residence",
      "location": "Location 2",
      "campus": "North Campus",
      "phoneNumber": "+1234567891"
    }
  ],
  "emailVerified": true,
  "phoneVerified": true,
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

**Note:** If an admin has no assigned hostels, the `assignedHostels` field is **not included** in the response.

#### Alternative Response Formats (Frontend Handles)

The frontend can handle these response formats:
- Direct: `{ id, firstName, ..., assignedHostels: [...] }`
- Wrapped: `{ success: true, data: { id, firstName, ..., assignedHostels: [...] } }`
- Nested: `{ data: { id, firstName, ..., assignedHostels: [...] } }`

#### Login Response Format

**POST** `/auth/login` also includes `assignedHostels`:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin_001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "avatar": null,
      "role": "ADMIN",
      "hostelId": null,
      "mustChangePassword": false,
      "assignedHostels": [
        {
          "id": "hostel-id-1",
          "name": "Hostel Name",
          "location": "Location",
          "campus": "Campus",
          "phoneNumber": "+1234567890"
        }
      ]
    },
    "token": "jwt-token-here"
  }
}
```

#### Why This is Required

When creating a booking, the frontend form:
1. **Shows a dropdown** of hostels from `user.assignedHostels` array
2. **Displays format**: "Hostel Name - Campus" (e.g., "Maple Hostel - Main Campus")
3. **Pre-fills** `school` from `user.school` (disabled/read-only)
4. Admin **selects** which hostel to create the booking for from their assigned hostels

**Backend Action Required:**
- Ensure `/user/profile` and `/auth/login` return `assignedHostels` array for ADMIN and SUPER_ADMIN roles
- Each hostel object must include: `id`, `name`, `location`, `campus`, and optionally `phoneNumber`
- If admin has no assigned hostels, omit the `assignedHostels` field (don't send empty array)
- Ensure `/user/profile` returns `school` (the admin's assigned school)
- The frontend will use `assignedHostels` to populate a dropdown, allowing admin to select which hostel to create bookings for

#### Optional: Get My Assigned Hostels (Full Details)

**GET** `/hostels/my-hostels`

Admins can fetch their assigned hostels with full details (optional endpoint for additional hostel information).

**Auth:** Required (ADMIN or SUPER_ADMIN)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "hostels": [
      {
        "id": "hostel-id",
        "name": "Hostel Name",
        "location": "Location",
        "campus": "Campus",
        "phoneNumber": "+1234567890",
        "noOfFloors": "5",
        "totalRooms": 100,
        "singleRooms": 50,
        "doubleRooms": 50,
        "facilities": ["WiFi", "Laundry", "Security"],
        "admins": [...],
        "rooms": [...],
        "images": [...],
        "_count": {
          "rooms": 100
        },
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Note:** This endpoint is optional. The frontend primarily uses `assignedHostels` from the user profile for the booking form dropdown. This endpoint can be used if additional hostel details are needed elsewhere in the application.

---

## Booking Flow

### 1. Create Booking

**Frontend Behavior:**
- Admin clicks "Add New Booking" button
- Frontend fetches user profile (which includes `assignedHostels` array)
- Form opens with:
  - **Hostel dropdown**: Shows all hostels from `user.assignedHostels` (format: "Hostel Name - Campus")
  - **School field**: Pre-filled from `user.school` (disabled/read-only)
- Admin selects a hostel from the dropdown (from their assigned hostels)
- Admin fills in remaining student details
- Form submits booking data with selected `hostelName`

**Backend Requirements:**
- `hostelName` is sent in the request and should be validated against the admin's `assignedHostels`
- Backend should validate that the `hostelName` matches one of the hostels in the admin's `assignedHostels` array
- Backend should auto-scope the booking to the selected hostel (using the hostel's `id` from `assignedHostels`)
- Backend should ignore any `hostelId` sent in the request body
- Backend should use the authenticated admin's token to determine which hostels the admin can create bookings for

### 2. Booking Status Flow

```
pending payment → (Approve Payment) → pending approval → (Assign Room) → approved → (Complete Onboarding) → Member
```

### 3. Booking Actions

1. **Approve Payment**: Changes status from `pending payment` to `pending approval`
2. **Assign Room**: Assigns a room number (required before completing onboarding)
3. **Complete Onboarding**: Moves booking to members (requires `allocatedRoomNumber`)
4. **Update Booking**: Update any booking fields
5. **Delete Booking**: Remove a booking

---

## Member Flow

### 1. Member Creation

Members are created when:
- A booking with `allocatedRoomNumber` has `completeOnboarding` called
- The booking is moved from the bookings list to the members list
- The booking data is preserved (same structure as `StudentBooking`)

### 2. Member Management

- Members can be viewed, updated, and deleted
- Members are essentially "completed bookings" with room assignments
- Members list is separate from bookings list

---

## API Endpoints Specification

### Bookings Endpoints

#### 1. List Bookings (Paginated)

**GET** `/bookings?page=1&pageSize=10&search=&status=all&gender=all&roomType=all`

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `pageSize` (integer, default: 10, max: 100): Items per page
- `search` (string, optional): Search by email, name, booking ID, or student ID
- `status` (string, optional): Filter by status - `pending payment`, `pending approval`, `approved`, or `all`
- `gender` (string, optional): Filter by gender - `male`, `female`, or `all`
- `roomType` (string, optional): Filter by room type - `One-in-one`, `Two-in-one`, or `all`

**Expected Response Format (PREFERRED):**
```json
{
  "success": true,
  "data": [
    {
      "id": "booking_001",
      "bookingId": "BK-1001",
      "email": "jane.doe@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "gender": "female",
      "level": "200",
      "school": "KNUST",
      "studentId": "KNUST12345",
      "phone": "0244123456",
      "admissionLetterName": "admission-jane.pdf",
      "hostelName": "Maple Hostel",
      "roomTitle": "One-in-one",
      "price": "400",
      "emergencyContactName": "John Doe",
      "emergencyContactNumber": "0201234567",
      "relation": "Father",
      "hasMedicalCondition": false,
      "medicalCondition": null,
      "status": "pending payment",
      "allocatedRoomNumber": null,
      "date": "2025-11-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Alternative Formats (Frontend Handles):**
- `{ bookings: [...], total, page, pageSize }` (old format)
- Direct array `[...]` (fallback)

**Backend Requirements:**
- Automatically filter by admin's assigned hostel (don't require `hostelId` in query)
- Only return bookings for the authenticated admin's hostel
- Support all filter parameters
- Return pagination metadata

---

#### 2. Get Booking Detail

**GET** `/bookings/{id}`

**Path Parameters:**
- `id` (string): Booking ID

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "booking_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": false,
    "medicalCondition": null,
    "status": "pending payment",
    "allocatedRoomNumber": null,
    "date": "2025-11-10T00:00:00Z"
  }
}
```

**Error Responses:**
- `404`: Booking not found
- `403`: Booking belongs to different hostel (admin can't access)

---

#### 3. Create Booking

**POST** `/bookings`

**Request Body:**
```json
{
  "email": "jane.doe@example.com",
  "firstName": "Jane",
  "lastName": "Doe",
  "gender": "female",
  "level": "200",
  "school": "KNUST",
  "studentId": "KNUST12345",
  "phone": "0244123456",
  "admissionLetterName": "admission-jane.pdf",
  "hostelName": "Maple Hostel",
  "roomTitle": "One-in-one",
  "price": "400",
  "emergencyContactName": "John Doe",
  "emergencyContactNumber": "0201234567",
  "relation": "Father",
  "hasMedicalCondition": false,
  "medicalCondition": null,
  "status": "pending payment",
  "date": "2025-11-10T00:00:00Z"
}
```

**Important Notes:**
- `hostelName` and `school` are sent but should be validated against the admin's assigned values
- Backend should **validate** that `hostelName` matches one of the hostels in the admin's `assignedHostels` array
- Backend should **auto-scope** the booking to the selected hostel (determine `hostelId` from the `hostelName` and admin's `assignedHostels`)
- Backend should **ignore** any `hostelId` sent in the request body
- If admin has only one assigned hostel, frontend may pre-select it, but admin can still change it
- If admin has multiple assigned hostels, admin must select one from the dropdown
- `date` is optional (defaults to current date if not provided)

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "booking_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": false,
    "medicalCondition": null,
    "status": "pending payment",
    "allocatedRoomNumber": null,
    "date": "2025-11-10T00:00:00Z"
  },
  "message": "Booking created successfully"
}
```

**Error Responses:**
- `400`: Validation error (missing required fields, invalid data)
- `409`: Duplicate booking (same email/studentId already exists)

**Validation Rules:**
- All fields except `admissionLetterName`, `medicalCondition`, `allocatedRoomNumber`, and `date` are required
- `email` must be valid email format
- `phone` must be 10-15 digits
- `gender` must be `male` or `female`
- `level` must be `100`, `200`, `300`, or `400`
- `roomTitle` must be `One-in-one` or `Two-in-one`
- `status` must be `pending payment`, `pending approval`, or `approved`

---

#### 4. Update Booking

**PATCH** `/bookings/{id}`

**Path Parameters:**
- `id` (string): Booking ID

**Request Body (Partial - only fields to update):**
```json
{
  "status": "pending approval",
  "allocatedRoomNumber": 5,
  "hasMedicalCondition": true,
  "medicalCondition": "Asthma"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "booking_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": true,
    "medicalCondition": "Asthma",
    "status": "pending approval",
    "allocatedRoomNumber": 5,
    "date": "2025-11-10T00:00:00Z"
  },
  "message": "Booking updated successfully"
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Booking not found
- `403`: Booking belongs to different hostel

---

#### 5. Approve Payment

**POST** `/bookings/{id}/approve-payment`

**Path Parameters:**
- `id` (string): Booking ID

**Action:**
- Changes booking status from `pending payment` to `pending approval`
- No request body required

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "booking_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": false,
    "medicalCondition": null,
    "status": "pending approval",
    "allocatedRoomNumber": null,
    "date": "2025-11-10T00:00:00Z"
  },
  "message": "Payment approved successfully"
}
```

**Error Responses:**
- `400`: Booking is not in `pending payment` status
- `404`: Booking not found
- `403`: Booking belongs to different hostel

---

#### 6. Assign Room

**PATCH** `/bookings/{id}/assign-room`

**Path Parameters:**
- `id` (string): Booking ID

**Request Body:**
```json
{
  "roomNumber": 205
}
```

**Action:**
- Assigns a room number to the booking
- Updates `allocatedRoomNumber` field
- Room number must be available and match the booking's `roomTitle` (gender compatibility)

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "booking_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": false,
    "medicalCondition": null,
    "status": "pending approval",
    "allocatedRoomNumber": 205,
    "date": "2025-11-10T00:00:00Z"
  },
  "message": "Room assigned successfully"
}
```

**Error Responses:**
- `400`: Room not available, room doesn't match room type, or invalid room number
- `404`: Booking not found
- `403`: Booking belongs to different hostel

---

#### 7. Complete Onboarding

**POST** `/bookings/{id}/complete-onboarding`

**Path Parameters:**
- `id` (string): Booking ID

**Action:**
- Moves booking from bookings list to members list
- Requires `allocatedRoomNumber` to be set
- Booking is removed from bookings and added to members

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Onboarding completed successfully"
  }
}
```

**Error Responses:**
- `400`: `allocatedRoomNumber` is null or not set
- `404`: Booking not found
- `403`: Booking belongs to different hostel

**Frontend Behavior:**
- After successful completion, the booking is removed from the bookings list
- The booking data is now available in the members list
- Frontend automatically refreshes both lists

---

#### 8. Delete Booking

**DELETE** `/bookings/{id}`

**Path Parameters:**
- `id` (string): Booking ID

**Action:**
- Permanently deletes the booking
- Cannot be undone

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Booking deleted successfully"
  }
}
```

**Error Responses:**
- `404`: Booking not found
- `403`: Booking belongs to different hostel
- `409`: Cannot delete booking (e.g., if already a member)

---

### Members Endpoints

#### 1. List Members (Paginated)

**GET** `/members?page=1&pageSize=10&search=&status=all`

**Query Parameters:**
- `page` (integer, default: 1): Page number
- `pageSize` (integer, default: 10, max: 100): Items per page
- `search` (string, optional): Search by email, name, booking ID, or student ID
- `status` (string, optional): Filter by status (if applicable) or `all`

**Expected Response Format (PREFERRED):**
```json
{
  "success": true,
  "data": [
    {
      "id": "member_001",
      "bookingId": "BK-1001",
      "email": "jane.doe@example.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "gender": "female",
      "level": "200",
      "school": "KNUST",
      "studentId": "KNUST12345",
      "phone": "0244123456",
      "admissionLetterName": "admission-jane.pdf",
      "hostelName": "Maple Hostel",
      "roomTitle": "One-in-one",
      "price": "400",
      "emergencyContactName": "John Doe",
      "emergencyContactNumber": "0201234567",
      "relation": "Father",
      "hasMedicalCondition": false,
      "medicalCondition": null,
      "status": "approved",
      "allocatedRoomNumber": 205,
      "date": "2025-11-10T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

**Alternative Formats (Frontend Handles):**
- `{ members: [...], total, page, pageSize }` (old format)
- Direct array `[...]` (fallback)

**Backend Requirements:**
- Automatically filter by admin's assigned hostel
- Only return members for the authenticated admin's hostel
- Members must have `allocatedRoomNumber` set (completed onboarding)
- Support search and status filtering

---

#### 2. Get Member Detail

**GET** `/members/{id}`

**Path Parameters:**
- `id` (string): Member ID (same as booking ID)

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "member_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244123456",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": false,
    "medicalCondition": null,
    "status": "approved",
    "allocatedRoomNumber": 205,
    "date": "2025-11-10T00:00:00Z"
  }
}
```

**Error Responses:**
- `404`: Member not found
- `403`: Member belongs to different hostel

---

#### 3. Update Member

**PATCH** `/members/{id}`

**Path Parameters:**
- `id` (string): Member ID

**Request Body (Partial - only fields to update):**
```json
{
  "phone": "0244999999",
  "hasMedicalCondition": true,
  "medicalCondition": "Diabetes"
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "member_001",
    "bookingId": "BK-1001",
    "email": "jane.doe@example.com",
    "firstName": "Jane",
    "lastName": "Doe",
    "gender": "female",
    "level": "200",
    "school": "KNUST",
    "studentId": "KNUST12345",
    "phone": "0244999999",
    "admissionLetterName": "admission-jane.pdf",
    "hostelName": "Maple Hostel",
    "roomTitle": "One-in-one",
    "price": "400",
    "emergencyContactName": "John Doe",
    "emergencyContactNumber": "0201234567",
    "relation": "Father",
    "hasMedicalCondition": true,
    "medicalCondition": "Diabetes",
    "status": "approved",
    "allocatedRoomNumber": 205,
    "date": "2025-11-10T00:00:00Z"
  },
  "message": "Member updated successfully"
}
```

**Error Responses:**
- `400`: Validation error
- `404`: Member not found
- `403`: Member belongs to different hostel

**Note:** Some fields may be restricted from updates (e.g., `hostelName`, `school`, `allocatedRoomNumber`)

---

#### 4. Delete Member

**DELETE** `/members/{id}`

**Path Parameters:**
- `id` (string): Member ID

**Action:**
- Permanently deletes the member record
- Cannot be undone

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Member deleted successfully"
  }
}
```

**Error Responses:**
- `404`: Member not found
- `403`: Member belongs to different hostel

---

## Data Models

### StudentBooking Interface

```typescript
interface StudentBooking {
  id: string;                    // Internal unique ID
  bookingId?: string;            // Human-readable booking ID (e.g., "BK-1001")
  email: string;                 // Student email (required, unique per hostel)
  firstName: string;             // Student first name (required)
  lastName: string;              // Student last name (required)
  gender: "male" | "female";     // Student gender (required)
  level: "100" | "200" | "300" | "400";  // Academic level (required)
  school: string;                // School name (required, e.g., "KNUST")
  studentId: string;             // Student ID from school (required, unique per school)
  phone: string;                 // Phone number (required, 10-15 digits)
  admissionLetterName?: string;  // Admission letter filename (optional)
  hostelName: string;            // Hostel name (required, auto-filled from admin)
  roomTitle: "One-in-one" | "Two-in-one";  // Room type (required)
  price: string;                 // Room price (required, as string)
  emergencyContactName: string;  // Emergency contact name (required)
  emergencyContactNumber: string; // Emergency contact phone (required)
  relation: string;              // Relationship to student (required)
  hasMedicalCondition: boolean;  // Has medical condition flag (required)
  medicalCondition?: string;     // Medical condition details (optional, required if hasMedicalCondition is true)
  status: "pending payment" | "pending approval" | "approved";  // Booking status (required)
  allocatedRoomNumber?: number | null;  // Assigned room number (null until assigned)
  date?: string;                 // Booking/created date (ISO date string, optional)
}
```

### Field Requirements

**Required Fields (Create Booking):**
- `email`, `firstName`, `lastName`, `gender`, `level`, `school`, `studentId`, `phone`
- `hostelName`, `roomTitle`, `price`
- `emergencyContactName`, `emergencyContactNumber`, `relation`
- `hasMedicalCondition`, `status`

**Optional Fields:**
- `admissionLetterName`, `medicalCondition`, `allocatedRoomNumber`, `date`, `bookingId`

**Auto-Generated Fields:**
- `id`: Generated by backend
- `bookingId`: Generated by backend (format: "BK-XXXX")
- `date`: Defaults to current date if not provided

---

## Response Format Standards

### Standard Success Response

All successful API responses should follow this format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "pagination": { /* pagination metadata, if applicable */ },
  "message": "Optional success message"
}
```

### Pagination Metadata

When pagination is applicable:

```json
{
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### List Responses

For list endpoints (GET `/bookings`, GET `/members`):

```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

### Single Item Responses

For single item endpoints (GET `/bookings/{id}`, POST `/bookings`, etc.):

```json
{
  "success": true,
  "data": { /* single item */ },
  "message": "Optional success message"
}
```

### Action Responses

For action endpoints (POST `/bookings/{id}/approve-payment`, etc.):

```json
{
  "success": true,
  "data": { /* updated item */ },
  "message": "Action completed successfully"
}
```

---

## Error Handling

### Standard Error Response

All error responses should follow this format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong",
  "error": "Optional detailed error information"
}
```

### HTTP Status Codes

- `200 OK`: Successful GET, PATCH, DELETE requests
- `201 Created`: Successful POST requests (create)
- `400 Bad Request`: Validation errors, invalid data
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: User doesn't have permission (e.g., accessing other hostel's data)
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate entry, constraint violation
- `500 Internal Server Error`: Server errors

### Common Error Scenarios

#### Validation Errors (400)

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "email": "Invalid email format",
    "phone": "Phone number must be 10-15 digits"
  }
}
```

#### Not Found (404)

```json
{
  "success": false,
  "message": "Booking not found"
}
```

#### Forbidden (403)

```json
{
  "success": false,
  "message": "You don't have permission to access this booking"
}
```

#### Conflict (409)

```json
{
  "success": false,
  "message": "A booking with this email already exists"
}
```

---

## Frontend Implementation Details

### Response Format Handling

The frontend is designed to handle multiple response formats for backward compatibility:

1. **Preferred Format:**
   ```json
   { "success": true, "data": [...], "pagination": {...} }
   ```

2. **Legacy Format:**
   ```json
   { "bookings": [...], "total": 150, "page": 1, "pageSize": 10 }
   ```

3. **Direct Array (Fallback):**
   ```json
   [...]
   ```

The frontend automatically detects and parses all these formats.

### Admin Scoping

**Important:** The backend should automatically scope all bookings and members to the authenticated admin's assigned hostel. The frontend does NOT send `hostelId` in requests - the backend should determine this from the authentication token.

### Booking Creation Flow

1. User opens "Add New Booking" dialog
2. Frontend fetches user profile (`/user/profile`)
3. Form pre-fills:
   - `hostelName` from `user.hostelName` (disabled)
   - `school` from `user.school` (disabled)
4. User fills in remaining fields
5. Form submits to `POST /bookings`
6. Backend validates `hostelName` matches admin's assigned hostel
7. Backend auto-scopes booking to admin's hostel
8. Success response returns created booking

### Complete Onboarding Flow

1. Booking must have `allocatedRoomNumber` set
2. Frontend calls `POST /bookings/{id}/complete-onboarding`
3. Backend:
   - Validates `allocatedRoomNumber` is set
   - Moves booking to members table/collection
   - Removes booking from bookings list
4. Frontend refreshes both bookings and members lists

### Filtering Behavior

**Bookings Filters:**
- `status`: Only include if not `"all"`
- `gender`: Only include if not `"all"`
- `roomType`: Only include if not `"all"`
- `search`: Only include if not empty

**Members Filters:**
- `status`: Only include if not `"all"`
- `search`: Only include if not empty

---

## Testing Checklist

### Booking Endpoints

- [ ] **List Bookings**
  - [ ] Returns paginated list with correct format
  - [ ] Filters by admin's hostel automatically
  - [ ] Supports all query parameters (search, status, gender, roomType)
  - [ ] Returns correct pagination metadata
  - [ ] Handles empty results gracefully

- [ ] **Get Booking**
  - [ ] Returns single booking with all fields
  - [ ] Returns 404 for non-existent booking
  - [ ] Returns 403 for booking from different hostel

- [ ] **Create Booking**
  - [ ] Creates booking with all required fields
  - [ ] Auto-scopes to admin's hostel
  - [ ] Validates `hostelName` matches admin's assigned hostel
  - [ ] Generates `bookingId` automatically
  - [ ] Returns 400 for validation errors
  - [ ] Returns 409 for duplicate email/studentId

- [ ] **Update Booking**
  - [ ] Updates specified fields only
  - [ ] Returns updated booking
  - [ ] Validates updated data
  - [ ] Returns 404 for non-existent booking

- [ ] **Approve Payment**
  - [ ] Changes status from `pending payment` to `pending approval`
  - [ ] Returns 400 if status is not `pending payment`
  - [ ] Returns updated booking

- [ ] **Assign Room**
  - [ ] Assigns room number to booking
  - [ ] Validates room availability
  - [ ] Validates room matches room type
  - [ ] Returns 400 if room not available
  - [ ] Returns updated booking with `allocatedRoomNumber`

- [ ] **Complete Onboarding**
  - [ ] Requires `allocatedRoomNumber` to be set
  - [ ] Moves booking to members
  - [ ] Removes booking from bookings list
  - [ ] Returns 400 if `allocatedRoomNumber` is null
  - [ ] Returns success message

- [ ] **Delete Booking**
  - [ ] Permanently deletes booking
  - [ ] Returns 404 for non-existent booking
  - [ ] Returns 403 for booking from different hostel

### Member Endpoints

- [ ] **List Members**
  - [ ] Returns paginated list with correct format
  - [ ] Filters by admin's hostel automatically
  - [ ] Only returns members with `allocatedRoomNumber` set
  - [ ] Supports search and status filters
  - [ ] Returns correct pagination metadata

- [ ] **Get Member**
  - [ ] Returns single member with all fields
  - [ ] Returns 404 for non-existent member
  - [ ] Returns 403 for member from different hostel

- [ ] **Update Member**
  - [ ] Updates specified fields only
  - [ ] Prevents updating restricted fields (if applicable)
  - [ ] Returns updated member
  - [ ] Returns 404 for non-existent member

- [ ] **Delete Member**
  - [ ] Permanently deletes member
  - [ ] Returns 404 for non-existent member
  - [ ] Returns 403 for member from different hostel

### User Profile

- [ ] **Get Profile**
  - [ ] Returns user profile with `hostelId`, `hostelName`, and `school`
  - [ ] `hostelId` is the admin's assigned hostel ID
  - [ ] `hostelName` is fetched from the hostel database using `hostelId`
  - [ ] `hostelName` matches the hostel associated with `hostelId`
  - [ ] `school` matches admin's assigned school
  - [ ] Returns 401 if not authenticated

### Response Formats

- [ ] All endpoints return `{ success: true, data: {...} }` format
- [ ] List endpoints include `pagination` metadata
- [ ] Error responses return `{ success: false, message: "..." }` format
- [ ] All responses are consistent across endpoints

---

## Summary of Critical Requirements

### 1. User Profile Must Include
- ✅ `hostelId`: Admin's assigned hostel ID (required for scoping)
- ✅ `hostelName`: Hostel name fetched from the `hostelId` (required for form pre-fill)
- ✅ `school`: Admin's assigned school (required for form pre-fill)

### 2. Booking Creation
- ✅ `hostelName` is selected by admin from their `assignedHostels` dropdown
- ✅ `school` is pre-filled and disabled (from admin's assigned school)
- ✅ Backend validates `hostelName` matches one of the hostels in admin's `assignedHostels` array
- ✅ Backend auto-scopes booking to the selected hostel (determines `hostelId` from `hostelName`)
- ✅ Backend ignores any `hostelId` sent in request body
- ✅ Admin can select from multiple assigned hostels if they have more than one

### 3. Response Formats
- ✅ All responses use `{ success: true, data: {...} }` format
- ✅ List responses include `pagination` metadata
- ✅ Error responses use `{ success: false, message: "..." }` format

### 4. Admin Scoping
- ✅ All bookings/members automatically filtered by admin's assigned hostels (from `assignedHostels` array)
- ✅ Admin can create bookings for any of their assigned hostels
- ✅ Admin can view bookings/members from all their assigned hostels
- ✅ No `hostelId` required in queries (backend uses `assignedHostels` from auth token)
- ✅ 403 Forbidden if admin tries to access data from a hostel not in their `assignedHostels`

### 5. Complete Onboarding
- ✅ Requires `allocatedRoomNumber` to be set
- ✅ Moves booking to members
- ✅ Removes booking from bookings list

---

## Questions for Backend Team

1. **Hostel Information**: 
   - Should `hostelName` be included in the user profile response, or should the frontend fetch it separately using `hostelId`?
   - Is there a `/hostels/{id}` endpoint to fetch hostel details?
   - **Preferred**: Include `hostelName` in user profile response (populated from `hostelId`)

2. **Schools List**: Should schools be fetched from an API endpoint, or is the static list in the frontend sufficient?

3. **Room Assignment Validation**: What are the exact rules for room assignment?
   - Gender compatibility?
   - Room type matching?
   - Availability checks?

4. **Member Updates**: Are there any fields that should be restricted from updates in the members endpoint?

5. **Booking Deletion**: Can bookings be deleted at any status, or are there restrictions (e.g., cannot delete if already a member)?

6. **Duplicate Prevention**: How should duplicate bookings be handled?
   - Same email?
   - Same studentId?
   - Same email + hostel combination?

7. **Hostel Scoping**: 
   - ✅ **RESOLVED**: Admin's `assignedHostels` array is included in login/profile responses
   - ✅ Backend should use the `assignedHostels` from the authentication token/user profile
   - ✅ Admin can create bookings for any hostel in their `assignedHostels` array
   - ✅ Backend should validate that `hostelName` in booking request matches one of the hostels in admin's `assignedHostels`
   - ✅ All booking/member queries should filter by the admin's `assignedHostels` (all hostels they have access to)

---

## Contact & Support

For questions or clarifications regarding this specification, please refer to:
- Frontend codebase: `src/stores/useBookingsStore.ts` and `src/stores/useMembersStore.ts`
- API integration: `src/lib/api.ts`
- Type definitions: `src/types/booking.ts`

---

**End of Document**
