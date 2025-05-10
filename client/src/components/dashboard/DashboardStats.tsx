import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  BarChart2, 
  Users, 
  CheckCircle, 
  Activity,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useJobs } from '@/hooks/useJobs';
import { useQuery } from '@tanstack/react-query';
import { useFavorites } from '@/hooks/useFavorites';

type Stat = {
  id: string;
  label: string;
  value: string | number;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
};

interface DashboardStatsProps {
  stats?: Stat[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats: propStats }) => {
  const { user } = useAuth();
  const { activeJobs, myJobs } = useJobs();
  const { favorites } = useFavorites();
  
  // Get properties count
  const { data: properties = [] } = useQuery<any[]>({
    queryKey: ['/api/properties'],
    enabled: !!user && user.role === 'property_owner'
  });
  
  // Ensure properties is an array
  const propertiesArray = Array.isArray(properties) ? properties : [];
  
  // Calculate completed jobs count
  const completedJobs = React.useMemo(() => {
    return myJobs.filter(job => job.status === 'completed').length;
  }, [myJobs]);

  // Default stats for each role
  const defaultStats = React.useMemo(() => {
    if (!user) return [];

    if (user.role === 'landscaper') {
      return [
        {
          id: 'jobs-this-month',
          label: 'Jobs This Month',
          value: myJobs.length || 0,
          icon: <Calendar className="h-6 w-6 text-primary-600" />,
          bgColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
        },
        {
          id: 'total-earnings',
          label: 'Total Earnings',
          value: `$${myJobs.reduce((total, job) => total + (job.price / 100), 0).toFixed(2)}`,
          icon: <DollarSign className="h-6 w-6 text-secondary-600" />,
          bgColor: 'bg-secondary-100',
          iconColor: 'text-secondary-600',
        },
        {
          id: 'active-jobs',
          label: 'Active Jobs',
          value: activeJobs.length || 0,
          icon: <Activity className="h-6 w-6 text-accent-600" />,
          bgColor: 'bg-accent-100',
          iconColor: 'text-accent-600',
        },
        {
          id: 'completed-jobs',
          label: 'Completed Jobs',
          value: completedJobs || 0,
          icon: <CheckCircle className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    } else if (user.role === 'property_owner') {
      return [
        {
          id: 'active-jobs',
          label: 'Active Jobs',
          value: activeJobs.length || 0,
          icon: <Activity className="h-6 w-6 text-primary-600" />,
          bgColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
        },
        {
          id: 'completed-jobs',
          label: 'Completed Jobs',
          value: completedJobs || 0,
          icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
          bgColor: 'bg-accent-100',
          iconColor: 'text-accent-600',
        },
        {
          id: 'properties',
          label: 'Properties',
          value: favorites.length || 0, // Use favorites instead of propertiesArray
          icon: <Home className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    } else if (user.role === 'admin') {
      // Admin stats could be fetched from an API in the future
      return [
        {
          id: 'total-users',
          label: 'Total Users',
          value: 0,
          icon: <Users className="h-6 w-6 text-primary-600" />,
          bgColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
        },
        {
          id: 'active-jobs',
          label: 'Active Jobs',
          value: 0,
          icon: <Activity className="h-6 w-6 text-secondary-600" />,
          bgColor: 'bg-secondary-100',
          iconColor: 'text-secondary-600',
        },
        {
          id: 'completed-jobs',
          label: 'Completed Jobs',
          value: 0,
          icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
          bgColor: 'bg-accent-100',
          iconColor: 'text-accent-600',
        },
        {
          id: 'platform-revenue',
          label: 'Platform Revenue',
          value: '$0.00',
          icon: <BarChart2 className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    }
    
    return [];
  }, [user, activeJobs, myJobs, completedJobs, propertiesArray]);

  const stats = propStats || defaultStats;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <div key={stat.id} className="bg-white shadow rounded-lg p-4">
          <div className="flex items-center">
            <div className={`flex-shrink-0 rounded-md ${stat.bgColor} p-3`}>
              {stat.icon}
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-neutral-500 truncate">{stat.label}</dt>
                <dd>
                  <div className="text-lg font-medium text-neutral-900">{stat.value}</div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
