import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export function setupWebsocket(httpServer: HttpServer): void {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients by user ID
  const clients = new Map<number, WebSocketClient>();
  
  wss.on('connection', (ws: WebSocketClient) => {
    console.log('WebSocket client connected');
    
    // Set isAlive flag for heartbeat
    ws.isAlive = true;
    
    // Handle messages from clients
    ws.on('message', (message: string) => {
      try {
        // Log the raw message for debugging
        console.log('Received WebSocket message:', message.toString());
        
        const data = JSON.parse(message.toString());
        console.log('Parsed WebSocket message:', data);
        
        // Handle client identification
        if (data.type === 'identify' && data.userId) {
          // Parse userId and ensure it's a number
          let userId: number;
          
          if (typeof data.userId === 'number') {
            userId = data.userId;
          } else if (typeof data.userId === 'string') {
            userId = parseInt(data.userId);
            if (isNaN(userId)) {
              throw new Error(`Invalid userId format: ${data.userId}`);
            }
          } else {
            throw new Error(`Unexpected userId type: ${typeof data.userId}`);
          }
          
          ws.userId = userId;
          clients.set(userId, ws);
          console.log(`Client identified as user ${userId}`);
          
          // Send a confirmation
          try {
            const confirmation = JSON.stringify({
              type: 'confirmation',
              message: 'Successfully identified',
              status: 'success'
            });
            ws.send(confirmation);
          } catch (err) {
            console.error('Failed to send confirmation:', err);
          }
        } else {
          console.warn('Received message without proper identification:', data);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    // Handle client disconnections
    ws.on('close', () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`WebSocket client ${ws.userId} disconnected`);
      } else {
        console.log('Unidentified WebSocket client disconnected');
      }
    });
    
    // Handle pong response for heartbeat
    ws.on('pong', () => {
      ws.isAlive = true;
    });
  });
  
  // Heartbeat to check for disconnected clients
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (ws.isAlive === false) {
        if (ws.userId) {
          clients.delete(ws.userId);
        }
        return ws.terminate();
      }
      
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
  
  wss.on('close', () => {
    clearInterval(interval);
  });
  
  // Function to send a notification to a specific user
  function sendNotification(userId: number, notification: any): void {
    const client = clients.get(userId);
    
    if (client && client.readyState === WebSocket.OPEN) {
      try {
        // Use a safer approach by explicitly constructing the notification object
        const notificationData = {
          type: 'notification',
          id: notification.id || `notification-${Date.now()}`,
          message: notification.message || '',
          notificationType: notification.notificationType || 'system',
          data: notification.data || null,
          timestamp: notification.timestamp || new Date().toISOString()
        };
        
        client.send(JSON.stringify(notificationData));
      } catch (error) {
        console.error('Error sending notification to client:', error);
      }
    }
  }
  
  // Export the sendNotification function to the global scope
  // so it can be used in other modules
  (global as any).sendWebSocketNotification = sendNotification;
}

// Function to send a notification from anywhere in the application
export function sendNotification(userId: number, notification: {
  id?: string;
  message: string;
  notificationType: 'message' | 'job' | 'payment' | 'system';
  data?: any;
}): void {
  const sendFunc = (global as any).sendWebSocketNotification;
  
  if (typeof sendFunc === 'function') {
    sendFunc(userId, {
      id: notification.id || `notification-${Date.now()}`,
      message: notification.message,
      notificationType: notification.notificationType,
      data: notification.data,
      timestamp: new Date().toISOString()
    });
  }
}
