import { useState } from 'react';
import { motion } from 'framer-motion';

interface CityData {
    city: string;
    saleCount: number;
    customerCount: number;
    totalRevenue: number;
}

interface TurkeyMapInteractiveProps {
    cityData: Record<number, CityData>;
    onCityClick: (plateNumber: number, cityName: string) => void;
}

// Türkiye illeri ve plaka kodları
const TURKEY_CITIES = [
    { id: 1, name: 'Adana', plate: 1, x: 65, y: 67 },
    { id: 2, name: 'Adıyaman', plate: 2, x: 72, y: 63 },
    { id: 3, name: 'Afyonkarahisar', plate: 3, x: 47, y: 58 },
    { id: 4, name: 'Ağrı', plate: 4, x: 85, y: 55 },
    { id: 5, name: 'Amasya', plate: 5, x: 62, y: 45 },
    { id: 6, name: 'Ankara', plate: 6, x: 54, y: 55 },
    { id: 7, name: 'Antalya', plate: 7, x: 48, y: 68 },
    { id: 8, name: 'Artvin', plate: 8, x: 78, y: 42 },
    { id: 9, name: 'Aydın', plate: 9, x: 40, y: 63 },
    { id: 10, name: 'Balıkesir', plate: 10, x: 41, y: 54 },
    { id: 11, name: 'Bilecik', plate: 11, x: 47, y: 50 },
    { id: 12, name: 'Bingöl', plate: 12, x: 78, y: 58 },
    { id: 13, name: 'Bitlis', plate: 13, x: 82, y: 61 },
    { id: 14, name: 'Bolu', plate: 14, x: 52, y: 48 },
    { id: 15, name: 'Burdur', plate: 15, x: 47, y: 64 },
    { id: 16, name: 'Bursa', plate: 16, x: 45, y: 50 },
    { id: 17, name: 'Çanakkale', plate: 17, x: 37, y: 50 },
    { id: 18, name: 'Çankırı', plate: 18, x: 55, y: 48 },
    { id: 19, name: 'Çorum', plate: 19, x: 60, y: 48 },
    { id: 20, name: 'Denizli', plate: 20, x: 45, y: 63 },
    { id: 21, name: 'Diyarbakır', plate: 21, x: 78, y: 63 },
    { id: 22, name: 'Edirne', plate: 22, x: 36, y: 43 },
    { id: 23, name: 'Elazığ', plate: 23, x: 74, y: 60 },
    { id: 24, name: 'Erzincan', plate: 24, x: 74, y: 54 },
    { id: 25, name: 'Erzurum', plate: 25, x: 78, y: 53 },
    { id: 26, name: 'Eskişehir', plate: 26, x: 48, y: 54 },
    { id: 27, name: 'Gaziantep', plate: 27, x: 68, y: 67 },
    { id: 28, name: 'Giresun', plate: 28, x: 66, y: 45 },
    { id: 29, name: 'Gümüşhane', plate: 29, x: 72, y: 48 },
    { id: 30, name: 'Hakkari', plate: 30, x: 86, y: 66 },
    { id: 31, name: 'Hatay', plate: 31, x: 64, y: 70 },
    { id: 32, name: 'Isparta', plate: 32, x: 48, y: 63 },
    { id: 33, name: 'Mersin', plate: 33, x: 60, y: 68 },
    { id: 34, name: 'İstanbul', plate: 34, x: 42, y: 45 },
    { id: 35, name: 'İzmir', plate: 35, x: 38, y: 60 },
    { id: 36, name: 'Kars', plate: 36, x: 83, y: 48 },
    { id: 37, name: 'Kastamonu', plate: 37, x: 56, y: 44 },
    { id: 38, name: 'Kayseri', plate: 38, x: 64, y: 58 },
    { id: 39, name: 'Kırklareli', plate: 39, x: 38, y: 43 },
    { id: 40, name: 'Kırşehir', plate: 40, x: 58, y: 55 },
    { id: 41, name: 'Kocaeli', plate: 41, x: 46, y: 46 },
    { id: 42, name: 'Konya', plate: 42, x: 54, y: 62 },
    { id: 43, name: 'Kütahya', plate: 43, x: 45, y: 56 },
    { id: 44, name: 'Malatya', plate: 44, x: 70, y: 60 },
    { id: 45, name: 'Manisa', plate: 45, x: 40, y: 58 },
    { id: 46, name: 'Kahramanmaraş', plate: 46, x: 68, y: 64 },
    { id: 47, name: 'Mardin', plate: 47, x: 78, y: 67 },
    { id: 48, name: 'Muğla', plate: 48, x: 42, y: 66 },
    { id: 49, name: 'Muş', plate: 49, x: 80, y: 58 },
    { id: 50, name: 'Nevşehir', plate: 50, x: 60, y: 58 },
    { id: 51, name: 'Niğde', plate: 51, x: 60, y: 62 },
    { id: 52, name: 'Ordu', plate: 52, x: 66, y: 47 },
    { id: 53, name: 'Rize', plate: 53, x: 74, y: 43 },
    { id: 54, name: 'Sakarya', plate: 54, x: 48, y: 47 },
    { id: 55, name: 'Samsun', plate: 55, x: 64, y: 44 },
    { id: 56, name: 'Siirt', plate: 56, x: 82, y: 64 },
    { id: 57, name: 'Sinop', plate: 57, x: 60, y: 42 },
    { id: 58, name: 'Sivas', plate: 58, x: 66, y: 54 },
    { id: 59, name: 'Tekirdağ', plate: 59, x: 38, y: 45 },
    { id: 60, name: 'Tokat', plate: 60, x: 64, y: 50 },
    { id: 61, name: 'Trabzon', plate: 61, x: 72, y: 44 },
    { id: 62, name: 'Tunceli', plate: 62, x: 74, y: 57 },
    { id: 63, name: 'Şanlıurfa', plate: 63, x: 72, y: 66 },
    { id: 64, name: 'Uşak', plate: 64, x: 44, y: 60 },
    { id: 65, name: 'Van', plate: 65, x: 84, y: 60 },
    { id: 66, name: 'Yozgat', plate: 66, x: 60, y: 52 },
    { id: 67, name: 'Zonguldak', plate: 67, x: 52, y: 44 },
    { id: 68, name: 'Aksaray', plate: 68, x: 58, y: 60 },
    { id: 69, name: 'Bayburt', plate: 69, x: 76, y: 48 },
    { id: 70, name: 'Karaman', plate: 70, x: 56, y: 64 },
    { id: 71, name: 'Kırıkkale', plate: 71, x: 56, y: 52 },
    { id: 72, name: 'Batman', plate: 72, x: 80, y: 63 },
    { id: 73, name: 'Şırnak', plate: 73, x: 84, y: 67 },
    { id: 74, name: 'Bartın', plate: 74, x: 54, y: 44 },
    { id: 75, name: 'Ardahan', plate: 75, x: 82, y: 46 },
    { id: 76, name: 'Iğdır', plate: 76, x: 86, y: 52 },
    { id: 77, name: 'Yalova', plate: 77, x: 44, y: 47 },
    { id: 78, name: 'Karabük', plate: 78, x: 54, y: 46 },
    { id: 79, name: 'Kilis', plate: 79, x: 68, y: 69 },
    { id: 80, name: 'Osmaniye', plate: 80, x: 66, y: 68 },
    { id: 81, name: 'Düzce', plate: 81, x: 50, y: 47 },
];

