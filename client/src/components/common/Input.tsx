import React, { InputHTMLAttributes, forwardRef } from 'react';

// Define input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', ...rest }, ref) => {
    // Base classes
    const baseClasses = 'input px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

    // Error classes
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Icon classes
    const iconClasses = icon ? 'pl-10' : '';

    // Combine all classes
    const inputClasses = `${baseClasses} ${errorClasses} ${widthClasses} ${iconClasses} ${className}`;

    return (
      <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              {icon}
            </div>
          )}
          <input ref={ref} className={inputClasses} {...rest} />
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
