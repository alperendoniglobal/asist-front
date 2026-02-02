import { useEffect, useRef } from 'react';
import TurkeyMap from 'turkey-map-react';
import { cities as turkeyCities } from 'turkey-map-react/lib/data';
import { useTheme } from '@/contexts/ThemeContext';

/** Tema değişiminde renklendirmeyi geciktirir; flicker önlenir */
const THEME_DEBOUNCE_MS = 180;
const INITIAL_COLORIZE_DELAY_MS = 400;
const RETRY_INTERVAL_MS = 250;
const MAX_RETRIES = 8;

/**
 * Şehir bazlı satış dağılımı için Türkiye haritası.
 * Light/dark moda göre arka plan, stroke ve veri yok rengi uyumlu çalışır.
 * Tema geçişinde debounce ile tek seferde renklendirilir (flicker önlenir).
 */
export interface CityDistributionItem {
  plateNumber?: number;
  city?: string;
  saleCount: number;
  customerCount?: number;
  totalRevenue?: number;
}

interface TurkeyMapSalesProps {
  /** Şehir bazlı satış verisi (plaka, şehir adı, satış sayısı vb.) */
  cityDistribution: CityDistributionItem[];
  /** Şehre tıklanınca çağrılır (detay modal için) */
  onCityClick?: (city: { plateNumber: number; name: string; saleCount: number; city?: string; customerCount?: number; totalRevenue?: number }) => void;
  /** Renk skalası (Az satış - Çok satış) gösterilsin mi */
  showLegend?: boolean;
  /** Kompakt görünüm: daha az padding + max yükseklik (layout'a uyum) */
  compact?: boolean;
  /** Ek container class */
  className?: string;
}

