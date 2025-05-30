import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import QuickActionButton from '../../components/common/QuickActionButton';
import Breadcrumb from '../../components/common/Breadcrumb';
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
  createdAt: string;
}

const PatientList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const requestInProgress = useRef(false);

  const fetchPatients = async (isRetry = false) => {
    // Prevent multiple simultaneous requests
    if (requestInProgress.current && !isRetry) {
      console.log('Request already in progress, skipping...');
      return;
    }

    try {
      requestInProgress.current = true;
      setIsLoading(true);
      setHasError(false);

      // Build query parameters
      let queryParams = new URLSearchParams();
      if (searchTerm) queryParams.append('search', searchTerm);
      if (filter !== 'all') queryParams.append('filter', filter);
      queryParams.append('page', currentPage.toString());

      console.log('Fetching patients with params:', queryParams.toString());

      // Fetch patients from the real API
      const response = await api.get(`/patients?${queryParams.toString()}`);
      const data = response.data;

      setPatients(data.data || []);
      setTotalPages(data.totalPages || Math.ceil((data.count || 0) / 10));
      setRetryCount(0); // Reset retry count on success
      setHasError(false);
      setIsLoading(false);
      requestInProgress.current = false;
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      setHasError(true);
      setIsLoading(false);
      requestInProgress.current = false;

      // Only show error message if it's not a retry
      if (!isRetry) {
        if (error.response?.status === 429) {
          toast.error('Too many requests. Please wait a moment before trying again.');
        } else {
          toast.error('Failed to load patients from server. Please try refreshing the page.');
        }
      }
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchPatients(true);
  };

  useEffect(() => {
    // Debounce all API calls to avoid excessive requests
    const timeoutId = setTimeout(() => {
      fetchPatients();
    }, 1000); // 1 second delay for all changes

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage, filter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
    setHasError(false); // Clear error state when user starts typing
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
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

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Patients' }
        ]}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage patient records and information
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(user?.role === 'admin' || user?.role === 'receptionist') && (
            <Link to="/patients/new">
              <Button
                variant="primary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                }
              >
                Add New Patient
              </Button>
            </Link>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/appointments/calendar')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            }
          >
            View Appointments
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="search"
                className="block w-full p-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search patients by name, email, or phone..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="w-full md:w-auto flex gap-2">
            <select
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              value={filter}
              onChange={handleFilterChange}
            >
              <option value="all">All Patients</option>
              <option value="recent">Recently Added</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <button
              onClick={() => fetchPatients()}
              className="p-2.5 text-gray-600 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-primary-800"
              title="Refresh patient list"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : hasError ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-red-300 dark:text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load patients from server</p>
            <Button
              variant="primary"
              onClick={handleRetry}
              disabled={isLoading}
            >
              Try Again
            </Button>
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No patients found</p>
            {searchTerm && (
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
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Gender/Age</th>
                  <th scope="col" className="px-6 py-3">Contact</th>
                  <th scope="col" className="px-6 py-3">Registered On</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr
                    key={patient._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium">
                      {patient.firstName} {patient.lastName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize">{patient.gender}</span> / {calculateAge(patient.dateOfBirth)} years
                    </td>
                    <td className="px-6 py-4">
                      <div>{patient.phoneNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{patient.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(patient.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <QuickActionButton
                          icon={
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                          }
                          label="View"
                          color="primary"
                          size="sm"
                          onClick={() => navigate(`/patients/${patient._id}`)}
                          tooltip="View patient details"
                        />

                        {(user?.role === 'admin' || user?.role === 'receptionist') && (
                          <QuickActionButton
                            icon={
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            }
                            label="Edit"
                            color="warning"
                            size="sm"
                            onClick={() => navigate(`/patients/${patient._id}/edit`)}
                            tooltip="Edit patient information"
                          />
                        )}

                        {user?.role === 'dermatologist' && (
                          <QuickActionButton
                            icon={
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                            }
                            label="Prescribe"
                            color="success"
                            size="sm"
                            onClick={() => navigate(`/prescriptions/new?patientId=${patient._id}`)}
                            tooltip="Create new prescription"
                          />
                        )}

                        <QuickActionButton
                          icon={
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          }
                          label="Appointments"
                          color="info"
                          size="sm"
                          onClick={() => navigate(`/appointments?patientId=${patient._id}`)}
                          tooltip="View patient appointments"
                        />
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

export default PatientList;
