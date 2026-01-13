import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { contractService, type ContractVersion } from '@/services/contractService';
import { useAuth } from '@/contexts/AuthContext';
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  ScrollText,
  Shield,
  Loader2,
  ChevronDown,
  ArrowRight,
  FileWarning
} from 'lucide-react';

/**
 * Sözleşme Kabul Sayfası
 * Click-wrap uyumlu sözleşme onay sayfası
 * 
 * Özellikler:
 * - Scroll tracking: Sözleşme metni sonuna kadar okunmadan onay verilemiyor
 * - Dual checkbox: İki ayrı onay kutusu (okudum/anladım + sigorta değil)
 * - PDF indirme: Sözleşme PDF olarak indirilebilir
 * - Mobil uyumlu: Responsive tasarım
 */
export default function ContractAcceptance() {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [contract, setContract] = useState<ContractVersion | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollCompleted, setScrollCompleted] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  // Sözleşme versiyonunu yükle
  useEffect(() => {
    const fetchContract = async () => {
      try {
        setLoading(true);
        const version = await contractService.getCurrentVersion();
        setContract(version);
      } catch (error) {
        console.error('Sözleşme yüklenemedi:', error);
        toast.error('Sözleşme yüklenirken bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, []);

  // Scroll tracking
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const totalScrollable = scrollHeight - clientHeight;
    
    if (totalScrollable <= 0) {
      // İçerik scroll gerektirmiyorsa direkt tamamlanmış say
      setScrollProgress(100);
      setScrollCompleted(true);
      return;
    }

    const progress = Math.min((scrollTop / totalScrollable) * 100, 100);
    setScrollProgress(progress);

    // %95'e ulaşınca tamamlanmış say (küçük bir tolerans)
    if (progress >= 95) {
      setScrollCompleted(true);
    }
  }, []);

  // Scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Initial check
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, contract]);

  // PDF indirme
  const handleDownloadPdf = async () => {
    try {
      if (!contract) return;

      // HTML içeriği ile basit PDF oluştur
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${contract.title} - v${contract.version}</title>
            <style>
              body {
                font-family: 'Times New Roman', serif;
                max-width: 800px;
                margin: 40px auto;
                padding: 20px;
                line-height: 1.6;
              }
              h1, h2, h3 { color: #1a1a1a; }
              h1 { font-size: 24px; text-align: center; margin-bottom: 30px; }
              h2 { font-size: 18px; margin-top: 25px; }
              h3 { font-size: 16px; }
              p { margin: 10px 0; text-align: justify; }
              ul, ol { margin: 10px 0 10px 30px; }
              li { margin: 5px 0; }
              .header { text-align: center; margin-bottom: 40px; }
              .version { color: #666; font-size: 12px; }
              .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <p class="version">Versiyon: ${contract.version} | Tarih: ${new Date().toLocaleDateString('tr-TR')}</p>
            </div>
            ${contract.content}
            <div class="footer">
              <p>Bu belge Çözüm Net A.Ş Yol Yardım Hizmetleri tarafından hazırlanmıştır.</p>
            </div>
          </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      toast.error('PDF indirilemedi');
    }
  };

  // Sözleşme onaylama
  const handleAccept = async () => {
    // Validasyonlar
    if (!scrollCompleted) {
      toast.error('Lütfen sözleşme metnini sonuna kadar okuyun');
      return;
    }

    if (!checkbox1) {
      toast.error('Sözleşmeyi okuduğunuzu ve anladığınızı onaylamalısınız');
      return;
    }

    if (!checkbox2) {
      toast.error('Bu hizmetin sigorta ürünü olmadığını kabul etmelisiniz');
      return;
    }

    try {
      setSubmitting(true);

      await contractService.acceptContract({
        checkbox1_accepted: checkbox1,
        checkbox2_accepted: checkbox2,
        scroll_completed: scrollCompleted,
      });

      toast.success('Sözleşme başarıyla onaylandı');

      // Kullanıcı bilgilerini yenile
      if (refreshUser) {
        await refreshUser();
      }

      // Dashboard'a yönlendir
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Sözleşme onay hatası:', error);
      toast.error(error.response?.data?.message || 'Sözleşme onaylanırken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Aşağı scroll butonu
  const scrollToBottom = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Yükleniyor durumu
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Sözleşme yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Sözleşme bulunamadı
  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <FileWarning className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sözleşme Bulunamadı</h2>
            <p className="text-gray-600 mb-6">
              Aktif sözleşme versiyonu bulunamadı. Lütfen sistem yöneticisi ile iletişime geçin.
            </p>
            <Button onClick={() => navigate('/login')} variant="outline">
              Giriş Sayfasına Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Form geçerli mi?
  const isValid = scrollCompleted && checkbox1 && checkbox2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <ScrollText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Hizmet Sözleşmesi
          </h1>
          <p className="text-gray-600">
            Sistemimizi kullanmaya devam etmek için sözleşmeyi okumanız ve onaylamanız gerekmektedir.
          </p>
        </div>

        {/* Hoşgeldin mesajı */}
        {user && (
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Merhaba <strong>{user.name} {user.surname}</strong>, aşağıdaki sözleşmeyi dikkatli bir şekilde okuyun ve onaylayın.
            </AlertDescription>
          </Alert>
        )}

        {/* Ana Kart */}
        <Card className="shadow-xl border-0">
          <CardHeader className="border-b bg-gray-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  {contract.title}
                </CardTitle>
                <CardDescription className="mt-1">
                  Versiyon: {contract.version} | Son güncelleme: {new Date(contract.updated_at).toLocaleDateString('tr-TR')}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                className="shrink-0"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Scroll Progress */}
            <div className="sticky top-0 z-10 bg-white border-b p-3">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Okuma ilerlemeniz</span>
                <span className="font-medium">
                  {scrollCompleted ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Tamamlandı
                    </span>
                  ) : (
                    `%${Math.round(scrollProgress)}`
                  )}
                </span>
              </div>
              <Progress value={scrollProgress} className="h-2" />
            </div>

            {/* Sözleşme İçeriği */}
            <div
              ref={scrollContainerRef}
              className="h-[400px] md:h-[500px] overflow-y-auto p-6 prose prose-sm max-w-none"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f1f5f9'
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: contract.content }} />
            </div>

            {/* Scroll to Bottom Button */}
            {!scrollCompleted && (
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-8 pb-4 px-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollToBottom}
                  className="w-full sm:w-auto mx-auto flex"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Aşağı Kaydır
                </Button>
              </div>
            )}

            {/* Onay Bölümü */}
            <div className="border-t bg-gray-50 p-6">
              {/* Uyarı */}
              {!scrollCompleted && (
                <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Sözleşmeyi onaylamak için önce metni sonuna kadar okumalısınız.
                  </AlertDescription>
                </Alert>
              )}

              {/* Checkbox'lar */}
              <div className="space-y-4 mb-6">
                {/* Checkbox 1 */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="checkbox1"
                    checked={checkbox1}
                    onCheckedChange={(checked) => setCheckbox1(checked as boolean)}
                    disabled={!scrollCompleted}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="checkbox1"
                    className={`text-sm cursor-pointer leading-relaxed ${
                      !scrollCompleted ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    <strong>Sözleşmeyi okudum, anladım ve kabul ediyorum.</strong>
                    <br />
                    <span className="text-xs text-gray-500">
                      Yukarıdaki sözleşme metnini tamamen okuduğumu, içeriğini anladığımı ve tüm şartları kabul ettiğimi beyan ederim.
                    </span>
                  </Label>
                </div>

                {/* Checkbox 2 */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="checkbox2"
                    checked={checkbox2}
                    onCheckedChange={(checked) => setCheckbox2(checked as boolean)}
                    disabled={!scrollCompleted}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="checkbox2"
                    className={`text-sm cursor-pointer leading-relaxed ${
                      !scrollCompleted ? 'text-gray-400' : 'text-gray-700'
                    }`}
                  >
                    <strong>Bu platformun sigorta ürünü sunmadığını kabul ediyorum.</strong>
                    <br />
                    <span className="text-xs text-gray-500">
                      Bu platform üzerinden sunulan hizmetlerin sigorta kapsamında olmadığını, yol yardım hizmet paketi olduğunu anladığımı beyan ederim.
                    </span>
                  </Label>
                </div>
              </div>

              {/* Onay Durumu Badge'leri */}
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge variant={scrollCompleted ? 'default' : 'outline'} className="gap-1">
                  {scrollCompleted ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Sözleşme okundu
                </Badge>
                <Badge variant={checkbox1 ? 'default' : 'outline'} className="gap-1">
                  {checkbox1 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Onay 1
                </Badge>
                <Badge variant={checkbox2 ? 'default' : 'outline'} className="gap-1">
                  {checkbox2 ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  Onay 2
                </Badge>
              </div>

              {/* Onay Butonu */}
              <Button
                onClick={handleAccept}
                disabled={!isValid || submitting}
                className="w-full h-12 text-base font-semibold"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Onaylanıyor...
                  </>
                ) : (
                  <>
                    Sözleşmeyi Onayla ve Devam Et
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>

              {/* Bilgi notu */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Onayınız, tarih, saat, IP adresiniz ve cihaz bilginiz ile birlikte kaydedilecektir.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Alt bilgi */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Sorularınız için{' '}
            <a href="mailto:info@cozum.net" className="text-primary hover:underline">
              info@cozum.net
            </a>{' '}
            adresinden bize ulaşabilirsiniz.
          </p>
        </div>
      </div>
    </div>
  );
}

