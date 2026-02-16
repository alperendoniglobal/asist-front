import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { PublicFooter } from '@/components/layout/PublicFooter';
import {
    getHizmetBySlug,
    HIZMET_KATEGORILERI,
    TREND_HIZMETLER,
    type HizmetItem,
} from '@/data/landingHizmetler';
import {
    // Search (available if needed)
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
import { useState } from 'react';

/** Hizmet ikon adı -> Lucide component map */
const HIZMET_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Car, Home, PaintBucket, Wrench, Sparkles, Truck, Wind, Zap, Bath, BookOpen, Thermometer,
};

function getHizmetIcon(item: HizmetItem) {
    return (item.icon && HIZMET_ICONS[item.icon]) || Wrench;
}

/**
 * Hizmet Detay Sayfası - SEO uyumlu tekil hizmet sayfası.
 * URL: /hizmet/:slug
 */
export default function HizmetDetayPage() {
    const { slug } = useParams<{ slug: string }>();
    const hizmet = slug ? getHizmetBySlug(slug) : undefined;
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    if (!hizmet) {
        return <Navigate to="/hizmet-ara" replace />;
    }

    const Icon = getHizmetIcon(hizmet);
    const kategori = HIZMET_KATEGORILERI.find(k => k.slug === hizmet.kategoriSlug);

    // İlgili diğer hizmetler (aynı kategoriden, kendisi hariç)
    const relatedServices = TREND_HIZMETLER.filter(
        h => h.kategoriSlug === hizmet.kategoriSlug && h.id !== hizmet.id
    ).slice(0, 4);

    // Farklı kategoriden de ekle (eğer az varsa)
    const otherServices = relatedServices.length < 3
        ? [...relatedServices, ...TREND_HIZMETLER.filter(h => h.id !== hizmet.id && h.kategoriSlug !== hizmet.kategoriSlug).slice(0, 3 - relatedServices.length)]
        : relatedServices;

    return (
        <>
            <Helmet>
                <title>{hizmet.name} Hizmeti | Çözüm Net A.Ş</title>
                <meta name="description" content={hizmet.metaDescription || hizmet.description} />
                <meta property="og:title" content={`${hizmet.name} Hizmeti | Çözüm Net A.Ş`} />
                <meta property="og:description" content={hizmet.metaDescription || hizmet.description} />
                {hizmet.imageUrl && <meta property="og:image" content={hizmet.imageUrl} />}
                <meta property="og:type" content="website" />
                <link rel="canonical" href={`https://cozumnet.com.tr/hizmet/${hizmet.slug}`} />
            </Helmet>

            <div className="light public-page bg-gray-50 text-gray-900 min-h-screen flex flex-col" style={{ colorScheme: 'light' }}>
                {/* Header */}
                <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                    <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                        <Link to="/hizmet-ara" className="flex items-center gap-2 text-gray-600 hover:text-[#019242] transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium text-sm">Tüm Hizmetler</span>
                        </Link>
                        <Link to="/" className="flex items-center gap-2">
                            <img src="/iconlogo.svg" alt="" className="h-8 w-8" />
                            <span className="font-bold text-gray-900">Çözüm Net A.Ş</span>
                        </Link>
                    </div>
                </header>

                {/* Hero Banner */}
                <section className="relative overflow-hidden">
                    <div className="absolute inset-0">
                        {hizmet.imageUrl && (
                            <img
                                src={hizmet.imageUrl}
                                alt={hizmet.name}
                                className="w-full h-full object-cover"
                                loading="eager"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#012A15]/90 via-[#019242]/75 to-[#017A35]/85" />
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                        }} aria-hidden />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent" aria-hidden />

                    <div className="relative z-10 container mx-auto px-4 py-12 md:py-16">
                        <div className="max-w-3xl mx-auto text-center">
                            {/* Kategori badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-sm text-white text-sm font-medium mb-4 border border-white/20">
                                <Icon className="h-4 w-4" />
                                <span>{kategori?.label || 'Hizmet'}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight mb-3 drop-shadow-lg">
                                {hizmet.name}
                            </h1>
                            <p className="text-white/90 text-base md:text-lg max-w-xl mx-auto mb-6 leading-relaxed">
                                {hizmet.description}
                            </p>

                            {/* CTA */}
                            <a
                                href="tel:08503045440"
                                className="inline-flex items-center gap-2 bg-white text-[#019242] font-bold px-8 py-4 rounded-2xl shadow-2xl hover:shadow-green-500/20 hover:scale-105 transition-all duration-200 text-base"
                            >
                                <Phone className="h-5 w-5" />
                                Hemen Teklif Al
                                <ArrowRight className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </section>

                <main className="flex-1 container mx-auto px-4 py-10 md:py-14">
                    {/* Breadcrumb – SEO uyumlu */}
                    <nav aria-label="Breadcrumb" className="mb-8">
                        <ol className="flex items-center gap-2 text-sm text-gray-500" itemScope itemType="https://schema.org/BreadcrumbList">
                            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                <Link to="/" className="hover:text-[#019242]" itemProp="item"><span itemProp="name">Anasayfa</span></Link>
                                <meta itemProp="position" content="1" />
                            </li>
                            <li className="text-gray-300">/</li>
                            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                <Link to="/hizmet-ara" className="hover:text-[#019242]" itemProp="item"><span itemProp="name">Hizmetler</span></Link>
                                <meta itemProp="position" content="2" />
                            </li>
                            <li className="text-gray-300">/</li>
                            <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                                <span className="text-gray-900 font-medium" itemProp="name">{hizmet.name}</span>
                                <meta itemProp="position" content="3" />
                            </li>
                        </ol>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Sol Alan – Ana içerik */}
                        <div className="lg:col-span-2 space-y-10">
                            {/* Hizmet Açıklaması */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                    {hizmet.name} Hizmeti Hakkında
                                </h2>
                                <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                                    {hizmet.detailedDescription || hizmet.description}
                                </p>
                            </section>

                            {/* Hizmet Kapsamı */}
                            {hizmet.features && hizmet.features.length > 0 && (
                                <section>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Hizmet Kapsamı
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {hizmet.features.map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-[#019242]/20 transition-all duration-200">
                                                <div className="w-8 h-8 rounded-lg bg-[#019242]/10 flex items-center justify-center flex-shrink-0">
                                                    <Check className="h-4 w-4 text-[#019242]" />
                                                </div>
                                                <span className="text-gray-800 font-medium text-sm">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Sıkça Sorulan Sorular */}
                            {hizmet.faq && hizmet.faq.length > 0 && (
                                <section itemScope itemType="https://schema.org/FAQPage">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Sıkça Sorulan Sorular
                                    </h2>
                                    <div className="space-y-3">
                                        {hizmet.faq.map((item, i) => (
                                            <div
                                                key={i}
                                                itemScope
                                                itemProp="mainEntity"
                                                itemType="https://schema.org/Question"
                                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                                                >
                                                    <h3 itemProp="name" className="font-semibold text-gray-900 pr-4">{item.question}</h3>
                                                    {openFaq === i ? (
                                                        <ChevronUp className="h-5 w-5 text-[#019242] flex-shrink-0" />
                                                    ) : (
                                                        <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                                    )}
                                                </button>
                                                {openFaq === i && (
                                                    <div
                                                        itemScope
                                                        itemProp="acceptedAnswer"
                                                        itemType="https://schema.org/Answer"
                                                        className="px-5 pb-5 pt-0"
                                                    >
                                                        <p itemProp="text" className="text-gray-600 leading-relaxed">{item.answer}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sağ Sidebar */}
                        <aside className="space-y-6">
                            {/* İletişim kartı */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-lg overflow-hidden sticky top-24">
                                {hizmet.imageUrl && (
                                    <div className="aspect-[16/9] relative overflow-hidden">
                                        <img src={hizmet.imageUrl} alt={hizmet.name} className="w-full h-full object-cover" loading="lazy" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        <div className="absolute bottom-3 left-3 right-3">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                                                ))}
                                                <span className="text-white text-sm ml-1 font-medium">5.0</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-6 space-y-4">
                                    <h3 className="font-bold text-lg text-gray-900">{hizmet.name}</h3>
                                    <p className="text-sm text-gray-500">{hizmet.description}</p>

                                    <a
                                        href="tel:08503045440"
                                        className="flex items-center justify-center gap-2 w-full bg-[#019242] text-white font-bold py-3.5 rounded-xl hover:bg-[#017A35] transition-colors shadow-md"
                                    >
                                        <Phone className="h-5 w-5" />
                                        Hemen Ara: 0850 304 54 40
                                    </a>

                                    <div className="text-xs text-gray-400 text-center">
                                        7/24 destek hattı · Ücretsiz bilgi alın
                                    </div>
                                </div>
                            </div>

                            {/* İlgili Hizmetler */}
                            {otherServices.length > 0 && (
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <h3 className="font-bold text-gray-900 mb-4">İlgili Hizmetler</h3>
                                    <div className="space-y-3">
                                        {otherServices.map((s) => {
                                            const SIcon = getHizmetIcon(s);
                                            return (
                                                <Link
                                                    key={s.id}
                                                    to={`/hizmet/${s.slug}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-[#019242]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#019242] transition-colors">
                                                        <SIcon className="h-5 w-5 text-[#019242] group-hover:text-white transition-colors" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                                                        <p className="text-xs text-gray-400 truncate">{s.description}</p>
                                                    </div>
                                                    <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-[#019242] transition-colors" />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </main>

                <PublicFooter />
            </div>
        </>
    );
}
