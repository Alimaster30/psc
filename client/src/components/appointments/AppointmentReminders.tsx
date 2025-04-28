import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';
import Button from '../common/Button';

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  dermatologist: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: string;
}

const AppointmentReminders: React.FC = () => {
  const navigate = useNavigate();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [reminderMethod, setReminderMethod] = useState<'sms' | 'email'>('sms');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      try {
        setIsLoading(true);
        
        // Get tomorrow's date
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        // In a real implementation, we would fetch from the API
        // const response = await axios.get(`/api/appointments?date=${tomorrowStr}&status=scheduled`);
        // setUpcomingAppointments(response.data.data);
        
        // For now, we'll use mock data
        const mockAppointments = [
          {
            _id: '1',
            patient: {
              _id: '1',
              firstName: 'Ahmed',
              lastName: 'Khan',
              phoneNumber: '+92 300 1234567',
              email: 'ahmed.khan@example.com'
            },
            dermatologist: {
              _id: '1',
              firstName: 'Dr. Fatima',
              lastName: 'Ali'
            },
            date: tomorrowStr,
            startTime: '10:00',
            endTime: '10:30',
            status: 'scheduled'
          },
          {
            _id: '2',
            patient: {
              _id: '2',
              firstName: 'Fatima',
              lastName: 'Ali',
              phoneNumber: '+92 301 2345678',
              email: 'fatima.ali@example.com'
            },
            dermatologist: {
              _id: '2',
              firstName: 'Dr. Imran',
              lastName: 'Ahmed'
            },
            date: tomorrowStr,
            startTime: '11:00',
            endTime: '11:30',
            status: 'scheduled'
          },
          {
            _id: '3',
            patient: {
              _id: '3',
              firstName: 'Muhammad',
              lastName: 'Raza',
              phoneNumber: '+92 302 3456789',
              email: 'muhammad.raza@example.com'
            },
            dermatologist: {
              _id: '1',
              firstName: 'Dr. Fatima',
              lastName: 'Ali'
            },
            date: tomorrowStr,
            startTime: '14:00',
            endTime: '14:30',
            status: 'scheduled'
          }
        ];
        
        setUpcomingAppointments(mockAppointments);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching upcoming appointments:', error);
        toast.error('Failed to load upcoming appointments');
        setIsLoading(false);
      }
    };
    
    fetchUpcomingAppointments();
  }, []);

  const handleSelectAll = () => {
    if (selectedAppointments.length === upcomingAppointments.length) {
      // If all are selected, deselect all
      setSelectedAppointments([]);
    } else {
      // Otherwise, select all
      setSelectedAppointments(upcomingAppointments.map(appointment => appointment._id));
    }
  };

  const handleSelectAppointment = (appointmentId: string) => {
    if (selectedAppointments.includes(appointmentId)) {
      // If already selected, remove it
      setSelectedAppointments(prev => prev.filter(id => id !== appointmentId));
    } else {
      // Otherwise, add it
      setSelectedAppointments(prev => [...prev, appointmentId]);
    }
  };

  const handleSendReminders = async () => {
    if (selectedAppointments.length === 0) {
      toast.error('Please select at least one appointment');
      return;
    }
    
    try {
      setIsSending(true);
      
      // In a real implementation, we would call the API
      // await axios.post('/api/appointments/reminders', {
      //   appointmentIds: selectedAppointments,
      //   method: reminderMethod
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast.success(`Reminders sent to ${selectedAppointments.length} patients via ${reminderMethod.toUpperCase()}`);
      setSelectedAppointments([]);
    } catch (error) {
      console.error('Error sending reminders:', error);
      toast.error('Failed to send reminders');
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appointment Reminders</h2>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setReminderMethod('sms')}
              className={`px-3 py-1 text-sm rounded-l-md ${
                reminderMethod === 'sms'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              SMS
            </button>
            <button
              onClick={() => setReminderMethod('email')}
              className={`px-3 py-1 text-sm rounded-r-md ${
                reminderMethod === 'email'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Email
            </button>
          </div>
          <Button
            variant="primary"
            onClick={handleSendReminders}
            disabled={selectedAppointments.length === 0 || isSending}
            className={isSending ? 'opacity-70 cursor-not-allowed' : ''}
          >
            {isSending ? 'Sending...' : 'Send Reminders'}
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : upcomingAppointments.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No upcoming appointments for tomorrow</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="select-all"
              checked={selectedAppointments.length === upcomingAppointments.length}
              onChange={handleSelectAll}
              className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label htmlFor="select-all" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              Select All
            </label>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div 
                key={appointment._id}
                className="flex items-start p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <input
                  type="checkbox"
                  id={`appointment-${appointment._id}`}
                  checked={selectedAppointments.includes(appointment._id)}
                  onChange={() => handleSelectAppointment(appointment._id)}
                  className="w-4 h-4 mt-1 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <div className="ml-3 flex-1">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-md font-medium text-gray-900 dark:text-white">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(appointment.date)} at {formatTime(appointment.startTime)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {appointment.dermatologist.firstName} {appointment.dermatologist.lastName}
                      </p>
                      <button
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                        className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      {reminderMethod === 'sms' ? (
                        <span>SMS will be sent to: {appointment.patient.phoneNumber}</span>
                      ) : (
                        <span>Email will be sent to: {appointment.patient.email}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default AppointmentReminders;
