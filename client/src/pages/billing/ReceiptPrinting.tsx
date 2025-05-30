import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface Service {
  name: string;
  description: string;
  amount: number;
}

interface Billing {
  _id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  patient: Patient;
  services: Service[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'pending' | 'partially_paid' | 'paid';
  paymentMethod: string;
  paymentDate: string;
  notes: string;
  createdBy: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const ReceiptPrinting: React.FC = () => {
  const { billingId } = useParams<{ billingId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [billing, setBilling] = useState<Billing | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Mock data for preview (in a real app, this would come from the API)
  const mockBilling: Billing = {
    _id: '1',
    invoiceNumber: 'INV-20230501-001',
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    patient: {
      _id: '1',
      firstName: 'Ahmed',
      lastName: 'Khan',
      email: 'ahmed.khan@example.com',
      phoneNumber: '+92 300 1234567',
    },
    services: [
      {
        name: 'Initial Consultation',
        description: 'First-time dermatology consultation',
        amount: 2500,
      },
      {
        name: 'Skin Analysis',
        description: 'Comprehensive skin analysis and assessment',
        amount: 1500,
      },
    ],
    subtotal: 4000,
    tax: 200,
    discount: 0,
    total: 4200,
    amountPaid: 4200,
    balance: 0,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString(),
    notes: '',
    createdBy: {
      _id: '1',
      firstName: 'Fatima',
      lastName: 'Ali',
    },
  };

  // Fetch billing details
  useEffect(() => {
    const fetchBilling = async () => {
      try {
        setIsLoading(true);

        try {
          // Try to fetch from API
          const response = await axios.get(`/api/billing/${billingId}/receipt`);
          if (response.data && response.data.data) {
            setBilling(response.data.data);
          } else {
            // If API response doesn't have the expected format, use mock data
            console.log('API response format unexpected, using mock data');
            setBilling(mockBilling);
          }
        } catch (apiError) {
          console.log('API endpoint not available, using mock data');
          // Use mock data when API is not available
          setBilling(mockBilling);
        }
      } catch (error) {
        console.error('Error in fetchBilling:', error);
        // Don't show error toast, just use mock data
        setBilling(mockBilling);
      } finally {
        setIsLoading(false);
      }
    };

    if (billingId) {
      fetchBilling();
    } else {
      // If no billingId is provided, use mock data
      setBilling(mockBilling);
      setIsLoading(false);
    }
  }, [billingId]);

  // Handle print functionality
  const handlePrint = () => {
    toast.success('Preparing receipt for printing...');

    // Use browser's print functionality
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Receipt</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .clinic-name { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .clinic-info { font-size: 14px; color: #666; }
          .receipt-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 5px; }
          .patient-info, .payment-info { display: flex; justify-content: space-between; }
          .info-group { margin-bottom: 10px; }
          .label { font-weight: bold; font-size: 14px; color: #666; }
          .value { font-size: 16px; }
          .services-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .services-table th { text-align: left; padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666; }
          .services-table td { padding: 8px; border-bottom: 1px solid #eee; }
          .services-table .amount { text-align: right; }
          .totals { margin-left: auto; width: 250px; }
          .totals .row { display: flex; justify-content: space-between; padding: 5px 0; }
          .totals .total-row { font-weight: bold; border-top: 1px solid #ddd; padding-top: 8px; }
          .footer { margin-top: 40px; text-align: center; font-size: 14px; color: #666; }
          .signature { margin-top: 60px; border-top: 1px solid #000; width: 200px; text-align: center; margin-left: auto; }
        `);
        printWindow.document.write('</style></head><body>');

        // Clinic Header
        printWindow.document.write(`
          <div class="header">
            <div style="text-align: center; margin-bottom: 10px;">
              <img src="/logo.png" alt="Prime Skin Clinic" style="width: 100px; height: 100px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
            <div class="clinic-info">Pakistan's Premier Dermatology Solution</div>
            <div class="clinic-info">123 Medical Plaza, Islamabad, Pakistan</div>
            <div class="clinic-info">Phone: +92 51 1234567 | Email: info@pakskincare.com</div>
          </div>
        `);

        // Receipt Title
        printWindow.document.write(`<div class="receipt-title">RECEIPT</div>`);

        if (billing) {
          // Patient and Payment Info
          printWindow.document.write(`
            <div class="section">
              <div class="patient-info">
                <div class="info-group">
                  <div class="label">Patient Name:</div>
                  <div class="value">${billing.patient.firstName} ${billing.patient.lastName}</div>
                </div>
                <div class="info-group">
                  <div class="label">Receipt No:</div>
                  <div class="value">${billing.invoiceNumber}</div>
                </div>
              </div>
              <div class="patient-info">
                <div class="info-group">
                  <div class="label">Contact:</div>
                  <div class="value">${billing.patient.phoneNumber || 'N/A'}</div>
                </div>
                <div class="info-group">
                  <div class="label">Date:</div>
                  <div class="value">${new Date(billing.date).toLocaleDateString()}</div>
                </div>
              </div>
              <div class="patient-info">
                <div class="info-group">
                  <div class="label">Email:</div>
                  <div class="value">${billing.patient.email || 'N/A'}</div>
                </div>
                <div class="info-group">
                  <div class="label">Payment Method:</div>
                  <div class="value">${
                    billing.paymentMethod === 'credit_card' ? 'Credit Card' :
                    billing.paymentMethod === 'debit_card' ? 'Debit Card' :
                    billing.paymentMethod === 'easypaisa' ? 'Easypaisa' :
                    billing.paymentMethod === 'jazzcash' ? 'JazzCash' :
                    billing.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash'
                  }</div>
                </div>
              </div>
            </div>
          `);

          // Services Table
          printWindow.document.write(`
            <table class="services-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Description</th>
                  <th class="amount">Amount</th>
                </tr>
              </thead>
              <tbody>
          `);

          if (billing.services && billing.services.length > 0) {
            billing.services.forEach(service => {
              printWindow.document.write(`
                <tr>
                  <td>${service.name}</td>
                  <td>${service.description || ''}</td>
                  <td class="amount">PKR ${service.amount.toFixed(2)}</td>
                </tr>
              `);
            });
          } else {
            printWindow.document.write(`
              <tr>
                <td colspan="3" style="text-align: center;">No services found</td>
              </tr>
            `);
          }

          printWindow.document.write(`
              </tbody>
            </table>
          `);

          // Totals
          printWindow.document.write(`
            <div class="totals">
              <div class="row">
                <span>Subtotal:</span>
                <span>PKR ${billing.subtotal.toFixed(2)}</span>
              </div>
              <div class="row">
                <span>Tax:</span>
                <span>PKR ${billing.tax.toFixed(2)}</span>
              </div>
          `);

          if (billing.discount > 0) {
            printWindow.document.write(`
              <div class="row">
                <span>Discount:</span>
                <span>PKR ${billing.discount.toFixed(2)}</span>
              </div>
            `);
          }

          printWindow.document.write(`
              <div class="row total-row">
                <span>Total:</span>
                <span>PKR ${billing.total.toFixed(2)}</span>
              </div>
              <div class="row">
                <span>Amount Paid:</span>
                <span>PKR ${billing.amountPaid.toFixed(2)}</span>
              </div>
          `);

          if (billing.balance > 0) {
            printWindow.document.write(`
              <div class="row total-row">
                <span>Balance Due:</span>
                <span>PKR ${billing.balance.toFixed(2)}</span>
              </div>
            `);
          }

          printWindow.document.write(`</div>`);

          // Notes
          if (billing.notes) {
            printWindow.document.write(`
              <div class="section">
                <div class="section-title">Notes:</div>
                <div>${billing.notes}</div>
              </div>
            `);
          }

          // Footer with signature
          printWindow.document.write(`
            <div class="footer">
              <p>Thank you for choosing us for your dermatology needs.</p>
              <p>For any queries regarding this receipt, please contact our billing department.</p>
              <div class="signature">
                ${billing.createdBy.firstName} ${billing.createdBy.lastName}<br>
                Billing Staff
              </div>
            </div>
          `);
        }

        printWindow.document.write('</body></html>');
        printWindow.document.close();

        // Print after a short delay to ensure content is loaded
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
          toast.success('Receipt printed successfully');
        }, 500);
      } else {
        toast.error('Unable to open print window. Please check your browser settings.');
      }
    }
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Loading receipt information...</p>
          </div>
        </div>
        <Card>
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading receipt data...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receipt</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Print or download receipt for invoice #{billing?.invoiceNumber}
          </p>
        </div>
        <div className="flex space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/billing')}
          >
            Back to Billing
          </Button>
          <Button
            variant="primary"
            onClick={handlePrint}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
            }
          >
            Print Receipt
          </Button>
        </div>
      </div>

      <Card>
        <div className="bg-white p-8" ref={receiptRef}>
          {/* Receipt Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/logo.png"
                alt="Prime Skin Clinic"
                className="w-20 h-20 object-contain"
              />
            </div>
            <p className="text-gray-600">Pakistan's Premier Dermatology Solution</p>
            <p className="text-gray-600">123 Medical Plaza, Islamabad, Pakistan</p>
            <p className="text-gray-600">Phone: +92 51 1234567 | Email: info@pakskincare.com</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 underline">RECEIPT</h2>
          </div>

          {/* Receipt Details */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600 font-medium">Patient Name:</p>
                <p className="text-gray-900">
                  {billing && billing.patient ? `${billing.patient.firstName} ${billing.patient.lastName}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Receipt No:</p>
                <p className="text-gray-900">
                  {billing ? billing.invoiceNumber : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-between mb-2">
              <div>
                <p className="text-sm text-gray-600 font-medium">Contact:</p>
                <p className="text-gray-900">
                  {billing && billing.patient ? billing.patient.phoneNumber : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Date:</p>
                <p className="text-gray-900">
                  {billing && billing.date ? new Date(billing.date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Email:</p>
                <p className="text-gray-900">
                  {billing && billing.patient ? billing.patient.email : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Payment Method:</p>
                <p className="text-gray-900">
                  {billing && billing.paymentMethod ?
                    (billing.paymentMethod === 'credit_card' ? 'Credit Card' :
                     billing.paymentMethod === 'debit_card' ? 'Debit Card' :
                     billing.paymentMethod === 'easypaisa' ? 'Easypaisa' :
                     billing.paymentMethod === 'jazzcash' ? 'JazzCash' :
                     billing.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Cash')
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Services Table */}
          <table className="w-full mb-6 border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 font-medium text-gray-600">Service</th>
                <th className="text-left py-2 font-medium text-gray-600">Description</th>
                <th className="text-right py-2 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billing && billing.services && billing.services.length > 0 ? (
                billing.services.map((service, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-3 text-gray-900">{service.name}</td>
                    <td className="py-3 text-gray-600">{service.description}</td>
                    <td className="py-3 text-right text-gray-900">PKR {service.amount.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-gray-200">
                  <td colSpan={3} className="py-3 text-center text-gray-500">No services found</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">PKR {billing ? billing.subtotal.toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">PKR {billing ? billing.tax.toFixed(2) : '0.00'}</span>
              </div>
              {billing && billing.discount > 0 && (
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Discount:</span>
                  <span className="text-gray-900">PKR {billing.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-t border-gray-200 font-medium">
                <span className="text-gray-900">Total:</span>
                <span className="text-gray-900">PKR {billing ? billing.total.toFixed(2) : '0.00'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="text-green-600">PKR {billing ? billing.amountPaid.toFixed(2) : '0.00'}</span>
              </div>
              {billing && billing.balance > 0 && (
                <div className="flex justify-between py-2 font-medium">
                  <span className="text-gray-900">Balance Due:</span>
                  <span className="text-red-600">PKR {billing.balance.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {billing && billing.notes && (
            <div className="mb-6">
              <h3 className="text-gray-600 font-medium mb-2">Notes:</h3>
              <p className="text-gray-600">{billing.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-16">
            <div className="text-center text-gray-600 text-sm">
              <p>Thank you for choosing Prime Skin Clinic for your dermatology needs.</p>
              <p className="mt-1">For any queries regarding this receipt, please contact our billing department.</p>
            </div>
            <div className="flex justify-end mt-8">
              <div className="w-48 border-t border-gray-400 pt-2 text-center">
                <p className="text-gray-900">{billing?.createdBy.firstName} {billing?.createdBy.lastName}</p>
                <p className="text-gray-600 text-sm">Billing Staff</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ReceiptPrinting;
