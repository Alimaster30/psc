import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  email: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
}

interface Appointment {
  _id: string;
  patient: Patient;
  doctor: Doctor;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  medicalNotes: string;
  createdAt: string;
  updatedAt: string;
}

const AppointmentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [status, setStatus] = useState<string>('');

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/appointments/${id}`);
        // const appointmentData = response.data;
        
        // For now, we'll use mock data
        const mockAppointment = {
          _id: id || '1',
          patient: {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567',
            dateOfBirth: '1985-05-15',
            gender: 'male'
          },
          doctor: {
            _id: '1',
            firstName: 'Dr. Fatima',
            lastName: 'Ali',
            specialization: 'Dermatologist',
            email: 'dr.fatima@example.com'
          },
          date: '2023-08-15',
          time: '10:30 AM',
          status: 'scheduled' as const,
          reason: 'Skin rash on arms and face, with itching and redness. Patient reports symptoms started 3 days ago after using a new soap.',
          notes: 'Patient has a history of allergic reactions to certain soaps and detergents.',
          medicalNotes: 'Possible contact dermatitis. Will examine and prescribe appropriate treatment.',
          createdAt: '2023-08-01T10:30:00.000Z',
          updatedAt: '2023-08-01T10:30:00.000Z'
        };
        
        setAppointment(mockAppointment);
        setNotes(mockAppointment.notes);
        setMedicalNotes(mockAppointment.medicalNotes);
        setStatus(mockAppointment.status);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching appointment:', error);
        toast.error('Failed to load appointment details');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchAppointment();
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      setIsUpdating(true);
      
      // In a real implementation, we would call the API
      // await api.patch(`/api/appointments/${id}`, {
      //   notes,
      //   medicalNotes,
      //   status
      // });
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      if (appointment) {
        setAppointment({
          ...appointment,
          notes,
          medicalNotes,
          status: status as any,
          updatedAt: new Date().toISOString()
        });
      }
      
      toast.success('Appointment updated successfully');
      setIsUpdating(false);
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error('Failed to update appointment');
      setIsUpdating(false);
    }
  };

  const handleCreatePrescription = () => {
    if (appointment) {
      navigate(`/prescriptions/new?patientId=${appointment.patient._id}`);
    }
  };

  const handleCreateBilling = () => {
    if (appointment) {
      navigate(`/billing/new?patientId=${appointment.patient._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The appointment you're looking for doesn't exist or has been removed.</p>
        <Link to="/appointments">
          <Button variant="primary">
            Return to Appointments
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {formatDate(appointment.date)} at {appointment.time}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(user?.role === 'admin' || user?.role === 'receptionist') && appointment.status === 'scheduled' && (
            <Button
              variant="outline"
              onClick={() => navigate(`/appointments/${appointment._id}/edit`)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              }
            >
              Edit Appointment
            </Button>
          )}
          {user?.role === 'dermatologist' && appointment.status === 'completed' && (
            <Button
              variant="primary"
              onClick={handleCreatePrescription}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
            >
              Create Prescription
            </Button>
          )}
          {(user?.role === 'admin' || user?.role === 'receptionist') && appointment.status === 'completed' && (
            <Button
              variant="primary"
              onClick={handleCreateBilling}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              }
            >
              Create Invoice
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/appointments')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            }
          >
            Back to List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Appointment Information */}
        <Card className="md:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Appointment Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date & Time</p>
              <p className="text-gray-900 dark:text-white">{formatDate(appointment.date)} at {appointment.time}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reason for Visit</p>
            <p className="text-gray-900 dark:text-white whitespace-pre-line">{appointment.reason}</p>
          </div>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</p>
            <p className="text-gray-900 dark:text-white">{formatDateTime(appointment.createdAt)}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="text-gray-900 dark:text-white">{formatDateTime(appointment.updatedAt)}</p>
          </div>
        </Card>

        {/* Patient Information */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h2>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">
                {appointment.patient.firstName} {appointment.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
              <p className="text-gray-900 dark:text-white">{appointment.patient.phoneNumber}</p>
              <p className="text-gray-900 dark:text-white">{appointment.patient.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</p>
              <p className="text-gray-900 dark:text-white capitalize">{appointment.patient.gender}</p>
            </div>
            <div className="pt-4">
              <Link to={`/patients/${appointment.patient._id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Patient Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Doctor Information */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Doctor Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
            <p className="text-gray-900 dark:text-white">
              {appointment.doctor.firstName} {appointment.doctor.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</p>
            <p className="text-gray-900 dark:text-white">{appointment.doctor.specialization}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
            <p className="text-gray-900 dark:text-white">{appointment.doctor.email}</p>
          </div>
        </div>
      </Card>

      {/* Notes and Status Update */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Notes and Status</h2>
        
        <div className="space-y-6">
          {/* Status Update */}
          {(user?.role === 'admin' || user?.role === 'receptionist') && appointment.status === 'scheduled' && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Update Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
          )}
          
          {/* General Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              General Notes
            </label>
            <textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Add general notes about the appointment..."
              disabled={!(user?.role === 'admin' || user?.role === 'receptionist')}
            />
          </div>
          
          {/* Medical Notes (Only for doctors) */}
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <div>
              <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Medical Notes
              </label>
              <textarea
                id="medicalNotes"
                rows={4}
                value={medicalNotes}
                onChange={(e) => setMedicalNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                placeholder="Add medical notes about the patient's condition..."
                disabled={user?.role !== 'dermatologist'}
              />
            </div>
          )}
          
          {/* Update Button */}
          {((user?.role === 'admin' || user?.role === 'receptionist') || 
            (user?.role === 'dermatologist' && appointment.status === 'completed')) && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="primary"
                onClick={handleUpdateAppointment}
                isLoading={isUpdating}
              >
                Update Appointment
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AppointmentDetail;
