import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { LogoIcon } from '@/components/ui/LogoIcon';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
  HIZMET_KATEGORILERI,
  filterHizmetler,
  type HizmetItem,
} from '@/data/landingHizmetler';
import {
  Search,
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
  ArrowRight,
  Star,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const HIZMET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Car, Home, PaintBucket, Wrench, Sparkles, Truck, Wind, Zap, Bath, BookOpen, Thermometer,
};

function getHizmetIcon(item: HizmetItem) {
  return (item.icon && HIZMET_ICONS[item.icon]) || Wrench;
}

export default function HizmetAraPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const kategoriSlug = searchParams.get('kategori') || null;
  const [scrolled, setScrolled] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const results = filterHizmetler(q, kategoriSlug);
  const kategoriLabel = HIZMET_KATEGORILERI.find(k => k.slug === kategoriSlug)?.label;

  const pageTitle = q
    ? `"${q}" Hizmetleri | Çözüm Net A.Ş`
    : kategoriSlug
      ? `${kategoriLabel} Hizmetleri | Çözüm Net A.Ş`
      : 'Tüm Hizmetler | Çözüm Net A.Ş';

  const pageDesc = q
    ? `"${q}" için ${results.length} hizmet bulundu. Temizlik, tadilat, tesisat, yol yardım ve daha fazlası — Çözüm Net A.Ş`
    : kategoriSlug
      ? `${kategoriLabel} hizmetleri: deneyimli uzmanlar, hızlı çözüm. Çözüm Net A.Ş`
      : 'İhtiyacın olan hizmete kolayca ulaş: temizlik, tadilat, tesisat, yol yardım ve daha fazlası.';

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDesc,
    "url": "https://cozum.net/hizmet-ara"
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>('input[name="q"]');
    const value = (input?.value || '').trim();
    const params = new URLSearchParams();
    if (value) params.set('q', value);
    if (kategoriSlug) params.set('kategori', kategoriSlug);
    navigate({ pathname: '/hizmet-ara', search: params.toString() });
  };

  const setKategori = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) params.set('kategori', slug);
    else params.delete('kategori');
    navigate({ pathname: '/hizmet-ara', search: params.toString() });
  };

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href="https://cozum.net/hizmet-ara" />
        {q && <meta name="robots" content="noindex, nofollow" />}
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="tr_TR" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:url" content="https://cozum.net/hizmet-ara" />
        <meta property="og:image" content="https://cozum.net/images/pexels-fauxels-3183197.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDesc} />
        <script type="application/ld+json">{JSON.stringify(collectionSchema)}</script>
      </Helmet>

      <div className="light public-page bg-white text-gray-900 min-h-screen flex flex-col" style={{ colorScheme: 'light' }}>

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

            <Link
              to="/hizmet-ara"
              className={`text-sm font-medium transition-colors duration-300 hidden sm:block ${
                scrolled ? 'text-gray-600 hover:text-[#019242]' : 'text-white/85 hover:text-white'
              }`}
            >
              Tüm Hizmetler
            </Link>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <section className="relative min-h-[55vh] flex items-center overflow-hidden">
          <img
            src="/images/pexels-fauxels-3183197.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#019242]" aria-hidden />

          <div className="relative z-10 container mx-auto px-6 pt-20 pb-14">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-green-400 mb-4">
                Hizmet Ara
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05] mb-5">
                İhtiyacın Olan<br />
                <span className="text-[#2dd67b]">Hizmeti</span> Bul
              </h1>
              <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed max-w-lg">
                Temizlik, tadilat, tesisat, yol yardım ve daha fazlası — deneyimli ustalar, hızlı çözüm.
              </p>

              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl p-1.5 max-w-xl shadow-lg"
              >
                <Input
                  name="q"
                  type="search"
                  placeholder="Hangi hizmeti arıyorsun?"
                  defaultValue={q}
                  className="flex-1 border-0 shadow-none focus-visible:ring-0 text-sm h-11 bg-transparent text-gray-900 placeholder:text-gray-400"
                  aria-label="Hizmet ara"
                />
                <Button
                  type="submit"
                  className="bg-[#019242] hover:bg-[#017A35] text-white px-6 h-11 rounded-lg text-sm font-semibold gap-2 flex-shrink-0 transition-colors"
                >
                  <Search className="h-4 w-4" />
                  Ara
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* ===== FİLTRE + SONUÇLAR ===== */}
        <main className="flex-1 bg-white">
          <div className="container mx-auto px-6 py-10 md:py-14">

            {/* Filtre bar */}
            <div className="flex items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setKategori(null)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    !kategoriSlug
                      ? 'bg-[#019242] text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-[#019242] hover:text-[#019242]'
                  }`}
                >
                  Tümü
                </button>
                {/* Desktop: tüm kategori butonları */}
                <div className="hidden md:flex items-center gap-2 flex-wrap">
                  {HIZMET_KATEGORILERI.map((k) => (
                    <button
                      key={k.id}
                      onClick={() => setKategori(k.slug === kategoriSlug ? null : k.slug)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        kategoriSlug === k.slug
                          ? 'bg-[#019242] text-white'
                          : 'border border-gray-200 text-gray-600 hover:border-[#019242] hover:text-[#019242]'
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
                {/* Mobile: filtre toggle */}
                <button
                  className="md:hidden flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Kategori
                  {kategoriSlug && <span className="w-2 h-2 rounded-full bg-[#019242] ml-0.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {(q || kategoriSlug) && (
                  <button
                    onClick={() => navigate('/hizmet-ara')}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                    Temizle
                  </button>
                )}
                <span className="text-sm text-gray-400 font-medium">{results.length} hizmet</span>
              </div>
            </div>

            {/* Mobile kategori paneli */}
            {filterOpen && (
              <div className="md:hidden flex flex-wrap gap-2 mb-6 pb-6 border-b border-gray-100">
                {HIZMET_KATEGORILERI.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => { setKategori(k.slug === kategoriSlug ? null : k.slug); setFilterOpen(false); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      kategoriSlug === k.slug
                        ? 'bg-[#019242] text-white'
                        : 'border border-gray-200 text-gray-600'
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            )}

            {/* Aktif filtre göstergesi */}
            {(q || kategoriSlug) && (
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-1">
                  {q || kategoriSlug ? 'Arama Sonuçları' : 'Popüler Hizmetler'}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                  {q ? `"${q}" için sonuçlar` : HIZMET_KATEGORILERI.find(k => k.slug === kategoriSlug)?.label || 'Sonuçlar'}
                </h2>
              </div>
            )}

            {/* Sonuçlar */}
            {results.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-14 h-14 rounded-xl border border-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-6 w-6 text-gray-300" />
                </div>
                <p className="text-gray-900 font-semibold mb-1">Sonuç bulunamadı</p>
                <p className="text-sm text-gray-400">Farklı bir anahtar kelime veya kategori deneyin.</p>
                <button
                  onClick={() => navigate('/hizmet-ara')}
                  className="mt-5 text-sm font-medium text-[#019242] hover:text-[#017A35] transition-colors"
                >
                  Tüm hizmetleri gör
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {results.map((h) => {
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
                                  const fb = e.currentTarget.nextElementSibling as HTMLElement;
                                  if (fb) fb.classList.remove('hidden');
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
                          <div className="flex items-start gap-2 mb-1.5">
                            <Icon className="h-4 w-4 text-[#019242] flex-shrink-0 mt-0.5" />
                            <h3 className="font-semibold text-gray-900 text-sm leading-snug">{h.name}</h3>
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
            )}
          </div>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
