import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
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

  const fetchPatients = async () => {
    try {
      setIsLoading(true);
      // In a real implementation, we would use pagination and filtering
      // const response = await api.get(`/api/patients?page=${currentPage}&search=${searchTerm}&filter=${filter}`);

      // For now, we'll use mock data
      const mockPatients = [
        {
          _id: '1',
          firstName: 'Ahmed',
          lastName: 'Khan',
          email: 'ahmed.khan@example.com',
          phoneNumber: '+92 300 1234567',
          dateOfBirth: '1985-05-15',
          gender: 'male',
          address: 'House 123, Street 4, Islamabad, Pakistan',
          createdAt: '2023-01-15T10:30:00.000Z'
        },
        {
          _id: '2',
          firstName: 'Fatima',
          lastName: 'Ali',
          email: 'fatima.ali@example.com',
          phoneNumber: '+92 321 9876543',
          dateOfBirth: '1990-08-22',
          gender: 'female',
          address: 'Apartment 45, Block B, Lahore, Pakistan',
          createdAt: '2023-02-20T14:15:00.000Z'
        },
        {
          _id: '3',
          firstName: 'Muhammad',
          lastName: 'Raza',
          email: 'muhammad.raza@example.com',
          phoneNumber: '+92 333 5556666',
          dateOfBirth: '1978-11-10',
          gender: 'male',
          address: 'Plot 78, Sector F, Karachi, Pakistan',
          createdAt: '2023-03-05T09:45:00.000Z'
        },
        {
          _id: '4',
          firstName: 'Ayesha',
          lastName: 'Malik',
          email: 'ayesha.malik@example.com',
          phoneNumber: '+92 345 1112222',
          dateOfBirth: '1995-04-30',
          gender: 'female',
          address: 'House 56, Street 12, Peshawar, Pakistan',
          createdAt: '2023-04-10T11:20:00.000Z'
        },
        {
          _id: '5',
          firstName: 'Imran',
          lastName: 'Ahmed',
          email: 'imran.ahmed@example.com',
          phoneNumber: '+92 312 3334444',
          dateOfBirth: '1982-09-18',
          gender: 'male',
          address: 'Flat 23, Building C, Faisalabad, Pakistan',
          createdAt: '2023-05-22T16:30:00.000Z'
        },
        {
          _id: '6',
          firstName: 'Sana',
          lastName: 'Mahmood',
          email: 'sana.mahmood@example.com',
          phoneNumber: '+92 333 7778888',
          dateOfBirth: '1992-07-12',
          gender: 'female',
          address: 'House 89, Block D, Multan, Pakistan',
          createdAt: new Date().toISOString() // Today
        }
      ];

      // First apply filter
      let filteredByCategory = [...mockPatients];

      if (filter === 'male') {
        filteredByCategory = mockPatients.filter(patient => patient.gender === 'male');
      } else if (filter === 'female') {
        filteredByCategory = mockPatients.filter(patient => patient.gender === 'female');
      } else if (filter === 'recent') {
        // Sort by creation date (newest first) and take only the most recent ones (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        filteredByCategory = mockPatients
          .filter(patient => new Date(patient.createdAt) >= thirtyDaysAgo)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      // Then apply search term
      const filteredPatients = filteredByCategory.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchTerm.toLowerCase()) ||
               patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
               patient.phoneNumber.includes(searchTerm);
      });

      // Apply pagination (for mock data, we'll just simulate it)
      const patientsPerPage = 10;
      const startIndex = (currentPage - 1) * patientsPerPage;
      const paginatedPatients = filteredPatients.slice(startIndex, startIndex + patientsPerPage);

      setPatients(paginatedPatients);
      setTotalPages(Math.ceil(filteredPatients.length / patientsPerPage));
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to load patients');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [searchTerm, currentPage, filter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patients</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage patient records and information
          </p>
        </div>
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
          <div className="w-full md:w-auto">
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
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
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
                        <button
                          onClick={() => navigate(`/patients/${patient._id}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </button>
                        {(user?.role === 'admin' || user?.role === 'receptionist') && (
                          <button
                            onClick={() => navigate(`/patients/${patient._id}/edit`)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit
                          </button>
                        )}
                        {user?.role === 'dermatologist' && (
                          <button
                            onClick={() => navigate(`/prescriptions/new?patientId=${patient._id}`)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-green-600 dark:text-green-400 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            Prescribe
                          </button>
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

export default PatientList;
