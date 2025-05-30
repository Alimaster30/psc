import axios from 'axios';

export interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  process?: string;
  bundleOptions?: {
    sessions: number;
    price: number;
    savings: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const getServices = async (): Promise<Service[]> => {
  try {
    const response = await axios.get('/api/services');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching services:', error);
    throw error;
  }
};

export const getServicesByCategory = async (category: string): Promise<Service[]> => {
  try {
    const response = await axios.get(`/api/services/category/${category}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching services for category ${category}:`, error);
    throw error;
  }
};

export const getServiceById = async (id: string): Promise<Service> => {
  try {
    const response = await axios.get(`/api/services/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching service with id ${id}:`, error);
    throw error;
  }
};

export const getServiceCategories = async (): Promise<string[]> => {
  try {
    const services = await getServices();
    const categories = [...new Set(services.map(service => service.category))];
    return categories;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
};
