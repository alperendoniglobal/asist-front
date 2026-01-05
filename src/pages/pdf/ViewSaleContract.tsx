import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Download, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Satış sözleşmesi PDF görüntüleme sayfası
 * URL: /pdf/sale/:id
 * Public endpoint - authentication gerektirmez
 */
export default function ViewSaleContract() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Sözleşme ID bulunamadı');
      setLoading(false);
      return;
    }

    // PDF'i fetch ile al ve blob URL oluştur (mixed content hatasını önlemek için)
    const fetchPdf = async () => {
      try {
        setLoading(true);
        setError(null);

        // Backend API URL'ini oluştur
        const apiUrl = "https://cozum.net";
        const backendPdfUrl = `${apiUrl}/api/v1/public/pdf/sale/${id}`;
        
        // PDF'i fetch ile al
        const response = await fetch(backendPdfUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/pdf',
          },
        });

        if (!response.ok) {
          throw new Error('PDF yüklenemedi');
        }

        // PDF'i blob olarak al
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        
        // Blob URL'ini set et (iframe'de göstermek için)
        setPdfUrl(blobUrl);
        setLoading(false);
      } catch (err: any) {
        console.error('PDF yükleme hatası:', err);
        setError(err.message || 'PDF yüklenirken bir hata oluştu');
        setLoading(false);
      }
    };

    fetchPdf();
  }, [id]);

  // Cleanup: component unmount olduğunda blob URL'i temizle
  useEffect(() => {
    return () => {
      if (pdfUrl && pdfUrl.startsWith('blob:')) {
        window.URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  // PDF'i indir
  const handleDownload = () => {
    if (!pdfUrl) return;
    
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `sozlesme-${id?.slice(0, 8) || 'unknown'}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ colorScheme: 'light' }}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="mb-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Hata</h1>
            <p className="text-red-600 mb-6">{error}</p>
          </div>
          <Button onClick={() => window.location.href = '/'} className="bg-emerald-600 hover:bg-emerald-700">
            <Home className="h-4 w-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    );
  }

  if (loading || !pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" style={{ colorScheme: 'light' }}>
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">PDF yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Sözleşme Belgesi</h1>
              <p className="text-sm text-gray-500 mt-1">Satış No: {id?.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                İndir
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Ana Sayfa
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <iframe
            src={pdfUrl}
            className="w-full h-[calc(100vh-200px)] min-h-[600px] border-0"
            title="Sözleşme PDF"
            onLoad={() => setLoading(false)}
            onError={() => {
              setError('PDF yüklenirken bir hata oluştu');
              setLoading(false);
            }}
          />
        </div>
      </div>
    </div>
  );
}
