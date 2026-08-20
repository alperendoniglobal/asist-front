import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TrendingUp, Car, MapPin, Calendar, BarChart3, Wallet, Building2 } from 'lucide-react';
import { statsService } from '@/services/apiService';
import TurkeyMap from 'turkey-map-react';
import { cities as turkeyCities } from 'turkey-map-react/lib/data';
import React from 'react';
import { toast } from 'sonner';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

/**
 * Satış Dağılım Raporu Sayfası
 * SUPER_ADMIN için - En çok satılan marka, model, model yılı ve şehir bazlı dağılım
 */
export default function SalesDistributionReport() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isCityDetailOpen, setIsCityDetailOpen] = useState(false);
  // Dark mode: harita stroke rengi (light'ta beyaz, dark'ta slate ki koyu arka planda görünsün)
  const mapStrokeColor = isDark ? '#475569' : '#fff';
  const mapNoDataFill = isDark ? '#334155' : '#e5e7eb';

  useEffect(() => {
    loadReport();
  }, []);

  // Harita render edildikten sonra path'leri direkt renklendir
  useEffect(() => {
    if (!reportData) return;

    const colorizeMap = () => {
      const citiesWithData = reportData.cityDistribution.filter((c: any) => c.plateNumber);
      if (citiesWithData.length === 0) return;

      const maxSales = Math.max(...citiesWithData.map((c: any) => c.saleCount), 1);

      // Tüm path elementlerini bul
      const allPaths = document.querySelectorAll('svg path');

      if (allPaths.length === 0) {
        // Path'ler henüz render edilmemiş, tekrar dene
        setTimeout(colorizeMap, 200);
        return;
      }

      // Her şehir için renk hesapla
      // intensity: 0 = az satış, 1 = çok satış (maxSales'e göre)
      const getCityColor = (saleCount: number) => {
        const intensity = saleCount / maxSales; // 0 ile 1 arası değer
        
        // Kırmızı tonları - daha fazla satış = daha koyu kırmızı
        // intensity = 0 -> rgb(220, 50, 50) (açık kırmızı - az satış)
        // intensity = 1 -> rgb(120, 20, 20) (koyu kırmızı - çok satış)
        const red = Math.floor(220 - (intensity * 100));
        const green = Math.floor(50 - (intensity * 30));
        const blue = Math.floor(50 - (intensity * 30));
        return `rgb(${red}, ${green}, ${blue})`;
      };

      // Şehir verilerini plaka numarasına göre map'le
      const cityMap = citiesWithData.reduce((acc: any, city: any) => {
        acc[city.plateNumber] = city;
        return acc;
      }, {});

      // Turkey-map-react paketinden gelen city data'sını kullanarak path'leri eşleştir
      const cityPathMap = (turkeyCities as any[]).reduce((acc: any, cityItem: any) => {
        acc[cityItem.path] = cityItem.plateNumber;
        return acc;
      }, {});

      // Path'leri renklendir - path string'lerini kullanarak eşleştir
      allPaths.forEach((pathElement) => {
        const pathString = pathElement.getAttribute('d') || '';
        if (!pathString) return;

        // Path string'ini normalize et (boşlukları temizle)
        const normalizedPath = pathString.trim().replace(/\s+/g, ' ');

        // City data'dan plaka numarasını bul
        let plateNumber: number | null = null;

        // Önce tam eşleşme kontrol et
        if (cityPathMap[pathString]) {
          plateNumber = cityPathMap[pathString];
        } else if (cityPathMap[normalizedPath]) {
          plateNumber = cityPathMap[normalizedPath];
        } else {
          // Kısmi eşleşme - path'in başlangıcını kontrol et
          for (const [cityPath, plate] of Object.entries(cityPathMap)) {
            if (pathString.startsWith(cityPath.substring(0, 50)) || cityPath.startsWith(pathString.substring(0, 50))) {
              plateNumber = plate as number;
              break;
            }
          }
        }

        if (plateNumber) {
          const city = cityMap[plateNumber];

          if (city) {
            const color = getCityColor(city.saleCount);
            const pathEl = pathElement as SVGPathElement;

            // Path'i renklendir - hem attribute hem style ile
            pathEl.setAttribute('fill', color);
            pathEl.style.setProperty('fill', color, 'important');
            pathEl.setAttribute('stroke', mapStrokeColor);
            pathEl.setAttribute('stroke-width', '1.5');
            pathEl.style.cursor = 'pointer';

            // Mevcut hover event'lerini kaldır (tekrar eklememek için)
            const newMouseEnter = () => {
              pathEl.setAttribute('fill', '#dc2626');
              pathEl.style.fill = '#dc2626';
              pathEl.setAttribute('stroke-width', '2.5');
            };

            const newMouseLeave = () => {
              pathEl.setAttribute('fill', color);
              pathEl.style.fill = color;
              pathEl.setAttribute('stroke-width', '1.5');
            };

            // Eski event listener'ları kaldır
            pathEl.removeEventListener('mouseenter', newMouseEnter);
            pathEl.removeEventListener('mouseleave', newMouseLeave);

            // Yeni event listener'ları ekle
            pathEl.addEventListener('mouseenter', newMouseEnter);
            pathEl.addEventListener('mouseleave', newMouseLeave);
          }
        }
      });
    };

    // Harita render olana kadar bekle - birkaç kez dene
    let attempts = 0;
    const maxAttempts = 10;

    const tryColorize = () => {
      attempts++;
      colorizeMap();

      // Eğer path'ler bulunamadıysa ve deneme hakkımız varsa tekrar dene
      if (attempts < maxAttempts) {
        setTimeout(tryColorize, 300);
      }
    };

    setTimeout(tryColorize, 500);
  }, [reportData, mapStrokeColor]);


  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await statsService.getSalesDistributionReport();
      setReportData(data);
    } catch (error: any) {
      console.error('Rapor yüklenirken hata:', error);
      toast.error('Rapor yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Rapor verisi bulunamadı</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Şehir dağılımını harita için hazırla
  const cityData = reportData.cityDistribution.reduce((acc: any, item: any) => {
    if (item.plateNumber) {
      acc[item.plateNumber] = {
        city: item.city,
        saleCount: item.saleCount,
        customerCount: item.customerCount,
        totalRevenue: item.totalRevenue,
      };
    }
    return acc;
  }, {});

  // Renk hesaplama için maksimum satış sayısını bul
  const citiesWithData = reportData.cityDistribution.filter((c: any) => c.plateNumber);
  const maxSales = Math.max(...citiesWithData.map((c: any) => c.saleCount), 1);

  // Şehir renklerini hesapla - satış sayısına göre canlı gradient (Yeşil -> Sarı -> Turuncu -> Kırmızı). Dark modda veri yok rengi koyu.
  const getCityColor = (plateNumber: number) => {
    const cityInfo = cityData[plateNumber];
    if (!cityInfo) return mapNoDataFill; // Tema uyumlu gri - veri yok

    const intensity = cityInfo.saleCount / maxSales;

    // Canlı ve keskin renk geçişleri
    if (intensity < 0.25) {
      // Yeşil tonları (az satış)
      return `hsl(${120 - intensity * 80}, 85%, 45%)`;
    } else if (intensity < 0.5) {
      // Sarı tonları
      const t = (intensity - 0.25) / 0.25;
      return `hsl(${50 - t * 10}, 95%, 50%)`;
    } else if (intensity < 0.75) {
      // Turuncu tonları
      const t = (intensity - 0.5) / 0.25;
      return `hsl(${30 - t * 10}, 100%, 50%)`;
    } else {
      // Kırmızı tonları (çok satış)
      const t = (intensity - 0.75) / 0.25;
      return `hsl(${10 - t * 10}, 100%, ${50 - t * 5}%)`;
    }
  };

  // Path merkezini hesapla (satış sayısını göstermek için)
  const getPathCenter = (pathString: string): { x: number; y: number } | null => {
    if (!pathString) return null;
    try {
      const numbers = pathString.match(/[\d.]+/g);
      if (!numbers || numbers.length < 2) return null;

      const coords: { x: number; y: number }[] = [];
      for (let i = 0; i < numbers.length - 1; i += 2) {
        const x = parseFloat(numbers[i]);
        const y = parseFloat(numbers[i + 1]);
        if (!isNaN(x) && !isNaN(y) && x > 0 && y > 0) {
          coords.push({ x, y });
        }
      }

      if (coords.length === 0) return null;

      const minX = Math.min(...coords.map(c => c.x));
      const maxX = Math.max(...coords.map(c => c.x));
      const minY = Math.min(...coords.map(c => c.y));
      const maxY = Math.max(...coords.map(c => c.y));

      return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    } catch (e) {
      return null;
    }
  };

  // City wrapper - şehirleri renklendir ve satış sayılarını göster (dark modda stroke tema uyumlu)
  const renderCity = (cityComponent: React.ReactElement, cityDataItem: any) => {
    const cityInfo = cityData[cityDataItem.plateNumber];
    const color = cityInfo ? getCityColor(cityDataItem.plateNumber) : mapNoDataFill;
    const center = cityDataItem.path ? getPathCenter(cityDataItem.path) : null;

    const existingProps = (cityComponent as any).props || {};
    const pathProps: any = {
      ...Object.fromEntries(
        Object.entries(existingProps).filter(([key]) => key !== 'fill')
      ),
      fill: color,
      stroke: cityInfo ? mapStrokeColor : 'transparent',
      strokeWidth: cityInfo ? 1.5 : 0,
      style: {
        ...(existingProps.style || {}),
        fill: color,
        cursor: 'pointer',
        transition: 'fill 0.2s ease, stroke-width 0.2s ease',
      },
      onMouseEnter: (e: React.MouseEvent<SVGPathElement>) => {
        const target = e.currentTarget as SVGPathElement;
        target.setAttribute('fill', '#dc2626');
        target.style.fill = '#dc2626';
        target.setAttribute('stroke-width', '2.5');
      },
      onMouseLeave: (e: React.MouseEvent<SVGPathElement>) => {
        const target = e.currentTarget as SVGPathElement;
        target.setAttribute('fill', color);
        target.style.fill = color;
        target.setAttribute('stroke-width', cityInfo ? '1.5' : '0');
        target.setAttribute('stroke', cityInfo ? mapStrokeColor : 'transparent');
      },
      onClick: () => {
        if (cityInfo) {
          setSelectedCity({
            ...cityInfo,
            plateNumber: cityDataItem.plateNumber,
            name: cityDataItem.name,
          });
          setIsCityDetailOpen(true);
        }
      },
    };

    const pathElement = React.cloneElement(cityComponent as React.ReactElement, pathProps);

    return (
      <g key={cityDataItem.id} className="city-group">
        {pathElement}
        {cityInfo && center && (
          <text
            x={center.x}
            y={center.y}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: cityInfo.saleCount > 5 ? '16px' : '14px',
              fontWeight: 'bold',
              fill: '#fff',
              pointerEvents: 'none',
              textShadow: '2px 2px 4px rgba(0,0,0,0.9), -2px -2px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.9)',
              userSelect: 'none',
            }}
          >
            {cityInfo.saleCount}
          </text>
        )}
      </g>
    );
  };



  // Grafik verileri hazırla
  // Pie okunabilirliği: ilk 4 şehir ayrı dilim, kalan tüm şehirler "Diğer" olarak tek dilim
  const TOP_CITY_SLICES = 4;
  const rankedCities = [...(reportData.cityDistribution || [])]
    .filter((c: any) => c.plateNumber && (c.saleCount || 0) > 0)
    .sort((a: any, b: any) => (b.saleCount || 0) - (a.saleCount || 0));

  const topCitySlices = rankedCities.slice(0, TOP_CITY_SLICES).map((city: any) => ({
    name: city.city,
    value: city.saleCount,
    revenue: city.totalRevenue || 0,
    isOther: false,
  }));

  const otherCities = rankedCities.slice(TOP_CITY_SLICES);
  const otherSlice =
    otherCities.length > 0
      ? [{
          name: `Diğer (${otherCities.length} şehir)`,
          value: otherCities.reduce((sum: number, c: any) => sum + (c.saleCount || 0), 0),
          revenue: otherCities.reduce((sum: number, c: any) => sum + (c.totalRevenue || 0), 0),
          isOther: true,
        }]
      : [];

  const cityChartData = [...topCitySlices, ...otherSlice];
  const cityChartTotal = cityChartData.reduce((sum: number, c: any) => sum + (c.value || 0), 0);

  // Model yılı: en yeniden eskiye, okunabilirlik için ilk 12 yıl
  const yearChartData = [...(reportData.topModelYears || [])]
    .filter((y: any) => (y.saleCount || 0) > 0)
    .sort((a: any, b: any) => (b.saleCount || 0) - (a.saleCount || 0))
    .slice(0, 12)
    .sort((a: any, b: any) => Number(b.modelYear) - Number(a.modelYear))
    .map((year: any) => ({
      year: year.modelYear,
      age: year.vehicleAge,
      sales: year.saleCount,
      label: `${year.modelYear} (${year.vehicleAge} yaş)`,
    }));

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

  // ===== ÖZET KPI'LAR (mevcut veriden türetiliyor, ek istek yok) =====
  const kpiTotalSales = rankedCities.reduce((sum: number, c: any) => sum + (c.saleCount || 0), 0);
  const kpiTotalRevenue = rankedCities.reduce((sum: number, c: any) => sum + (c.totalRevenue || 0), 0);
  const kpiActiveCities = rankedCities.length;
  const kpiTopCity = rankedCities[0];
  const formatTRY = (v: number) =>
    new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v || 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-7 w-7 text-primary" />
          Satış Dağılım Raporu
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          En çok satılan marka, model, model yılı ve şehir bazlı dağılım analizi
        </p>
      </div>

      {/* ===== ÖZET KARTLARI ===== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Toplam Satış</p>
              <TrendingUp className="h-4 w-4 text-primary shrink-0" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{kpiTotalSales.toLocaleString('tr-TR')}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Toplam Ciro</p>
              <Wallet className="h-4 w-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums truncate">{formatTRY(kpiTotalRevenue)}</p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Satış Yapılan Şehir</p>
              <Building2 className="h-4 w-4 text-violet-600 shrink-0" />
            </div>
            <p className="text-2xl font-bold mt-1 tabular-nums">{kpiActiveCities}<span className="text-sm text-muted-foreground font-normal"> / 81</span></p>
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Lider Şehir</p>
              <MapPin className="h-4 w-4 text-amber-600 shrink-0" />
            </div>
            <p className="text-2xl font-bold mt-1 truncate">{kpiTopCity?.city || '—'}</p>
            {kpiTopCity && (
              <p className="text-xs text-muted-foreground">{kpiTopCity.saleCount} satış</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== HARİTA + ŞEHİR PAY GRAFİĞİ (yan yana) ===== */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
      <Card className="xl:col-span-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Şehir Bazlı Satış Dağılımı
          </CardTitle>
          <CardDescription>
            Haritada şehirlere tıklayarak detayları görüntüleyebilirsiniz. Sayılar satış miktarını gösterir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Türkiye Haritası - light/dark mod uyumlu arka plan ve stroke */}
            <div className="border rounded-lg p-4 bg-white dark:bg-slate-900 relative">
              <TurkeyMap
                hoverable={true}
                customStyle={{ idleColor: mapNoDataFill, hoverColor: '#dc2626' }}
                cityWrapper={renderCity}
                showTooltip={false}
                onClick={({ plateNumber, name }: any) => {
                  const cityInfo = cityData[plateNumber];
                  if (cityInfo) {
                    setSelectedCity({
                      ...cityInfo,
                      plateNumber,
                      name,
                    });
                    setIsCityDetailOpen(true);
                  } else {
                    toast.info(`${name}: Bu şehirde henüz satış kaydı bulunmamaktadır.`);
                  }
                }}
              />
              {/* Renk skalası ve açıklama */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground font-semibold">Az Satış</span>
                  <div className="flex gap-1.5">
                    {[0, 0.25, 0.5, 0.75, 1].map((intensity) => {
                      // Aynı renk hesaplama mantığı (RGB kırmızı tonları)
                      const red = Math.floor(220 - (intensity * 100));
                      const green = Math.floor(50 - (intensity * 30));
                      const blue = Math.floor(50 - (intensity * 30));
                      const color = `rgb(${red}, ${green}, ${blue})`;

                      return (
                        <div
                          key={intensity}
                          style={{
                            width: '28px',
                            height: '28px',
                            backgroundColor: color,
                            borderRadius: '6px',
                            border: isDark ? '2px solid #475569' : '2px solid white',
                            boxShadow: isDark ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.2)',
                          }}
                        />
                      );
                    })}
                  </div>
                  <span className="text-muted-foreground font-semibold">Çok Satış</span>
                </div>
                <div className="text-xs text-center text-muted-foreground space-y-1">
                  <p>
                    Renklendirme: En yüksek satış sayısına ({Math.max(...(reportData.cityDistribution.filter((c: any) => c.plateNumber).map((c: any) => c.saleCount) || [1]))} satış) göre hesaplanmaktadır.
                  </p>
                  <p>
                    Şehirlerin üzerine gelerek satış sayılarını görebilir, tıklayarak detayları açabilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Şehir Dağılımı - Pie Chart */}
        <Card className="xl:col-span-4 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Şehir Bazlı Satış Dağılımı
            </CardTitle>
            <CardDescription>İlk 4 şehir ayrı, kalanı “Diğer” olarak gruplandı</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            {cityChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-center">
                <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Henüz şehir bazlı satış verisi yok.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Donut */}
                <div className="w-full">
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={cityChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={false}
                        outerRadius={92}
                        innerRadius={52}
                        paddingAngle={1}
                        dataKey="value"
                      >
                        {cityChartData.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.isOther ? 'hsl(var(--muted-foreground))' : PIE_COLORS[index % PIE_COLORS.length]}
                            opacity={entry.isOther ? 0.45 : 1}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number, _name: string, props: any) => {
                          const pct = cityChartTotal > 0 ? (value / cityChartTotal) * 100 : 0;
                          return [
                            `${value} satış • %${pct.toFixed(1)} (${new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY',
                              maximumFractionDigits: 0,
                            }).format(props.payload.revenue || 0)})`,
                            props.payload.name,
                          ];
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Yan liste (legend yerine): okunaklı, çakışmasız */}
                <ul className="w-full space-y-2">
                  {cityChartData.map((c: any, i: number) => {
                    const pct = cityChartTotal > 0 ? (c.value / cityChartTotal) * 100 : 0;
                    return (
                      <li key={c.name} className="flex items-center gap-2 text-sm">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: c.isOther
                              ? 'hsl(var(--muted-foreground))'
                              : PIE_COLORS[i % PIE_COLORS.length],
                            opacity: c.isOther ? 0.45 : 1,
                          }}
                        />
                        <span className={c.isOther ? 'text-muted-foreground truncate' : 'font-medium truncate'}>
                          {c.name}
                        </span>
                        <span className="ml-auto tabular-nums text-muted-foreground shrink-0">
                          {c.value} • %{pct.toFixed(1)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== MODEL YILI + ŞEHİR SIRALAMASI (yan yana) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
      <Card className="lg:col-span-7 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Model Yılı Dağılımı
          </CardTitle>
          <CardDescription>Hangi yaştaki araçlar daha çok satılıyor?</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-center">
          {yearChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[280px] text-center">
              <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">Henüz model yılı verisi yok.</p>
            </div>
          ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearChartData} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              {/* Sadece yıl gösterilir; yaş bilgisi tooltip'te (etiket çakışmasını önler) */}
              <XAxis
                dataKey="year"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} width={36} />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
                formatter={(value: number) => [`${value} satış`, 'Satış']}
                labelFormatter={(_label, payload) => payload?.[0]?.payload?.label || _label}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

        {/* Şehir Dağılımı - sıralama listesi */}
        <Card className="lg:col-span-5 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Şehir Dağılımı
                </CardTitle>
                <CardDescription>Detay için şehre tıklayın</CardDescription>
              </div>
              <Badge variant="secondary" className="shrink-0">{rankedCities.length} şehir</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {rankedCities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[240px] text-center">
                <MapPin className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">Henüz şehir bazlı satış verisi yok.</p>
              </div>
            ) : (
              <ul className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                {rankedCities.map((city: any, index: number) => {
                  const pct = kpiTotalSales > 0 ? ((city.saleCount || 0) / kpiTotalSales) * 100 : 0;
                  const max = rankedCities[0]?.saleCount || 1;
                  return (
                    <li key={city.city}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCity({ ...city, name: city.city });
                          setIsCityDetailOpen(true);
                        }}
                        className="w-full text-left rounded-lg px-2.5 py-2 hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                              index === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm truncate flex-1">{city.city}</span>
                          <span className="text-sm font-semibold tabular-nums shrink-0">{city.saleCount}</span>
                          <span className="text-xs text-muted-foreground tabular-nums w-11 text-right shrink-0">
                            %{pct.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-1.5 ml-[34px] flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary/70"
                              style={{ width: `${Math.min(100, ((city.saleCount || 0) / max) * 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums">
                            {formatTRY(city.totalRevenue)}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== EN ÇOK SATILANLAR (tablo yerine kompakt sıralama listeleri) ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
        {/* Markalar */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5 text-primary" />
              En Çok Satılan Markalar
            </CardTitle>
            <CardDescription>Satış adedine göre ilk 10 marka</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const rows = [...(reportData.topCarBrands || [])]
                .filter((b: any) => (b.saleCount || 0) > 0)
                .sort((a: any, b: any) => (b.saleCount || 0) - (a.saleCount || 0))
                .slice(0, 10);
              const max = Math.max(1, ...rows.map((r: any) => r.saleCount || 0));
              const total = rows.reduce((sum: number, r: any) => sum + (r.saleCount || 0), 0);
              if (rows.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Henüz marka verisi yok.</p>
                  </div>
                );
              }
              return (
                <ul className="space-y-1">
                  {rows.map((brand: any, index: number) => {
                    const pct = total > 0 ? ((brand.saleCount || 0) / total) * 100 : 0;
                    return (
                      <li
                        key={brand.brandId ?? index}
                        className="group relative rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                              index === 0
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium text-sm truncate flex-1">{brand.brandName}</span>
                          <span className="text-sm font-semibold tabular-nums shrink-0">{brand.saleCount}</span>
                          <span className="text-xs text-muted-foreground tabular-nums w-12 text-right shrink-0">
                            %{pct.toFixed(1)}
                          </span>
                        </div>
                        {/* Pay çubuğu - satırın altında ince şerit */}
                        <div className="mt-1.5 ml-9 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/80 transition-all"
                            style={{ width: `${((brand.saleCount || 0) / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </CardContent>
        </Card>

        {/* Modeller */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5 text-violet-500" />
              En Çok Satılan Modeller
            </CardTitle>
            <CardDescription>Satış adedine göre ilk 10 model</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const rows = [...(reportData.topCarModels || [])]
                .filter((m: any) => (m.saleCount || 0) > 0)
                .sort((a: any, b: any) => (b.saleCount || 0) - (a.saleCount || 0))
                .slice(0, 10);
              const max = Math.max(1, ...rows.map((r: any) => r.saleCount || 0));
              const total = rows.reduce((sum: number, r: any) => sum + (r.saleCount || 0), 0);
              if (rows.length === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <Car className="h-10 w-10 text-muted-foreground/40 mb-3" />
                    <p className="text-sm text-muted-foreground">Henüz model verisi yok.</p>
                  </div>
                );
              }
              return (
                <ul className="space-y-1">
                  {rows.map((model: any, index: number) => {
                    const pct = total > 0 ? ((model.saleCount || 0) / total) * 100 : 0;
                    return (
                      <li
                        key={model.modelId ?? index}
                        className="group relative rounded-lg px-3 py-2 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold tabular-nums",
                              index === 0
                                ? "bg-violet-500 text-white"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {index + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-medium text-sm truncate">{model.modelName}</span>
                            <span className="block text-xs text-muted-foreground truncate">{model.brandName}</span>
                          </span>
                          <span className="text-sm font-semibold tabular-nums shrink-0">{model.saleCount}</span>
                          <span className="text-xs text-muted-foreground tabular-nums w-12 text-right shrink-0">
                            %{pct.toFixed(1)}
                          </span>
                        </div>
                        <div className="mt-1.5 ml-9 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-violet-500/80 transition-all"
                            style={{ width: `${((model.saleCount || 0) / max) * 100}%` }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Şehir Detay Modal */}
      <Dialog open={isCityDetailOpen} onOpenChange={setIsCityDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {selectedCity?.name || selectedCity?.city} - Satış Detayları
            </DialogTitle>
            <DialogDescription>
              {selectedCity?.name || selectedCity?.city} şehrinin detaylı satış istatistikleri
            </DialogDescription>
          </DialogHeader>
          {selectedCity && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedCity.saleCount}</div>
                    <p className="text-sm text-muted-foreground">Toplam Satış</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold">{selectedCity.customerCount}</div>
                    <p className="text-sm text-muted-foreground">Müşteri Sayısı</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(selectedCity.totalRevenue)}
                  </div>
                  <p className="text-sm text-muted-foreground">Toplam Ciro</p>
                </CardContent>
              </Card>
              <div className="text-sm text-muted-foreground">
                <p>Ortalama Satış Tutarı: {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(selectedCity.totalRevenue / selectedCity.saleCount)}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
