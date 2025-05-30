// Shared mock data for billing system
export interface MockPatient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
}

export interface MockService {
  name: string;
  description: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface MockBilling {
  _id: string;
  invoiceNumber: string;
  patient: MockPatient;
  services: MockService[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  amountPaid: number;
  balance: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  paymentMethod: string;
  paymentDate: string;
  date: string;
  dueDate: string;
  notes: string;
}

// Mock patients data
export const mockPatients: MockPatient[] = [
  {
    _id: '1',
    firstName: 'Ahmed',
    lastName: 'Khan',
    email: 'ahmed.khan@example.com',
    phoneNumber: '+92 300 1234567',
    address: {
      street: '123 Main Street',
      city: 'Islamabad',
      state: 'Islamabad Capital Territory',
      postalCode: '44000'
    }
  },
  {
    _id: '2',
    firstName: 'Fatima',
    lastName: 'Ali',
    email: 'fatima.ali@example.com',
    phoneNumber: '+92 301 2345678',
    address: {
      street: '456 Garden Road',
      city: 'Lahore',
      state: 'Punjab',
      postalCode: '54000'
    }
  },
  {
    _id: '3',
    firstName: 'Muhammad',
    lastName: 'Raza',
    email: 'muhammad.raza@example.com',
    phoneNumber: '+92 302 3456789',
    address: {
      street: '789 University Avenue',
      city: 'Karachi',
      state: 'Sindh',
      postalCode: '75000'
    }
  },
  {
    _id: '4',
    firstName: 'Ayesha',
    lastName: 'Malik',
    email: 'ayesha.malik@example.com',
    phoneNumber: '+92 303 4567890',
    address: {
      street: '321 Commercial Area',
      city: 'Faisalabad',
      state: 'Punjab',
      postalCode: '38000'
    }
  },
  {
    _id: '5',
    firstName: 'Imran',
    lastName: 'Ahmed',
    email: 'imran.ahmed@example.com',
    phoneNumber: '+92 304 5678901',
    address: {
      street: '654 Model Town',
      city: 'Multan',
      state: 'Punjab',
      postalCode: '60000'
    }
  }
];

// Mock billing data
export const mockBillingData: MockBilling[] = [
  {
    _id: '1',
    invoiceNumber: 'INV-2023-001',
    patient: mockPatients[0],
    services: [
      {
        name: 'Dermatology Consultation',
        description: 'Initial consultation with dermatologist',
        price: 2500,
        quantity: 1,
        totalPrice: 2500
      },
      {
        name: 'Skin Biopsy',
        description: 'Procedure to remove a small sample of skin for testing',
        price: 5000,
        quantity: 1,
        totalPrice: 5000
      }
    ],
    subtotal: 7500,
    tax: 0,
    discount: 0,
    total: 7500,
    amountPaid: 7500,
    balance: 0,
    paymentStatus: 'paid',
    paymentMethod: 'Cash',
    paymentDate: '2023-08-01T10:30:00.000Z',
    date: '2023-08-01T10:30:00.000Z',
    dueDate: '2023-08-15T00:00:00.000Z',
    notes: 'Patient paid in full'
  },
  {
    _id: '2',
    invoiceNumber: 'INV-2023-002',
    patient: mockPatients[1],
    services: [
      {
        name: 'Acne Treatment',
        description: 'Advanced acne treatment therapy',
        price: 3500,
        quantity: 1,
        totalPrice: 3500
      },
      {
        name: 'Medication',
        description: 'Prescribed topical medication',
        price: 1500,
        quantity: 1,
        totalPrice: 1500
      }
    ],
    subtotal: 5000,
    tax: 0,
    discount: 0,
    total: 5000,
    amountPaid: 2500,
    balance: 2500,
    paymentStatus: 'partial',
    paymentMethod: 'Credit Card',
    paymentDate: '2023-08-05T14:15:00.000Z',
    date: '2023-08-05T14:15:00.000Z',
    dueDate: '2023-08-20T00:00:00.000Z',
    notes: 'Patient will pay remaining amount on next visit'
  },
  {
    _id: '3',
    invoiceNumber: 'INV-2023-003',
    patient: mockPatients[2],
    services: [
      {
        name: 'Psoriasis Treatment',
        description: 'Comprehensive psoriasis treatment plan',
        price: 6000,
        quantity: 1,
        totalPrice: 6000
      },
      {
        name: 'Topical Medication',
        description: 'Specialized topical medication for psoriasis',
        price: 2000,
        quantity: 1,
        totalPrice: 2000
      }
    ],
    subtotal: 8000,
    tax: 0,
    discount: 0,
    total: 8000,
    amountPaid: 0,
    balance: 8000,
    paymentStatus: 'unpaid',
    paymentMethod: '',
    paymentDate: '',
    date: '2023-08-10T09:45:00.000Z',
    dueDate: '2023-08-25T00:00:00.000Z',
    notes: 'Insurance claim pending'
  },
  {
    _id: '4',
    invoiceNumber: 'INV-2023-004',
    patient: mockPatients[3],
    services: [
      {
        name: 'Eczema Treatment',
        description: 'Comprehensive eczema treatment and care',
        price: 4500,
        quantity: 1,
        totalPrice: 4500
      },
      {
        name: 'Prescription Medication',
        description: 'Prescribed medication for eczema management',
        price: 2500,
        quantity: 1,
        totalPrice: 2500
      }
    ],
    subtotal: 7000,
    tax: 0,
    discount: 0,
    total: 7000,
    amountPaid: 7000,
    balance: 0,
    paymentStatus: 'paid',
    paymentMethod: 'Bank Transfer',
    paymentDate: '2023-08-12T16:20:00.000Z',
    date: '2023-08-12T16:20:00.000Z',
    dueDate: '2023-08-27T00:00:00.000Z',
    notes: 'Payment completed via bank transfer'
  },
  {
    _id: '5',
    invoiceNumber: 'INV-2023-005',
    patient: mockPatients[4],
    services: [
      {
        name: 'Skin Tag Removal',
        description: 'Professional skin tag removal procedure',
        price: 3000,
        quantity: 1,
        totalPrice: 3000
      },
      {
        name: 'Follow-up Consultation',
        description: 'Post-procedure follow-up consultation',
        price: 1500,
        quantity: 1,
        totalPrice: 1500
      }
    ],
    subtotal: 4500,
    tax: 0,
    discount: 0,
    total: 4500,
    amountPaid: 0,
    balance: 4500,
    paymentStatus: 'unpaid',
    paymentMethod: '',
    paymentDate: '',
    date: '2023-08-15T11:30:00.000Z',
    dueDate: '2023-08-30T00:00:00.000Z',
    notes: 'Payment pending'
  }
];

// Helper function to get billing data by ID
export const getBillingById = (id: string): MockBilling | null => {
  return mockBillingData.find(billing => billing._id === id) || null;
};

// Helper function to get patient by ID
export const getPatientById = (id: string): MockPatient | null => {
  return mockPatients.find(patient => patient._id === id) || null;
};
