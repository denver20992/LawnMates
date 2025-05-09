import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function WebSocketTestPage() {
  const [wsStatus, setWsStatus] = useState<string>('Not connected');
  const [wsMessages, setWsMessages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<any>(null);
  const [wsTestLoading, setWsTestLoading] = useState(false);
  const [endpointTestLoading, setEndpointTestLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Test the websocket diagnostic endpoint
  const testEndpoint = async () => {
    setEndpointTestLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/websocket-test');
      const data = await response.json();
      setInfo(data);
    } catch (err: any) {
      setError(`Endpoint test failed: ${err.message}`);
    } finally {
      setEndpointTestLoading(false);
    }
  };

  // Test direct WebSocket connection
  const testWebsocket = () => {
    setWsTestLoading(true);
    setWsStatus('Connecting...');
    setError(null);
    setWsMessages([]);
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      console.log(`Attempting direct WebSocket connection to ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setWsStatus('Connected');
        setWsMessages(prev => [...prev, 'WebSocket connection established']);
        
        // If authenticated, send identification
        if (isAuthenticated && user) {
          const identifyMsg = {
            type: 'identify',
            userId: user.id
          };
          ws.send(JSON.stringify(identifyMsg));
          setWsMessages(prev => [...prev, `Sent identification message: ${JSON.stringify(identifyMsg)}`]);
        } else {
          setWsMessages(prev => [...prev, 'Not authenticated, skipping identification']);
        }
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setWsMessages(prev => [...prev, `Received: ${JSON.stringify(data)}`]);
        } catch (err) {
          setWsMessages(prev => [...prev, `Received non-JSON message: ${event.data}`]);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket test error:', error);
        setWsStatus('Error');
        setError('WebSocket connection error');
      };
      
      ws.onclose = () => {
        setWsStatus('Closed');
        setWsMessages(prev => [...prev, 'WebSocket connection closed']);
        setWsTestLoading(false);
      };
      
      // Close the test connection after 10 seconds
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          setWsMessages(prev => [...prev, 'Closing test connection after timeout']);
          ws.close();
        }
      }, 10000);
    } catch (err: any) {
      setWsStatus('Failed');
      setError(`WebSocket test failed: ${err.message}`);
      setWsTestLoading(false);
    }
  };

  // Run the endpoint test on page load
  useEffect(() => {
    testEndpoint();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">WebSocket Connection Tester</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>WebSocket Diagnostic Endpoint</CardTitle>
            <CardDescription>Tests the server endpoint that provides WebSocket configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {info ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
                {JSON.stringify(info, null, 2)}
              </pre>
            ) : (
              <p>No information available</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={testEndpoint} disabled={endpointTestLoading}>
              {endpointTestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Endpoint'
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Direct WebSocket Connection</CardTitle>
            <CardDescription>Attempts to directly connect to the WebSocket server</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <span className="font-bold">Status:</span> {wsStatus}
            </div>
            <div className="mb-4">
              <span className="font-bold">User:</span> {isAuthenticated ? `Authenticated (ID: ${user?.id})` : 'Not authenticated'}
            </div>
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-40">
              {wsMessages.length > 0 ? (
                wsMessages.map((msg, i) => <div key={i}>{msg}</div>)
              ) : (
                <p>No messages yet</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={testWebsocket} disabled={wsTestLoading}>
              {wsTestLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test WebSocket'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}