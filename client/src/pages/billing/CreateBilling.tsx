import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import MultiStepForm from '../../components/common/MultiStepForm';
import { getServices, Service as ServiceType } from '../../services/serviceApi';

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
  discountType: 'amount' | 'percentage';
  discountReason: string;
  total: number;
  amountPaid: number;
  paymentStatus: 'pending' | 'partially_paid' | 'paid';
  paymentMethod: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'insurance' | 'other';
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
  const [isLoadingServices, setIsLoadingServices] = useState(true);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [serviceCategories, setServiceCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(0);
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
    discountType: 'amount',
    discountReason: '',
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

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setIsLoadingServices(true);
        const servicesData = await getServices();
        setServices(servicesData);

        // Extract unique categories
        const categories = [...new Set(servicesData.map(service => service.category))];
        setServiceCategories(categories);

        if (categories.length > 0) {
          setSelectedCategory(categories[0]);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services catalogue');
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
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
        (appointment) => appointment.patient?._id === formData.patient || appointment.patient === formData.patient
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    // Validate form
    if (!formData.patient) {
      toast.error('Please select a patient');
      setCurrentStep(0); // Go to patient selection step
      return;
    }

    // Validate services
    const validServices = formData.services.filter(
      (service) => service.name && service.amount > 0
    );

    if (validServices.length === 0) {
      toast.error('Please add at least one service with a valid amount');
      setCurrentStep(1); // Go to services step
      return;
    }

    try {
      setIsLoading(true);

      // Calculate due date (30 days from now by default)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      // Transform the data to match API expectations
      const billingData = {
        patient: formData.patient,
        appointment: formData.appointment || undefined, // Don't send empty string
        dueDate: dueDate.toISOString(),
        services: validServices.map(service => ({
          name: service.name,
          description: service.description || '',
          quantity: 1, // Default quantity
          unitPrice: service.amount,
          totalPrice: service.amount * 1, // quantity * unitPrice
        })),
        subtotal: formData.subtotal,
        tax: formData.tax || 0,
        discount: formData.discountType === 'percentage'
          ? (formData.subtotal * formData.discount) / 100
          : formData.discount || 0,
        total: formData.total,
        amountPaid: formData.amountPaid || 0,
        paymentStatus: formData.paymentStatus,
        paymentMethod: formData.paymentMethod || undefined,
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : undefined,
        notes: formData.discountReason
          ? `${formData.notes || ''}\nDiscount: ${formData.discountReason}`.trim()
          : formData.notes || '',
      };

      console.log('Sending billing data:', billingData);

      const response = await axios.post('/api/billing', billingData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      toast.success('Invoice created successfully');
      navigate(`/billing/${response.data.data._id}`);
    } catch (error: any) {
      console.error('Error creating invoice:', error);

      // More detailed error handling
      if (error.response?.data?.message) {
        toast.error(`Failed to create invoice: ${error.response.data.message}`);
      } else if (error.response?.status === 400) {
        toast.error('Invalid invoice data. Please check all fields and try again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to create invoices.');
      } else {
        toast.error('Failed to create invoice. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form completion from multi-step form
  const handleFormComplete = () => {
    handleSubmit();
  };

  // Step 1: Patient Selection
  const renderPatientSelectionStep = () => (
    <div className="space-y-6">
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
  );

  // Handle service selection
  const handleServiceSelect = (serviceId: string) => {
    const selectedService = services.find(s => s._id === serviceId);
    if (selectedService) {
      // Add the service to the form data
      const newService = {
        name: selectedService.name,
        description: selectedService.description || '',
        amount: selectedService.price,
      };

      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService],
      }));

      toast.success(`Added ${selectedService.name} to invoice`);
    }
  };

  // Step 2: Services
  const renderServicesStep = () => (
    <div className="space-y-6">
      {/* Selected Patient Info */}
      {formData.patient && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Selected Patient:</span> {patients.find(p => p._id === formData.patient)?.firstName} {patients.find(p => p._id === formData.patient)?.lastName}
          </p>
          {formData.appointment && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              <span className="font-medium">Appointment:</span> {appointments.find(a => a._id === formData.appointment)?.date} - {appointments.find(a => a._id === formData.appointment)?.startTime}
            </p>
          )}
        </div>
      )}

      {/* Service Catalogue */}
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Service Catalogue</h2>

        {/* Category Selection */}
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Category
          </label>
          <select
            id="category"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {serviceCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Services List */}
        {isLoadingServices ? (
          <div className="flex justify-center items-center py-8">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading services...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services
              .filter(service => service.category === selectedCategory)
              .map((service) => (
                <div
                  key={service._id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:border-primary-500 dark:hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => handleServiceSelect(service._id)}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">{service.name}</h3>
                    <span className="text-primary-600 dark:text-primary-400 font-semibold">PKR {service.price.toLocaleString()}</span>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{service.description}</p>
                  )}
                  <button
                    type="button"
                    className="mt-3 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleServiceSelect(service._id);
                    }}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Add to Invoice
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Selected Services */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">Selected Services *</h2>
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
            Add Custom Service
          </Button>
        </div>

        {formData.services.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-md">
            <p className="text-gray-500 dark:text-gray-400">No services added yet. Select services from the catalogue above or add a custom service.</p>
          </div>
        ) : (
          formData.services.map((service, index) => (
            <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-md mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200">
                  {service.name}
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
          ))
        )}
      </div>
    </div>
  );

  // Step 3: Payment Details
  const renderPaymentDetailsStep = () => (
    <div className="space-y-6">
      {/* Selected Patient Info */}
      {formData.patient && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Selected Patient:</span> {patients.find(p => p._id === formData.patient)?.firstName} {patients.find(p => p._id === formData.patient)?.lastName}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Services:</span> {formData.services.map(s => s.name).join(', ')}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Subtotal:</span> PKR {formData.subtotal.toFixed(2)}
          </p>
        </div>
      )}

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
                <option value="bank_transfer">Bank Transfer</option>
                <option value="insurance">Insurance</option>
                <option value="other">Other</option>
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

              {/* Enhanced Discount Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Discount</h4>

                {/* Discount Type */}
                <div>
                  <label htmlFor="discountType" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Discount Type
                  </label>
                  <select
                    id="discountType"
                    name="discountType"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="amount">Fixed Amount (PKR)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>

                {/* Discount Value */}
                <div>
                  <label htmlFor="discount" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Discount {formData.discountType === 'percentage' ? '(%)' : '(PKR)'}
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    max={formData.discountType === 'percentage' ? '100' : undefined}
                    step="0.01"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    value={formData.discount}
                    onChange={handleChange}
                  />
                </div>

                {/* Discount Reason */}
                <div>
                  <label htmlFor="discountReason" className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Discount Reason
                  </label>
                  <select
                    id="discountReason"
                    name="discountReason"
                    className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
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

                {/* Discount Amount Display */}
                {formData.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="text-xs">
                      Discount ({formData.discountType === 'percentage' ? `${formData.discount}%` : `₨${formData.discount}`}):
                    </span>
                    <span className="font-medium text-sm">
                      -₨{(formData.discountType === 'percentage'
                        ? (formData.subtotal * formData.discount) / 100
                        : formData.discount
                      ).toFixed(2)}
                    </span>
                  </div>
                )}

                {formData.discountReason && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                    Reason: {formData.discountReason}
                  </div>
                )}
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
    </div>
  );

  // Step 4: Notes and Confirmation
  const renderNotesAndConfirmationStep = () => (
    <div className="space-y-6">
      {/* Selected Patient Info */}
      {formData.patient && (
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">Selected Patient:</span> {patients.find(p => p._id === formData.patient)?.firstName} {patients.find(p => p._id === formData.patient)?.lastName}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Services:</span> {formData.services.map(s => s.name).join(', ')}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Total Amount:</span> PKR {formData.total.toFixed(2)}
          </p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
            <span className="font-medium">Payment Status:</span> {formData.paymentStatus.replace('_', ' ')}
          </p>
        </div>
      )}

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

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-200 dark:border-blue-800">
        <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">Ready to Create Invoice</h3>
        <p className="text-sm text-blue-700 dark:text-blue-400">
          Please review all the information above before creating the invoice. Once created, the invoice will be saved to the system and can be printed or emailed to the patient.
        </p>
      </div>
    </div>
  );

  // Define form steps
  const formSteps = [
    {
      title: 'Patient',
      content: renderPatientSelectionStep(),
      validate: () => {
        const errors: Record<string, string> = {};
        if (!formData.patient) {
          errors.patient = 'Please select a patient';
        }
        return errors;
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      )
    },
    {
      title: 'Services',
      content: renderServicesStep(),
      validate: () => {
        const errors: Record<string, string> = {};
        const isValidServices = formData.services.every(
          (service) => service.name && service.amount > 0
        );
        if (!isValidServices) {
          errors.services = 'Please fill in all required service fields with valid amounts';
        }
        return errors;
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
        </svg>
      )
    },
    {
      title: 'Payment',
      content: renderPaymentDetailsStep(),
      validate: () => {
        const errors: Record<string, string> = {};
        if (!formData.paymentMethod) {
          errors.paymentMethod = 'Please select a payment method';
        }
        if (!formData.paymentStatus) {
          errors.paymentStatus = 'Please select a payment status';
        }
        return errors;
      },
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    {
      title: 'Confirm',
      content: renderNotesAndConfirmationStep(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Invoice</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new invoice for patient services
          </p>
        </div>
      </div>

      <Card>
        <MultiStepForm
          steps={formSteps}
          onComplete={handleFormComplete}
          onCancel={() => navigate('/billing')}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          isSubmitting={isLoading}
          formId="billing_form"
          theme="default"
          showValidationErrors={true}
        />
      </Card>
    </div>
  );
};

export default CreateBilling;
