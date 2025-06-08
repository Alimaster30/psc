import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api, { appointmentAPI } from '../../services/api';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Appointment {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  dermatologist: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  appointments: Appointment[];
}

const AppointmentCalendar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  // Fetch appointments and doctors
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch doctors from API
        try {
          const doctorsResponse = await api.get('/users?role=dermatologist');
          const doctorsData = doctorsResponse.data.data || [];
          setDoctors(doctorsData);

          // Set default selected doctor if user is a dermatologist
          if (user?.role === 'dermatologist') {
            setSelectedDoctor(user.id);
          } else if (doctorsData.length > 0) {
            setSelectedDoctor(doctorsData[0]._id);
          }
        } catch (error) {
          console.error('Error fetching doctors:', error);
          toast.error('Failed to load doctors');
        }

        // Fetch appointments
        await fetchAppointments();
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load calendar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Fetch appointments based on selected doctor and date range
  const fetchAppointments = async () => {
    try {
      const startDate = new Date(currentDate);
      startDate.setDate(1);

      const endDate = new Date(currentDate);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);

      // Build query parameters for API call
      const params: any = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      if (selectedDoctor) {
        params.dermatologist = selectedDoctor;
      }

      // Fetch appointments from API
      const response = await api.get('/appointments', { params });
      const appointmentsData = response.data.data || [];

      setAppointments(appointmentsData);

      // Generate calendar days
      generateCalendarDays(startDate, endDate, appointmentsData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to load appointments');
    }
  };

  // Effect to regenerate calendar when date, doctor, or view mode changes
  useEffect(() => {
    if (selectedDoctor) {
      fetchAppointments();
    }
  }, [currentDate, selectedDoctor, viewMode]);

  // Generate calendar days based on current month and appointments
  const generateCalendarDays = (startDate: Date, endDate: Date, appointments: Appointment[]) => {
    const days: CalendarDay[] = [];
    const today = new Date();

    // Get the first day of the month
    const firstDay = new Date(startDate);

    // Get the last day of the month
    const lastDay = new Date(endDate);

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();

    // Add days from previous month to fill the first week
    const prevMonthLastDay = new Date(firstDay);
    prevMonthLastDay.setDate(0);
    const prevMonthDays = prevMonthLastDay.getDate();

    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(prevMonthLastDay);
      date.setDate(prevMonthDays - i);

      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        appointments: filterAppointmentsByDate(appointments, date),
      });
    }

    // Add days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(firstDay);
      date.setDate(i);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: isSameDay(date, today),
        appointments: filterAppointmentsByDate(appointments, date),
      });
    }

    // Add days from next month to complete the last week
    const lastDayOfWeek = lastDay.getDay();
    const daysToAdd = 6 - lastDayOfWeek;

    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(lastDay);
      date.setDate(lastDay.getDate() + i);

      days.push({
        date,
        isCurrentMonth: false,
        isToday: isSameDay(date, today),
        appointments: filterAppointmentsByDate(appointments, date),
      });
    }

    setCalendarDays(days);
  };

  // Filter appointments by date
  const filterAppointmentsByDate = (appointments: Appointment[], date: Date): Appointment[] => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, date);
    });
  };

  // Check if two dates are the same day
  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format appointment time
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${formattedHour}:${minutes} ${period}`;
  };

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'confirmed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'completed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'no-show':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Render month view
  const renderMonthView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Calendar header */}
        <div className="grid grid-cols-7 gap-px border-b border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="py-2 px-1 text-center text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 2)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] md:min-h-[140px] p-1 md:p-2 bg-white dark:bg-gray-800 ${
                !day.isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600' : ''
              } ${day.isToday ? 'ring-2 ring-inset ring-primary-500 dark:ring-primary-400' : ''}`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-xs md:text-sm font-medium ${day.isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}>
                  {day.date.getDate()}
                </span>
                {day.isCurrentMonth && user?.role !== 'dermatologist' && (
                  <button
                    onClick={() => navigate(`/appointments/new?date=${day.date.toISOString().split('T')[0]}&doctor=${selectedDoctor}`)}
                    className="w-6 h-6 md:w-5 md:h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 rounded text-xs font-bold touch-manipulation"
                    title="Add appointment"
                  >
                    +
                  </button>
                )}
              </div>

              <div className="mt-1 md:mt-2 space-y-0.5 md:space-y-1 max-h-[80px] md:max-h-[100px] overflow-y-auto">
                {day.appointments.slice(0, 3).map((appointment, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(`/appointments/${appointment._id}`)}
                    className={`px-1 md:px-2 py-0.5 md:py-1 text-xs rounded cursor-pointer touch-manipulation ${getStatusColor(appointment.status)}`}
                  >
                    <div className="truncate">
                      {formatTime(appointment.startTime)} - {appointment.patient.firstName} {appointment.patient.lastName.charAt(0)}.
                    </div>
                  </div>
                ))}
                {day.appointments.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center py-0.5">
                    +{day.appointments.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(currentDate);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      weekDays.push(date);
    }

    const hours = [];
    for (let i = 8; i < 18; i++) {
      hours.push(i);
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Week header */}
        <div className="grid grid-cols-8 gap-px border-b border-gray-200 dark:border-gray-700 bg-gray-200 dark:bg-gray-700">
          <div className="py-2 px-1 text-center text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">
            Hour
          </div>
          {weekDays.map((date, index) => (
            <div
              key={index}
              className={`py-2 px-1 text-center text-xs md:text-sm font-medium ${
                isSameDay(date, today) ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="hidden md:block">
                {date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' })}
              </div>
              <div className="md:hidden">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                <br />
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Week grid */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 gap-px">
              <div className="py-2 px-2 text-xs text-gray-500 dark:text-gray-400 text-right">
                {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'PM' : 'AM'}
              </div>

              {weekDays.map((date, dateIndex) => {
                const dateStr = date.toISOString().split('T')[0];
                const hourAppointments = appointments.filter(appointment => {
                  const appointmentDate = new Date(appointment.date);
                  const appointmentHour = parseInt(appointment.startTime.split(':')[0], 10);
                  return isSameDay(appointmentDate, date) && appointmentHour === hour;
                });

                return (
                  <div
                    key={dateIndex}
                    className={`relative min-h-[50px] md:min-h-[60px] p-0.5 md:p-1 ${
                      isSameDay(date, today) ? 'bg-primary-50 dark:bg-primary-900/10' : 'bg-white dark:bg-gray-800'
                    }`}
                  >
                    {hourAppointments.map((appointment, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/appointments/${appointment._id}`)}
                        className={`px-1 md:px-2 py-0.5 md:py-1 text-xs rounded cursor-pointer mb-0.5 md:mb-1 touch-manipulation ${getStatusColor(appointment.status)}`}
                      >
                        <div className="truncate">
                          {formatTime(appointment.startTime)} - {appointment.patient.firstName} {appointment.patient.lastName.charAt(0)}.
                        </div>
                      </div>
                    ))}

                    {user?.role !== 'dermatologist' && (
                      <button
                        onClick={() => navigate(`/appointments/new?date=${dateStr}&time=${hour}:00&doctor=${selectedDoctor}`)}
                        className="absolute bottom-0.5 right-0.5 w-5 h-5 md:w-4 md:h-4 flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-800 rounded text-xs font-bold touch-manipulation"
                        title="Add appointment"
                      >
                        +
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const hours = [];
    for (let i = 8; i < 18; i++) {
      hours.push(i);
    }

    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date);
      return isSameDay(appointmentDate, currentDate);
    });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {/* Day header */}
        <div className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h3>
        </div>

        {/* Day schedule */}
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {hours.map((hour) => {
            const hourAppointments = dayAppointments.filter(appointment => {
              const appointmentHour = parseInt(appointment.startTime.split(':')[0], 10);
              return appointmentHour === hour;
            });

            return (
              <div key={hour} className="flex">
                <div className="py-2 px-4 w-20 text-right text-sm text-gray-500 dark:text-gray-400">
                  {hour % 12 === 0 ? 12 : hour % 12}{hour >= 12 ? 'PM' : 'AM'}
                </div>

                <div className="flex-1 py-2 px-4 min-h-[80px] relative">
                  {hourAppointments.map((appointment, idx) => (
                    <div
                      key={idx}
                      onClick={() => navigate(`/appointments/${appointment._id}`)}
                      className={`px-3 py-2 rounded cursor-pointer mb-2 ${getStatusColor(appointment.status)}`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">
                          {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                        </span>
                        <span className="text-sm">
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-1">
                        Patient: {appointment.patient.firstName} {appointment.patient.lastName}
                      </div>
                      <div className="text-sm truncate">{appointment.reason}</div>
                    </div>
                  ))}

                  {user?.role !== 'dermatologist' && (
                    <button
                      onClick={() => navigate(`/appointments/new?date=${currentDate.toISOString().split('T')[0]}&time=${hour}:00&doctor=${selectedDoctor}`)}
                      className="absolute bottom-2 right-2 p-1 text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <style>{`
        .touch-manipulation {
          touch-action: manipulation;
        }

        @media (max-width: 640px) {
          .calendar-mobile {
            font-size: 0.75rem;
          }

          .calendar-mobile .appointment-card {
            min-height: 28px;
            padding: 2px 4px;
          }

          .calendar-mobile .add-button {
            min-width: 24px;
            min-height: 24px;
          }
        }
      `}</style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointment Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            View and manage appointments in calendar format
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/appointments')}
          >
            List View
          </Button>
          {user?.role !== 'dermatologist' && (
            <Button
              variant="primary"
              onClick={() => navigate('/appointments/new')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              }
            >
              New Appointment
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>

            <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 touch-manipulation"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>

            <button
              onClick={goToToday}
              className="ml-2 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 touch-manipulation"
            >
              Today
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <div>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.firstName} {doctor.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 text-sm rounded-l-md touch-manipulation ${
                  viewMode === 'month'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 text-sm touch-manipulation ${
                  viewMode === 'week'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 text-sm rounded-r-md touch-manipulation ${
                  viewMode === 'day'
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Day
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div>
            {viewMode === 'month' && renderMonthView()}
            {viewMode === 'week' && renderWeekView()}
            {viewMode === 'day' && renderDayView()}
          </div>
        )}
      </Card>

      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Status Legend</h3>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900 mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900 mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Confirmed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900 mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-red-100 dark:bg-red-900 mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">Cancelled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded bg-yellow-100 dark:bg-yellow-900 mr-2"></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">No-Show</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
