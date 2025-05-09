import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/layout/AppHeader';
import DashboardTabs from '@/components/layout/DashboardTabs';
import DashboardStats from '@/components/dashboard/DashboardStats';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, CheckCircle, XCircle, AlertCircle, BarChart2, Users, Calendar, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const AdminPage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
      return;
    }
    
    // Redirect non-admins away from admin page
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      setLocation('/');
    }
  }, [isLoading, isAuthenticated, user, setLocation]);

  // Admin-specific stats
  const adminStats = [
    {
      id: 'total-users',
      label: 'Total Users',
      value: 152,
      icon: <Users className="h-6 w-6 text-primary-600" />,
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      id: 'active-jobs',
      label: 'Active Jobs',
      value: 47,
      icon: <Calendar className="h-6 w-6 text-secondary-600" />,
      bgColor: 'bg-secondary-100',
      iconColor: 'text-secondary-600',
    },
    {
      id: 'completed-jobs',
      label: 'Completed Jobs',
      value: 215,
      icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
      bgColor: 'bg-accent-100',
      iconColor: 'text-accent-600',
    },
    {
      id: 'platform-revenue',
      label: 'Platform Revenue',
      value: '$8,450',
      icon: <DollarSign className="h-6 w-6 text-green-600" />,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ];

  // Mock data for verification queue
  const verificationQueue = [
    { id: 1, jobId: 1234, landscaperId: 101, ownerId: 201, jobTitle: 'Lawn Mowing', createdAt: '2023-06-01T10:00:00Z' },
    { id: 2, jobId: 1235, landscaperId: 102, ownerId: 202, jobTitle: 'Garden Cleanup', createdAt: '2023-06-02T09:30:00Z' },
    { id: 3, jobId: 1236, landscaperId: 103, ownerId: 203, jobTitle: 'Hedge Trimming', createdAt: '2023-06-03T14:15:00Z' },
  ];

  // Mock data for user management
  const users = [
    { id: 101, username: 'john_landscaper', email: 'john@example.com', role: 'landscaper', isVerified: true, createdAt: '2023-01-15T08:00:00Z' },
    { id: 201, username: 'sarah_owner', email: 'sarah@example.com', role: 'property_owner', isVerified: true, createdAt: '2023-02-20T10:30:00Z' },
    { id: 102, username: 'mike_landscaper', email: 'mike@example.com', role: 'landscaper', isVerified: false, createdAt: '2023-03-05T15:45:00Z' },
    { id: 202, username: 'emma_owner', email: 'emma@example.com', role: 'property_owner', isVerified: true, createdAt: '2023-04-10T12:15:00Z' },
  ];

  // Mock data for disputes
  const disputes = [
    { id: 1, jobId: 1230, title: 'Incomplete Job', status: 'open', createdAt: '2023-05-25T09:10:00Z' },
    { id: 2, jobId: 1231, title: 'Quality Issue', status: 'investigating', createdAt: '2023-05-27T11:20:00Z' },
    { id: 3, jobId: 1232, title: 'Payment Dispute', status: 'resolved', createdAt: '2023-05-20T14:30:00Z' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const handleApproveVerification = (id: number) => {
    toast({
      title: "Verification Approved",
      description: `Verification #${id} has been approved and payment released.`
    });
  };

  const handleRejectVerification = (id: number) => {
    toast({
      title: "Verification Rejected",
      description: `Verification #${id} has been rejected.`
    });
  };

  const handleVerifyUser = (id: number) => {
    toast({
      title: "User Verified",
      description: `User ID ${id} has been verified.`
    });
  };

  const handleResolveDispute = (id: number) => {
    toast({
      title: "Dispute Resolved",
      description: `Dispute #${id} has been marked as resolved.`
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Don't render admin content if user is not an admin
  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div>
      <AppHeader />
      
      <DashboardTabs 
        activeTab="dashboard"
        dashboardTabs={[
          { id: 'dashboard', label: 'Admin Dashboard', href: '/admin' },
          { id: 'users', label: 'Users', href: '/admin/users' },
          { id: 'jobs', label: 'Jobs', href: '/admin/jobs' },
          { id: 'verifications', label: 'Verifications', href: '/admin/verifications' },
          { id: 'disputes', label: 'Disputes', href: '/admin/disputes' },
        ]}
      />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Admin Dashboard</h1>
        
        <DashboardStats stats={adminStats} />
        
        <Tabs defaultValue="verifications" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verifications">Verification Queue</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="disputes">Dispute Resolution</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Verification Queue</CardTitle>
                <CardDescription>
                  Review and approve job completion photos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationQueue.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">Queue Empty</h3>
                    <p className="text-neutral-600">
                      There are no pending verifications at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {verificationQueue.map((verification) => (
                      <div key={verification.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-medium text-neutral-900">Job #{verification.jobId}: {verification.jobTitle}</h3>
                              <Badge className="ml-2 bg-yellow-100 text-yellow-800">Pending</Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              Submitted {new Date(verification.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Landscaper ID: {verification.landscaperId} • Property Owner ID: {verification.ownerId}
                            </p>
                          </div>
                          
                          <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex items-center"
                              onClick={() => setLocation(`/admin/verifications/${verification.id}`)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                            <Button 
                              variant="default" 
                              className="flex items-center text-white bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveVerification(verification.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive" 
                              className="flex items-center"
                              onClick={() => handleRejectVerification(verification.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    View and manage system users
                  </CardDescription>
                </div>
                <div className="mt-4 sm:mt-0 flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input placeholder="Search users..." className="pl-10 w-64" />
                  </div>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.username}</div>
                                <div className="text-sm text-neutral-500">{user.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`
                              ${user.role === 'landscaper' ? 'bg-primary-50 text-primary-700 border-primary-200' : ''}
                              ${user.role === 'property_owner' ? 'bg-secondary-50 text-secondary-700 border-secondary-200' : ''}
                              ${user.role === 'admin' ? 'bg-accent-50 text-accent-700 border-accent-200' : ''}
                            `}>
                              {user.role === 'landscaper' ? 'Landscaper' : 
                               user.role === 'property_owner' ? 'Property Owner' : 
                               'Admin'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.isVerified ? (
                              <span className="inline-flex items-center text-green-600">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center text-yellow-600">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                Unverified
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setLocation(`/admin/users/${user.id}`)}
                              >
                                View
                              </Button>
                              {!user.isVerified && (
                                <Button 
                                  variant="default" 
                                  size="sm"
                                  onClick={() => handleVerifyUser(user.id)}
                                >
                                  Verify
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="disputes" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispute Resolution</CardTitle>
                <CardDescription>
                  Manage and resolve user disputes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {disputes.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No Active Disputes</h3>
                    <p className="text-neutral-600">
                      There are no disputes requiring attention at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map((dispute) => (
                      <div key={dispute.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <div className="flex items-center mb-2">
                              <h3 className="text-lg font-medium text-neutral-900">
                                Dispute #{dispute.id}: {dispute.title}
                              </h3>
                              <Badge className={`ml-2 ${
                                dispute.status === 'open' 
                                  ? 'bg-red-100 text-red-800' 
                                  : dispute.status === 'investigating' 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {dispute.status === 'open' 
                                  ? 'Open' 
                                  : dispute.status === 'investigating' 
                                  ? 'Investigating' 
                                  : 'Resolved'}
                              </Badge>
                            </div>
                            <p className="text-sm text-neutral-600 mb-2">
                              Submitted {new Date(dispute.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-neutral-600">
                              Related to Job #{dispute.jobId}
                            </p>
                          </div>
                          
                          <div className="mt-4 sm:mt-0 flex space-x-2">
                            <Button 
                              variant="outline" 
                              className="flex items-center"
                              onClick={() => setLocation(`/admin/disputes/${dispute.id}`)}
                            >
                              <Search className="h-4 w-4 mr-1" />
                              View Details
                            </Button>
                            {dispute.status !== 'resolved' && (
                              <Button 
                                variant="default" 
                                className="flex items-center"
                                onClick={() => handleResolveDispute(dispute.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>
              Key metrics and performance indicators
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BarChart2 className="mx-auto h-12 w-12 text-neutral-400" />
                <h3 className="mt-4 text-lg font-medium">Analytics Dashboard</h3>
                <p className="mt-2 text-neutral-500">
                  Advanced analytics would be implemented here with charts and visualizations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminPage;
