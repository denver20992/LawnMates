import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PublicWebSocketTest() {
  const [status, setStatus] = useState<string>('disconnected');
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (wsRef.current) return;
    
    try {
      setStatus('connecting');
      addMessage('Connecting...');
      
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const url = `${protocol}//${window.location.host}/ws`;
      addMessage(`WebSocket URL: ${url}`);
      
      const socket = new WebSocket(url);
      wsRef.current = socket;
      
      socket.onopen = () => {
        setStatus('connected');
        addMessage('✅ Connected!');
        socket.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      };
      
      socket.onmessage = (event) => {
        addMessage(`📥 Received: ${event.data}`);
      };
      
      socket.onclose = (event) => {
        setStatus('disconnected');
        addMessage(`Connection closed (${event.code}): ${event.reason || 'No reason'}`);
        wsRef.current = null;
      };
      
      socket.onerror = (error) => {
        setStatus('error');
        addMessage(`⚠️ WebSocket error occurred`);
        console.error('WebSocket error:', error);
      };
    } catch (err: any) {
      setStatus('error');
      addMessage(`Error: ${err.message}`);
      console.error('WebSocket connection error:', err);
    }
  };
  
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setStatus('disconnected');
      addMessage('Disconnected by user');
    }
  };
  
  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const pingMsg = JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() });
      wsRef.current.send(pingMsg);
      addMessage(`📤 Sent: ${pingMsg}`);
    } else {
      addMessage('Cannot send - not connected');
    }
  };
  
  const addMessage = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessages(prev => [...prev, `[${timestamp}] ${msg}`]);
  };
  
  const clearLog = () => {
    setMessages([]);
  };
  
  const statusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">WebSocket Connection Test</h1>
      
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <div className={`mr-2 font-bold ${statusColor()}`}>
            Status: {status}
          </div>
        </div>
        
        <div className="flex space-x-2 mb-4">
          <Button onClick={connect} disabled={wsRef.current !== null}>
            Connect
          </Button>
          <Button onClick={disconnect} disabled={wsRef.current === null} variant="outline">
            Disconnect
          </Button>
          <Button onClick={sendPing} disabled={wsRef.current === null || wsRef.current.readyState !== WebSocket.OPEN} variant="outline">
            Send Ping
          </Button>
          <Button onClick={clearLog} variant="ghost">
            Clear Log
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 rounded p-3 max-h-[400px] overflow-y-auto font-mono text-sm">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No messages yet. Click "Connect" to start.</div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className="pb-1">{msg}</div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}