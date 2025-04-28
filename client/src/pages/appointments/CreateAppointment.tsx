import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AppointmentFormData {
  patientId: string;
  doctorId: string;
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
    date: '',
    time: '',
    reason: '',
    notes: ''
  });
  
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [errors, setErrors] = useState<Partial<AppointmentFormData>>({});
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

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

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);
        
        // In a real implementation, we would fetch from the API
        // const response = await api.get('/api/patients');
        // setPatients(response.data);
        
        // For now, we'll use mock data
        const mockPatients = [
          { _id: '1', firstName: 'Ahmed', lastName: 'Khan', email: 'ahmed.khan@example.com' },
          { _id: '2', firstName: 'Fatima', lastName: 'Ali', email: 'fatima.ali@example.com' },
          { _id: '3', firstName: 'Muhammad', lastName: 'Raza', email: 'muhammad.raza@example.com' },
          { _id: '4', firstName: 'Ayesha', lastName: 'Malik', email: 'ayesha.malik@example.com' },
          { _id: '5', firstName: 'Imran', lastName: 'Ahmed', email: 'imran.ahmed@example.com' }
        ];
        
        setPatients(mockPatients);
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
        
        // In a real implementation, we would fetch from the API
        // const response = await api.get('/api/users?role=dermatologist');
        // setDoctors(response.data);
        
        // For now, we'll use mock data
        const mockDoctors = [
          { _id: '1', firstName: 'Dr. Fatima', lastName: 'Ali', specialization: 'General Dermatology' },
          { _id: '2', firstName: 'Dr. Imran', lastName: 'Ahmed', specialization: 'Pediatric Dermatology' },
          { _id: '3', firstName: 'Dr. Zainab', lastName: 'Khan', specialization: 'Cosmetic Dermatology' }
        ];
        
        setDoctors(mockDoctors);
        setIsLoadingDoctors(false);
      } catch (error) {
        console.error('Error fetching doctors:', error);
        toast.error('Failed to load doctors');
        setIsLoadingDoctors(false);
      }
    };

    const fetchAppointment = async () => {
      if (!isEditMode) return;
      
      try {
        setIsFetching(true);
        
        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/appointments/${id}`);
        // const appointmentData = response.data;
        
        // For now, we'll use mock data
        const mockAppointment = {
          _id: id,
          patient: { _id: '1', firstName: 'Ahmed', lastName: 'Khan' },
          doctor: { _id: '1', firstName: 'Dr. Fatima', lastName: 'Ali' },
          date: '2023-08-15',
          time: '10:30 AM',
          reason: 'Skin rash on arms',
          notes: 'Patient has a history of allergic reactions.',
          status: 'scheduled'
        };
        
        setFormData({
          patientId: mockAppointment.patient._id,
          doctorId: mockAppointment.doctor._id,
          date: mockAppointment.date,
          time: mockAppointment.time,
          reason: mockAppointment.reason,
          notes: mockAppointment.notes
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
    fetchAppointment();
  }, [id, isEditMode, navigate]);

  useEffect(() => {
    // Generate available time slots based on selected date and doctor
    if (formData.date && formData.doctorId) {
      // In a real implementation, we would fetch available times from the API
      // const response = await api.get(`/api/appointments/available-times?date=${formData.date}&doctorId=${formData.doctorId}`);
      // setAvailableTimes(response.data);
      
      // For now, we'll use mock data
      const mockTimes = [
        '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
        '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
        '04:00 PM', '04:30 PM'
      ];
      
      // Simulate some times being already booked
      const bookedTimes = ['10:00 AM', '02:00 PM', '03:30 PM'];
      const available = mockTimes.filter(time => !bookedTimes.includes(time));
      
      setAvailableTimes(available);
    } else {
      setAvailableTimes([]);
    }
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
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    if (!formData.reason.trim()) newErrors.reason = 'Reason for appointment is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real implementation, we would call the API
      // if (isEditMode) {
      //   await api.put(`/api/appointments/${id}`, formData);
      // } else {
      //   await api.post('/api/appointments', formData);
      // }
      
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`Appointment ${isEditMode ? 'updated' : 'scheduled'} successfully`);
      navigate('/appointments');
    } catch (error) {
      console.error('Error saving appointment:', error);
      toast.error(`Failed to ${isEditMode ? 'update' : 'schedule'} appointment`);
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

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

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
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
          
          {/* Doctor Selection */}
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
          
          {/* Date and Time Selection */}
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
          
          {/* Reason for Appointment */}
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
          
          {/* Additional Notes */}
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
          
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/appointments')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              {isEditMode ? 'Update Appointment' : 'Schedule Appointment'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateAppointment;
