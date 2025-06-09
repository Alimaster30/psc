import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin' | 'receptionist' | 'dermatologist';
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setIsLoading(true);

      try {
        // Make API request using configured api instance (includes auth header automatically)
        const response = await api.get('/users');

        if (response.data && response.data.data) {
          setUsers(response.data.data);
        } else {
          console.error('API response does not have the expected format');
          toast.error('Failed to load users: Invalid response format');
        }
      } catch (apiError: any) {
        console.error('Error fetching users from API:', apiError);
        if (apiError.response?.status === 401) {
          toast.error('Please log in to view users');
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied: Admin role required');
        } else {
          toast.error('Failed to load users from the server');
        }
      }
    } catch (error) {
      console.error('Error in user management logic:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  // Removed window focus event listener as it was causing issues with undefined user IDs

  // Filter users based on search term and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Helper function to validate MongoDB ObjectId format
  const isValidObjectId = (id: string): boolean => {
    return /^[0-9a-fA-F]{24}$/.test(id);
  };

  // Toggle user active status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Validate user ID format before making API call
      if (!userId || !isValidObjectId(userId)) {
        toast.error('Invalid user ID format');
        return;
      }

      try {
        // Try to update via API using configured api instance
        await api.patch(`/users/${userId}/status`, {
          isActive: !currentStatus,
        });
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        if (apiError.response?.status === 401) {
          toast.error('Please log in to update user status');
          return;
        } else if (apiError.response?.status === 403) {
          toast.error('Access denied: Admin role required');
          return;
        } else if (apiError.response?.status === 400) {
          toast.error('Invalid user ID or request data');
          return;
        } else {
          toast.error('Failed to update user status');
          return;
        }
      }

      // Update local state
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));

      toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage staff accounts and access permissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={fetchUsers}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            }
          >
            Refresh
          </Button>
          <Link to="/users/permissions">
            <Button
              variant="outline"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                </svg>
              }
            >
              Manage Permissions
            </Button>
          </Link>
          <Link to="/users/new">
            <Button
              variant="primary"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              }
            >
              Add New Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Role
            </label>
            <select
              id="role-filter"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="dermatologist">Dermatologist</option>
              <option value="receptionist">Receptionist</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users List */}
      <DataTable
        data={filteredUsers}
        isLoading={isLoading}
        emptyMessage="No users found matching your criteria"
        emptyIcon={
          <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        }
        columns={[
          {
            key: 'name',
            label: 'Name',
            sortable: true,
            sortValue: (user: User) => `${user.firstName} ${user.lastName}`,
            render: (user: User) => (
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400 font-semibold shadow-sm">
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName} {user.lastName}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    ID: {user._id.substring(0, 8)}...
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'email',
            label: 'Email',
            sortable: true,
            sortValue: (user: User) => user.email,
            render: (user: User) => (
              <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
            )
          },
          {
            key: 'role',
            label: 'Role',
            sortable: true,
            sortValue: (user: User) => user.role,
            render: (user: User) => (
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
            )
          },
          {
            key: 'status',
            label: 'Status',
            sortable: true,
            sortValue: (user: User) => user.isActive ? 'Active' : 'Inactive',
            render: (user: User) => (
              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                ${user.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                <div className="flex items-center">
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.isActive ? 'bg-green-500 dark:bg-green-400' : 'bg-red-500 dark:bg-red-400'}`}></span>
                  {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </span>
            )
          },
          {
            key: 'lastLogin',
            label: 'Last Login',
            sortable: true,
            sortValue: (user: User) => user.lastLogin ? new Date(user.lastLogin).getTime() : 0,
            render: (user: User) => (
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.lastLogin ? (
                  <div className="flex flex-col">
                    <span>{new Date(user.lastLogin).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{new Date(user.lastLogin).toLocaleTimeString()}</span>
                  </div>
                ) : (
                  <span className="italic text-gray-400 dark:text-gray-500">Never</span>
                )}
              </div>
            )
          },
          {
            key: 'actions',
            label: 'Actions',
            render: (user: User) => (
              <div className="flex justify-end space-x-3">
                {isValidObjectId(user._id) ? (
                  <>
                    <Link
                      to={`/users/${user._id}`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      View
                    </Link>
                    <Link
                      to={`/users/${user._id}/edit`}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-amber-600 dark:text-amber-400 bg-white dark:bg-gray-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
                    >
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                      Edit
                    </Link>
                    <button
                      onClick={() => toggleUserStatus(user._id, user.isActive)}
                      className={`inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded ${
                        user.isActive
                          ? "text-red-600 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 focus:ring-red-500"
                          : "text-green-600 dark:text-green-400 bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-500"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors duration-200`}
                    >
                      {user.isActive ? (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                          </svg>
                          Deactivate
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                          Activate
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-red-500 dark:text-red-400 italic">
                    Invalid ID
                  </span>
                )}
              </div>
            )
          }
        ]}
      />
    </div>
  );
};

export default UserManagement;
