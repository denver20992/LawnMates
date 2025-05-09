import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import SavedPropertiesList from '@/components/properties/SavedPropertiesList';
import { Button } from '@/components/ui/button';

const SavedPropertiesPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    // Redirect non-property owners away 
    if (!isLoading && isAuthenticated && user?.role !== 'property_owner') {
      setLocation('/');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  const handleCreateJob = () => {
    setLocation('/jobs/post');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render if not authenticated or not a property owner
  if (!isAuthenticated || user?.role !== 'property_owner') {
    return null;
  }

  return (
    <div className="pb-16 md:pb-0">
      <AppHeader />
      
      <div className="mx-auto max-w-7xl py-6">
        <div className="mx-4 sm:mx-6 lg:mx-8 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Saved Properties</h1>
            <p className="text-neutral-600 mt-1">
              Manage your saved properties and easily create recurring jobs
            </p>
          </div>
          <Button onClick={() => setLocation('/properties/add')}>
            Add Property
          </Button>
        </div>
        
        <div className="mx-4 sm:mx-6 lg:mx-8">
          <SavedPropertiesList onCreateJob={handleCreateJob} />
        </div>
      </div>
      
      <MobileMenu />
    </div>
  );
};

export default SavedPropertiesPage;