import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { permissionAPI } from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RolePermission {
  role: 'admin' | 'dermatologist' | 'receptionist';
  permissions: string[];
  description: string;
}

const RolePermissions: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'dermatologist' | 'receptionist'>('admin');
  const [modules, setModules] = useState<string[]>([]);

  // Default fallback data
  const defaultPermissions: Permission[] = [
    // User Management
    { id: 'user_view', name: 'View Users', description: 'View user list and details', module: 'User Management' },
    { id: 'user_create', name: 'Create Users', description: 'Create new user accounts', module: 'User Management' },
    { id: 'user_edit', name: 'Edit Users', description: 'Edit user information', module: 'User Management' },
    { id: 'user_delete', name: 'Delete Users', description: 'Delete user accounts', module: 'User Management' },

    // Patient Management
    { id: 'patient_view', name: 'View Patients', description: 'View patient list and basic information', module: 'Patient Management' },
    { id: 'patient_create', name: 'Create Patients', description: 'Register new patients', module: 'Patient Management' },
    { id: 'patient_edit', name: 'Edit Patients', description: 'Edit patient information', module: 'Patient Management' },
    { id: 'patient_medical_view', name: 'View Medical Records', description: 'View patient medical history', module: 'Patient Management' },
    { id: 'patient_medical_edit', name: 'Edit Medical Records', description: 'Edit patient medical information', module: 'Patient Management' },

    // Appointment Management
    { id: 'appointment_view', name: 'View Appointments', description: 'View appointment schedules', module: 'Appointment Management' },
    { id: 'appointment_create', name: 'Create Appointments', description: 'Schedule new appointments', module: 'Appointment Management' },
    { id: 'appointment_edit', name: 'Edit Appointments', description: 'Modify appointment details', module: 'Appointment Management' },
    { id: 'appointment_delete', name: 'Delete Appointments', description: 'Cancel appointments', module: 'Appointment Management' },
    { id: 'appointment_complete', name: 'Complete Appointments', description: 'Mark appointments as completed', module: 'Appointment Management' },

    // Prescription Management
    { id: 'prescription_view', name: 'View Prescriptions', description: 'View prescription records', module: 'Prescription Management' },
    { id: 'prescription_create', name: 'Create Prescriptions', description: 'Write new prescriptions', module: 'Prescription Management' },
    { id: 'prescription_edit', name: 'Edit Prescriptions', description: 'Modify prescriptions', module: 'Prescription Management' },

    // Billing Management
    { id: 'billing_view', name: 'View Billing', description: 'View billing records', module: 'Billing Management' },
    { id: 'billing_create', name: 'Create Bills', description: 'Generate new bills', module: 'Billing Management' },
    { id: 'billing_payment', name: 'Process Payments', description: 'Record payment transactions', module: 'Billing Management' },

    // System Administration
    { id: 'system_settings', name: 'System Settings', description: 'Configure system settings', module: 'System Administration' },
    { id: 'backup_management', name: 'Backup Management', description: 'Manage system backups', module: 'System Administration' },
    { id: 'audit_logs', name: 'Audit Logs', description: 'View system audit logs', module: 'System Administration' },
    { id: 'analytics_view', name: 'View Analytics', description: 'Access analytics dashboard', module: 'Analytics' },
  ];

  const defaultRolePermissions: RolePermission[] = [
    {
      role: 'admin',
      permissions: defaultPermissions.map(p => p.id),
      description: 'Full system access with all permissions'
    },
    {
      role: 'dermatologist',
      permissions: [
        'patient_view', 'patient_medical_view', 'patient_medical_edit',
        'appointment_view', 'appointment_complete',
        'prescription_view', 'prescription_create', 'prescription_edit',
        'analytics_view'
      ],
      description: 'Medical staff with access to patient records and prescriptions'
    },
    {
      role: 'receptionist',
      permissions: [
        'patient_view', 'patient_create', 'patient_edit',
        'appointment_view', 'appointment_create', 'appointment_edit', 'appointment_delete',
        'billing_view', 'billing_create', 'billing_payment',
        'prescription_view'
      ],
      description: 'Front desk staff with access to appointments and billing'
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('Starting to fetch permissions data...');

        // First, set fallback data immediately to ensure something is always shown
        setPermissions(defaultPermissions);
        setRolePermissions(defaultRolePermissions);
        const uniqueModules = Array.from(new Set(defaultPermissions.map(p => p.module))) as string[];
        setModules(uniqueModules);

        // Try to fetch from API to override defaults if available
        try {
          const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
            permissionAPI.getPermissions(),
            permissionAPI.getRolePermissions()
          ]);

          console.log('API responses:', { permissionsResponse, rolePermissionsResponse });

          if (permissionsResponse.data.success && rolePermissionsResponse.data.success) {
            const fetchedPermissions = permissionsResponse.data.data;
            const fetchedRolePermissions = rolePermissionsResponse.data.data;

            if (fetchedPermissions.length > 0 && fetchedRolePermissions.length > 0) {
              console.log('Using API data');
              setPermissions(fetchedPermissions);
              setRolePermissions(fetchedRolePermissions);

              // Extract unique modules
              const apiModules = Array.from(new Set(fetchedPermissions.map((p: Permission) => p.module))) as string[];
              setModules(apiModules);
              toast.success('Permissions loaded from server');
            } else {
              console.log('API returned empty data, using defaults');
              toast.success('Using default permissions configuration');
            }
          } else {
            throw new Error('Invalid API response format');
          }
        } catch (apiError: any) {
          console.log('API fetch failed, trying initialization...', apiError);

          // Try to initialize permissions
          try {
            toast.loading('Initializing permissions system...');
            const initResponse = await permissionAPI.initializePermissions();
            console.log('Initialize response:', initResponse);

            // Retry fetching after initialization
            const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
              permissionAPI.getPermissions(),
              permissionAPI.getRolePermissions()
            ]);

            if (permissionsResponse.data.success && rolePermissionsResponse.data.success) {
              const fetchedPermissions = permissionsResponse.data.data;
              const fetchedRolePermissions = rolePermissionsResponse.data.data;

              if (fetchedPermissions.length > 0 && fetchedRolePermissions.length > 0) {
                setPermissions(fetchedPermissions);
                setRolePermissions(fetchedRolePermissions);
                const apiModules = Array.from(new Set(fetchedPermissions.map((p: Permission) => p.module))) as string[];
                setModules(apiModules);
                toast.dismiss();
                toast.success('Permissions system initialized successfully');
              } else {
                throw new Error('Initialization returned empty data');
              }
            } else {
              throw new Error('Failed to fetch after initialization');
            }
          } catch (initError: any) {
            console.log('Initialization failed, using defaults:', initError);
            toast.dismiss();
            toast.success('Using default permissions configuration');
            // Defaults are already set above
          }
        }

        setIsLoading(false);
      } catch (error: any) {
        console.error('Unexpected error in fetchData:', error);
        // Ensure defaults are set even in case of unexpected errors
        setPermissions(defaultPermissions);
        setRolePermissions(defaultRolePermissions);
        const uniqueModules = Array.from(new Set(defaultPermissions.map(p => p.module))) as string[];
        setModules(uniqueModules);
        setIsLoading(false);
        toast.error('Using default permissions due to error');
      }
    };

    fetchData();
  }, []);

  const handleRoleChange = (role: 'admin' | 'dermatologist' | 'receptionist') => {
    setSelectedRole(role);
  };

  const handlePermissionToggle = (permissionId: string) => {
    const currentRolePermission = rolePermissions.find(rp => rp.role === selectedRole);
    
    if (!currentRolePermission) return;
    
    const updatedPermissions = currentRolePermission.permissions.includes(permissionId)
      ? currentRolePermission.permissions.filter(id => id !== permissionId)
      : [...currentRolePermission.permissions, permissionId];
    
    setRolePermissions(rolePermissions.map(rp =>
      rp.role === selectedRole
        ? { ...rp, permissions: updatedPermissions }
        : rp
    ));
  };

  const handleModuleToggle = (module: string) => {
    const modulePermissionIds = permissions
      .filter(p => p.module === module)
      .map(p => p.id);
    
    const currentRolePermission = rolePermissions.find(rp => rp.role === selectedRole);
    
    if (!currentRolePermission) return;
    
    // Check if all permissions in this module are already selected
    const allSelected = modulePermissionIds.every(id => 
      currentRolePermission.permissions.includes(id)
    );
    
    // If all are selected, remove all. Otherwise, add all.
    const updatedPermissions = allSelected
      ? currentRolePermission.permissions.filter(id => !modulePermissionIds.includes(id))
      : [...new Set([...currentRolePermission.permissions, ...modulePermissionIds])];
    
    setRolePermissions(rolePermissions.map(rp =>
      rp.role === selectedRole
        ? { ...rp, permissions: updatedPermissions }
        : rp
    ));
  };

  const handleSavePermissions = async () => {
    try {
      setIsSaving(true);

      // Call the API to save role permissions
      await permissionAPI.updateRolePermissions(rolePermissions);

      toast.success('Role permissions saved successfully');
      setIsSaving(false);
    } catch (error: any) {
      console.error('Error saving permissions:', error);
      toast.error(error.response?.data?.message || 'Failed to save permissions');
      setIsSaving(false);
    }
  };

  const isModuleFullySelected = (module: string) => {
    const currentRolePermission = rolePermissions.find(rp => rp.role === selectedRole);
    
    if (!currentRolePermission) return false;
    
    const modulePermissionIds = permissions
      .filter(p => p.module === module)
      .map(p => p.id);
    
    return modulePermissionIds.every(id => 
      currentRolePermission.permissions.includes(id)
    );
  };

  const isPermissionSelected = (permissionId: string) => {
    const currentRolePermission = rolePermissions.find(rp => rp.role === selectedRole);
    return currentRolePermission?.permissions.includes(permissionId) || false;
  };

  // Show loading overlay only for initial load
  if (isLoading && permissions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Role Permissions</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Configure access permissions for each user role
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => navigate('/users')}
          >
            Back to Users
          </Button>
          <Button
            variant="primary"
            onClick={handleSavePermissions}
            disabled={isSaving}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            }
          >
            {isSaving ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Roles</h2>
            <div className="space-y-2">
              <button
                className={`w-full text-left px-4 py-3 rounded-md ${
                  selectedRole === 'admin'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleRoleChange('admin')}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-3"></div>
                  <span>Admin</span>
                </div>
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-md ${
                  selectedRole === 'dermatologist'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleRoleChange('dermatologist')}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                  <span>Dermatologist</span>
                </div>
              </button>
              <button
                className={`w-full text-left px-4 py-3 rounded-md ${
                  selectedRole === 'receptionist'
                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => handleRoleChange('receptionist')}
              >
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-3"></div>
                  <span>Receptionist</span>
                </div>
              </button>
            </div>
            
            <div className="mt-6">
              <h3 className="text-md font-medium text-gray-900 dark:text-white mb-2">Role Description</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {rolePermissions.find(rp => rp.role === selectedRole)?.description}
              </p>
            </div>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Permissions for {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
            </h2>
            
            <div className="space-y-6">
              {modules.map(module => (
                <div key={module} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      id={`module-${module}`}
                      checked={isModuleFullySelected(module)}
                      onChange={() => handleModuleToggle(module)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600 dark:checked:border-primary-600 rounded"
                    />
                    <label htmlFor={`module-${module}`} className="ml-2 block text-lg font-medium text-gray-900 dark:text-white">
                      {module}
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
                    {permissions
                      .filter(p => p.module === module)
                      .map(permission => (
                        <div key={permission.id} className="flex items-start">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={isPermissionSelected(permission.id)}
                            onChange={() => handlePermissionToggle(permission.id)}
                            className="h-4 w-4 mt-1 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-primary-600 dark:checked:border-primary-600 rounded"
                          />
                          <label htmlFor={`permission-${permission.id}`} className="ml-2 block">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{permission.name}</span>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{permission.description}</p>
                          </label>
                        </div>
                      ))
                    }
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="primary"
                onClick={handleSavePermissions}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RolePermissions;
