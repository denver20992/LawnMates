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
    console.log('Attempting to connect to WebSocket...');
    console.log('Authentication status:', isAuthenticated);
    console.log('User:', user);
    
    if (!isAuthenticated || !user) {
      console.log('Not connecting WebSocket - not authenticated or no user');
      return;
    }

    // Check protocol and build WS URL
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    console.log(`Connecting to WebSocket at ${wsUrl}`);
    
    try {
      // Create new WebSocket connection with explicit error handling
      console.log('Creating new WebSocket instance...');
      const newSocket = new WebSocket(wsUrl);
      console.log('WebSocket instance created, setting up event handlers');
      setSocket(newSocket);
      setStatus('connecting');

      newSocket.onopen = () => {
        setStatus('open');
        console.log('WebSocket connection established successfully');
        
        try {
          // Send identification message to the server
          const userId = typeof user.id === 'number' ? user.id : parseInt(user.id as string);
          const identifyMessage = JSON.stringify({
            type: 'identify',
            userId
          });
          
          console.log(`Sending identify message: ${identifyMessage}`);
          newSocket.send(identifyMessage);

          if (options.onOpen) {
            options.onOpen();
          }
        } catch (err) {
          console.error('Error during WebSocket identification:', err);
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
        console.error('WebSocket error event triggered:', error);
        console.log('WebSocket readyState:', newSocket.readyState);
        console.log('WebSocket URL:', newSocket.url);
        
        // Log more detailed network information if available
        try {
          // NetworkInformation API is not well-supported across browsers
          // so we need to be extra careful when accessing it
          const connection = (navigator as any).connection;
          if (connection) {
            console.log('Network information:', {
              effectiveType: connection.effectiveType || 'unknown',
              downlink: connection.downlink || 'unknown',
              rtt: connection.rtt || 'unknown'
            });
          }
        } catch (err) {
          console.log('Network information API not available');
        }
        
        setStatus('error');
        
        if (options.onError) {
          options.onError(error);
        }
        
        // Try to reset the connection
        setTimeout(() => {
          console.log('Attempting to reconnect after error');
          disconnect();
          connect();
        }, 3000);
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