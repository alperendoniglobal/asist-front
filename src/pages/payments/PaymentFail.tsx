import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, Home, RefreshCw, AlertTriangle } from 'lucide-react';

/**
 * PayTR ödeme başarısız olduktan sonra yönlendirilen sayfa
 * merchant_fail_url'den sonra bu sayfaya gelir
 */
export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const error = searchParams.get('error') || searchParams.get('reason') || 'Bilinmeyen bir hata oluştu';

  return (
    <>
      <Helmet>
        <title>Ödeme Başarısız | Çözüm Net A.Ş</title>
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-white flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
        <Card className="max-w-lg w-full border-red-200 bg-white shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center">
            {/* Hata ikonu */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
            </div>

            {/* Başlık */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Ödeme Başarısız</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Ödeme işleminiz tamamlanamadı.
            </p>

            {/* Hata mesajı */}
            {error && error !== 'Bilinmeyen bir hata oluştu' && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 sm:mb-6 text-left">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900 mb-1">Hata Detayı:</p>
                    <p className="text-sm text-red-700">{decodeURIComponent(error)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Olası nedenler */}
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
              <p className="text-sm font-semibold text-gray-900 mb-2">Olası Nedenler:</p>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Kart bilgileriniz hatalı olabilir</li>
                <li>Kart limitiniz yetersiz olabilir</li>
                <li>Banka tarafından işlem reddedilmiş olabilir</li>
                <li>İnternet bağlantınızda sorun olabilir</li>
              </ul>
            </div>

            {/* Bilgilendirme */}
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Sorun devam ederse lütfen bankanızla iletişime geçin veya müşteri hizmetlerimizi arayın.
            </p>

            {/* Butonlar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/" className="flex-1">
                <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-full">
                  <Home className="h-4 w-4 mr-2" />
                  Ana Sayfaya Dön
                </Button>
              </Link>
              <Button
                variant="outline"
                className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full"
                onClick={() => window.history.back()}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

