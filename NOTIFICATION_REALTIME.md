# Hostella Admin: Real-Time Notification Handling

This document explains how the Hostella Admin dashboard receives and displays payment notifications (Paystack, bank, etc.) in real time, matching backend instant notification creation.

---

## Overview
- The frontend uses **WebSocket (socket.io)** for instant notification delivery.
- A **polling fallback** ensures reliability if the socket connection drops.
- All payment types (Paystack, bank transfer, etc.) are supported as long as the backend emits a notification event.

---

## How It Works

### 1. WebSocket Real-Time Updates
- On dashboard load, the frontend connects to the notification WebSocket server:
  ```js
  connectNotificationSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
  ```
- The backend emits a `new_notification` event when a new notification is created (e.g., after Paystack webhook or bank receipt upload).
- The frontend listens for this event and updates the notification badge and list instantly.

### 2. Polling Fallback
- Every 5 minutes, the frontend fetches `/api/v1/notifications` to catch any missed notifications:
  ```js
  setInterval(() => {
    useNotificationsStore.getState().fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false });
  }, 300000); // 5 minutes
  ```

---

## Example Implementation (React/Next.js)

```js
import { connectNotificationSocket, onNotification } from '@/lib/notificationSocket';
import { useNotificationsStore } from '@/stores/useNotificationsStore';

useEffect(() => {
  connectNotificationSocket(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000");
  const handleNewNotification = (notif) => {
    useNotificationsStore.getState().addNotification({
      id: notif.id,
      type: notif.type,
      title: notif.title,
      description: notif.description,
      relatedId: notif.relatedId,
      createdAt: notif.createdAt,
      read: false,
      time: "Just now",
    });
  };
  onNotification(handleNewNotification);

  // Polling fallback every 5 minutes
  const intervalId = setInterval(() => {
    useNotificationsStore.getState().fetchNotifications({ page: 1, pageSize: 10, unreadOnly: false });
  }, 300000);

  return () => {
    clearInterval(intervalId);
  };
}, []);
```

---

## Notification Payload Example
A notification object received from the backend should look like:
```json
{
  "id": "notif_123",
  "type": "payment-received",
  "title": "New MoMo Payment Received",
  "description": "Jane Smith (BK-3C4D) has paid GHS 1200 via MoMo. Please verify the payment.",
  "relatedId": "payment_789",
  "createdAt": "2025-12-29T13:00:00.000Z"
}
```

---

## Key Points
- **No need for frequent polling**—notifications are pushed in real time.
- **Works for all payment types** as long as the backend emits the event.
- **Polling fallback** ensures reliability if the socket connection is lost.
- **Notification badge and list update instantly** for the admin.

---

## Backend Requirements
- The backend must emit a `new_notification` event via socket.io to all relevant admin clients when a new notification is created.
- The notification payload should match the example above.
- The `/api/v1/notifications` endpoint should remain available for polling and initial fetch.

---

## Troubleshooting
- If notifications do not appear instantly:
  - Ensure the frontend is connected to the correct WebSocket server.
  - Ensure the backend emits the `new_notification` event on notification creation.
  - Check for network/firewall issues blocking WebSocket connections.
  - Polling fallback will still fetch notifications every 5 minutes.

---

For further support, contact the frontend or backend team.
