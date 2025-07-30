import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../common/Layout';
import LoadingSpinner from '../common/LoadingSpinner';
import { apiService } from '../../services/api';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState({
    totalDays: 0,
    presentDays: 0,
    totalHours: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch today's attendance
      const todayResponse = await apiService.getMyAttendanceRecords({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      const todayRecord = todayResponse.data.data.records?.[0] || null;
      setTodayAttendance(todayRecord);
      
      // Fetch this week's stats
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      
      const weekResponse = await apiService.getMyAttendanceRecords({
        startDate: format(weekStart, 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      });
      
      const weekRecords = weekResponse.data.data.records || [];
      const totalDays = weekRecords.length;
      const presentDays = weekRecords.filter(r => r.status === 'present').length;
      const totalHours = weekRecords.reduce((sum, r) => sum + (r.totalHoursWorked || 0), 0);
      
      setWeeklyStats({
        totalDays,
        presentDays,
        totalHours
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user?.employeeId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const todayDate = format(new Date(), 'EEEE, MMMM dd, yyyy');
  const currentTimeStr = format(currentTime, 'HH:mm:ss');

  return (
    <Layout title="Employee Dashboard">
      <div className="space-y-6">
        {/* Welcome Card */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-blue-600">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </span>
                </div>
              </div>
              <div className="ml-5">
                <h2 className="text-lg font-medium text-gray-900">
                  Welcome back, {user?.firstName} {user?.lastName}!
                </h2>
                <p className="text-sm text-gray-500">
                  Employee ID: {user?.employeeId}
                </p>
                <p className="text-sm text-gray-500">
                  {todayDate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Time */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current Time</h3>
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {currentTimeStr}
            </div>
            <p className="text-sm text-gray-500">{todayDate}</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Clock In Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Start Your Day
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Clock In
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/employee/clock-in"
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex justify-center"
                >
                  Clock In Now
                </Link>
              </div>
            </div>
          </div>

          {/* Clock Out Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      End Your Day
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Clock Out
                    </dd>
                  </dl>
                </div>
              </div>
              <div className="mt-5">
                <Link
                  to="/employee/clock-out"
                  className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium inline-flex justify-center"
                >
                  Clock Out Now
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance Status */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Status</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Status
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {todayAttendance ? (
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          todayAttendance.status === 'present' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {todayAttendance.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                        {todayAttendance.isLate && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Late
                          </span>
                        )}
                      </div>
                    ) : (
                      'Not Clocked In'
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Hours Today
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {todayAttendance ? (
                      `${Math.floor(todayAttendance.totalHoursWorked || 0)}h ${Math.round(((todayAttendance.totalHoursWorked || 0) % 1) * 60)}m`
                    ) : (
                      '0h 0m'
                    )}
                  </dd>
                </div>
                <div className="bg-gray-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    This Week
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-gray-900">
                    {`${Math.floor(weeklyStats.totalHours)}h ${Math.round((weeklyStats.totalHours % 1) * 60)}m`}
                  </dd>
                </div>
              </div>
            )}
            
            {/* Clock In/Out Times */}
            {todayAttendance && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-md font-medium text-gray-900 mb-3">Today's Times</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Clock In</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {todayAttendance.clockInTime 
                        ? format(new Date(todayAttendance.clockInTime), 'HH:mm:ss')
                        : '-'
                      }
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Clock Out</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {todayAttendance.clockOutTime 
                        ? format(new Date(todayAttendance.clockOutTime), 'HH:mm:ss')
                        : 'Not clocked out'
                      }
                    </dd>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">This Week's Summary</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="bg-blue-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-blue-600 truncate">
                    Days Worked
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-blue-900">
                    {weeklyStats.presentDays} / {Math.min(weeklyStats.totalDays, 5)}
                  </dd>
                </div>
                <div className="bg-green-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-green-600 truncate">
                    Total Hours
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-green-900">
                    {Math.round(weeklyStats.totalHours)}h
                  </dd>
                </div>
                <div className="bg-purple-50 px-4 py-5 rounded-lg">
                  <dt className="text-sm font-medium text-purple-600 truncate">
                    Avg Hours/Day
                  </dt>
                  <dd className="mt-1 text-2xl font-semibold text-purple-900">
                    {weeklyStats.presentDays > 0 
                      ? Math.round((weeklyStats.totalHours / weeklyStats.presentDays) * 10) / 10
                      : 0
                    }h
                  </dd>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Link
                to="/employee/profile"
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors duration-200"
              >
                <div className="text-gray-600 mb-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">My Profile</div>
              </Link>
              <Link
                to="/employee/attendance-history"
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors duration-200"
              >
                <div className="text-gray-600 mb-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Attendance History</div>
              </Link>
              <button
                onClick={fetchDashboardData}
                className="bg-gray-50 hover:bg-gray-100 p-4 rounded-lg text-center transition-colors duration-200"
              >
                <div className="text-gray-600 mb-2">
                  <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-900">Refresh Data</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboard;
