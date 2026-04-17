import { useState, useEffect, useMemo } from 'react';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { publicService, type PublicPackage } from '@/services/publicService';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Car,
  Bike,
  Truck,
  Bus,
  Check,
  Shield,
  Phone,
  Clock,
  Loader2,
  Sparkles,
  Menu,
  X,
  User,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';

export default function PublicPackages() {
  const { userCustomer, isAuthenticated } = useUserCustomer();
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        setLoading(true);
        const data = await publicService.getPackages();
        setPackages(data);
      } catch (error) {
        console.error('Paketler yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const getVehicleIcon = (vehicleType: string) => {
    const icons: Record<string, any> = {
      'Otomobil': Car, 'Motosiklet': Bike, 'Kamyonet': Truck,
      'Minibüs': Bus, 'Midibüs': Bus, 'Taksi': Car, 'Kamyon': Truck, 'Çekici': Truck,
    };
    return icons[vehicleType] || Car;
  };

  const getPackageTier = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('ultra') || n.includes('premium') || n.includes('plus'))
      return { label: 'Premium', icon: Sparkles, highlighted: true };
    if (n.includes('standart') || n.includes('standard'))
      return { label: 'Standart', icon: Shield, highlighted: false };
    return { label: 'Temel', icon: Zap, highlighted: false };
  };

  const vehicleTypes = ['all', ...new Set(packages.map(p => p.vehicle_type))];
  const filteredPackages = selectedVehicleType === 'all'
    ? packages
    : packages.filter(p => p.vehicle_type === selectedVehicleType);

  const packageListSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Yol Yardım Paketleri",
    "url": "https://cozum.net/packages",
    "itemListElement": packages.map((p, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "item": {
        "@type": "Product",
        "name": p.name,
        "description": p.description || p.name,
        "offers": {
          "@type": "Offer",
          "price": p.price?.toString() || "0",
          "priceCurrency": "TRY",
          "availability": "https://schema.org/InStock",
          "seller": { "@type": "Organization", "name": "Çözüm Net A.Ş" }
        }
      }
    }))
  }), [packages]);

  return (
    <>
      <Helmet>
        <title>Yol Yardım Paketleri & Fiyatları | Çözüm Net A.Ş</title>
        <meta name="description" content="Yol yardım paket fiyatları: otomobil, motosiklet, kamyonet ve ticari araçlar için uygun paketler. 7/24 destek, hızlı müdahale. Hemen incele." />
        <link rel="canonical" href="https://cozum.net/packages" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content="Yol Yardım Paketleri & Fiyatları | Çözüm Net A.Ş" />
        <meta property="og:description" content="Yol yardım paket fiyatları: otomobil, motosiklet, kamyonet ve ticari araçlar için uygun paketler. 7/24 destek." />
        <meta property="og:url" content="https://cozum.net/packages" />
        <meta property="og:image" content="https://cozum.net/images/pexels-fauxels-3183197.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Yol Yardım Paketleri | Çözüm Net A.Ş" />
        <meta name="twitter:description" content="Yol yardım paket fiyatları ve uygun seçenekler. 7/24 destek." />
        <meta name="twitter:image" content="https://cozum.net/images/pexels-fauxels-3183197.jpg" />
        {packages.length > 0 && (
          <script type="application/ld+json">{JSON.stringify(packageListSchema)}</script>
        )}
      </Helmet>

      <div className="light public-page min-h-screen bg-white text-gray-900" style={{ colorScheme: 'light' }}>

        {/* ===== HEADER ===== */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white border-b border-gray-200' : 'bg-transparent border-b border-transparent'
        }`}>
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              to="/"
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                scrolled ? 'text-gray-600 hover:text-[#019242]' : 'text-white/85 hover:text-white'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Anasayfa
            </Link>

            <Link to="/" className="flex items-center gap-2.5">
              <LogoIcon className={`h-8 w-8 transition-colors duration-300 ${scrolled ? 'text-[#019242]' : 'text-white'}`} />
              <span className={`font-bold text-sm transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Çözüm Net A.Ş
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              <a
                href="tel:08503045440"
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors duration-300 ${
                  scrolled ? 'text-[#019242] hover:text-[#017A35]' : 'text-white/85 hover:text-white'
                }`}
              >
                <Phone className="h-4 w-4" />
                0850 304 54 40
              </a>
              {isAuthenticated && userCustomer ? (
                <Link to="/user/dashboard">
                  <Button variant="outline" size="sm" className={`rounded-lg transition-colors ${
                    scrolled ? 'border-gray-200 text-gray-700 hover:border-[#019242] hover:text-[#019242]' : 'border-white/40 text-white hover:bg-white/10'
                  }`}>
                    <User className="h-4 w-4 mr-1.5" />
                    {userCustomer.name}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="bg-[#019242] hover:bg-[#017A35] text-white rounded-lg text-sm font-semibold">
                    Giriş Yap
                  </Button>
                </Link>
              )}
            </div>

            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-1">
              <Link to="/" className="flex items-center gap-3 text-gray-700 hover:text-[#019242] hover:bg-green-50 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Anasayfa
              </Link>
              <Link to="/bayilik-basvurusu" className="flex items-center gap-3 text-gray-700 hover:text-[#019242] hover:bg-green-50 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                Bayilik Başvurusu
              </Link>
              <div className="pt-2">
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-xl text-sm font-semibold">
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* ===== HERO ===== */}
        <section className="relative min-h-[58vh] flex items-end overflow-hidden">
          <div className="absolute inset-0 bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-[#019242]/80 via-gray-900/70 to-gray-900" />
            {/* Dekoratif daireler */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#019242]/20 translate-x-1/3 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 -translate-x-1/3 translate-y-1/4" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#019242]" />

          <div className="relative z-10 container mx-auto px-6 pt-32 pb-14">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#2dd67b] animate-pulse" />
                <span className="text-xs font-semibold text-white/90">7/24 Yol Yardım Güvencesi</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5">
                Size Özel<br />
                <span className="text-[#2dd67b]">Yol Yardım</span> Paketleri
              </h1>
              <p className="text-base text-white/70 leading-relaxed mb-8 max-w-xl">
                Aracınız için en uygun paketi seçin — otomobil, motosiklet, kamyonet ve daha fazlası için 7/24 destek.
              </p>

              <div className="flex flex-wrap items-center gap-5 text-sm text-white/70">
                {[
                  { icon: Shield, label: 'Güvenli Hizmet' },
                  { icon: Clock, label: 'Ort. 25 dk Yanıt' },
                  { icon: Phone, label: '7/24 Destek' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ===== PAKETLER ===== */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-6">

            {/* Filtre */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex items-center justify-between mb-10 gap-4 flex-wrap"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <SlidersHorizontal className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setSelectedVehicleType('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    selectedVehicleType === 'all'
                      ? 'bg-[#019242] text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-[#019242] hover:text-[#019242]'
                  }`}
                >
                  Tümü
                  <span className="ml-1.5 text-[10px] font-semibold opacity-70">({packages.length})</span>
                </button>
                {vehicleTypes.filter(t => t !== 'all').map((type) => {
                  const Icon = getVehicleIcon(type);
                  const count = packages.filter(p => p.vehicle_type === type).length;
                  return (
                    <button
                      key={type}
                      onClick={() => setSelectedVehicleType(type)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedVehicleType === type
                          ? 'bg-[#019242] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#019242] hover:text-[#019242]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {type}
                      <span className="text-[10px] font-semibold opacity-70">({count})</span>
                    </button>
                  );
                })}
              </div>
              <span className="text-sm text-gray-400 font-medium flex-shrink-0">{filteredPackages.length} paket</span>
            </motion.div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-32">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#019242] mx-auto mb-3" />
                  <p className="text-sm text-gray-400">Paketler yükleniyor...</p>
                </div>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-28">
                <div className="w-14 h-14 rounded-xl border border-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Car className="h-6 w-6 text-gray-300" />
                </div>
                <p className="font-semibold text-gray-900 mb-1">Paket bulunamadı</p>
                <p className="text-sm text-gray-400">Farklı bir araç türü deneyin.</p>
                <button onClick={() => setSelectedVehicleType('all')} className="mt-4 text-sm font-medium text-[#019242] hover:text-[#017A35] transition-colors">
                  Tümünü gör
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {filteredPackages.map((pkg, index) => {
                  const VehicleIcon = getVehicleIcon(pkg.vehicle_type);
                  const tier = getPackageTier(pkg.name);

                  return (
                    <motion.div
                      key={pkg.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.06 }}
                      className="relative rounded-2xl border border-gray-100 bg-white flex flex-col hover:shadow-lg transition-shadow duration-300"
                    >
                      {/* Popüler badge — sadece highlighted pakette, sade */}
                      {tier.highlighted && (
                        <div className="absolute -top-3 left-6">
                          <span className="bg-[#019242] text-white text-[11px] font-semibold px-3 py-1 rounded-full">
                            En Çok Tercih Edilen
                          </span>
                        </div>
                      )}

                      {/* Kart içi */}
                      <div className="p-7 flex flex-col flex-grow">

                        {/* Üst: ikon + araç tipi + fiyat */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0">
                              <VehicleIcon className="h-5 w-5 text-gray-500" />
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{pkg.vehicle_type}</p>
                              <h3 className="text-base font-bold text-gray-900 leading-tight mt-0.5">{pkg.name}</h3>
                            </div>
                          </div>
                          {pkg.price && (
                            <div className="text-right flex-shrink-0 ml-3">
                              <p className="text-2xl font-bold text-gray-900 leading-none">
                                {Number(pkg.price).toLocaleString('tr-TR')}
                                <span className="text-sm font-normal text-gray-400 ml-0.5">₺</span>
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5">/ yıl</p>
                            </div>
                          )}
                        </div>

                        {/* Açıklama */}
                        {pkg.description && (
                          <p className="text-sm text-gray-500 leading-relaxed mb-5 line-clamp-2">{pkg.description}</p>
                        )}

                        {/* Araç yaşı */}
                        <div className="flex items-center gap-1.5 mb-5 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          Maks. {pkg.max_vehicle_age} yaş araç
                        </div>

                        {/* Ayraç */}
                        <div className="h-px bg-gray-100 mb-5" />

                        {/* Teminatlar */}
                        <ul className="space-y-3 flex-grow mb-6">
                          {pkg.covers.slice(0, 6).map((cover) => (
                            <li key={cover.id} className="flex items-start gap-3">
                              <Check className="h-3.5 w-3.5 text-[#019242] flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-600 leading-snug">
                                {cover.title}
                                {cover.usage_count > 1 && (
                                  <span className="text-xs text-gray-400 ml-1">({cover.usage_count}x)</span>
                                )}
                              </span>
                            </li>
                          ))}
                          {pkg.covers.length > 6 && (
                            <li className="flex items-center gap-1 text-xs text-gray-400 pl-[22px]">
                              +{pkg.covers.length - 6} daha fazla teminat
                            </li>
                          )}
                        </ul>

                        <Link to={`/purchase/${pkg.id}`} className="block">
                          <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white h-11 rounded-xl text-sm font-semibold transition-colors group">
                            Hemen Satın Al
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ===== TRUST BAR ===== */}
        <section className="bg-gray-50 py-10 border-y border-gray-100">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: '3.400+', label: 'Mutlu Müşteri' },
                { val: '81 İl', label: 'Kapsama Alanı' },
                { val: 'Ort. 25 dk', label: 'Yanıt Süresi' },
                { val: '7/24', label: 'Kesintisiz Destek' },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <p className="text-2xl font-bold text-[#019242]">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="bg-[#019242] py-16 md:py-20">
          <div className="container mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-xl mx-auto"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-green-300 mb-3">Fırsat</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
                Bayilik Ağımıza Katılın
              </h2>
              <p className="text-white/65 text-sm mb-8 leading-relaxed">
                Yol yardım hizmetleri sektöründe yerinizi alın. Güçlü altyapı ve destek ekibimizle büyüyün.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/bayilik-basvurusu">
                  <Button className="bg-white text-[#019242] hover:bg-green-50 font-semibold px-7 py-3 rounded-xl text-sm transition-colors">
                    Bayilik Başvurusu Yap
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <a href="tel:08503045440" className="flex items-center gap-2 text-white/80 hover:text-white text-sm font-medium transition-colors">
                  <Phone className="h-4 w-4" />
                  0850 304 54 40
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <PublicFooter />
      </div>
    </>
  );
}
