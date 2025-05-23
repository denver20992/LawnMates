import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import JobPostForm from '@/components/jobs/JobPostForm';

const JobPostPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    // Redirect landscapers away from job posting
    if (!isLoading && isAuthenticated && user?.role !== 'property_owner') {
      setLocation('/jobs');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const handleSuccess = () => {
    setLocation('/jobs');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render the form if not authenticated or not a property owner
  if (!isAuthenticated || user?.role !== 'property_owner') {
    return null;
  }

  return (
    <div className="pb-16 md:pb-0">
      <AppHeader />
      
      <div className="mx-auto max-w-7xl py-6">
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Post a New Job</h1>
          <p className="text-neutral-600 mt-1">
            Fill out the form below to find a landscaper for your property
          </p>
        </div>
        
        <JobPostForm onSuccess={handleSuccess} />
      </div>
      
      <MobileMenu />
    </div>
  );
};

export default JobPostPage;
