import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsData {
  patientGrowth: {
    labels: string[];
    data: number[];
  };
  revenue: {
    labels: string[];
    data: number[];
  };
  appointmentsByStatus: {
    labels: string[];
    data: number[];
  };
  appointmentsByDoctor: {
    labels: string[];
    data: number[];
  };
  topTreatments: {
    labels: string[];
    data: number[];
  };
  patientDemographics: {
    labels: string[];
    data: number[];
  };
}

interface SummaryCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [summaryCards, setSummaryCards] = useState<SummaryCard[]>([]);

  // Check if user has permission to access this page
  if (user?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to access analytics.</p>
        <Button variant="primary" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        
        // In a real implementation, we would fetch from the API
        // const response = await api.get(`/api/analytics?timeRange=${timeRange}`);
        // setAnalyticsData(response.data);
        
        // For now, we'll use mock data
        const mockData: AnalyticsData = {
          patientGrowth: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [25, 30, 35, 40, 45, 55, 60, 65, 70, 75, 80, 85]
          },
          revenue: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            data: [50000, 60000, 55000, 65000, 70000, 75000, 80000, 85000, 90000, 95000, 100000, 110000]
          },
          appointmentsByStatus: {
            labels: ['Completed', 'Scheduled', 'Cancelled', 'No-Show'],
            data: [65, 25, 5, 5]
          },
          appointmentsByDoctor: {
            labels: ['Dr. Fatima Ali', 'Dr. Imran Ahmed', 'Dr. Zainab Khan'],
            data: [45, 35, 20]
          },
          topTreatments: {
            labels: ['Acne Treatment', 'Eczema Treatment', 'Psoriasis Treatment', 'Skin Tag Removal', 'Mole Examination'],
            data: [30, 25, 20, 15, 10]
          },
          patientDemographics: {
            labels: ['0-18', '19-35', '36-50', '51-65', '65+'],
            data: [15, 35, 25, 15, 10]
          }
        };
        
        setAnalyticsData(mockData);
        
        // Set summary cards data
        const mockSummaryCards: SummaryCard[] = [
          {
            title: 'Total Patients',
            value: '850',
            change: 12.5,
            icon: (
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            )
          },
          {
            title: 'Monthly Revenue',
            value: 'PKR 110,000',
            change: 8.3,
            icon: (
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            )
          },
          {
            title: 'Appointments',
            value: '120',
            change: 5.2,
            icon: (
              <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            )
          },
          {
            title: 'New Patients',
            value: '35',
            change: 15.0,
            icon: (
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            )
          }
        ];
        
        setSummaryCards(mockSummaryCards);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  const formatCurrency = (value: number): string => {
    return `PKR ${value.toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Data Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">There is no analytics data available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Overview of clinic performance and metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 px-4 py-2"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <Button
            variant="outline"
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
              </svg>
            }
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <Card key={index} className="flex items-center p-6">
            <div className="mr-4">
              {card.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              <p className={`text-sm ${card.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {card.change >= 0 ? '↑' : '↓'} {Math.abs(card.change)}% from last {timeRange}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Growth Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Growth</h2>
          <div className="h-80">
            <Line
              data={{
                labels: analyticsData.patientGrowth.labels,
                datasets: [
                  {
                    label: 'Total Patients',
                    data: analyticsData.patientGrowth.data,
                    borderColor: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: true
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    mode: 'index',
                    intersect: false,
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Number of Patients'
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue (PKR)</h2>
          <div className="h-80">
            <Bar
              data={{
                labels: analyticsData.revenue.labels,
                datasets: [
                  {
                    label: 'Revenue (PKR)',
                    data: analyticsData.revenue.data,
                    backgroundColor: '#10B981',
                    borderColor: '#059669',
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return formatCurrency(context.raw as number);
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Revenue (PKR)'
                    },
                    ticks: {
                      callback: function(value) {
                        return formatCurrency(value as number);
                      }
                    }
                  },
                  x: {
                    title: {
                      display: true,
                      text: 'Month'
                    }
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments by Status */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointments by Status</h2>
          <div className="h-64 flex justify-center">
            <Doughnut
              data={{
                labels: analyticsData.appointmentsByStatus.labels,
                datasets: [
                  {
                    data: analyticsData.appointmentsByStatus.data,
                    backgroundColor: [
                      '#10B981', // Completed - Green
                      '#3B82F6', // Scheduled - Blue
                      '#EF4444', // Cancelled - Red
                      '#F59E0B'  // No-Show - Yellow
                    ],
                    borderColor: [
                      '#059669',
                      '#2563EB',
                      '#DC2626',
                      '#D97706'
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Appointments by Doctor */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appointments by Doctor</h2>
          <div className="h-64 flex justify-center">
            <Doughnut
              data={{
                labels: analyticsData.appointmentsByDoctor.labels,
                datasets: [
                  {
                    data: analyticsData.appointmentsByDoctor.data,
                    backgroundColor: [
                      '#8B5CF6', // Purple
                      '#EC4899', // Pink
                      '#06B6D4'  // Cyan
                    ],
                    borderColor: [
                      '#7C3AED',
                      '#DB2777',
                      '#0891B2'
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </Card>

        {/* Patient Demographics */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Patient Age Groups</h2>
          <div className="h-64 flex justify-center">
            <Doughnut
              data={{
                labels: analyticsData.patientDemographics.labels,
                datasets: [
                  {
                    data: analyticsData.patientDemographics.data,
                    backgroundColor: [
                      '#60A5FA', // Light Blue
                      '#34D399', // Light Green
                      '#A78BFA', // Light Purple
                      '#F472B6', // Light Pink
                      '#FBBF24'  // Light Yellow
                    ],
                    borderColor: [
                      '#3B82F6',
                      '#10B981',
                      '#8B5CF6',
                      '#EC4899',
                      '#F59E0B'
                    ],
                    borderWidth: 1
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  }
                }
              }}
            />
          </div>
        </Card>
      </div>

      {/* Top Treatments */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Treatments</h2>
        <div className="h-80">
          <Bar
            data={{
              labels: analyticsData.topTreatments.labels,
              datasets: [
                {
                  label: 'Number of Treatments',
                  data: analyticsData.topTreatments.data,
                  backgroundColor: '#8B5CF6',
                  borderColor: '#7C3AED',
                  borderWidth: 1
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'y',
              plugins: {
                legend: {
                  position: 'top',
                }
              },
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Number of Treatments'
                  }
                }
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Analytics;
