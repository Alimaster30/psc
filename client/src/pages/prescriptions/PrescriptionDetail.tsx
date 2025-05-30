import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface Prescription {
  _id: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  doctor: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  diagnosis: string;
  medications: Medication[];
  notes: string;
  followUpDate: string;
  createdAt: string;
}

const PrescriptionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const prescriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrescription = async () => {
      try {
        setIsLoading(true);

        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/prescriptions/${id}`);
        // setPrescription(response.data);

        // For now, we'll use mock data
        const mockPrescription = {
          _id: id || '1',
          patient: {
            _id: '1',
            firstName: 'Ahmed',
            lastName: 'Khan',
            email: 'ahmed.khan@example.com',
            phoneNumber: '+92 300 1234567'
          },
          doctor: {
            _id: '1',
            firstName: 'Dr. Fatima',
            lastName: 'Ali',
            specialization: 'Dermatologist'
          },
          diagnosis: 'Contact dermatitis with secondary bacterial infection on both arms',
          medications: [
            {
              name: 'Hydrocortisone Cream 1%',
              dosage: 'Apply thin layer',
              frequency: 'Twice daily',
              duration: '2 weeks',
              instructions: 'Apply to affected areas after washing and drying the skin'
            },
            {
              name: 'Cetirizine 10mg',
              dosage: '1 tablet',
              frequency: 'Once daily',
              duration: '1 week',
              instructions: 'Take at bedtime'
            },
            {
              name: 'Fusidic Acid Cream',
              dosage: 'Apply small amount',
              frequency: 'Three times daily',
              duration: '1 week',
              instructions: 'Apply to areas with signs of infection (redness, swelling)'
            }
          ],
          notes: 'Patient should avoid contact with irritants. Wear cotton clothing and avoid scratching. Return if symptoms worsen or do not improve within 5 days.',
          followUpDate: '2023-08-15',
          createdAt: '2023-08-01T10:30:00.000Z'
        };

        setPrescription(mockPrescription);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prescription:', error);
        toast.error('Failed to load prescription');
        setIsLoading(false);
      }
    };

    if (id) {
      fetchPrescription();
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

  const handlePrint = () => {
    if (prescriptionRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Prescription</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .clinic-name { font-size: 24px; font-weight: bold; color: #4f46e5; }
          .clinic-info { font-size: 14px; color: #666; }
          .prescription-title { text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; text-decoration: underline; }
          .section { margin-bottom: 15px; }
          .section-title { font-weight: bold; margin-bottom: 5px; }
          .patient-info, .doctor-info { display: flex; justify-content: space-between; }
          .info-group { margin-bottom: 10px; }
          .label { font-weight: bold; font-size: 14px; color: #666; }
          .value { font-size: 16px; }
          .medications { margin: 20px 0; }
          .medication { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
          .medication:last-child { border-bottom: none; }
          .med-name { font-weight: bold; }
          .med-details { margin-left: 20px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; }
          .signature { margin-top: 60px; border-top: 1px solid #000; width: 200px; text-align: center; }
        `);
        printWindow.document.write('</style></head><body>');

        // Clinic Header
        printWindow.document.write(`
          <div class="header">
            <div style="text-align: center; margin-bottom: 10px;">
              <img src="/logo.png" alt="Pak Skin Care" style="width: 100px; height: 100px; object-fit: contain; margin: 0 auto; display: block;" />
            </div>
            <div class="clinic-info">Pakistan's Premier Dermatology Solution</div>
            <div class="clinic-info">123 Medical Plaza, Islamabad, Pakistan</div>
            <div class="clinic-info">Phone: +92 51 1234567 | Email: info@pakskincare.com</div>
          </div>
        `);

        // Prescription Title
        printWindow.document.write(`<div class="prescription-title">PRESCRIPTION</div>`);

        if (prescription) {
          // Patient and Doctor Info
          printWindow.document.write(`
            <div class="section">
              <div class="patient-info">
                <div class="info-group">
                  <div class="label">Patient Name:</div>
                  <div class="value">${prescription.patient.firstName} ${prescription.patient.lastName}</div>
                </div>
                <div class="info-group">
                  <div class="label">Date:</div>
                  <div class="value">${formatDate(prescription.createdAt)}</div>
                </div>
              </div>
              <div class="info-group">
                <div class="label">Contact:</div>
                <div class="value">${prescription.patient.phoneNumber}</div>
              </div>
            </div>
          `);

          // Diagnosis
          printWindow.document.write(`
            <div class="section">
              <div class="section-title">Diagnosis:</div>
              <div>${prescription.diagnosis}</div>
            </div>
          `);

          // Medications
          printWindow.document.write(`<div class="medications"><div class="section-title">Medications:</div>`);
          prescription.medications.forEach((med, index) => {
            printWindow.document.write(`
              <div class="medication">
                <div class="med-name">${index + 1}. ${med.name}</div>
                <div class="med-details">
                  <div>Dosage: ${med.dosage}</div>
                  <div>Frequency: ${med.frequency}</div>
                  <div>Duration: ${med.duration}</div>
                  ${med.instructions ? `<div>Instructions: ${med.instructions}</div>` : ''}
                </div>
              </div>
            `);
          });
          printWindow.document.write(`</div>`);

          // Notes
          if (prescription.notes) {
            printWindow.document.write(`
              <div class="section">
                <div class="section-title">Additional Notes:</div>
                <div>${prescription.notes}</div>
              </div>
            `);
          }

          // Follow-up
          if (prescription.followUpDate) {
            printWindow.document.write(`
              <div class="section">
                <div class="section-title">Follow-up Date:</div>
                <div>${formatDate(prescription.followUpDate)}</div>
              </div>
            `);
          }

          // Footer with signature
          printWindow.document.write(`
            <div class="footer">
              <div></div>
              <div>
                <div class="signature">
                  ${prescription.doctor.firstName} ${prescription.doctor.lastName}<br>
                  ${prescription.doctor.specialization}
                </div>
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
        }, 500);
      } else {
        toast.error('Unable to open print window. Please check your browser settings.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!prescription) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Prescription Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The prescription you're looking for doesn't exist or has been removed.</p>
        <Link to="/prescriptions">
          <Button variant="primary">
            Return to Prescriptions
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prescription Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Prescription for {prescription.patient.firstName} {prescription.patient.lastName} - {formatDate(prescription.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handlePrint}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
              </svg>
            }
          >
            Print Prescription
          </Button>
          {(user?.role === 'admin' || user?.role === 'dermatologist') && (
            <Button
              variant="outline"
              onClick={() => navigate(`/prescriptions/${prescription._id}/edit`)}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                </svg>
              }
            >
              Edit Prescription
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate('/prescriptions')}
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

      <Card>
        <div ref={prescriptionRef} className="space-y-6">
          {/* Patient and Doctor Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</p>
                  <p className="text-gray-900 dark:text-white">
                    {prescription.patient.firstName} {prescription.patient.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact</p>
                  <p className="text-gray-900 dark:text-white">{prescription.patient.phoneNumber}</p>
                  <p className="text-gray-900 dark:text-white">{prescription.patient.email}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Prescription Information</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Prescribed By</p>
                  <p className="text-gray-900 dark:text-white">
                    {prescription.doctor.firstName} {prescription.doctor.lastName} ({prescription.doctor.specialization})
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</p>
                  <p className="text-gray-900 dark:text-white">{formatDate(prescription.createdAt)}</p>
                </div>
                {prescription.followUpDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Follow-up Date</p>
                    <p className="text-gray-900 dark:text-white">{formatDate(prescription.followUpDate)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Diagnosis */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Diagnosis</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {prescription.diagnosis}
            </p>
          </div>

          {/* Medications */}
          <div className="pb-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Medications</h3>
            <div className="space-y-4">
              {prescription.medications.map((medication, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <div className="flex justify-between">
                    <h4 className="text-md font-medium text-gray-900 dark:text-white">
                      {index + 1}. {medication.name}
                    </h4>
                  </div>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dosage</p>
                      <p className="text-gray-700 dark:text-gray-300">{medication.dosage}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Frequency</p>
                      <p className="text-gray-700 dark:text-gray-300">{medication.frequency}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="text-gray-700 dark:text-gray-300">{medication.duration}</p>
                    </div>
                  </div>
                  {medication.instructions && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Instructions</p>
                      <p className="text-gray-700 dark:text-gray-300">{medication.instructions}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {prescription.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Notes</h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {prescription.notes}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PrescriptionDetail;
