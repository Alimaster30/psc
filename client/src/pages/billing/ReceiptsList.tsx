import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import { billingAPI } from '../../services/api';

interface BillingRecord {
  _id: string;
  invoiceNumber: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
  services: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'partially_paid' | 'cancelled';
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

const ReceiptsList: React.FC = () => {
  const navigate = useNavigate();
  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBillingRecords();
  }, []);

  const fetchBillingRecords = async () => {
    try {
      setIsLoading(true);
      const response = await billingAPI.getBillings();
      
      if (response.data.success) {
        // Filter only paid and partially paid records for receipts
        const paidRecords = response.data.data.filter((record: BillingRecord) =>
          record.paymentStatus === 'paid' || record.paymentStatus === 'partially_paid'
        );
        setBillingRecords(paidRecords);
      } else {
        toast.error('Failed to load billing records');
      }
    } catch (error: any) {
      console.error('Error fetching billing records:', error);
      toast.error(error.response?.data?.message || 'Failed to load billing records');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintReceipt = (record: BillingRecord) => {
    navigate(`/billing/${record._id}/receipt`);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', label: 'Paid' },
      partially_paid: { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200', label: 'Partially Paid' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const columns = [
    {
      key: 'invoiceNumber',
      label: 'Invoice Number',
      render: (record: BillingRecord) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {record.invoiceNumber}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'patient',
      label: 'Patient',
      render: (record: BillingRecord) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {record.patient.firstName} {record.patient.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {record.patient.phoneNumber}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      key: 'total',
      label: 'Amount',
      render: (record: BillingRecord) => (
        <div className="font-medium text-gray-900 dark:text-white">
          {formatCurrency(record.total)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'paymentStatus',
      label: 'Status',
      render: (record: BillingRecord) => getStatusBadge(record.paymentStatus),
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (record: BillingRecord) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {formatDate(record.createdAt)}
        </div>
      ),
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (record: BillingRecord) => (
        <div className="flex space-x-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => handlePrintReceipt(record)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
          >
            Print Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/billing/${record._id}`)}
          >
            View Details
          </Button>
        </div>
      ),
      hideOnMobile: true,
    },
  ];

  const filteredRecords = billingRecords.filter(record =>
    record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${record.patient.firstName} ${record.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipts</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Print receipts for paid billing records
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/billing')}
          >
            Back to Billing
          </Button>
        </div>
      </div>

      <Card>
        <div className="mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Search by invoice number, patient name, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <DataTable
          data={filteredRecords}
          columns={columns}
          keyExtractor={(record) => record._id}
          isLoading={isLoading}
          emptyMessage="No paid billing records found"
          emptyIcon={
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
          }
        />
      </Card>

      {filteredRecords.length > 0 && (
        <Card>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing {filteredRecords.length} paid billing record{filteredRecords.length !== 1 ? 's' : ''} available for receipt printing
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReceiptsList;
