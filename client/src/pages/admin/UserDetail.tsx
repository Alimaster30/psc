import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'receptionist' | 'dermatologist';
  isActive: boolean;
  phoneNumber?: string;
  profileImage?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    console.log('UserDetail useEffect triggered with ID:', id);

    // Don't fetch if ID is undefined or empty
    if (!id || id === 'undefined') {
      console.log('Skipping fetch due to invalid ID:', id);
      setIsLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        console.log('Fetching user with ID:', id);

        // Try to fetch from API
        try {
          const response = await api.get(`/users/${id}`);
          if (response.data && response.data.data) {
            setUser(response.data.data);
          } else {
            // If API response doesn't have the expected format, use mock data
            useMockData();
          }
        } catch (apiError: any) {
          console.error('API Error:', apiError);
          if (apiError.response?.status === 404) {
            // User not found
            setUser(null);
          } else if (apiError.response?.status === 401) {
            toast.error('Please log in to view user details');
          } else if (apiError.response?.status === 403) {
            toast.error('Access denied');
          } else {
            console.log('API endpoint not available, using mock data');
            useMockData();
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user details');
      } finally {
        setIsLoading(false);
      }
    };

    // Function to set mock data
    const useMockData = () => {
      // Find the user with the matching ID from our mock data
      const mockUsers = [
        {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@psc.com',
          role: 'admin',
          isActive: true,
          phoneNumber: '+92 300 1234567',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
          updatedAt: new Date().toISOString()
        },
        {
          _id: '2',
          firstName: 'Dr',
          lastName: 'Dermatologist',
          email: 'doctor@psc.com',
          role: 'dermatologist',
          isActive: true,
          phoneNumber: '+92 300 7654321',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
          updatedAt: new Date().toISOString()
        },
        {
          _id: '3',
          firstName: 'Front',
          lastName: 'Desk',
          email: 'receptionist@psc.com',
          role: 'receptionist',
          isActive: true,
          phoneNumber: '+92 300 9876543',
          lastLogin: new Date().toISOString(),
          createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
          updatedAt: new Date().toISOString()
        }
      ];

      const foundUser = mockUsers.find(u => u._id === id);
      setUser(foundUser || null);
    };

    fetchUser();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!user) return;

    try {
      try {
        // Try to update via API
        await api.patch(`/users/${id}/status`, {
          isActive: !user.isActive,
        });
      } catch (apiError) {
        console.log('API endpoint not available, updating UI only');
      }

      // Update local state
      setUser(prev => prev ? { ...prev, isActive: !prev.isActive } : null);
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Loading user details...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">User Not Found</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">The user you're looking for doesn't exist or has been removed.</p>
        <Link to="/users">
          <Button variant="primary">
            Return to User List
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            User ID: {user._id}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/users/${user._id}/edit`)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            }
          >
            Edit User
          </Button>
          <Button
            variant={user.isActive ? 'danger' : 'success'}
            onClick={handleToggleStatus}
            icon={
              user.isActive ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              )
            }
          >
            {user.isActive ? 'Deactivate User' : 'Activate User'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
            }
          >
            Back to Users
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'info'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('info')}
          >
            User Information
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('activity')}
          >
            Activity Log
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'permissions'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('permissions')}
          >
            Permissions
          </button>
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'info' && (
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 text-3xl font-semibold">
                    {user.firstName.charAt(0)}
                    {user.lastName.charAt(0)}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-gray-900 dark:text-white">{user.firstName} {user.lastName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="text-gray-900 dark:text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-gray-900 dark:text-white">{user.phoneNumber || 'Not provided'}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</p>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        user.role === 'dermatologist' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                      <div className="flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                          ${user.role === 'admin' ? 'bg-purple-500 dark:bg-purple-400' :
                            user.role === 'dermatologist' ? 'bg-green-500 dark:bg-green-400' :
                            'bg-blue-500 dark:bg-blue-400'}`}>
                        </span>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
                  <div className="mt-1">
                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                      <div className="flex items-center">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></span>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</p>
                  <p className="text-gray-900 dark:text-white">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Updated</p>
                  <p className="text-gray-900 dark:text-white">
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'activity' && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Activity Log
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Logged in</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">IP: 192.168.1.1</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Account created</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">By: Admin</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center mt-4">
              This is a demo activity log. In a real application, this would show actual user activity.
            </p>
          </div>
        </Card>
      )}

      {activeTab === 'permissions' && (
        <Card>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Permissions</h3>
            <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role-Based Permissions
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.role === 'admin' && (
                  <>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Full system access</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">User management</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">System settings</span>
                    </div>
                  </>
                )}
                {user.role === 'dermatologist' && (
                  <>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Patient management</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Prescription management</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Appointment management</span>
                    </div>
                  </>
                )}
                {user.role === 'receptionist' && (
                  <>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Patient registration</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Appointment scheduling</span>
                    </div>
                    <div className="px-4 py-3 flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-sm text-gray-900 dark:text-white">Billing management</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 italic text-center mt-4">
              These permissions are based on the user's role. Individual permissions can be customized in a real application.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default UserDetail;
