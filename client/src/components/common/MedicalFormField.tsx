import React from 'react';
import AutocompleteInput from './AutocompleteInput';

interface MedicalFormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  suggestions?: string[];
  isTextarea?: boolean;
  rows?: number;
  className?: string;
  error?: string;
  helpText?: string;
  icon?: React.ReactNode;
  onSelect?: (suggestion: string) => void;
}

const MedicalFormField: React.FC<MedicalFormFieldProps> = ({
  id,
  name,
  label,
  value,
  onChange,
  placeholder,
  required = false,
  suggestions,
  isTextarea = false,
  rows = 3,
  className = '',
  error,
  helpText,
  icon,
  onSelect
}) => {
  const fieldId = `field-${id}`;
  
  return (
    <div className={`medical-form-field ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <label 
          htmlFor={fieldId} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {helpText && (
          <span className="text-xs text-gray-500 dark:text-gray-400">{helpText}</span>
        )}
      </div>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        
        {suggestions ? (
          <AutocompleteInput
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange as (e: React.ChangeEvent<HTMLInputElement>) => void}
            suggestions={suggestions}
            placeholder={placeholder}
            required={required}
            className={`${icon ? 'pl-10' : ''} ${isTextarea ? 'h-24' : ''}`}
            error={error}
            onSelect={onSelect}
          />
        ) : isTextarea ? (
          <textarea
            id={fieldId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            rows={rows}
            className={`block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
              error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } ${icon ? 'pl-10' : ''} bg-white dark:bg-gray-700 dark:text-white`}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={`block w-full rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm ${
              error ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
            } ${icon ? 'pl-10' : ''} bg-white dark:bg-gray-700 dark:text-white`}
          />
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default MedicalFormField;
