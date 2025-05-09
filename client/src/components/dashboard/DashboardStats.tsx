import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  Star, 
  Clock, 
  BarChart2, 
  Users, 
  CheckCircle, 
  Activity 
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

  // Default stats for each role
  const defaultStats = React.useMemo(() => {
    if (!user) return [];

    if (user.role === 'landscaper') {
      return [
        {
          id: 'jobs-this-month',
          label: 'Jobs This Month',
          value: 12,
          icon: <Calendar className="h-6 w-6 text-primary-600" />,
          bgColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
        },
        {
          id: 'total-earnings',
          label: 'Total Earnings',
          value: '$1,250',
          icon: <DollarSign className="h-6 w-6 text-secondary-600" />,
          bgColor: 'bg-secondary-100',
          iconColor: 'text-secondary-600',
        },
        {
          id: 'rating',
          label: 'Rating',
          value: '4.8 / 5',
          icon: <Star className="h-6 w-6 text-accent-600" />,
          bgColor: 'bg-accent-100',
          iconColor: 'text-accent-600',
        },
        {
          id: 'response-time',
          label: 'Response Time',
          value: '15 min avg',
          icon: <Clock className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    } else if (user.role === 'property_owner') {
      return [
        {
          id: 'active-jobs',
          label: 'Active Jobs',
          value: 3,
          icon: <Activity className="h-6 w-6 text-primary-600" />,
          bgColor: 'bg-primary-100',
          iconColor: 'text-primary-600',
        },
        {
          id: 'total-spent',
          label: 'Total Spent',
          value: '$850',
          icon: <DollarSign className="h-6 w-6 text-secondary-600" />,
          bgColor: 'bg-secondary-100',
          iconColor: 'text-secondary-600',
        },
        {
          id: 'completed-jobs',
          label: 'Completed Jobs',
          value: 8,
          icon: <CheckCircle className="h-6 w-6 text-accent-600" />,
          bgColor: 'bg-accent-100',
          iconColor: 'text-accent-600',
        },
        {
          id: 'properties',
          label: 'Properties',
          value: 2,
          icon: <Users className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    } else if (user.role === 'admin') {
      return [
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
          icon: <Activity className="h-6 w-6 text-secondary-600" />,
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
          icon: <BarChart2 className="h-6 w-6 text-green-600" />,
          bgColor: 'bg-green-100',
          iconColor: 'text-green-600',
        },
      ];
    }
    
    return [];
  }, [user]);

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
