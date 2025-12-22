import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import { MainLayout } from "./components/layout/MainLayout"
import { SupportLayout } from "./components/layout/SupportLayout"
import Login from "./pages/auth/Login"
import LandingPage from "./pages/landing/LandingPage"
import Dashboard from "./pages/dashboard/Dashboard"
import Agencies from "./pages/agencies/Agencies"
import Branches from "./pages/branches/Branches"
import BranchDetail from "./pages/branches/BranchDetail"
import Users from "./pages/users/Users"
import UserDetail from "./pages/users/UserDetail"
import Customers from "./pages/customers/Customers"
import Vehicles from "./pages/vehicles/Vehicles"
import Packages from "./pages/packages/Packages"
import Sales from "./pages/sales/Sales"
import NewSale from "./pages/sales/NewSale"
import Payments from "./pages/payments/Payments"
import Commissions from "./pages/commissions/Commissions"
import Support from "./pages/support/Support"
import SupportSales from "./pages/support/SupportSales"
import SupportFiles from "./pages/support/SupportFiles"
import CreateFile from "./pages/support/CreateFile"
import Profile from "./pages/profile/Profile"
import { UserRole } from "./types"
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Landing Page - Public */}
            <Route path="/" element={<LandingPage />} />
            
            {/* Login - Public */}
            <Route path="/login" element={<Login />} />

            {/* SUPPORT Rolü için Özel Routes - Destek Ekibi */}
            <Route
              path="/dashboard/support"
              element={
                <ProtectedRoute allowedRoles={[UserRole.SUPPORT]}>
                  <SupportLayout />
                </ProtectedRoute>
              }
            >
              <Route path="sales" element={<SupportSales />} />
              <Route path="files" element={<SupportFiles />} />
              <Route path="files/create" element={<CreateFile />} />
              <Route path="profile" element={<Profile />} />
              <Route index element={<Navigate to="/dashboard/support/sales" replace />} />
            </Route>

            {/* Protected Routes - Dashboard and all app routes (SUPPORT hariç) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route
                path="agencies"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                    <Agencies />
                  </ProtectedRoute>
                }
              />
              <Route
                path="branches"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}>
                    <Branches />
                  </ProtectedRoute>
                }
              />
              <Route
                path="branches/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN]}>
                    <BranchDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users/:id"
                element={
                  <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN]}>
                    <UserDetail />
                  </ProtectedRoute>
                }
              />
              <Route path="customers" element={<Customers />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="packages" element={<Packages />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/new" element={<NewSale />} />
              <Route path="payments" element={<Payments />} />
              <Route path="commissions" element={<Commissions />} />
              <Route path="support" element={<Support />} />
              <Route path="profile" element={<Profile />} />
            </Route>
            
            {/* Redirect old routes to dashboard */}
            <Route path="agencies" element={<Navigate to="/dashboard/agencies" replace />} />
            <Route path="branches" element={<Navigate to="/dashboard/branches" replace />} />
            <Route path="users" element={<Navigate to="/dashboard/users" replace />} />
            <Route path="customers" element={<Navigate to="/dashboard/customers" replace />} />
            <Route path="vehicles" element={<Navigate to="/dashboard/vehicles" replace />} />
            <Route path="packages" element={<Navigate to="/dashboard/packages" replace />} />
            <Route path="sales" element={<Navigate to="/dashboard/sales" replace />} />
            <Route path="payments" element={<Navigate to="/dashboard/payments" replace />} />
            <Route path="commissions" element={<Navigate to="/dashboard/commissions" replace />} />
            <Route path="support" element={<Navigate to="/dashboard/support" replace />} />
            <Route path="profile" element={<Navigate to="/dashboard/profile" replace />} />
            
            {/* Catch all - redirect to landing page */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
