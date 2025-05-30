import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import MultiStepForm from '../../components/common/MultiStepForm';
import { useAuth } from '../../context/AuthContext';
import { saveFormData, loadFormData, clearFormData } from '../../utils/formPersistence';
import FormDraftRecovery from '../../components/common/FormDraftRecovery';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import AutocompleteInput from '../../components/common/AutocompleteInput';
import MedicalFormField from '../../components/common/MedicalFormField';
import { userSpecificTerms, commonMedicalTerms } from '../../utils/medicalTerms';
import PatientSearchSelector from '../../components/prescriptions/PatientSearchSelector';
import PatientMedicalHistory from '../../components/prescriptions/PatientMedicalHistory';
import {
  allergyOptions,
  diagnosisOptions,
  dosageOptions,
  frequencyOptions,
  durationOptions,
  instructionOptions
} from '../../utils/prescriptionOptions';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface Medication {
  name: string;
  dosage: string;
  dosageOther?: string;
  frequency: string;
  frequencyOther?: string;
  duration: string;
  durationOther?: string;
  instructions: string;
  instructionsOther?: string;
}

interface PrescriptionHistory {
  _id: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  followUpDate?: string;
}

interface PatientWithHistory extends Patient {
  prescriptions?: PrescriptionHistory[];
}

interface FormData {
  patient: string;
  diagnosis: string;
  diagnosisOther?: string;
  medications: Medication[];
  notes: string;
  followUpDate: string;
  medicalHistory?: string;
  allergies?: string;
  allergiesOther?: string;
  dosage: string;
  duration: string;
  instructions: string;
  followUp: string;
}

// Form storage key
const FORM_STORAGE_KEY = 'prescriptionForm';

interface User {
  _id: string;
  role: 'admin' | 'receptionist' | 'dermatologist' | string;
  // other properties...
}

