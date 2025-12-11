# Hostella Admin - Frontend API Documentation

## Overview

This document outlines all API endpoints required by the Hostella Admin frontend application. The frontend is built with Next.js and uses Zustand for state management, with all data fetched from the backend API.

**Base URL:** `https://www.example.railway`  
**Authentication:** Bearer token in `Authorization` header  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Bookings Endpoints](#bookings-endpoints)
3. [Members Endpoints](#members-endpoints)
4. [Broadcast Messaging Endpoints](#broadcast-messaging-endpoints)
5. [Chat Endpoints](#chat-endpoints)
6. [Notifications Endpoints](#notifications-endpoints)
7. [Error Handling](#error-handling)
8. [Response Formats](#response-formats)

---

## Authentication Endpoints

### Login
**POST** `/auth/login`

Authenticates an admin user and returns a JWT token.

#### Request Body
```json
{
  "email": "admin@hostella.com",
  "password": "securePassword123"
}
```

#### Success Response (200 OK)
```json
{
  "user": {
    "id": "admin_001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "admin@hostella.com",
    "phone": "+233244123456",
    "avatar": "https://example.com/avatar.jpg"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Error Response (401 Unauthorized)
```json
{
  "message": "Invalid credentials"
}
```

---

### Get Current User
**GET** `/auth/me`

Retrieves the authenticated user's profile. Requires valid Bearer token.

#### Headers
```
Authorization: Bearer <token>
```

#### Success Response (200 OK)
```json
{
  "id": "admin_001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@hostella.com",
  "phone": "+233244123456",
  "avatar": "https://example.com/avatar.jpg"
}
```

#### Error Response (401 Unauthorized)
```json
{
  "message": "Unauthorized - Token invalid or expired"
}
```

---

### Update Profile
**PUT** `/auth/profile`

Updates the authenticated user's profile information.

#### Request Body
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+233244123456",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### Success Response (200 OK)
```json
{
  "id": "admin_001",
  "firstName": "John",
  "lastName": "Doe",
  "email": "admin@hostella.com",
  "phone": "+233244123456",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

---

### Change Password
**POST** `/auth/password`

Changes the authenticated user's password.

#### Request Body
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Password updated successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Current password is incorrect"
}
```

---

## Bookings Endpoints

### List Bookings (Paginated)
**GET** `/bookings?page=1&pageSize=10&search=&status=all&gender=all&roomType=all`

Retrieves a paginated list of student bookings with optional filtering.

#### Query Parameters
- `page` (integer): Page number (default: 1)
- `pageSize` (integer): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by email, name, or student ID
- `status` (string, optional): Filter by status - `pending payment`, `pending approval`, `approved`, `all`
- `gender` (string, optional): Filter by gender - `male`, `female`, `all`
- `roomType` (string, optional): Filter by room type - `One-in-one`, `Two-in-one`, `all`

#### Success Response (200 OK)
```json
{
  "bookings": [
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
  "total": 150,
  "page": 1,
  "pageSize": 10
}
```

---

### Get Booking Detail
**GET** `/bookings/{id}`

Retrieves detailed information for a specific booking.

#### Path Parameters
- `id` (string): Booking ID

#### Success Response (200 OK)
```json
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
```

---

### Create Booking
**POST** `/bookings`

Creates a new student booking.

#### Request Body
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
  "status": "pending payment"
}
```

#### Success Response (201 Created)
```json
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
```

---

### Update Booking
**PATCH** `/bookings/{id}`

Updates specific fields of a booking.

#### Path Parameters
- `id` (string): Booking ID

#### Request Body (Partial)
```json
{
  "status": "pending approval",
  "allocatedRoomNumber": 5,
  "hasMedicalCondition": true,
  "medicalCondition": "Asthma"
}
```

#### Success Response (200 OK)
```json
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
  "hasMedicalCondition": true,
  "medicalCondition": "Asthma",
  "status": "pending approval",
  "allocatedRoomNumber": 5,
  "date": "2025-11-10T00:00:00Z"
}
```

---

### Approve Payment
**POST** `/bookings/{id}/approve-payment`

Marks a booking's payment as approved, changing status from `pending payment` to `pending approval`.

#### Path Parameters
- `id` (string): Booking ID

#### Success Response (200 OK)
```json
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
  "status": "pending approval",
  "allocatedRoomNumber": null,
  "date": "2025-11-10T00:00:00Z"
}
```

---

### Assign Room
**POST** `/bookings/{id}/assign-room`

Assigns a room number to a booking.

#### Path Parameters
- `id` (string): Booking ID

#### Request Body
```json
{
  "roomNumber": 205
}
```

#### Success Response (200 OK)
```json
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
  "status": "pending approval",
  "allocatedRoomNumber": 205,
  "date": "2025-11-10T00:00:00Z"
}
```

---

### Complete Onboarding
**POST** `/bookings/{id}/complete-onboarding`

Moves a booking to members (completes onboarding). Booking must have an allocated room number.

#### Path Parameters
- `id` (string): Booking ID

#### Success Response (200 OK)
```json
{
  "message": "Onboarding completed successfully"
}
```

#### Error Response (400 Bad Request)
```json
{
  "message": "Cannot complete onboarding without an assigned room"
}
```

---

### Delete Booking
**DELETE** `/bookings/{id}`

Deletes a booking record.

#### Path Parameters
- `id` (string): Booking ID

#### Success Response (200 OK)
```json
{
  "message": "Booking deleted successfully"
}
```

---

## Members Endpoints

### List Members (Paginated)
**GET** `/members?page=1&pageSize=10&search=&status=all`

Retrieves a paginated list of hostel members (students who completed onboarding).

#### Query Parameters
- `page` (integer): Page number (default: 1)
- `pageSize` (integer): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by email, name, or student ID
- `status` (string, optional): Filter by status (if applicable)

#### Success Response (200 OK)
```json
{
  "members": [
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
  "total": 150,
  "page": 1,
  "pageSize": 10
}
```

---

### Get Member Detail
**GET** `/members/{id}`

Retrieves detailed information for a specific member.

#### Path Parameters
- `id` (string): Member ID

#### Success Response (200 OK)
```json
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
```

---

### Update Member
**PATCH** `/members/{id}`

Updates specific fields of a member.

#### Path Parameters
- `id` (string): Member ID

#### Request Body (Partial)
```json
{
  "phone": "+233244999999",
  "hasMedicalCondition": true,
  "medicalCondition": "Diabetes"
}
```

#### Success Response (200 OK)
```json
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
  "phone": "+233244999999",
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
}
```

---

### Delete Member
**DELETE** `/members/{id}`

Removes a member from the hostel.

#### Path Parameters
- `id` (string): Member ID

#### Success Response (200 OK)
```json
{
  "message": "Member deleted successfully"
}
```

---

## Broadcast Messaging Endpoints

### List Broadcast Messages (Paginated)
**GET** `/broadcast/messages?page=1&pageSize=10&search=&status=all&priority=all`

Retrieves a paginated list of broadcast messages.

#### Query Parameters
- `page` (integer): Page number (default: 1)
- `pageSize` (integer): Items per page (default: 10, max: 100)
- `search` (string, optional): Search by title or content
- `status` (string, optional): Filter by status - `draft`, `sent`, `scheduled`, `failed`, `all`
- `priority` (string, optional): Filter by priority - `low`, `medium`, `high`, `urgent`, `all`

#### Success Response (200 OK)
```json
{
  "messages": [
    {
      "id": "msg_001",
      "title": "Maintenance Schedule Update",
      "content": "Water supply maintenance will be conducted on December 10th from 2 AM to 6 AM.",
      "recipientType": "all-residents",
      "recipients": [],
      "recipientCount": 150,
      "priority": "high",
      "status": "sent",
      "createdAt": "2025-12-08T10:00:00Z",
      "updatedAt": "2025-12-08T10:00:00Z",
      "sentAt": "2025-12-08T10:05:00Z",
      "scheduledFor": null,
      "attachments": [],
      "tags": ["maintenance", "water"],
      "messageTemplate": null,
      "readCount": 132,
      "failedCount": 0
    }
  ],
  "total": 45,
  "page": 1,
  "pageSize": 10
}
```

---

### Create Broadcast Message
**POST** `/broadcast/messages`

Creates and optionally sends a broadcast message.

#### Request Body
```json
{
  "title": "Maintenance Schedule Update",
  "content": "Water supply maintenance will be conducted on December 10th from 2 AM to 6 AM.",
  "recipientType": "all-residents",
  "selectedRecipients": [],
  "priority": "high",
  "scheduledFor": null
}
```

**Note:** If `scheduledFor` is null or empty, message is sent immediately and status is `sent`. If `scheduledFor` contains a valid ISO datetime, status is `scheduled`.

#### Success Response (201 Created)
```json
{
  "id": "msg_001",
  "title": "Maintenance Schedule Update",
  "content": "Water supply maintenance will be conducted on December 10th from 2 AM to 6 AM.",
  "recipientType": "all-residents",
  "recipients": [],
  "recipientCount": 150,
  "priority": "high",
  "status": "sent",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:00:00Z",
  "sentAt": "2025-12-08T10:05:00Z",
  "scheduledFor": null,
  "attachments": [],
  "tags": [],
  "messageTemplate": null,
  "readCount": 0,
  "failedCount": 0
}
```

---

### Update Message
**PATCH** `/broadcast/messages/{id}`

Updates a draft or scheduled message.

#### Path Parameters
- `id` (string): Message ID

#### Request Body (Partial)
```json
{
  "title": "Updated Title",
  "content": "Updated content",
  "priority": "medium",
  "scheduledFor": "2025-12-15T14:00:00Z"
}
```

#### Success Response (200 OK)
```json
{
  "id": "msg_001",
  "title": "Updated Title",
  "content": "Updated content",
  "recipientType": "all-residents",
  "recipients": [],
  "recipientCount": 150,
  "priority": "medium",
  "status": "scheduled",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T10:10:00Z",
  "sentAt": null,
  "scheduledFor": "2025-12-15T14:00:00Z",
  "attachments": [],
  "tags": [],
  "messageTemplate": null,
  "readCount": 0,
  "failedCount": 0
}
```

---

### Delete Message
**DELETE** `/broadcast/messages/{id}`

Deletes a message (draft, scheduled, or sent).

#### Path Parameters
- `id` (string): Message ID

#### Success Response (200 OK)
```json
{
  "message": "Message deleted successfully"
}
```

---

### Resend Message
**POST** `/broadcast/messages/{id}/resend`

Resends a previously sent message to all recipients.

#### Path Parameters
- `id` (string): Message ID

#### Success Response (200 OK)
```json
{
  "id": "msg_001",
  "title": "Maintenance Schedule Update",
  "content": "Water supply maintenance will be conducted on December 10th from 2 AM to 6 AM.",
  "recipientType": "all-residents",
  "recipients": [],
  "recipientCount": 150,
  "priority": "high",
  "status": "sent",
  "createdAt": "2025-12-08T10:00:00Z",
  "updatedAt": "2025-12-08T11:00:00Z",
  "sentAt": "2025-12-08T11:00:00Z",
  "scheduledFor": null,
  "attachments": [],
  "tags": ["maintenance", "water"],
  "messageTemplate": null,
  "readCount": 145,
  "failedCount": 5
}
```

---

## Chat Endpoints

### Get Chats List
**GET** `/chat/conversations`

Retrieves list of chat conversations for the current admin user.

#### Query Parameters
- `limit` (integer, optional): Number of conversations (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)

#### Success Response (200 OK)
```json
{
  "conversations": [
    {
      "id": "chat_001",
      "name": "Rahul Sharma",
      "avatar": "RS",
      "online": true,
      "roomInfo": "3-bed dorm - Room 205",
      "lastMessage": "Thanks for the update!",
      "lastMessageTime": "2025-12-08T15:30:00Z",
      "unreadCount": 2
    }
  ],
  "total": 25
}
```

---

### Get Messages for Conversation
**GET** `/chat/conversations/{conversationId}/messages`

Retrieves all messages in a conversation.

#### Path Parameters
- `conversationId` (string): Conversation ID

#### Query Parameters
- `limit` (integer, optional): Number of messages (default: 50)
- `offset` (integer, optional): Pagination offset (default: 0)

#### Success Response (200 OK)
```json
{
  "messages": [
    {
      "id": "msg_001",
      "conversationId": "chat_001",
      "senderId": "student_001",
      "senderName": "Rahul Sharma",
      "type": "text",
      "content": "Hi Admin, I have a question",
      "createdAt": "2025-12-08T15:20:00Z",
      "replyToId": null,
      "readAt": "2025-12-08T15:21:00Z"
    },
    {
      "id": "msg_002",
      "conversationId": "chat_001",
      "senderId": "admin_001",
      "senderName": "John Admin",
      "type": "text",
      "content": "Hello, how can I help?",
      "createdAt": "2025-12-08T15:21:00Z",
      "replyToId": "msg_001",
      "readAt": null
    }
  ],
  "total": 45
}
```

---

### Send Chat Message
**POST** `/chat/conversations/{conversationId}/messages`

Sends a message in a conversation.

#### Path Parameters
- `conversationId` (string): Conversation ID

#### Request Body
```json
{
  "type": "text",
  "content": "Thank you for reaching out!",
  "replyToId": null
}
```

**Note:** `type` can be `text`, `file`, or `voice`. For `file`, include base64 encoded file. For `voice`, include duration in seconds.

#### Success Response (201 Created)
```json
{
  "id": "msg_003",
  "conversationId": "chat_001",
  "senderId": "admin_001",
  "senderName": "John Admin",
  "type": "text",
  "content": "Thank you for reaching out!",
  "createdAt": "2025-12-08T15:30:00Z",
  "replyToId": null,
  "readAt": null
}
```

---

### Mark Message as Read
**POST** `/chat/conversations/{conversationId}/messages/{messageId}/read`

Marks a message as read.

#### Path Parameters
- `conversationId` (string): Conversation ID
- `messageId` (string): Message ID

#### Success Response (200 OK)
```json
{
  "message": "Message marked as read"
}
```

---

## Notifications Endpoints

### Get Notifications
**GET** `/notifications?limit=20&offset=0&unreadOnly=false`

Retrieves admin notifications.

#### Query Parameters
- `limit` (integer, optional): Number of notifications (default: 20)
- `offset` (integer, optional): Pagination offset (default: 0)
- `unreadOnly` (boolean, optional): Show only unread notifications (default: false)

#### Success Response (200 OK)
```json
{
  "notifications": [
    {
      "id": "notif_001",
      "type": "new_booking",
      "title": "New Booking Submitted",
      "description": "Student John Doe submitted a booking request for Room B-203.",
      "relatedId": "booking_001",
      "read": false,
      "createdAt": "2025-12-08T15:00:00Z"
    }
  ],
  "total": 15,
  "unreadCount": 3
}
```

---

### Mark Notification as Read
**POST** `/notifications/{id}/read`

Marks a notification as read.

#### Path Parameters
- `id` (string): Notification ID

#### Success Response (200 OK)
```json
{
  "message": "Notification marked as read"
}
```

---

### Mark All Notifications as Read
**POST** `/notifications/mark-all-read`

Marks all notifications as read.

#### Success Response (200 OK)
```json
{
  "message": "All notifications marked as read"
}
```

---

### Delete Notification
**DELETE** `/notifications/{id}`

Deletes a notification.

#### Path Parameters
- `id` (string): Notification ID

#### Success Response (200 OK)
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Error Handling

### Error Response Format

All API errors follow this standard format:

```json
{
  "message": "Error description",
  "status": 400,
  "details": {}
}
```

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET/PATCH/POST request |
| 201 | Created | Successful resource creation |
| 204 | No Content | Successful DELETE request |
| 400 | Bad Request | Invalid request body or parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource or invalid state |
| 500 | Server Error | Internal server error |

### Common Error Scenarios

**Invalid Credentials**
```json
{
  "message": "Invalid email or password",
  "status": 401
}
```

**Validation Error**
```json
{
  "message": "Validation failed",
  "status": 400,
  "details": {
    "email": "Invalid email format",
    "phone": "Phone must be 10-15 digits"
  }
}
```

**Resource Not Found**
```json
{
  "message": "Booking not found",
  "status": 404
}
```

**Invalid State Transition**
```json
{
  "message": "Cannot complete onboarding without an assigned room",
  "status": 409
}
```

---

## Response Formats

### Pagination Response Format

All list endpoints follow this format:

```json
{
  "<resourceName>": [...],
  "total": 100,
  "page": 1,
  "pageSize": 10
}
```

### Timestamps

All timestamps are ISO 8601 format with UTC timezone:
```
2025-12-08T10:00:00Z
```

### Enums and Constants

#### Booking Status
- `pending payment`: Awaiting payment confirmation
- `pending approval`: Payment confirmed, awaiting admin approval
- `approved`: Approved, waiting for room assignment and onboarding completion

#### Broadcast Message Status
- `draft`: Message not yet sent
- `sent`: Message delivered to recipients
- `scheduled`: Message scheduled for future delivery
- `failed`: Message delivery failed

#### Broadcast Priority
- `low`: Low priority notification
- `medium`: Medium priority (default)
- `high`: High priority
- `urgent`: Urgent, requires immediate attention

#### Broadcast Recipient Type
- `all-residents`: Send to all hostel members
- `all-members`: Send to only confirmed members
- `specific-members`: Send to selected individuals

#### Gender
- `male`
- `female`

#### Level
- `100`, `200`, `300`, `400`: University level/year

#### Room Title
- `One-in-one`: Single occupancy room
- `Two-in-one`: Double occupancy room

---

## Authentication Notes

1. Token is returned in login response
2. Token should be stored in browser storage (localStorage or sessionStorage)
3. Token must be included in `Authorization` header for all protected routes
4. Token expires after 24 hours (server-side configuration)
5. Expired tokens will return 401 Unauthorized
6. Client should redirect to login on 401 response

---

## Rate Limiting

- **Limit**: 100 requests per minute per user
- **Header**: `X-RateLimit-Remaining`
- **Error**: 429 Too Many Requests when exceeded

---

## Webhooks (Optional)

For real-time updates, backend can send webhooks to notify frontend of:
- New booking created
- Payment received
- Member added
- Broadcast message sent
- Chat message received

---

## Implementation Notes for Backend Team

1. **CORS**: Enable CORS for frontend domain
2. **Authentication**: Implement JWT token with 24-hour expiration
3. **Validation**: Validate all inputs server-side
4. **Database**: Use transactions for multi-step operations (e.g., complete onboarding)
5. **Notifications**: Implement notification system for key events
6. **Pagination**: Support cursor-based pagination for large datasets
7. **Timestamps**: Always use UTC for server timestamps
8. **Files**: Handle file uploads for admission letters and attachments
9. **Search**: Implement full-text search for bookings and members

---

**Document Version**: 1.0  
**Last Updated**: December 11, 2025  
**Backend Integration Contact**: dev@hostella.local
