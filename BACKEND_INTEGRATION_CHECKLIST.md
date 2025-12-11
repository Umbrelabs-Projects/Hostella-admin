# Backend Integration Checklist for Hostella Admin Frontend

## Quick Reference for Backend Developers

This checklist ensures the backend API meets all frontend requirements.

---

## ✅ Core Requirements

### Authentication Endpoints
- [ ] `POST /auth/login` - User login
  - Request: `{ email, password }`
  - Response: `{ user: {...}, token: "jwt_token" }`
  - Status: 200 (success), 401 (invalid credentials)

- [ ] `GET /auth/me` - Get current user profile
  - Header: `Authorization: Bearer <token>`
  - Response: `{ id, firstName, lastName, email, phone, avatar }`
  - Status: 200, 401 (unauthorized)

- [ ] `PUT /auth/profile` - Update user profile
  - Header: `Authorization: Bearer <token>`
  - Request: `{ firstName?, lastName?, phone?, avatar? }`
  - Response: Updated user object
  - Status: 200, 400 (validation), 401

- [ ] `POST /auth/password` - Change password
  - Header: `Authorization: Bearer <token>`
  - Request: `{ currentPassword, newPassword }`
  - Status: 200 (success), 400 (invalid current password), 401

---

### Bookings Endpoints
- [ ] `GET /bookings` - List bookings with pagination
  - Query: `page`, `pageSize`, `search?`, `status?`, `gender?`, `roomType?`
  - Response: `{ bookings: [], total, page, pageSize }`
  - Pagination: Default pageSize=10, max=100

- [ ] `GET /bookings/{id}` - Get single booking
  - Response: Single booking object
  - Status: 200, 404 (not found)

- [ ] `POST /bookings` - Create booking
  - Request: Booking data (all required fields)
  - Response: Created booking with ID
  - Status: 201, 400 (validation)

- [ ] `PATCH /bookings/{id}` - Update booking (partial)
  - Request: Any fields to update
  - Response: Updated booking
  - Status: 200, 404, 400

- [ ] `POST /bookings/{id}/approve-payment` - Approve payment
  - Action: Change status to "pending approval"
  - Response: Updated booking
  - Status: 200, 404

- [ ] `POST /bookings/{id}/assign-room` - Assign room
  - Request: `{ roomNumber: number }`
  - Response: Updated booking with allocatedRoomNumber
  - Status: 200, 400 (validation), 404

- [ ] `POST /bookings/{id}/complete-onboarding` - Move to members
  - Action: Create member record, remove from bookings
  - Validation: Must have allocatedRoomNumber
  - Status: 200, 400 (missing room), 404

- [ ] `DELETE /bookings/{id}` - Delete booking
  - Status: 200, 404

---

### Members Endpoints
- [ ] `GET /members` - List members with pagination
  - Query: `page`, `pageSize`, `search?`, `status?`
  - Response: `{ members: [], total, page, pageSize }`

- [ ] `GET /members/{id}` - Get single member
  - Response: Single member object
  - Status: 200, 404

- [ ] `PATCH /members/{id}` - Update member
  - Request: Partial member data
  - Response: Updated member
  - Status: 200, 400, 404

- [ ] `DELETE /members/{id}` - Remove member from hostel
  - Status: 200, 404

---

### Broadcast Endpoints
- [ ] `GET /broadcast/messages` - List messages with pagination
  - Query: `page`, `pageSize`, `search?`, `status?`, `priority?`
  - Response: `{ messages: [], total, page, pageSize }`
  - Filters: status (draft, sent, scheduled, failed), priority (low, medium, high, urgent)

- [ ] `POST /broadcast/messages` - Create/send message
  - Request: `{ title, content, recipientType, selectedRecipients?, priority, scheduledFor? }`
  - Logic: 
    - If scheduledFor is null/empty → send immediately (status: "sent")
    - If scheduledFor has datetime → schedule (status: "scheduled")
  - Response: Created message object
  - Status: 201, 400

