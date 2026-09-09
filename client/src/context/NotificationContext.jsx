import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { notificationAPI } from '../services/api';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [activePopup, setActivePopup] = useState(null);

  // Track notifications already seen so we only trigger popups for genuinely new events
  const seenNotificationIdsRef = useRef(new Set());
  const isInitialFetchRef = useRef(true);
  const popupTimeoutRef = useRef(null);

  // Clear popup auto-dismiss timeout
  const clearPopupTimeout = useCallback(() => {
    if (popupTimeoutRef.current) {
      clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = null;
    }
  }, []);

  // Dismiss currently active popup
  const dismissPopup = useCallback(() => {
    clearPopupTimeout();
    setActivePopup(null);
  }, [clearPopupTimeout]);

  // Trigger a popup for a new notification
  const triggerPopup = useCallback(
    (notification) => {
      clearPopupTimeout();
      setActivePopup(notification);

      // Auto dismiss after 6 seconds
      popupTimeoutRef.current = setTimeout(() => {
        setActivePopup(null);
      }, 6000);
    },
    [clearPopupTimeout]
  );

  // Fetch notifications from server
  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!isAuthenticated) return;
      if (!silent) setLoadingNotifications(true);

      try {
        const res = await notificationAPI.getAll({ limit: 15 });
        if (res.data?.data) {
          const freshNotifs = res.data.data;
          setNotifications(freshNotifs);
          setUnreadCount(freshNotifs.filter((n) => !n.isRead).length);

          if (isInitialFetchRef.current) {
            // First load: record existing IDs so we don't spam popups on refresh/login
            freshNotifs.forEach((n) => seenNotificationIdsRef.current.add(n._id));
            isInitialFetchRef.current = false;
          } else {
            // Check for brand new unread notifications
            const newNotifs = freshNotifs.filter(
              (n) => !n.isRead && !seenNotificationIdsRef.current.has(n._id)
            );

            // Record all incoming IDs
            freshNotifs.forEach((n) => seenNotificationIdsRef.current.add(n._id));

            // If new notifications arrived and user is admin, trigger popup with the most recent one
            if (newNotifs.length > 0 && user?.role === 'admin') {
              triggerPopup(newNotifs[0]);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch notifications:', err.message);
      } finally {
        if (!silent) setLoadingNotifications(false);
      }
    },
    [isAuthenticated, user?.role, triggerPopup]
  );

  // Initial fetch and route-change fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(false);
    } else {
      // Reset state on logout
      setNotifications([]);
      setUnreadCount(0);
      setActivePopup(null);
      seenNotificationIdsRef.current.clear();
      isInitialFetchRef.current = true;
      clearPopupTimeout();
    }
  }, [isAuthenticated, location.pathname, fetchNotifications, clearPopupTimeout]);

  // Background polling for Admin users to detect real-time updates (e.g. newly filed complaints)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') return;

    // Poll every 7 seconds when admin is active
    const intervalId = setInterval(() => {
      fetchNotifications(true);
    }, 7000);

    // Also re-check when the window tab regains focus
    const handleFocus = () => {
      fetchNotifications(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user?.role, fetchNotifications]);

  // Mark single notification as read
  const markAsRead = useCallback(
    async (notificationId) => {
      try {
        await notificationAPI.markAsRead(notificationId);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));

        // If the active popup is this notification, dismiss it
        if (activePopup?._id === notificationId) {
          dismissPopup();
        }
      } catch (err) {
        console.error('Error marking notification as read:', err);
      }
    },
    [activePopup, dismissPopup]
  );

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      dismissPopup();
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  }, [dismissPopup]);

  // Handle clicking a notification (from either Bell Dropdown or Popup)
  const handleNotificationClick = useCallback(
    async (notification) => {
      if (!notification) return;

      if (!notification.isRead) {
        await markAsRead(notification._id);
      }

      dismissPopup();

      // Follow existing routing behavior
      if (user?.role === 'admin') {
        navigate('/admin/complaints');
      } else {
        navigate('/student/complaints');
      }
    },
    [user?.role, markAsRead, dismissPopup, navigate]
  );

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loadingNotifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        handleNotificationClick,
        activePopup,
        dismissPopup,
        clearPopupTimeout,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
