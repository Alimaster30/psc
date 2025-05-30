import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
}

interface PatientSearchComboboxProps {
  onPatientSelect: (patientId: string) => void;
  selectedPatientId?: string;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

const PatientSearchCombobox: React.FC<PatientSearchComboboxProps> = ({
  onPatientSelect,
  selectedPatientId,
  placeholder = 'Search patients by name, phone, or email',
  label = 'Select Patient',
  required = false,
  className = ''
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const comboboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Get selected patient details
  const selectedPatient = patients.find(p => p._id === selectedPatientId);

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/patients');
        setPatients(response.data.data);
        setFilteredPatients(response.data.data);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('Failed to load patients');
        
        // Fallback to mock data if API fails
        const mockPatients = [
          {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567',
            dateOfBirth: '1985-05-15',
            gender: 'male'
          },
          {
            _id: '2',
            firstName: 'Fatima',
            lastName: 'Ali',
            email: 'fatima.ali@example.com',
            phoneNumber: '+92 321 9876543',
            dateOfBirth: '1990-08-22',
            gender: 'female'
          },
          {
            _id: '3',
            firstName: 'Imran',
            lastName: 'Ahmed',
            email: 'imran.ahmed@example.com',
            phoneNumber: '+92 333 5556666',
            dateOfBirth: '1978-12-10',
            gender: 'male'
          },
          {
            _id: '4',
            firstName: 'Ayesha',
            lastName: 'Malik',
            email: 'ayesha.malik@example.com',
            phoneNumber: '+92 311 2223333',
            dateOfBirth: '1995-03-25',
            gender: 'female'
          },
          {
            _id: '5',
            firstName: 'Zainab',
            lastName: 'Hussain',
            email: 'zainab.h@example.com',
            phoneNumber: '+92 345 6789012',
            dateOfBirth: '1988-11-30',
            gender: 'female'
          }
        ];
        setPatients(mockPatients);
        setFilteredPatients(mockPatients);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  // Filter patients based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowercasedSearch = searchTerm.toLowerCase();
      const filtered = patients.filter(patient => {
        const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase();
        const phone = patient.phoneNumber || '';
        const email = patient.email.toLowerCase();

        return (
          fullName.includes(lowercasedSearch) ||
          phone.includes(lowercasedSearch) ||
          email.includes(lowercasedSearch)
        );
      });
      setFilteredPatients(filtered);
    }
    
    // Reset highlighted index when search changes
    setHighlightedIndex(-1);
  }, [searchTerm, patients]);

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return `${age} years`;
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPatients.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handlePatientSelect(filteredPatients[highlightedIndex]._id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Scroll to highlighted patient
  useEffect(() => {
    if (highlightedIndex >= 0 && listboxRef.current) {
      const highlightedElement = listboxRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [highlightedIndex]);

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    onPatientSelect(patientId);
    setIsDropdownOpen(false);
    
    // Set search term to selected patient's name
    const patient = patients.find(p => p._id === patientId);
    if (patient) {
      setSearchTerm(`${patient.firstName} ${patient.lastName}`);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    // Open dropdown when typing
    if (!isDropdownOpen) {
      setIsDropdownOpen(true);
    }
    
    // Clear selected patient if search term is cleared
    if (e.target.value === '' && selectedPatientId) {
      onPatientSelect('');
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative" ref={comboboxRef}>
        {label && (
          <label htmlFor="patient-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}

        {/* Combobox input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            id="patient-search"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:text-white sm:text-sm"
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onClick={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            aria-expanded={isDropdownOpen}
            aria-autocomplete="list"
            aria-controls="patient-listbox"
            autoComplete="off"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              className="h-5 w-5 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              aria-label="Toggle dropdown"
            >
              <svg className={`transition-transform ${isDropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <div 
            id="patient-listbox"
            ref={listboxRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
            role="listbox"
          >
            {isLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500 dark:text-gray-400">No patients found</p>
              </div>
            ) : (
              filteredPatients.map((patient, index) => (
                <div
                  key={patient._id}
                  className={`px-4 py-2 cursor-pointer ${
                    index === highlightedIndex
                      ? 'bg-primary-100 dark:bg-primary-900/30'
                      : selectedPatientId === patient._id
                      ? 'bg-gray-50 dark:bg-gray-700/50'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                  }`}
                  onClick={() => handlePatientSelect(patient._id)}
                  role="option"
                  aria-selected={selectedPatientId === patient._id}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                        {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {patient.gender && patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)} • {calculateAge(patient.dateOfBirth)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                      <p>{patient.phoneNumber}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientSearchCombobox;
