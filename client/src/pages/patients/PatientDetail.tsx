import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import QuickActionButton from '../../components/common/QuickActionButton';
import Breadcrumb from '../../components/common/Breadcrumb';
import BeforeAfterComparison from '../../components/patients/BeforeAfterComparison';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  medicalHistory: string;
  allergies: string[];
  bloodGroup: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  createdAt: string;
}

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  reason: string;
  notes: string;
  patient?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dermatologist?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

interface Prescription {
  _id: string;
  date: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];
  instructions: string;
  diagnosis: string;
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setIsLoading(true);

        console.log('Fetching patient data for ID:', id);

        // Don't fetch if ID is undefined or empty
        if (!id || id === 'undefined') {
          console.log('Skipping fetch due to invalid ID:', id);
          setIsLoading(false);
          return;
        }

        try {
          // Fetch patient data from API
          const response = await api.get(`/patients/${id}`);
          console.log('Patient API response:', response.data);

          if (response.data && response.data.data) {
            setPatient(response.data.data);

            // Fetch appointments for this patient
            try {
              const appointmentsResponse = await api.get(`/appointments?patient=${id}`);
              console.log('Appointments API response:', appointmentsResponse.data);
              if (appointmentsResponse.data && appointmentsResponse.data.data) {
                setAppointments(appointmentsResponse.data.data);
              } else {
                setAppointments([]);
              }
            } catch (appointmentError) {
              console.error('Error fetching appointments:', appointmentError);
              setAppointments([]);
            }

            // Fetch prescriptions for this patient
            try {
              const prescriptionsResponse = await api.get(`/prescriptions?patient=${id}`);
              console.log('Prescriptions API response:', prescriptionsResponse.data);
              if (prescriptionsResponse.data && prescriptionsResponse.data.data) {
                setPrescriptions(prescriptionsResponse.data.data);
              } else {
                setPrescriptions([]);
              }
            } catch (prescriptionError) {
              console.error('Error fetching prescriptions:', prescriptionError);
              setPrescriptions([]);
            }

            setIsLoading(false);
            return;
          } else {
            // If API response doesn't have the expected format, use mock data
            console.log('API response format unexpected, using mock data');
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError);
          if (apiError.response?.status === 404) {
            // Patient not found
            setPatient(null);
            setIsLoading(false);
            return;
          } else if (apiError.response?.status === 401) {
            toast.error('Please log in to view patient details');
            setIsLoading(false);
            return;
          } else if (apiError.response?.status === 403) {
            toast.error('Access denied');
            setIsLoading(false);
            return;
          } else {
            console.log('API endpoint not available, using mock data');
          }
        }

        // Fallback to mock data if API fails
        const mockPatient = {
          _id: id || '1',
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed.khan@example.com',
          phoneNumber: '+92 300 1234567',
          dateOfBirth: '1985-05-15',
          gender: 'male',
          address: 'House 123, Street 4, Islamabad, Pakistan',
          medicalHistory: 'Patient has a history of eczema and mild psoriasis. No other significant medical conditions.',
          allergies: ['Penicillin', 'Dust mites'],
          bloodGroup: 'O+',
          emergencyContact: {
            name: 'Fatima Khan',
            relationship: 'Wife',
            phoneNumber: '+92 300 7654321'
          },
          createdAt: '2023-01-15T10:30:00.000Z'
        };

        const mockAppointments = [
          {
            _id: 'a1',
            date: '2023-06-10T10:30:00.000Z',
            startTime: '10:30 AM',
            endTime: '11:00 AM',
            status: 'completed',
            reason: 'Skin rash on arms',
            notes: 'Patient presented with rash on both arms. Prescribed topical cream.'
          },
          {
            _id: 'a2',
            date: '2023-07-15T11:00:00.000Z',
            startTime: '11:00 AM',
            endTime: '11:30 AM',
            status: 'completed',
            reason: 'Follow-up for skin rash',
            notes: 'Rash has improved significantly. Continuing treatment for another week.'
          },
          {
            _id: 'a3',
            date: '2023-08-20T09:15:00.000Z',
            startTime: '09:15 AM',
            endTime: '09:45 AM',
            status: 'scheduled',
            reason: 'Final follow-up',
            notes: ''
          }
        ];

        const mockPrescriptions = [
          {
            _id: 'p1',
            date: '2023-06-10',
            medications: [
              {
                name: 'Hydrocortisone Cream 1%',
                dosage: 'Apply thin layer',
                frequency: 'Twice daily',
                duration: '2 weeks'
              },
              {
                name: 'Cetirizine 10mg',
                dosage: '1 tablet',
                frequency: 'Once daily',
                duration: '1 week'
              }
            ],
            instructions: 'Apply cream after washing and drying the affected area. Take antihistamine before bedtime.',
            diagnosis: 'Contact dermatitis'
          },
          {
            _id: 'p2',
            date: '2023-07-15',
            medications: [
              {
                name: 'Hydrocortisone Cream 1%',
                dosage: 'Apply thin layer',
                frequency: 'Once daily',
                duration: '1 week'
              }
            ],
            instructions: 'Continue applying cream to any remaining affected areas.',
            diagnosis: 'Resolving contact dermatitis'
          }
        ];

        setPatient(mockPatient);
        setAppointments(mockAppointments);
        setPrescriptions(mockPrescriptions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching patient data:', error);
        toast.error('Failed to load patient information');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Patient Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The patient you're looking for doesn't exist or has been removed.</p>
        <Link to="/patients">
          <Button variant="primary">
            Return to Patient List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Patients', path: '/patients' },
          { label: `${patient.firstName} ${patient.lastName}` }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with patient info and quick actions */}
        <div className="lg:col-span-1">
          <Card>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {calculateAge(patient.dateOfBirth)} years • {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}
              </p>
              <div className="mt-2 flex items-center">
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  Patient ID: {patient._id}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Quick Contact</h3>
                <div className="flex items-center mb-2">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span className="text-gray-900 dark:text-white">{patient.phoneNumber}</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span className="text-gray-900 dark:text-white">{patient.email}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  {(user?.role === 'admin' || user?.role === 'receptionist') && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/patients/${patient._id}/edit`)}
                        className="w-full flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-amber-500 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Edit Patient</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/appointments/new?patientId=${patient._id}`)}
                        className="w-full flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Schedule Appointment</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/billing/new?patientId=${patient._id}`)}
                        className="w-full flex items-center p-2 rounded-md bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5 text-green-500 dark:text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">Create Invoice</span>
                      </motion.button>
                    </>
                  )}

                  {user?.role === 'dermatologist' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/prescriptions/new?patientId=${patient._id}`)}
                      className="w-full flex items-center p-2 rounded-md bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                      <span className="text-primary-700 dark:text-primary-300 font-medium">Create Prescription</span>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Patient Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Appointments</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{appointments.length}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-md">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Prescriptions</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{prescriptions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main content area */}
        <div className="lg:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Patient Details
            </h1>
          </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex overflow-x-auto pb-1">
          <button
            className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('info')}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
              Patient Information
            </div>
          </button>
          <button
            className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              Appointments
            </div>
          </button>
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'prescriptions'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('prescriptions')}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Prescriptions
              </div>
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'medical'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('medical')}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Medical History
              </div>
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'images'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('images')}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Images
              </div>
            </button>
          )}
        </nav>
      </div>

      {/* Tab content */}
      <div className="mt-6">
        {activeTab === 'info' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-gray-900 dark:text-white">{patient.firstName} {patient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
                  <p className="text-gray-900 dark:text-white capitalize">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(patient.dateOfBirth)} ({calculateAge(patient.dateOfBirth)} years)
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Group</p>
                  <p className="text-gray-900 dark:text-white">{patient.bloodGroup}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Registered On</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(patient.createdAt)}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-gray-900 dark:text-white">{patient.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="text-gray-900 dark:text-white">{patient.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-gray-900 dark:text-white">{patient.address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Emergency Contact</p>
                  <p className="text-gray-900 dark:text-white">
                    {patient.emergencyContact.name} ({patient.emergencyContact.relationship})
                  </p>
                  <p className="text-gray-900 dark:text-white">{patient.emergencyContact.phoneNumber}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'appointments' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment History</h3>
            {(user?.role === 'admin' || user?.role === 'receptionist') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/appointments/new?patientId=${patient._id}`)}
              >
                Schedule New Appointment
              </Button>
            )}
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No appointments found for this patient</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
                <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Date & Time</th>
                    <th scope="col" className="px-6 py-3">Reason</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Notes</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr
                      key={appointment._id}
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4">
                        <div className="font-medium">{formatDate(appointment.date)}</div>
                        <div className="text-gray-500 dark:text-gray-400">{appointment.startTime} - {appointment.endTime}</div>
                      </td>
                      <td className="px-6 py-4">{appointment.reason}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          appointment.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : appointment.status === 'scheduled'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : appointment.status === 'cancelled'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {appointment.notes || <span className="text-gray-400 dark:text-gray-500">No notes</span>}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => navigate(`/appointments/${appointment._id}`)}
                          className="text-primary-600 dark:text-primary-400 hover:underline"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'images' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Patient Images</h3>
            {(user?.role === 'admin' || user?.role === 'dermatologist') && (
              <Button
                variant="primary"
                onClick={() => navigate(`/patients/${patient._id}/upload-image`)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                }
              >
                Upload New Image
              </Button>
            )}
          </div>

          <BeforeAfterComparison patientId={patient._id} />
        </div>
      )}

      {activeTab === 'prescriptions' && (
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Prescription History</h3>
            {user?.role === 'dermatologist' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/prescriptions/new?patientId=${patient._id}`)}
              >
                Create New Prescription
              </Button>
            )}
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No prescriptions found for this patient</p>
            </div>
          ) : (
            <div className="space-y-6">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription._id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-md font-semibold text-gray-900 dark:text-white">
                        Prescription - {formatDate(prescription.date)}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Diagnosis: {prescription.diagnosis}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => navigate(`/prescriptions/${prescription._id}/print`)}
                        className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                      >
                        Print
                      </button>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medications:</h5>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {prescription.medications.map((med, index) => (
                        <li key={index}>
                          <span className="font-medium">{med.name}</span> - {med.dosage}, {med.frequency} for {med.duration}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Instructions:</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {prescription.instructions}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === 'medical' && (
        <Card>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medical History</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {patient.medicalHistory || 'No medical history recorded.'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allergies</h3>
              {patient.allergies && patient.allergies.length > 0 ? (
                <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                  {patient.allergies.map((allergy, index) => (
                    <li key={index}>{allergy}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700 dark:text-gray-300">No known allergies.</p>
              )}
            </div>

            {user?.role === 'dermatologist' && (
              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/patients/${patient._id}/edit-medical`)}
                >
                  Update Medical Information
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default PatientDetail;
