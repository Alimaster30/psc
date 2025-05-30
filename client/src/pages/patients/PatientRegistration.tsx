import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MultiStepForm from '../../components/common/MultiStepForm';
import { saveFormData, loadFormData, clearFormData } from '../../utils/formPersistence';
import FormDraftRecovery from '../../components/common/FormDraftRecovery';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  bloodType: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';
}

const PatientRegistration: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: 'male',
    address: '',
    emergencyContact: {
      name: '',
      relationship: '',
      phoneNumber: '',
    },
    bloodType: '',
  });

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Form persistence
  const formId = 'patient-registration';
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftTime, setSavedDraftTime] = useState<Date | null>(null);

  // Exit confirmation
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitDestination, setExitDestination] = useState('');

  // Load saved draft if available
  useEffect(() => {
    // Check for saved draft
    const savedData = loadFormData<FormData>(formId);
    if (savedData) {
      setShowExitDialog(false);
      setSavedDraftTime(new Date(savedData.timestamp));
      setHasSavedDraft(true);
    }
  }, []);

  // Auto-save form data every 10 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formData.firstName || formData.lastName || formData.email) {
        saveFormData(formId, formData);
        setHasSavedDraft(true);
        setSavedDraftTime(new Date());
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [formData]);

  // Handle recovering saved draft
  const handleRecoverDraft = () => {
    const savedData = loadFormData<FormData>(formId);
    if (savedData) {
      setFormData(savedData.data);
      setHasSavedDraft(false);
    }
  };

  // Handle discarding saved draft
  const handleDiscardDraft = () => {
    clearFormData(formId);
    setHasSavedDraft(false);
  };

  // Handle exit confirmation
  const handleNavigateAway = (destination: string) => {
    if (formData.firstName || formData.lastName || formData.email) {
      setExitDestination(destination);
      setShowExitDialog(true);
    } else {
      navigate(destination);
    }
  };

  // Confirm exit and navigate
  const confirmExit = () => {
    clearFormData(formId);
    setShowExitDialog(false);
    navigate(exitDestination);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name.includes('.')) {
      // Handle nested objects (emergency contact)
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when field is edited
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validate specific step
  const validateStep = (step: number): Record<string, string> => {
    const stepErrors: Record<string, string> = {};

    // Step 0: Personal Information
    if (step === 0) {
      if (!formData.firstName.trim()) stepErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) stepErrors.lastName = 'Last name is required';
      if (!formData.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) stepErrors.gender = 'Gender is required';
    }

    // Step 1: Contact Information
    else if (step === 1) {
      if (!formData.phoneNumber.trim()) stepErrors.phoneNumber = 'Phone number is required';
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        stepErrors.email = 'Invalid email format';
      }
      if (!formData.address.trim()) stepErrors.address = 'Address is required';
    }

    // Step 2: Emergency Contact
    else if (step === 2) {
      if (!formData.emergencyContact.name.trim())
        stepErrors['emergencyContact.name'] = 'Emergency contact name is required';
      if (!formData.emergencyContact.relationship.trim())
        stepErrors['emergencyContact.relationship'] = 'Relationship is required';
      if (!formData.emergencyContact.phoneNumber.trim())
        stepErrors['emergencyContact.phoneNumber'] = 'Emergency contact phone is required';
    }

    return stepErrors;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate all steps
    let hasErrors = false;
    let firstErrorStep = -1;

    for (let i = 0; i < 4; i++) {
      const stepErrors = validateStep(i);
      if (Object.keys(stepErrors).length > 0) {
        hasErrors = true;
        if (firstErrorStep === -1) {
          firstErrorStep = i;
        }
      }
    }

    if (hasErrors) {
      // Navigate to the first step with errors
      setCurrentStep(firstErrorStep);
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);

      // Send the patient data to the API
      const response = await api.post('/patients', formData);

      // Clear saved form data if successful
      clearFormData(formId);

      toast.success('Patient registered successfully');

      // Navigate to the patient detail page
      navigate(`/patients/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Error registering patient:', error);

      // Show more specific error message if available
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(`Failed to register patient: ${error.response.data.error}`);
      } else {
        toast.error('Failed to register patient. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form completion
  const handleFormComplete = () => {
    handleSubmit();
  };

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.firstName}
            onChange={handleChange}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.lastName}
            onChange={handleChange}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date of Birth <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            className={`w-full px-4 py-2 border ${errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.dateOfBirth}
            onChange={handleChange}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>

        {/* Gender */}
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            className={`w-full px-4 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>

        {/* Blood Type */}
        <div>
          <label htmlFor="bloodType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Blood Type
          </label>
          <select
            id="bloodType"
            name="bloodType"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            value={formData.bloodType}
            onChange={handleChange}
          >
            <option value="">Unknown</option>
            <option value="A+">A+</option>
            <option value="A-">A-</option>
            <option value="B+">B+</option>
            <option value="B-">B-</option>
            <option value="AB+">AB+</option>
            <option value="AB-">AB-</option>
            <option value="O+">O+</option>
            <option value="O-">O-</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Step 2: Contact Information
  const renderContactInfoStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            className={`w-full px-4 py-2 border ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.phoneNumber}
            onChange={handleChange}
          />
          {errors.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Address - Full width */}
        <div className="md:col-span-2">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address <span className="text-red-600">*</span>
          </label>
          <textarea
            id="address"
            name="address"
            rows={3}
            className={`w-full px-4 py-2 border ${errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.address}
            onChange={handleChange}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 3: Emergency Contact
  const renderEmergencyContactStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contact</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="emergencyContact.name"
            name="emergencyContact.name"
            className={`w-full px-4 py-2 border ${errors['emergencyContact.name'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.emergencyContact.name}
            onChange={handleChange}
          />
          {errors['emergencyContact.name'] && (
            <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.name']}</p>
          )}
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Relationship <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="emergencyContact.relationship"
            name="emergencyContact.relationship"
            className={`w-full px-4 py-2 border ${errors['emergencyContact.relationship'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.emergencyContact.relationship}
            onChange={handleChange}
          />
          {errors['emergencyContact.relationship'] && (
            <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.relationship']}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="emergencyContact.phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number <span className="text-red-600">*</span>
          </label>
          <input
            type="tel"
            id="emergencyContact.phoneNumber"
            name="emergencyContact.phoneNumber"
            className={`w-full px-4 py-2 border ${errors['emergencyContact.phoneNumber'] ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            value={formData.emergencyContact.phoneNumber}
            onChange={handleChange}
          />
          {errors['emergencyContact.phoneNumber'] && (
            <p className="mt-1 text-sm text-red-600">{errors['emergencyContact.phoneNumber']}</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 4: Review
  const renderReviewStep = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Information</h3>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Full Name:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.firstName} {formData.lastName}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Date of Birth:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Gender:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.gender}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Blood Type:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.bloodType || 'Not provided'}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Phone Number:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.phoneNumber}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Email:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.email || 'Not provided'}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500 dark:text-gray-400">Address:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.address}</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Emergency Contact</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Name:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.emergencyContact.name}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Relationship:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.emergencyContact.relationship}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Phone Number:</p>
            <p className="text-gray-900 dark:text-white font-medium">{formData.emergencyContact.phoneNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Define form steps
  const formSteps = [
    {
      title: 'Personal',
      content: renderPersonalInfoStep(),
      validate: () => validateStep(0)
    },
    {
      title: 'Contact',
      content: renderContactInfoStep(),
      validate: () => validateStep(1)
    },
    {
      title: 'Emergency',
      content: renderEmergencyContactStep(),
      validate: () => validateStep(2)
    },
    {
      title: 'Review',
      content: renderReviewStep()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Registration</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Register a new patient in the system
        </p>
      </div>

      {/* Draft Recovery Dialog */}
      {hasSavedDraft && savedDraftTime && (
        <FormDraftRecovery
          timestamp={savedDraftTime.toISOString()}
          onRecover={handleRecoverDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <Card>
        <MultiStepForm
          steps={formSteps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          onComplete={handleFormComplete}
          onCancel={() => handleNavigateAway('/patients')}
          isSubmitting={isLoading}
          formId={formId}
        />
      </Card>

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave this page? All unsaved changes will be lost."
        confirmLabel="Leave Page"
        cancelLabel="Stay"
        onConfirm={confirmExit}
        onCancel={() => setShowExitDialog(false)}
        type="warning"
      />
    </div>
  );
};

export default PatientRegistration;
