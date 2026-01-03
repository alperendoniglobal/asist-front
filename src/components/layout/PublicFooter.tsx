import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { contentService, type LandingPageContent } from '@/services/contentService';
import { publicService } from '@/services/publicService';

/**
 * Public Footer Component
 * Tüm public sayfalarda kullanılacak ortak footer
 * Landing page ile uyumlu tasarım ve renkler
 */
export function PublicFooter() {
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [activePages, setActivePages] = useState<Array<{slug: string, title: string}>>([]);
  const [services, setServices] = useState<string[]>([]);

  // Backend'den veri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contentData, pagesData, servicesData] = await Promise.all([
          contentService.getLandingPageContent().catch(() => null),
          contentService.getAllPages().catch(() => []),
          publicService.getServices().catch(() => []),
        ]);
        
        if (contentData) setLandingContent(contentData);
        if (servicesData.length > 0) setServices(servicesData);
        
        const active = pagesData
          .filter(page => page.is_active)
          .map(page => ({
            slug: page.slug,
            title: page.title
          }));
        setActivePages(active);
      } catch (error) {
        console.error('Footer verileri yüklenirken hata:', error);
      }
    };
    
    fetchData();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
        {/* Footer Grid - 3 sütun */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 mb-8">
          {/* İletişim */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white">İletişim</h3>
            <ul className="space-y-2 sm:space-y-3">
              {landingContent?.company_address && (
                <li className="flex items-start gap-2 sm:gap-3 text-gray-400 text-sm">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                  <span>{landingContent.company_address}</span>
                </li>
              )}
              <li>
                <a 
                  href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '4446250'}`} 
                  className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span>{landingContent?.support_phone || '+90 (850) 304 54 40'}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${landingContent?.support_email || 'info@cozumasistan.com'}`} 
                  className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                  <span className="truncate">{landingContent?.support_email || 'info@cozumasistan.com'}</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Politikalar */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white">Politikalar</h3>
            <ul className="space-y-2">
              {/* Backend'den gelen aktif sayfalar */}
              {activePages
                .filter(page => ['privacy-policy', 'distance-sales-contract', 'kvkk', 'delivery-return', 'about'].includes(page.slug))
                .map((page) => {
                  const slugToPath: Record<string, string> = {
                    'distance-sales-contract': '/distance-sales-contract',
                    'privacy-policy': '/privacy-policy',
                    'kvkk': '/kvkk',
                    'delivery-return': '/delivery-return',
                    'about': '/about'
                  };
                  const path = slugToPath[page.slug] || `/${page.slug}`;
                  return (
                    <li key={page.slug}>
                      <Link to={path} className="text-gray-400 hover:text-white transition-colors text-sm">
                        {page.title}
                      </Link>
                    </li>
                  );
                })}
              {/* Fallback - eğer backend'den gelmezse */}
              {activePages.filter(page => ['privacy-policy', 'distance-sales-contract', 'kvkk', 'delivery-return', 'about'].includes(page.slug)).length === 0 && (
                <>
                  <li>
                    <Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Hakkımızda
                    </Link>
                  </li>
                  <li>
                    <Link to="/distance-sales-contract" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Mesafeli Satış Sözleşmesi
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Gizlilik ve Güvenlik Politikası
                    </Link>
                  </li>
                  <li>
                    <Link to="/kvkk" className="text-gray-400 hover:text-white transition-colors text-sm">
                      KVKK Aydınlatma Metni
                    </Link>
                  </li>
                  <li>
                    <Link to="/delivery-return" className="text-gray-400 hover:text-white transition-colors text-sm">
                      Teslimat ve İade
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Hizmetler */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-white">Hizmetler</h3>
            <ul className="space-y-2">
              {/* Backend'den gelen hizmetler */}
              {services.slice(0, 5).map((service, index) => (
                <li key={index} className="text-gray-400 flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#019242] flex-shrink-0" />
                  <span className="truncate">{service}</span>
                </li>
              ))}
              {/* Fallback - eğer backend'den gelmezse */}
              {services.length === 0 && (
                <>
                  <li className="text-gray-400 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#019242]" />
                    <span>Çekici Hizmeti</span>
                  </li>
                  <li className="text-gray-400 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#019242]" />
                    <span>Lastik Değişimi</span>
                  </li>
                  <li className="text-gray-400 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#019242]" />
                    <span>İkame Araç</span>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Logo and Copyright */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <img 
                  src="/cozumasistanlog.svg" 
                  alt={landingContent?.company_name || "Çözüm Asistan"} 
                  className="h-7 sm:h-8"
                />
                <p className="text-gray-400 text-xs sm:text-sm">
                  © {new Date().getFullYear()} {landingContent?.company_name || 'Çözüm Asistan'}. Tüm hakları saklıdır.
                </p>
              </div>
            </div>

            {/* Payment Logos - Sadece PayTR */}
            <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-gray-800">
              <img 
                src="/PayTR---2025-New-Logo-White.png" 
                alt="PayTR" 
                className="h-5 sm:h-6 opacity-60 hover:opacity-100 transition-opacity" 
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

