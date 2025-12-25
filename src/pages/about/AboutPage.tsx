import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { contentService, type PageContent, type LandingPageContent } from '@/services/contentService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Phone, Building2, Target, Users, Award, Zap } from 'lucide-react';

/**
 * About Page
 * Hakkımızda sayfası - Backend'den içerik çeker
 */
export default function AboutPage() {
  const navigate = useNavigate();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const [content, landing] = await Promise.all([
          contentService.getPageBySlug('about').catch(() => null),
          contentService.getLandingPageContent().catch(() => null),
        ]);
        if (content) setPageContent(content);
        if (landing) setLandingContent(landing);
        
        // Fallback içerik
        if (!content) {
          setPageContent({
            id: '',
            slug: 'about',
            title: 'Hakkımızda',
            content: '<h1>Hakkımızda</h1><p>Çözüm Asistan olarak, sigorta sektöründe dijital dönüşümü hızlandırmak için çalışıyoruz.</p>',
            meta_title: 'Hakkımızda | Çözüm Asistan',
            meta_description: 'Çözüm Asistan hakkında bilgiler.',
            meta_keywords: 'hakkımızda, çözüm asistan',
            is_active: true,
            created_at: '',
            updated_at: '',
          });
        }
      } catch (error: any) {
        console.error('Sayfa içeriği yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <html lang="tr" />
        <title>{pageContent?.meta_title || 'Hakkımızda | Çözüm Asistan'}</title>
        <meta name="description" content={pageContent?.meta_description || 'Çözüm Asistan hakkında bilgiler.'} />
        <meta name="keywords" content={pageContent?.meta_keywords || 'hakkımızda, çözüm asistan'} />
        <link rel="canonical" href={`${window.location.origin}/about`} />
        <meta property="og:title" content={pageContent?.meta_title || 'Hakkımızda | Çözüm Asistan'} />
        <meta property="og:description" content={pageContent?.meta_description || 'Çözüm Asistan hakkında bilgiler.'} />
        <meta property="og:url" content={`${window.location.origin}/about`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": pageContent?.title || "Hakkımızda",
            "description": pageContent?.meta_description || "Çözüm Asistan hakkında bilgiler.",
            "url": `${window.location.origin}/about`,
            "mainEntity": {
              "@type": "Organization",
              "name": "Çözüm Asistan",
              "url": window.location.origin
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Header - Landing page ile aynı */}
        <header role="banner" className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 shadow-xl">
          <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <img 
                  src="/cozumasistanlog.svg" 
                  alt="Çözüm Asistan - Yol Yardım Hizmetleri Logo" 
                  className="h-6 sm:h-7 md:h-8"
                  width="120"
                  height="40"
                />
              </div>
            </Link>
            <Link to="/login">
              <Button size="sm" className="sm:size-default gap-1.5 sm:gap-2 bg-white text-slate-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="hidden sm:inline">Giriş Yap</span>
                <span className="sm:hidden">Giriş</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 md:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/10 backdrop-blur-sm mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-6 text-white leading-tight">
                {pageContent?.title || 'Hakkımızda'}
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
                Sigorta sektöründe dijital dönüşümü hızlandıran, yenilikçi ve güvenilir çözümler sunuyoruz.
              </p>
            </div>
          </div>
        </section>

        <main role="main" className="container mx-auto px-4 py-8 md:py-12 relative z-10">
          {/* Ana İçerik */}
          <article className="max-w-5xl mx-auto mb-8 md:mb-12">
            <Card className="shadow-2xl border-0 bg-white dark:bg-slate-800 backdrop-blur-sm">
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                    prose-headings:text-slate-900 dark:prose-headings:text-slate-100 prose-headings:font-black
                    prose-h1:text-4xl prose-h1:mb-6
                    prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                    prose-strong:text-slate-900 dark:prose-strong:text-slate-100 prose-strong:font-bold
                    prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                    prose-ul:text-slate-700 dark:prose-ul:text-slate-300 prose-ul:text-base md:prose-ul:text-lg
                    prose-ol:text-slate-700 dark:prose-ol:text-slate-300 prose-ol:text-base md:prose-ol:text-lg
                    prose-li:my-2"
                  dangerouslySetInnerHTML={{ __html: pageContent?.content || '' }}
                />
              </CardContent>
            </Card>
          </article>

          {/* Değerlerimiz Section */}
          <section className="max-w-6xl mx-auto mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-3">
                Değerlerimiz
              </h2>
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                İş yapış şeklimizi belirleyen temel değerlerimiz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-slate-800">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-3 md:mb-4">
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Hedef Odaklı</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Müşteri memnuniyetini ve operasyonel verimliliği ön planda tutuyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-slate-800">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-3 md:mb-4">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Yenilikçi</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Teknolojinin gücünü kullanarak sürekli gelişim ve inovasyon sağlıyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-slate-800">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-3 md:mb-4">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Uzman Ekip</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    10+ yıllık deneyimle, her adımda uzman desteği sunuyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white dark:bg-slate-800">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-3 md:mb-4">
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Güvenilir</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    Sürdürülebilir ve güvenilir dijital altyapı çözümleri sunuyoruz.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Bizimle Çalışmaya Hazır mısınız?
                </h2>
                <p className="text-lg md:text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
                  Dijital dönüşüm yolculuğunuzda yanınızdayız. Hemen iletişime geçin.
                </p>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 h-auto gap-3 shadow-2xl bg-white text-slate-900 hover:bg-blue-50 border-0 transition-all transform hover:scale-110 font-bold"
                  >
                    Hemen Başlayın
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer - Landing page ile aynı */}
        <footer role="contentinfo" className="border-t border-slate-800 bg-slate-900 backdrop-blur-sm relative overflow-hidden mt-12 md:mt-16">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <div className="container mx-auto px-4 py-12 relative z-10">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              {/* Logo ve Açıklama */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                    <img 
                      src="/cozumasistanlog.svg" 
                      alt="Çözüm Asistan - Yol Yardım Hizmetleri Logo" 
                      className="h-8"
                      width="120"
                      height="40"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Türkiye genelinde 7/24 yol yardım hizmetleri. Profesyonel çözümler ve güvenilir hizmet.
                </p>
                {landingContent?.support_phone && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${landingContent.support_phone.replace(/\s/g, '')}`} className="text-sm hover:text-white transition-colors">
                      {landingContent.support_phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Hızlı Linkler */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Hızlı Linkler</h3>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => navigate('/about')} 
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Hakkımızda
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/distance-sales-contract')} 
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Mesafeli Satış Sözleşmesi
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/privacy-policy')} 
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Gizlilik ve Güvenlik Politikası
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/kvkk')} 
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    KVKK Aydınlatma Metni
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate('/delivery-return')} 
                    className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Teslimat ve İade
                  </button>
                </li>
              </ul>
              </div>

              {/* İletişim */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">İletişim</h3>
                <div className="space-y-2 text-sm text-slate-400">
                  {landingContent?.support_email && (
                    <p>
                      <span className="text-slate-500">E-posta:</span>{' '}
                      <a href={`mailto:${landingContent.support_email}`} className="hover:text-white transition-colors">
                        {landingContent.support_email}
                      </a>
                    </p>
                  )}
                  {landingContent?.support_phone && (
                    <p>
                      <span className="text-slate-500">Telefon:</span>{' '}
                      <a href={`tel:${landingContent.support_phone.replace(/\s/g, '')}`} className="hover:text-white transition-colors">
                        {landingContent.support_phone}
                      </a>
                    </p>
                  )}
                  {landingContent?.company_address && (
                    <p>
                      <span className="text-slate-500">Adres:</span>{' '}
                      <span className="text-slate-300">{landingContent.company_address}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Alt Kısım */}
            <div className="border-t border-slate-800 pt-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm text-slate-400">
                  © 2023 {landingContent?.company_name || 'Yol Asistan'}. Tüm hakları saklıdır.
                </p>
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => navigate('/privacy-policy')} 
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Gizlilik Politikası
                  </button>
                  <button 
                    onClick={() => navigate('/kvkk')} 
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    KVKK
                  </button>
                  <button 
                    onClick={() => navigate('/distance-sales-contract')} 
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    Mesafeli Satış
                  </button>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

