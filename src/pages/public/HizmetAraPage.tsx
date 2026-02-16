import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
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
} from 'lucide-react';

/** Hizmet ikon adı -> Lucide component map */
const HIZMET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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
  const Icon = (item.icon && HIZMET_ICONS[item.icon]) || Wrench;
  return Icon;
}

/**
 * Hizmet Ara - Public arama sayfası.
 * URL: /hizmet-ara?q=...&kategori=...
 * Statik hizmet listesinden filtreleme yapar; backend usta listesi yok.
 */
export default function HizmetAraPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const q = searchParams.get('q') || '';
  const kategoriSlug = searchParams.get('kategori') || null;

  const results = filterHizmetler(q, kategoriSlug);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector<HTMLInputElement>('input[name="q"]');
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
        <title>Hizmet Ara | Çözüm Net A.Ş</title>
        <meta name="description" content="İhtiyacın olan hizmete kolayca ulaş: temizlik, tadilat, tesisat, yol yardım ve daha fazlası." />
      </Helmet>

      <div className="light public-page bg-gray-50 text-gray-900 min-h-screen flex flex-col" style={{ colorScheme: 'light' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-[#019242] transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium text-sm">Anasayfaya Dön</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <img src="/iconlogo.svg" alt="" className="h-8 w-8" />
              <span className="font-bold text-gray-900">Çözüm Net A.Ş</span>
            </Link>
          </div>
        </header>

        {/* Hero Banner – Ana sayfa ile aynı stil */}
        <section className="relative overflow-hidden">
          {/* Background Image */}
          <img
            src="/images/pexels-fauxels-3183197.jpg"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
            aria-hidden
          />
          {/* Dark green gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#012A15]/90 via-[#019242]/75 to-[#017A35]/85" aria-hidden />
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} aria-hidden />
          {/* Bottom fade to gray-50 */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent" aria-hidden />

          <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-5 border border-white/20">
                <Search className="h-4 w-4" />
                <span>Hizmet Bul</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg">
                İhtiyacın Olan <br className="hidden sm:block" />
                <span className="text-green-300">Hizmete</span> Kolayca Ulaş
              </h1>
              <p className="text-white/90 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
                Temizlik, tadilat, tesisat, yol yardım ve daha fazlası — en iyi ustalar burada.
              </p>

              {/* Glassmorphism arama kutusu */}
              <form
                onSubmit={handleSearch}
                className="flex flex-col sm:flex-row gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-2.5 max-w-2xl mx-auto border border-white/50"
              >
                <Input
                  name="q"
                  type="search"
                  placeholder="Hangi hizmeti arıyorsun? (ör: tesisat, temizlik, boya)"
                  defaultValue={q}
                  className="flex-1 h-13 rounded-xl border-2 border-gray-200 focus:border-[#019242] text-base bg-white"
                  aria-label="Hizmet ara"
                />
                <Button type="submit" className="bg-[#019242] hover:bg-[#017A35] h-13 px-8 rounded-xl gap-2 shadow-lg text-base font-semibold" aria-label="Ara">
                  <Search className="h-5 w-5" />
                  Hizmet Ara
                </Button>
              </form>

              {/* Kategori chip'leri – banner içinde */}
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {HIZMET_KATEGORILERI.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => setKategori(k.slug === kategoriSlug ? null : k.slug)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${kategoriSlug === k.slug
                        ? 'bg-white text-[#019242] shadow-lg'
                        : 'bg-white/15 backdrop-blur-sm border border-white/25 text-white hover:bg-white hover:text-[#019242]'
                      }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <main className="flex-1 container mx-auto px-4 py-8 md:py-10">
          {/* Sonuç başlığı */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              {q || kategoriSlug ? `Sonuçlar` : 'Popüler Hizmetler'}
            </h2>
            <span className="text-sm text-gray-500 font-medium">{results.length} hizmet</span>
          </div>

          {/* Sonuçlar */}
          {results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">Arama kriterlerine uygun hizmet bulunamadı.</p>
              <p className="text-sm text-gray-400 mt-1">Farklı bir anahtar kelime veya kategori deneyin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map((h) => {
                const Icon = getHizmetIcon(h);
                return (
                  <Link
                    key={h.id}
                    to={`/hizmet/${h.slug}`}
                    className="block group"
                  >
                    <Card className="border border-gray-200/80 overflow-hidden h-full hover:shadow-2xl hover:border-[#019242]/30 hover:-translate-y-1 transition-all duration-300 bg-white">
                      {/* Hizmet fotoğrafı */}
                      <div className="aspect-[16/10] relative bg-gray-100 overflow-hidden">
                        {h.imageUrl ? (
                          <>
                            <img
                              src={h.imageUrl}
                              alt={h.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) fallback.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden absolute inset-0 bg-gradient-to-br from-[#019242]/20 to-[#017A35]/20 flex items-center justify-center">
                              <Icon className="h-12 w-12 text-[#019242]" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#019242]/10 to-[#017A35]/10 flex items-center justify-center">
                            <Icon className="h-12 w-12 text-[#019242]" />
                          </div>
                        )}
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden />
                        {/* Kategori etiketi */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-sm text-xs font-semibold text-[#019242] shadow-sm">
                            {HIZMET_KATEGORILERI.find(k => k.slug === h.kategoriSlug)?.label || 'Hizmet'}
                          </span>
                        </div>
                        {/* Ikon rozeti */}
                        <div className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md group-hover:bg-[#019242] transition-colors duration-300">
                          <Icon className="h-5 w-5 text-[#019242] group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-bold text-gray-900 text-base">{h.name}</h3>
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{h.description}</p>
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs text-gray-400 ml-1">5.0</span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#019242] group-hover:gap-2 transition-all duration-200">
                            Detaylar <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
