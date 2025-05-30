import React from 'react';
import { formatRelativeTime } from '../../utils/formPersistence';
import Button from './Button';

interface FormDraftRecoveryProps {
  timestamp: string;
  onRecover: () => void;
  onDiscard: () => void;
}

const FormDraftRecovery: React.FC<FormDraftRecoveryProps> = ({
  timestamp,
  onRecover,
  onDiscard
}) => {
  return (
    <div className="mb-6 border-l-4 border-yellow-400 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-500 dark:text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Unsaved draft found</h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
            <p>
              We found an unsaved draft from {formatRelativeTime(timestamp)}. Would you like to recover it?
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex space-x-3">
              <Button
                variant="primary"
                size="sm"
                onClick={onRecover}
                className="rounded-md bg-yellow-50 dark:bg-yellow-700 px-2 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-50 hover:bg-yellow-100 dark:hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50 dark:focus:ring-offset-gray-900"
              >
                Recover Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDiscard}
                className="rounded-md bg-yellow-50 dark:bg-transparent px-2 py-1.5 text-sm font-medium text-yellow-800 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50 dark:focus:ring-offset-gray-900 dark:border-yellow-700"
              >
                Discard
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormDraftRecovery;