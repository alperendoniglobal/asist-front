import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { publicService, type PublicPackage } from '@/services/publicService';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
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
  Zap,
  Star,
  Menu,
  X,
  User
} from 'lucide-react';

/**
 * Public Paketler Sayfası
 * Dark mode'dan etkilenmeyen, responsive tasarım
 * Tüm aktif paketleri fiyatsız olarak görüntüler
 */
export default function PublicPackages() {
  const { userCustomer, isAuthenticated } = useUserCustomer();
  const [packages, setPackages] = useState<PublicPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Paketleri yükle
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

  // Araç türüne göre ikon
  const getVehicleIcon = (vehicleType: string) => {
    const icons: Record<string, any> = {
      'Otomobil': Car,
      'Motosiklet': Bike,
      'Kamyonet': Truck,
      'Minibüs': Bus,
      'Midibüs': Bus,
      'Taksi': Car,
      'Kamyon': Truck,
      'Çekici': Truck,
    };
    return icons[vehicleType] || Car;
  };

  // Unique araç türleri
  const vehicleTypes = ['all', ...new Set(packages.map(p => p.vehicle_type))];

  // Filtrelenmiş paketler
  const filteredPackages = selectedVehicleType === 'all'
    ? packages
    : packages.filter(p => p.vehicle_type === selectedVehicleType);

  // Paket tier'ına göre stil - Yeşil tonlarında
  const getPackageTier = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('ultra') || nameLower.includes('premium') || nameLower.includes('plus')) {
      return {
        tier: 'premium',
        accent: 'bg-[#017A35]',
        accentLight: 'bg-emerald-50',
        accentText: 'text-[#017A35]',
        accentBorder: 'border-emerald-200',
        badge: 'bg-[#017A35]',
        icon: Sparkles
      };
    }
    if (nameLower.includes('standart') || nameLower.includes('standard')) {
      return {
        tier: 'standard',
        accent: 'bg-[#019242]',
        accentLight: 'bg-green-50',
        accentText: 'text-[#019242]',
        accentBorder: 'border-green-200',
        badge: 'bg-[#019242]',
        icon: Shield
      };
    }
    // Default - basic
    return {
      tier: 'basic',
      accent: 'bg-[#019242]',
      accentLight: 'bg-green-50',
      accentText: 'text-[#019242]',
      accentBorder: 'border-green-200',
      badge: 'bg-[#019242]',
      icon: Zap
    };
  };

  return (
    <>
      <Helmet>
        <title>Yol Yardım Paketleri | Çözüm Net A.Ş</title>
        <meta name="description" content="Yol yardım paketlerimizi inceleyin. Otomobil, motosiklet, kamyonet ve daha fazlası için 7/24 yol yardım hizmeti." />
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page min-h-screen bg-gray-50 text-gray-900" style={{ colorScheme: 'light' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#019242] flex items-center justify-center">
                <img 
                  src="/cozumasistanlog.svg" 
                  alt="Çözüm Net A.Ş Logo" 
                  className="h-5 sm:h-6"
                />
              </div>
              <span className="font-bold text-gray-900 text-sm sm:text-base hidden sm:block">Çözüm Net A.Ş</span>
            </Link>
            
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Ana Sayfa
              </Link>
              <Link to="/bayilik-basvurusu" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
                Bayilik Başvurusu
              </Link>
              {/* Giriş yapmış kullanıcı için dashboard linki, yoksa giriş butonu */}
              {isAuthenticated && userCustomer ? (
                <Link to="/user/dashboard">
                  <Button size="sm" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full">
                    <User className="h-4 w-4 mr-2" />
                    {userCustomer.name}
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="bg-[#019242] hover:bg-[#017A35] text-white rounded-full">
                    Giriş Yap
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4">
              <nav className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
                <Link 
                  to="/bayilik-basvurusu" 
                  className="text-gray-700 hover:bg-gray-50 py-2 px-3 rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Bayilik Başvurusu
                </Link>
                {/* Giriş yapmış kullanıcı için dashboard linki, yoksa giriş butonu */}
                {isAuthenticated && userCustomer ? (
                  <Link to="/user/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full mt-2">
                      <User className="h-4 w-4 mr-2" />
                      {userCustomer.name}
                    </Button>
                  </Link>
                ) : (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-full mt-2">
                      Giriş Yap
                    </Button>
                  </Link>
                )}
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#019242] text-white py-12 sm:py-16 md:py-20">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }} />
          </div>
          
          <div className="container mx-auto px-4 relative">
            <Link to="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 sm:mb-8 transition-colors group text-sm">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Ana Sayfaya Dön
            </Link>
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight">
                Yol Yardım <span className="text-blue-200">Paketleri</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-10 leading-relaxed">
                Aracınız için en uygun paketi seçin, 7/24 yol yardım güvencesiyle güvenle yolculuk yapın.
              </p>
              <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-blue-200">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                    <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm">Güvenli Hizmet</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm">7/24 Destek</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm">Anında Yardım</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Paketler */}
        <section className="py-10 sm:py-14 md:py-20">
          <div className="container mx-auto px-4">
            {/* Araç Türü Filtresi */}
            <div className="mb-8 sm:mb-12 overflow-x-auto pb-2">
              <Tabs value={selectedVehicleType} onValueChange={setSelectedVehicleType}>
                <TabsList className="flex gap-2 h-auto bg-transparent p-0 justify-start sm:justify-center min-w-max">
                  {vehicleTypes.map((type) => {
                    const Icon = type === 'all' ? Car : getVehicleIcon(type);
                    const count = type === 'all' ? packages.length : packages.filter(p => p.vehicle_type === type).length;
                    return (
                      <TabsTrigger 
                        key={type} 
                        value={type}
                        className="bg-white hover:bg-gray-50 data-[state=active]:bg-[#019242] data-[state=active]:text-white px-3 sm:px-5 py-2 sm:py-2.5 rounded-full border border-gray-200 data-[state=active]:border-[#019242] shadow-sm transition-all text-sm"
                      >
                        <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span className="font-medium">{type === 'all' ? 'Tümü' : type}</span>
                        <Badge variant="secondary" className="ml-1.5 sm:ml-2 text-xs bg-gray-100 data-[state=active]:bg-white/20">
                          {count}
                        </Badge>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20 sm:py-32">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 sm:h-10 sm:w-10 animate-spin text-[#019242] mx-auto mb-4" />
                  <span className="text-gray-500 text-sm sm:text-base">Paketler yükleniyor...</span>
                </div>
              </div>
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-20 sm:py-32">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Car className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Paket Bulunamadı</h3>
                <p className="text-gray-500 text-sm sm:text-base">Seçili araç türü için paket bulunmuyor.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredPackages.map((pkg) => {
                  const VehicleIcon = getVehicleIcon(pkg.vehicle_type);
                  const tier = getPackageTier(pkg.name);

                  return (
                    <Card 
                      key={pkg.id} 
                      className="group relative bg-white border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      {/* Top accent line - Minimal */}
                      <div className={`h-1 ${tier.accent}`} />
                      
                      <CardContent className="p-5">
                        {/* Header - Minimal & Clean */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-12 h-12 rounded-xl ${tier.accent} flex items-center justify-center shadow-md`}>
                              <VehicleIcon className="h-5 w-5 text-white" />
                            </div>
                            <Badge className={`${tier.badge} text-white text-xs px-3 py-1 font-semibold`}>
                              {pkg.vehicle_type}
                            </Badge>
                          </div>
                          {tier.tier === 'premium' && (
                            <div className="flex items-center gap-1 text-[#019242]">
                              <Star className="h-4 w-4 fill-current" />
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {pkg.name}
                        </h3>
                        {pkg.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                            {pkg.description}
                          </p>
                        )}
                        
                        {/* Vehicle age info - Minimal */}
                        <div className={`inline-flex items-center gap-1.5 ${tier.accentLight} ${tier.accentText} text-xs font-medium px-2.5 py-1 rounded-full mb-4`}>
                          <Clock className="h-3 w-3" />
                          Maks. {pkg.max_vehicle_age} yaş araç
                        </div>

                        {/* Divider */}
                        <div className="border-t border-gray-100 my-4" />

                        {/* Covers - Clean Design */}
                        <div className="mb-5">
                          <ul className="space-y-2.5">
                            {pkg.covers.slice(0, 6).map((cover) => (
                              <li key={cover.id} className="flex items-start gap-2.5">
                                <div className={`w-5 h-5 rounded-md ${tier.accent} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                                  <Check className="h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm text-gray-700 leading-relaxed">{cover.title}</span>
                                    {cover.usage_count > 1 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                        ({cover.usage_count}x)
                                      </span>
                                    )}
                                </div>
                              </li>
                            ))}
                            {pkg.covers.length > 6 && (
                              <li className="text-xs text-gray-500 pl-8 italic">
                                +{pkg.covers.length - 6} daha fazla hizmet
                              </li>
                            )}
                          </ul>
                        </div>

                        {/* Fiyat - Professional Style */}
                        {pkg.price && (
                          <div className="mb-5 pb-4 border-b border-gray-100">
                            <div className="flex items-baseline justify-between">
                              <span className="text-sm text-gray-500">Fiyat</span>
                              <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900">
                                  {Number(pkg.price).toLocaleString('tr-TR')}
                              </span>
                                <span className="text-base text-gray-500">₺</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">KDV dahil / yıl</p>
                          </div>
                        )}

                        {/* CTA - Professional Button */}
                        <Link to={`/purchase/${pkg.id}`} className="block">
                          <Button 
                            className={`w-full ${tier.accent} hover:opacity-90 text-white font-semibold h-11 rounded-lg shadow-md hover:shadow-lg transition-all text-sm`}
                          >
                            Detaylı Bilgi
                            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#019242] text-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm mb-4 sm:mb-6">
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400" />
                <span className="text-blue-100">Bayilik Fırsatı</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Bayilik Ağımıza Katılın
              </h2>
              <p className="text-blue-100 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
                Yol yardım hizmetleri sektöründe yerinizi alın. Hemen başvurun.
              </p>
              <Link to="/bayilik-basvurusu">
                <Button size="lg" className="bg-white text-[#019242] hover:bg-gray-100 font-semibold px-6 sm:px-8 py-4 sm:py-6 rounded-full shadow-xl text-sm sm:text-base">
                  Bayilik Başvurusu Yap
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 sm:py-10">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-center gap-3">
                <img src="/cozumasistanlog.svg" alt="Logo" className="h-5 sm:h-6" />
                <span className="text-gray-500 text-xs sm:text-sm">© 2023 Çözüm Net A.Ş</span>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-gray-400">
                <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Gizlilik</Link>
                <Link to="/distance-sales-contract" className="hover:text-white transition-colors">Sözleşmeler</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
