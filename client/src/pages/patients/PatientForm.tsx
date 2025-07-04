import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MultiStepForm from '../../components/common/MultiStepForm';

interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory: string;
  allergies: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactRelationship: string;
  emergencyContactPhone: string;
}

const PatientForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    bloodGroup: '',
    emergencyContactName: '',
    emergencyContactRelationship: '',
    emergencyContactPhone: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<PatientFormData>>({});
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!isEditMode) return;

      try {
        setIsFetching(true);
        console.log('Fetching patient for edit with ID:', id);

        // Try to fetch from API first
        try {
          const response = await api.get(`/patients/${id}`);
          if (response.data && response.data.data) {
            const patientData = response.data.data;
            console.log('Patient data fetched from API:', patientData);

            // Format date for input field (YYYY-MM-DD)
            const formattedDate = patientData.dateOfBirth
              ? new Date(patientData.dateOfBirth).toISOString().split('T')[0]
              : '';

            setFormData({
              firstName: patientData.firstName || '',
              lastName: patientData.lastName || '',
              email: patientData.email || '',
              phoneNumber: patientData.phoneNumber || '',
              dateOfBirth: formattedDate,
              gender: patientData.gender || '',
              address: patientData.address || '',
              medicalHistory: patientData.medicalHistory || '',
              allergies: Array.isArray(patientData.allergies)
                ? patientData.allergies.join(', ')
                : (patientData.allergies || ''),
              bloodGroup: patientData.bloodType || patientData.bloodGroup || '',
              emergencyContactName: patientData.emergencyContact?.name || '',
              emergencyContactRelationship: patientData.emergencyContact?.relationship || '',
              emergencyContactPhone: patientData.emergencyContact?.phoneNumber || ''
            });
          } else {
            throw new Error('Invalid API response format');
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError);
          if (apiError.response?.status === 404) {
            toast.error('Patient not found');
            navigate('/patients');
            return;
          } else if (apiError.response?.status === 401) {
            toast.error('Please log in to edit patient details');
            return;
          } else if (apiError.response?.status === 403) {
            toast.error('Access denied');
            return;
          } else {
            toast.error('Failed to load patient data');
          }
        }
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Failed to load patient information');
        navigate('/patients');
      } finally {
        setIsFetching(false);
      }
    };

    fetchPatient();
  }, [id, isEditMode, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof PatientFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PatientFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      // Navigate to the step with errors
      if (errors.firstName || errors.lastName || errors.dateOfBirth || errors.gender) {
        setCurrentStep(0); // Personal Info step
      } else if (errors.phoneNumber || errors.email) {
        setCurrentStep(1); // Contact Info step
      }

      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const patientData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        address: formData.address,
        medicalHistory: formData.medicalHistory,
        allergies: formData.allergies.split(',').map(item => item.trim()).filter(item => item),
        bloodType: formData.bloodGroup,
        emergencyContact: {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phoneNumber: formData.emergencyContactPhone
        }
      };

      // Remove empty fields to avoid validation errors
      Object.keys(patientData).forEach(key => {
        if (patientData[key as keyof typeof patientData] === '' ||
            (Array.isArray(patientData[key as keyof typeof patientData]) &&
             (patientData[key as keyof typeof patientData] as any[]).length === 0)) {
          delete patientData[key as keyof typeof patientData];
        }
      });

      // Clean up emergency contact
      if (!patientData.emergencyContact.name &&
          !patientData.emergencyContact.relationship &&
          !patientData.emergencyContact.phoneNumber) {
        delete patientData.emergencyContact;
      }

      console.log('Submitting patient data:', patientData);

      try {
        let response;
        if (isEditMode) {
          response = await api.put(`/patients/${id}`, patientData);
          console.log('Patient updated successfully:', response.data);
        } else {
          response = await api.post('/patients', patientData);
          console.log('Patient created successfully:', response.data);
        }

        toast.success(`Patient ${isEditMode ? 'updated' : 'created'} successfully`);

        // Navigate to patient detail page or list
        if (isEditMode) {
          navigate(`/patients/${id}`);
        } else {
          // For new patients, navigate to the patient list or the new patient's detail page
          const newPatientId = response.data?.data?._id;
          if (newPatientId) {
            navigate(`/patients/${newPatientId}`);
          } else {
            navigate('/patients');
          }
        }
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        if (apiError.response?.status === 401) {
          toast.error('Please log in to save patient data');
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied');
        } else if (apiError.response?.status === 400) {
          toast.error(apiError.response?.data?.message || 'Invalid patient data');
        } else {
          toast.error(`Failed to ${isEditMode ? 'update' : 'create'} patient`);
        }
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} patient`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'receptionist') {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this page.</p>
        <Button variant="primary" onClick={() => navigate('/patients')}>
          Return to Patient List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Patient' : 'Register New Patient'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update patient information in the system'
            : 'Add a new patient to the dermatology clinic system'}
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-6 md:col-span-2">
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
                    className={`w-full px-4 py-2 border ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
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
                    className={`w-full px-4 py-2 border ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date of Birth <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.dateOfBirth ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.gender ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
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

                <div>
                  <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Blood Group
                  </label>
                  <select
                    id="bloodGroup"
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Select Blood Group</option>
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

            {/* Contact Information */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="+92 300 1234567"
                    className={`w-full px-4 py-2 border ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${
                      errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                    } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Emergency Contact (Optional)</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medical Information</h3>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Allergies (comma separated)
                  </label>
                  <input
                    type="text"
                    id="allergies"
                    name="allergies"
                    value={formData.allergies}
                    onChange={handleChange}
                    placeholder="e.g. Penicillin, Dust mites, Peanuts"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Medical History
                  </label>
                  <textarea
                    id="medicalHistory"
                    name="medicalHistory"
                    rows={4}
                    value={formData.medicalHistory}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/patients')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              {isEditMode ? 'Update Patient' : 'Register Patient'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientForm;