const CreatePrescription: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientWithHistory | null>(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState<PrescriptionHistory[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showPrescriptionHistory, setShowPrescriptionHistory] = useState(false);
  const [showMedicationTemplates, setShowMedicationTemplates] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form persistence states
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);

  // For confirmation dialog
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Common medication templates
  const medicationTemplates = [
    {
      name: 'Hydrocortisone Cream 1%',
      dosage: 'Apply thin layer',
      frequency: 'Twice daily',
      duration: '2 weeks',
      instructions: 'Apply to affected areas after washing and drying'
    },
    {
      name: 'Cetirizine 10mg',
      dosage: '1 tablet',
      frequency: 'Once daily',
      duration: '7 days',
      instructions: 'Take at bedtime'
    },
    {
      name: 'Clotrimazole Cream 1%',
      dosage: 'Apply thin layer',
      frequency: 'Twice daily',
      duration: '2 weeks',
      instructions: 'Apply to affected areas'
    },
    {
      name: 'Tretinoin Cream 0.025%',
      dosage: 'Apply pea-sized amount',
      frequency: 'Once daily',
      duration: '4 weeks',
      instructions: 'Apply at night, avoid sun exposure'
    },
    {
      name: 'Benzoyl Peroxide 5% Gel',
      dosage: 'Apply small amount',
      frequency: 'Once daily',
      duration: '4 weeks',
      instructions: 'Apply to affected areas, may bleach fabrics'
    }
  ];

  // Get patientId from URL query params if available
  const queryParams = new URLSearchParams(location.search);
  const patientIdFromUrl = queryParams.get('patientId');

  const [formData, setFormData] = useState<FormData>({
    patient: patientIdFromUrl || '',
    diagnosis: '',
    diagnosisOther: '',
    medications: [
      {
        name: '',
        dosage: '',
        dosageOther: '',
        frequency: '',
        frequencyOther: '',
        duration: '',
        durationOther: '',
        instructions: '',
        instructionsOther: '',
      },
    ],
    notes: '',
    followUpDate: '',
    medicalHistory: '',
    allergies: '',
    allergiesOther: '',
    dosage: '',
    duration: '',
    instructions: '',
    followUp: ''
  });

  // Load draft on component mount
  useEffect(() => {
    const savedForm = loadFormData<typeof formData>(FORM_STORAGE_KEY);
    if (savedForm) {
      setHasSavedDraft(true);
      setSavedTimestamp(savedForm.timestamp);
    }
  }, []);

  // Save form data periodically
  useEffect(() => {
    if (Object.values(formData).some(value => value !== '')) {
      const saveInterval = setInterval(() => {
        saveFormData(FORM_STORAGE_KEY, formData);
      }, 10000); // Save every 10 seconds

      return () => clearInterval(saveInterval);
    }
  }, [formData]);

  // Detect browser tab/window close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.values(formData).some(value => value !== '')) {
        // Save form data before closing
        saveFormData(FORM_STORAGE_KEY, formData);

        // Show standard browser dialog
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [formData]);

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);
        // In a real implementation, we would fetch from the API
        // const response = await axios.get('/api/patients');
        // setPatients(response.data.data);

        // For now, we'll use mock data
        const mockPatients = [
          {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567',
            dateOfBirth: '1985-05-15',
            gender: 'male'
          },
          {
            _id: '2',
            firstName: 'Fatima',
            lastName: 'Ali',
            email: 'fatima.ali@example.com',
            phoneNumber: '+92 321 9876543',
            dateOfBirth: '1990-08-22',
            gender: 'female'
          },
          {
            _id: '3',
            firstName: 'Imran',
            lastName: 'Ahmed',
            email: 'imran.ahmed@example.com',
            phoneNumber: '+92 333 5556666',
            dateOfBirth: '1978-12-10',
            gender: 'male'
          }
        ];

        setPatients(mockPatients);

        // If patientId is provided in URL, select that patient
        if (patientIdFromUrl) {
          const patient = mockPatients.find(p => p._id === patientIdFromUrl);
          if (patient) {
            setFormData(prev => ({
              ...prev,
              patient: patientIdFromUrl
            }));
            fetchPatientHistory(patientIdFromUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, [patientIdFromUrl]);

  // Fetch patient prescription history when a patient is selected
  const fetchPatientHistory = async (patientId: string) => {
    if (!patientId) return;

    try {
      setIsLoadingHistory(true);

      // In a real implementation, we would fetch from the API
      // const response = await axios.get(`/api/patients/${patientId}/prescriptions`);
      // setPatientPrescriptions(response.data.data);

      // For now, we'll use mock data
      const mockPrescriptions = [
        {
          _id: 'p1',
          date: '2023-06-10',
          diagnosis: 'Contact dermatitis',
          medications: [
            {
              name: 'Hydrocortisone Cream 1%',
              dosage: 'Apply thin layer',
              frequency: 'Twice daily',
              duration: '2 weeks',
              instructions: 'Apply after washing and drying the affected area'
            },
            {
              name: 'Cetirizine 10mg',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '1 week',
              instructions: 'Take before bedtime'
            }
          ],
          notes: 'Avoid contact with irritants. Use mild soap for bathing.',
          followUpDate: '2023-06-24'
        },
        {
          _id: 'p2',
          date: '2023-07-15',
          diagnosis: 'Resolving contact dermatitis',
          medications: [
            {
              name: 'Hydrocortisone Cream 1%',
              dosage: 'Apply thin layer',
              frequency: 'Once daily',
              duration: '1 week',
              instructions: 'Apply only to remaining affected areas'
            }
          ],
          notes: 'Condition improving. Continue avoiding irritants.',
          followUpDate: '2023-08-05'
        }
      ];

      // Filter prescriptions for the selected patient
      // In a real app, this would be done by the API
      const patientPrescriptions = patientId === '1' ? mockPrescriptions : [];

      setPatientPrescriptions(patientPrescriptions);

      // Find the selected patient and add prescriptions to it
      const patient = patients.find(p => p._id === patientId);
      if (patient) {
        setSelectedPatient({
          ...patient,
          prescriptions: patientPrescriptions
        });

        // If there are prescriptions, show the history section
        if (patientPrescriptions.length > 0) {
          setShowPrescriptionHistory(true);
        }
      }
    } catch (error) {
      console.error('Error fetching patient history:', error);
      toast.error('Failed to load patient prescription history');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If patient is selected, fetch their prescription history
    if (name === 'patient' && value) {
      fetchPatientHistory(value);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Copy a medication from history to current prescription
  const copyMedication = (medication: Medication) => {
    setFormData(prev => ({
      ...prev,
      medications: [...prev.medications, { ...medication }]
    }));

    toast.success('Medication added to prescription');
  };

  // Copy diagnosis from history
  const copyDiagnosis = (diagnosis: string) => {
    setFormData(prev => ({
      ...prev,
      diagnosis
    }));

    toast.success('Diagnosis copied to prescription');
  };

  const handleMedicationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedMedications = [...formData.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [name]: value,
    };

    setFormData((prev) => ({
      ...prev,
      medications: updatedMedications,
    }));
  };

  const addMedication = () => {
    setFormData((prev) => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ],
    }));
  };

  const removeMedication = (index: number) => {
    if (formData.medications.length === 1) {
      toast.error('At least one medication is required');
      return;
    }

    const updatedMedications = [...formData.medications];
    updatedMedications.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      medications: updatedMedications,
    }));
  };

  // When an autocomplete term is selected, save it for future autocomplete
  const handleAutocompleteTerm = (category: string, term: string) => {
    userSpecificTerms.saveUserTerm(category, term);

    // If this is a medication term, update the medications array
    if (category === 'medications') {
      const updatedMedications = [...formData.medications];
      updatedMedications[0] = {
        ...updatedMedications[0],
        name: term
      };
      setFormData({
        ...formData,
        medications: updatedMedications
      });
    }
  };

  const validateForm = (): boolean => {
    // Validate form
    if (!formData.patient) {
      toast.error('Please select a patient');
      setCurrentStep(0); // Go to patient selection step
      return false;
    }

    if (!formData.diagnosis) {
      toast.error('Please enter a diagnosis');
      setCurrentStep(1); // Go to diagnosis step
      return false;
    }

    // Validate medications
    const isValidMedications = formData.medications.every(
      (med) => med.name && med.dosage && med.frequency && med.duration
    );

    if (!isValidMedications) {
      toast.error('Please fill in all required medication fields');
      setCurrentStep(1); // Go to medications step
      return false;
    }

    // Handle "Other" fields
    for (const med of formData.medications) {
      if (med.dosage === 'Other (specify)' && !med.dosageOther) {
        toast.error('Please specify the dosage when "Other" is selected');
        setCurrentStep(1);
        return false;
      }
      if (med.frequency === 'Other (specify)' && !med.frequencyOther) {
        toast.error('Please specify the frequency when "Other" is selected');
        setCurrentStep(1);
        return false;
      }
      if (med.duration === 'Other (specify)' && !med.durationOther) {
        toast.error('Please specify the duration when "Other" is selected');
        setCurrentStep(1);
        return false;
      }
      if (med.instructions === 'Other (specify)' && !med.instructionsOther) {
        toast.error('Please specify the instructions when "Other" is selected');
        setCurrentStep(1);
        return false;
      }
    }

    if (formData.diagnosis === 'Other (specify)' && !formData.diagnosisOther) {
      toast.error('Please specify the diagnosis when "Other" is selected');
      setCurrentStep(1);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setIsLoading(true);

      // Process "Other" fields before submission
      const processedMedications = formData.medications.map(med => {
        const processedMed = { ...med };

        // If "Other" is selected, use the custom value
        if (med.dosage === 'Other (specify)' && med.dosageOther) {
          processedMed.dosage = med.dosageOther;
        }

        if (med.frequency === 'Other (specify)' && med.frequencyOther) {
          processedMed.frequency = med.frequencyOther;
        }

        if (med.duration === 'Other (specify)' && med.durationOther) {
          processedMed.duration = med.durationOther;
        }

        if (med.instructions === 'Other (specify)' && med.instructionsOther) {
          processedMed.instructions = med.instructionsOther;
        }

        // Remove the "Other" fields before sending to server
        delete processedMed.dosageOther;
        delete processedMed.frequencyOther;
        delete processedMed.durationOther;
        delete processedMed.instructionsOther;

        return processedMed;
      });

      // Process diagnosis "Other" field
      let finalDiagnosis = formData.diagnosis;
      if (formData.diagnosis === 'Other (specify)' && formData.diagnosisOther) {
        finalDiagnosis = formData.diagnosisOther;
      }

      // Process allergies "Other" field
      let finalAllergies = formData.allergies;
      if (formData.allergies === 'Other (specify)' && formData.allergiesOther) {
        finalAllergies = formData.allergiesOther;
      }

      // Prepare the final data for submission
      const submissionData = {
        patient: formData.patient,
        diagnosis: finalDiagnosis,
        medications: processedMedications.map(med => ({
          name: med.name,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: med.duration,
          instructions: med.instructions || ''
        })),
        notes: formData.notes || '',
        followUpDate: formData.followUpDate || undefined
      };

      console.log('Submitting prescription data:', submissionData);

      // Add authentication token to the request
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/prescriptions', submissionData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Clear saved form data on success
      clearFormData(FORM_STORAGE_KEY);

      toast.success('Prescription created successfully');
      navigate(`/prescriptions/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Error creating prescription:', error);

      // Show more specific error message if available
      if (error.response?.data?.message) {
        toast.error(`Failed to create prescription: ${error.response.data.message}`);
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to create prescription');
      }

      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // If the form has data, show confirmation dialog
    if (Object.values(formData).some(value => value !== '')) {
      setShowExitConfirmation(true);
      setPendingNavigation('/prescriptions');
    } else {
      navigate('/prescriptions');
    }
  };

  const handleConfirmExit = () => {
    // Clear form data and navigate
    clearFormData(FORM_STORAGE_KEY);
    setShowExitConfirmation(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  const handleRecoverDraft = () => {
    const savedForm = loadFormData<typeof formData>(FORM_STORAGE_KEY);
    if (savedForm) {
      setFormData(savedForm.data);
      toast.success('Draft restored successfully');
    }
    setHasSavedDraft(false);
  };

  const handleDiscardDraft = () => {
    clearFormData(FORM_STORAGE_KEY);
    setHasSavedDraft(false);
    toast.success('Draft discarded');
  };

  const handleFormComplete = async () => {
    await handleSubmit();
  };

  const renderPatientSelectionStep = () => (
    <div className="space-y-6">
      {/* Patient Selection */}
      <div>
        <PatientSearchSelector
          onPatientSelect={(patientId) => {
            setFormData(prev => ({
              ...prev,
              patient: patientId
            }));
            fetchPatientHistory(patientId);
          }}
          selectedPatientId={formData.patient}
        />
      </div>

      {/* Patient Medical History */}
      {formData.patient && (
        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <PatientMedicalHistory
            prescriptions={patientPrescriptions}
            isLoading={isLoadingHistory}
            onCopyDiagnosis={copyDiagnosis}
            onCopyMedication={copyMedication}
          />
        </div>
      )}

      {/* Medical History */}
      <div className="mb-4">
        <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
          <span>Additional Medical History</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Include any relevant past medical conditions</span>
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <textarea
            id="medicalHistory"
            name="medicalHistory"
            value={formData.medicalHistory || ''}
            onChange={handleChange}
            placeholder="Enter additional medical history"
            rows={4}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
          />
        </div>
      </div>

      {/* Allergies */}
      <div className="mb-4">
        <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex justify-between">
          <span>Allergies</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Select or enter patient's allergies</span>
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <select
            id="allergies"
            name="allergies"
            value={formData.allergies || ''}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
          >
            <option value="">Select allergies</option>
            {allergyOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {formData.allergies === 'Other (specify)' && (
          <div className="mt-2">
            <input
              type="text"
              id="allergiesOther"
              name="allergiesOther"
              value={formData.allergiesOther || ''}
              onChange={handleChange}
              placeholder="Specify allergies"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderDiagnosisMedicationsStep = () => (
    <div className="space-y-6">
      {/* Selected Patient Info */}
      {formData.patient && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Selected Patient:</span> {patients.find(p => p._id === formData.patient)?.firstName} {patients.find(p => p._id === formData.patient)?.lastName}
          </p>
        </div>
      )}

      {/* Diagnosis */}
      <div>
        <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Diagnosis <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <select
            id="diagnosis"
            name="diagnosis"
            value={formData.diagnosis}
            onChange={handleChange}
            required
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
          >
            <option value="">Select diagnosis</option>
            {diagnosisOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {formData.diagnosis === 'Other (specify)' && (
          <div className="mt-2">
            <input
              type="text"
              id="diagnosisOther"
              name="diagnosisOther"
              value={formData.diagnosisOther || ''}
              onChange={handleChange}
              placeholder="Specify diagnosis"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
            />
          </div>
        )}
      </div>

      {/* Medications */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Medications *
          </label>
          <button
            type="button"
            onClick={() => setShowMedicationTemplates(!showMedicationTemplates)}
            className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:text-primary-800 dark:hover:text-primary-300"
          >
            {showMedicationTemplates ? 'Hide Templates' : 'Show Templates'}
          </button>
        </div>

        {/* Medication Templates */}
        {showMedicationTemplates && (
          <div className="mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Common Medications</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {medicationTemplates.map((template, index) => (
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    const updatedMedications = [...formData.medications];
                    updatedMedications[0] = {
                      ...template
                    };
                    setFormData({
                      ...formData,
                      medications: updatedMedications,
                      dosage: template.dosage,
                      duration: template.duration,
                      instructions: template.instructions
                    });
                    toast.success('Medication template applied');
                  }}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {template.dosage}, {template.frequency} for {template.duration}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medication Input */}
        <div className="space-y-4">
          {formData.medications.map((medication, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Medication {index + 1}</h4>
                {formData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 dark:text-red-400 text-sm hover:text-red-800 dark:hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor={`medication-name-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id={`medication-name-${index}`}
                      name="name"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, e)}
                      placeholder="Enter medication name"
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor={`medication-dosage-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dosage <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                      </div>
                      <select
                        id={`medication-dosage-${index}`}
                        name="dosage"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, e)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                      >
                        <option value="">Select dosage</option>
                        {dosageOptions.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    {medication.dosage === 'Other (specify)' && (
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`medication-dosage-other-${index}`}
                          name="dosageOther"
                          value={medication.dosageOther || ''}
                          onChange={(e) => handleMedicationChange(index, e)}
                          placeholder="Specify dosage"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor={`medication-frequency-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        id={`medication-frequency-${index}`}
                        name="frequency"
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, e)}
                        required
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                      >
                        <option value="">Select frequency</option>
                        {frequencyOptions.map((option, optIndex) => (
                          <option key={optIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                    {medication.frequency === 'Other (specify)' && (
                      <div className="mt-1">
                        <input
                          type="text"
                          id={`medication-frequency-other-${index}`}
                          name="frequencyOther"
                          value={medication.frequencyOther || ''}
                          onChange={(e) => handleMedicationChange(index, e)}
                          placeholder="Specify frequency"
                          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor={`medication-duration-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <select
                      id={`medication-duration-${index}`}
                      name="duration"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, e)}
                      required
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  {medication.duration === 'Other (specify)' && (
                    <div className="mt-1">
                      <input
                        type="text"
                        id={`medication-duration-other-${index}`}
                        name="durationOther"
                        value={medication.durationOther || ''}
                        onChange={(e) => handleMedicationChange(index, e)}
                        placeholder="Specify duration"
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor={`medication-instructions-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Instructions
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <select
                      id={`medication-instructions-${index}`}
                      name="instructions"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, e)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                    >
                      <option value="">Select instructions</option>
                      {instructionOptions.map((option, optIndex) => (
                        <option key={optIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  {medication.instructions === 'Other (specify)' && (
                    <div className="mt-1">
                      <textarea
                        id={`medication-instructions-other-${index}`}
                        name="instructionsOther"
                        value={medication.instructionsOther || ''}
                        onChange={(e) => handleMedicationChange(index, e)}
                        placeholder="Specify instructions"
                        rows={2}
                        className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addMedication}
            className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
            </svg>
            Add Another Medication
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdditionalInfoStep = () => (
    <div className="space-y-6">
      {/* Selected Patient Info */}
      {formData.patient && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Selected Patient:</span> {patients.find(p => p._id === formData.patient)?.firstName} {patients.find(p => p._id === formData.patient)?.lastName}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Diagnosis:</span> {formData.diagnosis}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Medications:</span> {formData.medications.map(med => med.name).join(', ')}
          </p>
        </div>
      )}

      {/* Notes */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          placeholder="Additional notes or instructions for the patient"
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm bg-white dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Follow-up */}
      <div>
        <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Follow-up Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="date"
            id="followUpDate"
            name="followUpDate"
            value={formData.followUpDate}
            onChange={handleChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Leave blank if no follow-up is required
        </p>
      </div>

      {/* Lifestyle Recommendations */}
      <div>
        <label htmlFor="lifestyle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Lifestyle Recommendations
        </label>
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="lifestyle-diet"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lifestyle-diet" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Dietary changes recommended
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="lifestyle-exercise"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lifestyle-exercise" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Exercise regimen recommended
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="lifestyle-skincare"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lifestyle-skincare" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Special skincare routine recommended
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="lifestyle-avoid"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="lifestyle-avoid" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Avoid specific environmental factors
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-lg text-gray-900 dark:text-white">Review Prescription</h3>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        {/* Header with patient info */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
              {patients.find(p => p._id === formData.patient)?.firstName.charAt(0)}
              {patients.find(p => p._id === formData.patient)?.lastName.charAt(0)}
            </div>
            <div className="ml-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                {patients.find(p => p._id === formData.patient)
                  ? `${patients.find(p => p._id === formData.patient)?.firstName} ${patients.find(p => p._id === formData.patient)?.lastName}`
                  : 'Patient not selected'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-4">
          <div className="space-y-6">
            {/* Diagnosis */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Diagnosis</h5>
              <p className="text-gray-900 dark:text-white border-l-2 border-primary-500 pl-3 py-1">
                {formData.diagnosis || 'Not provided'}
              </p>
            </div>

            {/* Medications */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medications</h5>
              <div className="space-y-3">
                {formData.medications.map((med, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{med.name || 'Unnamed medication'}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{med.duration || 'No duration specified'}</p>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {med.dosage} • {med.frequency}
                    </p>
                    {med.instructions && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 italic">
                        {med.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            {formData.notes && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Additional Notes</h5>
                <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                  {formData.notes}
                </p>
              </div>
            )}

            {/* Follow-up */}
            {formData.followUpDate && (
              <div>
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow-up Date</h5>
                <p className="text-sm text-gray-900 dark:text-white flex items-center">
                  <svg className="h-4 w-4 text-primary-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(formData.followUpDate).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {/* Medical History & Allergies */}
            {(formData.medicalHistory || formData.allergies) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                {formData.medicalHistory && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medical History</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formData.medicalHistory}</p>
                  </div>
                )}
                {formData.allergies && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allergies</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{formData.allergies}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Created by: Dr. {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prime Skin Clinic
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Contact: +92 300 1234567
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                info@pakskincare.com
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-6">
        <div className="flex">
          <svg className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Please review all information carefully before submitting. Once submitted, the prescription will be saved to the patient's record.
          </p>
        </div>
      </div>
    </div>
  );

  const formSteps = [
    {
      title: 'Patient & History',
      content: renderPatientSelectionStep(),
      validate: () => {
        const errors: Record<string, string> = {};
        if (!formData.patient) {
          errors.patient = 'Please select a patient';
        }
        return errors;
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      )
    },
    {
      title: 'Diagnosis & Medications',
      content: renderDiagnosisMedicationsStep(),
      validate: () => {
        const errors: Record<string, string> = {};
        if (!formData.diagnosis) {
          errors.diagnosis = 'Please enter a diagnosis';
        }

        // Validate medications
        const isValidMedications = formData.medications.every(
          (med) => med.name && med.dosage && med.frequency
        );

        if (!isValidMedications) {
          errors.medications = 'Please fill in all required medication fields (name, dosage, frequency)';
        }

        return errors;
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    },
    {
      title: 'Additional Info',
      content: renderAdditionalInfoStep(),
      // This step is optional, so no validation required
      optional: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    },
    {
      title: 'Review',
      content: renderReviewStep(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ];

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'dermatologist') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
        <Button variant="primary" onClick={() => navigate('/prescriptions')}>
          Return to Prescriptions
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Prescription</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Create a new prescription for a patient
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleCancel}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            }
          >
            Cancel
          </Button>
        </div>

        <Card className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-6">
            {/* Show draft recovery notice if available */}
            {hasSavedDraft && savedTimestamp && (
              <FormDraftRecovery
                timestamp={savedTimestamp}
                onRecover={handleRecoverDraft}
                onDiscard={handleDiscardDraft}
              />
            )}

            <MultiStepForm
              steps={formSteps}
              onComplete={handleFormComplete}
              onCancel={handleCancel}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              isSubmitting={isLoading}
              formId="prescription_form"
              theme="default" // Use the default theme for consistency
              showValidationErrors={true}
            />
          </div>
        </Card>
      </div>

      {/* Exit Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showExitConfirmation}
        title="Discard changes?"
        message="You have unsaved changes. Are you sure you want to leave? Your changes will be lost."
        confirmLabel="Leave"
        cancelLabel="Stay"
        onConfirm={handleConfirmExit}
        onCancel={() => setShowExitConfirmation(false)}
        type="warning"
      />
    </>
  );
};

export default CreatePrescription;
