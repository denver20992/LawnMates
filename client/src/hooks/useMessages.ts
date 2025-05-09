import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Message } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from './useAuth';

interface SendMessageData {
  jobId: number;
  receiverId: number;
  content: string;
}

interface Conversation {
  jobId: number;
  jobTitle: string;
  counterparty: {
    id: number;
    username: string;
    fullName?: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export const useMessages = (limit?: number, jobId?: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch messages for a specific job
  const { 
    data: messages = [], 
    isLoading: loading,
    error,
    refetch: loadMessages
  } = useQuery<Message[]>({
    queryKey: jobId ? [`/api/messages/${jobId}`] : ['/api/messages'],
    enabled: !!user && (jobId !== undefined),
  });

  // Fetch conversations (grouped messages by job)
  const {
    data: conversationsData = [],
    isLoading: conversationsLoading,
  } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!user && !jobId,
  });

  // Sending messages
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: SendMessageData) => {
      const res = await apiRequest('POST', '/api/messages', messageData);
      return res.json();
    },
    onSuccess: (data, variables) => {
      // Update messages for the specific job
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${variables.jobId}`] });
      // Update conversations list
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
    }
  });

  // Sort conversations by last message time
  const conversations = [...conversationsData].sort((a, b) => {
    return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
  });

  // If a limit is provided, limit the number of conversations
  const limitedConversations = limit ? conversations.slice(0, limit) : conversations;

  const sendMessage = useCallback(async (messageData: SendMessageData) => {
    return sendMessageMutation.mutateAsync(messageData);
  }, [sendMessageMutation]);

  // Add properties to each message to make it easier to display
  const enhancedMessages = messages.map(message => ({
    ...message,
    // In a real implementation, this would be fetched from the API
    sender: {
      username: message.senderId === user?.id ? user.username : 'User',
      avatar: undefined,
      fullName: undefined
    }
  }));

  return {
    messages: enhancedMessages,
    conversations: limitedConversations,
    loading: loading || conversationsLoading,
    error,
    sendMessage,
    loadMessages
  };
};
