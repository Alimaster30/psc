import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import MultiStepForm from '../../components/common/MultiStepForm';
import { saveFormData, loadFormData, clearFormData } from '../../utils/formPersistence';
import FormDraftRecovery from '../../components/common/FormDraftRecovery';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  category: string;
  description?: string;
  process?: string;
  bundleOptions?: {
    sessions: number;
    price: number;
    savings: number;
  }[];
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
  serviceId: string;
  date: string;
  time: string;
  reason: string;
  notes: string;
}

const CreateAppointment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromQuery = queryParams.get('patientId');

  const isEditMode = !!id;

  const [formData, setFormData] = useState<AppointmentFormData>({
    patientId: patientIdFromQuery || '',
    doctorId: '',
    serviceId: '',
    date: '',
    time: '',
    reason: '',
    notes: ''
  });

  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(0);

  // Form persistence
  const formId = isEditMode ? `appointment-edit-${id}` : 'appointment-create';
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedDraftTime, setSavedDraftTime] = useState<Date | null>(null);

  // Exit confirmation
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [exitDestination, setExitDestination] = useState('');

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'receptionist') {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to schedule appointments.</p>
        <Button variant="primary" onClick={() => navigate('/appointments')}>
          Return to Appointments
        </Button>
      </div>
    );
  }

  // Load saved draft if available
  useEffect(() => {
    // Check for saved draft
    const savedData = loadFormData<AppointmentFormData>(formId);
    if (savedData && !isEditMode) {
      setShowExitDialog(false);
      setSavedDraftTime(new Date(savedData.timestamp));
      setHasSavedDraft(true);
    }
  }, [formId, isEditMode]);

  // Auto-save form data every 10 seconds
  useEffect(() => {
    if (isFetching) return;

    const autoSaveInterval = setInterval(() => {
      if (formData.patientId || formData.doctorId || formData.date || formData.reason) {
        saveFormData(formId, formData);
        setHasSavedDraft(true);
        setSavedDraftTime(new Date());
      }
    }, 10000);

    return () => clearInterval(autoSaveInterval);
  }, [formId, formData, isFetching]);

  // Handle recovering saved draft
  const handleRecoverDraft = () => {
    const savedData = loadFormData<AppointmentFormData>(formId);
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
    if (formData.patientId || formData.doctorId || formData.date || formData.reason) {
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
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);

        // Fetch patients from the API
        const response = await axios.get('/api/patients');
        setPatients(response.data.data);
        setIsLoadingPatients(false);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
        setIsLoadingPatients(false);
      }
    };

    const fetchDoctors = async () => {
      try {
        setIsLoadingDoctors(true);

        // Fetch doctors from the API
        const response = await axios.get('/api/users?role=dermatologist');
        setDoctors(response.data.data);
        setIsLoadingDoctors(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load doctors');
        setIsLoadingDoctors(false);
      }
    };

    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);

        // Fetch services from the API
        const response = await axios.get('/api/services');
        setServices(response.data.data);
        setIsLoadingServices(false);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
        setIsLoadingServices(false);
      }
    };

    const fetchAppointment = async () => {
      if (!isEditMode) return;

      try {
        setIsFetching(true);

        // Fetch appointment from the API
        const response = await axios.get(`/api/appointments/${id}`);
        const appointmentData = response.data.data;

        setFormData({
          patientId: appointmentData.patient,
          doctorId: appointmentData.dermatologist,
          serviceId: appointmentData.service,
          date: appointmentData.date.split('T')[0], // Format date as YYYY-MM-DD
          time: appointmentData.startTime,
          reason: appointmentData.reason,
          notes: appointmentData.notes || ''
        });

        setIsFetching(false);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Failed to load appointment information');
        setIsFetching(false);
        navigate('/appointments');
      }
    };

    fetchPatients();
    fetchDoctors();
    fetchServices();
    fetchAppointment();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    // Generate available time slots based on selected date and doctor
    const fetchAvailableTimes = async () => {
      if (formData.date && formData.doctorId) {
        try {
          // Fetch available times from the API
          const response = await axios.get(`/api/appointments/available-times?date=${formData.date}&doctorId=${formData.doctorId}`);
          setAvailableTimes(response.data.data);
        } catch (error) {
          console.error('Error fetching available times:', error);

          // Fallback to default time slots if API fails
          const defaultTimes = [
            '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
            '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
            '04:00 PM', '04:30 PM'
          ];
          setAvailableTimes(defaultTimes);
        }
      } else {
        setAvailableTimes([]);
      }
    };

    fetchAvailableTimes();
  }, [formData.date, formData.doctorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is edited
    if (errors[name as keyof AppointmentFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    // Reset time when date or doctor changes
    if (name === 'date' || name === 'doctorId') {
      setFormData(prev => ({ ...prev, time: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<AppointmentFormData> = {};

    if (!formData.patientId) newErrors.patientId = 'Please select a patient';
    if (!formData.doctorId) newErrors.doctorId = 'Please select a doctor';
    if (!formData.serviceId) newErrors.serviceId = 'Please select a service';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for appointment is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      // Navigate to the step with errors
      if (errors.patientId) {
        setCurrentStep(0); // Patient Selection step
      } else if (errors.doctorId) {
        setCurrentStep(1); // Doctor Selection step
      } else if (errors.serviceId) {
        setCurrentStep(2); // Service Selection step
      } else if (errors.date || errors.time) {
        setCurrentStep(3); // Date & Time Selection step
      } else if (errors.reason) {
        setCurrentStep(4); // Appointment Details step
      }

      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare appointment data
      const appointmentData = {
        patient: formData.patientId,
        dermatologist: formData.doctorId,
        service: formData.serviceId,
        date: formData.date,
        startTime: formData.time,
        endTime: calculateEndTime(formData.time), // Calculate end time (30 min after start)
        reason: formData.reason,
        notes: formData.notes,
        status: 'scheduled'
      };

      console.log('Submitting appointment data:', JSON.stringify(appointmentData, null, 2));

      // Call the API
      let response;
      if (isEditMode) {
        response = await axios.put(`/api/appointments/${id}`, appointmentData);
      } else {
        // Add authentication token to the request
        const token = localStorage.getItem('token');
        response = await axios.post('/api/appointments', appointmentData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }

      console.log('API response:', response.data);

      // Clear saved form data if successful
      if (!isEditMode) {
        clearFormData(formId);
      }

      toast.success(`Appointment ${isEditMode ? 'updated' : 'scheduled'} successfully`);
      navigate('/appointments');
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      console.error('Error details:', error.response?.data);

      // Show more specific error message if available
      if (error.response?.data?.message) {
        toast.error(`Failed to schedule appointment: ${error.response.data.message}`);
      } else if (error.response?.data?.error) {
        toast.error(`Failed to schedule appointment: ${error.response.data.error}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'schedule'} appointment. Please try again.`);
      }

      setIsSubmitting(false);
    }
  };

  // Helper function to calculate end time (30 minutes after start time)
  const calculateEndTime = (startTime: string): string => {
    // Parse the time string (e.g., "09:30 AM")
    const [time, period] = startTime.split(' ');
    const [hourStr, minuteStr] = time.split(':');

    let hour = parseInt(hourStr, 10);
    let minute = parseInt(minuteStr, 10);

    // Convert to 24-hour format for calculation
    if (period === 'PM' && hour < 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    // Add 30 minutes
    minute += 30;
    if (minute >= 60) {
      minute -= 60;
      hour += 1;
    }

    // Convert back to 12-hour format
    let newPeriod = hour >= 12 ? 'PM' : 'AM';
    let newHour = hour % 12;
    if (newHour === 0) newHour = 12;

    // Format the time
    return `${newHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${newPeriod}`;
  };

  // Handle form completion
  const handleFormComplete = () => {
    handleSubmit();
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Step 1: Patient Selection
  const renderPatientSelectionStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Patient</h3>
      <div>
        <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Patient <span className="text-red-600">*</span>
        </label>
        {isLoadingPatients ? (
          <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 animate-pulse h-10"></div>
        ) : (
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.patientId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            disabled={isEditMode}
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName} ({patient.email})
              </option>
            ))}
          </select>
        )}
        {errors.patientId && (
          <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
        )}
      </div>

      {formData.patientId && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Patient</h4>
          {patients.filter(p => p._id === formData.patientId).map(patient => (
            <div key={patient._id} className="text-sm">
              <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400">{patient.email}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 2: Doctor Selection
  const renderDoctorSelectionStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Doctor</h3>
      <div>
        <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Doctor <span className="text-red-600">*</span>
        </label>
        {isLoadingDoctors ? (
          <div className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-800 animate-pulse h-10"></div>
        ) : (
          <select
            id="doctorId"
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.doctorId ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
          >
            <option value="">Select Doctor</option>
            {doctors.map(doctor => (
              <option key={doctor._id} value={doctor._id}>
                {doctor.firstName} {doctor.lastName} ({doctor.specialization})
              </option>
            ))}
          </select>
        )}
        {errors.doctorId && (
          <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
        )}
      </div>

      {formData.doctorId && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Doctor</h4>
          {doctors.filter(d => d._id === formData.doctorId).map(doctor => (
            <div key={doctor._id} className="text-sm">
              <p className="font-medium">{doctor.firstName} {doctor.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400">{doctor.specialization}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Step 3: Enhanced Service Selection
  const renderServiceSelectionStep = () => {
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>(formData.serviceId ? [formData.serviceId] : []);
    const [selectedBundles, setSelectedBundles] = useState<{[serviceId: string]: {sessions: number, price: number, savings: number}}>({});

    const categories = Array.from(new Set(services.map(service => service.category)));
    const filteredServices = selectedCategory
      ? services.filter(service => service.category === selectedCategory)
      : services;

    const handleServiceToggle = (serviceId: string) => {
      const newSelectedServices = selectedServices.includes(serviceId)
        ? selectedServices.filter(id => id !== serviceId)
        : [...selectedServices, serviceId];

      setSelectedServices(newSelectedServices);

      // Update form data with primary service (first selected)
      if (newSelectedServices.length > 0) {
        setFormData(prev => ({ ...prev, serviceId: newSelectedServices[0] }));
      } else {
        setFormData(prev => ({ ...prev, serviceId: '' }));
      }
    };

    const handleBundleSelect = (serviceId: string, bundle: {sessions: number, price: number, savings: number}) => {
      setSelectedBundles(prev => ({
        ...prev,
        [serviceId]: bundle
      }));
    };

    const getTotalPrice = () => {
      return selectedServices.reduce((total, serviceId) => {
        const service = services.find(s => s._id === serviceId);
        if (!service) return total;

        const bundle = selectedBundles[serviceId];
        return total + (bundle ? bundle.price : service.price);
      }, 0);
    };

    const getTotalSavings = () => {
      return Object.values(selectedBundles).reduce((total, bundle) => total + bundle.savings, 0);
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Services</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose one or more services for this appointment. Bundle options available for savings.
          </p>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Filter by Category
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All Categories
            </button>
            {categories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {isLoadingServices ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map(service => {
              const isSelected = selectedServices.includes(service._id);
              const selectedBundle = selectedBundles[service._id];

              return (
                <div
                  key={service._id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => handleServiceToggle(service._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleServiceToggle(service._id)}
                          className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <h4 className="font-semibold text-gray-900 dark:text-white">{service.name}</h4>
                      </div>

                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                          {service.category}
                        </span>
                      </div>

                      {service.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {service.description}
                        </p>
                      )}

                      <div className="mb-3">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                          ₨{selectedBundle ? selectedBundle.price.toLocaleString() : service.price.toLocaleString()}
                          {selectedBundle && (
                            <span className="text-sm font-normal text-gray-500 line-through ml-2">
                              ₨{(service.price * selectedBundle.sessions).toLocaleString()}
                            </span>
                          )}
                        </p>
                        {selectedBundle && (
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                            Save ₨{selectedBundle.savings.toLocaleString()} ({selectedBundle.sessions} sessions)
                          </p>
                        )}
                      </div>

                      {/* Bundle Options */}
                      {service.bundleOptions && service.bundleOptions.length > 0 && isSelected && (
                        <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bundle Options (Save More!)
                          </h5>
                          <div className="space-y-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const newBundles = { ...selectedBundles };
                                delete newBundles[service._id];
                                setSelectedBundles(newBundles);
                              }}
                              className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                !selectedBundle
                                  ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300'
                                  : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span>Single Session</span>
                                <span className="font-medium">₨{service.price.toLocaleString()}</span>
                              </div>
                            </button>

                            {service.bundleOptions.map((bundle, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBundleSelect(service._id, bundle);
                                }}
                                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                                  selectedBundle?.sessions === bundle.sessions
                                    ? 'bg-primary-100 dark:bg-primary-900/30 border border-primary-300'
                                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">{bundle.sessions} Sessions</span>
                                    <span className="text-green-600 dark:text-green-400 ml-2 text-xs">
                                      Save ₨{bundle.savings.toLocaleString()}
                                    </span>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">₨{bundle.price.toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 line-through">
                                      ₨{(service.price * bundle.sessions).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Process Information */}
                      {service.process && isSelected && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                          <h5 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-1">
                            Treatment Process:
                          </h5>
                          <div className="text-sm text-blue-700 dark:text-blue-400">
                            {service.process.split('\n').map((step, index) => (
                              <div key={index} className="mb-1">
                                {step.trim() && (
                                  <span className="inline-block">• {step.trim()}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Selected Services Summary */}
        {selectedServices.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
              Selected Services Summary
            </h4>
            <div className="space-y-2">
              {selectedServices.map(serviceId => {
                const service = services.find(s => s._id === serviceId);
                const bundle = selectedBundles[serviceId];
                if (!service) return null;

                return (
                  <div key={serviceId} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-medium">{service.name}</span>
                      {bundle && (
                        <span className="text-gray-500 ml-2">({bundle.sessions} sessions)</span>
                      )}
                    </div>
                    <span className="font-medium">
                      ₨{(bundle ? bundle.price : service.price).toLocaleString()}
                    </span>
                  </div>
                );
              })}

              {getTotalSavings() > 0 && (
                <div className="flex justify-between items-center text-sm text-green-600 dark:text-green-400 border-t pt-2">
                  <span className="font-medium">Total Savings:</span>
                  <span className="font-medium">₨{getTotalSavings().toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white border-t pt-2">
                <span>Total Amount:</span>
                <span>₨{getTotalPrice().toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {errors.serviceId && (
          <p className="mt-1 text-sm text-red-600">{errors.serviceId}</p>
        )}
      </div>
    );
  };

  // Step 4: Date & Time Selection
  const renderDateTimeStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Date & Time</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date <span className="text-red-600">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]} // Set min date to today
            className={`w-full px-4 py-2 border ${
              errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time <span className="text-red-600">*</span>
          </label>
          <select
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full px-4 py-2 border ${
              errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
            } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
            disabled={!formData.date || !formData.doctorId}
          >
            <option value="">Select Time</option>
            {availableTimes.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time}</p>
          )}
          {formData.date && formData.doctorId && availableTimes.length === 0 && (
            <p className="mt-1 text-sm text-yellow-600">No available time slots for this date</p>
          )}
          {(!formData.date || !formData.doctorId) && (
            <p className="mt-1 text-sm text-gray-500">Please select a date and doctor first</p>
          )}
        </div>
      </div>

      {formData.date && formData.time && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Date & Time</h4>
          <div className="text-sm">
            <p><span className="font-medium">Date:</span> {formData.date}</p>
            <p><span className="font-medium">Time:</span> {formData.time}</p>
          </div>
        </div>
      )}
    </div>
  );

  // Step 5: Appointment Details
  const renderDetailsStep = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Details</h3>
      <div>
        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason for Appointment <span className="text-red-600">*</span>
        </label>
        <textarea
          id="reason"
          name="reason"
          rows={3}
          value={formData.reason}
          onChange={handleChange}
          className={`w-full px-4 py-2 border ${
            errors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
          } rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white`}
          placeholder="Describe the reason for this appointment"
        />
        {errors.reason && (
          <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          value={formData.notes}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          placeholder="Any additional information or special instructions"
        />
      </div>
    </div>
  );

  // Step 6: Review & Confirm
  const renderReviewStep = () => {
    const selectedPatient = patients.find(p => p._id === formData.patientId);
    const selectedDoctor = doctors.find(d => d._id === formData.doctorId);
    const selectedService = services.find(s => s._id === formData.serviceId);

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Review Appointment</h3>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Patient</h4>
          {selectedPatient && (
            <div className="text-sm">
              <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400">{selectedPatient.email}</p>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Doctor</h4>
          {selectedDoctor && (
            <div className="text-sm">
              <p className="font-medium">{selectedDoctor.firstName} {selectedDoctor.lastName}</p>
              <p className="text-gray-600 dark:text-gray-400">{selectedDoctor.specialization}</p>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Service</h4>
          {selectedService && (
            <div className="text-sm space-y-2">
              <div>
                <p className="font-medium">{selectedService.name}</p>
                <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                  {selectedService.category}
                </span>
              </div>
              <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                ₨{selectedService.price.toLocaleString()}
              </p>
              {selectedService.description && (
                <p className="text-gray-600 dark:text-gray-400">{selectedService.description}</p>
              )}
              {selectedService.bundleOptions && selectedService.bundleOptions.length > 0 && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <p className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                    Bundle Options Available:
                  </p>
                  <div className="text-xs text-blue-700 dark:text-blue-400">
                    {selectedService.bundleOptions.map((bundle, index) => (
                      <div key={index}>
                        {bundle.sessions} sessions: ₨{bundle.price.toLocaleString()} (Save ₨{bundle.savings.toLocaleString()})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Date & Time</h4>
          <div className="text-sm">
            <p><span className="font-medium">Date:</span> {formData.date}</p>
            <p><span className="font-medium">Time:</span> {formData.time}</p>
          </div>
        </div>

        <div>
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Details</h4>
          <div className="text-sm">
            <p><span className="font-medium">Reason:</span> {formData.reason}</p>
            {formData.notes && (
              <p><span className="font-medium">Notes:</span> {formData.notes}</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Define form steps
  const formSteps = [
    {
      title: 'Patient',
      content: renderPatientSelectionStep(),
      validate: () => {
        const stepErrors: Partial<AppointmentFormData> = {};
        if (!formData.patientId) stepErrors.patientId = 'Please select a patient';
        return stepErrors;
      }
    },
    {
      title: 'Doctor',
      content: renderDoctorSelectionStep(),
      validate: () => {
        const stepErrors: Partial<AppointmentFormData> = {};
        if (!formData.doctorId) stepErrors.doctorId = 'Please select a doctor';
        return stepErrors;
      }
    },
    {
      title: 'Service',
      content: renderServiceSelectionStep(),
      validate: () => {
        const stepErrors: Partial<AppointmentFormData> = {};
        if (!formData.serviceId) stepErrors.serviceId = 'Please select a service';
        return stepErrors;
      }
    },
    {
      title: 'Date & Time',
      content: renderDateTimeStep(),
      validate: () => {
        const stepErrors: Partial<AppointmentFormData> = {};
        if (!formData.date) stepErrors.date = 'Please select a date';
        if (!formData.time) stepErrors.time = 'Please select a time';
        return stepErrors;
      }
    },
    {
      title: 'Details',
      content: renderDetailsStep(),
      validate: () => {
        const stepErrors: Partial<AppointmentFormData> = {};
        if (!formData.reason.trim()) stepErrors.reason = 'Reason for appointment is required';
        return stepErrors;
      }
    },
    {
      title: 'Review',
      content: renderReviewStep()
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Appointment' : 'Schedule New Appointment'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {isEditMode
            ? 'Update the appointment details'
            : 'Schedule a new appointment for a patient'}
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
          onCancel={() => handleNavigateAway('/appointments')}
          isSubmitting={isSubmitting}
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

export default CreateAppointment;
