import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { contentService, type LandingPageContent, type LandingPageStat } from '@/services/contentService';
import { publicService, type PublicPackage } from '@/services/publicService';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { PublicFooter } from '@/components/layout/PublicFooter';
import * as LucideIcons from 'lucide-react';
import {
  Users,
  Car,
  ArrowRight,
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
  Menu,
  X,
  Headphones,
  Send,
  Heart,
  User,
  Search,
  Home,
  PaintBucket,
  Wrench,
  Sparkles,
  Wind,
  Zap,
  Bath,
  BookOpen,
  Thermometer,
  MapPin,
} from 'lucide-react';
import { HIZMET_KATEGORILERI, TREND_HIZMETLER } from '@/data/landingHizmetler';
import type { HizmetItem } from '@/data/landingHizmetler';

const HIZMET_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Car,
  Home,
  PaintBucket,
  Wrench,
  Sparkles,
  Truck,
  Wind,
  Zap,
  Bath,
  BookOpen,
  Thermometer,
};

function getHizmetIcon(item: HizmetItem) {
  return HIZMET_ICON_MAP[item.icon || ''] || Wrench;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { userCustomer, isAuthenticated } = useUserCustomer();
  const [landingContent, setLandingContent] = useState<LandingPageContent | null>(null);
  const [stats, setStats] = useState<LandingPageStat[]>([]);
  const [, setLoading] = useState(true);
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const packageCarouselRef = useRef<HTMLDivElement>(null);
  const [currentPackageIndex, setCurrentPackageIndex] = useState(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: '',
    message: ''
  });

  const fallbackStats = [
    { label: 'Mutlu Müşteri', value: 3400, suffix: '+', icon: Users, color: 'text-blue-600' },
    { label: 'Müşteri Memnuniyeti', value: 100, suffix: '%', icon: Heart, color: 'text-red-500' },
    { label: 'Aktif Araç', value: 1250, suffix: '+', icon: Car, color: 'text-emerald-600' },
    { label: 'Günlük Çağrı', value: 150, suffix: '+', icon: Phone, color: 'text-cyan-600' },
  ];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [contentData, statsData, packagesData] = await Promise.all([
          contentService.getLandingPageContent().catch(() => null),
          contentService.getActiveStats().catch(() => []),
          publicService.getPackages().catch(() => []),
        ]);

        if (contentData) setLandingContent(contentData);
        if (statsData.length > 0) setStats(statsData);
        if (packagesData.length > 0) setPackages(packagesData);
      } catch (error) {
        console.error('Landing page verileri yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isAutoScrolling || packages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPackageIndex((prev) => {
        const next = (prev + 1) % packages.length;
        if (packageCarouselRef.current) {
          const cardWidth = 340;
          const scrollPosition = next * cardWidth;
          packageCarouselRef.current.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
          });
        }
        return next;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoScrolling, packages.length]);

  const displayStats = useMemo(() => {
    if (stats.length > 0) {
      return stats.map(stat => ({
        ...stat,
        value: Math.floor(stat.value / 2)
      }));
    }
    return fallbackStats;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats]);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": landingContent?.company_name || "Çözüm Net A.Ş - Yol Yardım Hizmetleri",
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

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('İletişim formu gönderildi:', contactForm);
  };

  return (
    <>
      <Helmet>
        <html lang="tr" />
        <title>Yol Yardım | 7/24 Çekici Hizmeti | {landingContent?.company_name || 'Çözüm Net A.Ş'}</title>
        <meta name="description" content={`Profesyonel yol yardım hizmetleri. 7/24 çekici ve acil durum desteği. ${landingContent?.support_phone || '+90 (850) 304 54 40'}`} />
        <meta name="keywords" content="yol yardım, çekici hizmeti, 7/24 yol yardım, araç kurtarma" />
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      </Helmet>

      <div className="light public-page bg-white text-gray-900 overflow-x-hidden" style={{ colorScheme: 'light' }}>

        {/* ===== TOP BAR ===== */}
        <div className="fixed top-0 left-0 right-0 z-[60] bg-[#019242] text-white py-2 hidden md:block">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between text-xs font-medium">
              <div className="flex items-center gap-5">
                <a
                  href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '08503045440'}`}
                  className="flex items-center gap-1.5 hover:text-green-200 transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  {landingContent?.support_phone || '+90 (850) 304 54 40'}
                </a>
                <a
                  href={`mailto:${landingContent?.support_email || 'info@cozum.net'}`}
                  className="flex items-center gap-1.5 hover:text-green-200 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {landingContent?.support_email || 'info@cozum.net'}
                </a>
              </div>
              <Link to="/bayilik-basvurusu" className="hover:text-green-200 transition-colors">
                Bayilik Başvurusu
              </Link>
            </div>
          </div>
        </div>

        {/* ===== HEADER ===== */}
        <header className="fixed top-8 md:top-8 left-0 right-0 z-50 bg-white border-b border-gray-200 transition-all duration-300">
          <div className="container mx-auto px-6">
            {/* Desktop */}
            <div className="hidden lg:grid grid-cols-3 items-center h-18 py-3">
              <Link to="/" className="flex items-center gap-3">
                <img
                  src="/iconlogo.svg"
                  alt=""
                  className="h-10 w-10 object-contain flex-shrink-0"
                />
                <div>
                  <h1 className="text-xl font-bold leading-tight text-gray-900">Çözüm Net A.Ş</h1>
                  <p className="text-xs text-gray-500">Yol Yardım Hizmetleri</p>
                </div>
              </Link>

              <nav className="flex items-center justify-center gap-7">
                {['Anasayfa', 'Hakkımızda', 'Paketler', 'Hizmetler', 'İletişim'].map((label, i) => {
                  const targets = ['/', '#about', '/packages', '#packages', '#contact'];
                  const isHash = targets[i].startsWith('#');
                  const cls = 'text-sm font-medium text-gray-600 hover:text-[#019242] transition-colors';
                  return isHash
                    ? <a key={label} href={targets[i]} className={cls}>{label}</a>
                    : <Link key={label} to={targets[i]} className={cls}>{label}</Link>;
                })}
              </nav>

              <div className="flex items-center justify-end">
                {isAuthenticated && userCustomer ? (
                  <Link to="/user/dashboard">
                    <Button variant="outline" className="border-gray-200 text-gray-700 hover:border-[#019242] hover:text-[#019242] px-5 py-2 rounded-lg text-sm transition-colors">
                      <User className="h-4 w-4 mr-2" />
                      {userCustomer.name}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login">
                    <Button className="bg-[#019242] hover:bg-[#017A35] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors">
                      Giriş Yap
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile */}
            <div className="lg:hidden flex items-center justify-between h-16">
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="/iconlogo.svg"
                  alt=""
                  className="h-9 w-9 object-contain flex-shrink-0"
                />
                <div className="hidden sm:block">
                  <h1 className="text-base font-bold leading-tight text-gray-900">Çözüm Net A.Ş</h1>
                  <p className="text-xs text-gray-500">Yol Yardım Hizmetleri</p>
                </div>
              </Link>
              <button
                className="relative z-[60] p-2 rounded-lg transition-colors text-gray-700 hover:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Menü"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative w-6 h-6">
                  <Menu className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                  <X className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${isMobileMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden fixed inset-0 z-[55] transition-all duration-300 ease-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} />
            <div
              className={`absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-lg transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-white/20 bg-[#019242]">
                <div className="flex items-center gap-3">
                  <img src="/iconlogo.svg" alt="" className="h-9 w-9 object-contain flex-shrink-0 filter brightness-0 invert" />
                  <div>
                    <h2 className="text-base font-bold text-white">Menü</h2>
                    <p className="text-xs text-white/70">Yol Yardım Hizmetleri</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors" aria-label="Kapat">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="h-[calc(100vh-80px)] overflow-y-auto">
                <nav className="flex flex-col p-4 gap-1">
                  {[
                    { label: 'Anasayfa', to: '/' },
                    { label: 'Paketler', to: '/packages' },
                    { label: 'Bayilik Başvurusu', to: '/bayilik-basvurusu' },
                    { label: 'Gizlilik Politikası', to: '/privacy-policy' },
                  ].map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-3 text-gray-700 hover:text-[#019242] hover:bg-green-50 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#019242]/30" />
                      {item.label}
                    </Link>
                  ))}
                  {[
                    { label: 'Hakkımızda', href: '#about' },
                    { label: 'Hizmetlerimiz', href: '#packages' },
                    { label: 'İletişim', href: '#contact' },
                  ].map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 text-gray-700 hover:text-[#019242] hover:bg-green-50 font-medium py-3 px-4 rounded-xl transition-all duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-[#019242]/30" />
                      {item.label}
                    </a>
                  ))}

                  <div className="mt-4 px-4 pb-4">
                    {isAuthenticated && userCustomer ? (
                      <Link to="/user/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full border-gray-200 text-gray-700 rounded-xl py-5 text-sm font-semibold">
                          <User className="h-4 w-4 mr-2" />
                          {userCustomer.name}
                        </Button>
                      </Link>
                    ) : (
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-xl py-5 text-sm font-semibold">
                          Giriş Yap
                        </Button>
                      </Link>
                    )}
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section id="hizmet-ara" className="relative bg-white overflow-hidden">

          {/* Dekoratif arka plan şekilleri — tamamen CSS */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-green-50 translate-x-1/3 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-gray-50 -translate-x-1/3 translate-y-1/4" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-gray-100/60" />
          </div>

          <div className="relative z-10 container mx-auto px-6 pt-32 pb-20">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">

              {/* Sol — Metin + Arama */}
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="inline-flex items-center gap-2 bg-green-50 border border-green-100 rounded-full px-4 py-1.5 mb-6"
                >
                  <span className="w-2 h-2 rounded-full bg-[#019242] animate-pulse" />
                  <span className="text-xs font-semibold text-[#019242]">7/24 Yol Yardım & Ev Hizmetleri</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                  className="text-5xl md:text-6xl lg:text-[4.25rem] font-bold tracking-tight text-gray-900 leading-[1.08] mb-6"
                >
                  İhtiyacın Olan<br />
                  <span className="text-[#019242]">Hizmete</span><br />
                  Kolayca Ulaş
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.16 }}
                  className="text-base text-gray-500 max-w-md mb-10 leading-relaxed"
                >
                  Temizlik, tadilat, tesisat, yol yardım ve daha fazlası — deneyimli ustalar, hızlı çözüm.
                </motion.p>

                <motion.form
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.22 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="hizmet-q"]');
                    const value = (input?.value || '').trim();
                    if (value) navigate(`/hizmet-ara?q=${encodeURIComponent(value)}`);
                    else navigate('/hizmet-ara');
                  }}
                  className="flex gap-2 border border-gray-200 rounded-xl p-1.5 max-w-lg bg-white"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}
                >
                  <Input
                    name="hizmet-q"
                    type="search"
                    placeholder="Hangi hizmeti arıyorsun?"
                    className="flex-1 border-0 shadow-none focus-visible:ring-0 text-sm h-11 bg-transparent text-gray-900 placeholder:text-gray-400"
                    aria-label="Hizmet ara"
                  />
                  <Button
                    type="submit"
                    className="bg-[#019242] hover:bg-[#017A35] text-white px-5 h-11 rounded-lg text-sm font-semibold gap-2 flex-shrink-0 transition-colors"
                  >
                    <Search className="h-4 w-4" />
                    Ara
                  </Button>
                </motion.form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.32 }}
                  className="flex flex-wrap gap-2 mt-5"
                >
                  {HIZMET_KATEGORILERI.map((k) => (
                    <Link
                      key={k.id}
                      to={`/hizmet-ara?kategori=${encodeURIComponent(k.slug)}`}
                      className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-600 hover:border-[#019242] hover:text-[#019242] transition-all duration-200"
                    >
                      {k.label}
                    </Link>
                  ))}
                </motion.div>

                {/* Küçük stat satırı */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.42 }}
                  className="flex items-center gap-6 mt-10 pt-8 border-t border-gray-100"
                >
                  {[
                    { val: '3.400+', label: 'Müşteri' },
                    { val: '%100', label: 'Memnuniyet' },
                    { val: '7/24', label: 'Destek' },
                    { val: '81 İl', label: 'Kapsama' },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-bold text-gray-900 leading-none">{s.val}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Sağ — İnteraktif görsel grid */}
              <div className="hidden lg:block relative" style={{ padding: '20px 28px 20px 8px' }}>
                <div className="grid grid-cols-5 grid-rows-2 gap-3 h-[460px]">

                  {/* Büyük sol kart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.65, delay: 0.2 }}
                    className="col-span-3 row-span-2 rounded-2xl overflow-hidden relative group cursor-pointer"
                  >
                    <img
                      src="/images/hizmetler/yol-yardim.png"
                      alt="Yol Yardım"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#2dd67b] block mb-1">Yol Yardım</span>
                      <p className="text-white font-bold text-base leading-snug">7/24 Çekici & Yol Yardım</p>
                    </div>
                  </motion.div>

                  {/* Sağ üst */}
                  <motion.div
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.3 }}
                    className="col-span-2 rounded-2xl overflow-hidden relative group cursor-pointer"
                  >
                    <img
                      src="/images/hizmetler/ev-temizligi.png"
                      alt="Ev Temizliği"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2.5 left-3 text-white font-semibold text-xs">Ev Temizliği</p>
                  </motion.div>

                  {/* Sağ alt */}
                  <motion.div
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, delay: 0.38 }}
                    className="col-span-2 rounded-2xl overflow-hidden relative group cursor-pointer"
                  >
                    <img
                      src="/images/hizmetler/boya-badana.png"
                      alt="Boya Badana"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <p className="absolute bottom-2.5 left-3 text-white font-semibold text-xs">Boya & Badana</p>
                  </motion.div>
                </div>

                {/* Floating: sağ üst */}
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.55 }}
                  className="absolute top-2 right-2 bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 z-10"
                  style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.10)' }}
                >
                  <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-[#019242]" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-gray-900 leading-none">3.400+</p>
                    <p className="text-xs text-gray-400 mt-0.5">Mutlu Müşteri</p>
                  </div>
                </motion.div>

                {/* Floating: alt yeşil */}
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, delay: 0.65 }}
                  className="absolute bottom-2 right-2 bg-[#019242] rounded-2xl px-4 py-3 flex items-center gap-3 z-10"
                  style={{ boxShadow: '0 8px 28px rgba(1,146,66,0.28)' }}
                >
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white leading-none">7/24 Destek</p>
                    <p className="text-xs text-white/65 mt-0.5">Her an yanınızdayız</p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* ===== TREND HİZMETLER ===== */}
          <div className="bg-white">
            <div className="container mx-auto px-6 py-16 md:py-20">
              <div className="mb-10">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-2">Popüler Hizmetler</p>
                <div className="flex items-end justify-between">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Haftanın Trend Hizmetleri</h2>
                  <Link to="/hizmet-ara" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#019242] hover:text-[#017A35] transition-colors">
                    Tümünü Gör <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {TREND_HIZMETLER.map((h) => {
                  const Icon = getHizmetIcon(h);
                  return (
                    <Link key={h.id} to={`/hizmet/${h.slug}`} className="block group">
                      <div className="border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-green-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
                        <div className="aspect-[16/10] relative bg-gray-50 overflow-hidden">
                          {h.imageUrl ? (
                            <>
                              <img
                                src={h.imageUrl}
                                alt={h.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fallback) fallback.classList.remove('hidden');
                                }}
                              />
                              <div className="hidden absolute inset-0 flex items-center justify-center">
                                <Icon className="h-10 w-10 text-[#019242]/40" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon className="h-10 w-10 text-[#019242]/40" />
                            </div>
                          )}
                          <div className="absolute top-2.5 left-2.5">
                            <span className="px-2 py-0.5 rounded-md bg-white text-xs font-semibold text-[#019242]">
                              {HIZMET_KATEGORILERI.find(k => k.slug === h.kategoriSlug)?.label || 'Hizmet'}
                            </span>
                          </div>
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <div className="flex items-start gap-2 mb-2">
                            <Icon className="h-4 w-4 text-[#019242] flex-shrink-0 mt-0.5" />
                            <h4 className="font-semibold text-gray-900 text-sm leading-snug">{h.name}</h4>
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed flex-grow">{h.description}</p>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-xs font-semibold text-[#019242] flex items-center gap-1 group-hover:gap-1.5 transition-all">
                              Detaylar <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-10 text-center md:hidden">
                <Link
                  to="/hizmet-ara"
                  className="inline-flex items-center gap-2 bg-[#019242] hover:bg-[#017A35] text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  Tüm Hizmetlere Göz At
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

        {/* ===== ABOUT ===== */}
        <section id="about" className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="relative order-1 w-full max-w-md lg:max-w-none mx-auto"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-3">
                    <div className="rounded-xl overflow-hidden">
                      <img src="/images/about-office.jpg" alt="Ofis Ortamı" className="w-full h-[160px] object-cover" loading="lazy" />
                    </div>
                    <div className="rounded-xl overflow-hidden">
                      <img src="/images/about-team.jpg" alt="Takım Çalışması" className="w-full h-[120px] object-cover" loading="lazy" />
                    </div>
                  </div>
                  <div className="pt-8">
                    <div className="rounded-xl overflow-hidden">
                      <img src="/images/about-collab.jpg" alt="Profesyonel Ekip" className="w-full h-[295px] object-cover" loading="lazy" />
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white border border-gray-100 rounded-xl p-4 shadow-sm hidden lg:block">
                  <p className="text-2xl font-bold text-[#019242]">81</p>
                  <p className="text-xs text-gray-500">İl Kapsama</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: 0.08 }}
                className="space-y-6 order-2 text-center lg:text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-widest text-[#019242]">Neden Biz?</p>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
                  Güvenilir<br />
                  <span className="text-[#019242]">Yol Arkadaşınız</span>
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
                  Deneyimli ekibimiz ve modern araç filomuzla, aracınız ne zaman arıza yapsa yanınızdayız.
                </p>

                <div className="space-y-5 text-left">
                  {[
                    {
                      title: 'Profesyonel Hizmet',
                      desc: 'Deneyimli ekibimiz ve modern araç filomuzla, hızlı müdahale garantisi sunuyoruz.',
                    },
                    {
                      title: 'Türkiye Geneli Kapsama',
                      desc: '81 ilde yaygın hizmet ağımızla, nerede olursanız olun profesyonel yol yardım hizmeti alabilirsiniz.',
                    },
                    {
                      title: 'Ortalama 25 dk Yanıt Süresi',
                      desc: 'Çağrınızı aldıktan sonra ortalama 25 dakika içinde ekibimiz yanınızda olur.',
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.12 + i * 0.08 }}
                      className="flex items-start gap-4"
                    >
                      <div className="w-8 h-8 rounded-lg border border-green-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="h-4 w-4 text-[#019242]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== PACKAGES ===== */}
        <section id="packages" className="py-16 md:py-24 bg-white relative overflow-visible">
          <div className="container mx-auto px-6 relative z-10 overflow-visible">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-2">Hizmetlerimiz</p>
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Size Özel Paketler</h2>
                  <p className="text-sm text-gray-500 mt-2">İhtiyacınıza en uygun yol yardım paketini seçin, güvende kalın.</p>
                </div>
                <Link to="/packages" className="hidden md:flex items-center gap-1 text-sm font-medium text-[#019242] hover:text-[#017A35] transition-colors flex-shrink-0 ml-6">
                  Tümünü Gör <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            <div
              className="relative py-4 -mx-4 md:-mx-8 lg:-mx-12 overflow-visible"
              onMouseEnter={() => setIsAutoScrolling(false)}
              onMouseLeave={() => setIsAutoScrolling(true)}
            >
              <div
                ref={packageCarouselRef}
                className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 px-20 md:px-24 lg:px-28 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                style={{ scrollBehavior: 'smooth', overflowY: 'visible' }}
                onScroll={(e) => {
                  const scrollLeft = e.currentTarget.scrollLeft;
                  const cardWidth = 340;
                  const newIndex = Math.round(scrollLeft / cardWidth);
                  if (newIndex !== currentPackageIndex && newIndex >= 0 && newIndex < packages.length) {
                    setCurrentPackageIndex(newIndex);
                  }
                }}
              >
                {packages.length > 0 ? packages.map((pkg, index) => {
                  const vehicleIcons: Record<string, any> = {
                    'Otomobil': Car,
                    'Motosiklet': Bike,
                    'Kamyonet': Truck,
                    'Minibüs': Bus,
                  };
                  const VehicleIcon = vehicleIcons[pkg.vehicle_type] || Car;
                  const isActive = index === currentPackageIndex;

                  return (
                    <div key={pkg.id} className="flex-shrink-0 w-[300px] sm:w-[320px] md:w-[340px] snap-center py-2 px-1">
                      <Card className={`h-full flex flex-col border transition-all duration-300 bg-white ${
                        isActive
                          ? 'border-[#019242] shadow-md'
                          : 'border-gray-100 shadow-sm hover:shadow-md hover:border-green-100'
                      }`}>
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                              <VehicleIcon className="h-5 w-5 text-[#019242]" />
                            </div>
                            <div className="flex items-center gap-2">
                              {index === 0 && (
                                <span className="text-[10px] font-semibold text-white bg-[#019242] px-2 py-0.5 rounded-full">
                                  Popüler
                                </span>
                              )}
                              <span className="text-xs font-semibold uppercase tracking-wide text-[#019242] bg-green-50 px-2.5 py-1 rounded-full">
                                {pkg.vehicle_type}
                              </span>
                            </div>
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                          {pkg.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{pkg.description}</p>
                          )}
                          {pkg.price && (
                            <div className="mt-4 flex items-baseline gap-1">
                              <span className="text-3xl font-bold text-gray-900">
                                {Number(pkg.price).toLocaleString('tr-TR')}
                              </span>
                              <span className="text-sm text-gray-400">₺ / yıl</span>
                            </div>
                          )}
                        </div>

                        <CardContent className="p-5 flex flex-col flex-grow">
                          <ul className="space-y-2.5 flex-grow min-h-[160px]">
                            {pkg.covers.slice(0, 6).map((cover) => (
                              <li key={cover.id} className="flex items-start gap-2.5">
                                <Check className="h-4 w-4 text-[#019242] flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-600">{cover.title}</span>
                              </li>
                            ))}
                            {pkg.covers.length > 6 && (
                              <li className="flex items-center gap-1.5 text-xs text-[#019242] pl-6 font-medium">
                                +{pkg.covers.length - 6} daha fazla teminat
                                <ArrowRight className="h-3 w-3" />
                              </li>
                            )}
                          </ul>
                          <Link to="/packages" className="block mt-5">
                            <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white h-10 rounded-lg text-sm font-semibold transition-colors">
                              Detaylı Bilgi
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    </div>
                  );
                }) : (
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
                    return (
                      <div key={index} className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[320px] snap-center py-2 px-1">
                        <Card className="h-full border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white flex flex-col">
                          <div className="p-5 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <VehicleIcon className="h-5 w-5 text-[#019242]" />
                              </div>
                              <span className="text-xs font-semibold uppercase tracking-wide text-[#019242] bg-green-50 px-2.5 py-1 rounded-full">
                                {pkg.type}
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                          </div>
                          <CardContent className="p-5 flex flex-col flex-grow">
                            <ul className="space-y-2.5 min-h-[140px] flex-grow">
                              {pkg.features.map((feature, idx) => (
                                <li key={idx} className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 text-[#019242] flex-shrink-0" />
                                  <span className="text-sm text-gray-600">{feature}</span>
                                </li>
                              ))}
                            </ul>
                            <Link to="/packages" className="block mt-5">
                              <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white h-10 rounded-lg text-sm font-semibold transition-colors">
                                Detaylı Bilgi
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })
                )}
              </div>

              <button
                onClick={() => packageCarouselRef.current?.scrollBy({ left: -340, behavior: 'smooth' })}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-[#019242] items-center justify-center text-gray-600 hover:text-[#019242] transition-all hidden md:flex"
                aria-label="Önceki"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => packageCarouselRef.current?.scrollBy({ left: 340, behavior: 'smooth' })}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 z-20 w-10 h-10 rounded-full bg-white border border-gray-200 hover:border-[#019242] items-center justify-center text-gray-600 hover:text-[#019242] transition-all hidden md:flex"
                aria-label="Sonraki"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="text-center mt-8">
              <Link to="/packages">
                <Button variant="outline" className="border border-[#019242] text-[#019242] hover:bg-[#019242] hover:text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  Tüm Paketleri Görüntüle
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-14"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-2">Hizmet Kalitesi</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Müşterilerimizin Güveni</h2>
              <p className="text-sm text-gray-500 mt-3 max-w-md mx-auto">
                Binlerce müşterimize kesintisiz hizmet sunarak güvenlerini kazandık.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
              {displayStats.slice(0, 4).map((stat: any, index: number) => {
                const Icon = stat.icon_name
                  ? (LucideIcons as any)[stat.icon_name] || Activity
                  : stat.icon || Activity;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: index * 0.08 }}
                    className="bg-white rounded-xl border border-gray-100 p-6 text-center hover:border-green-200 transition-colors"
                  >
                    <Icon className="h-5 w-5 text-[#019242] mx-auto mb-3" />
                    <p className="text-4xl font-bold text-[#019242] tracking-tight">
                      {stat.value.toLocaleString()}{stat.suffix || ''}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55 }}
                className="hidden lg:block"
              >
                <img
                  src="/images/pexels-fauxels-3183197.jpg"
                  alt="7/24 Canlı Destek Ekibi"
                  className="rounded-xl object-cover max-h-[380px] w-full"
                  loading="lazy"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="space-y-5"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">7/24 Çağrı Merkezi</h3>
                <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                  Gece ya da gündüz, hafta sonu ya da tatil fark etmez — bir çağrı uzağınızdayız. Deneyimli ekibimiz her an hazır.
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Headphones className="h-5 w-5 text-[#019242]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full bg-[#019242] animate-pulse" />
                      <p className="text-[10px] font-semibold text-[#019242] uppercase tracking-widest">Şu an aktif</p>
                    </div>
                    <p className="font-bold text-gray-900 text-sm">7/24 Kesintisiz</p>
                    <p className="text-xs text-gray-500">Çağrı Merkezi</p>
                  </div>
                </div>
                <Link to="/packages">
                  <Button className="bg-[#019242] hover:bg-[#017A35] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
                    Hemen Başvur
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS ===== */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-2">Müşteri Deneyimleri</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Müşterilerimiz Ne Diyor?</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                  className="border border-gray-100 rounded-xl p-6 bg-white hover:border-green-100 hover:shadow-sm transition-all duration-200 flex flex-col"
                >
                  <div className="text-[#019242] text-4xl font-serif leading-none mb-3 select-none">"</div>
                  <div className="flex gap-0.5 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed flex-grow min-h-[80px] italic">
                    {testimonial.text}
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100">
                    <div className="w-10 h-10 rounded-full bg-[#019242] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        {testimonial.location}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section id="contact" className="py-16 md:py-24 bg-[#019242]">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-green-300 mb-3">İletişime Geçin</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Bize Ulaşın</h2>
              <p className="text-white/65 text-sm mt-3">Sorularınız için 7/24 buradayız.</p>
            </motion.div>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-10">
              <motion.a
                whileHover={{ scale: 1.02 }}
                href={`tel:${landingContent?.support_phone?.replace(/\s/g, '') || '4446250'}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-colors"
              >
                <Phone className="h-5 w-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/60">Telefon</p>
                  <p className="font-semibold text-white text-sm">{landingContent?.support_phone || '+90 (850) 304 54 40'}</p>
                </div>
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.02 }}
                href={`mailto:${landingContent?.support_email || 'info@cozumasistan.com'}`}
                className="flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl px-5 py-3 transition-colors"
              >
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/60">E-Posta</p>
                  <p className="font-semibold text-white text-sm">{landingContent?.support_email || 'info@cozumasistan.com'}</p>
                </div>
              </motion.a>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="bg-white rounded-2xl overflow-hidden"
            >
              <div className="grid lg:grid-cols-2">
                <div className="p-8 md:p-12">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Mesaj Gönderin</h3>
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="İsminiz"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="rounded-xl border-gray-200 focus:border-[#019242] h-11 bg-white text-gray-900"
                      />
                      <Input
                        placeholder="Telefon"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="rounded-xl border-gray-200 focus:border-[#019242] h-11 bg-white text-gray-900"
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Input
                        placeholder="E-posta adresiniz"
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="rounded-xl border-gray-200 focus:border-[#019242] h-11 bg-white text-gray-900"
                      />
                      <Input
                        placeholder="Konu"
                        value={contactForm.subject}
                        onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="rounded-xl border-gray-200 focus:border-[#019242] h-11 bg-white text-gray-900"
                      />
                    </div>
                    <Textarea
                      placeholder="Mesajınız"
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="rounded-xl border-gray-200 focus:border-[#019242] min-h-[120px] bg-white text-gray-900"
                    />
                    <Button type="submit" className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-lg h-11 text-sm font-semibold transition-colors">
                      <Send className="h-4 w-4 mr-2" />
                      Gönder
                    </Button>
                  </form>
                </div>

                <div className="h-[300px] lg:h-auto bg-gray-100">
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
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <PublicFooter />
      </div>
    </>
  );
}
