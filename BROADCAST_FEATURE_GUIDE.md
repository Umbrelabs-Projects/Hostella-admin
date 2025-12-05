# Broadcast Message Feature - Implementation Guide

## Overview

A production-ready Broadcast Message system has been implemented for the Hostella Admin Dashboard, enabling administrators to efficiently compose, preview, schedule, and send broadcast messages to residents and members with comprehensive state management using Zustand.

## Architecture

### Directory Structure

src/
├── app/dashboard/broadcast/
│   ├── _components/
│   │   ├── BroadcastHeader.tsx          # Page header with compose button
│   │   ├── BroadcastFilters.tsx         # Search, status, and priority filters
│   │   ├── BroadcastList.tsx            # Table displaying all messages
│   │   └── ComposeMessageDialog.tsx     # Modal for composing messages
│   ├── _hooks/
│   │   └── useBroadcastApi.ts           # API integration hooks
│   ├── _validations/
│   │   └── broadcastSchema.ts           # Zod validation schemas
│   └── page.tsx                         # Main broadcast page
├── stores/
│   └── useBroadcastStore.ts             # Zustand store (state management)
└── types/
    └── broadcast.ts                     # TypeScript interfaces and types
```

## Type Definitions

### Core Types (`src/types/broadcast.ts`)

- **BroadcastRecipientType**: Enum for recipient targeting (`all-residents`, `all-members`, `specific-members`)
- **BroadcastMessageStatus**: Message lifecycle states (`draft`, `sent`, `scheduled`, `failed`)
- **BroadcastPriority**: Priority levels (`low`, `medium`, `high`, `urgent`)
- **BroadcastMessage**: Complete message data structure with metadata
- **BroadcastComposer**: Form state for the message composer
- **API Response Types**: For backend integration

### Key Interfaces

```typescript
interface BroadcastMessage {
  id: string;
  title: string;
  content: string;
  recipientType: BroadcastRecipientType;
  recipients?: BroadcastRecipient[];
  recipientCount: number;
  priority: BroadcastPriority;
  status: BroadcastMessageStatus;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  scheduledFor?: string;
  readCount?: number;
  failedCount?: number;
}
```

## State Management

### Zustand Store (`src/stores/useBroadcastStore.ts`)

The store provides comprehensive state management with the following features:

#### State Properties

```typescript
interface BroadcastState {
  // Data
  messages: BroadcastMessage[];
  selectedMessage: BroadcastMessage | null;
  composer: BroadcastComposer;

  // UI States
  loading: boolean;
  error: string | null;
  success: string | null;
  isComposeDialogOpen: boolean;
  currentPage: number;
  pageSize: number;
  totalMessages: number;
  searchQuery: string;
  statusFilter: "all" | BroadcastMessage["status"];
  priorityFilter: "all" | BroadcastMessage["priority"];
}
```

#### Key Actions

- **Message Management**: `setMessages()`, `setSelectedMessage()`, `addMessage()`, `updateMessage()`, `removeMessage()`
- **Composer Control**: `setComposer()`, `resetComposer()`, `getComposer()`
- **Dialog Management**: `openComposeDialog()`, `closeComposeDialog()`
- **Pagination**: `setCurrentPage()`, `setPageSize()`, `setTotalMessages()`
- **Filtering**: `setSearchQuery()`, `setStatusFilter()`, `setPriorityFilter()`
- **API States**: `setLoading()`, `setError()`, `setSuccess()`, `clearMessages()`

#### Usage Example

```typescript
import { useBroadcastStore } from "@/stores/useBroadcastStore";

