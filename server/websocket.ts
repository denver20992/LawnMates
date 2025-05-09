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
        const data = JSON.parse(message.toString());
        
        // Handle client identification
        if (data.type === 'identify' && data.userId) {
          const userId = parseInt(data.userId);
          ws.userId = userId;
          clients.set(userId, ws);
          console.log(`Client identified as user ${userId}`);
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
      client.send(JSON.stringify({
        type: 'notification',
        ...notification
      }));
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
