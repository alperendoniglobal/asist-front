import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { contentService, type PageContent } from '@/services/contentService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield } from 'lucide-react';
import { PublicFooter } from '@/components/layout/PublicFooter';

/**
 * Privacy Policy Page
 * Gizlilik ve Güvenlik Politikası sayfası - Backend'den içerik çeker
 */
export default function PrivacyPolicyPage() {
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const content = await contentService.getPageBySlug('privacy-policy').catch(() => null);
        if (content) setPageContent(content);
        
        if (!content) {
          setPageContent({
            id: '',
            slug: 'privacy-policy',
            title: 'Gizlilik ve Güvenlik Politikası',
            content: '<h1>Gizlilik ve Güvenlik Politikası</h1><p>Gizlilik ve güvenlik politikamız hakkında bilgiler.</p>',
            meta_title: 'Gizlilik ve Güvenlik Politikası | Çözüm Asistan',
            meta_description: 'Gizlilik ve güvenlik politikamız.',
            meta_keywords: 'gizlilik politikası, güvenlik politikası',
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
        <title>{pageContent?.meta_title || 'Gizlilik ve Güvenlik Politikası | Çözüm Asistan'}</title>
        <meta name="description" content={pageContent?.meta_description || 'Gizlilik ve güvenlik politikamız.'} />
        <meta name="keywords" content={pageContent?.meta_keywords || 'gizlilik politikası, güvenlik politikası'} />
        <link rel="canonical" href={`${window.location.origin}/privacy-policy`} />
        <meta property="og:title" content={pageContent?.meta_title || 'Gizlilik ve Güvenlik Politikası | Çözüm Asistan'} />
        <meta property="og:description" content={pageContent?.meta_description || 'Gizlilik ve güvenlik politikamız.'} />
        <meta property="og:url" content={`${window.location.origin}/privacy-policy`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": pageContent?.title || "Gizlilik ve Güvenlik Politikası",
            "description": pageContent?.meta_description || "Gizlilik ve güvenlik politikamız.",
            "url": `${window.location.origin}/privacy-policy`,
            "isPartOf": {
              "@type": "WebSite",
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
              <Link to="/login">
                <Button className="bg-[#019242] hover:bg-[#017A35] text-white px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                  Giriş Yap
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#019242] to-[#017A35]">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
                {pageContent?.title || 'Gizlilik ve Güvenlik Politikası'}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl mx-auto">
                Kişisel verilerinizin korunması ve güvenliği bizim için önceliktir.
              </p>
            </div>
          </div>
        </section>

        <main role="main" className="container mx-auto px-4 py-8 md:py-12">
          <article className="max-w-5xl mx-auto">
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
        </main>

        {/* Footer - Ortak Component */}
        <PublicFooter />
      </div>
    </>
  );
}

