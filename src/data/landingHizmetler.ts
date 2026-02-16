/**
 * Landing ve Hizmet Ara sayfası için statik kategoriler ve popüler hizmetler.
 * Armut tarzı hizmet/usta arama UI'ında kullanılır.
 */

export interface HizmetKategori {
  id: string;
  slug: string;
  label: string;
}

export interface HizmetItem {
  id: string;
  slug: string;
  name: string;
  kategoriSlug: string;
  description: string;
  /** lucide-react ikon adı (opsiyonel) */
  icon?: string;
  /** Hizmetle alakalı kart görseli (Unsplash vb. – konuya uygun) */
  imageUrl?: string;
}

/** Ana kategoriler - chip/link için */
export const HIZMET_KATEGORILERI: HizmetKategori[] = [
  { id: '1', slug: 'temizlik', label: 'Temizlik' },
  { id: '2', slug: 'tadilat', label: 'Tadilat' },
  { id: '3', slug: 'nakliyat', label: 'Nakliyat' },
  { id: '4', slug: 'tamir', label: 'Tamir' },
  { id: '5', slug: 'tesisat', label: 'Tesisat' },
  { id: '6', slug: 'cam-cilalama', label: 'Cam / Cilalama' },
  { id: '7', slug: 'arac-yol-yardim', label: 'Araç & Yol Yardım' },
  { id: '8', slug: 'ozel-ders', label: 'Özel Ders' },
  { id: '9', slug: 'organizasyon', label: 'Organizasyon' },
  { id: '10', slug: 'diger', label: 'Diğer' },
];

/** Konuya uygun görsel URL'leri – her hizmet için alakalı Unsplash fotoğrafları */
const U = (id: string, w = 400, h = 260) => `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop`;

/** Popüler / trend hizmetler – kartlarda alakalı görsel + ikon + metin */
export const TREND_HIZMETLER: HizmetItem[] = [
  { id: '1', slug: 'yol-yardimi', name: 'Yol Yardım', kategoriSlug: 'arac-yol-yardim', description: '7/24 çekici, lastik değişimi, akü takviye.', icon: 'Car', imageUrl: U('1605559424474-0f7408ad2f9a') },
  { id: '2', slug: 'ev-temizligi', name: 'Ev Temizliği', kategoriSlug: 'temizlik', description: 'Düzenli ve derin ev temizliği hizmeti.', icon: 'Home', imageUrl: U('1581578731548-c64695cc6952') },
  { id: '3', slug: 'boya-badana', name: 'Boya Badana', kategoriSlug: 'tadilat', description: 'İç ve dış cephe boya uygulaması.', icon: 'PaintBucket', imageUrl: U('1562259949-2c79b4d319b1') },
  { id: '4', slug: 'tesisat', name: 'Tesisat', kategoriSlug: 'tesisat', description: 'Su tesisatı, tıkanıklık açma, kombi.', icon: 'Wrench', imageUrl: U('1558618666-fcd25c85cd64') },
  { id: '5', slug: 'cam-cilalama', name: 'Cam Cilalama', kategoriSlug: 'cam-cilalama', description: 'Araç ve bina cam cilalama.', icon: 'Sparkles', imageUrl: U('1492144534655-ae79c964c9d7') },
  { id: '6', slug: 'evden-eve-nakliyat', name: 'Evden Eve Nakliyat', kategoriSlug: 'nakliyat', description: 'Eşya taşıma ve nakliyat hizmeti.', icon: 'Truck', imageUrl: U('1600566753190-17f0baa2a6c3') },
  { id: '7', slug: 'klima-montaj', name: 'Klima Montaj', kategoriSlug: 'tamir', description: 'Klima kurulum ve bakım.', icon: 'Wind', imageUrl: U('1631549966376-185d848818f2') },
  { id: '8', slug: 'elektrikci', name: 'Elektrikçi', kategoriSlug: 'tamir', description: 'Elektrik tesisatı ve arıza.', icon: 'Zap', imageUrl: U('1621905251189-08e339f3dceb') },
  { id: '9', slug: 'banyo-tadilat', name: 'Banyo Tadilat', kategoriSlug: 'tadilat', description: 'Banyo yenileme ve tadilat.', icon: 'Bath', imageUrl: U('1552321554-5f0408c53921') },
  { id: '10', slug: 'bos-ev-temizligi', name: 'Boş Ev Temizliği', kategoriSlug: 'temizlik', description: 'Taşınma öncesi/sonrası temizlik.', icon: 'Home', imageUrl: U('1586023492125-19b68f2f2a6a') },
  { id: '11', slug: 'ozel-ders', name: 'Özel Ders', kategoriSlug: 'ozel-ders', description: 'İlkokul, lise ve dil dersleri.', icon: 'BookOpen', imageUrl: U('1522202176988-58373e2ad9f') },
  { id: '12', slug: 'kombi-servisi', name: 'Kombi Servisi', kategoriSlug: 'tesisat', description: 'Kombi montaj, bakım ve arıza.', icon: 'Thermometer', imageUrl: U('1558618666-fcd25c85cd64') },
];

/**
 * q ve kategori'ye göre hizmet listesini filtreler (HizmetAraPage için).
 */
export function filterHizmetler(q: string, kategoriSlug: string | null): HizmetItem[] {
  let list = [...TREND_HIZMETLER];
  const query = (q || '').trim().toLowerCase();
  if (query) {
    list = list.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.description.toLowerCase().includes(query) ||
        h.kategoriSlug.toLowerCase().includes(query)
    );
  }
  if (kategoriSlug) {
    list = list.filter((h) => h.kategoriSlug === kategoriSlug);
  }
  return list;
}
