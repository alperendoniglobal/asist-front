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
  /** SEO meta açıklaması */
  metaDescription?: string;
  /** Detay sayfası için uzun açıklama */
  detailedDescription?: string;
  /** Hizmetin kapsadığı alt hizmetler */
  features?: string[];
  /** SSS */
  faq?: { question: string; answer: string }[];
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

/** Popüler / trend hizmetler – kartlarda yerel görsel + ikon + metin */
export const TREND_HIZMETLER: HizmetItem[] = [
  {
    id: '1', slug: 'yol-yardimi', name: 'Yol Yardım', kategoriSlug: 'arac-yol-yardim',
    description: '7/24 çekici, lastik değişimi, akü takviye.', icon: 'Car',
    imageUrl: '/images/hizmetler/yol-yardim.png',
    metaDescription: 'Yol yardım hizmeti: 7/24 çekici, lastik değişimi, akü takviye, yakıt ikmali ve kilitli araç açma. Türkiye genelinde hızlı yardım.',
    detailedDescription: 'Çözüm Net A.Ş yol yardım hizmeti ile aracınız yolda kaldığında yanınızdayız. 7/24 hizmet veren çekici filosu, profesyonel lastik değişimi, akü takviye, yakıt ikmali ve kilitli araç açma gibi kapsamlı hizmetlerimizle yolculuğunuzu güvenle sürdürmenizi sağlıyoruz. Türkiye\'nin 81 ilinde yaygın hizmet ağımızla en kısa sürede konumunuza ulaşıyoruz.',
    features: ['7/24 Çekici Hizmeti', 'Lastik Değişimi & Tamir', 'Akü Takviye & Değişim', 'Yakıt İkmali', 'Kilitli Araç Açma', 'Oto Elektrik Arıza Müdahale', 'Yol Kenarı Tamir', 'Oto Kurtarma'],
    faq: [
      { question: 'Yol yardım hizmeti ne kadar sürede gelir?', answer: 'Şehir içinde ortalama 20-40 dakika, şehirlerarası yollarda ise 30-60 dakika içinde konumunuza ulaşırız.' },
      { question: 'Yol yardım hizmeti 7/24 mi?', answer: 'Evet, yol yardım hizmetimiz haftanın 7 günü, günün 24 saati aktiftir. Gece, gündüz, tatil fark etmeksizin yanınızdayız.' },
      { question: 'Yol yardım hizmetinin kapsamı nedir?', answer: 'Çekici, lastik değişimi, akü takviye, yakıt ikmali, kilitli araç açma, oto elektrik müdahale ve yol kenarı tamir hizmetleri sunulmaktadır.' },
    ],
  },
  {
    id: '2', slug: 'ev-temizligi', name: 'Ev Temizliği', kategoriSlug: 'temizlik',
    description: 'Düzenli ve derin ev temizliği hizmeti.', icon: 'Home',
    imageUrl: '/images/hizmetler/ev-temizligi.png',
    metaDescription: 'Profesyonel ev temizliği hizmeti: düzenli temizlik, derin temizlik, ütü, pencere yıkama. Güvenilir ve deneyimli ekipler.',
    detailedDescription: 'Evinizi pırıl pırıl yapacak profesyonel ev temizliği hizmeti. Deneyimli ve güvenilir ekiplerimiz ile düzenli haftalık, aylık temizlik planları ya da tek seferlik derin temizlik hizmeti sunuyoruz. Tüm temizlik malzemeleri ekibimiz tarafından temin edilir. Mutfak, banyo, yatak odası, salon ve tüm yaşam alanlarınız titizlikle temizlenir.',
    features: ['Düzenli Haftalık Temizlik', 'Derin Temizlik', 'Pencere & Cam Temizliği', 'Ütü Hizmeti', 'Mutfak Derin Temizlik', 'Banyo & WC Dezenfeksiyon', 'Halı Yıkama', 'Koltuk Yıkama'],
    faq: [
      { question: 'Ev temizliği ne kadar sürer?', answer: 'Standart bir 2+1 dairenin temizliği ortalama 3-4 saat sürmektedir. Evin büyüklüğüne ve talep edilen hizmetlere göre süre değişebilir.' },
      { question: 'Temizlik malzemeleri getirilir mi?', answer: 'Evet, profesyonel temizlik ekiplerimiz gerekli tüm temizlik malzemeleri ve ekipmanları ile gelir.' },
      { question: 'Düzenli temizlik planları var mı?', answer: 'Evet, haftalık, 15 günlük ve aylık düzenli temizlik paketlerimiz mevcuttur. Size uygun planı belirleyebilirsiniz.' },
    ],
  },
  {
    id: '3', slug: 'boya-badana', name: 'Boya Badana', kategoriSlug: 'tadilat',
    description: 'İç ve dış cephe boya uygulaması.', icon: 'PaintBucket',
    imageUrl: '/images/hizmetler/boya-badana.png',
    metaDescription: 'Profesyonel boya badana hizmeti: iç cephe, dış cephe, dekoratif boya, alçı sıva. Uygun fiyat, kaliteli işçilik.',
    detailedDescription: 'İç ve dış cephe boya badana hizmetimizle yaşam alanlarınıza yeni bir soluk katın. Uzman ekibimiz, yüzeye uygun boya seçimi, alçı sıva tamiri, macun uygulaması ve temiz bir şekilde boyama işlemini gerçekleştirir. Dekoratif boya, saten boya, silinebilir boya ve mantolama gibi farklı uygulamalar için profesyonel çözümler sunuyoruz.',
    features: ['İç Cephe Boya', 'Dış Cephe Boya', 'Dekoratif Boya', 'Alçı & Sıva Tamiri', 'Macun Uygulaması', 'Saten / Silinebilir Boya', 'Tavan & Kartonpiyer', 'Duvar Kağıdı Uygulaması'],
    faq: [
      { question: 'Bir ev boyama ne kadar sürer?', answer: 'Standart bir 2+1 dairenin boyası ortalama 2-3 gün sürer. Yüzey hazırlığı, macun ve alçı işlemleri süreyi etkileyebilir.' },
      { question: 'Boya malzemesi dahil mi?', answer: 'İsteğe bağlı olarak boya malzemesi temin edebiliriz veya kendi tercih ettiğiniz boyayı kullanabiliriz.' },
      { question: 'Dekoratif boya yapıyor musunuz?', answer: 'Evet, ventrawall, italyan boya, taş görünüm ve özel doku gibi dekoratif boya uygulamaları yapılmaktadır.' },
    ],
  },
  {
    id: '4', slug: 'tesisat', name: 'Tesisat', kategoriSlug: 'tesisat',
    description: 'Su tesisatı, tıkanıklık açma, kombi.', icon: 'Wrench',
    imageUrl: '/images/hizmetler/tesisat.png',
    metaDescription: 'Profesyonel tesisat hizmeti: su tesisatı, tıkanıklık açma, sıhhi tesisat, pis su gideri. 7/24 acil müdahale.',
    detailedDescription: 'Su tesisatı sorunlarınıza hızlı ve kalıcı çözümler sunuyoruz. Tıkanıklık açma, sızıntı tespiti, boru değişimi, batarya montajı, banyo ve mutfak tesisatı yenileme gibi tüm tesisat işleriniz için profesyonel ekibimiz hizmetinizdedir. Acil su kaçağı ve tıkanıklık durumlarında 7/24 müdahale sağlıyoruz.',
    features: ['Tıkanıklık Açma', 'Su Kaçağı Tespiti', 'Boru Değişimi & Tamiri', 'Batarya & Musluk Montaj', 'Banyo Tesisatı', 'Mutfak Tesisatı', 'Pis Su Gider Temizleme', 'Sıhhi Tesisat Yenileme'],
    faq: [
      { question: 'Acil tıkanıklık açma hizmeti var mı?', answer: 'Evet, 7/24 acil tıkanıklık açma hizmetimiz mevcuttur. Robotlu ve kameralı cihazlarla tıkanıklık tespit ve açma işlemi yapılır.' },
      { question: 'Su kaçağı tespiti nasıl yapılır?', answer: 'Profesyonel su kaçağı tespit cihazları ile kırma dökme olmadan kaçak noktası belirlenir ve onarım yapılır.' },
      { question: 'Tesisat tamiri ne kadar sürer?', answer: 'Basit tıkanıklık açma 30-60 dakika, boru değişimi 2-4 saat, banyo tesisatı yenileme ise 1-2 gün sürebilir.' },
    ],
  },
  {
    id: '5', slug: 'cam-cilalama', name: 'Cam Cilalama', kategoriSlug: 'cam-cilalama',
    description: 'Araç ve bina cam cilalama.', icon: 'Sparkles',
    imageUrl: '/images/hizmetler/cam-cilalama.png',
    metaDescription: 'Profesyonel cam cilalama hizmeti: araç cam cilası, bina cam temizliği, çizik giderme. Uzman kadro ile kaliteli hizmet.',
    detailedDescription: 'Araç ve bina camlarınız için profesyonel cam cilalama hizmeti. Araç ön cam çizik giderme, cam filmi uygulaması, bina dış cephe cam temizliği ve cam koruma kaplama gibi geniş kapsamlı hizmetler sunuyoruz. Uzman ekibimiz özel cilalama makineleri ve kaliteli ürünler ile camlarınızı ilk günkü parlaklığına kavuşturur.',
    features: ['Araç Cam Cilalama', 'Çizik Giderme', 'Cam Filmi Uygulaması', 'Bina Cam Temizliği', 'Cam Koruma Kaplama', 'Nano Seramik Kaplama', 'Yağmur Kaydırıcı', 'Far Cilalama'],
    faq: [
      { question: 'Cam cilalama ne kadar sürer?', answer: 'Araç cam cilalama ortalama 1-2 saat, bina cam temizliği binanın büyüklüğüne göre yarım gün ile tam gün arasında sürer.' },
      { question: 'Cam çizikleri tamamen giderilebilir mi?', answer: 'Hafif ve orta şiddetteki çizikler profesyonel cilalama ile giderilebilir. Derin çizikler için cam değişimi gerekebilir.' },
      { question: 'Cam filmi garantili mi?', answer: 'Evet, uygulanan cam filmleri 5-10 yıl garanti kapsamında sunulmaktadır.' },
    ],
  },
  {
    id: '6', slug: 'evden-eve-nakliyat', name: 'Evden Eve Nakliyat', kategoriSlug: 'nakliyat',
    description: 'Eşya taşıma ve nakliyat hizmeti.', icon: 'Truck',
    imageUrl: '/images/hizmetler/nakliyat.png',
    metaDescription: 'Evden eve nakliyat hizmeti: eşya paketleme, taşıma, montaj-demontaj. Sigortalı ve güvenli nakliyat.',
    detailedDescription: 'Evden eve nakliyat hizmetimizle taşınma sürecinizi stressiz hale getiriyoruz. Profesyonel paketleme, güvenli taşıma ve yeni evinizde düzenleme hizmeti sunuyoruz. Tüm eşyalarınız sigorta kapsamındadır. Şehir içi ve şehirlerarası nakliyat hizmeti mevcuttur. Asansörlü taşımacılık, eşya depolama ve mobilya montaj-demontaj hizmetleri de kapsamımızdadır.',
    features: ['Eşya Paketleme', 'Evden Eve Taşıma', 'Şehirlerarası Nakliyat', 'Asansörlü Taşımacılık', 'Mobilya Montaj / Demontaj', 'Eşya Depolama', 'Sigortalı Taşımacılık', 'Ofis Taşıma'],
    faq: [
      { question: 'Eşyalar sigortalı mı taşınıyor?', answer: 'Evet, tüm taşınan eşyalar nakliyat sigortası kapsamındadır. Olası hasarlarda tazminat sağlanır.' },
      { question: 'Nakliyat fiyatı nasıl belirlenir?', answer: 'Fiyat, taşınacak eşya miktarı, mesafe, kat sayısı ve asansör durumuna göre belirlenir. Ücretsiz keşif hizmeti sunulmaktadır.' },
      { question: 'Paketleme hizmeti dahil mi?', answer: 'İsteğe bağlı olarak profesyonel paketleme hizmeti sunulmaktadır. Kırılacak eşyalar özel ambalajlarla paketlenir.' },
    ],
  },
  {
    id: '7', slug: 'klima-montaj', name: 'Klima Montaj', kategoriSlug: 'tamir',
    description: 'Klima kurulum ve bakım.', icon: 'Wind',
    imageUrl: '/images/hizmetler/klima-montaj.png',
    metaDescription: 'Klima montaj ve bakım hizmeti: kurulum, bakım, gaz dolumu, arıza onarım. Tüm marka ve modeller.',
    detailedDescription: 'Klima montaj, bakım ve onarım hizmetlerimizle yazın serinliğini, kışın sıcaklığını evinize taşıyoruz. Tüm marka ve model klimalarda montaj, periyodik bakım, gaz dolumu, filtre temizliği ve arıza onarım hizmeti sunuyoruz. Uzman teknisyenlerimiz en son teknoloji ekipmanlarla hizmet vermektedir.',
    features: ['Klima Montajı', 'Periyodik Bakım', 'Gaz Dolumu', 'Filtre Temizliği', 'Arıza Onarım', 'Klima Yerinden Sökme', 'VRF Sistem Montaj', 'Kanal Tipi Klima'],
    faq: [
      { question: 'Klima montajı ne kadar sürer?', answer: 'Standart bir split klima montajı ortalama 1.5-2.5 saat sürmektedir. Multi split sistemlerde süre artabilir.' },
      { question: 'Klima bakımı ne sıklıkla yapılmalı?', answer: 'Klimanızın verimli çalışması için yılda en az 2 kez (yaz ve kış öncesi) bakım yaptırılması tavsiye edilir.' },
      { question: 'Tüm marka klimalara servis veriliyor mu?', answer: 'Evet, Daikin, Mitsubishi, Samsung, LG, Vestel ve diğer tüm marka klimalara montaj ve servis hizmeti sunulmaktadır.' },
    ],
  },
  {
    id: '8', slug: 'elektrikci', name: 'Elektrikçi', kategoriSlug: 'tamir',
    description: 'Elektrik tesisatı ve arıza.', icon: 'Zap',
    imageUrl: '/images/hizmetler/elektrikci.png',
    metaDescription: 'Profesyonel elektrikçi hizmeti: elektrik tesisatı, arıza onarım, priz montajı, aydınlatma. 7/24 acil müdahale.',
    detailedDescription: 'Elektrik tesisatınızla ilgili her türlü ihtiyacınızda yanınızdayız. Elektrik arıza tespiti, tesisat yenileme, priz ve anahtar montajı, aydınlatma sistemi kurulumu, sigorta panosu değişimi ve topraklama hizmeti sunuyoruz. Acil elektrik arızalarında 7/24 müdahale sağlıyoruz. Tüm işlerimiz ilgili yönetmeliklere uygun şekilde yapılmaktadır.',
    features: ['Elektrik Arıza Tespiti', 'Tesisat Yenileme', 'Priz & Anahtar Montajı', 'Aydınlatma Sistemi', 'Sigorta Panosu', 'Topraklama', 'Kablo Çekme', 'Güç Kaynağı Montaj'],
    faq: [
      { question: 'Acil elektrik arıza müdahalesi var mı?', answer: 'Evet, 7/24 acil elektrik arıza müdahale hizmetimiz mevcuttur. Kısa devre, patlama ve elektrik kesintisi gibi acil durumlarda hızla konumunuza geliyoruz.' },
      { question: 'Eski tesisat yenileme yapıyor musunuz?', answer: 'Evet, eski ve tehlikeli elektrik tesisatlarının komple yenilenmesi hizmetimiz vardır. Yeni yönetmeliklere uygun şekilde güncelleme yapılır.' },
      { question: 'Elektrik işleri garantili mi?', answer: 'Evet, yapılan tüm elektrik işleri 1 yıl işçilik garantisi kapsamındadır.' },
    ],
  },
  {
    id: '9', slug: 'banyo-tadilat', name: 'Banyo Tadilat', kategoriSlug: 'tadilat',
    description: 'Banyo yenileme ve tadilat.', icon: 'Bath',
    imageUrl: '/images/hizmetler/banyo-tadilat.png',
    metaDescription: 'Banyo tadilat hizmeti: komple banyo yenileme, fayans döşeme, seramik, duşakabin, lavabo montajı. Kaliteli işçilik.',
    detailedDescription: 'Banyonuzu baştan aşağı yeniliyoruz! Komple banyo tadilat hizmetimiz kapsamında mevcut fayans ve seramik sökümü, su tesisatı yenileme, yeni fayans/seramik döşeme, duşakabin montajı, küvet değişimi, lavabo ve klozet montajı hizmetleri sunulmaktadır. Modern ve şık banyo tasarımları ile hayalinizdeki banyoya sahip olun.',
    features: ['Komple Banyo Yenileme', 'Fayans & Seramik Döşeme', 'Duşakabin Montajı', 'Küvet Değişimi', 'Lavabo & Klozet Montajı', 'Su Tesisatı Yenileme', 'Banyo Aydınlatması', 'Tavan & Alçıpan'],
    faq: [
      { question: 'Komple banyo tadilat ne kadar sürer?', answer: 'Komple bir banyo tadilat projesi ortalama 7-12 iş günü sürmektedir. Projenin kapsamına göre süre değişebilir.' },
      { question: 'Banyo tadilat malzemesi dahil mi?', answer: 'İsteğe bağlı olarak fayans, seramik, batarya vb. malzemeleri temin edebiliriz. Dilerseiniz kendi malzemenizi de kullanabilirsiniz.' },
      { question: 'Banyo küçük, büyük gösterebilir misiniz?', answer: 'Evet, doğru fayans seçimi, ayna kullanımı ve aydınlatma teknikleri ile küçük banyolar bile oldukça ferah ve geniş gösterilebilir.' },
    ],
  },
  {
    id: '10', slug: 'bos-ev-temizligi', name: 'Boş Ev Temizliği', kategoriSlug: 'temizlik',
    description: 'Taşınma öncesi/sonrası temizlik.', icon: 'Home',
    imageUrl: '/images/hizmetler/bos-ev-temizligi.png',
    metaDescription: 'Boş ev temizliği hizmeti: taşınma öncesi ve sonrası derin temizlik. Profesyonel ekipman ile pırıl pırıl ev.',
    detailedDescription: 'Taşınma öncesi veya sonrası evinizin eksiksiz temizliği için boş ev temizlik hizmetimizden yararlanın. Tüm odalar, mutfak, banyo, pencereler, duvarlar ve zeminler profesyonel ekipmanlarla derin temizlenir. Yeni evinize tertemiz taşının veya eski evinizi temiz bırakın. İnşaat sonrası temizlik hizmeti de sunulmaktadır.',
    features: ['Taşınma Öncesi Temizlik', 'Taşınma Sonrası Temizlik', 'İnşaat Sonrası Temizlik', 'Pencere & Cam Temizliği', 'Duvar Silme', 'Zemin Temizliği', 'Mutfak Derin Temizlik', 'Banyo Dezenfeksiyon'],
    faq: [
      { question: 'Boş ev temizliği ne kadar sürer?', answer: 'Boş bir 2+1 dairenin temizliği ortalama 4-6 saat sürer. Evin durumu ve büyüklüğüne göre süre değişebilir.' },
      { question: 'İnşaat sonrası temizlik yapıyor musunuz?', answer: 'Evet, inşaat sonrası oluşan toz, boya kalıntısı, çimento artığı gibi kirliliklerin profesyonel temizliği yapılmaktadır.' },
      { question: 'Temizlik malzemeleri getirilir mi?', answer: 'Evet, endüstriyel temizlik makineleri ve profesyonel temizlik ürünleri ekibimiz tarafından getirilmektedir.' },
    ],
  },
  {
    id: '11', slug: 'ozel-ders', name: 'Özel Ders', kategoriSlug: 'ozel-ders',
    description: 'İlkokul, lise ve dil dersleri.', icon: 'BookOpen',
    imageUrl: '/images/hizmetler/ozel-ders.png',
    metaDescription: 'Özel ders hizmeti: matematik, fizik, kimya, İngilizce ve tüm dersler. Deneyimli öğretmenler ile birebir eğitim.',
    detailedDescription: 'İlkokul, ortaokul, lise ve üniversite hazırlık süreçlerinde öğrencileriniz için birebir özel ders hizmeti sunuyoruz. Matematik, fizik, kimya, biyoloji, İngilizce, Almanca ve diğer tüm dersler için uzman öğretmenlerimiz mevcuttur. LGS, YKS ve dil sınavlarına hazırlık programları da bulunmaktadır. Online veya yüz yüze ders seçenekleri mevcuttur.',
    features: ['Matematik Özel Ders', 'Fizik & Kimya', 'İngilizce & Yabancı Dil', 'LGS Hazırlık', 'YKS / TYT / AYT Hazırlık', 'İlkokul Destek Eğitimi', 'Online Ders İmkanı', 'Yüz Yüze Birebir Ders'],
    faq: [
      { question: 'Öğretmenler nasıl seçiliyor?', answer: 'Tüm öğretmenlerimiz alanında deneyimli, referanslı ve pedagojik yetkinliğe sahip kişilerden oluşmaktadır.' },
      { question: 'Online ders imkanı var mı?', answer: 'Evet, Zoom, Google Meet veya tercih ettiğiniz platform üzerinden online ders verilebilmektedir.' },
      { question: 'Ders saati esnekliği var mı?', answer: 'Evet, ders günü ve saati öğrencinin programına göre esnek şekilde belirlenebilir.' },
    ],
  },
  {
    id: '12', slug: 'kombi-servisi', name: 'Kombi Servisi', kategoriSlug: 'tesisat',
    description: 'Kombi montaj, bakım ve arıza.', icon: 'Thermometer',
    imageUrl: '/images/hizmetler/kombi-servis.png',
    metaDescription: 'Kombi servisi hizmeti: kombi montaj, periyodik bakım, arıza onarım, gaz ayarı. Tüm marka ve modeller.',
    detailedDescription: 'Kombinin montajından bakımına, arıza onarımından gaz ayarına kadar tüm kombi servis ihtiyaçlarınızda profesyonel hizmet sunuyoruz. Tüm marka ve model kombilere servis verilmektedir. Kış öncesi periyodik bakım ile kombinin verimli çalışmasını sağlıyor, olası arızaların önüne geçiyoruz. Yeni kombi montajı, eski kombi sökümü ve petek temizliği hizmetleri de mevcuttur.',
    features: ['Kombi Montajı', 'Periyodik Bakım', 'Arıza Onarımı', 'Gaz Ayarı', 'Petek Temizliği', 'Kombi Sökümü', 'Baca Gazı Ölçümü', 'Hermetik Dönüşüm'],
    faq: [
      { question: 'Kombi bakımı ne sıklıkla yapılmalı?', answer: 'Kombinin verimli ve güvenli çalışması için yılda en az 1 kez, tercihen kış öncesinde bakım yaptırılması tavsiye edilir.' },
      { question: 'Tüm marka kombilere servis veriliyor mu?', answer: 'Evet, Baymak, Demirdöküm, Bosch, Ariston, Vaillant ve diğer tüm marka kombilere servis hizmeti sunulmaktadır.' },
      { question: 'Petek temizliği kombiden ayrı mı yapılıyor?', answer: 'Evet, petek temizliği ayrı bir hizmet olup, özel cihazlarla peteklerin içindeki kireç ve tortu temizlenir.' },
    ],
  },
];

/**
 * slug'a göre hizmet detayını bul.
 */
export function getHizmetBySlug(slug: string): HizmetItem | undefined {
  return TREND_HIZMETLER.find((h) => h.slug === slug);
}

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
