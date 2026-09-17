import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Role Dashboard Pages
// Agent Pages
import AgentDashboard from './pages/agent/AgentDashboard';
import AgentServices from './pages/agent/AgentServices';
import AgentWallet from './pages/agent/AgentWallet';
import AgentProfile from './pages/agent/AgentProfile';
import AgentTerms from './pages/agent/AgentTerms';

// Operator Pages
import OperatorDashboard from './pages/operator/OperatorDashboard';

// Distributor Pages
import DistributorDashboard from './pages/distributor/DistributorDashboard';
import ShopList from './pages/distributor/ShopList';
import ShopDeleteRequest from './pages/distributor/ShopDeleteRequest';
import ShopVerify from './pages/distributor/ShopVerify';
import DistributorProfile from './pages/distributor/DistributorProfile';
import DistributorComplaint from './pages/distributor/DistributorComplaint';

// Admin / Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminShops from './pages/admin/AdminShops';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminServices from './pages/admin/AdminServices';
import AdminWallet from './pages/admin/AdminWallet';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 1. Agent Panel Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/services"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/wallet"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/complaint"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <DistributorComplaint />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/profile"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/terms"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <AgentTerms />
              </ProtectedRoute>
            }
          />

          {/* 2. Operator Panel Routes */}
          <Route
            path="/operator/dashboard"
            element={
              <ProtectedRoute allowedRoles={['operator']}>
                <OperatorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operator/complaint"
            element={
              <ProtectedRoute allowedRoles={['operator']}>
                <DistributorComplaint />
              </ProtectedRoute>
            }
          />

          {/* 3. Distributor Panel Routes */}
          <Route
            path="/distributor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <DistributorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/shop-list"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <ShopList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/delete-shop-requests"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <ShopDeleteRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/verify-shops"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <ShopVerify />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/profile"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <DistributorProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/distributor/complaint"
            element={
              <ProtectedRoute allowedRoles={['distributor']}>
                <DistributorComplaint />
              </ProtectedRoute>
            }
          />

          {/* 4. Manager Panel Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/complaints"
            element={
              <ProtectedRoute allowedRoles={['manager']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* 5. Super Admin Panel Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shops"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminShops />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'manager']}>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/wallet"
            element={
              <ProtectedRoute allowedRoles={['super_admin', 'manager']}>
                <AdminWallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminComplaints />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
