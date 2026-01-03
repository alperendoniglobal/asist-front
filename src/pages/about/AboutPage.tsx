import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { contentService, type PageContent } from '@/services/contentService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { Loader2, ArrowRight, Building2, Target, Users, Award, Zap, User } from 'lucide-react';
import { PublicFooter } from '@/components/layout/PublicFooter';

/**
 * About Page
 * Hakkımızda sayfası - Backend'den içerik çeker
 */
export default function AboutPage() {
  const { userCustomer, isAuthenticated } = useUserCustomer();
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const content = await contentService.getPageBySlug('about').catch(() => null);
        if (content) setPageContent(content);
        
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

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page bg-white text-gray-900" style={{ colorScheme: 'light' }}>
        {/* Header - Landing ile uyumlu */}
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16 md:h-20">
              <Link to="/" className="flex items-center gap-3">
                <div className="w-16 h-12 rounded-xl bg-[#019242] flex items-center justify-center shadow-lg px-3">
                  <img 
                    src="/cozumasistanlog.svg" 
                    alt="Çözüm Asistan" 
                    className="h-8 w-auto"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">Çözüm Asistan</h1>
                  <p className="text-xs text-gray-500">Yol Yardım Hizmetleri</p>
                </div>
              </Link>
              {/* Giriş yapmış kullanıcı için dashboard linki, yoksa giriş butonu */}
              {isAuthenticated && userCustomer ? (
                <Link to="/user/dashboard">
                  <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                    <User className="h-4 w-4 mr-2" />
                    {userCustomer.name}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button className="bg-[#019242] hover:bg-[#017A35] text-white px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                    Giriş Yap
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#019242] to-[#017A35]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
                {pageContent?.title || 'Hakkımızda'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Sigorta sektöründe dijital dönüşümü hızlandıran, yenilikçi ve güvenilir çözümler sunuyoruz.
              </p>
            </div>
          </div>
        </section>

        <main role="main" className="container mx-auto px-4 py-8 md:py-12">
          {/* Ana İçerik */}
          <article className="max-w-5xl mx-auto mb-8 md:mb-12">
            <Card className="shadow-2xl border-0 bg-white">
              <CardContent className="p-6 md:p-8">
                <div
                  className="prose prose-lg prose-slate max-w-none 
                    prose-headings:text-gray-900 prose-headings:font-black
                    prose-h1:text-4xl prose-h1:mb-6
                    prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4
                    prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                    prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-base md:prose-p:text-lg
                    prose-strong:text-gray-900 prose-strong:font-bold
                    prose-a:text-[#019242] prose-a:no-underline hover:prose-a:underline
                    prose-ul:text-gray-700 prose-ul:text-base md:prose-ul:text-lg
                    prose-ol:text-gray-700 prose-ol:text-base md:prose-ol:text-lg
                    prose-li:my-2"
                  dangerouslySetInnerHTML={{ __html: pageContent?.content || '' }}
                />
              </CardContent>
            </Card>
          </article>

          {/* Değerlerimiz Section */}
          <section className="max-w-6xl mx-auto mb-8 md:mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
                Değerlerimiz
              </h2>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                İş yapış şeklimizi belirleyen temel değerlerimiz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="border-2 border-gray-200 hover:border-[#019242] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-blue-100 mb-3 md:mb-4">
                    <Target className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Hedef Odaklı</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Müşteri memnuniyetini ve operasyonel verimliliği ön planda tutuyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#019242] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-emerald-100 mb-3 md:mb-4">
                    <Zap className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Yenilikçi</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Teknolojinin gücünü kullanarak sürekli gelişim ve inovasyon sağlıyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#019242] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-amber-100 mb-3 md:mb-4">
                    <Users className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Uzman Ekip</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    10+ yıllık deneyimle, her adımda uzman desteği sunuyoruz.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 hover:border-[#019242] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 bg-white">
                <CardContent className="p-4 md:p-6 text-center">
                  <div className="inline-flex items-center justify-center p-3 md:p-4 rounded-full bg-purple-100 mb-3 md:mb-4">
                    <Award className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Güvenilir</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Sürdürülebilir ve güvenilir dijital altyapı çözümleri sunuyoruz.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="max-w-4xl mx-auto">
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-[#019242] to-[#017A35] relative overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center relative z-10">
                <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
                  Bizimle Çalışmaya Hazır mısınız?
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 max-w-2xl mx-auto">
                  Dijital dönüşüm yolculuğunuzda yanınızdayız. Hemen iletişime geçin.
                </p>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    className="text-lg px-8 py-6 h-auto gap-3 shadow-2xl bg-white text-[#019242] hover:bg-gray-50 border-0 transition-all transform hover:scale-110 font-bold"
                  >
                    Hemen Başlayın
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </section>
        </main>

        {/* Footer - Ortak Component */}
        <PublicFooter />
      </div>
    </>
  );
}

