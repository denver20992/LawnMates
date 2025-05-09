import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation, useSearch } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { usePayment } from "@/hooks/usePayment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { Job } from '@shared/schema';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ job }: { job: Job }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your payment!",
        });
      }
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 rounded-md">
        <PaymentElement />
      </div>
      
      <div className="flex flex-col space-y-2">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          size="lg"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${job.price.toFixed(2)}`
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Return to Dashboard
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const jobId = params.get('jobId');
  const [, navigate] = useLocation();

  // Fetch job details
  const { data: job, isLoading: isJobLoading, error: jobError } = useQuery({
    queryKey: ['/api/jobs', jobId],
    queryFn: async () => {
      if (!jobId) return null;
      const response = await apiRequest('GET', `/api/jobs/${jobId}`);
      return response.json();
    },
    enabled: !!jobId,
  });

  // Use our payment hook
  const { createPaymentIntent, isLoading: isPaymentLoading } = usePayment({
    onError: () => {
      navigate('/dashboard');
    }
  });
  
  useEffect(() => {
    if (!jobId) {
      toast({
        title: "Missing Job ID",
        description: "No job was specified for payment",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    if (job) {
      // Create PaymentIntent as soon as the job data is available
      createPaymentIntent(job)
        .then((secret) => {
          if (secret) {
            setClientSecret(secret);
          }
        });
    }
  }, [job, jobId, navigate, toast, createPaymentIntent]);

  if (isJobLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Job</h1>
        <p className="text-gray-600 mb-6">
          We couldn't load the job details. Please try again or return to the dashboard.
        </p>
        <Button onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-12 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            Secure payment for job #{job.id}: {job.title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="bg-green-50 p-4 rounded-md flex items-start space-x-3">
              <CheckCircle2 className="text-green-500 h-5 w-5 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-800">Secure Escrow Payment</h3>
                <p className="text-sm text-green-700">
                  Your payment will be held in escrow until the job is verified as complete.
                </p>
              </div>
            </div>
            
            <div className="rounded-md border p-4">
              <h3 className="font-semibold mb-3">Job Summary</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-gray-500">Service:</div>
                <div>{job.title}</div>
                
                <div className="text-gray-500">Address:</div>
                <div>{job.propertyAddress}</div>
                
                <div className="text-gray-500">Status:</div>
                <div className="capitalize">{job.status.replace('_', ' ')}</div>
                
                <div className="text-gray-500">Price:</div>
                <div className="font-semibold">${job.price.toFixed(2)}</div>
              </div>
            </div>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm job={job} />
            </Elements>
          ) : (
            <div className="py-8 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col">
          <p className="text-xs text-gray-500 mt-4">
            Your payment information is securely processed by Stripe. LawnMates does not store your card details.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}