import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
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
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);
        const response = await axios.get('/api/patients');
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Prescription</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new prescription for a patient
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
