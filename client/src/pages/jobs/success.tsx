import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { useToast } from '@/hooks/use-toast';

export default function JobSuccessPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [jobPrice, setJobPrice] = useState<string | null>(null);

  useEffect(() => {
    // Parse URL parameters for job details
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const title = params.get('title');
    const price = params.get('price');
    
    setJobId(id);
    setJobTitle(title);
    setJobPrice(price);
    
    // If no job ID, redirect to jobs page
    if (!id) {
      setTimeout(() => {
        setLocation('/jobs');
      }, 3000);
    }
  }, [setLocation]);

  const handleSetupPayment = () => {
    // This would normally go to the payment page
    toast({
      title: "Payment Setup",
      description: "Your payment method has been saved. You'll only be charged when the job is completed.",
    });
    
    setTimeout(() => {
      setLocation('/jobs');
    }, 1500);
  };

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Redirecting to jobs page...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppHeader />
      
      <div className="container max-w-5xl pt-8 pb-16">
        <PageHeader
          title="Job Posted Successfully!"
          description="Your job has been posted and is now visible to landscapers in your area"
        />
        
        <div className="mt-8 max-w-3xl mx-auto">
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" strokeWidth={3} />
              </div>
              <CardTitle className="text-center text-xl">Job Posted Successfully</CardTitle>
              <CardDescription className="text-center">
                Your job "{jobTitle}" has been posted and is now visible to landscapers in your area.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="rounded-lg bg-white p-4 border border-green-200 mb-4">
                <h3 className="font-medium text-lg mb-2">Payment Details</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  You'll only be charged when the job is completed and verified by you.
                </p>
                
                <div className="flex items-center justify-between py-2 border-t">
                  <span>Job Total:</span>
                  <span className="font-medium">${jobPrice} CAD</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t">
                  <span>Service Fee:</span>
                  <span className="font-medium">$0.00 CAD</span>
                </div>
                
                <div className="flex items-center justify-between py-2 border-t border-b">
                  <span>Tax:</span>
                  <span className="font-medium">$0.00 CAD</span>
                </div>
                
                <div className="flex items-center justify-between py-2 mt-2">
                  <span className="font-medium">Total to be charged:</span>
                  <span className="font-medium">${jobPrice} CAD</span>
                </div>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-green-800">Escrow Payment Protection</h4>
                    <p className="mt-1 text-sm text-green-700">
                      Your payment information is securely saved but you won't be charged 
                      until the job is completed and you've verified the work was done to your satisfaction.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/jobs">
                  View My Jobs
                </Link>
              </Button>
              
              <Button 
                className="w-full sm:w-auto"
                onClick={handleSetupPayment}
              >
                Setup Payment Method <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <MobileMenu />
    </div>
  );
}