import React from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft } from 'lucide-react';
import PropertyForm from '@/components/properties/PropertyForm';
import { PageHeader } from '@/components/ui/page-header';

const AddPropertyPage: React.FC = () => {
  const [, navigate] = useLocation();
  
  const handleGoBack = () => {
    navigate('/properties/saved');
  };
  
  const handleSuccess = () => {
    navigate('/properties/saved');
  };
  
  return (
    <div className="container max-w-6xl mx-auto py-6 space-y-8">
      <PageHeader
        title="Add New Property"
        description="Create a new property for one-time or recurring lawn care services"
        actions={
          <Button onClick={handleGoBack} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        }
      />
      
      <Separator />
      
      <PropertyForm onSuccess={handleSuccess} />
    </div>
  );
};

export default AddPropertyPage;