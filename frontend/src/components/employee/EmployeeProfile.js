import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Layout from '../common/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../context/AuthContext';
import { apiService } from '../../services/api';
import { format } from 'date-fns';

const EmployeeProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState({
    totalDays: 0,
    presentDays: 0,
    lateDays: 0,
    totalHours: 0
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      // Since we have user data from auth context, we can use it
      // In a real app, you might want to fetch fresh profile data
      setProfile(user);
      setEditData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAttendanceStats = useCallback(async () => {
    try {
      const response = await apiService.getMyAttendanceRecords({
        startDate: format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      const records = response.data.records || [];
      const totalDays = records.length;
      const presentDays = records.filter(r => r.status === 'present').length;
      const lateDays = records.filter(r => r.isLate).length;
      const totalHours = records.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0);

      setAttendanceStats({
        totalDays,
        presentDays,
        lateDays,
        totalHours
      });
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    fetchProfile();
    fetchAttendanceStats();
  }, [fetchProfile, fetchAttendanceStats]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
      address: profile?.address || ''
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // In a real app, you would call an API to update the profile
      // await apiService.updateProfile(editData);
      
      // For now, just simulate the update
      const updatedProfile = { ...profile, ...editData };
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Layout title="My Profile">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile">
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center space-x-5">
              <div className="flex-shrink-0">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-3xl font-semibold text-blue-600">
                    {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.firstName} {profile?.lastName}
                    </h1>
                    <p className="text-sm text-gray-500">Employee ID: {profile?.employeeId}</p>
                    <p className="text-sm text-gray-500">Role: {profile?.role}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {profile?.createdAt ? format(new Date(profile.createdAt), 'MMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    {!isEditing ? (
                      <button
                        onClick={handleEdit}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        Edit Profile
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={editData.firstName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={editData.lastName}
                        onChange={handleInputChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={editData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Address</label>
                    <textarea
                      name="address"
                      value={editData.address}
                      onChange={handleInputChange}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.email || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{profile?.address || 'Not provided'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile?.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {profile?.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Attendance Statistics */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">This Month's Attendance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-blue-600">Total Days</dt>
                  <dd className="mt-1 text-2xl font-semibold text-blue-900">{attendanceStats.totalDays}</dd>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-green-600">Present Days</dt>
                  <dd className="mt-1 text-2xl font-semibold text-green-900">{attendanceStats.presentDays}</dd>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-yellow-600">Late Days</dt>
                  <dd className="mt-1 text-2xl font-semibold text-yellow-900">{attendanceStats.lateDays}</dd>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-purple-600">Total Hours</dt>
                  <dd className="mt-1 text-2xl font-semibold text-purple-900">
                    {Math.round(attendanceStats.totalHours)}h
                  </dd>
                </div>
              </div>
              
              {attendanceStats.totalDays > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    <p>Attendance Rate: {Math.round((attendanceStats.presentDays / attendanceStats.totalDays) * 100)}%</p>
                    <p>Average Hours/Day: {Math.round(attendanceStats.totalHours / attendanceStats.totalDays * 10) / 10}h</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeProfile;
