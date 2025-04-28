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
}

interface Service {
  name: string;
  price: number;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patient: Patient;
  services: Service[];
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  dueDate: string;
}

const BillingList: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Check if user has permission to access this page
  if (user?.role !== 'admin' && user?.role !== 'receptionist') {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access billing information.</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would fetch from the API with pagination and filtering
        // const response = await api.get(`/api/invoices?page=${currentPage}&search=${searchTerm}&status=${statusFilter}&date=${dateFilter}`);
        // setInvoices(response.data.data);
        // setTotalPages(response.data.totalPages);

        // For now, we'll use mock data
        const mockInvoices = [
          {
            _id: '1',
            invoiceNumber: 'INV-2023-001',
            patient: {
              _id: '1',
              firstName: 'Ahmed',
              lastName: 'Khan'
            },
            services: [
              { name: 'Dermatology Consultation', price: 2500 },
              { name: 'Skin Biopsy', price: 5000 }
            ],
            totalAmount: 7500,
            paidAmount: 7500,
            status: 'paid' as const,
            paymentMethod: 'Cash',
            notes: 'Patient paid in full',
            createdAt: '2023-08-01T10:30:00.000Z',
            dueDate: '2023-08-15T00:00:00.000Z'
          },
          {
            _id: '2',
            invoiceNumber: 'INV-2023-002',
            patient: {
              _id: '2',
              firstName: 'Fatima',
              lastName: 'Ali'
            },
            services: [
              { name: 'Acne Treatment', price: 3500 },
              { name: 'Medication', price: 1500 }
            ],
            totalAmount: 5000,
            paidAmount: 2500,
            status: 'partial' as const,
            paymentMethod: 'Credit Card',
            notes: 'Patient will pay remaining amount on next visit',
            createdAt: '2023-08-05T14:15:00.000Z',
            dueDate: '2023-08-20T00:00:00.000Z'
          },
          {
            _id: '3',
            invoiceNumber: 'INV-2023-003',
            patient: {
              _id: '3',
              firstName: 'Muhammad',
              lastName: 'Raza'
            },
            services: [
              { name: 'Psoriasis Treatment', price: 6000 },
              { name: 'Topical Medication', price: 2000 }
            ],
            totalAmount: 8000,
            paidAmount: 0,
            status: 'unpaid' as const,
            notes: 'Insurance claim pending',
            createdAt: '2023-08-10T09:45:00.000Z',
            dueDate: '2023-08-25T00:00:00.000Z'
          },
          {
            _id: '4',
            invoiceNumber: 'INV-2023-004',
            patient: {
              _id: '4',
              firstName: 'Ayesha',
              lastName: 'Malik'
            },
            services: [
              { name: 'Eczema Treatment', price: 4500 },
              { name: 'Prescription Medication', price: 2500 }
            ],
            totalAmount: 7000,
            paidAmount: 7000,
            status: 'paid' as const,
            paymentMethod: 'Bank Transfer',
            createdAt: '2023-08-12T16:20:00.000Z',
            dueDate: '2023-08-27T00:00:00.000Z'
          },
          {
            _id: '5',
            invoiceNumber: 'INV-2023-005',
            patient: {
              _id: '5',
              firstName: 'Imran',
              lastName: 'Ahmed'
            },
            services: [
              { name: 'Skin Tag Removal', price: 3000 },
              { name: 'Follow-up Consultation', price: 1500 }
            ],
            totalAmount: 4500,
            paidAmount: 0,
            status: 'unpaid' as const,
            createdAt: '2023-08-15T11:30:00.000Z',
            dueDate: '2023-08-30T00:00:00.000Z'
          }
        ];

        // Filter invoices based on search term, status filter, and date filter
        let filteredInvoices = mockInvoices;

        // Filter by search term (patient name or invoice number)
        if (searchTerm) {
          filteredInvoices = filteredInvoices.filter(invoice => {
            const patientName = `${invoice.patient.firstName} ${invoice.patient.lastName}`.toLowerCase();
            const invoiceNumber = invoice.invoiceNumber.toLowerCase();

            return patientName.includes(searchTerm.toLowerCase()) ||
                   invoiceNumber.includes(searchTerm.toLowerCase());
          });
        }

        // Filter by status
        if (statusFilter !== 'all') {
          filteredInvoices = filteredInvoices.filter(invoice =>
            invoice.status === statusFilter
          );
        }

        // Filter by date (created date)
        if (dateFilter) {
          const filterDate = new Date(dateFilter);
          filteredInvoices = filteredInvoices.filter(invoice => {
            const createdDate = new Date(invoice.createdAt);
            return createdDate.toDateString() === filterDate.toDateString();
          });
        }

        setInvoices(filteredInvoices);
        setTotalPages(Math.ceil(filteredInvoices.length / 10)); // Assuming 10 invoices per page
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Failed to load billing information');
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [searchTerm, currentPage, statusFilter, dateFilter]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
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

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'unpaid':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage patient invoices and payments
          </p>
        </div>
        <Link to="/billing/new">
          <Button
            variant="primary"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            }
          >
            Create Invoice
          </Button>
        </Link>
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
                placeholder="Search by patient name or invoice number..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          <div className="w-full md:w-1/4">
            <select
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
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
        ) : invoices.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No invoices found</p>
            {(searchTerm || statusFilter !== 'all' || dateFilter) && (
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
                  <th scope="col" className="px-6 py-3">Invoice #</th>
                  <th scope="col" className="px-6 py-3">Patient</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Due Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                  <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 font-medium">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4">
                      {invoice.patient.firstName} {invoice.patient.lastName}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(invoice.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <div>{formatCurrency(invoice.totalAmount)}</div>
                      {invoice.status === 'partial' && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Paid: {formatCurrency(invoice.paidAmount)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(invoice.status)}`}>
                        {invoice.status === 'paid' ? 'Paid' :
                         invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => navigate(`/billing/${invoice._id}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                          </svg>
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/billing/${invoice._id}/receipt`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                        >
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                          </svg>
                          Print
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => navigate(`/billing/${invoice._id}/edit`)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-green-600 dark:text-green-400 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                          >
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                            Pay
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

export default BillingList;
