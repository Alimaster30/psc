import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalPatients: number;
  totalAppointments: number;
  totalPrescriptions: number;
  totalRevenue: number;
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  appointmentsByStatus: {
    status: string;
    count: number;
  }[];
  patientsByGender: {
    gender: string;
    count: number;
  }[];
  topServices: {
    name: string;
    count: number;
    revenue: number;
  }[];
}

const Analytics: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalPatients: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalRevenue: 0,
    revenueByMonth: [],
    appointmentsByStatus: [],
    patientsByGender: [],
    topServices: [],
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        // const response = await axios.get('/api/analytics');
        // setAnalyticsData(response.data);

        // Mock data for demonstration
        const mockData: AnalyticsData = {
          totalPatients: 248,
          totalAppointments: 512,
          totalPrescriptions: 387,
          totalRevenue: 1250000, // PKR
          revenueByMonth: [
            { month: 'Jan', revenue: 95000 },
            { month: 'Feb', revenue: 105000 },
            { month: 'Mar', revenue: 120000 },
            { month: 'Apr', revenue: 110000 },
            { month: 'May', revenue: 130000 },
            { month: 'Jun', revenue: 145000 },
            { month: 'Jul', revenue: 155000 },
            { month: 'Aug', revenue: 140000 },
            { month: 'Sep', revenue: 125000 },
            { month: 'Oct', revenue: 115000 },
            { month: 'Nov', revenue: 110000 },
            { month: 'Dec', revenue: 0 }, // Current month
          ],
          appointmentsByStatus: [
            { status: 'Completed', count: 387 },
            { status: 'Scheduled', count: 98 },
            { status: 'Cancelled', count: 27 },
          ],
          patientsByGender: [
            { gender: 'Male', count: 112 },
            { gender: 'Female', count: 136 },
          ],
          topServices: [
            { name: 'Skin Consultation', count: 145, revenue: 362500 },
            { name: 'Acne Treatment', count: 87, revenue: 261000 },
            { name: 'Eczema Treatment', count: 65, revenue: 195000 },
            { name: 'Psoriasis Treatment', count: 42, revenue: 168000 },
            { name: 'Skin Allergy Test', count: 38, revenue: 114000 },
          ],
        };

        setAnalyticsData(mockData);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Overview of clinic performance and key metrics
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalPatients}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalAppointments}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Prescriptions</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{analyticsData.totalPrescriptions}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">PKR {analyticsData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Monthly Revenue (PKR)</h3>
          <div className="h-64">
            <div className="flex h-full items-end">
              {analyticsData.revenueByMonth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-primary-500 dark:bg-primary-600 rounded-t"
                    style={{
                      height: `${(item.revenue / Math.max(...analyticsData.revenueByMonth.map(i => i.revenue))) * 80}%`,
                      minHeight: item.revenue > 0 ? '4px' : '0',
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.month}</div>
                  <div className="text-xs font-medium text-gray-900 dark:text-white">
                    {item.revenue > 0 ? `${(item.revenue / 1000).toFixed(0)}K` : '-'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointment Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Appointments by Status</h3>
            <div className="space-y-4">
              {analyticsData.appointmentsByStatus.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.status}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.count} ({Math.round((item.count / analyticsData.totalAppointments) * 100)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.status === 'Completed'
                          ? 'bg-green-500 dark:bg-green-600'
                          : item.status === 'Scheduled'
                          ? 'bg-blue-500 dark:bg-blue-600'
                          : 'bg-red-500 dark:bg-red-600'
                      }`}
                      style={{ width: `${(item.count / analyticsData.totalAppointments) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Patients by Gender */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Patients by Gender</h3>
            <div className="flex justify-center">
              <div className="w-48 h-48 relative">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-800">
                  <div
                    className="absolute top-0 left-0 bg-blue-500 dark:bg-blue-600 h-full"
                    style={{
                      width: '100%',
                      clipPath: `polygon(0 0, ${
                        (analyticsData.patientsByGender[0]?.count / analyticsData.totalPatients) * 100
                      }% 0, ${
                        (analyticsData.patientsByGender[0]?.count / analyticsData.totalPatients) * 100
                      }% 100%, 0 100%)`,
                    }}
                  ></div>
                  <div
                    className="absolute top-0 left-0 bg-pink-500 dark:bg-pink-600 h-full"
                    style={{
                      width: '100%',
                      clipPath: `polygon(${
                        (analyticsData.patientsByGender[0]?.count / analyticsData.totalPatients) * 100
                      }% 0, 100% 0, 100% 100%, ${
                        (analyticsData.patientsByGender[0]?.count / analyticsData.totalPatients) * 100
                      }% 100%)`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-4 space-x-8">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Male ({analyticsData.patientsByGender[0]?.count || 0})
                </span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-pink-500 dark:bg-pink-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Female ({analyticsData.patientsByGender[1]?.count || 0})
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Top Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
      >
        <Card className="bg-white dark:bg-gray-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Top Services by Revenue</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    % of Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {analyticsData.topServices.map((service, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {service.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      PKR {service.revenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {Math.round((service.revenue / analyticsData.totalRevenue) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Analytics;
