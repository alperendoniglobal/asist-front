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
  Phone,
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

      <div className="light public-page bg-white text-gray-900 min-h-screen flex flex-col" style={{ colorScheme: 'light' }}>
        {/* Basit header */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-gray-700 hover:text-[#019242]">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Anasayfaya Dön</span>
            </Link>
            <Link to="/" className="flex items-center gap-2">
              <img src="/iconlogo.svg" alt="" className="h-8 w-8" />
              <span className="font-bold text-gray-900">Çözüm Net A.Ş</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 container mx-auto px-4 py-8 md:py-12">
          {/* Başlık + Arama */}
          <section className="max-w-3xl mx-auto mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
              Hangi hizmeti arıyorsun?
            </h1>
            <p className="text-gray-600 text-center mb-6">
              İhtiyacın olan hizmete kolayca ulaş, bekleyen işlerini hallet.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                name="q"
                type="search"
                placeholder="Hangi hizmeti arıyorsun?"
                defaultValue={q}
                className="flex-1 h-12 rounded-xl border-2 border-gray-200 focus:border-[#019242]"
              />
              <Button type="submit" className="bg-[#019242] hover:bg-[#017A35] h-12 px-6 rounded-xl gap-2">
                <Search className="h-5 w-5" />
                Ara
              </Button>
            </form>

            {/* Kategori filtreleri */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setKategori(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  !kategoriSlug ? 'bg-[#019242] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tümü
              </button>
              {HIZMET_KATEGORILERI.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKategori(k.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    kategoriSlug === k.slug ? 'bg-[#019242] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </section>

          {/* Sonuçlar */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {q || kategoriSlug ? `Sonuçlar (${results.length})` : 'Popüler Hizmetler'}
            </h2>
            {results.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>Arama kriterlerine uygun hizmet bulunamadı.</p>
                <p className="text-sm mt-2">Farklı bir anahtar kelime veya kategori deneyin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((h) => {
                  const Icon = getHizmetIcon(h);
                  return (
                    <Card key={h.id} className="border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-[#019242]/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-6 w-6 text-[#019242]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{h.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{h.description}</p>
                            <a
                              href={`tel:08503045440`}
                              className="inline-flex items-center gap-1.5 mt-3 text-sm font-medium text-[#019242] hover:underline"
                            >
                              <Phone className="h-4 w-4" />
                              Teklif al / İletişime geç
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </main>

        <PublicFooter />
      </div>
    </>
  );
}
