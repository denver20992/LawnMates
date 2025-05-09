import React from 'react';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'wouter';
import { formatDistanceToNow } from 'date-fns';

interface RecentMessagesSectionProps {
  limit?: number;
}

const RecentMessagesSection: React.FC<RecentMessagesSectionProps> = ({ limit = 3 }) => {
  const { messages, loading } = useMessages(limit);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Messages</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-neutral-200 h-10 w-10"></div>
            <div className="flex-1 space-y-3">
              <div className="h-2 bg-neutral-200 rounded"></div>
              <div className="h-2 bg-neutral-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-neutral-900">Recent Messages</h2>
        </div>
        <div className="bg-white shadow rounded-lg p-8 text-center">
          <p className="text-neutral-500">No messages yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">Recent Messages</h2>
        <Link href="/messages">
          <a className="text-sm font-medium text-primary-600 hover:text-primary-800">View All</a>
        </Link>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ul role="list" className="divide-y divide-neutral-200">
          {messages.map((message) => (
            <li key={message.id} className="p-4 hover:bg-neutral-50 cursor-pointer">
              <Link href={`/messages/${message.jobId}`}>
                <a className="block">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Avatar>
                        {message.sender.avatar ? (
                          <AvatarImage src={message.sender.avatar} alt={message.sender.username} />
                        ) : (
                          <AvatarFallback>
                            {message.sender.fullName 
                              ? getInitials(message.sender.fullName) 
                              : message.sender.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-neutral-900">
                        {message.sender.fullName || message.sender.username}
                      </p>
                      <p className="truncate text-sm text-neutral-500">
                        {message.content}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <p className="text-xs text-neutral-500">
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </p>
                        {message.status === 'sent' && (
                          <div className="ml-2 flex-shrink-0">
                            <span className="inline-block h-2 w-2 rounded-full bg-primary-500"></span>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-neutral-500">Job #{message.jobId}</p>
                    </div>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecentMessagesSection;
