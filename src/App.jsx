import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';

import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CompanyRegister from './pages/CompanyRegister';
import CompanyRegistrationSuccess from './pages/CompanyRegistrationSuccess';
import ActivateCompany from './pages/ActivateCompany';
import Dashboard from './pages/Dashboard';
import CreateProduct from './pages/CreateProduct';
import CreateCategory from './pages/CreateCategory';
import Categories from './pages/Categories';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import CreatePurchase from './pages/CreatePurchase';
import Suppliers from './pages/Suppliers';
import CreateSupplier from './pages/CreateSupplier';
import ProductDetail from './pages/ProductDetail';
import EditProduct from './pages/EditProduct';

// Admin components
import AdminDashboard from './pages/AdminDashboard';
import AdminCompanies from './pages/AdminCompanies';
import AdminUsers from './pages/AdminUsers';

// Company components
import CompanyProfile from './pages/CompanyProfile';
import Branches from './pages/Branches';
import BranchTransfers from './pages/BranchTransfers';
import CompanyUsers from './pages/CompanyUsers';
import PaymentMethods from './pages/PaymentMethods';
import CompanyDashboard from './pages/CompanyDashboard';
import ProductsManager from './pages/ProductsManager';

import ProtectedRoute from './components/ProtectedRoute';
import BranchDashboard from './pages/sucursales/BranchDashboard';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/company-register" element={<CompanyRegister />} />
              <Route path="/company-registration-success" element={<CompanyRegistrationSuccess />} />
              <Route path="/activate/:token" element={<ActivateCompany />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/sucursales/:branchId" element={<BranchDashboard/>} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/create-product" element={
                <ProtectedRoute>
                  <CreateProduct />
                </ProtectedRoute>
              } />
              
              <Route path="/edit-product/:id" element={
                <ProtectedRoute>
                  <EditProduct />
                </ProtectedRoute>
              } />
              
              <Route path="/categories" element={
                <ProtectedRoute>
                  <Categories />
                </ProtectedRoute>
              } />
              
              <Route path="/categories/create" element={
                <ProtectedRoute>
                  <CreateCategory />
                </ProtectedRoute>
              } />

              <Route path="/sales/:branchId" element={
                <ProtectedRoute>
                  <Sales />
                </ProtectedRoute>
              } />
              
              <Route path="/purchases" element={
                <ProtectedRoute>
                  <Purchases />
                </ProtectedRoute>
              } />
              
              <Route path="/purchases/create" element={
                <ProtectedRoute>
                  <CreatePurchase/>
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers" element={
                <ProtectedRoute>
                  <Suppliers />
                </ProtectedRoute>
              } />
              
              <Route path="/suppliers/create" element={
                <ProtectedRoute>
                  <CreateSupplier />
                </ProtectedRoute>
              } />
              
              {/* Admin Routes - Super Admin only */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/companies" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminCompanies />
                </ProtectedRoute>
              } />
              
              <Route path="/admin/users" element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } />
              
              {/* Company Management Routes - Company Admins and Managers */}
              <Route path="/company-profile" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager']}>
                  <CompanyProfile />
                </ProtectedRoute>
              } />
              
              <Route path="/branches" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager']}>
                  <Branches />
                </ProtectedRoute>
              } />
              
              <Route path="/branch-transfers" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager', 'employee', 'company']}>
                  <BranchTransfers />
                </ProtectedRoute>
              } />
              
              <Route path="/company-users" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager']}>
                  <CompanyUsers />
                </ProtectedRoute>
              } />
              
              <Route path="/payments" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager']}>
                  <PaymentMethods />
                </ProtectedRoute>
              } />
              
              <Route path="/company-dashboard" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager', 'employee']}>
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/products-manager" element={
                <ProtectedRoute allowedRoles={['company_admin', 'manager', 'employee']}>
                  <ProductsManager />
                </ProtectedRoute>
              } />
              
              {/* Rutas de compatibilidad - redirigen a las nuevas rutas de productos */}
              <Route path="/posts/:id" element={<Navigate to="/products/:id" replace />} />
              <Route path="/create-post" element={<Navigate to="/create-product" replace />} />
              <Route path="/edit-post/:id" element={<Navigate to="/edit-product/:id" replace />} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
