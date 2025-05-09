import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  
  const sendIdentify = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      // Use a test user ID (this can be any number)
      const identifyMsg = JSON.stringify({ 
        type: 'identify', 
        userId: 999, 
        timestamp: new Date().toISOString() 
      });
      wsRef.current.send(identifyMsg);
      addMessage(`📤 Sent identify: ${identifyMsg}`);
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

  // Get readable WebSocket state
  const getReadyStateText = () => {
    if (!wsRef.current) return 'Not connected';
    
    switch (wsRef.current.readyState) {
      case WebSocket.CONNECTING: return 'CONNECTING';
      case WebSocket.OPEN: return 'OPEN';
      case WebSocket.CLOSING: return 'CLOSING';
      case WebSocket.CLOSED: return 'CLOSED';
      default: return 'UNKNOWN';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">WebSocket Connection Test</h1>
      <p className="text-gray-600 mb-4">This page tests direct WebSocket communication without authentication</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Connection Status</CardTitle>
            <CardDescription>Current WebSocket connection state</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Status:</span>
                <Badge className={`${statusColor()} bg-opacity-20`}>
                  {status.toUpperCase()}
                </Badge>
              </div>
              
              {wsRef.current && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Ready State:</span>
                  <Badge variant="outline">{getReadyStateText()}</Badge>
                </div>
              )}
              
              <div className="pt-2">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={connect} disabled={wsRef.current !== null}>
                    Connect
                  </Button>
                  <Button onClick={disconnect} disabled={wsRef.current === null} variant="outline">
                    Disconnect
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Actions</CardTitle>
            <CardDescription>Send test messages to the server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <Button onClick={sendPing} disabled={wsRef.current === null || wsRef.current.readyState !== WebSocket.OPEN} variant="default">
                  Send Ping
                </Button>
                <Button onClick={sendIdentify} disabled={wsRef.current === null || wsRef.current.readyState !== WebSocket.OPEN} variant="secondary">
                  Send Identify
                </Button>
                <Button onClick={clearLog} variant="ghost">
                  Clear Log
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 mt-2">
                <p>1. First <strong>Connect</strong> to establish a WebSocket connection</p>
                <p>2. Then send a <strong>Ping</strong> to test basic communication</p>
                <p>3. Finally <strong>Identify</strong> to maintain a persistent connection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Log</CardTitle>
          <CardDescription>Real-time communication between client and server</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-900 rounded p-3 max-h-[400px] overflow-y-auto font-mono text-sm">
            {messages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">No messages yet. Click "Connect" to start.</div>
            ) : (
              messages.map((msg, i) => {
                // Color-code different message types
                let className = "pb-1";
                if (msg.includes("Received")) className += " text-blue-600 dark:text-blue-400";
                else if (msg.includes("Sent")) className += " text-green-600 dark:text-green-400";
                else if (msg.includes("error") || msg.includes("closed")) className += " text-red-600 dark:text-red-400";
                else if (msg.includes("Connected")) className += " text-emerald-600 dark:text-emerald-400 font-semibold";
                
                return (
                  <div key={i} className={className}>{msg}</div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}