export default function TurkeyMapInteractive({ cityData, onCityClick }: TurkeyMapInteractiveProps) {
    const [hoveredCity, setHoveredCity] = useState<number | null>(null);

    // Maksimum satış sayısını bul
    const maxSales = Math.max(...Object.values(cityData).map(c => c.saleCount), 1);

    // Şehir rengi hesapla - satış sayısına göre
    const getCityColor = (plateNumber: number): string => {
        const data = cityData[plateNumber];
        if (!data) return '#e5e7eb'; // Gri - veri yok

        const intensity = data.saleCount / maxSales;

        // Gradient: Açık mavi -> Koyu mavi -> Mor
        if (intensity < 0.33) {
            // Açık mavi -> Mavi
            const t = intensity / 0.33;
            return `hsl(${200 + t * 20}, ${60 + t * 20}%, ${70 - t * 20}%)`;
        } else if (intensity < 0.66) {
            // Mavi -> Koyu mavi
            const t = (intensity - 0.33) / 0.33;
            return `hsl(${220 + t * 20}, ${80 - t * 10}%, ${50 - t * 10}%)`;
        } else {
            // Koyu mavi -> Mor/Kırmızı
            const t = (intensity - 0.66) / 0.34;
            return `hsl(${240 + t * 40}, ${70 + t * 20}%, ${40 - t * 10}%)`;
        }
    };

    // Şehir boyutu hesapla - satış sayısına göre
    const getCityRadius = (plateNumber: number): number => {
        const data = cityData[plateNumber];
        if (!data) return 3;

        const intensity = data.saleCount / maxSales;
        return 4 + intensity * 8; // 4px - 12px arası
    };

    return (
        <div className="relative w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg p-6">
            <svg
                viewBox="0 0 100 80"
                className="w-full h-auto"
                style={{ maxHeight: '600px' }}
            >
                {/* Arka plan dekoratif elemanlar */}
                <defs>
                    <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                    </radialGradient>

                    <filter id="glow">
                        <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <filter id="shadow">
                        <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodOpacity="0.3" />
                    </filter>
                </defs>

                {/* Arka plan glow efekti */}
                <circle cx="50" cy="40" r="40" fill="url(#mapGlow)" />

                {/* Şehirler arası bağlantı çizgileri (isteğe bağlı) */}
                {TURKEY_CITIES.map((city) => {
                    const data = cityData[city.plate];
                    if (!data || data.saleCount === 0) return null;

                    // En yakın komşu şehirleri bul ve hafif bağlantı çizgileri çiz
                    return null; // Şimdilik devre dışı
                })}

                {/* Şehir noktaları */}
                {TURKEY_CITIES.map((city) => {
                    const data = cityData[city.plate];
                    const hasData = !!data && data.saleCount > 0;
                    const isHovered = hoveredCity === city.plate;
                    const radius = hasData ? getCityRadius(city.plate) : 2;
                    const color = getCityColor(city.plate);

                    return (
                        <g key={city.id}>
                            {/* Hover efekti için dış halka */}
                            {isHovered && hasData && (
                                <motion.circle
                                    cx={city.x}
                                    cy={city.y}
                                    r={radius + 2}
                                    fill="none"
                                    stroke={color}
                                    strokeWidth="0.5"
                                    opacity="0.5"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1.2, opacity: 0.5 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}

                            {/* Ana şehir noktası */}
                            <motion.circle
                                cx={city.x}
                                cy={city.y}
                                r={radius}
                                fill={color}
                                stroke={hasData ? '#fff' : 'transparent'}
                                strokeWidth={hasData ? '0.5' : '0'}
                                className="cursor-pointer transition-all"
                                filter={hasData ? 'url(#shadow)' : undefined}
                                onMouseEnter={() => setHoveredCity(city.plate)}
                                onMouseLeave={() => setHoveredCity(null)}
                                onClick={() => {
                                    if (hasData) {
                                        onCityClick(city.plate, city.name);
                                    }
                                }}
                                whileHover={hasData ? { scale: 1.3 } : {}}
                                whileTap={hasData ? { scale: 0.95 } : {}}
                            />

                            {/* Satış sayısı etiketi - sadece hover'da */}
                            {isHovered && hasData && (
                                <motion.g
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Arka plan kutusu */}
                                    <rect
                                        x={city.x - 15}
                                        y={city.y - radius - 8}
                                        width="30"
                                        height="6"
                                        rx="1"
                                        fill="rgba(0, 0, 0, 0.8)"
                                        filter="url(#shadow)"
                                    />
                                    {/* Şehir adı */}
                                    <text
                                        x={city.x}
                                        y={city.y - radius - 4.5}
                                        textAnchor="middle"
                                        className="text-[3px] font-bold fill-white"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {city.name}
                                    </text>
                                    {/* Satış sayısı */}
                                    <text
                                        x={city.x}
                                        y={city.y - radius - 1.5}
                                        textAnchor="middle"
                                        className="text-[2.5px] font-semibold fill-yellow-300"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                    >
                                        {data.saleCount} satış
                                    </text>
                                </motion.g>
                            )}

                            {/* Satış sayısı - büyük şehirler için her zaman göster */}
                            {hasData && data.saleCount > maxSales * 0.3 && !isHovered && (
                                <text
                                    x={city.x}
                                    y={city.y + 0.8}
                                    textAnchor="middle"
                                    className="text-[2.5px] font-bold fill-white"
                                    style={{
                                        pointerEvents: 'none',
                                        userSelect: 'none',
                                        textShadow: '0 0 2px rgba(0,0,0,0.8)'
                                    }}
                                >
                                    {data.saleCount}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Renk skalası göstergesi */}
            <div className="mt-6 flex items-center justify-center gap-3">
                <span className="text-sm text-muted-foreground">Az Satış</span>
                <div className="flex gap-1">
                    {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => {
                        let color;
                        if (intensity < 0.33) {
                            const t = intensity / 0.33;
                            color = `hsl(${200 + t * 20}, ${60 + t * 20}%, ${70 - t * 20}%)`;
                        } else if (intensity < 0.66) {
                            const t = (intensity - 0.33) / 0.33;
                            color = `hsl(${220 + t * 20}, ${80 - t * 10}%, ${50 - t * 10}%)`;
                        } else {
                            const t = (intensity - 0.66) / 0.34;
                            color = `hsl(${240 + t * 40}, ${70 + t * 20}%, ${40 - t * 10}%)`;
                        }

                        return (
                            <div
                                key={intensity}
                                className="w-8 h-6 rounded border border-border"
                                style={{ backgroundColor: color }}
                            />
                        );
                    })}
                </div>
                <span className="text-sm text-muted-foreground">Çok Satış</span>
            </div>

            {/* İstatistikler */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-primary">
                        {Object.keys(cityData).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Aktif Şehir</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-primary">
                        {Object.values(cityData).reduce((sum, c) => sum + c.saleCount, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Toplam Satış</div>
                </div>
                <div>
                    <div className="text-2xl font-bold text-primary">
                        {Object.values(cityData).reduce((sum, c) => sum + c.customerCount, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Toplam Müşteri</div>
                </div>
            </div>
        </div>
    );
}
