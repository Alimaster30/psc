import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import api from '../../services/api';

interface Patient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface PatientImage {
  _id: string;
  imageUrl: string;
  thumbnailUrl: string;
  category: string;
  description: string;
  uploadedAt: string;
  isBefore: boolean;
}

interface ImageData {
  file: File | null;
  preview: string;
  category: string;
  description: string;
  tags: string;
  isBefore: boolean;
  relatedImageId: string;
}

const PatientImageUpload: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPatient, setIsLoadingPatient] = useState(true);
  const [isLoadingImages, setIsLoadingImages] = useState(true);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [existingImages, setExistingImages] = useState<PatientImage[]>([]);
  const [beforeImages, setBeforeImages] = useState<PatientImage[]>([]);
  const [imageData, setImageData] = useState<ImageData>({
    file: null,
    preview: '',
    category: '',
    description: '',
    tags: '',
    isBefore: true,
    relatedImageId: '',
  });

  // Fetch patient details and existing images
  useEffect(() => {
    const fetchData = async () => {
      if (!patientId) return;

      try {
        setIsLoadingPatient(true);
        setIsLoadingImages(true);

        try {
          // Fetch patient details from API
          const patientResponse = await api.get(`/patients/${patientId}`);
          setPatient(patientResponse.data.data);
        } catch (apiError) {
          console.error('Error fetching patient:', apiError);
          toast.error('Failed to load patient information');
        }

        try {
          // Fetch existing images from API
          const imagesResponse = await api.get(`/patient-images?patient=${patientId}`);
          setExistingImages(imagesResponse.data.data || []);

          // Filter out "before" images for the dropdown
          const beforeImgs = (imagesResponse.data.data || []).filter((img: PatientImage) => img.isBefore);
          setBeforeImages(beforeImgs);
        } catch (apiError) {
          console.error('Error fetching images:', apiError);
          toast.error('Failed to load existing images');
          setExistingImages([]);
          setBeforeImages([]);
        }


      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setIsLoadingPatient(false);
        setIsLoadingImages(false);
      }
    };

    fetchData();
  }, [patientId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('File loaded:', file.name, 'Size:', file.size);
      setImageData((prev) => ({
        ...prev,
        file,
        preview: reader.result as string,
      }));

      // Show success toast for better UX
      toast.success('Image selected successfully');
    };
    reader.onerror = () => {
      console.error('Error reading file');
      toast.error('Error reading file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setImageData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!imageData.file) {
      toast.error('Please select an image file');
      return;
    }

    if (!imageData.category) {
      toast.error('Please specify the category');
      return;
    }

    // If this is an "after" image, make sure a related "before" image is selected
    if (!imageData.isBefore && !imageData.relatedImageId) {
      toast.error('Please select a related "before" image');
      return;
    }

    try {
      setIsLoading(true);

      console.log('Uploading image:', imageData.file.name);

      // Create form data
      const formData = new FormData();
      formData.append('patientId', patientId || '');
      formData.append('image', imageData.file);

      formData.append('category', imageData.category);
      formData.append('description', imageData.description);
      formData.append('tags', imageData.tags);
      formData.append('isBefore', imageData.isBefore.toString());

      if (!imageData.isBefore && imageData.relatedImageId) {
        formData.append('relatedImageId', imageData.relatedImageId);
      }

      // Upload image via API
      await api.post('/patient-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Image uploaded successfully');
      navigate(`/patients/${patientId}`);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Patient Image</h1>
          {isLoadingPatient ? (
            <p className="text-gray-600 dark:text-gray-400 mt-1">Loading patient information...</p>
          ) : (
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Upload dermatology images for {patient?.firstName} {patient?.lastName}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => navigate(`/patients/${patientId}`)}
        >
          Cancel
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Upload Image *
              </label>
              <div
                className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    const file = e.dataTransfer.files[0];

                    // Check file type
                    if (!file.type.startsWith('image/')) {
                      toast.error('Please upload an image file');
                      return;
                    }

                    // Check file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error('Image size should be less than 5MB');
                      return;
                    }

                    // Create preview
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImageData((prev) => ({
                        ...prev,
                        file,
                        preview: reader.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              >
                <div className="space-y-1 text-center">
                  {imageData.preview ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={imageData.preview}
                        alt="Preview"
                        className="max-h-64 max-w-full mb-4 rounded-md"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setImageData((prev) => ({ ...prev, file: null, preview: '' }))}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex flex-col sm:flex-row items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500 px-3 py-1.5 mb-2 sm:mb-0"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Image Type *
              </label>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <input
                    id="before"
                    name="imageType"
                    type="radio"
                    checked={imageData.isBefore}
                    onChange={() => setImageData(prev => ({ ...prev, isBefore: true, relatedImageId: '' }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                  />
                  <label htmlFor="before" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Before Treatment
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="after"
                    name="imageType"
                    type="radio"
                    checked={!imageData.isBefore}
                    onChange={() => setImageData(prev => ({ ...prev, isBefore: false }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-700"
                  />
                  <label htmlFor="after" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    After Treatment
                  </label>
                </div>
              </div>
            </div>

            {/* Related Before Image (only shown for "after" images) */}
            {!imageData.isBefore && (
              <div>
                <label htmlFor="relatedImageId" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Related Before Image *
                </label>
                <select
                  id="relatedImageId"
                  name="relatedImageId"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={imageData.relatedImageId}
                  onChange={handleChange}
                >
                  <option value="">Select a before image</option>
                  {beforeImages.map(img => (
                    <option key={img._id} value={img._id}>
                      {img.category} - {img.description || 'No description'} ({new Date(img.uploadedAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                {beforeImages.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600 dark:text-yellow-400">
                    No "before" images available. Please upload a "before" image first.
                  </p>
                )}
              </div>
            )}

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Condition Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                value={imageData.category}
                onChange={handleChange}
              >
                <option value="">Select condition category</option>
                <option value="acne">Acne</option>
                <option value="eczema">Eczema</option>
                <option value="psoriasis">Psoriasis</option>
                <option value="rosacea">Rosacea</option>
                <option value="skin_cancer">Skin Cancer</option>
                <option value="vitiligo">Vitiligo</option>
                <option value="rash">Rash</option>
                <option value="allergy">Allergy</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                value={imageData.description}
                onChange={handleChange}
                placeholder="Brief description of the image"
              />
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                value={imageData.tags}
                onChange={handleChange}
                placeholder="Enter tags separated by commas (e.g., severe, chronic, treated)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/patients/${patientId}`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
            >
              Upload Image
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default PatientImageUpload;
