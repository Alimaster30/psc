import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

// Define card props
interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  hover?: boolean;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  footer,
  hover = false,
  onClick,
}) => {
  // Base classes
  const baseClasses = 'card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden';

  // Hover classes
  const hoverClasses = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';

  // Clickable classes
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  // Combine all classes
  const cardClasses = `${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`;

  const cardContent = (
    <>
      {title && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </>
  );

  if (onClick) {
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
