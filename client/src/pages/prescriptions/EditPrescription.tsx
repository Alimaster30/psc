import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MultiStepForm from '../../components/common/MultiStepForm';
import { useAuth } from '../../context/AuthContext';
import AutocompleteInput from '../../components/common/AutocompleteInput';
import MedicalFormField from '../../components/common/MedicalFormField';
import { userSpecificTerms, commonMedicalTerms } from '../../utils/medicalTerms';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import PatientMedicalHistory from '../../components/prescriptions/PatientMedicalHistory';
// Create simple components directly in this file since the imported file doesn't exist
// We'll use inline styles instead of importing the missing CSS file
// PatientInfoCard component
const PatientInfoCard: React.FC<{patient: {_id: string; firstName: string; lastName: string; email: string; phoneNumber?: string}}> = ({ patient }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient Information</h3>
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {patient.phoneNumber} • {patient.email}
          </p>
        </div>
      </div>
    </div>
  );
};

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface PrescriptionHistory {
  _id: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  followUpDate?: string;
}

interface Prescription {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  diagnosis: string;
  medications: Medication[];
  notes: string;
  followUpDate: string;
  createdAt: string;
}

interface FormData {
  patient: string;
  diagnosis: string;
  medications: Medication[];
  notes: string;
  followUpDate: string;
  medicalHistory?: string;
  allergies?: string;
}

