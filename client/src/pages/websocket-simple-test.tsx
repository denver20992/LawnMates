import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';

export default function WebSocketSimpleTest() {
  const [status, setStatus] = useState<string>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string>('');
  const wsRef = useRef<WebSocket | null>(null);

  // Initialize WebSocket URL
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const domain = window.location.host;
    setWsUrl(`${protocol}//${domain}/ws`);
  }, []);

  const connect = () => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      // Already connected or connecting
      return;
    }

    try {
      setStatus('connecting');
      addMessage(`Connecting to ${wsUrl}...`);

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setStatus('connected');
        addMessage('✅ Connection established');
      };

      socket.onmessage = (event) => {
        addMessage(`📥 Received: ${event.data}`);
      };

      socket.onclose = (event) => {
        setStatus('disconnected');
        addMessage(`❌ Connection closed: ${event.reason || 'No reason provided'} (Code: ${event.code})`);
        wsRef.current = null;
      };

      socket.onerror = (error) => {
        setStatus('error');
        addMessage(`🚨 WebSocket error`);
        console.error('WebSocket error:', error);
      };
    } catch (err: any) {
      setStatus('error');
      addMessage(`🚨 Failed to create WebSocket: ${err.message}`);
      console.error('WebSocket creation error:', err);
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      setStatus('disconnected');
      addMessage('Disconnected by user');
      wsRef.current = null;
    }
  };

  const sendMessage = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && inputMessage) {
      try {
        wsRef.current.send(inputMessage);
        addMessage(`📤 Sent: ${inputMessage}`);
        setInputMessage('');
      } catch (err: any) {
        addMessage(`🚨 Failed to send: ${err.message}`);
      }
    } else {
      addMessage('❌ Cannot send: Not connected or empty message');
    }
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const pingMessage = JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() });
      try {
        wsRef.current.send(pingMessage);
        addMessage(`📤 Sent ping: ${pingMessage}`);
      } catch (err: any) {
        addMessage(`🚨 Failed to send ping: ${err.message}`);
      }
    } else {
      addMessage('❌ Cannot send ping: Not connected');
    }
  };

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">WebSocket Simple Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className={`w-3 h-3 rounded-full mr-2 ${getStatusColor()}`}></span>
              Status: {status}
            </CardTitle>
            <CardDescription>
              WebSocket URL: {wsUrl}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-x-2">
              <Button onClick={connect} disabled={status === 'connected' || status === 'connecting'}>
                Connect
              </Button>
              <Button onClick={disconnect} disabled={status !== 'connected'} variant="outline">
                Disconnect
              </Button>
              <Button onClick={sendPing} disabled={status !== 'connected'} variant="outline">
                Send Ping
              </Button>
              <Button onClick={clearMessages} variant="ghost">
                Clear Log
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Send Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Enter message to send..."
                disabled={status !== 'connected'}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={status !== 'connected' || !inputMessage}>
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Message Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md h-80 overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-1">
                {messages.map((msg, i) => (
                  <div key={i} className="font-mono text-sm">{msg}</div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center pt-8">No messages yet. Connect to the WebSocket to get started.</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Alert className="mt-6">
        <AlertTitle>WebSocket Troubleshooting Tips</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Check if your browser supports WebSockets (all modern browsers do)</li>
            <li>Ensure the server is running and WebSocket service is enabled</li>
            <li>Verify the WebSocket URL is correct</li>
            <li>Check for any network issues (firewalls, proxies, etc.)</li>
            <li>Look for detailed errors in the browser console</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}