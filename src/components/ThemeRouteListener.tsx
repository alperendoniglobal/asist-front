import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Route değişikliklerini dinleyip ThemeContext'e bildiren component
 * Public sayfalarda dark mode'u devre dışı bırakır
 */
export function ThemeRouteListener() {
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    const pathname = location.pathname;

    // Public route kontrolü
    const PUBLIC_ROUTES = [
      '/',
      '/login',
      '/user-register',
      '/packages',
      '/purchase',
      '/bayilik-basvurusu',
      '/payment/success',
      '/payment/fail',
      '/about',
      '/distance-sales-contract',
      '/privacy-policy',
      '/kvkk',
      '/delivery-return',
    ];

    const isPublicRoute = (path: string): boolean => {
      // Dashboard route'ları public değil
      if (path.startsWith('/dashboard') || path.startsWith('/user/dashboard')) {
        return false;
      }
      
      // Public route'ları kontrol et
      return PUBLIC_ROUTES.some(route => {
        if (route === '/') {
          return path === '/';
        }
        return path.startsWith(route);
      });
    };

    const isPublic = isPublicRoute(pathname);

    // Public sayfalarda her zaman light mode zorla
    if (isPublic) {
      root.classList.remove('dark');
      root.classList.add('light');
      root.style.colorScheme = 'light';
    } else {
      // Dashboard sayfalarında tema ayarını koru (ThemeContext yönetir)
      // Sadece dark class'ını kaldırmayalım, ThemeContext yönetir
    }
  }, [location.pathname]);

  return null;
}