- [ ] `PATCH /broadcast/messages/{id}` - Update message (draft/scheduled only)
  - Request: Partial message data
  - Response: Updated message
  - Status: 200, 400, 404

- [ ] `DELETE /broadcast/messages/{id}` - Delete message
  - Status: 200, 404

- [ ] `POST /broadcast/messages/{id}/resend` - Resend message
  - Action: Re-send to all recipients, update sentAt and status
  - Response: Updated message
  - Status: 200, 404, 400

---

### Chat Endpoints
- [ ] `GET /chat/conversations` - List conversations
  - Query: `limit?`, `offset?`
  - Response: `{ conversations: [...], total }`
  - Fields: id, name, avatar, online, roomInfo, lastMessage, lastMessageTime, unreadCount

- [ ] `GET /chat/conversations/{id}/messages` - Get conversation messages
  - Query: `limit?`, `offset?`
  - Response: `{ messages: [...], total }`

- [ ] `POST /chat/conversations/{id}/messages` - Send message
  - Request: `{ type: "text"|"file"|"voice", content, replyToId? }`
  - Response: Created message
  - Status: 201, 400

- [ ] `POST /chat/conversations/{id}/messages/{msgId}/read` - Mark as read
  - Status: 200, 404

---

### Notifications Endpoints
- [ ] `GET /notifications` - Get notifications
  - Query: `limit?`, `offset?`, `unreadOnly?`
  - Response: `{ notifications: [...], total, unreadCount }`

- [ ] `POST /notifications/{id}/read` - Mark as read
  - Status: 200, 404

- [ ] `POST /notifications/mark-all-read` - Mark all as read
  - Status: 200

- [ ] `DELETE /notifications/{id}` - Delete notification
  - Status: 200, 404

---

## Error Response Format

All endpoints MUST return errors in this format:

```json
{
  "message": "Error description",
  "status": <http_status_code>,
  "details": {}
}
```

### HTTP Status Codes Required
- `200` - OK (GET, PATCH, POST success)
- `201` - Created (POST resource creation)
- `204` - No Content (DELETE success, optional)
- `400` - Bad Request (validation, invalid state)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (invalid state transition)
- `500` - Server Error

---

## Data Types & Enums

### Gender
- `male`
- `female`

### Level (Academic Year)
- `100`, `200`, `300`, `400`

### Room Type
- `One-in-one` (single occupancy)
- `Two-in-two` (double occupancy)

### Booking Status
- `pending payment` - Awaiting payment confirmation
- `pending approval` - Payment confirmed, awaiting admin approval
- `approved` - Approved, waiting for onboarding completion

### Broadcast Status
- `draft` - Not yet sent
- `sent` - Delivered
- `scheduled` - Scheduled for future delivery
- `failed` - Delivery failed

### Broadcast Priority
- `low`, `medium`, `high`, `urgent`

### Broadcast Recipient Type
- `all-residents` - All hostel occupants
- `all-members` - Only confirmed members
- `specific-members` - Selected individuals

---

## Validation Rules

### Bookings
- `email`: Valid email format, required
- `phone`: 10-15 digits only
- `studentId`: Must be unique
- `firstName`, `lastName`: Required, non-empty strings
- `price`: Numeric string
- `roomTitle`: Must be one of enum values
- `status`: Must be one of enum values

### Broadcast Messages
- `title`: Required, max 200 characters
- `content`: Required, max 5000 characters
- `priority`: Must be one of enum values
- `recipientType`: Must be one of enum values
- `scheduledFor`: Valid ISO datetime if provided

### Members
- Inherits booking validations
- `allocatedRoomNumber`: Must be unique within hostel

---

## Database Considerations

### Relationships
- Bookings → Members (one-to-one, after onboarding)
- Admin → Broadcast Messages (one-to-many)
- Admin → Chat Conversations (one-to-many)
- Chat Conversation → Messages (one-to-many)

