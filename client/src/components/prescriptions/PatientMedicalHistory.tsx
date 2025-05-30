import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionHistory {
  _id: string;
  date: string;
  diagnosis: string;
  medications: Medication[];
  notes?: string;
  followUpDate?: string;
}

interface PatientMedicalHistoryProps {
  prescriptions: PrescriptionHistory[];
  isLoading: boolean;
  onCopyDiagnosis: (diagnosis: string) => void;
  onCopyMedication: (medication: Medication) => void;
}

const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({
  prescriptions,
  isLoading,
  onCopyDiagnosis,
  onCopyMedication
}) => {
  const [expandedPrescription, setExpandedPrescription] = useState<string | null>(null);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Toggle prescription expansion
  const togglePrescription = (id: string) => {
    setExpandedPrescription(expandedPrescription === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <p className="text-gray-600 dark:text-gray-400">No prescription history found for this patient.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Previous Medical History
      </h3>
      
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
        {prescriptions.map((prescription) => (
          <div 
            key={prescription._id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800"
          >
            <div 
              className="p-4 cursor-pointer flex justify-between items-center"
              onClick={() => togglePrescription(prescription._id)}
            >
              <div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Prescription - {formatDate(prescription.date)}
                  </h4>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Diagnosis: {prescription.diagnosis}
                </p>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-xs font-medium mr-3"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopyDiagnosis(prescription.diagnosis);
                  }}
                >
                  Copy Diagnosis
                </button>
                <svg 
                  className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${
                    expandedPrescription === prescription._id ? 'transform rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </div>
            </div>
            
            <AnimatePresence>
              {expandedPrescription === prescription._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 pt-0 border-t border-gray-200 dark:border-gray-700">
                    <div className="mt-3">
                      <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Medications:</h5>
                      <div className="space-y-2">
                        {prescription.medications.map((med, index) => (
                          <div 
                            key={index}
                            className="bg-gray-50 dark:bg-gray-700 p-2 rounded-md flex justify-between items-center"
                          >
                            <div>
                              <p className="text-xs font-medium text-gray-900 dark:text-white">{med.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {med.dosage}, {med.frequency} for {med.duration}
                              </p>
                              {med.instructions && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Instructions: {med.instructions}
                                </p>
                              )}
                            </div>
                            <button
                              type="button"
                              className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-xs font-medium"
                              onClick={() => onCopyMedication(med)}
                            >
                              Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {prescription.notes && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Notes:</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{prescription.notes}</p>
                      </div>
                    )}
                    
                    {prescription.followUpDate && (
                      <div className="mt-3">
                        <h5 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Follow-up Date:</h5>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{formatDate(prescription.followUpDate)}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
