import { act, renderHook } from "@testing-library/react";
import { useNotificationsStore } from "@/stores/useNotificationsStore";
import { apiFetch } from "@/lib/api";

jest.mock("@/lib/api", () => {
  const actual = jest.requireActual("@/lib/api");
  return {
    ...actual,
    apiFetch: jest.fn(),
  };
});

const mockedApiFetch = apiFetch as jest.MockedFunction<typeof apiFetch>;
const baseNotification = {
  id: "notif-1",
  type: "new_booking",
  title: "New booking",
  description: "A student booked a room",
  isRead: false, // Backend uses isRead
  createdAt: "2025-12-10T10:00:00Z",
};

const resetStore = () => {
  act(() => {
    useNotificationsStore.setState({
      notifications: [],
      total: 0,
      unreadCount: 0,
      loading: false,
      error: null,
      filters: { page: 1, pageSize: 50, unreadOnly: false },
      currentPage: 1,
      pageSize: 50,
      totalPages: 0,
    });
  });
  mockedApiFetch.mockReset();
};

describe("useNotificationsStore", () => {
  beforeEach(() => resetStore());

  it("fetches notifications from the backend", async () => {
    mockedApiFetch.mockResolvedValueOnce({
      success: true,
      notifications: [baseNotification],
      total: 1,
      unreadCount: 1,
      page: 1,
      pageSize: 50,
      totalPages: 1,
    });

    const { result } = renderHook(() => useNotificationsStore());

    await act(async () => {
      await result.current.fetchNotifications();
    });

    expect(mockedApiFetch).toHaveBeenCalledWith(
      expect.stringContaining("/notifications?page=1&pageSize=50")
    );
    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.unreadCount).toBe(1);
    expect(result.current.currentPage).toBe(1);
    expect(result.current.pageSize).toBe(50);
    expect(result.current.totalPages).toBe(1);
  });

  it("marks a notification as read via the API", async () => {
    mockedApiFetch.mockResolvedValue({ success: true, message: "Notification marked as read" });
    useNotificationsStore.setState((state) => ({
      ...state,
      notifications: [{ ...baseNotification, read: false }],
      total: 1,
      unreadCount: 1,
    }));

    const { result } = renderHook(() => useNotificationsStore());

    await act(async () => {
      await result.current.markAsRead("notif-1");
    });

    expect(mockedApiFetch).toHaveBeenCalledWith("/notifications/notif-1/read", {
      method: "POST",
    });
    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("deletes a notification via the API", async () => {
    mockedApiFetch.mockResolvedValue({ success: true, message: "Notification deleted successfully" });
    useNotificationsStore.setState((state) => ({
      ...state,
      notifications: [{ ...baseNotification, read: false }],
      total: 1,
      unreadCount: 1,
    }));

    const { result } = renderHook(() => useNotificationsStore());

    await act(async () => {
      await result.current.deleteNotification("notif-1");
    });

    expect(mockedApiFetch).toHaveBeenCalledWith("/notifications/notif-1", {
      method: "DELETE",
    });
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.total).toBe(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it("marks all notifications as read via the API", async () => {
    mockedApiFetch.mockResolvedValue({ success: true, message: "All notifications marked as read" });
    useNotificationsStore.setState((state) => ({
      ...state,
      notifications: [
        { ...baseNotification, read: false },
        { ...baseNotification, id: "notif-2", read: false },
      ],
      total: 2,
      unreadCount: 2,
    }));

    const { result } = renderHook(() => useNotificationsStore());

    await act(async () => {
      await result.current.markAllAsRead();
    });

    expect(mockedApiFetch).toHaveBeenCalledWith("/notifications/mark-all-read", {
      method: "POST",
    });
    expect(result.current.notifications.every((n) => n.read)).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it("adds a local notification and updates counters", () => {
    const { result } = renderHook(() => useNotificationsStore());
    const notification = { ...baseNotification, id: "notif-3" };

    act(() => {
      result.current.addNotification(notification);
    });

    expect(result.current.notifications[0]).toMatchObject({ id: "notif-3" });
    expect(result.current.total).toBe(1);
    expect(result.current.unreadCount).toBe(1);
  });
});
