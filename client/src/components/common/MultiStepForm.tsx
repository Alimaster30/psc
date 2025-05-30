import React, { useState, ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

interface Step {
  title: string;
  content: ReactNode;
  optional?: boolean;
  validate?: () => Record<string, string>;
  icon?: ReactNode;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onCancel: () => void;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  isSubmitting?: boolean;
  formId?: string; // Unique ID for form persistence
  showValidationErrors?: boolean; // Whether to show validation errors
  submitButtonText?: string; // Custom text for the submit button
  cancelButtonText?: string; // Custom text for the cancel button
  nextButtonText?: string; // Custom text for the next button
  previousButtonText?: string; // Custom text for the previous button
  theme?: 'default' | 'compact' | 'pills'; // Theme variant for the step indicators
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({
  steps,
  onComplete,
  onCancel,
  currentStep: externalCurrentStep,
  setCurrentStep: externalSetCurrentStep,
  isSubmitting = false,
  formId,
  showValidationErrors = true, // Always show validation errors by default
  submitButtonText = 'Complete',
  cancelButtonText = 'Cancel',
  nextButtonText = 'Next',
  previousButtonText = 'Previous',
  theme = 'default'
}) => {
  // Use external state if provided, otherwise manage internally
  const [internalCurrentStep, setInternalCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentStep = externalCurrentStep !== undefined ? externalCurrentStep : internalCurrentStep;
  const setCurrentStep = externalSetCurrentStep || setInternalCurrentStep;

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  // Run validation when showValidationErrors changes
  useEffect(() => {
    if (showValidationErrors && steps[currentStep].validate) {
      setErrors(steps[currentStep].validate() || {});
    } else {
      setErrors({});
    }
  }, [showValidationErrors, currentStep, steps]);

  // Save current step to sessionStorage
  useEffect(() => {
    if (formId) {
      sessionStorage.setItem(`${formId}_step`, currentStep.toString());
    }
  }, [currentStep, formId]);

  // Load saved step from sessionStorage on mount
  useEffect(() => {
    if (formId) {
      const savedStep = sessionStorage.getItem(`${formId}_step`);
      if (savedStep !== null) {
        const step = parseInt(savedStep, 10);
        if (!isNaN(step) && step >= 0 && step < steps.length) {
          setCurrentStep(step);
        }
      }
    }
  }, [formId, setCurrentStep, steps.length]);

  const validateCurrentStep = (): boolean => {
    if (!steps[currentStep].validate) return true;

    const validationErrors = steps[currentStep].validate() || {};
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const goToNextStep = () => {
    if (!isLastStep) {
      if (validateCurrentStep()) {
        setDirection('forward');
        setCurrentStep(currentStep + 1);
        setErrors({});
      } else {
        // Show validation errors for the current step
        if (Object.keys(errors).length > 0) {
          // The errors are already set in validateCurrentStep
        }
      }
    }
  };

  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setDirection('backward');
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleStepClick = (index: number) => {
    if (index <= currentStep) {
      setDirection(index < currentStep ? 'backward' : 'forward');
      setCurrentStep(index);
      setErrors({});
    }
  };

  // Animation variants
  const variants = {
    enter: (direction: string) => ({
      x: direction === 'forward' ? 50 : -50,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: string) => ({
      x: direction === 'forward' ? -50 : 50,
      opacity: 0
    })
  };

  // Get progress percentage
  const progressPercentage = ((currentStep) / (steps.length - 1)) * 100;

  return (
    <div className="space-y-8">
      {/* Progress Bar and Step Indicators */}
      <div className="relative">
        {/* Progress Bar */}
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
          <motion.div
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary-500 dark:bg-primary-400"
          />
        </div>

        {/* Step Indicators - Default Theme */}
        {theme === 'default' && (
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center ${
                  index <= currentStep
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                <motion.button
                  type="button"
                  whileHover={index <= currentStep ? { scale: 1.1 } : {}}
                  whileTap={index <= currentStep ? { scale: 0.95 } : {}}
                  onClick={() => handleStepClick(index)}
                  className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${
                    index < currentStep
                      ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                      : index === currentStep
                      ? 'bg-primary-500 text-white dark:bg-primary-600'
                      : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                  }`}
                  disabled={index > currentStep}
                  aria-label={`Go to step ${index + 1}: ${step.title}`}
                >
                  {index < currentStep ? (
                    <motion.svg
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </motion.svg>
                  ) : step.icon ? (
                    step.icon
                  ) : (
                    index + 1
                  )}
                </motion.button>
                <span className="text-xs mt-1 font-medium">{step.title}</span>
                {step.optional && <span className="text-xs text-gray-500 dark:text-gray-400">(Optional)</span>}
              </div>
            ))}
          </div>
        )}

        {/* Step Indicators - Compact Theme */}
        {theme === 'compact' && (
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={index} className="flex-1">
                {index > 0 && (
                  <div className={`h-0.5 mx-2 ${index <= currentStep ? 'bg-primary-500 dark:bg-primary-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                )}
                <div className="flex flex-col items-center">
                  <motion.button
                    type="button"
                    whileHover={index <= currentStep ? { scale: 1.1 } : {}}
                    whileTap={index <= currentStep ? { scale: 0.95 } : {}}
                    onClick={() => handleStepClick(index)}
                    className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors duration-200 ${
                      index < currentStep
                        ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                        : index === currentStep
                        ? 'bg-primary-500 text-white dark:bg-primary-600'
                        : 'bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}
                    disabled={index > currentStep}
                    aria-label={`Go to step ${index + 1}: ${step.title}`}
                  >
                    {index < currentStep ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                    ) : step.icon ? (
                      step.icon
                    ) : (
                      <span className="text-xs">{index + 1}</span>
                    )}
                  </motion.button>
                  <span className="text-xs mt-1 font-medium text-center">{step.title}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Step Indicators - Pills Theme */}
        {theme === 'pills' && (
          <div className="flex flex-wrap gap-2 justify-center">
            {steps.map((step, index) => (
              <motion.button
                key={index}
                type="button"
                whileHover={index <= currentStep ? { scale: 1.05 } : {}}
                whileTap={index <= currentStep ? { scale: 0.95 } : {}}
                onClick={() => handleStepClick(index)}
                className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 flex items-center ${
                  index < currentStep
                    ? 'bg-primary-100 text-primary-600 dark:bg-primary-900 dark:text-primary-400'
                    : index === currentStep
                    ? 'bg-primary-500 text-white dark:bg-primary-600'
                    : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                }`}
                disabled={index > currentStep}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              >
                {index < currentStep ? (
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-white dark:bg-gray-600 text-xs mr-1">
                    {index + 1}
                  </span>
                )}
                {step.title}
                {step.optional && <span className="ml-1 text-xs opacity-70">(Optional)</span>}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Error Messages */}
      {Object.keys(errors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-4 rounded shadow-md"
          role="alert"
        >
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 mr-2 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <strong className="font-bold text-red-700 dark:text-red-400">Please fix the following errors:</strong>
          </div>
          <ul className="mt-2 list-disc list-inside">
            {Object.values(errors).map((error, index) => (
              <li key={index} className="text-sm">{error}</li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Step Content */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {steps[currentStep].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="md"
          onClick={isFirstStep ? onCancel : goToPreviousStep}
          icon={
            !isFirstStep && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            )
          }
        >
          {isFirstStep ? cancelButtonText : previousButtonText}
        </Button>

        <Button
          variant={isLastStep ? 'primary' : 'secondary'}
          size="md"
          onClick={isLastStep ? onComplete : goToNextStep}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          icon={
            !isLastStep && !isSubmitting && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            )
          }
        >
          {isSubmitting ? 'Processing...' : isLastStep ? submitButtonText : nextButtonText}
        </Button>
      </div>
    </div>
  );
};

export default MultiStepForm;