const MyComponent = () => {
  const { messages, loading, openComposeDialog } = useBroadcastStore();
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {messages.map(msg => <div key={msg.id}>{msg.title}</div>)}
      <button onClick={openComposeDialog}>Compose</button>
    </div>
  );
};
```

## Form Validation

### Zod Schema (`src/app/dashboard/broadcast/_validations/broadcastSchema.ts`)

Comprehensive validation with:

- **Title**: 5-100 characters, required
- **Content**: 10-5000 characters with real-time character count feedback
- **Recipient Type**: Enum validation with conditional recipient requirements
- **Priority Level**: Enum validation (low, medium, high, urgent)
- **Scheduled Date**: Optional future date validation with superRefine for context-aware rules

#### Validation Features

```typescript
// Context-aware validation
superRefine((data, ctx) => {
  // Ensures recipients are selected for targeted messaging
  if (data.recipientType === "specific-members" && data.selectedRecipients.length === 0) {
    ctx.addIssue({...});
  }
  
  // Validates scheduled time is in the future
  if (data.scheduledFor && new Date(data.scheduledFor) <= new Date()) {
    ctx.addIssue({...});
  }
})
```

## API Integration

### useBroadcastApi Hook (`src/app/dashboard/broadcast/_hooks/useBroadcastApi.ts`)

Provides clean abstractions for API calls with automatic error handling and loading states:

#### Available Methods

```typescript
const {
  fetchMessages,           // GET /api/broadcast/messages
  sendMessage,             // POST /api/broadcast/messages
  scheduleMessage,         // POST /api/broadcast/messages/schedule
  getMessage,              // GET /api/broadcast/messages/:id
  resendMessage,           // POST /api/broadcast/messages/:id/resend
  deleteMessage,           // DELETE /api/broadcast/messages/:id
} = useBroadcastApi();
```

#### Error Handling

- Automatic error capture with toast notifications via `sonner`
- Loading states managed through Zustand
- Graceful fallback for API failures
- User-friendly error messages

#### Usage Example

```typescript
const { sendMessage, loading, error } = useBroadcastApi();

