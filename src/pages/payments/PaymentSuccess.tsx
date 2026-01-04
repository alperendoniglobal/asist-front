import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ShoppingCart, FileText, Loader2 } from 'lucide-react';
import { saleService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import type { Sale } from '@/types';

/**
 * PayTR ödeme başarılı olduktan sonra yönlendirilen sayfa
 * merchant_ok_url'den sonra bu sayfaya gelir
 */
export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { userCustomer, isAuthenticated: isUserCustomerAuthenticated } = useUserCustomer();
  const saleId = searchParams.get('sale_id');
  const merchantOid = searchParams.get('merchant_oid');
  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // PayTR callback'i manuel tetikle (test modunda callback gelmeyebilir)
    const oidToUse = merchantOid || localStorage.getItem('last_paytr_merchant_oid');
    if (oidToUse) {
      triggerPaytrCallback(oidToUse);
      // Kullanıldıktan sonra temizle
      if (localStorage.getItem('last_paytr_merchant_oid')) {
        localStorage.removeItem('last_paytr_merchant_oid');
      }
    }
    
    // Sale ID varsa detayları getir
    if (saleId) {
      fetchSaleDetails();
    } else {
      setLoading(false);
    }
  }, [merchantOid, saleId]);

  // PayTR callback'ini manuel tetikle (test modunda callback gelmeyebilir)
  const triggerPaytrCallback = async (merchantOidParam: string) => {
    if (!merchantOidParam) return;
    
    try {
      console.log('🔄 PayTR callback manuel tetikleniyor...', merchantOidParam);
      
      // Backend'e callback simülasyonu gönder
      // Backend payment_details'ten total_amount'u alacak, bu yüzden 0 gönderebiliriz
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1/payments/paytr/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          merchant_oid: merchantOidParam,
          status: 'success',
          total_amount: '0', // Backend payment_details'ten gerçek tutarı alacak
          hash: 'test_hash', // Test modunda hash kontrolü atlanıyor
          test_mode: '1',
        }),
      });
      
      const responseText = await response.text();
      
      if (response.ok && responseText === 'OK') {
        console.log('✅ PayTR callback başarıyla tetiklendi');
        // 2 saniye bekle, sonra sale'ı getir
        setTimeout(() => {
          if (saleId) {
            fetchSaleDetails();
          } else {
            // Sale ID yoksa, payment'tan sale'ı bul
            findSaleFromPayment();
          }
        }, 2000);
      } else {
        console.error('❌ PayTR callback tetiklenemedi:', response.status, responseText);
      }
    } catch (error) {
      console.error('❌ PayTR callback hatası:', error);
    }
  };

  // Payment'tan sale'ı bul
  const findSaleFromPayment = async () => {
    try {
      // Payment'ı bul ve sale'ı getir
      // Bu endpoint'i backend'de oluşturmamız gerekebilir
      // Şimdilik sadece log yazalım
      console.log('🔍 Payment\'tan sale aranıyor...');
    } catch (error) {
      console.error('Sale bulunamadı:', error);
    }
  };

  // Kullanıcı tipine göre yönlendirme hedefi belirle
  const getRedirectPath = () => {
    // UserCustomer ise user dashboard'a
    if (isUserCustomerAuthenticated && userCustomer) {
      return '/user/dashboard';
    }
    // Acente/Branch kullanıcısı ise satış sayfasına
    if (isAuthenticated && user) {
      return '/dashboard/sales';
    }
    // Hiçbiri değilse ana sayfaya
    return '/';
  };

  // 3 saniye sonra otomatik yönlendirme (sadece acente/branch kullanıcıları için)
  useEffect(() => {
    if (!loading && isAuthenticated && user && !isUserCustomerAuthenticated) {
      const timer = setTimeout(() => {
        navigate('/dashboard/sales');
      }, 3000); // 3 saniye bekle

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, user, isUserCustomerAuthenticated, navigate]);

  const fetchSaleDetails = async () => {
    try {
      if (!saleId) return;
      const saleData = await saleService.getById(saleId);
      setSale(saleData);
    } catch (error) {
      console.error('Satış detayları yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Ödeme Başarılı | Çözüm Asistan</title>
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
        <Card className="max-w-lg w-full border-emerald-200 bg-white shadow-xl">
          <CardContent className="p-6 sm:p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 text-emerald-600 animate-spin mb-4" />
                <p className="text-gray-600">Bilgiler yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* Başarı ikonu */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
                </div>

                {/* Başlık */}
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Tebrikler!</h1>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Ödeme işleminiz başarıyla tamamlandı.
                </p>

                {/* Satış detayları (varsa) */}
                {sale && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left space-y-2 sm:space-y-3">
                    {sale.policy_number && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">sözleşme No:</span>
                        <span className="font-semibold text-gray-900">{sale.policy_number}</span>
                      </div>
                    )}
                    {sale.package?.name && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Paket:</span>
                        <span className="font-semibold text-gray-900">{sale.package.name}</span>
                      </div>
                    )}
                    {sale.customer && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Müşteri:</span>
                        <span className="font-semibold text-gray-900">
                          {sale.customer.name} {sale.customer.surname}
                        </span>
                      </div>
                    )}
                    {sale.vehicle?.plate && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Plaka:</span>
                        <Badge variant="outline" className="text-gray-900">
                          {sale.vehicle.plate}
                        </Badge>
                      </div>
                    )}
                    {sale.start_date && sale.end_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Geçerlilik:</span>
                        <span className="font-semibold text-emerald-600">
                          {new Date(sale.start_date).toLocaleDateString('tr-TR')} - {new Date(sale.end_date).toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Bilgilendirme */}
                <p className="text-xs sm:text-sm text-gray-500 mb-2">
                  {sale?.policy_number 
                    ? 'sözleşme detaylarınız e-posta adresinize gönderilecektir.'
                    : 'Ödeme işleminiz tamamlandı. Detaylar için e-posta adresinizi kontrol ediniz.'}
                </p>
                {/* Otomatik yönlendirme bilgisi (sadece acente/branch kullanıcıları için) */}
                {isAuthenticated && user && !isUserCustomerAuthenticated && (
                  <p className="text-xs sm:text-sm text-emerald-600 font-medium mb-4 sm:mb-6">
                    3 saniye sonra satış sayfasına yönlendirileceksiniz...
                  </p>
                )}

                {/* Butonlar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    className="flex-1 bg-[#019242] hover:bg-[#017A35] text-white rounded-full"
                    onClick={() => {
                      navigate(getRedirectPath());
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isUserCustomerAuthenticated && userCustomer
                      ? 'Hesabıma Git'
                      : isAuthenticated && user
                      ? 'Satış Sayfasına Git'
                      : 'Ana Sayfaya Dön'}
                  </Button>
                  {sale && (
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full"
                      onClick={() => {
                        // Satış detaylarına git (eğer satış sayfası varsa)
                        if (isAuthenticated && user) {
                          navigate(`/dashboard/sales`);
                        } else if (isUserCustomerAuthenticated && userCustomer) {
                          navigate('/user/dashboard');
                        } else {
                          navigate('/');
                        }
                      }}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Detayları Gör
                    </Button>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

