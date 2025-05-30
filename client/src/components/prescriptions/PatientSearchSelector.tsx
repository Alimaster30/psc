import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import PatientSearchCombobox from '../patients/PatientSearchCombobox';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface PatientSearchSelectorProps {
  onPatientSelect: (patientId: string) => void;
  selectedPatientId?: string;
}

const PatientSearchSelector: React.FC<PatientSearchSelectorProps> = ({
  onPatientSelect,
  selectedPatientId
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/patients');
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');

        // Fallback to mock data if API fails
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${age} years`;
  };

  // Get selected patient details
  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  return (
    <div className="space-y-4">
      {/* Integrated search and dropdown */}
      <PatientSearchCombobox
        onPatientSelect={onPatientSelect}
        selectedPatientId={selectedPatientId}
        required={true}
      />

      {/* Display selected patient details */}
      {selectedPatient && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Selected Patient</h3>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                <p><span className="font-medium">Name:</span> {selectedPatient.firstName} {selectedPatient.lastName}</p>
                <p><span className="font-medium">Contact:</span> {selectedPatient.phoneNumber}</p>
                <p><span className="font-medium">Email:</span> {selectedPatient.email}</p>
                <p><span className="font-medium">Age:</span> {calculateAge(selectedPatient.dateOfBirth)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearchSelector;
