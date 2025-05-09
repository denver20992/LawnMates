import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardTabsProps {
  activeTab?: string;
  dashboardTabs?: Array<{ id: string; label: string; href: string }>;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ 
  activeTab = 'dashboard',
  dashboardTabs
}) => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Default tabs based on user role
  const defaultTabs = React.useMemo(() => {
    if (!user) return [];
    
    if (user.role === 'landscaper') {
      return [
        { id: 'dashboard', label: 'My Dashboard', href: '/' },
        { id: 'available-jobs', label: 'Available Jobs', href: '/jobs' },
        { id: 'my-jobs', label: 'My Jobs', href: '/jobs/mine' },
        { id: 'payments', label: 'Payments', href: '/payments' }
      ];
    } else if (user.role === 'property_owner') {
      return [
        { id: 'dashboard', label: 'My Dashboard', href: '/' },
        { id: 'my-properties', label: 'My Properties', href: '/properties' },
        { id: 'my-jobs', label: 'My Jobs', href: '/jobs/mine' },
        { id: 'payments', label: 'Payments', href: '/payments' }
      ];
    } else if (user.role === 'admin') {
      return [
        { id: 'dashboard', label: 'Admin Dashboard', href: '/admin' },
        { id: 'users', label: 'Users', href: '/admin/users' },
        { id: 'jobs', label: 'Jobs', href: '/admin/jobs' },
        { id: 'payments', label: 'Payments', href: '/admin/payments' },
        { id: 'verifications', label: 'Verifications', href: '/admin/verifications' }
      ];
    }
    
    return [];
  }, [user]);
  
  const tabs = dashboardTabs || defaultTabs;
  
  const handleTabChange = (value: string) => {
    const tab = tabs.find(tab => tab.id === value);
    if (tab) {
      setLocation(tab.href);
    }
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
      <div className="relative border-b border-neutral-200">
        <div className="flex items-center md:justify-center">
          <div className="sm:hidden w-full">
            <Select value={activeTab} onValueChange={handleTabChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tab" />
              </SelectTrigger>
              <SelectContent>
                {tabs.map((tab) => (
                  <SelectItem key={tab.id} value={tab.id}>
                    {tab.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="hidden sm:block overflow-x-auto">
            <div className="flex space-x-4 md:space-x-8">
              {tabs.map((tab) => (
                <Link key={tab.id} href={tab.href}>
                  <a
                    className={`border-b-2 py-4 px-1 text-sm font-medium whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
                    }`}
                    aria-current={activeTab === tab.id ? 'page' : undefined}
                  >
                    {tab.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardTabs;
