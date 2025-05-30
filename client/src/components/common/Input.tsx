import React, { InputHTMLAttributes, forwardRef, useState } from 'react';

// Define input props
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = '', showPasswordToggle = false, ...rest }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    // Determine the input type based on showPassword state if it's a password field
    const inputType = rest.type === 'password' && showPassword ? 'text' : rest.type;

    // Base classes
    const baseClasses = 'input px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white';

    // Error classes
    const errorClasses = error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : '';

    // Width classes
    const widthClasses = fullWidth ? 'w-full' : '';

    // Icon classes
    const iconClasses = icon ? 'pl-10' : '';

    // Password toggle classes
    const passwordToggleClasses = showPasswordToggle && rest.type === 'password' ? 'pr-10' : '';

    // Combine all classes
    const inputClasses = `${baseClasses} ${errorClasses} ${widthClasses} ${iconClasses} ${passwordToggleClasses} ${className}`;

    // Toggle password visibility
    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

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
          <input
            ref={ref}
            className={inputClasses}
            {...rest}
            type={inputType}
          />

          {showPasswordToggle && rest.type === 'password' && (
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
              onClick={togglePasswordVisibility}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                </svg>
              )}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