### Indexes Required
- Bookings: `(status, createdAt)`, `(studentId)`, `(email)`
- Members: `(roomNumber)`, `(studentId)`
- Broadcast: `(status, createdAt)`, `(priority)`
- Chat: `(conversationId, createdAt)`

### Transactions Required For
- `complete-onboarding`: Move booking to members atomically
- Message sending: Update recipient counts and status

---

## Performance Requirements

### Response Time Targets
- Auth endpoints: < 200ms
- List endpoints: < 500ms (paginated, 10 items)
- Search/filter: < 1000ms
- Single resource: < 200ms

### Pagination
- Default pageSize: 10
- Maximum pageSize: 100
- Always return total count

### Caching
- Consider caching broadcast messages (5 min TTL)
- Don't cache user-specific data
- Invalidate cache on mutations

---

## Authentication Requirements

### JWT Token
- **Expiration**: 24 hours
- **Algorithm**: HS256 or RS256
- **Claims**: `id`, `email`, `iat`, `exp`

### Token Validation
- Verify token signature
- Check expiration
- Verify user exists and is active

### CORS
- Enable for frontend domain
- Allow headers: `Content-Type`, `Authorization`
- Allow methods: `GET`, `POST`, `PATCH`, `DELETE`

---

## Rate Limiting

**Recommended:**
- 100 requests/minute per authenticated user
- 20 requests/minute per IP (auth endpoints)
- Return `429 Too Many Requests` when exceeded
- Include header: `X-RateLimit-Remaining`

---

## Logging & Monitoring

Log all:
- Authentication attempts (success/failure)
- CRUD operations with user ID
- Errors with full stack trace
- Slow queries (> 500ms)

---

## Testing Before Frontend Integration

```bash
# Test login
curl -X POST https://www.example.railway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"test123"}'

# Test with token
curl -X GET https://www.example.railway/auth/me \
  -H "Authorization: Bearer <token>"

# Test bookings list
curl -X GET "https://www.example.railway/bookings?page=1&pageSize=10" \
  -H "Authorization: Bearer <token>"

# Test create booking
curl -X POST https://www.example.railway/bookings \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","firstName":"John",...}'
```

---

## Frontend API Consumption Details

### HTTP Client Details
```typescript
// Frontend uses fetch API with:
// - Custom error handling via APIException class
// - Automatic Bearer token attachment
// - JSON request/response
// - 30-second default timeout (can be configured)
```

### Expected API Behavior
1. Always validate and return errors in standard format
2. Maintain consistent response structure across endpoints
3. Use appropriate HTTP status codes
4. Return paginated responses with `total` count
5. Support partial updates (PATCH)
6. Transaction support for multi-step operations

---

## Deployment Checklist

Before going live:

- [ ] All endpoints tested with frontend
- [ ] CORS properly configured
- [ ] SSL/TLS enabled
- [ ] Rate limiting in place
- [ ] Database indexes created
- [ ] Logging configured
- [ ] Error monitoring (Sentry/similar) set up
- [ ] Backup strategy in place
- [ ] API documentation updated
- [ ] Token expiration and refresh strategy finalized

---

## Support & Escalation

**Frontend Issues:**
- Check API_DOCUMENTATION.md for endpoint specs
- Verify HTTP status codes
- Check response format matches specification
- Enable debug logging

**Data Issues:**
- Verify unique constraints are enforced
- Check timestamp formats (ISO 8601 UTC)
- Validate enum values

**Performance Issues:**
- Check database query performance
- Review indexes
- Analyze slow query logs

---

**Prepared by**: Frontend Team  
**Date**: December 11, 2025  
**Version**: 1.0  
**Status**: Ready for Backend Implementation

For questions about API expectations, refer to `API_DOCUMENTATION.md` in the project root.
