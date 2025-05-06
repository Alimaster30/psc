import React from 'react';
import { motion } from 'framer-motion';

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  icon,
  label,
  onClick,
  color = 'primary',
  size = 'md',
  tooltip
}) => {
  // Color variants
  const colorVariants = {
    primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200 dark:bg-primary-900 dark:text-primary-300 dark:hover:bg-primary-800',
    success: 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800',
    warning: 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:hover:bg-yellow-800',
    danger: 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800',
    info: 'bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
  };
  
  // Size variants
  const sizeVariants = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'p-2.5 text-base'
  };
  
  // Icon size variants
  const iconSizeVariants = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center rounded-md ${colorVariants[color]} ${sizeVariants[size]} transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color === 'primary' ? 'primary' : color}-500`}
      title={tooltip || label}
    >
      <span className={`${iconSizeVariants[size]} mr-1.5`}>{icon}</span>
      <span className="font-medium">{label}</span>
    </motion.button>
  );
};

export default QuickActionButton;
