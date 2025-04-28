import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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
  time: string;
  status: string;
  reason: string;
  notes: string;
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

        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/patients/${id}`);
        // setPatient(response.data);

        // For now, we'll use mock data
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
            date: '2023-06-10',
            time: '10:30 AM',
            status: 'completed',
            reason: 'Skin rash on arms',
            notes: 'Patient presented with rash on both arms. Prescribed topical cream.'
          },
          {
            _id: 'a2',
            date: '2023-07-15',
            time: '11:00 AM',
            status: 'completed',
            reason: 'Follow-up for skin rash',
            notes: 'Rash has improved significantly. Continuing treatment for another week.'
          },
          {
            _id: 'a3',
            date: '2023-08-20',
            time: '09:15 AM',
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {patient.firstName} {patient.lastName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Patient ID: {patient._id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <>
              <Button
                variant="outline"
                onClick={() => navigate(`/patients/${patient._id}/edit`)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                }
              >
                Edit Patient
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/appointments/new?patientId=${patient._id}`)}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                }
              >
                Schedule Appointment
              </Button>
            </>
          )}
          {user?.role === 'dermatologist' && (
            <Button
              variant="primary"
              onClick={() => navigate(`/prescriptions/new?patientId=${patient._id}`)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
            >
              Create Prescription
            </Button>
          )}
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Button
              variant="outline"
              onClick={() => navigate(`/billing/new?patientId=${patient._id}`)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              }
            >
              Create Invoice
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('info')}
          >
            Patient Information
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'appointments'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('appointments')}
          >
            Appointments
          </button>
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'prescriptions'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('prescriptions')}
            >
              Prescriptions
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'medical'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('medical')}
            >
              Medical History
            </button>
          )}
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <button
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'images'
                  ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setActiveTab('images')}
            >
              Images
            </button>
          )}
        </nav>
      </div>

      {/* Tab content */}
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
                        {appointment.date} <br />
                        <span className="text-gray-500 dark:text-gray-400">{appointment.time}</span>
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
  );
};

export default PatientDetail;
