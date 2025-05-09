import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import MessageList from '@/components/messages/MessageList';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const MessagesPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { conversations, loading } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Select first conversation by default
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      setSelectedConversation(conversations[0].jobId);
    }
  }, [conversations, selectedConversation]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const filteredConversations = conversations.filter(
    conversation => 
      conversation.counterparty.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      <AppHeader />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Messages</h1>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex h-[calc(100vh-12rem)] max-h-[800px]">
            <div className="w-full lg:w-1/3 border-r">
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                  <Input 
                    placeholder="Search messages..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="h-[calc(100%-4rem)]">
                {loading ? (
                  <div className="p-4 flex justify-center">
                    <div className="animate-spin w-6 h-6 border-3 border-primary border-t-transparent rounded-full"></div>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-neutral-500">No messages found.</p>
                    {searchTerm && (
                      <Button 
                        variant="link" 
                        onClick={() => setSearchTerm('')}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <div 
                      key={conversation.jobId}
                      className={`p-4 hover:bg-neutral-50 cursor-pointer ${
                        selectedConversation === conversation.jobId ? 'bg-neutral-100' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation.jobId)}
                    >
                      <div className="flex space-x-3">
                        <Avatar>
                          {conversation.counterparty.avatar ? (
                            <AvatarImage src={conversation.counterparty.avatar} alt={conversation.counterparty.username} />
                          ) : (
                            <AvatarFallback>
                              {conversation.counterparty.fullName 
                                ? getInitials(conversation.counterparty.fullName) 
                                : conversation.counterparty.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-medium text-neutral-900 truncate">
                              {conversation.counterparty.fullName || conversation.counterparty.username}
                            </h3>
                            <span className="text-xs text-neutral-500">
                              {formatDistanceToNow(new Date(conversation.lastMessageTime), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-neutral-500 mt-1">
                            {conversation.jobTitle}
                          </p>
                          <p className="text-sm text-neutral-600 truncate mt-1">
                            {conversation.lastMessage}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
            
            <div className="hidden lg:block lg:w-2/3">
              {selectedConversation ? (
                <MessageList jobId={selectedConversation} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-neutral-500">
                      Choose a conversation from the list to view messages
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default MessagesPage;
