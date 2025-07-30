import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Auth Components
import Login from './components/auth/Login';
import OTPVerification from './components/auth/OTPVerification';
import EmployeeRegistration from './components/auth/EmployeeRegistration';

// Component Imports
import EmployeeDashboard from './components/employee/EmployeeDashboard';
import EmployeeProfile from './components/employee/EmployeeProfile';
import EmployeeAttendanceHistory from './components/employee/EmployeeAttendanceHistory';
import AdminDashboard from './components/admin/AdminDashboard';
import ClockIn from './components/attendance/ClockIn';
import ClockOut from './components/attendance/ClockOut';
import EmployeeList from './components/admin/EmployeeList';
import EmployeeDetail from './components/admin/EmployeeDetail';
import AttendanceRecords from './components/admin/AttendanceRecords';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/employee-registration" element={<EmployeeRegistration />} />

            {/* Protected Employee Routes */}
            <Route 
              path="/employee" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employee/clock-in" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <ClockIn />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/employee/clock-out" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <ClockOut />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/employee/profile" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeProfile />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/employee/attendance-history" 
              element={
                <ProtectedRoute allowedRoles={['employee']}>
                  <EmployeeAttendanceHistory />
                </ProtectedRoute>
              }
            />

            {/* Protected Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/employees" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/employees/:employeeId" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <EmployeeDetail />
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/attendance-records" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AttendanceRecords />
                </ProtectedRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>

          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
