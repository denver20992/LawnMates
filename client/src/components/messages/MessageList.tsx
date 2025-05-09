import React, { useEffect, useRef, useState } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Info, Image } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface MessageListProps {
  jobId: number;
}

const MessageList: React.FC<MessageListProps> = ({ jobId }) => {
  const { user } = useAuth();
  const { messages, sendMessage, loading, loadMessages, error } = useMessages(undefined, jobId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  // Load job details - this would come from an API in a full implementation
  useEffect(() => {
    // Simulate loading job details
    const loadJobDetails = async () => {
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        if (response.ok) {
          const data = await response.json();
          setJobDetails(data);
        }
      } catch (error) {
        console.error('Failed to load job details:', error);
      }
    };

    loadJobDetails();
  }, [jobId]);

  useEffect(() => {
    // Scroll to bottom of messages when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !user) return;

    try {
      // In a full implementation, we'd get the receiver ID from the job details
      const receiverId = jobDetails?.ownerId === user.id 
        ? jobDetails?.landscaperId 
        : jobDetails?.ownerId;
      
      if (!receiverId) {
        console.error('Cannot determine message recipient');
        return;
      }

      await sendMessage({
        content: messageText,
        jobId,
        receiverId
      });
      
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <Info className="h-10 w-10 text-red-500 mb-2" />
        <h3 className="text-lg font-medium text-neutral-900">Failed to load messages</h3>
        <p className="text-neutral-600 mt-1">There was an error loading your messages. Please try again.</p>
        <Button onClick={() => loadMessages(jobId)} className="mt-4">Retry</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      {jobDetails && (
        <Card className="mb-4">
          <CardHeader className="py-3">
            <CardTitle className="text-base">{jobDetails.title}</CardTitle>
            <CardDescription className="text-xs">
              {jobDetails.status === 'completed' 
                ? 'This job has been completed' 
                : jobDetails.status === 'in_progress'
                ? 'This job is in progress'
                : 'This job is scheduled'}
            </CardDescription>
          </CardHeader>
        </Card>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 rounded-lg">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Info className="h-10 w-10 text-neutral-400 mb-2" />
            <h3 className="text-lg font-medium text-neutral-700">No messages yet</h3>
            <p className="text-neutral-500 mt-1">Send the first message to start the conversation.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === user?.id;
            const sender = message.sender || { username: 'Unknown User' };
            
            return (
              <div 
                key={message.id} 
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8 mr-2">
                      {sender.avatar ? (
                        <AvatarImage src={sender.avatar} alt={sender.username} />
                      ) : (
                        <AvatarFallback>
                          {sender.fullName 
                            ? getInitials(sender.fullName) 
                            : sender.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  )}
                  <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                    <div 
                      className={`rounded-lg px-4 py-2 max-w-full break-words ${
                        isOwnMessage 
                          ? 'bg-primary-600 text-white mr-2' 
                          : 'bg-white text-neutral-800 ml-2'
                      } shadow-sm`}
                    >
                      <p>{message.content}</p>
                    </div>
                    <span className={`text-xs text-neutral-500 mt-1 ${isOwnMessage ? 'mr-2' : 'ml-2'}`}>
                      {format(new Date(message.createdAt), 'h:mm a')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 bg-white rounded-lg shadow-sm mt-2">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0"
          >
            <Image className="h-5 w-5" />
            <span className="sr-only">Add image</span>
          </Button>
          <Input
            type="text"
            placeholder="Type your message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
          />
          <Button 
            type="submit"
            className="flex-shrink-0"
            disabled={!messageText.trim()}
          >
            <Send className="h-5 w-5 mr-1" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default MessageList;
