import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
}

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

interface Appointment {
  _id: string;
  patient: Patient;
  dermatologist: Doctor; // API uses 'dermatologist' instead of 'doctor'
  date: string;
  startTime: string; // API uses 'startTime' instead of 'time'
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes: string;
  createdAt: string;
  createdBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const AppointmentList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);

        // Build query parameters
        const queryParams = new URLSearchParams();
        if (searchTerm) queryParams.append('search', searchTerm);
        if (filter !== 'all') queryParams.append('status', filter);
        if (dateFilter) queryParams.append('date', dateFilter);
        queryParams.append('page', currentPage.toString());

        // If user is a dermatologist, only show their appointments
        if (user?.role === 'dermatologist') {
          queryParams.append('dermatologist', user._id);
        }

        // Fetch appointments from the real API
        const response = await api.get(`/appointments?${queryParams.toString()}`);

        // Map the API response to our interface
        const appointmentsData = response.data.data.map((appointment: any) => ({
          ...appointment,
          // Add any transformations needed to match our interface
        }));

        setAppointments(appointmentsData);
        setTotalPages(response.data.totalPages || Math.ceil(response.data.count / 10));
        setIsLoading(false);
      } catch (error: any) {
        console.error('Error fetching appointments:', error);

        if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment before trying again.');
        } else {
          toast.error('Failed to load appointments. Please try refreshing the page.');
        }

        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [searchTerm, currentPage, filter, dateFilter, user]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleDateFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering by date
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      // Call the real API to update the appointment status
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });

      // Update the local state to reflect the change
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment._id === appointmentId
            ? { ...appointment, status: newStatus as any }
            : appointment
        )
      );

      toast.success(`Appointment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and schedule patient appointments
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/appointments/calendar">
            <Button
              variant="outline"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              }
            >
              Calendar View
            </Button>
          </Link>
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Link to="/appointments/new">
              <Button
                variant="primary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                }
              >
                Schedule Appointment
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by patient, doctor, or reason..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <select
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Appointments</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No Show</option>
            </select>
          </div>
          <div className="w-full md:w-1/4">
            <input
              type="date"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              value={dateFilter}
              onChange={handleDateFilterChange}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No appointments found</p>
            {(searchTerm || filter !== 'all' || dateFilter) && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Try adjusting your search or filter criteria
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Date & Time</th>
                  <th scope="col" className="px-6 py-3">Patient</th>
                  <th scope="col" className="px-6 py-3">Doctor</th>
                  <th scope="col" className="px-6 py-3">Reason</th>
                  <th scope="col" className="px-6 py-3">Status</th>
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
                      <div className="text-gray-500 dark:text-gray-400">{appointment.startTime}</div>
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </td>
                    <td className="px-6 py-4">
                      {appointment.dermatologist.firstName} {appointment.dermatologist.lastName}
                    </td>
                    <td className="px-6 py-4">
                      {appointment.reason.length > 30
                        ? `${appointment.reason.substring(0, 30)}...`
                        : appointment.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/appointments/${appointment._id}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </button>

                        {(user?.role === 'admin' || user?.role === 'receptionist') && appointment.status === 'scheduled' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'completed')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-green-600 dark:text-green-400 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                              Complete
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'no-show')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                              </svg>
                              No-Show
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(appointment._id, 'cancelled')}
                              className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                            >
                              <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                              </svg>
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === index + 1
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AppointmentList;
