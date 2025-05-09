import React from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Briefcase, MessageCircle, User, Plus, Star } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MobileMenu: React.FC = () => {
  const [location] = useLocation();
  const { user } = useAuth();

  const isPropertyOwner = user?.role === 'property_owner';

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-white shadow-md border-t border-neutral-200 md:hidden">
      <nav className="grid grid-cols-6 py-2">
        <Link href="/" className={`text-center flex flex-col items-center justify-center text-xs font-medium ${
            location === '/' ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            <Home className="h-6 w-6 mb-0.5" />
            Dashboard
        </Link>
        <Link href="/jobs" className={`text-center flex flex-col items-center justify-center text-xs font-medium ${
            location.startsWith('/jobs') && location !== '/jobs/post' ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            <Briefcase className="h-6 w-6 mb-0.5" />
            Jobs
        </Link>
        <Link href={isPropertyOwner ? "/jobs/post" : "/jobs"} className="text-center flex flex-col items-center justify-center text-xs font-medium text-neutral-500">
            <div className="h-12 w-12 rounded-full border-2 border-primary-500 flex items-center justify-center bg-primary-500 -mt-6">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="mt-1">{isPropertyOwner ? 'New Job' : 'Find Jobs'}</span>
        </Link>
        <Link href="/messages" className={`text-center flex flex-col items-center justify-center text-xs font-medium ${
            location.startsWith('/messages') ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            <MessageCircle className="h-6 w-6 mb-0.5" />
            Messages
        </Link>
        <Link href="/reviews" className={`text-center flex flex-col items-center justify-center text-xs font-medium ${
            location.startsWith('/reviews') ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            <Star className="h-6 w-6 mb-0.5" />
            Reviews
        </Link>
        <Link href="/profile" className={`text-center flex flex-col items-center justify-center text-xs font-medium ${
            location.startsWith('/profile') ? 'text-primary-600' : 'text-neutral-500'
          }`}>
            <User className="h-6 w-6 mb-0.5" />
            Profile
        </Link>
      </nav>
    </div>
  );
};

export default MobileMenu;
