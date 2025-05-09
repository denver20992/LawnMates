import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const CheckoutForm = ({ jobId, amount }: { jobId: number, amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!stripe || !elements) {
      setIsLoading(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/dashboard",
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
        description: "Thank you for your payment! The funds will be held in escrow until the job is completed.",
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      <div className="mt-4">
        <Button 
          type="submit" 
          className="w-full" 
          disabled={!stripe || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount/100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [jobDetails, setJobDetails] = useState<{id: number, title: string, amount: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [, params] = useLocation();

  // Extract jobId from URL query params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('jobId');

    if (!jobId) {
      setError("Missing job ID. Please go back and try again.");
      setIsLoading(false);
      return;
    }

    // Fetch job details
    apiRequest("GET", `/api/jobs/${jobId}`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch job details");
        return res.json();
      })
      .then(job => {
        setJobDetails({
          id: job.id,
          title: job.title,
          amount: job.price
        });

        // Create PaymentIntent
        return apiRequest("POST", "/api/create-payment-intent", { jobId: job.id })
      })
      .then(res => {
        if (!res.ok) throw new Error("Failed to create payment intent");
        return res.json();
      })
      .then(data => {
        setClientSecret(data.clientSecret);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error in checkout:", err);
        setError(err.message || "An error occurred during checkout");
        toast({
          title: "Checkout Error",
          description: err.message || "Failed to set up payment. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Preparing your checkout...</p>
        </div>
      </div>
    );
  }

  if (error || !jobDetails) {
    return (
      <div className="container max-w-md py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-destructive">Checkout Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">{error || "Could not load job details"}</p>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-16">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>
            {jobDetails.title} - ${(jobDetails.amount/100).toFixed(2)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
              <CheckoutForm jobId={jobDetails.id} amount={jobDetails.amount} />
            </Elements>
          ) : (
            <div className="text-center py-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p>Loading payment form...</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          <p>Your payment will be securely processed by Stripe. The funds will be held in escrow until the job is verified as complete.</p>
        </CardFooter>
      </Card>
    </div>
  );
}