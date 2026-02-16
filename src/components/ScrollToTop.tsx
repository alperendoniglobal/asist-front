import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Sayfa geçişlerinde scroll'u en üste sıfırlar.
 * React Router v6 bunu otomatik yapmadığı için bu bileşen gerekli.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}
