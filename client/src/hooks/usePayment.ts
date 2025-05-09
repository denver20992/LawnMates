import { useState } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@shared/schema';

interface UsePaymentProps {
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const usePayment = (props?: UsePaymentProps) => {
  const { onSuccess, onError } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const { toast } = useToast();

  const createPaymentIntent = async (job: Job) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/create-payment-intent', {
        jobId: job.id,
        amount: job.price
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }
      
      setClientSecret(data.clientSecret);
      return data.clientSecret;
    } catch (error: any) {
      toast({
        title: 'Payment Setup Failed',
        description: error.message || 'Could not process payment request. Please try again.',
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const releasePayment = async (jobId: number) => {
    setIsLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/release-payment', {
        jobId
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to release payment');
      }
      
      toast({
        title: 'Payment Released',
        description: 'The payment has been successfully released to the landscaper.',
      });
      
      if (onSuccess) onSuccess();
      return true;
    } catch (error: any) {
      toast({
        title: 'Payment Release Failed',
        description: error.message || 'Could not release payment. Please try again.',
        variant: 'destructive',
      });
      
      if (onError) onError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    clientSecret,
    createPaymentIntent,
    releasePayment
  };
};