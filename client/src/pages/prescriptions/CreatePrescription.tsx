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
  frequency: string;
  duration: string;
  instructions: string;
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
  medications: Medication[];
  notes: string;
  followUpDate: string;
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
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.patient) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.diagnosis) {
      toast.error('Please enter a diagnosis');
      return;
    }

    // Validate medications
    const isValidMedications = formData.medications.every(
      (med) => med.name && med.dosage && med.frequency
    );

    if (!isValidMedications) {
      toast.error('Please fill in all required medication fields');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post('/api/prescriptions', formData);

      toast.success('Prescription created successfully');
      navigate(`/prescriptions/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to create prescription');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Prescriptions', path: '/prescriptions' },
          { label: 'Create Prescription' }
        ]}
      />

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Prescription</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {selectedPatient ?
              `Create a new prescription for ${selectedPatient.firstName} ${selectedPatient.lastName}` :
              'Create a new prescription for a patient'
            }
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/prescriptions')}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div>
            <label htmlFor="patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Patient *
            </label>
            {isLoadingPatients ? (
              <select disabled className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white opacity-60">
                <option>Loading patients...</option>
              </select>
            ) : (
              <select
                id="patient"
                name="patient"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                value={formData.patient}
                onChange={handleChange}
              >
                <option value="">Select a patient</option>
                {patients.map((patient) => (
                  <option key={patient._id} value={patient._id}>
                    {patient.firstName} {patient.lastName} ({patient.email})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Patient Prescription History */}
          {selectedPatient && patientPrescriptions.length > 0 && (
            <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Patient Prescription History
                </h3>
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline focus:outline-none"
                  onClick={() => setShowPrescriptionHistory(!showPrescriptionHistory)}
                >
                  {showPrescriptionHistory ? 'Hide History' : 'Show History'}
                </button>
              </div>

              {isLoadingHistory ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : showPrescriptionHistory && (
                <div className="space-y-4">
                  {patientPrescriptions.map((prescription) => (
                    <div key={prescription._id} className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            Prescription - {formatDate(prescription.date)}
                          </h4>
                          <div className="flex items-center mt-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Diagnosis: {prescription.diagnosis}
                            </p>
                            <button
                              type="button"
                              onClick={() => copyDiagnosis(prescription.diagnosis)}
                              className="ml-2 text-xs text-primary-600 dark:text-primary-400 hover:underline"
                              title="Copy diagnosis to current prescription"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                          className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View Full Prescription
                        </button>
                      </div>

                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Medications:
                        </h5>
                        <div className="space-y-2">
                          {prescription.medications.map((medication, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white dark:bg-gray-700 p-2 rounded-md text-sm">
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{medication.name}</p>
                                <p className="text-gray-600 dark:text-gray-400">
                                  {medication.dosage}, {medication.frequency}, {medication.duration}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => copyMedication(medication)}
                                className="text-primary-600 dark:text-primary-400 hover:underline"
                                title="Add to current prescription"
                              >
                                Add to Prescription
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {prescription.notes && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes:
                          </h5>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Diagnosis *
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              required
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={formData.diagnosis}
              onChange={handleChange}
              placeholder="Enter detailed diagnosis"
            />
          </div>

          {/* Medications */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Medications *</h2>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicationTemplates(!showMedicationTemplates)}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                  }
                >
                  Templates
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMedication}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  }
                >
                  Add Medication
                </Button>
              </div>
            </div>

            {/* Medication Templates */}
            {showMedicationTemplates && (
              <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-md p-4 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white">
                    Common Medication Templates
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMedicationTemplates(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {medicationTemplates.map((template, idx) => (
                    <div
                      key={idx}
                      className="bg-white dark:bg-gray-700 p-3 rounded-md border border-gray-200 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 cursor-pointer transition-colors"
                      onClick={() => copyMedication(template)}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-900 dark:text-white">{template.name}</h4>
                        <button
                          type="button"
                          className="text-primary-600 dark:text-primary-400 text-sm hover:underline"
                        >
                          Add
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {template.dosage}, {template.frequency}, {template.duration}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 italic">
                        {template.instructions}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.medications.map((medication, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                    Medication #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medication Name */}
                  <div>
                    <label htmlFor={`medications[${index}].name`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      id={`medications[${index}].name`}
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={medication.name}
                      onChange={(e) => handleMedicationChange(index, e)}
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label htmlFor={`medications[${index}].dosage`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      id={`medications[${index}].dosage`}
                      name="dosage"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={medication.dosage}
                      onChange={(e) => handleMedicationChange(index, e)}
                      placeholder="e.g., 10mg, 1 tablet"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label htmlFor={`medications[${index}].frequency`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      id={`medications[${index}].frequency`}
                      name="frequency"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={medication.frequency}
                      onChange={(e) => handleMedicationChange(index, e)}
                      placeholder="e.g., Twice daily, Every 8 hours"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label htmlFor={`medications[${index}].duration`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      id={`medications[${index}].duration`}
                      name="duration"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={medication.duration}
                      onChange={(e) => handleMedicationChange(index, e)}
                      placeholder="e.g., 7 days, 2 weeks"
                    />
                  </div>

                  {/* Instructions - Full width */}
                  <div className="md:col-span-2">
                    <label htmlFor={`medications[${index}].instructions`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      id={`medications[${index}].instructions`}
                      name="instructions"
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={medication.instructions}
                      onChange={(e) => handleMedicationChange(index, e)}
                      placeholder="e.g., Take with food, Avoid alcohol"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes or instructions for the patient"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label htmlFor="followUpDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Follow-up Date
            </label>
            <input
              type="date"
              id="followUpDate"
              name="followUpDate"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={formData.followUpDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]} // Set min date to today
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/prescriptions')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Create Prescription
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreatePrescription;
