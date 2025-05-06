import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Step {
  title: string;
  content: ReactNode;
  optional?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  isSubmitting?: boolean;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  isSubmitting = false
}) => {
  // Use external state if provided, otherwise manage internally
  const [internalCurrentStep, setInternalCurrentStep] = useState(0);
  
  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep || setInternalCurrentStep;
  
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  
  const goToNextStep = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  // Animation variants
  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="relative">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <div 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 dark:bg-primary-400 transition-all duration-300"
          ></div>
        </div>
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div 
              key={index}
              className={`flex flex-col items-center ${index <= currentStep ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}
            >
              <button
                type="button"
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
                  index < currentStep 
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-300' 
                    : index === currentStep
                    ? 'bg-primary-500 text-white dark:bg-primary-400'
                    : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                }`}
                disabled={index > currentStep}
              >
                {index < currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  index + 1
                )}
              </button>
              <span className="text-xs mt-1 font-medium">{step.title}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3 }}
        className="min-h-[300px]"
      >
        {steps[currentStep].content}
      </motion.div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={isFirstStep ? onCancel : goToPreviousStep}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {isFirstStep ? 'Cancel' : 'Previous'}
        </button>
        
        <button
          type="button"
          onClick={isLastStep ? onComplete : goToNextStep}
          disabled={isSubmitting}
          className={`px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
              Processing...
            </span>
          ) : isLastStep ? (
            'Complete'
          ) : (
            'Next'
          )}
        </button>
      </div>
    </div>
  );
};

export default MultiStepForm;
