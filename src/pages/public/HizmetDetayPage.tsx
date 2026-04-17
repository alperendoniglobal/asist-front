import { useParams, Link, Navigate } from 'react-router-dom';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Helmet } from 'react-helmet-async';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  getHizmetBySlug,
  HIZMET_KATEGORILERI,
  TREND_HIZMETLER,
  type HizmetItem,
} from '@/data/landingHizmetler';
import {
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
  ArrowLeft,
  Phone,
  ArrowRight,
  Star,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const HIZMET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Car, Home, PaintBucket, Wrench, Sparkles, Truck, Wind, Zap, Bath, BookOpen, Thermometer,
};

function getHizmetIcon(item: HizmetItem) {
  return (item.icon && HIZMET_ICONS[item.icon]) || Wrench;
}

export default function HizmetDetayPage() {
  const { slug } = useParams<{ slug: string }>();
  const hizmet = slug ? getHizmetBySlug(slug) : undefined;
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!hizmet) return <Navigate to="/hizmet-ara" replace />;

  const Icon = getHizmetIcon(hizmet);
  const kategori = HIZMET_KATEGORILERI.find(k => k.slug === hizmet.kategoriSlug);

  const relatedServices = TREND_HIZMETLER.filter(
    h => h.kategoriSlug === hizmet.kategoriSlug && h.id !== hizmet.id
  ).slice(0, 4);

  const otherServices = relatedServices.length < 3
    ? [...relatedServices, ...TREND_HIZMETLER.filter(h => h.id !== hizmet.id && h.kategoriSlug !== hizmet.kategoriSlug).slice(0, 3 - relatedServices.length)]
    : relatedServices;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": hizmet.name,
    "description": hizmet.metaDescription || hizmet.description,
    "url": `https://cozum.net/hizmet/${hizmet.slug}`,
    "provider": {
      "@type": "LocalBusiness",
      "name": "Çözüm Net A.Ş",
      "url": "https://cozum.net",
      "telephone": "+90-850-304-54-40"
    },
    "areaServed": { "@type": "Country", "name": "Turkey" }
  };

  return (
    <>
      <Helmet>
        <title>{hizmet.name} Hizmeti | Çözüm Net A.Ş</title>
        <meta name="description" content={hizmet.metaDescription || hizmet.description} />
        <meta name="keywords" content={`${hizmet.name}, ${hizmet.name.toLowerCase()} hizmeti, ${kategori?.label || ''}, Çözüm Net`} />
        <link rel="canonical" href={`https://cozum.net/hizmet/${hizmet.slug}`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={`${hizmet.name} Hizmeti | Çözüm Net A.Ş`} />
        <meta property="og:description" content={hizmet.metaDescription || hizmet.description} />
        <meta property="og:url" content={`https://cozum.net/hizmet/${hizmet.slug}`} />
        {hizmet.imageUrl && <meta property="og:image" content={`https://cozum.net${hizmet.imageUrl}`} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${hizmet.name} Hizmeti | Çözüm Net A.Ş`} />
        <meta name="twitter:description" content={hizmet.metaDescription || hizmet.description} />
        {hizmet.imageUrl && <meta name="twitter:image" content={`https://cozum.net${hizmet.imageUrl}`} />}
        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
      </Helmet>

      <div className="light public-page bg-white text-gray-900 min-h-screen flex flex-col" style={{ colorScheme: 'light' }}>

        {/* ===== HEADER ===== */}
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white border-b border-gray-200' : 'bg-transparent border-b border-transparent'
        }`}>
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <Link
              to="/hizmet-ara"
              className={`flex items-center gap-2 text-sm font-medium transition-colors duration-300 ${
                scrolled ? 'text-gray-600 hover:text-[#019242]' : 'text-white/85 hover:text-white'
              }`}
            >
              <ArrowLeft className="h-4 w-4" />
              Tüm Hizmetler
            </Link>

            <Link to="/" className="flex items-center gap-2.5">
              <LogoIcon className={`h-8 w-8 transition-colors duration-300 ${scrolled ? 'text-[#019242]' : 'text-white'}`} />
              <span className={`font-bold text-sm transition-colors duration-300 ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                Çözüm Net A.Ş
              </span>
            </Link>

            <a
              href="tel:08503045440"
              className={`hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-colors duration-300 ${
                scrolled ? 'text-[#019242] hover:text-[#017A35]' : 'text-white/85 hover:text-white'
              }`}
            >
              <Phone className="h-4 w-4" />
              0850 304 54 40
            </a>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="relative min-h-[60vh] flex items-end overflow-hidden">
          <div className="absolute inset-0">
            {hizmet.imageUrl ? (
              <img
                src={hizmet.imageUrl}
                alt={hizmet.name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            ) : (
              <div className="w-full h-full bg-gray-900" />
            )}
            <div className="absolute inset-0 bg-black/55" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#019242]" aria-hidden />

          <div className="relative z-10 container mx-auto px-6 pt-24 pb-14">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-xs text-white/60" itemScope itemType="https://schema.org/BreadcrumbList">
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <Link to="/" className="hover:text-white transition-colors" itemProp="item">
                    <span itemProp="name">Anasayfa</span>
                  </Link>
                  <meta itemProp="position" content="1" />
                </li>
                <li className="text-white/30">/</li>
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <Link to="/hizmet-ara" className="hover:text-white transition-colors" itemProp="item">
                    <span itemProp="name">Hizmetler</span>
                  </Link>
                  <meta itemProp="position" content="2" />
                </li>
                <li className="text-white/30">/</li>
                <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                  <span className="text-white/80" itemProp="name">{hizmet.name}</span>
                  <meta itemProp="position" content="3" />
                </li>
              </ol>
            </nav>

            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest text-green-400">
                  {kategori?.label || 'Hizmet'}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-4">
                {hizmet.name}
              </h1>
              <p className="text-base text-white/70 leading-relaxed mb-8 max-w-xl">
                {hizmet.description}
              </p>

              <a
                href="tel:08503045440"
                className="inline-flex items-center gap-2.5 bg-white text-[#019242] font-bold px-7 py-3.5 rounded-lg hover:bg-green-50 transition-colors text-sm"
              >
                <Phone className="h-4 w-4" />
                Hemen Teklif Al
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        {/* ===== ANA İÇERİK ===== */}
        <main className="flex-1 bg-white">
          <div className="container mx-auto px-6 py-12 md:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

              {/* Sol — Ana içerik */}
              <div className="lg:col-span-2 space-y-12">

                {/* Açıklama */}
                <section>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-3">
                    Hizmet Hakkında
                  </p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight mb-4">
                    {hizmet.name} Hizmeti
                  </h2>
                  <p className="text-gray-500 leading-relaxed text-base">
                    {hizmet.detailedDescription || hizmet.description}
                  </p>
                </section>

                {/* Hizmet kapsamı */}
                {hizmet.features && hizmet.features.length > 0 && (
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-3">
                      Kapsam
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
                      Hizmet Kapsamı
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {hizmet.features.map((feature, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl p-4 border border-gray-100 hover:border-green-200 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg border border-green-200 flex items-center justify-center flex-shrink-0">
                            <Check className="h-3.5 w-3.5 text-[#019242]" />
                          </div>
                          <span className="text-gray-700 text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* SSS */}
                {hizmet.faq && hizmet.faq.length > 0 && (
                  <section itemScope itemType="https://schema.org/FAQPage">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-3">
                      SSS
                    </p>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
                      Sıkça Sorulan Sorular
                    </h2>
                    <div className="space-y-2">
                      {hizmet.faq.map((item, i) => (
                        <div
                          key={i}
                          itemScope
                          itemProp="mainEntity"
                          itemType="https://schema.org/Question"
                          className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                            openFaq === i ? 'border-green-200' : 'border-gray-100'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => setOpenFaq(openFaq === i ? null : i)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                          >
                            <h3 itemProp="name" className="font-semibold text-gray-900 text-sm pr-4">{item.question}</h3>
                            {openFaq === i
                              ? <ChevronUp className="h-4 w-4 text-[#019242] flex-shrink-0" />
                              : <ChevronDown className="h-4 w-4 text-gray-300 flex-shrink-0" />
                            }
                          </button>
                          {openFaq === i && (
                            <div
                              itemScope
                              itemProp="acceptedAnswer"
                              itemType="https://schema.org/Answer"
                              className="px-5 pb-5 pt-0 border-t border-gray-100"
                            >
                              <p itemProp="text" className="text-gray-500 text-sm leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Sağ — Sidebar */}
              <aside className="space-y-5">

                {/* Teklif kartı */}
                <div className="sticky top-20 space-y-4">
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    {hizmet.imageUrl && (
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <img
                          src={hizmet.imageUrl}
                          alt={hizmet.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-3 left-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-white text-xs ml-1 font-medium">5.0</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="p-5 space-y-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{hizmet.name}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed">{hizmet.description}</p>
                      </div>

                      <a
                        href="tel:08503045440"
                        className="flex items-center justify-center gap-2 w-full bg-[#019242] hover:bg-[#017A35] text-white font-semibold py-3 rounded-lg transition-colors text-sm"
                      >
                        <Phone className="h-4 w-4" />
                        Hemen Ara: 0850 304 54 40
                      </a>

                      <p className="text-xs text-gray-400 text-center">7/24 destek · Ücretsiz bilgi alın</p>
                    </div>
                  </div>

                  {/* İlgili hizmetler */}
                  {otherServices.length > 0 && (
                    <div className="rounded-xl border border-gray-100 p-5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-4">
                        İlgili Hizmetler
                      </p>
                      <div className="space-y-1">
                        {otherServices.map((s) => {
                          const SIcon = getHizmetIcon(s);
                          return (
                            <Link
                              key={s.id}
                              to={`/hizmet/${s.slug}`}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#019242] transition-colors">
                                <SIcon className="h-4 w-4 text-[#019242] group-hover:text-white transition-colors" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                                <p className="text-xs text-gray-400 truncate">{s.description}</p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 text-gray-200 group-hover:text-[#019242] transition-colors" />
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
