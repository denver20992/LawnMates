import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import AppHeader from '@/components/layout/AppHeader';
import MobileMenu from '@/components/layout/MobileMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, DollarSign, MapPin, Star, CheckCircle2, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const ProfilePage: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Form state - would be connected to API in full implementation
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    bio: '',
    address: '',
    phone: '',
    stripeConnected: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login');
    }
  }, [isLoading, isAuthenticated, setLocation]);

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        bio: user.bio || '',
        address: '',
        phone: '',
        stripeConnected: !!user.stripeConnectId
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // This would update the user profile via API
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully."
    });
  };

  const handleConnectStripe = () => {
    // This would redirect to Stripe Connect onboarding in a real implementation
    toast({
      title: "Stripe Connect",
      description: "You would be redirected to Stripe to complete onboarding."
    });
    setFormData(prev => ({ ...prev, stripeConnected: true }));
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
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
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
          <p className="text-neutral-600 mt-1">Manage your account and preferences</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 border-b bg-neutral-50">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <Avatar className="h-24 w-24">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.username} />
                ) : (
                  <AvatarFallback className="text-2xl">
                    {user?.fullName 
                      ? getInitials(user.fullName) 
                      : user?.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                <h2 className="text-xl font-semibold text-neutral-900">
                  {user?.fullName || user?.username}
                </h2>
                <p className="text-neutral-600">
                  {user?.role === 'property_owner' ? 'Property Owner' : user?.role === 'landscaper' ? 'Landscaper' : 'Admin'}
                </p>
                
                <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                  {user?.isVerified && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-primary-50 text-primary-700 border-primary-200">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {user?.role === 'landscaper' && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="h-3 w-3" />
                      {user?.rating || '0'} Rating
                    </Badge>
                  )}
                  {user?.loyaltyPoints > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                      <Award className="h-3 w-3" />
                      {user?.loyaltyPoints} Points
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <Tabs 
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="p-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your profile information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input 
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Your email address"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input 
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Your phone number"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input 
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder="Your address"
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea 
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          placeholder="Tell us about yourself"
                          rows={4}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button type="submit">
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Information</CardTitle>
                  <CardDescription>
                    Manage your payment methods and payout settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.role === 'landscaper' && (
                    <div className="mb-6 p-4 border rounded-lg bg-neutral-50">
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">
                        Stripe Connect Status
                      </h3>
                      {formData.stripeConnected ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span>Your Stripe account is connected and ready to receive payments</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-neutral-600 mb-4">
                            Connect your Stripe account to receive payments from your landscaping services.
                          </p>
                          <Button onClick={handleConnectStripe}>
                            Connect Stripe Account
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-neutral-900">
                      Payment Summary
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <DollarSign className="mx-auto h-8 w-8 text-primary-600" />
                            <h3 className="mt-2 text-lg font-medium text-neutral-900">
                              {user?.role === 'landscaper' ? 'Total Earned' : 'Total Spent'}
                            </h3>
                            <p className="mt-1 text-3xl font-bold text-neutral-900">$1,250</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <Calendar className="mx-auto h-8 w-8 text-secondary-600" />
                            <h3 className="mt-2 text-lg font-medium text-neutral-900">
                              {user?.role === 'landscaper' ? 'This Month' : 'This Month'}
                            </h3>
                            <p className="mt-1 text-3xl font-bold text-neutral-900">$350</p>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <MapPin className="mx-auto h-8 w-8 text-accent-600" />
                            <h3 className="mt-2 text-lg font-medium text-neutral-900">
                              {user?.role === 'landscaper' ? 'Jobs Completed' : 'Jobs Posted'}
                            </h3>
                            <p className="mt-1 text-3xl font-bold text-neutral-900">12</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-neutral-900 mb-4">
                        Payment History
                      </h3>
                      
                      <div className="border rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-neutral-200">
                          <thead className="bg-neutral-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Job
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Date
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Amount
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-neutral-200">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">Lawn Mowing</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-neutral-600">May 15, 2023</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">$45.00</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              </td>
                            </tr>
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">Garden Cleanup</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-neutral-600">May 10, 2023</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900">$75.00</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  Completed
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and security
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium text-neutral-900 mb-4">
                        Change Password
                      </h3>
                      <form className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input 
                              id="currentPassword"
                              name="currentPassword"
                              type="password"
                              placeholder="Enter your current password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input 
                              id="newPassword"
                              name="newPassword"
                              type="password"
                              placeholder="Enter your new password"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input 
                              id="confirmPassword"
                              name="confirmPassword"
                              type="password"
                              placeholder="Confirm your new password"
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button type="submit">
                            Change Password
                          </Button>
                        </div>
                      </form>
                    </div>
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium text-neutral-900 mb-4">
                        Notification Preferences
                      </h3>
                      <div className="space-y-4">
                        {/* This would be a full preferences UI in a real implementation */}
                        <p className="text-neutral-600">
                          Configure how and when you receive notifications about jobs, messages, and payments.
                        </p>
                        <Button variant="outline">
                          Manage Notifications
                        </Button>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-medium text-neutral-900 mb-4">
                        Delete Account
                      </h3>
                      <div className="space-y-4">
                        <p className="text-neutral-600">
                          Permanently delete your account and all associated data.
                        </p>
                        <Button variant="destructive">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <MobileMenu />
    </div>
  );
};

export default ProfilePage;
