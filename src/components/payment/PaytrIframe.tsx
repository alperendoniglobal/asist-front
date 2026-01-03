import { useEffect, useRef, useState } from 'react';
import { initPaytrIframe } from '@/services/paytrService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaytrIframeProps {
  /**
   * PayTR token
   */
  token: string;
  /**
   * Container ID (opsiyonel, varsayılan: 'paytr-iframe-container')
   */
  containerId?: string;
  /**
   * Loading state callback
   */
  onLoading?: (loading: boolean) => void;
  /**
   * Error callback
   */
  onError?: (error: Error) => void;
  /**
   * Success callback (iframe yüklendiğinde)
   */
  onLoad?: () => void;
}

/**
 * PayTR iFrame Component
 * PayTR ödeme iframe'ini gösterir ve yönetir
 */
export default function PaytrIframe({
  token,
  containerId = 'paytr-iframe-container',
  onLoading,
  onError,
  onLoad,
}: PaytrIframeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const loadIframe = async () => {
      try {
        setLoading(true);
        setError(null);
        onLoading?.(true);

        // Container'ı oluştur (eğer yoksa)
        if (!containerRef.current) {
          console.error('Container ref not found');
          return;
        }

        // PayTR iframe'i başlat
        await initPaytrIframe(token, containerId);

        if (mounted) {
          setLoading(false);
          onLoading?.(false);
          onLoad?.();
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('PayTR iframe yüklenemedi');
        if (mounted) {
          setError(error);
          setLoading(false);
          onLoading?.(false);
          onError?.(error);
        }
      }
    };

    loadIframe();

    return () => {
      mounted = false;
    };
  }, [token, containerId, onLoading, onError, onLoad]);

  return (
    <div className="w-full">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Ödeme formu yükleniyor...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error.message || 'Ödeme formu yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Iframe Container */}
      <div
        id={containerId}
        ref={containerRef}
        className={`w-full ${loading ? 'hidden' : ''}`}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

