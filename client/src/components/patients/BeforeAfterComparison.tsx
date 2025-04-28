import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Card from '../common/Card';

interface PatientImage {
  _id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  uploadedAt: string;
  isBefore: boolean;
}

interface ImagePair {
  before: PatientImage;
  after: PatientImage[] | null;
}

interface BeforeAfterComparisonProps {
  patientId: string;
}

const BeforeAfterComparison: React.FC<BeforeAfterComparisonProps> = ({ patientId }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imagePairs, setImagePairs] = useState<ImagePair[]>([]);
  const [selectedPair, setSelectedPair] = useState<number | null>(null);
  const [selectedAfterImage, setSelectedAfterImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchImagePairs = async () => {
      try {
        setIsLoading(true);

        try {
          // Try to fetch from API
          const response = await axios.get(`/api/patient-images/patient/${patientId}/before-after`);
          if (response.data && response.data.data) {
            setImagePairs(response.data.data);

            // Set default selections if pairs exist
            if (response.data.data.length > 0) {
              setSelectedPair(0);
              const firstPair = response.data.data[0];
              if (firstPair.after && firstPair.after.length > 0) {
                setSelectedAfterImage(firstPair.after[0]._id);
              }
            }
          } else {
            // If API response doesn't have the expected format, use mock data
            useMockData();
          }
        } catch (apiError) {
          console.log('API endpoint not available, using mock data');
          useMockData();
        }
      } catch (error) {
        console.error('Error in BeforeAfterComparison:', error);
        toast.error('Failed to load before/after images');
      } finally {
        setIsLoading(false);
      }
    };

    // Function to set mock data
    const useMockData = () => {
      // Create mock data for before/after image pairs
      const mockImagePairs: ImagePair[] = [
        {
          before: {
            _id: 'before-1',
            imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
            category: 'acne',
            description: 'Acne before treatment',
            uploadedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
            isBefore: true
          },
          after: [
            {
              _id: 'after-1',
              imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
              thumbnailUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
              category: 'acne',
              description: 'Acne after 4 weeks of treatment',
              uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
              isBefore: false
            }
          ]
        },
        {
          before: {
            _id: 'before-2',
            imageUrl: 'https://images.unsplash.com/photo-1603570388466-eb4fe5617f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1603570388466-eb4fe5617f0d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
            category: 'eczema',
            description: 'Eczema before treatment',
            uploadedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
            isBefore: true
          },
          after: [
            {
              _id: 'after-2',
              imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
              thumbnailUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=200&q=80',
              category: 'eczema',
              description: 'Eczema after 8 weeks of treatment',
              uploadedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
              isBefore: false
            }
          ]
        }
      ];

      setImagePairs(mockImagePairs);

      // Set default selections
      setSelectedPair(0);
      setSelectedAfterImage('after-1');
    };

    if (patientId) {
      fetchImagePairs();
    }
  }, [patientId]);

  const handlePairChange = (index: number) => {
    setSelectedPair(index);
    const pair = imagePairs[index];
    if (pair.after && pair.after.length > 0) {
      setSelectedAfterImage(pair.after[0]._id);
    } else {
      setSelectedAfterImage(null);
    }
  };

  const handleAfterImageChange = (imageId: string) => {
    setSelectedAfterImage(imageId);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      acne: 'Acne',
      eczema: 'Eczema',
      psoriasis: 'Psoriasis',
      rosacea: 'Rosacea',
      skin_cancer: 'Skin Cancer',
      vitiligo: 'Vitiligo',
      rash: 'Rash',
      allergy: 'Allergy',
      other: 'Other',
    };
    return categories[category] || category;
  };

  if (isLoading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Before & After Comparison</h3>
        <div className="flex flex-col justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading patient images...</p>
        </div>
      </Card>
    );
  }

  if (imagePairs.length === 0) {
    return (
      <Card>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <p className="text-gray-500 dark:text-gray-400">No before/after image pairs available</p>
        </div>
      </Card>
    );
  }

  const currentPair = selectedPair !== null ? imagePairs[selectedPair] : null;
  const currentAfterImage = currentPair?.after?.find(img => img._id === selectedAfterImage) || null;

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Before & After Comparison</h3>

      {/* Pair selector */}
      <div className="mb-4">
        <label htmlFor="pairSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Condition
        </label>
        <select
          id="pairSelector"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
          value={selectedPair !== null ? selectedPair : ''}
          onChange={(e) => handlePairChange(parseInt(e.target.value))}
        >
          {imagePairs.map((pair, index) => (
            <option key={pair.before._id} value={index}>
              {getCategoryLabel(pair.before.category)} - {pair.before.description || 'No description'}
            </option>
          ))}
        </select>
      </div>

      {currentPair && (
        <>
          {/* After image selector (if multiple after images exist) */}
          {currentPair.after && currentPair.after.length > 1 && (
            <div className="mb-4">
              <label htmlFor="afterImageSelector" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select After Image
              </label>
              <select
                id="afterImageSelector"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                value={selectedAfterImage || ''}
                onChange={(e) => handleAfterImageChange(e.target.value)}
              >
                {currentPair.after.map((afterImg) => (
                  <option key={afterImg._id} value={afterImg._id}>
                    {formatDate(afterImg.uploadedAt)} - {afterImg.description || 'No description'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Image comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Before image */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white">Before Treatment</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(currentPair.before.uploadedAt)}
                </p>
              </div>
              <div className="p-4">
                <img
                  src={currentPair.before.imageUrl}
                  alt="Before treatment"
                  className="w-full h-auto rounded-md"
                />
                <div className="mt-2">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {currentPair.before.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </div>

            {/* After image */}
            {currentAfterImage ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white">After Treatment</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(currentAfterImage.uploadedAt)}
                  </p>
                </div>
                <div className="p-4">
                  <img
                    src={currentAfterImage.imageUrl}
                    alt="After treatment"
                    className="w-full h-auto rounded-md"
                  />
                  <div className="mt-2">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {currentAfterImage.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden flex items-center justify-center p-8">
                <div className="text-center">
                  <svg className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No after treatment image available</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default BeforeAfterComparison;
