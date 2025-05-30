import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { getBillingById } from '../../services/mockData';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Service {
  name: string;
  description: string;
  amount: number;
}

interface FormData {
  patient: string;
  appointment: string;
  services: Service[];
  subtotal: number;
  tax: number;
  discount: number;
  discountType: 'amount' | 'percentage';
  discountReason: string;
  total: number;
  amountPaid: number;
  paymentStatus: string;
  paymentMethod: string;
  paymentDate: string;
  notes: string;
}

interface BillingData {
  _id: string;
  invoiceNumber: string;
  patient: Patient;
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
  amountPaid: number;
  balance: number;
  paymentStatus: string;
  paymentMethod?: string;
  paymentDate?: string;
  notes?: string;
  date: string;
  dueDate: string;
}

const EditBilling: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [billing, setBilling] = useState<BillingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    patient: '',
    appointment: '',
    services: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    discountType: 'amount',
    discountReason: '',
    total: 0,
    amountPaid: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Check if user has permission
  if (user?.role !== 'admin' && user?.role !== 'receptionist') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to edit billing records.</p>
        <Button variant="primary" onClick={() => navigate('/billing')}>
          Return to Billing
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchBilling = async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        // Get billing data by ID from mock data
        const mockBillingData = getBillingById(id);

        if (!mockBillingData) {
          toast.error('Billing record not found');
          navigate('/billing');
          return;
        }

        setBilling(mockBillingData);

        // Convert billing data to form format
        setFormData({
          patient: mockBillingData.patient._id,
          appointment: mockBillingData.appointment || '',
          services: mockBillingData.services.map((service: any) => ({
            name: service.name,
            description: service.description || '',
            amount: service.totalPrice,
          })),
          subtotal: mockBillingData.subtotal,
          tax: mockBillingData.tax,
          discount: mockBillingData.discount,
          discountType: 'amount',
          discountReason: mockBillingData.notes?.includes('Discount:')
            ? mockBillingData.notes.split('Discount:')[1]?.split('\n')[0]?.trim() || ''
            : '',
          total: mockBillingData.total,
          amountPaid: mockBillingData.amountPaid,
          paymentStatus: mockBillingData.paymentStatus,
          paymentMethod: mockBillingData.paymentMethod || 'cash',
          paymentDate: mockBillingData.paymentDate
            ? new Date(mockBillingData.paymentDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
          notes: mockBillingData.notes || '',
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching billing:', error);
        toast.error('Failed to load billing information');
        navigate('/billing');
      }
    };

    fetchBilling();
  }, [id, navigate]);

  // Calculate totals when services, tax, or discount changes
  useEffect(() => {
    const subtotal = formData.services.reduce((sum, service) => sum + service.amount, 0);
    const taxAmount = (subtotal * formData.tax) / 100;

    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = (subtotal * formData.discount) / 100;
    } else {
      discountAmount = formData.discount;
    }

    const total = Math.max(0, subtotal + taxAmount - discountAmount);

    setFormData((prev) => ({
      ...prev,
      subtotal,
      total,
    }));
  }, [formData.services, formData.tax, formData.discount, formData.discountType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'tax' || name === 'discount' || name === 'amountPaid') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseFloat(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleServiceChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedServices = [...formData.services];

    if (name === 'amount') {
      updatedServices[index] = { ...updatedServices[index], [name]: parseFloat(value) || 0 };
    } else {
      updatedServices[index] = { ...updatedServices[index], [name]: value };
    }

    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: '', description: '', amount: 0 }],
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData((prev) => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!billing) return;

    try {
      setIsSubmitting(true);

      // Prepare the update data
      const updateData = {
        services: formData.services.map(service => ({
          name: service.name,
          description: service.description,
          quantity: 1,
          unitPrice: service.amount,
          totalPrice: service.amount,
        })),
        subtotal: formData.subtotal,
        tax: formData.tax,
        discount: formData.discountType === 'percentage'
          ? (formData.subtotal * formData.discount) / 100
          : formData.discount,
        total: formData.total,
        amountPaid: formData.amountPaid,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        notes: formData.discountReason
          ? `${formData.notes}\nDiscount: ${formData.discountReason}`.trim()
          : formData.notes,
      };

      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Billing updated successfully');
      navigate('/billing');
    } catch (error: any) {
      console.error('Error updating billing:', error);
      toast.error(error.response?.data?.message || 'Failed to update billing');
    } finally {
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

  if (!billing) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Billing Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The requested billing record could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/billing')}>
          Return to Billing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Invoice</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Invoice #{billing.invoiceNumber} - {billing.patient.firstName} {billing.patient.lastName}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/billing')}>
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Patient Info (Read-only) */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Patient Information</h3>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Name:</span> {billing.patient.firstName} {billing.patient.lastName}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Email:</span> {billing.patient.email}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Invoice Date:</span> {new Date(billing.date).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-medium">Due Date:</span> {new Date(billing.dueDate).toLocaleDateString()}
            </p>
          </div>

          {/* Services Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Services</h3>
              <Button type="button" variant="secondary" onClick={addService}>
                Add Service
              </Button>
            </div>

            <div className="space-y-4">
              {formData.services.map((service, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">Service {index + 1}</h4>
                    {formData.services.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeService(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Service Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                        value={service.name}
                        onChange={(e) => handleServiceChange(index, e)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Amount (PKR) *
                      </label>
                      <input
                        type="number"
                        name="amount"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                        value={service.amount}
                        onChange={(e) => handleServiceChange(index, e)}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                        value={service.description}
                        onChange={(e) => handleServiceChange(index, e)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Discount Section */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Discount & Pricing</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* Discount Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Type
                  </label>
                  <select
                    name="discountType"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="amount">Fixed Amount (PKR)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount {formData.discountType === 'percentage' ? '(%)' : '(PKR)'}
                  </label>
                  <input
                    type="number"
                    name="discount"
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>

                {/* Discount Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Discount Reason
                  </label>
                  <select
                    name="discountReason"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.discountReason}
                    onChange={handleChange}
                  >
                    <option value="">No discount</option>
                    <option value="Senior Citizen Discount">Senior Citizen Discount</option>
                    <option value="Student Discount">Student Discount</option>
                    <option value="Loyal Customer Discount">Loyal Customer Discount</option>
                    <option value="First Visit Discount">First Visit Discount</option>
                    <option value="Bundle Package Discount">Bundle Package Discount</option>
                    <option value="Insurance Coverage">Insurance Coverage</option>
                    <option value="Staff Discount">Staff Discount</option>
                    <option value="Promotional Offer">Promotional Offer</option>
                    <option value="Referral Discount">Referral Discount</option>
                    <option value="Hardship Case">Hardship Case</option>
                  </select>
                </div>

                {/* Tax */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tax (%)
                  </label>
                  <input
                    type="number"
                    name="tax"
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.tax}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Pricing Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">Invoice Summary</h4>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">₨{formData.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tax ({formData.tax}%):</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₨{((formData.subtotal * formData.tax) / 100).toLocaleString()}
                    </span>
                  </div>

                  {formData.discount > 0 && (
                    <div className="flex justify-between text-green-600 dark:text-green-400">
                      <span>
                        Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : `₨${formData.discount}`}):
                      </span>
                      <span className="font-medium">
                        -₨{(formData.discountType === 'percentage'
                          ? (formData.subtotal * formData.discount) / 100
                          : formData.discount
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {formData.discountReason && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                      Reason: {formData.discountReason}
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        ₨{formData.total.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Amount Paid:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        ₨{formData.amountPaid.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Balance Due:</span>
                      <span className={`font-bold text-lg ${
                        formData.total - formData.amountPaid > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        ₨{(formData.total - formData.amountPaid).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status *
                </label>
                <select
                  name="paymentStatus"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.paymentStatus}
                  onChange={handleChange}
                >
                  <option value="pending">Pending</option>
                  <option value="partially_paid">Partially Paid</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="insurance">Insurance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount Paid (PKR)
                </label>
                <input
                  type="number"
                  name="amountPaid"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.amountPaid}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  name="paymentDate"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.paymentDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes for this invoice..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/billing')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Invoice'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default EditBilling;
