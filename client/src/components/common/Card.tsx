import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Define card variants
type CardVariant = 'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger';

// Define card props
interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  hover?: boolean;
  onClick?: () => void;
  variant?: CardVariant;
  noPadding?: boolean;
  headerActions?: ReactNode;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  hover = false,
  onClick,
  variant = 'default',
  noPadding = false,
  headerActions,
  animate = true,
}) => {
  // Base classes
  const baseClasses = 'card rounded-lg shadow-md overflow-hidden';

  // Variant classes
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    primary: 'bg-white dark:bg-gray-800 border-l-4 border border-primary-500 dark:border-primary-400',
    secondary: 'bg-white dark:bg-gray-800 border-l-4 border border-secondary-500 dark:border-secondary-400',
    info: 'bg-white dark:bg-gray-800 border-l-4 border border-blue-500 dark:border-blue-400',
    success: 'bg-white dark:bg-gray-800 border-l-4 border border-green-500 dark:border-green-400',
    warning: 'bg-white dark:bg-gray-800 border-l-4 border border-yellow-500 dark:border-yellow-400',
    danger: 'bg-white dark:bg-gray-800 border-l-4 border border-red-500 dark:border-red-400',
  };

  // Hover classes
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';

  // Clickable classes
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  // Combine all classes
  const cardClasses = `${baseClasses} ${variantClasses[variant]} ${hoverClasses} ${clickableClasses} ${className}`;

  // Content padding
  const contentPadding = noPadding ? '' : 'p-6';

  const cardContent = (
    <>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          {headerActions && <div className="flex items-center">{headerActions}</div>}
        </div>
      )}
      <div className={contentPadding}>{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </>
  );

  if (onClick && animate) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={{ scale: hover ? 1.02 : 1 }}
        whileTap={{ scale: 0.98 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return <div className={cardClasses}>{cardContent}</div>;
};

export default Card;