const EditPrescription: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState<PrescriptionHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showMedicationTemplates, setShowMedicationTemplates] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
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
    }
  ];

  const [formData, setFormData] = useState<FormData>({
    patient: '',
    diagnosis: '',
    medications: [
      {
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ],
    notes: '',
    followUpDate: '',
    medicalHistory: '',
    allergies: '',
  });

  // Fetch prescription data
  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would fetch from the API
        // const response = await axios.get(`/api/prescriptions/${id}`);
        // const prescriptionData = response.data;

        // For now, we'll use mock data
        const mockPrescription = {
          _id: id || '1',
          patient: {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567'
          },
          doctor: {
            _id: '1',
            firstName: 'Dr. Fatima',
            lastName: 'Ali',
            specialization: 'Dermatologist'
          },
          diagnosis: 'Contact dermatitis with secondary bacterial infection on both arms',
          medications: [
            {
              name: 'Hydrocortisone Cream 1%',
              dosage: 'Apply thin layer',
              frequency: 'Twice daily',
              duration: '2 weeks',
              instructions: 'Apply to affected areas after washing and drying the skin'
            },
            {
              name: 'Cetirizine 10mg',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '1 week',
              instructions: 'Take at bedtime'
            }
          ],
          notes: 'Patient should avoid contact with irritants. Wear cotton clothing and avoid scratching.',
          followUpDate: '2023-08-15',
          createdAt: '2023-08-01T10:30:00.000Z'
        };

        setPrescription(mockPrescription);

        // Set form data from prescription
        setFormData({
          patient: mockPrescription.patient._id,
          diagnosis: mockPrescription.diagnosis,
          medications: mockPrescription.medications,
          notes: mockPrescription.notes,
          followUpDate: mockPrescription.followUpDate,
          medicalHistory: '',
          allergies: '',
        });

        // Fetch patient history
        fetchPatientHistory(mockPrescription.patient._id);

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        toast.error('Failed to load prescription');
        setIsLoading(false);
      }
    };

    // Fetch patients for reference
    const fetchPatients = async () => {
      try {
        // In a real implementation, we would fetch from the API
        // const response = await axios.get('/api/patients');
        // setPatients(response.data);

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
          }
        ];

        setPatients(mockPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      }
    };

    if (id) {
      fetchPrescription();
      fetchPatients();
    }
  }, [id]);

  // Fetch patient prescription history
  const fetchPatientHistory = async (patientId: string) => {
    if (!patientId) return;

    try {
      setIsLoadingHistory(true);

      // In a real implementation, we would fetch from the API
      // const response = await axios.get(`/api/patients/${patientId}/prescriptions`);
      // setPatientPrescriptions(response.data);

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

      // Filter out the current prescription from history
      const filteredPrescriptions = mockPrescriptions.filter(p => p._id !== id);
      setPatientPrescriptions(filteredPrescriptions);
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
  };

  const handleMedicationChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // In a real implementation, we would update via the API
      // const response = await axios.put(`/api/prescriptions/${id}`, formData);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success('Prescription updated successfully');
      navigate(`/prescriptions/${id}`);
    } catch (error) {
      console.error('Error updating prescription:', error);
      toast.error('Failed to update prescription');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Check if form has been modified
    if (
      prescription &&
      (formData.diagnosis !== prescription.diagnosis ||
        formData.notes !== prescription.notes ||
        formData.followUpDate !== prescription.followUpDate ||
        JSON.stringify(formData.medications) !== JSON.stringify(prescription.medications))
    ) {
      setShowExitConfirmation(true);
      setPendingNavigation(`/prescriptions/${id}`);
    } else {
      navigate(`/prescriptions/${id}`);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirmation(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
  };

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'dermatologist') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access this page.</p>
        <Button variant="primary" onClick={() => navigate('/prescriptions')}>
          Return to Prescriptions
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The prescription you're trying to edit doesn't exist or has been removed.</p>
        <Button variant="primary" onClick={() => navigate('/prescriptions')}>
          Return to Prescriptions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Prescription</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Update prescription for {prescription.patient.firstName} {prescription.patient.lastName}
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
          <MultiStepForm
            steps={[
              {
                title: 'Patient & History',
                content: (
                  <div className="space-y-6">
                    {/* Patient Information (Read-only) */}
                    <PatientInfoCard
                      patient={{
                        _id: prescription.patient._id,
                        firstName: prescription.patient.firstName,
                        lastName: prescription.patient.lastName,
                        email: prescription.patient.email,
                        phoneNumber: prescription.patient.phoneNumber
                      }}
                    />

                    {/* Patient Medical History */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">Previous Prescriptions</h3>
                      <PatientMedicalHistory
                        prescriptions={patientPrescriptions}
                        isLoading={isLoadingHistory}
                        onCopyDiagnosis={copyDiagnosis}
                        onCopyMedication={copyMedication}
                      />
                    </div>

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
                        <span className="text-xs text-gray-500 dark:text-gray-400">List all known allergies and reactions</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          id="allergies"
                          name="allergies"
                          value={formData.allergies || ''}
                          onChange={handleChange}
                          placeholder="Enter patient's allergies"
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Diagnosis & Medications',
                content: (
                  <div className="space-y-6">
                    {/* Selected Patient Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Patient:</span> {prescription.patient.firstName} {prescription.patient.lastName}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    <div>
                      <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Diagnosis *
                      </label>
                      <AutocompleteInput
                        id="diagnosis"
                        name="diagnosis"
                        value={formData.diagnosis}
                        onChange={handleChange}
                        suggestions={userSpecificTerms.getCombinedSuggestions('diagnoses')}
                        placeholder="Enter diagnosis"
                        required
                        onSelect={(term) => {
                          setFormData(prev => ({
                            ...prev,
                            diagnosis: term
                          }));
                        }}
                      />
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
                                  setFormData(prev => ({
                                    ...prev,
                                    medications: [...prev.medications, { ...template }]
                                  }));
                                  toast.success('Medication template added');
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

                            <div className="space-y-3">
                              <div>
                                <label htmlFor={`medication-name-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  id={`medication-name-${index}`}
                                  name="name"
                                  value={medication.name}
                                  onChange={(e) => handleMedicationChange(index, e)}
                                  placeholder="Enter medication name"
                                  required
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor={`medication-dosage-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Dosage *
                                  </label>
                                  <input
                                    type="text"
                                    id={`medication-dosage-${index}`}
                                    name="dosage"
                                    value={medication.dosage}
                                    onChange={(e) => handleMedicationChange(index, e)}
                                    placeholder="e.g., 10mg"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                  />
                                </div>

                                <div>
                                  <label htmlFor={`medication-frequency-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Frequency *
                                  </label>
                                  <input
                                    type="text"
                                    id={`medication-frequency-${index}`}
                                    name="frequency"
                                    value={medication.frequency}
                                    onChange={(e) => handleMedicationChange(index, e)}
                                    placeholder="e.g., Twice daily"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor={`medication-duration-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Duration *
                                  </label>
                                  <input
                                    type="text"
                                    id={`medication-duration-${index}`}
                                    name="duration"
                                    value={medication.duration}
                                    onChange={(e) => handleMedicationChange(index, e)}
                                    placeholder="e.g., 7 days"
                                    required
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                  />
                                </div>
                              </div>

                              <div>
                                <label htmlFor={`medication-instructions-${index}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Instructions
                                </label>
                                <textarea
                                  id={`medication-instructions-${index}`}
                                  name="instructions"
                                  value={medication.instructions}
                                  onChange={(e) => handleMedicationChange(index, e)}
                                  placeholder="Special instructions for this medication"
                                  rows={2}
                                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                />
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
                ),
              },
              {
                title: 'Additional Info',
                content: (
                  <div className="space-y-6">
                    {/* Selected Patient Info */}
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Patient:</span> {prescription.patient.firstName} {prescription.patient.lastName}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">Diagnosis:</span> {formData.diagnosis}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        <span className="font-medium">Medications:</span> {formData.medications.map(med => med.name).join(', ')}
                      </p>
                    </div>

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
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Leave blank if no follow-up is required
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                title: 'Review',
                content: (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg text-gray-900 dark:text-white">Review Updated Prescription</h3>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                      {/* Header with patient info */}
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                            {prescription.patient.firstName.charAt(0)}
                            {prescription.patient.lastName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                              {prescription.patient.firstName} {prescription.patient.lastName}
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
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3 mt-6">
                      <div className="flex">
                        <svg className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          Please review all information carefully before submitting. Once updated, the prescription will replace the previous version.
                        </p>
                      </div>
                    </div>
                  </div>
                ),
              },
            ]}
            onComplete={handleSubmit}
            onCancel={handleCancel}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            isSubmitting={isSaving}
            submitButtonText="Update Prescription"
          />
        </div>
      </Card>

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
    </div>
  );
};

export default EditPrescription;
