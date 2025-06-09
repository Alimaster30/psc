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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch permissions from API
        const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
          permissionAPI.getPermissions(),
          permissionAPI.getRolePermissions()
        ]);

        if (permissionsResponse.data.success && rolePermissionsResponse.data.success) {
          const fetchedPermissions = permissionsResponse.data.data;
          const fetchedRolePermissions = rolePermissionsResponse.data.data;

          setPermissions(fetchedPermissions);
          setRolePermissions(fetchedRolePermissions);

          // Extract unique modules
          const uniqueModules = Array.from(new Set(fetchedPermissions.map((p: Permission) => p.module))) as string[];
          setModules(uniqueModules);
          setIsLoading(false);
          return;
        }

        // If we reach here, there was an issue with the API response
        throw new Error('Invalid API response');
      } catch (error: any) {
        console.error('Error fetching permissions data:', error);

        // Always try to initialize permissions if there's any error
        try {
          console.log('Attempting to initialize permissions system...');
          toast.loading('Initializing permissions system...');

          const initResponse = await permissionAPI.initializePermissions();
          console.log('Initialize response:', initResponse);

          toast.dismiss();
          toast.success('Permissions system initialized successfully');

          // Retry fetching data after initialization
          const [permissionsResponse, rolePermissionsResponse] = await Promise.all([
            permissionAPI.getPermissions(),
            permissionAPI.getRolePermissions()
          ]);

          console.log('Permissions response:', permissionsResponse);
          console.log('Role permissions response:', rolePermissionsResponse);

          if (permissionsResponse.data.success && rolePermissionsResponse.data.success) {
            const fetchedPermissions = permissionsResponse.data.data;
            const fetchedRolePermissions = rolePermissionsResponse.data.data;

            console.log('Fetched permissions:', fetchedPermissions);
            console.log('Fetched role permissions:', fetchedRolePermissions);

            setPermissions(fetchedPermissions);
            setRolePermissions(fetchedRolePermissions);

            // Extract unique modules
            const uniqueModules = Array.from(new Set(fetchedPermissions.map((p: Permission) => p.module))) as string[];
            setModules(uniqueModules);
          } else {
            console.error('Invalid response format after initialization');
            toast.error('Invalid response format from server');
          }
        } catch (initError: any) {
          console.error('Error initializing permissions:', initError);
          toast.error(`Failed to initialize permissions: ${initError.response?.data?.message || initError.message}`);
        }

        setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
