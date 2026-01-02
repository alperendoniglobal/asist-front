import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { UserRole } from "../types"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  // Sözleşme kontrolünü atla (contract-acceptance sayfası için)
  skipContractCheck?: boolean
}

/**
 * Korumalı Route Bileşeni
 * - Kimlik doğrulama kontrolü yapar
 * - Rol bazlı erişim kontrolü yapar
 * - Sözleşme onay kontrolü yapar (acente kullanıcıları için)
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  skipContractCheck = false 
}) => {
  const { user, loading, isAuthenticated, needsContractAcceptance, contractLoading } = useAuth()
  const location = useLocation()

  // Auth yükleniyor
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Yükleniyor...</div>
      </div>
    )
  }

  // Kimlik doğrulaması yapılmamış
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Rol kontrolü
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Authenticated kullanıcı ama yetkisi yoksa dashboard'a yönlendir
    return <Navigate to="/dashboard" replace />
  }

  // Sözleşme kontrolü (contract-acceptance sayfası hariç)
  // Super Admin için kontrol yapılmaz
  if (!skipContractCheck && !contractLoading && needsContractAcceptance) {
    // Eğer zaten contract-acceptance sayfasındaysa yönlendirme yapma
    if (location.pathname !== '/contract-acceptance') {
      return <Navigate to="/contract-acceptance" replace />
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
