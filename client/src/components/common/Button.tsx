import React, { ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';

// Define button variants
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'warning' | 'info';

// Define button sizes
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

// Define button props
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  animate = true,
  className = '',
  disabled,
  ...rest
}) => {
  // Base classes
  const baseClasses = 'btn inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 dark:bg-primary-700 dark:hover:bg-primary-800 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 dark:bg-secondary-700 dark:hover:bg-secondary-800 dark:focus:ring-secondary-400 dark:focus:ring-offset-gray-900',
    outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800 focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800 dark:focus:ring-red-400 dark:focus:ring-offset-gray-900',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-700 dark:hover:bg-green-800 dark:focus:ring-green-400 dark:focus:ring-offset-gray-900',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-400 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus:ring-yellow-300 dark:focus:ring-offset-gray-900',
    info: 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-300 dark:focus:ring-offset-gray-900',
  };

  // Size classes
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';

  // Disabled classes
  const disabledClasses = (disabled || isLoading) ? 'opacity-70 cursor-not-allowed' : '';

  // Combine all classes
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClasses} ${disabledClasses} ${className}`;

  // Loading spinner color based on variant
  const spinnerColor = variant === 'outline' ? 'text-gray-700 dark:text-gray-200' : 'text-white';

  // Button content
  const buttonContent = (
    <>
      {isLoading && (
        <svg className={`animate-spin -ml-1 mr-2 h-4 w-4 ${spinnerColor}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && icon && <span className="mr-2">{icon}</span>}
      {children}
    </>
  );

  // Use motion component for animated buttons
  if (animate && !disabled && !isLoading) {
    return (
      <motion.button
        className={buttonClasses}
        disabled={disabled || isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        {...rest}
      >
        {buttonContent}
      </motion.button>
    );
  }

  // Regular button for disabled state or when animation is turned off
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...rest}
    >
      {buttonContent}
    </button>
  );
};

export default Button;
