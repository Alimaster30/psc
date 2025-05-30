import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Prescription {
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
  diagnosis: string;
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }[];
  date: string;
  createdAt: string;
}

const PrescriptionList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        setIsLoading(true);

        // Build query parameters
        let queryParams = new URLSearchParams();

        // Apply filter logic
        if (filter === 'my-patients' && user?.role === 'dermatologist') {
          queryParams.append('dermatologist', user.id);
        }

        // Fetch prescriptions from the real API
        const response = await api.get(`/prescriptions?${queryParams.toString()}`);
        let fetchedPrescriptions = response.data.data || [];

        // Apply client-side filtering for search and recent filter
        if (searchTerm) {
          fetchedPrescriptions = fetchedPrescriptions.filter((prescription: Prescription) => {
            const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`.toLowerCase();
            const doctorName = `${prescription.dermatologist.firstName} ${prescription.dermatologist.lastName}`.toLowerCase();
            const diagnosisLower = prescription.diagnosis.toLowerCase();
            const medicationNames = prescription.medications.map(med => med.name.toLowerCase()).join(' ');

            return patientName.includes(searchTerm.toLowerCase()) ||
                   doctorName.includes(searchTerm.toLowerCase()) ||
                   diagnosisLower.includes(searchTerm.toLowerCase()) ||
                   medicationNames.includes(searchTerm.toLowerCase());
          });
        }

        if (filter === 'recent') {
          // Sort by most recently created (using createdAt field for accurate creation time)
          fetchedPrescriptions = fetchedPrescriptions
            .sort((a: Prescription, b: Prescription) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
        }

        // Apply pagination
        const prescriptionsPerPage = 10;
        const startIndex = (currentPage - 1) * prescriptionsPerPage;
        const paginatedPrescriptions = fetchedPrescriptions.slice(startIndex, startIndex + prescriptionsPerPage);

        setPrescriptions(paginatedPrescriptions);
        setTotalPages(Math.ceil(fetchedPrescriptions.length / prescriptionsPerPage));
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prescriptions:', error);
        toast.error('Failed to load prescriptions from server. Please try refreshing the page.');
        setIsLoading(false);
      }
    };

    // Debounce API calls to avoid excessive requests
    const timeoutId = setTimeout(() => {
      fetchPrescriptions();
    }, searchTerm ? 500 : 0); // 500ms delay for search, immediate for other changes

    return () => clearTimeout(timeoutId);
  }, [searchTerm, currentPage, filter, user]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and view patient prescriptions
          </p>
        </div>
        {(user?.role === 'admin' || user?.role === 'dermatologist') && (
          <Link to="/prescriptions/new">
            <Button
              variant="primary"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              }
            >
              Create Prescription
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
                placeholder="Search by patient, doctor, diagnosis, or medication..."
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
              <option value="all">All Prescriptions</option>
              <option value="recent">Most Recent First</option>
              <option value="my-patients">My Patients</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No prescriptions found</p>
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
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Patient</th>
                  <th scope="col" className="px-6 py-3">Doctor</th>
                  <th scope="col" className="px-6 py-3">Diagnosis</th>
                  <th scope="col" className="px-6 py-3">Medications</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((prescription) => (
                  <tr
                    key={prescription._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4">
                      {formatDate(prescription.date || prescription.createdAt)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {prescription.patient.firstName} {prescription.patient.lastName}
                    </td>
                    <td className="px-6 py-4">
                      {prescription.dermatologist.firstName} {prescription.dermatologist.lastName}
                    </td>
                    <td className="px-6 py-4">
                      {prescription.diagnosis.length > 30
                        ? `${prescription.diagnosis.substring(0, 30)}...`
                        : prescription.diagnosis}
                    </td>
                    <td className="px-6 py-4">
                      <ul className="list-disc list-inside">
                        {prescription.medications.slice(0, 2).map((med, index) => (
                          <li key={index} className="truncate max-w-xs">
                            {med.name}
                          </li>
                        ))}
                        {prescription.medications.length > 2 && (
                          <li className="text-gray-500 dark:text-gray-400">
                            +{prescription.medications.length - 2} more
                          </li>
                        )}
                      </ul>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/prescriptions/${prescription._id}/print`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                          </svg>
                          Print
                        </button>
                        {(user?.role === 'admin' || user?.role === 'dermatologist') && (
                          <button
                            onClick={() => navigate(`/prescriptions/${prescription._id}/edit`)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                            Edit
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

export default PrescriptionList;
