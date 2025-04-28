import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Appointment {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  reason: string;
  dermatologist: {
    _id: string;
    firstName: string;
    lastName: string;
  };
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
  total: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'partially_paid' | 'paid';
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'easypaisa' | 'jazzcash' | 'bank_transfer';
  paymentDate: string;
  notes: string;
}

const CreateBilling: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    patient: '',
    appointment: '',
    services: [
      {
        name: 'Consultation',
        description: 'Regular dermatology consultation',
        amount: 2500, // Default amount in PKR
      },
    ],
    subtotal: 2500,
    tax: 0,
    discount: 0,
    total: 2500,
    amountPaid: 0,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true);
        const response = await axios.get('/api/patients');
        setPatients(response.data.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
      } finally {
        setIsLoadingPatients(false);
      }
    };

    fetchPatients();
  }, []);

  // Fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const response = await axios.get('/api/appointments');
        setAppointments(response.data.data);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        toast.error('Failed to load appointments');
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  // Filter appointments when patient changes
  useEffect(() => {
    if (formData.patient) {
      const filtered = appointments.filter(
        (appointment) => appointment.patient === formData.patient
      );
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments([]);
    }
  }, [formData.patient, appointments]);

  // Calculate totals when services, tax, or discount changes
  useEffect(() => {
    const subtotal = formData.services.reduce((sum, service) => sum + service.amount, 0);
    const taxAmount = (subtotal * formData.tax) / 100;
    const total = subtotal + taxAmount - formData.discount;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      total,
    }));
  }, [formData.services, formData.tax, formData.discount]);

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
      updatedServices[index] = {
        ...updatedServices[index],
        [name]: parseFloat(value) || 0,
      };
    } else {
      updatedServices[index] = {
        ...updatedServices[index],
        [name]: value,
      };
    }

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  const addService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: '',
          description: '',
          amount: 0,
        },
      ],
    }));
  };

  const removeService = (index: number) => {
    if (formData.services.length === 1) {
      toast.error('At least one service is required');
      return;
    }

    const updatedServices = [...formData.services];
    updatedServices.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      services: updatedServices,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!formData.patient) {
      toast.error('Please select a patient');
      return;
    }

    // Validate services
    const isValidServices = formData.services.every(
      (service) => service.name && service.amount > 0
    );

    if (!isValidServices) {
      toast.error('Please fill in all required service fields with valid amounts');
      return;
    }

    try {
      setIsLoading(true);

      const response = await axios.post('/api/billing', formData);

      toast.success('Invoice created successfully');
      navigate(`/billing/${response.data.data._id}`);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new invoice for patient services
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate('/billing')}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient and Appointment Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Patient Selection */}
            <div>
              <label htmlFor="patient" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Patient *
              </label>
              {isLoadingPatients ? (
                <select disabled className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white opacity-60">
                  <option>Loading patients...</option>
                </select>
              ) : (
                <select
                  id="patient"
                  name="patient"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.patient}
                  onChange={handleChange}
                >
                  <option value="">Select a patient</option>
                  {patients.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.firstName} {patient.lastName} ({patient.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Appointment Selection */}
            <div>
              <label htmlFor="appointment" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Related Appointment
              </label>
              {isLoadingAppointments || !formData.patient ? (
                <select
                  id="appointment"
                  name="appointment"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white opacity-60"
                >
                  <option value="">
                    {isLoadingAppointments ? 'Loading appointments...' : 'Select a patient first'}
                  </option>
                </select>
              ) : (
                <select
                  id="appointment"
                  name="appointment"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={formData.appointment}
                  onChange={handleChange}
                >
                  <option value="">No specific appointment</option>
                  {filteredAppointments.map((appointment) => (
                    <option key={appointment._id} value={appointment._id}>
                      {new Date(appointment.date).toLocaleDateString()} - {appointment.startTime} ({appointment.reason})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Services */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Services *</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addService}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                  </svg>
                }
              >
                Add Service
              </Button>
            </div>

            {formData.services.map((service, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                    Service #{index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Service Name */}
                  <div>
                    <label htmlFor={`services[${index}].name`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Service Name *
                    </label>
                    <input
                      type="text"
                      id={`services[${index}].name`}
                      name="name"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={service.name}
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label htmlFor={`services[${index}].amount`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (PKR) *
                    </label>
                    <input
                      type="number"
                      id={`services[${index}].amount`}
                      name="amount"
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                      value={service.amount}
                      onChange={(e) => handleServiceChange(index, e)}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-3">
                    <label htmlFor={`services[${index}].description`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      id={`services[${index}].description`}
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

          {/* Billing Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Payment Details</h2>

              <div className="space-y-4">
                {/* Payment Method */}
                <div>
                  <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method *
                  </label>
                  <select
                    id="paymentMethod"
                    name="paymentMethod"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="easypaisa">Easypaisa</option>
                    <option value="jazzcash">JazzCash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                  </select>
                </div>

                {/* Payment Status */}
                <div>
                  <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Status *
                  </label>
                  <select
                    id="paymentStatus"
                    name="paymentStatus"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Amount Paid */}
                <div>
                  <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Amount Paid (PKR)
                  </label>
                  <input
                    type="number"
                    id="amountPaid"
                    name="amountPaid"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.amountPaid}
                    onChange={handleChange}
                  />
                </div>

                {/* Payment Date */}
                <div>
                  <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    id="paymentDate"
                    name="paymentDate"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                    value={formData.paymentDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Invoice Summary</h2>

              <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-md border border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  {/* Subtotal */}
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-white">PKR {formData.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Tax */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="tax" className="text-gray-600 dark:text-gray-400">
                        Tax (%):
                      </label>
                      <input
                        type="number"
                        id="tax"
                        name="tax"
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-20 px-2 py-1 text-right border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.tax}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Tax Amount:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        PKR {((formData.subtotal * formData.tax) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Discount */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="discount" className="text-gray-600 dark:text-gray-400">
                        Discount (PKR):
                      </label>
                      <input
                        type="number"
                        id="discount"
                        name="discount"
                        min="0"
                        step="0.01"
                        className="w-20 px-2 py-1 text-right border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        value={formData.discount}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Total:</span>
                      <span className="font-bold text-lg text-gray-900 dark:text-white">
                        PKR {formData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className="pt-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-900 dark:text-white">Balance Due:</span>
                      <span className={`font-bold text-lg ${
                        formData.total - formData.amountPaid > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        PKR {(formData.total - formData.amountPaid).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional notes for the invoice"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/billing')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Create Invoice
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateBilling;
