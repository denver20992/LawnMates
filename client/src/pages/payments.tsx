import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import DashboardTabs from '@/components/layout/DashboardTabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  AlertCircle 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const PaymentsPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Define payment interface
  interface Payment {
    id: number;
    jobId: number;
    amount: number;
    status: string;
    createdAt: string;
    job?: {
      title: string;
    };
  }

  // Get payments
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: ['/api/payments'],
    enabled: !!user
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-amber-100 text-amber-800">Refunded</Badge>;
      case 'disputed':
        return <Badge className="bg-red-100 text-red-800">Disputed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="pb-16 md:pb-0">
      <AppHeader />
      
      <DashboardTabs activeTab="payments" />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="mx-auto h-8 w-8 text-primary-600" />
                <h3 className="mt-2 text-lg font-medium text-neutral-900">
                  {user?.role === 'landscaper' ? 'Total Earned' : 'Total Spent'}
                </h3>
                <p className="mt-1 text-3xl font-bold text-neutral-900">
                  ${(payments as Payment[]).reduce((total: number, payment: Payment) => 
                    payment.status === 'completed' ? total + (payment.amount / 100) : total
                  , 0).toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-secondary-600" />
                <h3 className="mt-2 text-lg font-medium text-neutral-900">
                  Completed Payments
                </h3>
                <p className="mt-1 text-3xl font-bold text-neutral-900">
                  {(payments as Payment[]).filter((payment: Payment) => payment.status === 'completed').length}
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="mx-auto h-8 w-8 text-accent-600" />
                <h3 className="mt-2 text-lg font-medium text-neutral-900">
                  Pending Payments
                </h3>
                <p className="mt-1 text-3xl font-bold text-neutral-900">
                  {(payments as Payment[]).filter((payment: Payment) => payment.status === 'pending').length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View all your past and upcoming payments for lawn care services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(payments as Payment[]).length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto h-12 w-12 text-neutral-400">
                  <DollarSign className="h-12 w-12" />
                </div>
                <h3 className="mt-2 text-lg font-medium text-neutral-900">No payment history</h3>
                <p className="mt-1 text-neutral-500">
                  {user?.role === 'property_owner' 
                    ? 'You haven\'t made any payments yet. Post a job to get started!' 
                    : 'You haven\'t received any payments yet. Accept jobs to get started!'}
                </p>
                {user?.role === 'property_owner' && (
                  <Button className="mt-4" onClick={() => setLocation('/jobs/post')}>
                    Post a Job
                  </Button>
                )}
                {user?.role === 'landscaper' && (
                  <Button className="mt-4" onClick={() => setLocation('/jobs')}>
                    Find Jobs
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Job</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payments as Payment[]).map((payment: Payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>
                          {format(new Date(payment.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          {payment.job?.title || `Job #${payment.jobId}`}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">${(payment.amount / 100).toFixed(2)}</span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(payment.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setLocation(`/jobs/${payment.jobId}`)}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {user?.role === 'landscaper' && (
          <Card>
            <CardHeader>
              <CardTitle>Payout Settings</CardTitle>
              <CardDescription>
                Manage your payout preferences and banking information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 p-4 border rounded-lg bg-neutral-50">
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Stripe Connect Status
                </h3>
                
                <div className="flex items-center text-neutral-600 mb-4">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  <span>Connect your Stripe account to receive payments directly to your bank account</span>
                </div>
                
                <Button>
                  Connect Stripe Account
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default PaymentsPage;