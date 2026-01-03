import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useMemo, useRef } from 'react';
import { contentService, type LandingPageContent, type LandingPageStat } from '@/services/contentService';
import { publicService, type PublicPackage } from '@/services/publicService';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import * as LucideIcons from 'lucide-react';
import {
  Users,
  Car,
  ShoppingCart,
  ArrowRight,
  Shield,
  CheckCircle2,
  Activity,
  Star,
  ChevronLeft,
  ChevronRight,
  Phone,
  Bike,
  Truck,
  Bus,
  Check,
  Mail,
  MapPin,
  Menu,
  X,
  Play,
  Award,
  Headphones,
  Send,
  Heart,
  User
} from 'lucide-react';

/**
 * Landing Page - Public Ana Sayfa
 * Dark mode'dan etkilenmeyen, responsive tasarım
 * Yerel görseller kullanılır
 */
export default function LandingPage() {
  const { userCustomer, isAuthenticated } = useUserCustomer();
  // Backend'den çekilen veriler
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [stats, setStats] = useState<LandingPageStat[]>([]);
  const [activePages, setActivePages] = useState<Array<{slug: string, title: string}>>([]);
  const [, setLoading] = useState(true);

  // Public API'den çekilen veriler
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const packageCarouselRef = useRef<HTMLDivElement>(null);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  // Fallback istatistikler - yarıya düşürülmüş, deneyim süresi kaldırılmış
  const fallbackStats = [
    { label: 'Mutlu Müşteri', value: 3400, suffix: '+', icon: Users, color: 'text-blue-600' },
    { label: 'Müşteri Memnuniyeti', value: 100, suffix: '%', icon: Heart, color: 'text-red-500' },
    { label: 'Aktif Araç', value: 1250, suffix: '+', icon: Car, color: 'text-emerald-600' },
    { label: 'Günlük Çağrı', value: 150, suffix: '+', icon: Phone, color: 'text-cyan-600' },
  ];

  // Müşteri yorumları - Türkçe isimler
  const testimonials = [
    { 
      name: 'Alperen Y.', 
      location: 'İstanbul', 
      text: 'Gece geç saatte aracım arıza yaptı, 25 dakika içinde yardım geldi. Profesyonel ve güler yüzlü ekip için teşekkürler!', 
      rating: 5 
    },
    { 
      name: 'Serkan K.', 
      location: 'Ankara', 
      text: 'İkinci kez hizmet aldım, her seferinde aynı kalitede. Fiyatlar makul, hizmet kusursuz.', 
      rating: 5 
    },
    { 
      name: 'Fatih Ö.', 
      location: 'İzmir', 
      text: 'Tatil dönüşü lastik patladı. Çağrı merkezinin ilgisi ve hızlı müdahale için tam not!', 
      rating: 5 
    },
  ];
  
  // Backend'den veri çek
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentData, statsData, pagesData, packagesData, servicesData] = await Promise.all([
          contentService.getLandingPageContent().catch(() => null),
          contentService.getActiveStats().catch(() => []),
          contentService.getAllPages().catch(() => []),
          publicService.getPackages().catch(() => []),
          publicService.getServices().catch(() => []),
        ]);
        
        if (contentData) setLandingContent(contentData);
        if (statsData.length > 0) setStats(statsData);
        if (packagesData.length > 0) setPackages(packagesData);
        if (servicesData.length > 0) setServices(servicesData);
        
        const active = pagesData
          .filter(page => page.is_active)
          .map(page => ({
            slug: page.slug,
            title: page.title
          }));
        setActivePages(active);
      } catch (error) {
        console.error('Landing page verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // İstatistikleri yarıya düşür
  const displayStats = useMemo(() => {
    if (stats.length > 0) {
      return stats.map(stat => ({
        ...stat,
        value: Math.floor(stat.value / 2) // Yarıya düşür
      }));
    }
    return fallbackStats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  // SEO Structured Data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": landingContent?.company_name || "Çözüm Asistan - Yol Yardım Hizmetleri",
    "url": window.location.origin,
    "logo": `${window.location.origin}/cozumasistanlog.svg`,
    "description": "Profesyonel yol yardım hizmetleri. 7/24 çekici, tamirci ve acil durum desteği.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": landingContent?.support_phone || "+90-850-304-54-40",
      "contactType": "Müşteri Hizmetleri",
      "availableLanguage": ["Turkish"],
      "areaServed": "TR"
    }
  };

  // İletişim formu gönderimi
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('İletişim formu gönderildi:', contactForm);
    // TODO: Backend'e gönderim
  };

  return (
    <>
      <Helmet>
        <html lang="tr" />
        <title>Yol Yardım | 7/24 Çekici Hizmeti | {landingContent?.company_name || 'Çözüm Asistan'}</title>
        <meta name="description" content={`Profesyonel yol yardım hizmetleri. 7/24 çekici ve acil durum desteği. ${landingContent?.support_phone || '+90 (850) 304 54 40'}`} />
        <meta name="keywords" content="yol yardım, çekici hizmeti, 7/24 yol yardım, araç kurtarma" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light bg-white text-gray-900" style={{ colorScheme: 'light' }}>
        
        {/* ===== TOP BAR ===== */}
        <div className="bg-[#0066CC] text-white py-2.5 hidden md:block">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-6">
                <a 
                  href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '08503045440'}`} 
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span className="font-medium">{landingContent?.support_phone || '+90 (850) 304 54 40'}</span>
                </a>
                <a 
                  href={`mailto:${landingContent?.support_email || 'info@cozumasistan.com'}`} 
                  className="flex items-center gap-2 hover:text-blue-200 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{landingContent?.support_email || 'info@cozumasistan.com'}</span>
                </a>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/bayilik-basvurusu" className="hover:text-blue-200 transition-colors font-medium">
                  Bayilik Başvurusu
                </Link>
              </div>
            </div>
          </div>
      </div>

        {/* ===== HEADER - 3 Sütun Düzeni ===== */}
        <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 items-center h-16 md:h-20">
              {/* Sol: Logo */}
              <Link to="/" className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#0066CC] flex items-center justify-center shadow-lg">
              <img 
                src="/cozumasistanlog.svg" 
                    alt={landingContent?.company_name || "Çözüm Asistan"} 
                    className="h-6 md:h-8"
              />
            </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg md:text-xl font-bold text-gray-900">Çözüm Asistan</h1>
                  <p className="text-xs text-gray-500">Yol Yardım Hizmetleri</p>
          </div>
          </Link>

              {/* Orta: Desktop Navigation */}
              <nav className="hidden lg:flex items-center justify-center gap-6">
                <Link to="/" className="text-gray-700 hover:text-[#0066CC] font-medium transition-colors">
                  Anasayfa
                </Link>
                <a href="#about" className="text-gray-700 hover:text-[#0066CC] font-medium transition-colors">
                  Hakkımızda
                </a>
                <Link to="/packages" className="text-gray-700 hover:text-[#0066CC] font-medium transition-colors">
                  Paketler
                </Link>
                <a href="#packages" className="text-gray-700 hover:text-[#0066CC] font-medium transition-colors">
                  Hizmetlerimiz
                </a>
                <a href="#contact" className="text-gray-700 hover:text-[#0066CC] font-medium transition-colors">
                  İletişim
                </a>
              </nav>

              {/* Sağ: CTA Buttons */}
              <div className="flex items-center justify-end gap-3">
                {/* Giriş yapmış kullanıcı için dashboard linki, yoksa giriş butonu */}
                {isAuthenticated && userCustomer ? (
                  <Link to="/user/dashboard" className="hidden sm:block">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                      <User className="h-4 w-4 mr-2" />
                      {userCustomer.name}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" className="hidden sm:block">
                    <Button className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-6 rounded-full shadow-lg hover:shadow-xl transition-all">
                      Giriş Yap
                    </Button>
                  </Link>
                )}
                
                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Menü"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
                </div>
                
            {/* Mobile Menu - Footer linklerinden eklendi */}
            {isMobileMenuOpen && (
              <div className="lg:hidden py-4 border-t border-gray-100 bg-white">
                <nav className="flex flex-col gap-2">
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Anasayfa
                  </Link>
                  <a 
                    href="#about" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hakkımızda
                  </a>
                  <Link 
                    to="/packages" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Paketler
                  </Link>
                  <a 
                    href="#packages" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Hizmetlerimiz
                  </a>
                  <a 
                    href="#contact" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    İletişim
                  </a>
                  <Link 
                    to="/bayilik-basvurusu" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bayilik Başvurusu
                  </Link>
                  <Link 
                    to="/privacy-policy" 
                    className="text-gray-700 hover:text-[#0066CC] hover:bg-blue-50 font-medium py-3 px-4 rounded-lg transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Gizlilik Politikası
                  </Link>
                  <div className="pt-2 px-4">
                    {/* Giriş yapmış kullanıcı için dashboard linki, yoksa giriş butonu */}
                    {isAuthenticated && userCustomer ? (
                      <Link to="/user/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                          <User className="h-4 w-4 mr-2" />
                          {userCustomer.name}
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-full">
                          Giriş Yap
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
                            </div>
                          )}
                        </div>
        </header>

        {/* ===== HERO SECTION ===== */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-gray-50">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-[#0066CC]/5 rounded-bl-[100px] hidden lg:block" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-[#0066CC]/10 rounded-full blur-3xl hidden lg:block" />
          
          <div className="container mx-auto px-4 py-10 md:py-16 lg:py-20">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-5 md:space-y-6 relative z-10 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-sm font-medium">
                  <Shield className="h-4 w-4" />
                  <span>7/24 Profesyonel Yol Yardım</span>
                            </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight">
                  <span className="text-[#0066CC]">Her Yolculukta</span>
                  <br />
                  Yanınızdayız
                </h1>
                
                <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Türkiye genelinde profesyonel çekici, ikame araç, konaklama ve acil yol yardım hizmetleri. 
                  Tek arama ile güvenli ellerde olun.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link to="/login">
                    <Button size="lg" className="bg-[#0066CC] hover:bg-[#0052A3] text-white px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full gap-2 shadow-lg shadow-blue-500/25 w-full sm:w-auto">
                      Sisteme Giriş
                      <ArrowRight className="h-5 w-5" />
                            </Button>
                          </Link>
                          <Button 
                            size="lg" 
                            variant="outline" 
                    className="px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg rounded-full gap-2 border-2 border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white w-full sm:w-auto"
                    onClick={() => document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    <Play className="h-5 w-5" />
                    Paketleri İncele
                          </Button>
                        </div>
                      </div>

              {/* Right Content - Image Collage */}
              <div className="relative w-full max-w-md lg:max-w-none mx-auto">
                <div className="relative">
                  {/* Main Image - Çekici Hizmeti */}
                  <div className="relative rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="/images/pexels-mart-production-7709278.jpg" 
                      alt="Profesyonel Çekici Hizmeti"
                      className="w-full h-[250px] sm:h-[300px] lg:h-[350px] object-cover"
                      loading="eager"
                    />
                              </div>
                  
                  {/* Floating Image - Canlı Destek Ekibi */}
                  <div className="absolute -bottom-4 sm:-bottom-8 -left-4 sm:-left-8 rounded-xl sm:rounded-2xl overflow-hidden shadow-xl border-4 border-white hidden sm:block">
                    <img 
                      src="/images/pexels-fauxels-3183197.jpg" 
                      alt="7/24 Canlı Destek Ekibi"
                      className="w-[140px] sm:w-[180px] h-[100px] sm:h-[130px] object-cover"
                      loading="lazy"
                    />
                              </div>

                  {/* Stats Badge */}
                  <div className="absolute -right-2 sm:-right-4 top-1/2 -translate-y-1/2 bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-5 border border-gray-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-[#0066CC] flex items-center justify-center">
                        <Award className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                            </div>
                      <div>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900">3400+</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">Mutlu Müşteri</p>
                              </div>
                              </div>
                            </div>
                          </div>
                          </div>
                        </div>
          </div>
        </section>

        {/* ===== ABOUT SECTION - Çapraz düzen (resimler solda) ===== */}
        <section id="about" className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Content - Images (çapraz düzen için solda) */}
              <div className="relative order-1 lg:order-1 w-full max-w-md lg:max-w-none mx-auto">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-office.jpg" 
                        alt="Ofis Ortamı"
                        className="w-full h-[140px] sm:h-[200px] object-cover"
                        loading="lazy"
                      />
                                    </div>
                    <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-team.jpg" 
                        alt="Takım Çalışması"
                        className="w-full h-[110px] sm:h-[160px] object-cover"
                        loading="lazy"
                      />
                                  </div>
                                </div>
                  <div className="pt-6 sm:pt-8">
                    <div className="rounded-xl sm:rounded-2xl overflow-hidden shadow-lg">
                      <img 
                        src="/images/about-collab.jpg" 
                        alt="Profesyonel Ekip"
                        className="w-full h-[260px] sm:h-[350px] object-cover"
                        loading="lazy"
                      />
                          </div>
                        </div>
                      </div>
                    </div>
                        
              {/* Right Content - Text (çapraz düzen için sağda) */}
              <div className="space-y-5 sm:space-y-6 text-center lg:text-left order-2 lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>Neden Biz?</span>
                  </div>
                
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
                  <span className="text-[#0066CC]">Güvenilir</span>
                  <br />
                  Yol Arkadaşınız
                </h2>
                
                <div className="space-y-4 text-left">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="h-4 w-4 text-white" />
                </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Profesyonel Hizmet</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        Deneyimli ekibimiz ve modern araç filomuzla, aracınız ne zaman arıza yapsa yanınızdayız. 
                        Hızlı müdahale garantisi sunuyoruz.
                      </p>
              </div>
        </div>
        
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                      <Check className="h-4 w-4 text-white" />
        </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Türkiye Geneli Kapsama</h3>
                      <p className="text-sm sm:text-base text-gray-600">
                        81 ilde yaygın hizmet ağımızla, nerede olursanız olun profesyonel yol yardım hizmeti alabilirsiniz.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

        {/* ===== PACKAGES SECTION ===== */}
        <section id="packages" className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0066CC]/10 text-[#0066CC] text-sm font-medium mb-4">
                <ShoppingCart className="h-4 w-4" />
                <span>Hizmetlerimiz</span>
            </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">
                Size Özel Paketler
            </h2>
              <p className="text-gray-600 mt-3 sm:mt-4 max-w-2xl mx-auto text-sm sm:text-base">
                İhtiyacınıza en uygun yol yardım paketini seçin, güvende kalın
            </p>
          </div>

            {/* Package Cards Carousel */}
            <div className="relative">
              <div 
                ref={packageCarouselRef}
                className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-1"
                style={{ scrollBehavior: 'smooth' }}
              >
                {packages.length > 0 ? packages.map((pkg, index) => {
                  const vehicleIcons: Record<string, any> = {
                    'Otomobil': Car,
                    'Motosiklet': Bike,
                    'Kamyonet': Truck,
                    'Minibüs': Bus,
                  };
                  const VehicleIcon = vehicleIcons[pkg.vehicle_type] || Car;
                  
                  const colors = [
                    { bg: 'bg-[#0066CC]', light: 'bg-blue-50', text: 'text-[#0066CC]' },
                    { bg: 'bg-emerald-500', light: 'bg-emerald-50', text: 'text-emerald-600' },
                    { bg: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600' },
                    { bg: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600' },
                  ];
                  const color = colors[index % colors.length];
              
              return (
                    <div
                      key={pkg.id}
                      className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] snap-center"
                    >
                      <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden bg-white flex flex-col">
                        {/* Package Header - Kurumsal tasarım */}
                        <div className={`${color.light} p-4 sm:p-6 border-b border-gray-100`}>
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color.bg} flex items-center justify-center shadow-md`}>
                              <VehicleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                            <span className={`px-3 sm:px-4 py-1.5 rounded-lg ${color.bg} text-white text-xs font-semibold uppercase tracking-wide`}>
                              {pkg.vehicle_type}
                            </span>
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-xs sm:text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description}</p>
                          )}
                    </div>
                    
                        {/* Package Features - Sabit yükseklik ile hizalı */}
                        <CardContent className="p-4 sm:p-6 flex flex-col flex-grow">
                          <ul className="space-y-2.5 sm:space-y-3 min-h-[160px] sm:min-h-[180px]">
                            {pkg.covers.slice(0, 5).map((cover) => (
                              <li key={cover.id} className="flex items-center gap-2.5 sm:gap-3">
                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${color.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                                  <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">{cover.title}</span>
                              </li>
                            ))}
                            {pkg.covers.length > 5 && (
                              <li className="text-xs sm:text-sm text-gray-500 pl-8 sm:pl-9 italic">
                                +{pkg.covers.length - 5} daha fazla teminat
                              </li>
                            )}
                          </ul>

                          {/* Button - Her zaman en altta */}
                          <Link to={`/packages`} className="block mt-auto pt-4">
                            <Button className={`w-full ${color.bg} hover:opacity-90 text-white rounded-lg text-sm sm:text-base font-semibold h-11 sm:h-12 shadow-md hover:shadow-lg transition-all`}>
                              Detaylı Bilgi
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  );
                }) : (
                  // Fallback packages
                  [
                    { name: 'Hususi Oto Ekstra', type: 'Otomobil', features: ['Çekici Hizmeti Kaza', 'Çekici Hizmeti Arıza', 'Lastik Patlaması', 'Yakıt Bitmesi', 'Çilingir Hizmeti'] },
                    { name: 'Minibüs Paketi', type: 'Minibüs', features: ['Çekici Hizmeti Kaza', 'Çekici Hizmeti Arıza', 'Lastik Patlaması'] },
                    { name: 'Motosiklet Paketi', type: 'Motosiklet', features: ['Çekici Hizmeti Kaza', 'Çekici Hizmeti Arıza'] },
                    { name: 'Ticari Araç Paketi', type: 'Kamyonet', features: ['Çekici Hizmeti Kaza', 'Çekici Hizmeti Arıza', 'Lastik Patlaması', 'Yakıt Bitmesi', 'Kurtarma'] },
                  ].map((pkg, index) => {
                    const vehicleIcons: Record<string, any> = {
                      'Otomobil': Car,
                      'Motosiklet': Bike,
                      'Minibüs': Bus,
                      'Kamyonet': Truck,
                    };
                    const VehicleIcon = vehicleIcons[pkg.type] || Car;
                    
                    const colors = [
                      { bg: 'bg-[#0066CC]', light: 'bg-blue-50' },
                      { bg: 'bg-emerald-500', light: 'bg-emerald-50' },
                      { bg: 'bg-purple-500', light: 'bg-purple-50' },
                      { bg: 'bg-orange-500', light: 'bg-orange-50' },
                    ];
                    const color = colors[index % colors.length];

                    return (
                      <div key={index} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] snap-center">
                        <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white flex flex-col">
                          {/* Fallback Header - Kurumsal tasarım */}
                          <div className={`${color.light} p-4 sm:p-6 border-b border-gray-100`}>
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl ${color.bg} flex items-center justify-center shadow-md`}>
                                <VehicleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                              </div>
                              <span className={`px-3 sm:px-4 py-1.5 rounded-lg ${color.bg} text-white text-xs font-semibold uppercase tracking-wide`}>
                                {pkg.type}
                              </span>
                            </div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{pkg.name}</h3>
                          </div>
                          {/* Fallback Features - Sabit yükseklik */}
                          <CardContent className="p-4 sm:p-6 flex flex-col flex-grow">
                            <ul className="space-y-2.5 sm:space-y-3 min-h-[160px] sm:min-h-[180px]">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2.5 sm:gap-3">
                                  <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md ${color.bg} flex items-center justify-center shadow-sm`}>
                                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                                  </div>
                                  <span className="text-sm text-gray-700 font-medium">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            {/* Button - Her zaman en altta */}
                            <Link to="/packages" className="block mt-auto pt-4">
                              <Button className={`w-full ${color.bg} hover:opacity-90 text-white rounded-lg text-sm sm:text-base font-semibold h-11 sm:h-12 shadow-md hover:shadow-lg transition-all`}>
                                Detaylı Bilgi
                                <ArrowRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                  </CardContent>
                </Card>
                      </div>
              );
                  })
                )}
          </div>

              {/* Carousel Navigation - Desktop only */}
              <button
                onClick={() => packageCarouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg hover:shadow-xl items-center justify-center text-gray-700 hover:text-[#0066CC] transition-all hidden md:flex"
                aria-label="Önceki"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={() => packageCarouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg hover:shadow-xl items-center justify-center text-gray-700 hover:text-[#0066CC] transition-all hidden md:flex"
                aria-label="Sonraki"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
        </div>

            {/* View All Link */}
            <div className="text-center mt-8 sm:mt-10">
              <Link to="/packages">
                <Button variant="outline" size="lg" className="rounded-full px-6 sm:px-8 border-2 border-[#0066CC] text-[#0066CC] hover:bg-[#0066CC] hover:text-white text-sm sm:text-base">
                  Tüm Paketleri Görüntüle
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS SECTION ===== */}
        <section className="py-12 md:py-20 bg-[#0066CC] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left - Image - Canlı Destek Ekibi - Hidden on mobile */}
              <div className="relative hidden lg:block">
                <div className="relative">
                  <img 
                    src="/images/pexels-fauxels-3183197.jpg" 
                    alt="7/24 Canlı Destek Ekibi"
                    className="rounded-3xl shadow-2xl max-h-[500px] object-cover"
                    loading="lazy"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute -right-6 top-1/4 bg-white rounded-2xl shadow-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                        <Headphones className="h-6 w-6 text-white" />
                        </div>
                      <div>
                        <p className="text-2xl font-black text-gray-900">7/24</p>
                        <p className="text-xs text-gray-500">Çağrı Merkezi</p>
                        </div>
                      </div>
                </div>
          </div>
        </div>

              {/* Right - Stats */}
              <div className="text-white space-y-6 sm:space-y-8">
                <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium">
                    <Activity className="h-4 w-4" />
                    <span>Hizmet Kalitesi</span>
            </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight">
                    Müşterilerimizin
                    <br />
                    Güveni
            </h2>
                  <p className="text-base sm:text-lg text-blue-100 max-w-lg mx-auto lg:mx-0">
                    Binlerce müşterimize kesintisiz hizmet sunarak güvenlerini kazandık. Siz de ailemize katılın.
            </p>
          </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
            {displayStats.slice(0, 4).map((stat: any, index: number) => {
              const Icon = stat.icon_name 
                ? (LucideIcons as any)[stat.icon_name] || Activity
                : stat.icon || Activity;
                    
              return (
                      <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                      </div>
                          <div className="text-center sm:text-left">
                            <p className="text-2xl sm:text-3xl md:text-4xl font-black">
                              {stat.value.toLocaleString()}{stat.suffix || ''}
                            </p>
                            <p className="text-xs sm:text-sm text-blue-100">{stat.label}</p>
                    </div>
                        </div>
                      </div>
              );
            })}
                </div>

                <div className="text-center lg:text-left">
                  <Link to="/packages">
                    <Button size="lg" className="bg-white text-[#0066CC] hover:bg-gray-100 rounded-full px-6 sm:px-8 shadow-lg text-sm sm:text-base">
                      Hemen Başvur
                      <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
          </div>
        </div>
      </section>

        {/* ===== TESTIMONIALS SECTION ===== */}
        <section className="py-12 md:py-20 bg-white relative overflow-hidden">
          {/* Background Image - Müşteri Görseli */}
          <div className="absolute inset-0 opacity-5">
            <img 
              src="/images/pexels-jonathan-reynaga-861774-17429097.jpg"
              alt=""
              className="w-full h-full object-cover"
            />
              </div>
              
          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-medium mb-4">
                <Star className="h-4 w-4" />
                <span>Müşteri Deneyimleri</span>
                    </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900">
                Müşterilerimiz Ne Diyor?
              </h2>
                  </div>

            {/* Testimonials Grid - Hizalanmış kartlar */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white h-full">
                  <CardContent className="p-5 sm:p-6 flex flex-col h-full">
                    {/* Yıldızlar */}
                    <div className="flex gap-1 mb-3 sm:mb-4">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-amber-400 text-amber-400" />
                      ))}
            </div>

                    {/* Yorum - min-height ile hizalama */}
                    <p className="text-sm sm:text-base text-gray-600 italic flex-grow min-h-[80px]">
                      "{testimonial.text}"
                    </p>
                    
                    {/* Kişi bilgisi - her zaman altta */}
                    <div className="flex items-center gap-3 mt-5 sm:mt-6 pt-4 border-t border-gray-100">
                      {/* Profil ikonu - kullanıcı avatarı */}
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#0066CC] to-blue-600 flex items-center justify-center text-white font-bold text-sm sm:text-base">
                        {testimonial.name.charAt(0)}
                    </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-gray-500">{testimonial.location}</p>
                    </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
                    </div>
              </div>
        </section>

        {/* ===== CONTACT SECTION ===== */}
        <section id="contact" className="py-12 md:py-20 bg-[#0066CC]">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-4">
                <Phone className="h-4 w-4" />
                <span>İletişime Geçin</span>
            </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white">
                Bize Ulaşın
              </h2>
          </div>
              
            {/* Contact Info Cards */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12">
              <a 
                href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '4446250'}`}
                className="flex items-center gap-3 bg-white rounded-full px-5 sm:px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#0066CC] flex items-center justify-center flex-shrink-0">
                  <Phone className="h-5 w-5 text-white" />
        </div>
                <div>
                  <p className="text-xs text-gray-500">Telefon</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{landingContent?.support_phone || '+90 (850) 304 54 40'}</p>
                    </div>
              </a>
              
              <a 
                href={`mailto:${landingContent?.support_email || 'info@cozumasistan.com'}`}
                className="flex items-center gap-3 bg-white rounded-full px-5 sm:px-6 py-3 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#0066CC] flex items-center justify-center flex-shrink-0">
                  <Mail className="h-5 w-5 text-white" />
              </div>
                <div>
                  <p className="text-xs text-gray-500">E-Posta</p>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{landingContent?.support_email || 'info@cozumasistan.com'}</p>
        </div>
              </a>
              </div>

            {/* Contact Form + Map */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid lg:grid-cols-2">
                {/* Form */}
                <div className="p-6 sm:p-8 md:p-12">
                  <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Input
                          placeholder="İsminiz"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                          className="rounded-xl border-gray-200 focus:border-[#0066CC] h-11 sm:h-12 bg-white text-gray-900"
                        />
            </div>
                      <div>
                        <Input
                          placeholder="Telefon"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                          className="rounded-xl border-gray-200 focus:border-[#0066CC] h-11 sm:h-12 bg-white text-gray-900"
                        />
          </div>
        </div>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <Input
                          placeholder="E-posta adresiniz"
                          type="email"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                          className="rounded-xl border-gray-200 focus:border-[#0066CC] h-11 sm:h-12 bg-white text-gray-900"
                        />
              </div>
                      <div>
                        <Input
                          placeholder="Konu"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                          className="rounded-xl border-gray-200 focus:border-[#0066CC] h-11 sm:h-12 bg-white text-gray-900"
                        />
        </div>
                    </div>
                    <div>
                      <Textarea
                        placeholder="Mesajınız"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                        className="rounded-xl border-gray-200 focus:border-[#0066CC] min-h-[100px] sm:min-h-[120px] bg-white text-gray-900"
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#0066CC] hover:bg-[#0052A3] text-white rounded-full h-11 sm:h-12 text-base sm:text-lg">
                      <Send className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      Gönder
                    </Button>
                  </form>
                </div>

                {/* Map */}
                <div className="h-[300px] sm:h-[350px] lg:h-auto bg-gray-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.4414742151985!2d28.697512176735415!3d40.993709471352524!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14caa05f02ae5423%3A0x68cda2954db79f64!2zxLBHw5wgVGVrbWVyLCBDaWhhbmdpciwgUGV0cm9sIE9maXNpIENkLiBObzo1IEQ6MSwgMzQzMTAgQXZjxLFsYXIvxLBzdGFuYnVs!5e0!3m2!1str!2str!4v1767171043710!5m2!1str!2str"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: '300px' }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Konum Haritası"
                  />
                </div>
              </div>
                </div>
            </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="bg-gray-900 text-white">
          <div className="container mx-auto px-4 py-10 sm:py-12 md:py-16">
            {/* Footer Grid - 3 sütun */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-16 mb-8">
              {/* İletişim */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold">İletişim</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3 text-gray-400 text-sm">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 mt-0.5" />
                    <span>{landingContent?.company_address || 'İstanbul, Türkiye'}</span>
                  </li>
                  <li>
                    <a href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '4446250'}`} className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                      <Phone className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span>{landingContent?.support_phone || '+90 (850) 304 54 40'}</span>
                    </a>
                  </li>
                  <li>
                    <a href={`mailto:${landingContent?.support_email || 'info@cozumasistan.com'}`} className="flex items-center gap-2 sm:gap-3 text-gray-400 hover:text-white transition-colors text-sm">
                      <Mail className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="truncate">{landingContent?.support_email || 'info@cozumasistan.com'}</span>
                    </a>
                  </li>
                </ul>
              </div>

              {/* Politikalar */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold">Politikalar</h3>
                <ul className="space-y-2">
                  {activePages
                    .filter(page => ['privacy-policy', 'distance-sales-contract', 'kvkk', 'delivery-return'].includes(page.slug))
                    .map((page) => {
                      const slugToPath: Record<string, string> = {
                        'distance-sales-contract': '/distance-sales-contract',
                        'privacy-policy': '/privacy-policy',
                        'kvkk': '/kvkk',
                        'delivery-return': '/delivery-return'
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
                </ul>
              </div>

              {/* Hizmetler */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-bold">Hizmetler</h3>
                <ul className="space-y-2">
                  {services.slice(0, 5).map((service, index) => (
                    <li key={index} className="text-gray-400 flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#0066CC] flex-shrink-0" />
                      <span className="truncate">{service}</span>
                    </li>
                  ))}
                  {services.length === 0 && (
                    <>
                      <li className="text-gray-400 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#0066CC]" />
                        <span>Çekici Hizmeti</span>
                      </li>
                      <li className="text-gray-400 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#0066CC]" />
                        <span>Lastik Değişimi</span>
                      </li>
                      <li className="text-gray-400 flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-[#0066CC]" />
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

                {/* Payment Logos */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 pt-4 border-t border-gray-800">
                  <img src="/PayTR---2025-New-Logo-White.png" alt="PayTR" className="h-5 sm:h-6 opacity-60 hover:opacity-100 transition-opacity" />
                  <img src="/visalogo.png" alt="Visa" className="h-5 sm:h-6 opacity-60 hover:opacity-100 transition-opacity" />
                  <img src="/mastercardlogo.png" alt="Mastercard" className="h-5 sm:h-6 opacity-60 hover:opacity-100 transition-opacity" />
                </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </>
  );
}
