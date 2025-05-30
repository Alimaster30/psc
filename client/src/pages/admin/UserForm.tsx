import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import MultiStepForm from '../../components/common/MultiStepForm';
import { saveFormData, loadFormData, clearFormData } from '../../utils/formPersistence';
import FormDraftRecovery from '../../components/common/FormDraftRecovery';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'receptionist' | 'dermatologist';
  phoneNumber: string;
  password?: string;
  confirmPassword?: string;
  isActive: boolean;
}

const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'receptionist',
    phoneNumber: '',
    isActive: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form persistence
  const location = useLocation();
  const formId = isEditMode ? `user-edit-${id}` : 'user-create';
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftTime, setSavedDraftTime] = useState<Date | null>(null);
  const [showDraftDialog, setShowDraftDialog] = useState(false);

  // Exit confirmation
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitDestination, setExitDestination] = useState('');

  // Load saved draft if available
  useEffect(() => {
    // Check for saved draft
    const savedData = loadFormData<UserFormData>(formId);
    if (savedData && !isEditMode) {
      setShowDraftDialog(true);
      setSavedDraftTime(new Date(savedData.timestamp));
      setHasSavedDraft(true);
    }
  }, [formId, isEditMode]);

  // Auto-save form data every 10 seconds
  useEffect(() => {
    if (isFetching) return;

    const autoSaveInterval = setInterval(() => {
      if (formData.firstName || formData.lastName || formData.email) {
        saveFormData(formId, formData);
        setHasSavedDraft(true);
        setSavedDraftTime(new Date());
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [formId, formData, isFetching]);

  // Handle recovering saved draft
  const handleRecoverDraft = () => {
    const savedData = loadFormData<UserFormData>(formId);
    if (savedData) {
      setFormData(savedData.data);
      setShowDraftDialog(false);
    }
  };

  // Handle discarding saved draft
  const handleDiscardDraft = () => {
    clearFormData(formId);
    setShowDraftDialog(false);
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

  useEffect(() => {
    console.log('UserForm useEffect triggered with ID:', id, 'isEditMode:', isEditMode);

    const fetchUser = async () => {
      if (!isEditMode) return;

      // Don't fetch if ID is undefined or empty
      if (!id || id === 'undefined') {
        console.log('Skipping fetch due to invalid ID:', id);
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        console.log('Fetching user for edit with ID:', id);

        // Try to fetch from API
        try {
          const response = await api.get(`/users/${id}`);
          if (response.data && response.data.data) {
            const userData = response.data.data;
            setFormData({
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              role: userData.role,
              phoneNumber: userData.phoneNumber || '',
              isActive: userData.isActive,
              password: '',
              confirmPassword: '',
            });
          } else {
            // If API response doesn't have the expected format, use mock data
            useMockData();
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError);
          if (apiError.response?.status === 404) {
            toast.error('User not found');
            navigate('/users');
          } else if (apiError.response?.status === 401) {
            toast.error('Please log in to edit user details');
          } else if (apiError.response?.status === 403) {
            toast.error('Access denied');
          } else {
            console.log('API endpoint not available, using mock data');
            useMockData();
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
      } finally {
        setIsFetching(false);
      }
    };

    // Function to set mock data
    const useMockData = () => {
      // Find the user with the matching ID from our mock data
      const mockUsers = [
        {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@psc.com',
          role: 'admin',
          isActive: true,
          phoneNumber: '+92 300 1234567',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          firstName: 'Dr',
          lastName: 'Dermatologist',
          email: 'doctor@psc.com',
          role: 'dermatologist',
          isActive: true,
          phoneNumber: '+92 300 7654321',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          firstName: 'Front',
          lastName: 'Desk',
          email: 'receptionist@psc.com',
          role: 'receptionist',
          isActive: true,
          phoneNumber: '+92 300 9876543',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
          updatedAt: new Date().toISOString()
        }
      ];

      const foundUser = mockUsers.find(u => u._id === id);
      if (foundUser) {
        setFormData({
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          email: foundUser.email,
          role: foundUser.role as 'admin' | 'receptionist' | 'dermatologist',
          phoneNumber: foundUser.phoneNumber || '',
          isActive: foundUser.isActive,
          password: '',
          confirmPassword: '',
        });
      } else {
        toast.error('User not found');
        navigate('/users');
      }
    };

    fetchUser();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when field is edited
    if (errors[name as keyof UserFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };



  const handleSubmit = async (e: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate all steps
    let hasErrors = false;
    let firstErrorStep = -1;

    for (let i = 0; i < 5; i++) {
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

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...dataToSend } = formData;

      // If password is empty in edit mode, remove it from the data to send
      if (isEditMode && !dataToSend.password) {
        delete dataToSend.password;
      }

      try {
        if (isEditMode) {
          await api.put(`/users/${id}`, dataToSend);
        } else {
          await api.post('/users', dataToSend);
        }

        toast.success(`User ${isEditMode ? 'updated' : 'created'} successfully`);
        clearFormData(formId);
        navigate('/users');
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        if (apiError.response?.status === 401) {
          toast.error('You need admin privileges to create users');
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied: Admin role required');
        } else {
          toast.error(apiError.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        }
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} user:`, error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} user`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading user data...</p>
      </div>
    );
  }

  // Step 1: Personal Information
  const renderPersonalInfoStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.firstName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.lastName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Step 2: Role & Permissions
  const renderRoleStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Role & Permissions</h3>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role <span className="text-red-600">*</span>
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="admin">Admin</option>
            <option value="dermatologist">Dermatologist</option>
            <option value="receptionist">Receptionist</option>
          </select>
        </div>

        <div>
          <label htmlFor="isActive" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <div className="mt-2">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
            </label>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Role Description</h4>
          {formData.role === 'admin' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Admin:</strong> Full access to all system features including user management, analytics, and system settings.
            </p>
          )}
          {formData.role === 'dermatologist' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Dermatologist:</strong> Can view patient records, create prescriptions, and manage appointments. Limited access to billing and user management.
            </p>
          )}
          {formData.role === 'receptionist' && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Receptionist:</strong> Can register patients, schedule appointments, and manage billing. Cannot access medical records or prescriptions.
            </p>
          )}
        </div>
      </div>
    );
  };

  // Step 3: Contact Information
  const renderContactStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+92 300 1234567"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
        </div>
      </div>
    );
  };

  // Step 4: Credentials
  const renderCredentialsStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Account Credentials</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {isEditMode ? 'New Password (leave blank to keep current)' : 'Password'} {!isEditMode && <span className="text-red-600">*</span>}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.password ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password must be at least 8 characters long
            </p>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password {!isEditMode && <span className="text-red-600">*</span>}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                className={`w-full px-4 py-2 border ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 dark:text-gray-400"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 5: Review
  const renderReviewStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Information</h3>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Personal Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">First Name:</p>
              <p className="text-gray-900 dark:text-white font-medium">{formData.firstName}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Last Name:</p>
              <p className="text-gray-900 dark:text-white font-medium">{formData.lastName}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Role & Permissions</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Role:</p>
              <p className="text-gray-900 dark:text-white font-medium capitalize">{formData.role}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Status:</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formData.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Contact Information</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 dark:text-gray-400">Email:</p>
              <p className="text-gray-900 dark:text-white font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400">Phone Number:</p>
              <p className="text-gray-900 dark:text-white font-medium">
                {formData.phoneNumber || 'Not provided'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Validate specific step
  const validateStep = (step: number): Record<string, string> => {
    const errors: Record<string, string> = {};

    // Step 0: Personal Information
    if (step === 0) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required';
      }
    }

    // Step 2: Contact Information
    else if (step === 2) {
      if (!formData.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        errors.email = 'Invalid email format';
      }
    }

    // Step 3: Credentials
    else if (step === 3 && !isEditMode) {
      if (!formData.password) {
        errors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    return errors;
  };

  // Define form steps
  const formSteps = [
    {
      title: 'Personal',
      content: renderPersonalInfoStep(),
      validate: () => validateStep(0)
    },
    {
      title: 'Role',
      content: renderRoleStep(),
      validate: () => validateStep(1)
    },
    {
      title: 'Contact',
      content: renderContactStep(),
      validate: () => validateStep(2)
    },
    {
      title: 'Credentials',
      content: renderCredentialsStep(),
      validate: () => validateStep(3)
    },
    {
      title: 'Review',
      content: renderReviewStep(),
      validate: () => validateStep(4)
    }
  ];

  // Handle form completion
  const handleFormComplete = () => {
    // Validate all steps
    let hasErrors = false;
    let firstErrorStep = -1;

    for (let i = 0; i < 5; i++) {
      const stepErrors = validateStep(i);
      if (Object.keys(stepErrors).length > 0) {
        hasErrors = true;
        if (firstErrorStep === -1) {
          firstErrorStep = i;
        }
      }
    }

    if (!hasErrors) {
      handleSubmit(new Event('submit') as React.FormEvent);
    } else {
      // Navigate to the first step with errors
      setCurrentStep(firstErrorStep);
      toast.error('Please fix the errors in the form');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit User' : 'Add New Staff Member'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update user information in the system'
            : 'Add a new staff member to the dermatology clinic system'}
        </p>
      </div>

      {/* Draft Recovery Dialog */}
      {showDraftDialog && savedDraftTime && (
        <FormDraftRecovery
          timestamp={savedDraftTime}
          onRecover={handleRecoverDraft}
          onDiscard={handleDiscardDraft}
        />
      )}

      <Card>
        <MultiStepForm
          steps={formSteps}
          onComplete={handleFormComplete}
          onCancel={() => handleNavigateAway('/users')}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isSubmitting={isLoading}
        />
      </Card>

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitDialog}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave this page? All unsaved changes will be lost."
        confirmText="Leave Page"
        cancelText="Stay"
        onConfirm={confirmExit}
        onCancel={() => setShowExitDialog(false)}
        type="warning"
      />
    </div>
  );
};

export default UserForm;
