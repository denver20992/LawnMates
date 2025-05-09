import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PropertyForm from '@/components/properties/PropertyForm';
import { PageHeader } from '@/components/ui/page-header';

export default function AddPropertyPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSuccess = () => {
    setIsSubmitting(false);
    toast({
      title: "Property added",
      description: "Your property has been added successfully.",
    });
    navigate('/properties/saved');
  };

  return (
    <div className="container max-w-3xl mx-auto py-6 px-4 sm:px-6">
      <PageHeader 
        title="Add Property" 
        description="Add a new property to your profile"
      />

      {isSubmitting && (
        <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50">
          <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-lg">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Creating property...
            </p>
          </div>
        </div>
      )}

      <div className="mt-6">
        <PropertyForm 
          onSuccess={handleSuccess}
          onSubmit={() => setIsSubmitting(true)}
        />
      </div>
    </div>
  );
}