import React, { createContext, useState, useEffect } from 'react';
import { useWebsocket } from '@/hooks/useWebsocket';
import { useToast } from '@/hooks/use-toast';

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
  websocketStatus: 'connecting' | 'open' | 'closed' | 'error';
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  websocketStatus: 'closed',
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();
  
  // Process incoming websocket messages to create notifications
  const handleWebSocketMessage = (data: any) => {
    try {
      // Log the raw message data to help diagnose issues
      console.log('Received WebSocket message:', data);
      
      if (data && data.type === 'notification') {
        // Ensure we have all required fields with fallbacks
        const message = typeof data.message === 'string' ? data.message : 'New notification';
        const id = data.id || `notification-${Date.now()}`;
        
        // Determine the notification type - use a robust fallback approach
        let notificationType: 'message' | 'job' | 'payment' | 'system' = 'system';
        if (data.notificationType && 
            ['message', 'job', 'payment', 'system'].includes(data.notificationType)) {
          notificationType = data.notificationType as any;
        }
        
        // Create notification object with validated data
        const newNotification: Notification = {
          id,
          message,
          type: notificationType,
          read: false,
          createdAt: new Date(),
          data: data.data || null
        };
        
        // Add to state
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show browser notification if permission granted
        if (window.Notification && Notification.permission === 'granted') {
          try {
            new Notification('LawnMates', {
              body: message,
              icon: '/favicon.ico'
            });
          } catch (err) {
            console.error('Failed to create browser notification:', err);
          }
        }
        
        // Also show a toast notification
        toast({
          title: 'New Notification',
          description: message,
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  };
  
  // Setup WebSocket connection using our hook
  const { status: websocketStatus } = useWebsocket({
    onMessage: handleWebSocketMessage,
    onOpen: () => {
      console.log('WebSocket Connected');
    },
    onClose: () => {
      console.log('WebSocket Disconnected');
    },
    onError: (error) => {
      console.error('WebSocket Error:', error);
    },
    autoReconnect: true,
    reconnectDelay: 5000
  });

  // Request browser notification permission on component mount
  useEffect(() => {
    if (window.Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

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
        websocketStatus,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
