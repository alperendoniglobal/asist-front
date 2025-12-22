import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  ChevronRight,
  Phone
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
        badge: 'Yol Yardım Hizmeti',
        title: 'Yol Yardım',
        subtitle: '7/24 Yol Yardım Çekici Hizmeti',
        description: 'Yol yardım hizmetleri Türkiye genelinde. Yol yardım çekici, tamirci ve acil durum desteği. Yol yardım hizmeti için hemen arayın.',
        feature: '7/24 Yol Yardım Çekici Hizmeti',
        featureIcon: TrendingUp
      },
      // Sağ taraf içeriği
      rightContent: {
        title: 'Yol Yardım ile Güvende Olun',
        subtitle: '7/24 Yol Yardım Hizmeti',
        description: 'Yol yardım hizmetleri ile araçlarınız için kapsamlı çözümler ve anında yol yardım desteği'
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
        { label: 'Aktif Kaynak', value: 500, icon: Users },
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


  // Banner slider animasyonu - 12 saniyede bir değişiyor (daha yavaş ve uzun süre duruyor)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 12000); // 12 saniye (önceden 5 saniyeydi)
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
    'Kaynak ve şube bazlı yönetim',
    'Otomatik komisyon hesaplama',
    'İade işlemleri yönetimi',
    'Destek ticket sistemi',
    'Güvenli ve hızlı altyapı'
  ];

  // SEO için structured data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Çözüm Asistan - Yol Yardım Hizmetleri",
    "alternateName": "Yol Yardım Çözüm Asistan",
    "url": window.location.origin,
    "logo": `${window.location.origin}/cozumasistanlog.svg`,
    "description": "Yol yardım hizmetleri Türkiye genelinde 7/24. Yol yardım çekici, tamirci ve acil durum desteği. Yol yardım hizmeti için profesyonel çözümler.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+90-850-304-54-40",
      "contactType": "Müşteri Hizmetleri",
      "availableLanguage": ["Turkish", "Türkçe"],
      "areaServed": "TR"
    },
    "sameAs": [
      // Sosyal medya linkleriniz varsa buraya ekleyin
    ],
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1250"
    },
    "offers": {
      "@type": "Offer",
      "description": "Yol yardım hizmetleri ve sigorta yönetim sistemi",
      "priceCurrency": "TRY"
    }
  };

  const serviceStructuredData = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Yol Yardım Hizmetleri",
    "name": "Yol Yardım Hizmeti",
    "provider": {
      "@type": "Organization",
      "name": "Çözüm Asistan"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "availableChannel": {
      "@type": "ServiceChannel",
      "servicePhone": {
        "@type": "ContactPoint",
        "telephone": "+90-850-304-54-40",
        "contactType": "Müşteri Hizmetleri"
      }
    },
    "description": "Yol yardım hizmetleri 7/24: Yol yardım çekici hizmeti, tamirci desteği, lastik patlaması, yakıt bitmesi, arıza durumunda yol yardım. Türkiye genelinde hızlı ve güvenilir yol yardım servisi."
  };

  // FAQ Schema for SEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Yol yardım hizmeti nedir?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yol yardım hizmeti, yolda kalan araçlar için 7/24 çekici, tamirci ve acil durum desteği sağlayan profesyonel hizmettir. Yol yardım çekici hizmeti ile aracınız en yakın servise götürülür."
        }
      },
      {
        "@type": "Question",
        "name": "Yol yardım hizmeti nasıl alınır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yol yardım hizmeti için 0850 304 54 40 numaralı telefonu arayabilirsiniz. Yol yardım çekici hizmeti Türkiye genelinde 7/24 hizmetinizdedir."
        }
      },
      {
        "@type": "Question",
        "name": "Yol yardım çekici hizmeti hangi durumlarda kullanılır?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yol yardım çekici hizmeti kaza, arıza, lastik patlaması, yakıt bitmesi gibi durumlarda kullanılır. Yol yardım hizmeti ile aracınız güvenle en yakın servise götürülür."
        }
      },
      {
        "@type": "Question",
        "name": "Yol yardım hizmeti ücreti ne kadar?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yol yardım hizmeti ücretleri paket içeriğinize göre değişiklik gösterir. Yol yardım çekici hizmeti için detaylı bilgi almak için 0850 304 54 40 numaralı telefonu arayabilirsiniz."
        }
      }
    ]
  };

  // LocalBusiness Schema for local SEO
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Çözüm Asistan - Yol Yardım Hizmetleri",
    "image": `${window.location.origin}/cozumasistanlog.svg`,
    "telephone": "+90-850-304-54-40",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "39.9334",
      "longitude": "32.8597"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Türkiye"
    },
    "serviceType": "Yol Yardım Hizmetleri"
  };

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <html lang="tr" />
        <title>Yol Yardım | 7/24 Çekici Hizmeti | Çözüm Asistan - Türkiye Geneli</title>
        <meta name="description" content="Yol yardım hizmetleri Türkiye genelinde 7/24. Yol yardım çekici, tamirci ve acil durum desteği. Yol yardım hizmeti için hemen arayın: 0850 304 54 40. Profesyonel yol yardım çözümleri." />
        <meta name="keywords" content="yol yardım, yol yardım hizmeti, yol yardım çekici, yol yardım servisi, 7/24 yol yardım, yol yardım Türkiye, çekici hizmeti, araç kurtarma, lastik patlaması, yakıt bitmesi, arıza yardım, yol asistan, acil yol yardım, yol yardım telefon, yol yardım numarası" />
        <meta name="author" content="Çözüm Asistan" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <link rel="canonical" href={window.location.href} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:title" content="Yol Yardım | 7/24 Çekici Hizmeti | Çözüm Asistan" />
        <meta property="og:description" content="Yol yardım hizmetleri Türkiye genelinde 7/24. Yol yardım çekici, tamirci ve acil durum desteği. Profesyonel yol yardım çözümleri." />
        <meta property="og:image" content={`${window.location.origin}/banner1.jpeg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Çözüm Asistan Yol Yardım Hizmetleri" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:site_name" content="Çözüm Asistan" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content="Yol Yardım | 7/24 Çekici Hizmeti | Çözüm Asistan" />
        <meta name="twitter:description" content="Yol yardım hizmetleri Türkiye genelinde 7/24. Yol yardım çekici ve acil durum desteği." />
        <meta name="twitter:image" content={`${window.location.origin}/banner1.jpeg`} />
        
        {/* Mobile */}
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Çözüm Asistan" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(serviceStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchema)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header - Ana renk (slate-900) */}
      <header role="banner" className="sticky top-0 z-50 bg-slate-900 backdrop-blur-md border-b border-slate-800 shadow-xl">
        <div className="container mx-auto px-3 sm:px-4 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <img 
                src="/cozumasistanlog.svg" 
                alt="Çözüm Asistan - Yol Yardım Hizmetleri Logo" 
                className="h-6 sm:h-7 md:h-8"
                width="120"
                height="40"
              />
            </div>
          </div>
          <Link to="/login">
            <Button size="sm" className="sm:size-default gap-1.5 sm:gap-2 bg-white text-slate-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transition-all text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="hidden sm:inline">Giriş Yap</span>
              <span className="sm:hidden">Giriş</span>
              <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section - Full Slider */}
      <main role="main">
        <section aria-label="Ana banner slider ve hizmet tanıtımı" className="relative min-h-screen md:h-screen overflow-hidden">
        {/* Banner Slider - Tüm section */}
        <div className="relative w-full h-full min-h-screen md:min-h-0">
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
                  transition: 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), filter 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  willChange: 'opacity, transform, filter'
                }}
              >
                {/* Arka plan görseli */}
                <div className="absolute inset-0">
                  <img
                    src={banner.image}
                    alt={`${banner.rightContent.title} - ${banner.rightContent.subtitle} - Çözüm Asistan Yol Yardım Hizmetleri`}
                    className="w-full h-full object-cover"
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                  {/* Gradient overlay - Mobilde daha koyu */}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/85 to-slate-900/70 md:from-slate-900/90 md:via-slate-900/70 md:to-slate-900/50"></div>
                </div>
                
                {/* İçerik - Grid layout */}
                <div className="container mx-auto px-4 py-6 md:py-8 lg:py-12 relative z-20 h-full min-h-screen md:min-h-0 flex items-center">
                  <div className="max-w-7xl mx-auto w-full">
                    <div className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center w-full">
                      {/* Sol taraf - Metin içeriği */}
                      <div 
                        className="space-y-4 md:space-y-6 lg:space-y-8 text-white order-2 lg:order-1"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                          transition: 'opacity 0.9s ease-out 0.2s, transform 0.9s ease-out 0.2s',
                          willChange: 'opacity, transform'
                        }}
                      >
                        <div className="space-y-3 md:space-y-4">
                          <div className="inline-block">
                            <span className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-blue-500/30 backdrop-blur-sm text-blue-200 text-xs md:text-sm font-semibold border border-blue-400/30">
                              {banner.leftContent.badge}
                            </span>
                          </div>
                          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-tight">
                            {banner.leftContent.title}
                          </h1>
                          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white/90">
                            {banner.leftContent.subtitle}
                          </p>
                          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
                            {banner.leftContent.description}
                          </p>
                        </div>

                        {/* Özellik */}
                        <div 
                          className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateX(0)' : 'translateX(-20px)',
                            transition: 'opacity 0.9s ease-out 0.3s, transform 0.9s ease-out 0.3s',
                            willChange: 'opacity, transform'
                          }}
                        >
                          <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/30 flex-shrink-0">
                            <banner.leftContent.featureIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-200" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm md:text-base font-medium text-white">
                              {banner.leftContent.feature}
                            </p>
                          </div>
                        </div>

                        {/* CTA Butonları */}
                        <div 
                          className="flex flex-col sm:flex-row gap-3 md:gap-4"
                          style={{
                            opacity: isActive ? 1 : 0,
                            transform: isActive ? 'translateY(0)' : 'translateY(20px)',
                            transition: 'opacity 0.9s ease-out 0.4s, transform 0.9s ease-out 0.4s',
                            willChange: 'opacity, transform'
                          }}
                        >
                          <Link to="/login" className="flex-1 sm:flex-none">
                            <Button size="lg" className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto gap-2 shadow-xl hover:shadow-2xl bg-white text-slate-900 hover:bg-blue-50 border-0 transition-all transform hover:scale-105 font-bold">
                              Hemen Başla
                              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                            </Button>
                          </Link>
                          <Button 
                            size="lg" 
                            variant="outline" 
                            className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-4 md:py-6 h-auto border-2 border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-white/50 transition-all transform hover:scale-105"
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
                        className="relative order-1 lg:order-2"
                        style={{
                          opacity: isActive ? 1 : 0,
                          transform: isActive ? 'translateX(0) scale(1)' : 'translateX(30px) scale(0.95)',
                          transition: 'opacity 0.6s ease-out 0.3s, transform 0.6s ease-out 0.3s',
                          willChange: 'opacity, transform'
                        }}
                      >
                        <div className="p-4 md:p-6 lg:p-8 rounded-2xl md:rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                          {/* Üst kısım */}
                          <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                            {/* Güvenli Altyapı */}
                            <div className="flex items-center gap-2 md:gap-3 text-white">
                              <div className="p-1.5 md:p-2 rounded-lg bg-white/20 backdrop-blur-sm flex-shrink-0">
                                <Shield className="h-4 w-4 md:h-5 md:w-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-xs md:text-sm">Güvenli Altyapı</p>
                                <p className="text-[10px] md:text-xs text-white/80">SSL şifreleme ile korunuyor</p>
                              </div>
                            </div>
                            {/* 7/24 Çağrı Destek */}
                            <div className="flex items-center gap-2 md:gap-3 text-white p-2 md:p-3 rounded-lg bg-blue-500/30 backdrop-blur-sm border border-blue-400/30">
                              <div className="p-1.5 md:p-2 rounded-lg bg-blue-500/50 backdrop-blur-sm flex-shrink-0">
                                <Phone className="h-4 w-4 md:h-5 md:w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-xs md:text-sm">7/24 Çağrı Destek</p>
                                <a href="tel:08501234567" className="text-[10px] md:text-xs text-blue-200 hover:text-blue-100 transition-colors font-semibold">
                                  0850 123 45 67
                                </a>
                              </div>
                            </div>
                          </div>
                          
                          {/* Banner yazıları */}
                          <div className="space-y-3 md:space-y-4 text-white mb-6 md:mb-8">
                            <div>
                              <p className="text-xs md:text-sm font-semibold text-blue-300 mb-1 md:mb-2">{banner.rightContent.subtitle}</p>
                              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-2 md:mb-3 leading-tight">{banner.rightContent.title}</h2>
                              <p className="text-sm md:text-base lg:text-lg text-white/90">{banner.rightContent.description}</p>
                            </div>
                          </div>
                          
                          {/* Alt kısım - İstatistikler (Banner'a özel) */}
                          <div className="grid grid-cols-2 gap-2 md:gap-4">
                            {animatedBannerStats.map((stat, statIndex) => {
                              const Icon = stat.icon;
                              return (
                                <div 
                                  key={statIndex}
                                  className="p-2 md:p-3 lg:p-4 rounded-lg md:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all group"
                                >
                                  <div className="flex items-center gap-2 mb-1 md:mb-2">
                                    <div className="p-1 md:p-1.5 lg:p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform flex-shrink-0">
                                      <Icon className="h-3 w-3 md:h-4 md:w-4 lg:h-5 lg:w-5 text-white" />
                                    </div>
                                  </div>
                                  <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white mb-0.5 md:mb-1 leading-none">
                                    {stat.suffix === '%' || stat.suffix === ' dk'
                                      ? stat.displayValue.toFixed(stat.suffix === '%' ? 1 : 0)
                                      : stat.displayValue.toLocaleString()}
                                    {stat.suffix && <span className="text-sm md:text-base lg:text-xl">{stat.suffix}</span>}
                                  </p>
                                  <p className="text-[10px] md:text-xs font-medium text-white/80 leading-tight">
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
        
        {/* Slider kontrolleri - Mobilde daha görünür */}
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/30 backdrop-blur-md">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBannerIndex(index)}
              className={`h-2 md:h-2.5 rounded-full transition-all ${
                index === currentBannerIndex 
                  ? 'w-8 md:w-10 bg-white' 
                  : 'w-2 md:w-2.5 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Banner ${index + 1}`}
            />
          ))}
        </div>
        
        {/* Önceki/Sonraki butonları - Mobilde daha küçük */}
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white shadow-lg active:scale-95"
          aria-label="Önceki banner"
        >
          <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <button
          onClick={() => setCurrentBannerIndex((prev) => (prev + 1) % banners.length)}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 p-2 md:p-3 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 transition-all text-white shadow-lg active:scale-95"
          aria-label="Sonraki banner"
        >
          <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
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
                description: 'Hemen kayıt olun ve kaynağınızı sisteme ekleyin. Kurulum sadece birkaç dakika sürer.',
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
              <span className="px-4 py-2 rounded-full bg-slate-700/50 text-white text-sm font-semibold border border-slate-600">
                İstatistikler
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4 text-white">
              Rakamlarla Yol Asistan
            </h2>
            <p className="text-xl text-slate-200 max-w-2xl mx-auto">
              Binlerce kaynak ve şube tarafından güvenle kullanılıyor
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { number: '500+', label: 'Aktif Kaynak', icon: Users },
              { number: '1.2K+', label: 'Toplam Şube', icon: Package },
              { number: '50K+', label: 'Mutlu Müşteri', icon: Star },
              { number: '99.9%', label: 'Uptime Oranı', icon: Activity },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-0 bg-slate-800/50 backdrop-blur-md hover:bg-slate-800/70 transition-all group cursor-pointer border border-slate-700">
                  <CardContent className="p-8 text-center">
                    <div className="mb-4">
                      <div className="inline-flex p-3 rounded-xl bg-slate-700/50 group-hover:scale-110 transition-transform">
                        <Icon className="h-6 w-6 text-slate-300" />
                      </div>
                    </div>
                    <p className="text-4xl md:text-5xl font-black mb-2 text-white">{stat.number}</p>
                    <p className="text-sm text-slate-200 font-medium">{stat.label}</p>
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
                  Sigorta kaynaklarınız için özel olarak tasarlanmış, modern ve güvenilir bir platform. 
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
                  alt="Modern araç ve yol yardım hizmetleri - Çözüm Asistan" 
                  className="w-full h-64 object-cover relative z-10 group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
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
      <footer role="contentinfo" className="border-t border-slate-800 bg-slate-900 backdrop-blur-sm relative overflow-hidden">
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
                  alt="Çözüm Asistan - Yol Yardım Hizmetleri Logo" 
                  className="h-8"
                  width="120"
                  height="40"
                />
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © 2021 Yol Asistan. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
      </main>
    </div>
    </>
  );
}

