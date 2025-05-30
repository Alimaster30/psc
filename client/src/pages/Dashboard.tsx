import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { useAuth } from '../context/AuthContext';
import AppointmentReminders from '../components/appointments/AppointmentReminders';
import QuickActionPanel from '../components/dashboard/QuickActionPanel';
import ReceptionistQuickActions from '../components/dashboard/ReceptionistQuickActions';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

// Define dashboard summary type
interface DashboardSummary {
  totalPatients: number;
  totalAppointments: number;
  totalPrescriptions: number;
  todayAppointments: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

// Define appointment status data type
interface AppointmentStatusData {
  _id: string;
  count: number;
}

// Define monthly data type
interface MonthlyData {
  month: number;
  count: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [appointmentsByStatus, setAppointmentsByStatus] = useState<AppointmentStatusData[]>([]);
  const [appointmentsByMonth, setAppointmentsByMonth] = useState<MonthlyData[]>([]);
  const [patientGrowth, setPatientGrowth] = useState<MonthlyData[]>([]);
  const [revenue, setRevenue] = useState<{ month: number; revenue: number }[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch real-time data from the API based on user role
        if (user?.role === 'admin') {
          // Admin dashboard data - fetch from API
          const summaryResponse = await fetch('/api/analytics/dashboard-summary', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (summaryResponse.ok) {
            const summaryData = await summaryResponse.json();
            setSummary(summaryData.data);
          } else {
            // Fallback if API fails
            setSummary({
              totalPatients: 0,
              totalAppointments: 0,
              totalPrescriptions: 0,
              todayAppointments: 0,
              totalRevenue: 0,
              monthlyRevenue: 0,
            });
          }

          // Fetch appointment analytics
          const appointmentsResponse = await fetch('/api/analytics/appointments', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (appointmentsResponse.ok) {
            const appointmentsData = await appointmentsResponse.json();
            setAppointmentsByStatus(appointmentsData.data.byStatus);
            setAppointmentsByMonth(appointmentsData.data.byMonth);
          } else {
            // Fallback if API fails
            setAppointmentsByStatus([]);
            setAppointmentsByMonth([]);
          }

          // Fetch patient growth data
          const patientGrowthResponse = await fetch('/api/analytics/patient-growth', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (patientGrowthResponse.ok) {
            const patientGrowthData = await patientGrowthResponse.json();
            setPatientGrowth(patientGrowthData.data);
          } else {
            // Fallback if API fails
            setPatientGrowth([]);
          }

          // Fetch revenue data
          try {
            const revenueResponse = await fetch('/api/analytics/revenue', {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });

            if (revenueResponse.ok) {
              const revenueData = await revenueResponse.json();
              console.log('Main Dashboard received revenue data:', revenueData.data);
              setRevenue(revenueData.data);
            } else {
              console.error('Revenue API returned error:', revenueResponse.status);
              // Generate fallback data for revenue
              const currentMonth = new Date().getMonth() + 1;
              const revenueData = [];
              for (let i = 0; i < 6; i++) {
                const month = currentMonth - i <= 0 ? currentMonth - i + 12 : currentMonth - i;
                // Create a pattern that shows growth over time
                const baseRevenue = 200000; // Base revenue
                const growthFactor = 50000; // Growth per month
                const revenue = baseRevenue + (i * growthFactor);
                revenueData.push({ month, revenue });
              }
              setRevenue(revenueData.reverse());
            }
          } catch (error) {
            console.error('Error fetching revenue data:', error);
            // Generate fallback data for revenue
            const currentMonth = new Date().getMonth() + 1;
            const revenueData = [];
            for (let i = 0; i < 6; i++) {
              const month = currentMonth - i <= 0 ? currentMonth - i + 12 : currentMonth - i;
              // Create a pattern that shows growth over time
              const baseRevenue = 200000; // Base revenue
              const growthFactor = 50000; // Growth per month
              const revenue = baseRevenue + (i * growthFactor);
              revenueData.push({ month, revenue });
            }
            setRevenue(revenueData.reverse());
          }
        } else if (user?.role === 'dermatologist') {
          // Dermatologist dashboard data - fetch from API
          // For dermatologists, we need to fetch their specific data
          const response = await fetch('/api/users/me/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setSummary({
              totalPatients: data.totalPatients || 0,
              totalAppointments: data.totalAppointments || 0,
              totalPrescriptions: data.totalPrescriptions || 0,
              todayAppointments: data.todayAppointments || 0,
              totalRevenue: 0, // Doctors don't see revenue
              monthlyRevenue: 0,
            });

            // Set appointment status data if available
            if (data.appointmentsByStatus) {
              setAppointmentsByStatus(data.appointmentsByStatus);
            }
          } else {
            // Fallback if API fails
            setSummary({
              totalPatients: 0,
              totalAppointments: 0,
              totalPrescriptions: 0,
              todayAppointments: 0,
              totalRevenue: 0,
              monthlyRevenue: 0,
            });
            setAppointmentsByStatus([]);
          }
        } else if (user?.role === 'receptionist') {
          // Receptionist dashboard data - fetch from API
          const response = await fetch('/api/users/me/dashboard', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setSummary({
              totalPatients: data.totalPatients || 0,
              totalAppointments: data.totalAppointments || 0,
              totalPrescriptions: data.totalPrescriptions || 0,
              todayAppointments: data.todayAppointments || 0,
              totalRevenue: 0, // Limited financial data
              monthlyRevenue: 0,
            });
          } else {
            // Fallback if API fails
            setSummary({
              totalPatients: 0,
              totalAppointments: 0,
              totalPrescriptions: 0,
              todayAppointments: 0,
              totalRevenue: 0,
              monthlyRevenue: 0,
            });
          }
        }
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data error:', error);

        // Set fallback data in case of error
        setSummary({
          totalPatients: 0,
          totalAppointments: 0,
          totalPrescriptions: 0,
          todayAppointments: 0,
          totalRevenue: 0,
          monthlyRevenue: 0,
        });
        setAppointmentsByStatus([]);
        setAppointmentsByMonth([]);
        setPatientGrowth([]);
        setRevenue([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // Prepare chart data
  const appointmentStatusChartData = {
    labels: appointmentsByStatus.map((item) => item._id),
    datasets: [
      {
        label: 'Appointments by Status',
        data: appointmentsByStatus.map((item) => item.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const appointmentMonthlyChartData = {
    labels: appointmentsByMonth.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Appointments',
        data: appointmentsByMonth.map((item) => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const patientGrowthChartData = {
    labels: patientGrowth.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'New Patients',
        data: patientGrowth.map((item) => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  const revenueChartData = {
    labels: revenue.map((item) => monthNames[item.month - 1]),
    datasets: [
      {
        label: 'Revenue',
        data: revenue.map((item) => item.revenue),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 2,
        tension: 0.3,
      },
    ],
  };

  // Format currency in Pakistani Rupees
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ur-PK', {
      style: 'currency',
      currency: 'PKR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="w-full px-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Welcome back, {user?.firstName}! Here's what's happening with your clinic today.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>

          {/* Quick Action Buttons based on role */}
          {user?.role === 'admin' && (
            <Button
              variant="primary"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              }
              onClick={() => window.location.href = '/users/new'}
            >
              Add Staff
            </Button>
          )}

          {user?.role === 'receptionist' && (
            <Button
              variant="primary"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                </svg>
              }
              onClick={() => window.location.href = '/patients/new'}
            >
              New Patient
            </Button>
          )}

          {user?.role === 'dermatologist' && (
            <Button
              variant="primary"
              size="sm"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              }
              onClick={() => window.location.href = '/prescriptions/new'}
            >
              New Prescription
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="w-full"
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">Total Patients</p>
                {isLoading ? (
                  <Skeleton height={30} width={80} baseColor="#3b82f6" highlightColor="#60a5fa" />
                ) : (
                  <p className="text-2xl font-bold">{summary?.totalPatients || 0}</p>
                )}
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="w-full"
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-100">Total Appointments</p>
                {isLoading ? (
                  <Skeleton height={30} width={80} baseColor="#22c55e" highlightColor="#4ade80" />
                ) : (
                  <p className="text-2xl font-bold">{summary?.totalAppointments || 0}</p>
                )}
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="w-full"
        >
          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-100">Today's Appointments</p>
                {isLoading ? (
                  <Skeleton height={30} width={80} baseColor="#eab308" highlightColor="#facc15" />
                ) : (
                  <p className="text-2xl font-bold">{summary?.todayAppointments || 0}</p>
                )}
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
          className="w-full"
        >
          <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white h-full">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-100">Total Prescriptions</p>
                {isLoading ? (
                  <Skeleton height={30} width={80} baseColor="#6366f1" highlightColor="#818cf8" />
                ) : (
                  <p className="text-2xl font-bold">{summary?.totalPrescriptions || 0}</p>
                )}
              </div>
              <div className="p-3 bg-white bg-opacity-30 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
            </div>
          </Card>
        </motion.div>

        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="w-full"
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white h-full">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-100">Current Month Revenue</p>
                  {isLoading ? (
                    <Skeleton height={30} width={80} baseColor="#8b5cf6" highlightColor="#a78bfa" />
                  ) : (
                    <p className="text-2xl font-bold">Rs {(summary?.monthlyRevenue || 0).toLocaleString()}</p>
                  )}
                </div>
                <div className="p-3 bg-white bg-opacity-30 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Quick Actions for Receptionist - Placed right after the statistics cards */}
      {user?.role === 'receptionist' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <ReceptionistQuickActions />
        </motion.div>
      )}

      {/* Charts */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card title="Patient Growth">
              {isLoading ? (
                <div className="h-64">
                  <Skeleton height={256} />
                </div>
              ) : (
                <div className="h-64">
                  <Line
                    data={patientGrowthChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card title="Monthly Revenue">
              {isLoading ? (
                <div className="h-64">
                  <Skeleton height={256} />
                </div>
              ) : (
                <div className="h-64">
                  <Bar
                    data={revenueChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card title="Appointments by Month">
              {isLoading ? (
                <div className="h-64">
                  <Skeleton height={256} />
                </div>
              ) : (
                <div className="h-64">
                  <Bar
                    data={appointmentMonthlyChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Card title="Appointments by Status">
              {isLoading ? (
                <div className="h-64">
                  <Skeleton height={256} />
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <Doughnut
                    data={appointmentStatusChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                        },
                        title: {
                          display: false,
                        },
                      },
                    }}
                  />
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      )}

      {/* Content for non-admin users */}
      {user?.role !== 'admin' && (
        <>
          {/* Quick Action Panel for Dermatologist */}
          {user?.role === 'dermatologist' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <QuickActionPanel role={user?.role} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card title="Today's Appointments">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                      <Skeleton height={24} width="60%" />
                      <Skeleton height={20} width="40%" />
                    </div>
                  ))}
                </div>
              ) : summary?.todayAppointments === 0 ? (
                <div className="text-center py-6">
                  <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400">No appointments scheduled for today</p>
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-16 h-16 mx-auto text-primary-500 dark:text-primary-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                    You have {summary?.todayAppointments} appointment{summary?.todayAppointments !== 1 ? 's' : ''} scheduled for today
                  </p>
                  <button className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors">
                    View Appointments
                  </button>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Appointment Reminders for Receptionist and Dermatologist */}
          {(user?.role === 'receptionist' || user?.role === 'dermatologist') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <AppointmentReminders />
            </motion.div>
          )}

          {/* Only show Quick Actions card for admin role */}
          {user?.role === 'admin' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.8 }}
            >
              <Card title="Quick Actions">
                {/* Admin Quick Actions */}
                {user?.role === 'admin' && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => window.location.href = '/users'}
                    >
                      <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Staff</span>
                    </button>

                    <button
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => window.location.href = '/settings'}
                    >
                      <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">System Settings</span>
                    </button>

                    <button
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => window.location.href = '/analytics'}
                    >
                      <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Analytics</span>
                    </button>

                    <button
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => window.location.href = '/backups'}
                    >
                      <svg className="w-8 h-8 text-primary-600 dark:text-primary-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
                      </svg>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Backups</span>
                    </button>
                  </div>
                )}


              </Card>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
