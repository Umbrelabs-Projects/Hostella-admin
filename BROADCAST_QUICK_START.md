# Broadcast Message Feature - Quick Start

## File Structure

```
src/app/dashboard/broadcast/
├── _components/
│   ├── BroadcastHeader.tsx          # Page header UI
│   ├── BroadcastFilters.tsx         # Filter controls
│   ├── BroadcastList.tsx            # Messages table
│   └── ComposeMessageDialog.tsx     # Compose form modal
├── _hooks/
│   └── useBroadcastApi.ts           # API integration
├── _validations/
│   └── broadcastSchema.ts           # Form validation (Zod)
└── page.tsx                         # Main page

src/stores/
└── useBroadcastStore.ts             # Zustand state management

src/types/
└── broadcast.ts                     # TypeScript types
```

## How to Use

### 1. Access the Broadcast Page

Navigate to `/dashboard/broadcast` in your admin dashboard or click "Broadcast Message" in the sidebar.

### 2. Compose a Message

1. Click the **"Compose Message"** button in the top right
2. Fill in the message details:
   - **Title**: 5-100 characters
   - **Content**: 10-5000 characters (live character counter)
   - **Send To**: Select recipient group
   - **Priority**: Choose from Low/Medium/High/Urgent
3. (Optional) Schedule for later using the datetime picker
4. Click **"Send Message"** to dispatch immediately
5. Or schedule for future delivery

### 3. View Sent Messages

- **Search**: Filter by message title
- **Status Filter**: Draft, Sent, Scheduled, Failed
- **Priority Filter**: Low, Medium, High, Urgent
- **View**: Click the eye icon to view full message
- **Resend**: Available for sent/failed messages
- **Delete**: Available for draft/scheduled messages

### 4. Monitor Engagement

View read percentages and delivery stats in the messages list.

## Key Features

✅ **Immediate Send** - Send messages right away to all residents/members
✅ **Scheduled Delivery** - Schedule messages for future delivery
✅ **Targeted Messaging** - Send to all residents, all members, or specific members
✅ **Priority Levels** - Mark messages as low/medium/high/urgent
✅ **Message Preview** - Preview before sending
✅ **Search & Filter** - Find messages by title, status, or priority
✅ **Engagement Tracking** - Monitor read rates and delivery stats
✅ **Resend Capability** - Resend failed or important messages
✅ **Responsive Design** - Works on desktop, tablet, and mobile

## State Management

The feature uses **Zustand** for state management. All UI state is stored in `useBroadcastStore`:

```typescript
import { useBroadcastStore } from "@/stores/useBroadcastStore";

// In your component:
const { messages, loading, openComposeDialog } = useBroadcastStore();
```

## Form Validation

**React Hook Form** with **Zod** validation ensures:
- All required fields are filled
- Title and content meet character requirements
- Recipients are selected for targeted messaging
- Scheduled dates are in the future
- Real-time validation feedback

## API Integration

The feature is ready for backend integration. Implement these endpoints:

```
GET    /api/broadcast/messages           # List messages
POST   /api/broadcast/messages           # Send immediately
POST   /api/broadcast/messages/schedule  # Schedule message
POST   /api/broadcast/messages/:id/resend
DELETE /api/broadcast/messages/:id
```

See `BROADCAST_FEATURE_GUIDE.md` for detailed API contracts.

## Common Tasks

### Send a Message to All Residents

1. Click "Compose Message"
2. Fill title and content
3. Set "Send To" to "All Residents"
4. Keep "Priority" as Medium (or adjust)
5. Click "Send Message"

### Schedule a Message

1. Click "Compose Message"
2. Fill in all required fields
3. Set a datetime in "Schedule Send"
4. Click "Send Message" (it will schedule instead)

### Find Failed Messages

1. Use the "Status" filter
2. Select "Failed"
3. Click the "Resend" button on any failed message

### Search for a Specific Message

1. Type in the "Search" field
2. Results filter in real-time
3. Click "Reset" to clear all filters

## Performance Tips

- Messages are paginated (10 per page by default)
- Filters reduce load on the server
- Component renders are optimized
- Loading states prevent UI freezes

## Troubleshooting

**Q: Why can't I compose a message?**
A: Check that the API endpoints are implemented on the backend.

**Q: Form won't submit?**
A: Ensure all required fields are filled and meet validation requirements. Check browser console for errors.

**Q: Messages not appearing after send?**
A: Verify the API endpoint returns the correct response format. Check network tab in DevTools.

**Q: Filters not working?**
A: Ensure the backend API accepts filter parameters. Verify the filter values are being sent correctly.

## Next Steps

1. **Implement Backend API** - Create the required endpoints
2. **Add Message Templates** - Allow reusing common messages
3. **Enable Rich Media** - Support images/PDFs in messages
4. **Analytics Dashboard** - Detailed message engagement analytics
5. **Scheduled Jobs** - Background service to send scheduled messages
6. **Email Integration** - Send messages via email/push notifications

## Support

For issues or questions about the Broadcast Message feature, refer to:
- `BROADCAST_FEATURE_GUIDE.md` - Comprehensive documentation
- Component source code - Well-commented and type-safe
- Zustand store - Clear action definitions
- Validation schema - Explicit validation rules
