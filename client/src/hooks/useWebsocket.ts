import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

type WebSocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface UseWebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectDelay?: number;
  autoReconnect?: boolean;
}

export const useWebsocket = (options: UseWebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<WebSocketStatus>('closed');
  const { isAuthenticated, user } = useAuth();

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) {
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const newSocket = new WebSocket(wsUrl);
      setSocket(newSocket);
      setStatus('connecting');

      newSocket.onopen = () => {
        setStatus('open');
        
        // Send authentication message
        newSocket.send(JSON.stringify({
          type: 'auth',
          userId: user.id
        }));

        if (options.onOpen) {
          options.onOpen();
        }
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (options.onMessage) {
            options.onMessage(data);
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      newSocket.onclose = () => {
        setStatus('closed');
        setSocket(null);
        
        if (options.onClose) {
          options.onClose();
        }

        // Reconnect if enabled
        if (options.autoReconnect !== false) {
          setTimeout(() => {
            connect();
          }, options.reconnectDelay || 5000);
        }
      };

      newSocket.onerror = (error) => {
        setStatus('error');
        
        if (options.onError) {
          options.onError(error);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setStatus('error');
    }
  }, [isAuthenticated, user, options]);

  const disconnect = useCallback(() => {
    if (socket && (status === 'open' || status === 'connecting')) {
      socket.close();
      setStatus('closed');
      setSocket(null);
    }
  }, [socket, status]);

  const send = useCallback((data: any) => {
    if (socket && status === 'open') {
      socket.send(typeof data === 'string' ? data : JSON.stringify(data));
      return true;
    }
    return false;
  }, [socket, status]);

  // Connect on mount if authenticated
  useEffect(() => {
    if (isAuthenticated && !socket) {
      connect();
    }
    
    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, connect, disconnect, socket]);

  return {
    status,
    isConnected: status === 'open',
    connect,
    disconnect,
    send
  };
};