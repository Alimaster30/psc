import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import DataTable from '../../components/common/DataTable';
import api from '../../services/api';

interface Backup {
  _id: string;
  backupId: string;
  timestamp: string;
  size: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

const BackupManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backups, setBackups] = useState<Backup[]>([]);

  // Fetch backups from API
  useEffect(() => {
    const fetchBackups = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/backups');
        setBackups(response.data.data || []);
      } catch (error: any) {
        console.error('Error fetching backups:', error);
        if (error.response?.status === 403) {
          toast.error('Access denied: Admin role required');
        } else {
          toast.error('Failed to load backup data');
        }
        setBackups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBackups();
  }, []);



  const createBackup = async () => {
    try {
      setIsCreatingBackup(true);
      toast.loading('Initiating backup process...');

      // Call the API to create a backup
      const response = await api.get('/backups/create');

      if (response.data && response.data.success) {
        // Add the new backup to the list
        const newBackup: Backup = {
          _id: response.data.data._id,
          backupId: response.data.data.backupId,
          timestamp: response.data.data.timestamp,
          size: response.data.data.size,
          status: response.data.data.status,
        };

        setBackups([newBackup, ...backups]);
        toast.dismiss();
        toast.success('Backup process initiated successfully');

        // Poll for backup completion
        const pollBackupStatus = async () => {
          try {
            const statusResponse = await api.get('/backups');
            if (statusResponse.data && statusResponse.data.success) {
              const updatedBackups = statusResponse.data.data;
              setBackups(updatedBackups);

              const completedBackup = updatedBackups.find((b: Backup) => b.backupId === newBackup.backupId);
              if (completedBackup && completedBackup.status === 'completed') {
                toast.success(`Backup ${newBackup.backupId} completed successfully`);
                return;
              } else if (completedBackup && completedBackup.status === 'failed') {
                toast.error(`Backup ${newBackup.backupId} failed`);
                return;
              }

              // Continue polling if still processing
              setTimeout(pollBackupStatus, 2000);
            }
          } catch (error) {
            console.error('Error polling backup status:', error);
          }
        };

        // Start polling after 2 seconds
        setTimeout(pollBackupStatus, 2000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Error creating backup:', error);
      toast.dismiss();
      if (error.response?.status === 403) {
        toast.error('Access denied: Admin role required');
      } else {
        toast.error('Failed to create backup');
      }
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      toast.loading(`Preparing backup ${backupId} for download...`);

      try {
        // Try to call the API
        const response = await api.get(`/backups/download/${backupId}`, {
          responseType: 'blob' // Important for file downloads
        });

        // Create a blob from the response data
        const blob = new Blob([response.data], { type: 'application/json' });

        // Create a URL for the blob
        const url = URL.createObjectURL(blob);

        // Create a link element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `prime-skin-clinic-backup-${backupId}.json`);
        link.style.display = 'none';
        document.body.appendChild(link);

        // Trigger the download
        link.click();

        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.dismiss();
        toast.success(`Backup ${backupId} downloaded successfully`);
      } catch (apiError: any) {
        console.error('Error downloading backup:', apiError);
        toast.dismiss();
        if (apiError.response?.status === 403) {
          toast.error('Access denied: Admin role required');
        } else if (apiError.response?.status === 404) {
          toast.error('Backup file not found');
        } else {
          toast.error('Failed to download backup');
        }
      }
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.dismiss();
      toast.error(`Failed to download backup ${backupId}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Backup Management</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create and manage system backups
          </p>
        </div>
        <Button
          variant="primary"
          isLoading={isCreatingBackup}
          onClick={createBackup}
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
            </svg>
          }
        >
          Create New Backup
        </Button>
      </div>

      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">Backup History</h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last backup: {backups.length > 0 ? new Date(backups[0].timestamp).toLocaleString() : 'Never'}
            </div>
          </div>

          <DataTable
            data={backups}
            isLoading={isLoading}
            emptyMessage="No backups found"
            emptyIcon={
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"></path>
              </svg>
            }
            columns={[
              {
                key: 'backupId',
                label: 'Backup ID',
                render: (backup: Backup) => (
                  <div className="font-medium text-gray-900 dark:text-white">
                    {backup.backupId}
                  </div>
                ),
                mobileLabel: 'Backup ID'
              },
              {
                key: 'timestamp',
                label: 'Date & Time',
                render: (backup: Backup) => (
                  <div className="text-gray-500 dark:text-gray-400">
                    {new Date(backup.timestamp).toLocaleString()}
                  </div>
                ),
                mobileLabel: 'Date & Time'
              },
              {
                key: 'size',
                label: 'Size',
                render: (backup: Backup) => (
                  <div className="text-gray-500 dark:text-gray-400">
                    {backup.size}
                  </div>
                ),
                mobileLabel: 'Size',
                hideOnMobile: true
              },
              {
                key: 'status',
                label: 'Status',
                render: (backup: Backup) => (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${backup.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                      backup.status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                    {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                  </span>
                ),
                mobileLabel: 'Status'
              },
              {
                key: 'actions',
                label: 'Actions',
                render: (backup: Backup) => (
                  <div className="text-right">
                    {backup.status === 'completed' && (
                      <button
                        onClick={() => downloadBackup(backup.backupId)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 font-medium"
                      >
                        Download
                      </button>
                    )}
                  </div>
                ),
                mobileLabel: 'Actions'
              }
            ]}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Backup Information</h2>
        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <p>
            <strong>What is backed up:</strong> All patient records, appointments, prescriptions, billing information, and system settings.
          </p>
          <p>
            <strong>Backup frequency:</strong> The system automatically creates a backup every day at midnight. You can also create manual backups at any time.
          </p>
          <p>
            <strong>Retention policy:</strong> Automatic backups are retained for 30 days. Manual backups are retained indefinitely.
          </p>
          <p>
            <strong>Security:</strong> All backups are encrypted using AES-256 encryption and stored securely.
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
            <div className="flex">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Important Note</h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Backups contain sensitive patient information. Always ensure that downloaded backups are stored securely and in compliance with data protection regulations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BackupManagement;
