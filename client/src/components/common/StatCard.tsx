import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';
import Skeleton from 'react-loading-skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'indigo' | 'purple' | 'red';
  isLoading?: boolean;
  delay?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  isLoading = false,
  delay = 0,
  className = '',
}) => {
  // Color configurations
  const colorConfig = {
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      iconBg: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    yellow: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
    },
    indigo: {
      iconBg: 'bg-indigo-100 dark:bg-indigo-900',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
    },
    purple: {
      iconBg: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    red: {
      iconBg: 'bg-red-100 dark:bg-red-900',
      iconColor: 'text-red-600 dark:text-red-400',
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`w-full ${className}`}
    >
      <Card className="h-full">
        <div className="p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${config.iconBg}`}>
              <div className={`w-6 h-6 ${config.iconColor}`}>
                {icon}
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {title}
              </p>
              {isLoading ? (
                <Skeleton height={32} width={80} />
              ) : (
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