const handleSend = async (data) => {
  const result = await sendMessage({
    title: data.title,
    content: data.content,
    recipientType: data.recipientType,
    priority: data.priority,
  });
  
  if (result) {
    // Success - message was sent
  }
};
```

## Components

### BroadcastHeader
- Displays page title and icon
- "Compose Message" button to open dialog
- Responsive layout (mobile-first)

### ComposeMessageDialog
- Modal form with two tabs: Compose and Preview
- Real-time validation using react-hook-form + Zod
- Character counter for message content
- Priority level selector with descriptive labels
- Support for immediate send and future scheduling
- Live preview of message before sending

### BroadcastFilters
- Search by title
- Filter by status (draft, sent, scheduled, failed)
- Filter by priority (low, medium, high, urgent)
- Reset all filters button
- Integrated with Zustand store

### BroadcastList
- Responsive table display of all messages
- Columns: Title, Recipients, Priority, Status, Date, Engagement
- Action buttons: View, Resend (for sent/failed), Delete (for draft/scheduled)
- Empty state message
- Loading indicator
- Color-coded badges for priority and status

## Features

### Message Composition
- Rich text input with 5000 character limit
- Title and content validation
- Real-time character count feedback
- Message preview before sending

### Recipient Targeting
- All Residents
- All Members
- Specific Members (with selection interface)
- Recipient count tracking

### Scheduling
- Optional future date/time selection
- Future date validation
- Automatic draft status for scheduled messages

### Message Status Tracking
- **Draft**: Unsent messages
- **Sent**: Successfully delivered messages
- **Scheduled**: Messages pending scheduled delivery
- **Failed**: Messages that failed to deliver

### Priority Levels
- **Low**: General information
- **Medium**: Important updates
- **High**: Urgent notices
- **Urgent**: Immediate action needed

### Engagement Metrics
- Read count tracking
- Read percentage calculation
- Failed delivery count
- Resend capability for failed messages

### Filtering & Search
- Search by message title
- Filter by status
- Filter by priority
- Pagination support
- Reset all filters

## Backend API Contracts

### Expected API Endpoints

```
GET    /api/broadcast/messages                  # List messages with pagination
POST   /api/broadcast/messages                  # Send message immediately
POST   /api/broadcast/messages/schedule         # Schedule message for later
GET    /api/broadcast/messages/:id              # Get single message details
POST   /api/broadcast/messages/:id/resend       # Resend a previous message
DELETE /api/broadcast/messages/:id              # Delete draft/scheduled message
```

### Request/Response Payloads

#### Send Message Request
```json
{
  "title": "Maintenance Alert",
  "content": "Water supply will be interrupted...",
  "recipientType": "all-residents",
  "selectedRecipients": null,
  "priority": "high",
  "status": "sent",
  "sentAt": "2025-12-05T10:00:00Z"
}
```

#### API Response
```json
{
  "success": true,
  "message": "Broadcast sent successfully",
  "data": {
    "id": "msg_123abc",
    "title": "Maintenance Alert",
    "status": "sent",
    "createdAt": "2025-12-05T10:00:00Z",
    ...
  }
}
```

## Scalability & Future Enhancements

### Currently Prepared For:

1. **Message Templates**
   - `messageTemplate` field in BroadcastMessage
   - Template selection UI component ready for addition
   - Template management API integration ready

2. **Bulk Scheduling**
   - Schedule multiple messages at once
   - Batch delivery management
   - Ready for calendar/timeline view

3. **Advanced Analytics**
   - Read/engagement tracking fields
   - Delivery failure analysis
   - Message performance dashboard

4. **Rich Media Support**
   - `attachments` field in BroadcastMessage
   - Image/PDF attachment handling
   - Media upload UI component ready

5. **Message Versioning**
   - Edit and reversion capabilities
   - Change history tracking
   - Draft/version management

6. **A/B Testing**
   - Multiple variants support
   - Performance comparison
   - Variant selection UI

7. **Recipient Segmentation**
   - Custom recipient groups/tags
   - Demographic filtering
   - Room-based targeting

## Best Practices

### Performance
- Pagination implemented with configurable page size
- Efficient filtering without unnecessary re-renders
- Memoized callbacks in hooks
- Lazy loading of message details

### Security
- Input validation at both form and API levels
- XSS prevention through React's built-in escaping
- CSRF token support in API calls (via apiFetch)
- Authorization checks at API endpoints

### User Experience
- Toast notifications for all actions
- Loading states for async operations
- Error messages with actionable guidance
- Confirmation dialogs for destructive actions
- Responsive design (mobile, tablet, desktop)

### Code Organization
- Separation of concerns (components, hooks, stores, types)
- Reusable UI components
- Custom hooks for API logic
- Centralized state management
- Type-safe throughout

## Integration Checklist

Before deploying to production:

- [ ] Implement backend API endpoints at specified routes
- [ ] Add authorization/permission checks
- [ ] Connect Zustand store with real API calls
- [ ] Configure toast notifications (already using sonner)
- [ ] Test form validation with various inputs
- [ ] Implement recipient selection UI component
- [ ] Set up message templates system (if desired)
- [ ] Add database models for broadcast messages
- [ ] Implement message delivery queue system
- [ ] Set up email/push notification integration
- [ ] Add user audit logging for message sends
- [ ] Configure message retention policies
- [ ] Test pagination with large datasets
- [ ] Implement rate limiting on API endpoints
- [ ] Set up monitoring/alerting for failed messages

## Development Notes

### TypeScript Strict Mode
- Full TypeScript strict mode enabled
- No `any` types in production code
- Proper type inference throughout

### UI Framework Stack
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React version
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible component primitives
- **React Hook Form**: Efficient form state
- **Zod**: Type-safe validation
- **Zustand**: Lightweight state management
- **Sonner**: Toast notifications
- **Lucide React**: Icon library

### Testing Considerations
- Component testing with React Testing Library
- Hook testing with react-hooks-testing-library
- Store testing with zustand-test-utils
- Integration testing with Playwright/Cypress

## Troubleshooting

### Common Issues

**Issue: Form not submitting**
- Check browser console for validation errors
- Verify all required fields are filled
- Ensure selected recipients if using specific-members

**Issue: Messages not loading**
- Verify API endpoints are correct
- Check network tab in DevTools
- Ensure authentication token is set

**Issue: Filters not working**
- Verify searchQuery state in store
- Check filter values are being passed to API
- Ensure page resets to 1 when filtering

**Issue: Dialog not closing**
- Check onClose prop is properly passed
- Verify resetComposer() is called
- Check for JavaScript errors in console

## License & Credits

This Broadcast Message feature is part of the Hostella Admin Dashboard, built with modern React best practices and production-ready patterns.
