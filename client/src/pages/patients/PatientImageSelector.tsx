import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
}

const PatientImageSelector: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        
        try {
          // Try to fetch patients from API
          const response = await axios.get('/api/patients');
          setPatients(response.data.data);
        } catch (apiError) {
          console.log('API endpoint for patients not available, using mock data');
          // Use mock patient data
          const mockPatients: Patient[] = [
            {
              _id: '1',
              firstName: 'Ahmed',
              lastName: 'Khan',
              email: 'ahmed.khan@example.com',
              phoneNumber: '+92 300 1234567',
              dateOfBirth: '1985-05-15'
            },
            {
              _id: '2',
              firstName: 'Fatima',
              lastName: 'Ali',
              email: 'fatima.ali@example.com',
              phoneNumber: '+92 301 2345678',
              dateOfBirth: '1990-08-20'
            },
            {
              _id: '3',
              firstName: 'Muhammad',
              lastName: 'Raza',
              email: 'muhammad.raza@example.com',
              phoneNumber: '+92 302 3456789',
              dateOfBirth: '1978-12-10'
            },
            {
              _id: '4',
              firstName: 'Ayesha',
              lastName: 'Malik',
              email: 'ayesha.malik@example.com',
              phoneNumber: '+92 303 4567890',
              dateOfBirth: '1995-03-25'
            },
            {
              _id: '5',
              firstName: 'Imran',
              lastName: 'Ahmed',
              email: 'imran.ahmed@example.com',
              phoneNumber: '+92 304 5678901',
              dateOfBirth: '1982-07-30'
            }
          ];
          setPatients(mockPatients);
        }
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           patient.phoneNumber.includes(searchTerm);
  });

  // Handle patient selection and navigation
  const handleContinue = () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }
    
    navigate(`/patients/${selectedPatient}/upload-image`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Patient Image</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Select a patient to upload dermatology images
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Patient
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="search"
              id="search"
              className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search by name, email, or phone number"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No patients found</p>
            {searchTerm && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Try adjusting your search criteria
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Select</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Email</th>
                  <th scope="col" className="px-6 py-3">Phone</th>
                  <th scope="col" className="px-6 py-3">Date of Birth</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient._id}
                    className={`bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedPatient === patient._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                    }`}
                    onClick={() => setSelectedPatient(patient._id)}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="radio"
                        name="selectedPatient"
                        checked={selectedPatient === patient._id}
                        onChange={() => setSelectedPatient(patient._id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                      />
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4">{patient.email}</td>
                    <td className="px-6 py-4">{patient.phoneNumber}</td>
                    <td className="px-6 py-4">
                      {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!selectedPatient}
          >
            Continue to Image Upload
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default PatientImageSelector;
