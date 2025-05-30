import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import { getBillingById } from '../../services/mockData';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

interface Service {
  name: string;
  price: number;
  quantity: number;
  discount: number;
  total: number;
}

interface Billing {
  _id: string;
  patient: Patient;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  services: Service[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const InvoiceGenerator: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [invoiceType, setInvoiceType] = useState<'detailed' | 'simple'>('detailed');
  const [includeLetterhead, setIncludeLetterhead] = useState(true);
  const [includeLogo, setIncludeLogo] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setIsLoading(true);

        // Get billing data by ID from mock data
        const mockBilling = getBillingById(id || '1');

        if (!mockBilling) {
          toast.error('Billing record not found');
          navigate('/billing');
          return;
        }

        setBilling(mockBilling);
      } catch (error) {
        console.error('Error fetching billing:', error);
        toast.error('Failed to load billing information');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchBilling();
    }
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    documentTitle: `Invoice_${billing?.invoiceNumber || 'Unknown'}`,
    onBeforeGetContent: () => {
      setIsGenerating(true);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
    },
    onAfterPrint: () => {
      setIsGenerating(false);
      toast.success('Invoice printed successfully');
    },
    onPrintError: () => {
      setIsGenerating(false);
      toast.error('Failed to print invoice');
    },
  });

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Generating PDF...');

      // In a real implementation, we would call the API to generate the PDF
      // const response = await axios.get(`/api/billing/${id}/invoice?type=${invoiceType}&letterhead=${includeLetterhead}&logo=${includeLogo}`, {
      //   responseType: 'blob',
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.dismiss();
      toast.success('PDF generated successfully');

      // In a real implementation, we would download the file
      // const url = window.URL.createObjectURL(new Blob([response.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', `Invoice_${billing?.invoiceNumber || 'Unknown'}.pdf`);
      // document.body.appendChild(link);
      // link.click();
      // link.remove();
    } catch (error) {
      toast.dismiss();
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    try {
      setIsGenerating(true);
      toast.loading('Sending invoice via email...');

      // In a real implementation, we would call the API to send the email
      // await axios.post(`/api/billing/${id}/send-invoice`, {
      //   type: invoiceType,
      //   letterhead: includeLetterhead,
      //   logo: includeLogo,
      // });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast.dismiss();
      toast.success('Invoice sent via email successfully');
    } catch (error) {
      toast.dismiss();
      console.error('Error sending invoice:', error);
      toast.error('Failed to send invoice');
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!billing) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Billing Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The billing record you're looking for doesn't exist or you don't have permission to view it.</p>
        <Button variant="primary" onClick={() => navigate('/billing')}>
          Back to Billing List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Generator</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Generate and print invoice for billing #{billing.invoiceNumber}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/billing/${id}`)}
          >
            Back to Billing
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            disabled={isGenerating}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
            }
          >
            Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Invoice Options</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice Type
                </label>
                <div className="flex space-x-4">
                  <div className="flex items-center">
                    <input
                      id="detailed"
                      name="invoiceType"
                      type="radio"
                      checked={invoiceType === 'detailed'}
                      onChange={() => setInvoiceType('detailed')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                    />
                    <label htmlFor="detailed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Detailed
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="simple"
                      name="invoiceType"
                      type="radio"
                      checked={invoiceType === 'simple'}
                      onChange={() => setInvoiceType('simple')}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                    />
                    <label htmlFor="simple" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Simple
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="letterhead"
                    name="letterhead"
                    type="checkbox"
                    checked={includeLetterhead}
                    onChange={() => setIncludeLetterhead(!includeLetterhead)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="letterhead" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Include Letterhead
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    id="logo"
                    name="logo"
                    type="checkbox"
                    checked={includeLogo}
                    onChange={() => setIncludeLogo(!includeLogo)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700 rounded"
                  />
                  <label htmlFor="logo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Include Logo
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGenerating}
                  className="w-full mb-2"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                  }
                >
                  Download PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSendEmail}
                  disabled={isGenerating}
                  className="w-full"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  }
                >
                  Send via Email
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white dark:bg-gray-800 print:shadow-none print:border-none">
            <div ref={invoiceRef} className="p-4 print:p-0">
              {/* Invoice Content */}
              <div className="max-w-4xl mx-auto">
                {/* Letterhead */}
                {includeLetterhead && (
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6 print:border-gray-300">
                    <div className="flex justify-between items-center">
                      {includeLogo && (
                        <div className="flex items-center">
                          <img
                            src="/logo.png"
                            alt="Pak Skin Care"
                            className="w-20 h-20 object-contain"
                          />
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">123 Medical Plaza, Islamabad</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">+92 51 1234567</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">info@psc.com</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 print:text-gray-700">www.psc.com</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invoice Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white print:text-black mb-1">INVOICE</h2>
                    <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                      <span className="font-medium">Invoice Number:</span> {billing.invoiceNumber}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                      <span className="font-medium">Date:</span> {formatDate(billing.date)}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                      <span className="font-medium">Due Date:</span> {formatDate(billing.dueDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      billing.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 print:bg-green-100 print:text-green-800'
                        : billing.paymentStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 print:bg-yellow-100 print:text-yellow-800'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 print:bg-red-100 print:text-red-800'
                    }`}>
                      {billing.paymentStatus.charAt(0).toUpperCase() + billing.paymentStatus.slice(1)}
                    </div>
                  </div>
                </div>

                {/* Bill To */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-black mb-2">Bill To:</h3>
                  <p className="text-gray-800 dark:text-gray-200 print:text-black font-medium">
                    {billing.patient.firstName} {billing.patient.lastName}
                  </p>
                  {billing.patient.address && (
                    <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                      {billing.patient.address.street}, {billing.patient.address.city}, {billing.patient.address.state} {billing.patient.address.postalCode}
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">{billing.patient.phoneNumber}</p>
                  <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">{billing.patient.email}</p>
                </div>

                {/* Services Table */}
                <div className="mb-8">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                        <th className="py-3 text-left text-sm font-semibold text-gray-900 dark:text-white print:text-black">Service</th>
                        {invoiceType === 'detailed' && (
                          <>
                            <th className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white print:text-black">Price</th>
                            <th className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white print:text-black">Qty</th>
                            <th className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white print:text-black">Discount</th>
                          </>
                        )}
                        <th className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white print:text-black">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billing.services.map((service, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 print:border-gray-300">
                          <td className="py-4 text-sm text-gray-800 dark:text-gray-200 print:text-black">{service.name}</td>
                          {invoiceType === 'detailed' && (
                            <>
                              <td className="py-4 text-sm text-right text-gray-800 dark:text-gray-200 print:text-black">{formatCurrency(service.price)}</td>
                              <td className="py-4 text-sm text-right text-gray-800 dark:text-gray-200 print:text-black">{service.quantity}</td>
                              <td className="py-4 text-sm text-right text-gray-800 dark:text-gray-200 print:text-black">
                                {service.discount > 0 ? formatCurrency(service.discount) : '-'}
                              </td>
                            </>
                          )}
                          <td className="py-4 text-sm text-right text-gray-800 dark:text-gray-200 print:text-black">{formatCurrency(service.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mb-8">
                  <div className="w-full md:w-1/2">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400 print:text-gray-700">Subtotal:</span>
                      <span className="text-gray-800 dark:text-gray-200 print:text-black">{formatCurrency(billing.subtotal)}</span>
                    </div>
                    {billing.discount > 0 && (
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600 dark:text-gray-400 print:text-gray-700">Discount:</span>
                        <span className="text-gray-800 dark:text-gray-200 print:text-black">-{formatCurrency(billing.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400 print:text-gray-700">Tax:</span>
                      <span className="text-gray-800 dark:text-gray-200 print:text-black">{formatCurrency(billing.tax)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-white print:text-black">Total:</span>
                      <span className="font-semibold text-gray-900 dark:text-white print:text-black">{formatCurrency(billing.total)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400 print:text-gray-700">Amount Paid:</span>
                      <span className="text-gray-800 dark:text-gray-200 print:text-black">{formatCurrency(billing.amountPaid)}</span>
                    </div>
                    {billing.balance > 0 && (
                      <div className="flex justify-between py-2 border-t border-gray-200 dark:border-gray-700 print:border-gray-300">
                        <span className="font-semibold text-gray-900 dark:text-white print:text-black">Balance Due:</span>
                        <span className="font-semibold text-red-600 dark:text-red-400 print:text-red-600">{formatCurrency(billing.balance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-black mb-2">Payment Information</h3>
                  <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                    <span className="font-medium">Method:</span> {billing.paymentMethod}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">
                    <span className="font-medium">Status:</span> {billing.paymentStatus.charAt(0).toUpperCase() + billing.paymentStatus.slice(1)}
                  </p>
                </div>

                {/* Notes */}
                {billing.notes && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white print:text-black mb-2">Notes</h3>
                    <p className="text-gray-600 dark:text-gray-400 print:text-gray-700">{billing.notes}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="text-center text-sm text-gray-500 dark:text-gray-400 print:text-gray-600 border-t border-gray-200 dark:border-gray-700 print:border-gray-300 pt-4">
                  <p>Thank you for choosing Pak Skin Care for your dermatology needs.</p>
                  <p>For any questions regarding this invoice, please contact our billing department.</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;
