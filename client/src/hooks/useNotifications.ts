import { useContext } from 'react';
import { NotificationContext } from '@/contexts/NotificationContext';

export type NotificationType = 'message' | 'job' | 'payment' | 'system';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  data?: any;
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications, websocketStatus } = context;
  
  // Helper to filter notifications by type
  const getByType = (type: NotificationType) => {
    return notifications.filter(notification => notification.type === type);
  };
  
  // Get unread count by type
  const getUnreadCountByType = (type: NotificationType) => {
    return notifications.filter(notification => notification.type === type && !notification.read).length;
  };
  
  // Get most recent notification
  const getLatestNotification = () => {
    return notifications.length > 0 ? notifications[0] : null;
  };
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
    websocketStatus,
    paymentNotifications: getByType('payment'),
    messageNotifications: getByType('message'),
    jobNotifications: getByType('job'),
    systemNotifications: getByType('system'),
    unreadPaymentCount: getUnreadCountByType('payment'),
    unreadMessageCount: getUnreadCountByType('message'),
    unreadJobCount: getUnreadCountByType('job'),
    unreadSystemCount: getUnreadCountByType('system'),
    latestNotification: getLatestNotification(),
    isWebsocketConnected: websocketStatus === 'open'
  };
};