export default function TurkeyMapSales({
  cityDistribution,
  onCityClick,
  showLegend = true,
  compact = false,
  className = '',
}: TurkeyMapSalesProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const timeoutIdsRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Dark mode: koyu arka plan, açık stroke. Light mode: beyaz arka plan, beyaz stroke.
  const strokeColor = isDark ? '#475569' : '#fff';
  const noDataFill = isDark ? '#334155' : '#e5e7eb';
  const idleColor = noDataFill;
  const hoverColor = '#dc2626';

  // Harita renklendirme: tema değişiminde debounce ile tek seferde uygulanır (light/dark geçişinde flicker olmaz)
  useEffect(() => {
    if (!cityDistribution?.length) return;

    const citiesWithData = cityDistribution.filter((c: CityDistributionItem) => c.plateNumber);
    if (citiesWithData.length === 0) return;

    // Bu effect çalıştığı andaki tema değerini kilitle; closure içinde hep bunu kullan
    const themeStroke = resolvedTheme === 'dark' ? '#475569' : '#fff';
    const themeNoDataFill = resolvedTheme === 'dark' ? '#334155' : '#e5e7eb';

    const maxSales = Math.max(...citiesWithData.map((c: CityDistributionItem) => c.saleCount), 1);

    const getCityColor = (saleCount: number) => {
      const intensity = saleCount / maxSales;
      const red = Math.floor(220 - intensity * 100);
      const green = Math.floor(50 - intensity * 30);
      const blue = Math.floor(50 - intensity * 30);
      return `rgb(${red}, ${green}, ${blue})`;
    };

    const cityMap = citiesWithData.reduce((acc: Record<number, CityDistributionItem>, city: CityDistributionItem) => {
      if (city.plateNumber) acc[city.plateNumber] = city;
      return acc;
    }, {});

    const cityPathMap = (turkeyCities as { path?: string; plateNumber?: number }[]).reduce(
      (acc: Record<string, number>, cityItem) => {
        if (cityItem.path != null && cityItem.plateNumber != null) acc[cityItem.path] = cityItem.plateNumber;
        return acc;
      },
      {}
    );

    let cancelled = false;

    const colorizeMap = () => {
      if (cancelled) return;
      const container = mapContainerRef.current;
      const allPaths = container ? container.querySelectorAll('svg path') : [];

      if (allPaths.length === 0) return;

      allPaths.forEach((pathElement) => {
        if (cancelled) return;
        const pathString = pathElement.getAttribute('d') || '';
        if (!pathString) return;

        const normalizedPath = pathString.trim().replace(/\s+/g, ' ');
        let plateNumber: number | null = cityPathMap[pathString] ?? cityPathMap[normalizedPath] ?? null;

        if (plateNumber == null) {
          for (const [cityPath, plate] of Object.entries(cityPathMap)) {
            if (
              pathString.startsWith(cityPath.substring(0, 50)) ||
              cityPath.startsWith(pathString.substring(0, 50))
            ) {
              plateNumber = plate;
              break;
            }
          }
        }

        const pathEl = pathElement as SVGPathElement;

        if (plateNumber != null) {
          const city = cityMap[plateNumber];

          if (city) {
            const color = getCityColor(city.saleCount);
            pathEl.setAttribute('fill', color);
            pathEl.style.setProperty('fill', color, 'important');
            pathEl.setAttribute('stroke', themeStroke);
            pathEl.setAttribute('stroke-width', '1.5');
            pathEl.style.cursor = 'pointer';

            const newMouseEnter = () => {
              pathEl.setAttribute('fill', hoverColor);
              pathEl.style.fill = hoverColor;
              pathEl.setAttribute('stroke-width', '2.5');
            };

            const newMouseLeave = () => {
              pathEl.setAttribute('fill', color);
              pathEl.style.fill = color;
              pathEl.setAttribute('stroke-width', '1.5');
            };

            pathEl.removeEventListener('mouseenter', newMouseEnter);
            pathEl.removeEventListener('mouseleave', newMouseLeave);
            pathEl.addEventListener('mouseenter', newMouseEnter);
            pathEl.addEventListener('mouseleave', newMouseLeave);
          } else {
            pathEl.setAttribute('fill', themeNoDataFill);
            pathEl.style.setProperty('fill', themeNoDataFill, 'important');
            pathEl.setAttribute('stroke', themeStroke);
            pathEl.setAttribute('stroke-width', '1');
          }
        }
      });
    };

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timeoutIdsRef.current.push(id);
    };

    const tryColorize = (attempt: number) => {
      if (cancelled) return;
      colorizeMap();
      if (attempt < MAX_RETRIES) schedule(() => tryColorize(attempt + 1), RETRY_INTERVAL_MS);
    };

    // Tema değişiminde kısa debounce: DOM ve CSS güncellendikten sonra tek seferde renklendir
    const debounceId = setTimeout(() => {
      schedule(() => tryColorize(0), INITIAL_COLORIZE_DELAY_MS);
    }, THEME_DEBOUNCE_MS);
    timeoutIdsRef.current.push(debounceId);

    return () => {
      cancelled = true;
      timeoutIdsRef.current.forEach((id) => clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [cityDistribution, resolvedTheme]);

  const citiesWithData = cityDistribution.filter((c: CityDistributionItem) => c.plateNumber);
  const maxSales = citiesWithData.length
    ? Math.max(...citiesWithData.map((c: CityDistributionItem) => c.saleCount), 1)
    : 1;

  return (
    <div
      ref={mapContainerRef}
      className={`rounded-lg border bg-white dark:bg-slate-900 relative overflow-hidden ${compact ? 'p-3 max-h-[300px]' : 'p-4'} ${className}`}
    >
      {/* Kompakt modda harita ölçeklenir, layout'a uyumlu tek satır kaplamaz */}
      <div
        className={compact ? 'flex items-center justify-center min-h-0' : ''}
        style={compact ? { transform: 'scale(0.58)', transformOrigin: 'top center' } : undefined}
      >
        <TurkeyMap
          hoverable
          customStyle={{ idleColor, hoverColor }}
          showTooltip={false}
          onClick={(payload: { plateNumber: number; name: string }) => {
          if (!onCityClick) return;
          const city = cityDistribution.find((c) => c.plateNumber === payload.plateNumber);
          if (city?.plateNumber != null) {
            onCityClick({
              plateNumber: payload.plateNumber,
              name: payload.name,
              saleCount: city.saleCount,
              city: city.city,
              customerCount: city.customerCount,
              totalRevenue: city.totalRevenue,
            });
          }
        }}
        />
      </div>
      {showLegend && citiesWithData.length > 0 && (
        <div className={compact ? 'mt-2 space-y-1' : 'mt-4 space-y-2'}>
          <div className={`flex flex-wrap items-center justify-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
            <span className="text-muted-foreground font-semibold">Az</span>
            <div className="flex gap-1">
              {[0, 0.25, 0.5, 0.75, 1].map((intensity) => {
                const red = Math.floor(220 - intensity * 100);
                const green = Math.floor(50 - intensity * 30);
                const blue = Math.floor(50 - intensity * 30);
                const color = `rgb(${red}, ${green}, ${blue})`;
                const size = compact ? 18 : 28;
                return (
                  <div
                    key={intensity}
                    style={{
                      width: size,
                      height: size,
                      backgroundColor: color,
                      borderRadius: '4px',
                      border: isDark ? `2px solid ${strokeColor}` : '2px solid white',
                      boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                );
              })}
            </div>
            <span className="text-muted-foreground font-semibold">Çok</span>
          </div>
          {!compact && (
            <p className="text-xs text-center text-muted-foreground">
              En yüksek satış: {maxSales} satış. Şehirlere tıklayarak detay görebilirsiniz.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
