import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { log } from "./vite";

interface WebSocketClient extends WebSocket {
  userId?: number;
  isAlive?: boolean;
}

export function setupWebsocket(httpServer: HttpServer): void {
  // Configure WebSocket server explicitly with all available options
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws',
    clientTracking: true,
    perMessageDeflate: false // Disable compression for simplicity during debugging
  });
  
  // Log when WebSocket server is ready
  wss.on('listening', () => {
    console.log('WebSocket server listening at path: /ws');
  });
  
  // Store connected clients by user ID
  const clients = new Map<number, WebSocketClient>();
  
  // Log total connections
  setInterval(() => {
    console.log(`WebSocket status: ${wss.clients.size} total connection(s)`);
  }, 10000);
  
  wss.on('connection', (ws: WebSocketClient, req) => {
    // Log connection details
    console.log(`WebSocket client connected from ${req.socket.remoteAddress} with headers:`, {
      origin: req.headers.origin,
      host: req.headers.host,
      upgrade: req.headers.upgrade,
      path: req.url
    });
    
    // Set isAlive flag for heartbeat
    ws.isAlive = true;
    
    // Send immediate welcome message to confirm connection
    try {
      // Give the connection a moment to stabilize before sending messages
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: 'welcome',
            message: 'Connection established successfully',
            timestamp: new Date().toISOString()
          }));
          log('Sent welcome message to client', 'websocket');
        }
      }, 100);
    } catch (err) {
      console.error('Failed to send welcome message:', err);
    }
    
    // Handle messages from clients
    ws.on('message', (message: any) => {
      try {
        // Log the raw message for debugging
        const messageStr = message.toString();
        console.log('Received WebSocket message:', messageStr);
        
        // Handle ping messages with simple text
        if (messageStr === 'ping' || messageStr === '"ping"') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString()
          }));
          return;
        }
        
        // Try to parse as JSON
        let data: any;
        try {
          data = JSON.parse(messageStr);
        } catch (e) {
          const parseError = e as Error;
          console.warn('Received non-JSON message:', messageStr);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid JSON format',
            error: parseError.message
          }));
          return;
        }
        
        console.log('Parsed WebSocket message:', data);
        
        // Handle direct ping message
        if (data.type === 'ping') {
          ws.send(JSON.stringify({
            type: 'pong',
            timestamp: new Date().toISOString(),
            echo: data
          }));
          return;
        }
        
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
              status: 'success',
              userId: userId,
              timestamp: new Date().toISOString()
            });
            ws.send(confirmation);
          } catch (err) {
            console.error('Failed to send confirmation:', err);
          }
        } else if (data.type !== 'ping') {
          console.warn('Received message without proper identification:', data);
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Please identify first with a userId',
            timestamp: new Date().toISOString()
          }));
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
        try {
          ws.send(JSON.stringify({
            type: 'error',
            message: `Error processing message: ${error.message}`,
            timestamp: new Date().toISOString()
          }));
        } catch (sendError) {
          console.error('Failed to send error response:', sendError);
        }
      }
    });
    
    // Handle client disconnections
    ws.on('close', (code, reason) => {
      if (ws.userId) {
        clients.delete(ws.userId);
        console.log(`WebSocket client ${ws.userId} disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
      } else {
        console.log(`Unidentified WebSocket client disconnected. Code: ${code}, Reason: ${reason || 'No reason provided'}`);
      }
    });
    
    // Handle connection errors
    ws.on('error', (err) => {
      console.error('WebSocket connection error:', err);
      if (ws.userId) {
        clients.delete(ws.userId);
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
