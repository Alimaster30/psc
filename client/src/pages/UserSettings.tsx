import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

interface UserSettingsData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserSettings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  
  const [userData, setUserData] = useState<UserSettingsData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });

  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load user data
  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      // Call the updateProfile function from AuthContext
      await updateProfile({
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
      });
      
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setIsChangingPassword(true);
      
      // Call API to change password
      await axios.post('/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and change your password
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit}>
          <Card className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={userData.firstName}
                  onChange={handleProfileChange}
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={userData.lastName}
                  onChange={handleProfileChange}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  value={userData.email}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Email cannot be changed. Contact an administrator for assistance.
                </p>
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={userData.phoneNumber}
                  onChange={handleProfileChange}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" variant="primary" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </Card>
        </form>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit}>
          <Card className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Change Password</h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  required
                  minLength={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Password must be at least 8 characters long
                </p>
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit" variant="primary" isLoading={isChangingPassword}>
                Change Password
              </Button>
            </div>
          </Card>
        </form>
      )}
    </div>
  );
};

export default UserSettings;
