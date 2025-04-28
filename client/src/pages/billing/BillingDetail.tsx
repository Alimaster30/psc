import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  address?: string;
}

interface Service {
  name: string;
  description?: string;
  price: number;
  quantity: number;
}

interface Payment {
  _id: string;
  amount: number;
  method: string;
  date: string;
  reference?: string;
  notes?: string;
}

interface Invoice {
  _id: string;
  invoiceNumber: string;
  patient: Patient;
  services: Service[];
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  payments: Payment[];
  notes?: string;
  createdAt: string;
  dueDate: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const BillingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const fetchInvoice = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/invoices/${id}`);
        // setInvoice(response.data);

        // For now, we'll use mock data
        const mockInvoice: Invoice = {
          _id: id || '1',
          invoiceNumber: 'INV-2023-001',
          patient: {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567',
            address: '123 Main Street, Islamabad, Pakistan'
          },
          services: [
            {
              name: 'Dermatology Consultation',
              description: 'Initial consultation with dermatologist',
              price: 2500,
              quantity: 1
            },
            {
              name: 'Skin Biopsy',
              description: 'Procedure to remove a small sample of skin for testing',
              price: 5000,
              quantity: 1
            }
          ],
          totalAmount: 7500,
          paidAmount: 5000,
          status: 'partial' as const,
          payments: [
            {
              _id: 'p1',
              amount: 5000,
              method: 'Cash',
              date: '2023-08-01T10:30:00.000Z',
              notes: 'Initial payment'
            }
          ],
          notes: 'Patient will pay remaining amount on next visit',
          createdAt: '2023-08-01T10:30:00.000Z',
          dueDate: '2023-08-15T00:00:00.000Z',
          createdBy: {
            _id: '5',
            firstName: 'Sara',
            lastName: 'Malik'
          }
        };

        setInvoice(mockInvoice);
        setPaymentAmount(mockInvoice.totalAmount - mockInvoice.paidAmount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast.error('Failed to load invoice details');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
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

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoice) return;

    if (paymentAmount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (paymentAmount > (invoice.totalAmount - invoice.paidAmount)) {
      toast.error('Payment amount cannot exceed the remaining balance');
      return;
    }

    try {
      setIsSubmitting(true);

      // In a real implementation, we would call the API
      // await api.post(`/api/invoices/${id}/payments`, {
      //   amount: paymentAmount,
      //   method: paymentMethod,
      //   reference: paymentReference,
      //   notes: paymentNotes
      // });

      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update local state
      const newPayment: Payment = {
        _id: `p${Date.now()}`,
        amount: paymentAmount,
        method: paymentMethod,
        date: new Date().toISOString(),
        reference: paymentReference,
        notes: paymentNotes
      };

      const newPaidAmount = invoice.paidAmount + paymentAmount;
      const newStatus = newPaidAmount >= invoice.totalAmount ? 'paid' : 'partial';

      setInvoice({
        ...invoice,
        paidAmount: newPaidAmount,
        status: newStatus as 'paid' | 'partial' | 'unpaid',
        payments: [...invoice.payments, newPayment]
      });

      setIsPaymentModalOpen(false);
      setPaymentAmount(0);
      setPaymentMethod('cash');
      setPaymentReference('');
      setPaymentNotes('');

      toast.success('Payment recorded successfully');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invoice Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The invoice you're looking for doesn't exist or has been removed.</p>
        <Link to="/billing">
          <Button variant="primary">
            Return to Billing
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {invoice.invoiceNumber} - {formatDate(invoice.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/billing/${invoice._id}/receipt`)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
            }
          >
            Print Receipt
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/billing/${invoice._id}/invoice`)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            }
          >
            Generate Invoice
          </Button>
          {invoice.status !== 'paid' && (
            <Button
              variant="primary"
              onClick={() => setIsPaymentModalOpen(true)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              }
            >
              Record Payment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/billing')}
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
        {/* Invoice Information */}
        <Card className="md:col-span-2">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Invoice Information</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {invoice.invoiceNumber}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(invoice.status)}`}>
              {invoice.status === 'paid' ? 'Paid' :
               invoice.status === 'partial' ? 'Partially Paid' : 'Unpaid'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created Date</p>
              <p className="text-gray-900 dark:text-white">{formatDateTime(invoice.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-gray-900 dark:text-white">{formatDate(invoice.dueDate)}</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</p>
            <p className="text-gray-900 dark:text-white">{invoice.createdBy.firstName} {invoice.createdBy.lastName}</p>
          </div>

          {invoice.notes && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
              <p className="text-gray-900 dark:text-white whitespace-pre-line">{invoice.notes}</p>
            </div>
          )}
        </Card>

        {/* Patient Information */}
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h2>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-900 dark:text-white">
                {invoice.patient.firstName} {invoice.patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
              <p className="text-gray-900 dark:text-white">{invoice.patient.phoneNumber}</p>
              <p className="text-gray-900 dark:text-white">{invoice.patient.email}</p>
            </div>
            {invoice.patient.address && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                <p className="text-gray-900 dark:text-white whitespace-pre-line">{invoice.patient.address}</p>
              </div>
            )}
            <div className="pt-4">
              <Link to={`/patients/${invoice.patient._id}`}>
                <Button variant="outline" size="sm" className="w-full">
                  View Patient Profile
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Services</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
            <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Service</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3 text-right">Price</th>
                <th scope="col" className="px-6 py-3 text-center">Quantity</th>
                <th scope="col" className="px-6 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.services.map((service, index) => (
                <tr
                  key={index}
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                >
                  <td className="px-6 py-4 font-medium">
                    {service.name}
                  </td>
                  <td className="px-6 py-4">
                    {service.description || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(service.price)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {service.quantity}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {formatCurrency(service.price * service.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={4} className="px-6 py-4 text-right font-medium">
                  Subtotal
                </td>
                <td className="px-6 py-4 text-right font-medium">
                  {formatCurrency(invoice.totalAmount)}
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={4} className="px-6 py-4 text-right font-medium">
                  Paid Amount
                </td>
                <td className="px-6 py-4 text-right font-medium text-green-600 dark:text-green-400">
                  {formatCurrency(invoice.paidAmount)}
                </td>
              </tr>
              <tr className="bg-gray-50 dark:bg-gray-700">
                <td colSpan={4} className="px-6 py-4 text-right font-medium">
                  Balance Due
                </td>
                <td className="px-6 py-4 text-right font-medium text-red-600 dark:text-red-400">
                  {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>

      {/* Payment History */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Payment History</h2>

        {invoice.payments.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">No payments recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 dark:text-gray-300">
              <thead className="text-xs text-gray-600 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Method</th>
                  <th scope="col" className="px-6 py-3">Reference</th>
                  <th scope="col" className="px-6 py-3">Notes</th>
                </tr>
              </thead>
              <tbody>
                {invoice.payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                  >
                    <td className="px-6 py-4">
                      {formatDateTime(payment.date)}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-6 py-4">
                      {payment.method}
                    </td>
                    <td className="px-6 py-4">
                      {payment.reference || '-'}
                    </td>
                    <td className="px-6 py-4">
                      {payment.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleRecordPayment}>
                <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
                        Record Payment
                      </h3>

                      <div className="space-y-4">
                        <div>
                          <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Amount <span className="text-red-600">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 dark:text-gray-400">PKR</span>
                            </div>
                            <input
                              type="number"
                              id="paymentAmount"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(Number(e.target.value))}
                              min={1}
                              max={invoice.totalAmount - invoice.paidAmount}
                              step={1}
                              required
                              className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                            />
                          </div>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Remaining balance: {formatCurrency(invoice.totalAmount - invoice.paidAmount)}
                          </p>
                        </div>

                        <div>
                          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Payment Method <span className="text-red-600">*</span>
                          </label>
                          <select
                            id="paymentMethod"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                          >
                            <option value="cash">Cash</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="debit_card">Debit Card</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="mobile_payment">Mobile Payment</option>
                            <option value="other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Reference Number
                          </label>
                          <input
                            type="text"
                            id="paymentReference"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Transaction ID, check number, etc."
                          />
                        </div>

                        <div>
                          <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Notes
                          </label>
                          <textarea
                            id="paymentNotes"
                            rows={3}
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                            placeholder="Any additional information about this payment"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    disabled={paymentAmount <= 0 || paymentAmount > (invoice.totalAmount - invoice.paidAmount)}
                    className="ml-3"
                  >
                    Record Payment
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPaymentModalOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingDetail;
