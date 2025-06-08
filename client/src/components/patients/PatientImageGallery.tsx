import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { patientImageAPI } from '../../services/api';
import Card from '../common/Card';
import Button from '../common/Button';

interface PatientImage {
  _id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  uploadedAt: string;
  isBefore: boolean;
  tags: string[];
  metadata: {
    originalFilename: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  };
}

interface PatientImageGalleryProps {
  patientId: string;
}

const PatientImageGallery: React.FC<PatientImageGalleryProps> = ({ patientId }) => {
  const [images, setImages] = useState<PatientImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<PatientImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'before' | 'after'>('all');

  // Get the API base URL for image display
  const getImageUrl = (imageUrl: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://prime-skin-clinic-api.onrender.com/api';
    const baseUrl = apiBaseUrl.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  };

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setIsLoading(true);
        const response = await patientImageAPI.getPatientImages({ patient: patientId });
        setImages(response.data.data || []);
      } catch (error) {
        console.error('Error fetching patient images:', error);
        toast.error('Failed to load patient images');
        setImages([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (patientId) {
      fetchImages();
    }
  }, [patientId]);

  const filteredImages = images.filter(image => {
    if (filter === 'before') return image.isBefore;
    if (filter === 'after') return !image.isBefore;
    return true;
  });

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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <Card>
        <div className="flex flex-col justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading patient images...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter buttons */}
      <div className="flex space-x-2">
        <Button
          variant={filter === 'all' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All Images ({images.length})
        </Button>
        <Button
          variant={filter === 'before' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('before')}
        >
          Before ({images.filter(img => img.isBefore).length})
        </Button>
        <Button
          variant={filter === 'after' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setFilter('after')}
        >
          After ({images.filter(img => !img.isBefore).length})
        </Button>
      </div>

      {filteredImages.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="text-gray-500 dark:text-gray-400">
              {filter === 'all' ? 'No images uploaded yet' : `No ${filter} treatment images found`}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image) => (
            <Card key={image._id}>
              <div className="space-y-4">
                {/* Image */}
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  <img
                    src={getImageUrl(image.imageUrl)}
                    alt={`${image.isBefore ? 'Before' : 'After'} treatment - ${image.category}`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                    onClick={() => setSelectedImage(image)}
                    onError={(e) => {
                      console.error('Image failed to load:', getImageUrl(image.imageUrl));
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBMMTMwIDEwMEgxMTBWMTMwSDkwVjEwMEg3MEwxMDAgNzBaIiBmaWxsPSIjOUI5QjlCIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOUI5QjlCIiBmb250LXNpemU9IjEyIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+Cjwvc3ZnPg==';
                    }}
                  />
                </div>

                {/* Image info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      image.isBefore 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {image.isBefore ? 'Before' : 'After'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(image.uploadedAt)}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {getCategoryLabel(image.category)}
                    </h4>
                    {image.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {image.description}
                      </p>
                    )}
                  </div>

                  {image.tags && image.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {image.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Image modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {getCategoryLabel(selectedImage.category)} - {selectedImage.isBefore ? 'Before' : 'After'} Treatment
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Uploaded on {formatDate(selectedImage.uploadedAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <img
                  src={getImageUrl(selectedImage.imageUrl)}
                  alt={`${selectedImage.isBefore ? 'Before' : 'After'} treatment`}
                  className="max-w-full max-h-96 mx-auto rounded-lg"
                />
              </div>

              {selectedImage.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Description</h4>
                  <p className="text-gray-700 dark:text-gray-300">{selectedImage.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">File Size:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {formatFileSize(selectedImage.metadata.fileSize)}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">Dimensions:</span>
                  <span className="ml-2 text-gray-600 dark:text-gray-400">
                    {selectedImage.metadata.width}×{selectedImage.metadata.height}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientImageGallery;
