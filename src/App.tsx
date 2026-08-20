import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense } from "react"
import { AuthProvider } from "./contexts/AuthContext"
import { SocketProvider } from "./contexts/SocketContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { UserCustomerProvider } from "./contexts/UserCustomerContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import { MainLayout } from "./components/layout/MainLayout"
import { SupportLayout } from "./components/layout/SupportLayout"
import { ThemeRouteListener } from "./components/ThemeRouteListener"
import { ScrollToTop } from "./components/ScrollToTop"
import Login from "./pages/auth/Login"
import LandingPage from "./pages/landing/LandingPage"

// Lazy load components
const DealerApplications = lazy(() => import("./pages/agencies/DealerApplications"))
const UserRegister = lazy(() => import("./pages/auth/UserRegister"))
const UserDashboard = lazy(() => import("./pages/user/UserDashboard"))
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"))
const UserForgotPassword = lazy(() => import("./pages/auth/UserForgotPassword"))
const ContractAcceptance = lazy(() => import("./pages/contract/ContractAcceptance"))
const ContractManagement = lazy(() => import("./pages/admin/ContractManagement"))
const CarBrandModelManagement = lazy(() => import("./pages/admin/CarBrandModelManagement"))
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"))
const Agencies = lazy(() => import("./pages/agencies/Agencies"))
const AgencyCommissionDistribution = lazy(() => import("./pages/agencies/AgencyCommissionDistribution"))
const PerformanceReport = lazy(() => import("./pages/agencies/PerformanceReport"))
const SalesDistributionReport = lazy(() => import("./pages/reports/SalesDistributionReport"))
const Branches = lazy(() => import("./pages/branches/Branches"))
const BranchDetail = lazy(() => import("./pages/branches/BranchDetail"))
const Users = lazy(() => import("./pages/users/Users"))
const UserDetail = lazy(() => import("./pages/users/UserDetail"))
const Customers = lazy(() => import("./pages/customers/Customers"))
const Vehicles = lazy(() => import("./pages/vehicles/Vehicles"))
const Packages = lazy(() => import("./pages/packages/Packages"))
const Sales = lazy(() => import("./pages/sales/Sales"))
const NewSale = lazy(() => import("./pages/sales/NewSale"))
const Payments = lazy(() => import("./pages/payments/Payments"))
const Commissions = lazy(() => import("./pages/commissions/Commissions"))
const Support = lazy(() => import("./pages/support/Support"))
const SupportSales = lazy(() => import("./pages/support/SupportSales"))
const SupportFiles = lazy(() => import("./pages/support/SupportFiles"))
const CreateFile = lazy(() => import("./pages/support/CreateFile"))
const Profile = lazy(() => import("./pages/profile/Profile"))
const ContentManagement = lazy(() => import("./pages/content/ContentManagement"))
const AboutPage = lazy(() => import("./pages/about/AboutPage"))
const DistanceSalesContractPage = lazy(() => import("./pages/legal/DistanceSalesContractPage"))
const PrivacyPolicyPage = lazy(() => import("./pages/legal/PrivacyPolicyPage"))
const KVKKPage = lazy(() => import("./pages/legal/KVKKPage"))
const DeliveryReturnPage = lazy(() => import("./pages/legal/DeliveryReturnPage"))
const PublicPackages = lazy(() => import("./pages/public/PublicPackages"))
const Purchase = lazy(() => import("./pages/public/Purchase"))
const DealerApplication = lazy(() => import("./pages/public/DealerApplication"))
const HizmetAraPage = lazy(() => import("./pages/public/HizmetAraPage"))
const HizmetDetayPage = lazy(() => import("./pages/public/HizmetDetayPage"))
const PaymentSuccess = lazy(() => import("./pages/payments/PaymentSuccess"))
const PaymentFail = lazy(() => import("./pages/payments/PaymentFail"))
const ViewSaleContract = lazy(() => import("./pages/pdf/ViewSaleContract"))
import { UserRole } from "./types" // Force rebuild
import { Toaster } from "./components/ui/sonner"

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <UserCustomerProvider>
            <Router>
              <ScrollToTop />
              <ThemeRouteListener />
              <Suspense
                fallback={
                  <div className="flex items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                  </div>
                }
              >
              <Routes>
                {/* Landing Page - Public */}
                <Route path="/" element={<LandingPage />} />

                {/* Login - Public (hem yetkili hem kullanıcı) */}
                <Route path="/login" element={<Login />} />

                {/* Şifremi Unuttum Sayfaları */}
                <Route
                  path="/forgot-password"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                      <ForgotPassword />
                    </Suspense>
                  }
                />
                <Route
                  path="/forgot-password-user"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                      <UserForgotPassword />
                    </Suspense>
                  }
                />

                {/* UserCustomer Routes - Bireysel kullanıcılar için */}
                <Route
                  path="/user-register"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                      <UserRegister />
                    </Suspense>
                  }
                />
                <Route
                  path="/user/dashboard"
                  element={
                    <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                      <UserDashboard />
                    </Suspense>
                  }
                />

                {/* Public Pages - SEO için */}
                <Route path="/about" element={<AboutPage />} />
                <Route path="/distance-sales-contract" element={<DistanceSalesContractPage />} />
                <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="/kvkk" element={<KVKKPage />} />
                <Route path="/delivery-return" element={<DeliveryReturnPage />} />

                {/* Public Paket ve Satın Alma Sayfaları */}
                <Route path="/packages" element={<PublicPackages />} />
                <Route path="/purchase/:packageId" element={<Purchase />} />
                <Route path="/bayilik-basvurusu" element={<DealerApplication />} />
                <Route path="/hizmet-ara" element={<HizmetAraPage />} />
                <Route path="/hizmet/:slug" element={<HizmetDetayPage />} />

                {/* Payment Result Pages - PayTR yönlendirmeleri için */}
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />

                {/* PDF Routes - Public, authentication gerektirmez */}
                <Route path="/pdf/sale/:id" element={<ViewSaleContract />} />

                {/* Sözleşme Kabul Sayfası - Auth gerekli ama sözleşme kontrolü yok */}
                <Route
                  path="/contract-acceptance"
                  element={
                    <ProtectedRoute skipContractCheck={true}>
                      <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                        <ContractAcceptance />
                      </Suspense>
                    </ProtectedRoute>
                  }
                />

                {/* Protected Routes - Dashboard and all app routes */}
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
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN]}>
                        <Agencies />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="dealer-applications"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                          <DealerApplications />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="branches"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN]}>
                        <Branches />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="branches/:id"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN]}>
                        <BranchDetail />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN]}>
                        <Users />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="users/:id"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN]}>
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
                  {/* Acente Komisyon Dağılım Raporu - Acente Admin ve Super Admin için */}
                  <Route
                    path="commission-distribution"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN, UserRole.SUPER_ADMIN]}>
                        <AgencyCommissionDistribution />
                      </ProtectedRoute>
                    }
                  />
                  {/* SUPER_AGENCY_ADMIN Performans Raporu - SUPER_ADMIN ve SUPER_AGENCY_ADMIN için */}
                  <Route
                    path="performance-report"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN]}>
                        <PerformanceReport />
                      </ProtectedRoute>
                    }
                  />
                  {/* Satış Dağılım Raporu - SADECE SUPER_ADMIN için */}
                  <Route
                    path="sales-distribution"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <SalesDistributionReport />
                      </ProtectedRoute>
                    }
                  />
                  {/* System Support - SUPPORT rolü hariç diğer roller için (destek talebi oluşturma) */}
                  <Route
                    path="system-support"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER]}>
                        <Support />
                      </ProtectedRoute>
                    }
                  />
                  {/* Support Files - Acente, Şube ve Super Admin için */}
                  <Route
                    path="support-files"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.SUPER_AGENCY_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN]}>
                        <SupportFiles />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="content"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <ContentManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="contracts"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                          <ContractManagement />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="car-brands"
                    element={
                      <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                        <Suspense fallback={<div className="flex items-center justify-center h-screen">Yükleniyor...</div>}>
                          <CarBrandModelManagement />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="profile" element={<Profile />} />
                </Route>

                {/* SUPPORT Rolü için Özel Routes - Destek Ekibi (Hasar Dosyaları) */}
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
                <Route path="support" element={<Navigate to="/dashboard/system-support" replace />} />
                <Route path="profile" element={<Navigate to="/dashboard/profile" replace />} />

                {/* Catch all - redirect to landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </Router>
            <Toaster richColors position="top-right" />
          </UserCustomerProvider>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
