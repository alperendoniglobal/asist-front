import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import {
  Users,
  Car,
  Package,
  ShoppingCart,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Shield,
  Zap,
  BarChart3,
  CheckCircle2,
  Activity,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function LandingPage() {
  // Sürekli değişen istatistikler
  const stats = [
    { label: 'Aktif Kullanıcı', value: 1250, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', borderHover: 'hover:border-blue-300' },
    { label: 'Toplam Satış', value: 8500, icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-100', borderHover: 'hover:border-emerald-300' },
    { label: 'Müşteri Memnuniyeti', value: 98, suffix: '%', icon: Star, color: 'text-amber-600', bg: 'bg-amber-100', borderHover: 'hover:border-amber-300' },
    { label: 'Sistem Uptime', value: 99.9, suffix: '%', icon: Activity, color: 'text-cyan-600', bg: 'bg-cyan-100', borderHover: 'hover:border-cyan-300' },
  ];

  // Banner slider verileri - Her banner için sol ve sağ içerik
  const banners = [
    {
      image: '/banner1.jpeg',
      // Sol taraf içeriği
      leftContent: {
        badge: 'Modern Teknoloji',
        title: 'Yol Asistan',
        subtitle: 'Modern Sigorta Yönetim Sistemi',
        description: 'Sigorta acenteleriniz için tasarlanmış, kapsamlı ve kullanıcı dostu yönetim platformu. Müşterilerinizi, satışlarınızı ve ödemelerinizi tek bir yerden yönetin.',
        feature: 'Otomatik Komisyon Hesaplama',
        featureIcon: TrendingUp
      },
      // Sağ taraf içeriği
      rightContent: {
        title: 'Yol Asistan ile Güvende Olun',
        subtitle: '7/24 Yol Yardım Hizmeti',
        description: 'Araçlarınız için kapsamlı sigorta çözümleri ve anında yol yardım desteği'
      },
      // Banner'a özel istatistikler
      bannerStats: [
        { label: 'Aktif Kullanıcı', value: 1250, icon: Users },
        { label: 'Toplam Satış', value: 8500, icon: ShoppingCart },
        { label: 'Müşteri Memnuniyeti', value: 98, suffix: '%', icon: Star },
        { label: 'Sistem Uptime', value: 99.9, suffix: '%', icon: Activity },
      ]
    },
    {
      image: '/banner2.jpeg',
      // Sol taraf içeriği
      leftContent: {
        badge: 'Güvenilir Çözüm',
        title: 'Profesyonel Hizmet',
        subtitle: 'Deneyimli Ekip ile Yanınızdayız',
        description: 'Yılların deneyimi ile sigorta sektöründe güvenilir çözümler sunuyoruz. Müşteri memnuniyeti bizim önceliğimizdir.',
        feature: 'Gerçek Zamanlı Raporlama',
        featureIcon: BarChart3
      },
      // Sağ taraf içeriği
      rightContent: {
        title: 'Hızlı ve Güvenilir Hizmet',
        subtitle: 'Profesyonel Ekip',
        description: 'Deneyimli ekibimiz ile her zaman yanınızdayız. 7/24 destek hizmetimiz ile sorunlarınıza anında çözüm buluyoruz.'
      },
      // Banner'a özel istatistikler
      bannerStats: [
        { label: 'Aktif Acente', value: 500, icon: Users },
        { label: 'Toplam Şube', value: 1200, icon: Package },
        { label: 'Mutlu Müşteri', value: 50000, icon: Star },
        { label: 'Başarı Oranı', value: 99.5, suffix: '%', icon: Activity },
      ]
    },
    {
      image: '/banner3.png',
      // Sol taraf içeriği
      leftContent: {
        badge: 'Yol Yardım',
        title: '7/24 Destek',
        subtitle: 'Her Zaman Yanınızdayız',
        description: 'Yolda kaldığınızda anında yardım. Profesyonel ekip ve hızlı çözümler ile güvenle yolculuğunuza devam edin.',
        feature: 'Anında Yol Yardımı',
        featureIcon: Shield
      },
      // Sağ taraf içeriği
      rightContent: {
        title: 'Yolda Kaldınız mı?',
        subtitle: 'Hemen Yardım Alın',
        description: '7/24 yol yardım hizmetimiz ile her zaman yanınızdayız. Çekici, tamirci ve acil durum desteği.'
      },
      // Banner'a özel istatistikler
      bannerStats: [
        { label: 'Yardım Çağrısı', value: 15000, icon: Activity },
        { label: 'Ortalama Süre', value: 25, suffix: ' dk', icon: Clock },
        { label: 'Müşteri Memnuniyeti', value: 98.5, suffix: '%', icon: Star },
        { label: 'Aktif Araç', value: 2500, icon: Car },
      ]
    }
  ];

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  
  // Banner istatistikleri için state - İlk banner'ın stats'ı ile başlat
  const [animatedBannerStats, setAnimatedBannerStats] = useState(
    banners[0]?.bannerStats?.map(s => ({ ...s, displayValue: 0 })) || stats.map(s => ({ ...s, displayValue: 0 }))
  );


  // Banner slider animasyonu
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);
  
  // Banner değiştiğinde istatistikleri sıfırla ve animasyonu başlat
  useEffect(() => {
    const currentBannerStats = banners[currentBannerIndex]?.bannerStats || stats;
    setAnimatedBannerStats(currentBannerStats.map(s => ({ ...s, displayValue: 0 })));
    
    const duration = 1500;
    const steps = 60;
    const stepDuration = duration / steps;
    const timers: ReturnType<typeof setInterval>[] = [];

    currentBannerStats.forEach((stat, index) => {
      let currentStep = 0;
      const increment = stat.value / steps;

      const timer = setInterval(() => {
        currentStep++;
        const newValue = Math.min(Math.floor(increment * currentStep), stat.value);
        
        setAnimatedBannerStats((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            updated[index] = { ...updated[index], displayValue: newValue };
          }
          return updated;
        });

        if (currentStep >= steps) {
          clearInterval(timer);
        }
      }, stepDuration);
      
      timers.push(timer);
    });

    return () => {
      timers.forEach(timer => clearInterval(timer));
    };
  }, [currentBannerIndex]);


  // Özellikler listesi
  const features = [
    {
      icon: Users,
      title: 'Müşteri Yönetimi',
      description: 'Müşterilerinizi kolayca kaydedin, düzenleyin ve takip edin. Detaylı müşteri bilgileri ve geçmiş kayıtlarına hızlıca erişin.',
      gradient: 'from-blue-500 via-blue-600 to-blue-700'
    },
    {
      icon: Car,
      title: 'Araç Takibi',
      description: 'Araç bilgilerini sisteme kaydedin, plaka bazlı arama yapın ve araç geçmişini görüntüleyin.',
      gradient: 'from-emerald-500 via-emerald-600 to-teal-700'
    },
    {
      icon: Package,
      title: 'Paket Yönetimi',
      description: 'Sigorta paketlerini oluşturun, fiyatlandırın ve müşterilerinize sunun. Yaş ve kullanım tipine göre otomatik filtreleme.',
      gradient: 'from-cyan-500 via-cyan-600 to-blue-700'
    },
    {
      icon: ShoppingCart,
      title: 'Satış Yönetimi',
      description: 'Satış işlemlerini tek ekrandan yönetin. Müşteri, araç ve paket seçimini kolaylaştıran modern arayüz.',
      gradient: 'from-amber-500 via-orange-500 to-red-600'
    },
    {
      icon: CreditCard,
      title: 'Ödeme Entegrasyonu',
      description: 'Iyzico ile güvenli ödeme alın. Kredi kartı, havale ve bakiye ile ödeme seçenekleri.',
      gradient: 'from-cyan-500 via-cyan-600 to-blue-700'
    },
    {
      icon: TrendingUp,
      title: 'Raporlama ve İstatistikler',
      description: 'Detaylı dashboard ile satış, gelir ve komisyon istatistiklerinizi görüntüleyin. Grafiklerle verilerinizi analiz edin.',
      gradient: 'from-pink-500 via-rose-600 to-red-700'
    }
  ];

  // Avantajlar listesi
  const benefits = [
    'Çoklu kullanıcı rolü desteği',
    'Acente ve şube bazlı yönetim',
    'Otomatik komisyon hesaplama',
    'İade işlemleri yönetimi',
    'Destek ticket sistemi',
    'Güvenli ve hızlı altyapı'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header - Ana renk (slate-900) */}
      <header className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <img 
                src="/cozumasistanlog.svg" 
                alt="Cozum Yol Asistan Logo" 
                className="h-8"
              />
            </div>
          </div>
          <Link to="/login">
            <Button size="lg" className="gap-2 bg-white text-slate-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all">
              Giriş Yap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Full Slider */}
      <section className="relative h-screen overflow-hidden">
        {/* Banner Slider - Tüm section */}
        <div className="relative w-full h-full">
          {banners.map((banner, index) => {
            const isActive = index === currentBannerIndex;
            
            return (
              <div
                key={index}
                className={`absolute inset-0 ${
                  isActive 
                    ? 'opacity-100 z-10' 
                    : 'opacity-0 z-0 pointer-events-none'
                }`}
                style={{
                  transform: isActive 
                    ? 'translateX(0) scale(1)' 
                    : index < currentBannerIndex 
                      ? 'translateX(-50%) scale(0.85)' 
                      : 'translateX(50%) scale(0.85)',
                  filter: isActive ? 'blur(0px)' : 'blur(4px)',
                  transition: 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'opacity, transform, filter'
                }}
              >
              {/* Arka plan görseli */}
              <div className="absolute inset-0">
                <img
                  src={banner.image}
                  alt={banner.rightContent.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/50"></div>
              </div>
              
              {/* İçerik - Grid layout */}
              <div className="container mx-auto px-4 py-8 md:py-12 relative z-20 h-full">
                <div className="max-w-7xl mx-auto h-full flex items-center">
                  <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
                    {/* Sol taraf - Metin içeriği */}
                    <div 
                      className="space-y-8 text-white"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                        transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
                        willChange: 'opacity, transform'
                      }}
                    >
                      <div className="space-y-4">
                        <div className="inline-block">
                          <span className="px-4 py-2 rounded-full bg-blue-500/30 backdrop-blur-sm text-blue-200 text-sm font-semibold border border-blue-400/30">
                            {banner.leftContent.badge}
                          </span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white">
                          {banner.leftContent.title}
                        </h1>
                        <p className="text-2xl md:text-3xl font-bold text-white/90">
                          {banner.leftContent.subtitle}
                        </p>
                        <p className="text-lg md:text-xl text-white/80 leading-relaxed">
                          {banner.leftContent.description}
                        </p>
                      </div>

                      {/* Özellik */}
                      <div 
                        className="flex items-center gap-3 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateX(0)' : 'translateX(-20px)',
                          transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
                          willChange: 'opacity, transform'
                        }}
                      >
                        <div className="p-2 rounded-lg bg-blue-500/30">
                          <banner.leftContent.featureIcon className="h-5 w-5 text-blue-200" />
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium text-white">
                            {banner.leftContent.feature}
                          </p>
                        </div>
                      </div>

                      {/* CTA Butonları */}
                      <div 
                        className="flex flex-col sm:flex-row gap-4"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                          transition: 'opacity 0.6s ease-out 0.4s, transform 0.6s ease-out 0.4s',
                          willChange: 'opacity, transform'
                        }}
                      >
                        <Link to="/login" className="flex-1 sm:flex-none">
                          <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 h-auto gap-2 shadow-xl hover:shadow-2xl bg-white text-slate-900 hover:bg-blue-50 border-0 transition-all transform hover:scale-105 font-bold">
                            Hemen Başla
                            <ArrowRight className="h-5 w-5" />
                          </Button>
                        </Link>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="text-lg px-8 py-6 h-auto border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50 transition-all transform hover:scale-105"
                          onClick={() => {
                            const featuresSection = document.getElementById('features');
                            featuresSection?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          Özellikleri Keşfet
                        </Button>
                      </div>
                    </div>

                    {/* Sağ taraf - Banner içerik kartı */}
                    <div 
                      className="relative"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)',
                        transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
                        willChange: 'opacity, transform'
                      }}
                    >
                      <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                        {/* Üst kısım */}
                        <div className="flex items-center gap-3 text-white mb-6">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                            <Shield className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-bold text-sm">Güvenli Altyapı</p>
                            <p className="text-xs text-white/80">SSL şifreleme ile korunuyor</p>
                          </div>
                        </div>
                        
                        {/* Banner yazıları */}
                        <div className="space-y-4 text-white mb-8">
                          <div>
                            <p className="text-sm font-semibold text-blue-300 mb-2">{banner.rightContent.subtitle}</p>
                            <h2 className="text-3xl md:text-4xl font-black mb-3">{banner.rightContent.title}</h2>
                            <p className="text-lg text-white/90">{banner.rightContent.description}</p>
                          </div>
                        </div>
                        
                        {/* Alt kısım - İstatistikler (Banner'a özel) */}
                        <div className="grid grid-cols-2 gap-4">
                          {animatedBannerStats.map((stat, statIndex) => {
                            const Icon = stat.icon;
                            return (
                              <div 
                                key={statIndex}
                                className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all group"
                              >
                                <div className="flex items-center gap-3 mb-2">
                                  <div className="p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform">
                                    <Icon className="h-5 w-5 text-white" />
                                  </div>
                                </div>
                                <p className="text-3xl font-black text-white mb-1">
                                  {stat.suffix === '%' || stat.suffix === ' dk'
                                    ? stat.displayValue.toFixed(stat.suffix === '%' ? 1 : 0)
                                    : stat.displayValue.toLocaleString()}
                                  {stat.suffix && <span className="text-xl">{stat.suffix}</span>}
                                </p>
                                <p className="text-xs font-medium text-white/80">
                                  {stat.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            );
          })}
        </div>
        
        {/* Slider kontrolleri */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentBannerIndex 
                  ? 'w-8 bg-white' 
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Önceki/Sonraki butonları */}
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white shadow-lg"
          aria-label="Önceki banner"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white shadow-lg"
          aria-label="Sonraki banner"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-24 relative bg-slate-50">
        <div className="relative z-10">
          <div className="text-center mb-20">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold">
                Özellikler
              </span>
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-slate-900">
              Güçlü Özellikler
            </h2>
            <p className="text-xl md:text-2xl text-slate-700 max-w-3xl mx-auto leading-relaxed">
              İşinizi kolaylaştıran, verimliliğinizi artıran özellikler
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              // Her kart için farklı renk tonu - Header/banner ile uyumlu (slate-900 ana renk)
              const colorClasses = [
                { icon: 'bg-slate-900 text-white', border: 'border-slate-300', hover: 'hover:border-slate-900' },
                { icon: 'bg-slate-800 text-white', border: 'border-slate-300', hover: 'hover:border-slate-800' },
                { icon: 'bg-slate-700 text-white', border: 'border-slate-300', hover: 'hover:border-slate-700' },
                { icon: 'bg-slate-900 text-white', border: 'border-slate-300', hover: 'hover:border-slate-900' },
                { icon: 'bg-slate-800 text-white', border: 'border-slate-300', hover: 'hover:border-slate-800' },
                { icon: 'bg-slate-700 text-white', border: 'border-slate-300', hover: 'hover:border-slate-700' },
              ];
              const colors = colorClasses[index % colorClasses.length];
              
              return (
                <Card 
                  key={index}
                  className={`relative overflow-hidden bg-white border-2 ${colors.border} ${colors.hover} shadow-lg hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-1`}
                >
                  <CardContent className="p-8 min-h-[280px] flex flex-col">
                    {/* Icon Container */}
                    <div className="mb-6">
                      <div className={`p-4 rounded-xl ${colors.icon} w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-slate-900 transition-colors">
                      {feature.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-base text-slate-600 leading-relaxed flex-grow mb-4">
                      {feature.description}
                    </p>
                    
                    {/* Arrow indicator */}
                    <div className="flex items-center text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors mt-auto">
                      <span>Daha fazla</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                    
                    {/* Subtle background decoration */}
                    <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${colors.icon} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-24 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold">
                Süreç
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-slate-700 max-w-2xl mx-auto">
              Basit 3 adımda başlayın ve işinizi dijitalleştirin
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Hesap Oluştur',
                description: 'Hemen kayıt olun ve acentenizi sisteme ekleyin. Kurulum sadece birkaç dakika sürer.',
                icon: Users,
                color: 'blue'
              },
              {
                step: '02',
                title: 'Paketlerinizi Ekleyin',
                description: 'Sigorta paketlerinizi oluşturun, fiyatlandırın ve müşterilerinize sunmaya başlayın.',
                icon: Package,
                color: 'emerald'
              },
              {
                step: '03',
                title: 'Satış Yapmaya Başlayın',
                description: 'Müşterilerinizi ekleyin, satış yapın ve tüm işlemlerinizi tek yerden yönetin.',
                icon: ShoppingCart,
                color: 'cyan'
              }
            ].map((item, index) => {
              const Icon = item.icon;
              const colorClasses = {
                blue: { bg: 'bg-slate-900', text: 'text-white', border: 'border-slate-300' },
                emerald: { bg: 'bg-slate-800', text: 'text-white', border: 'border-slate-300' },
                cyan: { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-300' },
              };
              const colors = colorClasses[item.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className="relative">
                  {/* Connecting line */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-slate-300 to-slate-200 z-0" style={{ width: 'calc(100% - 4rem)', marginLeft: '2rem' }}></div>
                  )}
                  
                  <Card className={`border-2 ${colors.border} bg-white hover:shadow-xl transition-all group cursor-pointer h-full`}>
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} text-2xl font-black mb-4 group-hover:scale-110 transition-transform`}>
                          {item.step}
                        </div>
                        <div className={`inline-flex p-4 rounded-xl ${colors.bg} group-hover:scale-110 transition-transform`}>
                          <Icon className={`h-8 w-8 ${colors.text}`} />
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-3">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.description}</p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Showcase Section */}
      <section className="container mx-auto px-4 py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block mb-4">
              <span className="px-4 py-2 rounded-full bg-white/20 text-white text-sm font-semibold">
                İstatistikler
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Rakamlarla Yol Asistan
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Binlerce acente ve şube tarafından güvenle kullanılıyor
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Aktif Acente', icon: Users },
              { number: '1.2K+', label: 'Toplam Şube', icon: Package },
              { number: '50K+', label: 'Mutlu Müşteri', icon: Star },
              { number: '99.9%', label: 'Uptime Oranı', icon: Activity },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all group cursor-pointer border border-white/20">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <div className="inline-flex p-3 rounded-xl bg-white/20 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <p className="text-4xl md:text-5xl font-black mb-2">{stat.number}</p>
                    <p className="text-sm text-slate-300 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-24 relative bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Sol taraf - Benefits */}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="inline-block">
                  <span className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold">
                    Avantajlar
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900">
                  Neden Yol Asistan?
                </h2>
                <p className="text-xl text-slate-700 leading-relaxed">
                  Sigorta acenteleriniz için özel olarak tasarlanmış, modern ve güvenilir bir platform. 
                  İş süreçlerinizi dijitalleştirin ve verimliliğinizi artırın.
                </p>
              </div>
              
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-slate-900 group-hover:bg-slate-800 transition-colors">
                      <CheckCircle2 className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-lg font-medium text-slate-800 group-hover:text-slate-900">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sağ taraf - Araba görseli ve özellik kartları */}
            <div className="space-y-6">
              {/* Araba görseli - Benefits section'da (internetten) */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-emerald-500/20 blur-xl group-hover:blur-2xl transition-all"></div>
                <img 
                  src="https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=500&fit=crop&q=80" 
                  alt="Araba" 
                  className="w-full h-64 object-cover relative z-10 group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-20"></div>
              </div>
              
              {/* Özellik kartları - Header/banner ile uyumlu renkler */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-900 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-white/20 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Zap className="h-8 w-8" />
                    </div>
                    <p className="text-2xl font-bold mb-1">Hızlı</p>
                    <p className="text-sm text-slate-300">Yüksek performans</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-white/20 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Shield className="h-8 w-8" />
                    </div>
                    <p className="text-2xl font-bold mb-1">Güvenli</p>
                    <p className="text-sm text-slate-300">Veri koruması</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-white/20 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <BarChart3 className="h-8 w-8" />
                    </div>
                    <p className="text-2xl font-bold mb-1">Akıllı</p>
                    <p className="text-sm text-slate-300">Detaylı analiz</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-900 text-white border-0 shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="p-3 rounded-xl bg-white/20 w-fit mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Users className="h-8 w-8" />
                    </div>
                    <p className="text-2xl font-bold mb-1">Kolay</p>
                    <p className="text-sm text-slate-300">Kullanıcı dostu</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24 relative">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background - Ana renk (slate-900) */}
          <div className="absolute inset-0 bg-slate-900"></div>
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
          
          <Card className="border-0 shadow-2xl bg-transparent relative z-10">
            <CardContent className="p-12 md:p-20 text-center relative">
              {/* Decorative circles */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-800/30 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <h2 className="text-5xl md:text-6xl font-black mb-6 text-white">
                  Hemen Başlayın
                </h2>
                <p className="text-2xl text-slate-300 mb-10 max-w-3xl mx-auto leading-relaxed">
                  Yol Asistan ile sigorta yönetim süreçlerinizi dijitalleştirin ve işinizi büyütün.
                </p>
                <Link to="/login">
                  <Button 
                    size="lg" 
                    variant="secondary" 
                    className="text-xl px-12 py-8 h-auto gap-3 shadow-2xl hover:shadow-white/50 bg-white text-slate-900 hover:bg-blue-50 border-0 transition-all transform hover:scale-110 font-bold"
                  >
                    Giriş Yap ve Başla
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer - Ana renk (slate-900) */}
      <footer className="border-t border-slate-800 bg-slate-900 backdrop-blur-sm relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
                <img 
                  src="/cozumasistanlog.svg" 
                  alt="Yol Asistan Logo" 
                  className="h-8"
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2021 Yol Asistan. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

