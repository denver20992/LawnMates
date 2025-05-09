import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

type Notification = {
  id: string;
  message: string;
  type: 'message' | 'job' | 'payment' | 'system';
  read: boolean;
  createdAt: Date;
  data?: any;
};

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { user, isAuthenticated } = useAuth();

  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated) return;

    // Create WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('WebSocket Connected');
      // Send user ID to identify this connection
      if (user?.id) {
        newSocket.send(JSON.stringify({ type: 'identify', userId: user.id }));
      }
    };

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification') {
          // Add a new notification
          const newNotification: Notification = {
            id: data.id || `notification-${Date.now()}`,
            message: data.message,
            type: data.notificationType || 'system',
            read: false,
            createdAt: new Date(),
            data: data.data
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification('LawnMates', {
              body: data.message,
              icon: '/favicon.ico'
            });
          }
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket Disconnected');
      // Try to reconnect after 5 seconds
      setTimeout(connectWebSocket, 5000);
    };

    newSocket.onerror = (error) => {
      console.error('WebSocket Error:', error);
      newSocket.close();
    };

    setSocket(newSocket);

    // Clean up function
    return () => {
      if (newSocket.readyState === WebSocket.OPEN) {
        newSocket.close();
      }
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (isAuthenticated) {
      // Request notification permission
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
      
      // Connect to WebSocket
      connectWebSocket();
    } else {
      // Close WebSocket if user logs out
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
        setSocket(null);
      }
    }
    
    // Clean up function
    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [isAuthenticated, connectWebSocket, socket]);

  const markAsRead = (id: string) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
