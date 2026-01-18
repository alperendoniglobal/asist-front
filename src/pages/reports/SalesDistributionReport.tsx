import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, TrendingUp, Car, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { statsService } from '@/services/apiService';
import TurkeyMap from 'turkey-map-react';
import { cities as turkeyCities } from 'turkey-map-react/lib/data';
import React from 'react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

/**
 * Satış Dağılım Raporu Sayfası
 * SUPER_ADMIN için - En çok satılan marka, model, model yılı ve şehir bazlı dağılım
 */
export default function SalesDistributionReport() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const [selectedCity, setSelectedCity] = useState<any>(null);
  const [isCityDetailOpen, setIsCityDetailOpen] = useState(false);

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
            pathEl.setAttribute('stroke', '#fff');
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
  }, [reportData]);


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

  // Şehir renklerini hesapla - satış sayısına göre canlı gradient (Yeşil -> Sarı -> Turuncu -> Kırmızı)
  const getCityColor = (plateNumber: number) => {
    const cityInfo = cityData[plateNumber];
    if (!cityInfo) return '#e5e7eb'; // Gri - veri yok

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

  // City wrapper - şehirleri renklendir ve satış sayılarını göster
  const renderCity = (cityComponent: React.ReactElement, cityDataItem: any) => {
    const cityInfo = cityData[cityDataItem.plateNumber];
    const color = cityInfo ? getCityColor(cityDataItem.plateNumber) : '#e5e7eb';
    const center = cityDataItem.path ? getPathCenter(cityDataItem.path) : null;

    const existingProps = (cityComponent as any).props || {};
    const pathProps: any = {
      ...Object.fromEntries(
        Object.entries(existingProps).filter(([key]) => key !== 'fill')
      ),
      fill: color,
      stroke: cityInfo ? '#fff' : 'transparent',
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
  const brandChartData = reportData.topCarBrands.slice(0, 10).map((brand: any) => ({
    name: brand.brandName.length > 15 ? brand.brandName.slice(0, 15) + '...' : brand.brandName,
    fullName: brand.brandName,
    value: brand.saleCount,
  }));

  const cityChartData = reportData.cityDistribution
    .filter((c: any) => c.plateNumber)
    .slice(0, 10)
    .map((city: any) => ({
      name: city.city,
      value: city.saleCount,
      revenue: city.totalRevenue,
    }));

  const yearChartData = reportData.topModelYears.map((year: any) => ({
    year: year.modelYear,
    age: year.vehicleAge,
    sales: year.saleCount,
    label: `${year.modelYear} (${year.vehicleAge} yaş)`,
  }));

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1'];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Satış Dağılım Raporu</h1>
        <p className="text-muted-foreground mt-2">
          En çok satılan marka, model, model yılı ve şehir bazlı dağılım analizi
        </p>
      </div>

      {/* Şehir Dağılımı - Türkiye Haritası */}
      <Card>
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
            {/* Türkiye Haritası */}
            <div className="border rounded-lg p-4 bg-white relative">
              <TurkeyMap
                hoverable={true}
                customStyle={{ idleColor: '#e5e7eb', hoverColor: '#dc2626' }}
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
                            border: '2px solid white',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
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

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Marka Dağılımı - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              En Çok Satılan Markalar
            </CardTitle>
            <CardDescription>Top 10 otomobil markası satış dağılımı</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={brandChartData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  width={100}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} satış`, 'Satış']}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Şehir Dağılımı - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Şehir Bazlı Satış Dağılımı
            </CardTitle>
            <CardDescription>Top 10 şehir satış oranları</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cityChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent || 0 * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cityChartData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, _name: string, props: any) => [
                    `${value} satış (${new Intl.NumberFormat('tr-TR', {
                      style: 'currency',
                      currency: 'TRY',
                    }).format(props.payload.revenue)})`,
                    'Satış'
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Yılı Dağılımı - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Model Yılı Dağılımı
          </CardTitle>
          <CardDescription>Hangi yaştaki araçlar daha çok satılıyor?</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yearChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value: number) => [`${value} satış`, 'Satış']}
                labelFormatter={(label) => label}
              />
              <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detaylı Tablolar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* En Çok Satılan Markalar Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              En Çok Satılan Otomobil Markaları
            </CardTitle>
            <CardDescription>Top 10 otomobil markası</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Satış Sayısı</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.topCarBrands.map((brand: any, index: number) => (
                  <TableRow key={brand.brandId}>
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{brand.brandName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {brand.saleCount}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* En Çok Satılan Modeller Tablosu */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              En Çok Satılan Otomobil Modelleri
            </CardTitle>
            <CardDescription>Top 10 otomobil modeli</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Marka</TableHead>
                  <TableHead>Satış</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.topCarModels.map((model: any, index: number) => (
                  <TableRow key={model.modelId}>
                    <TableCell>
                      <Badge variant={index === 0 ? 'default' : 'secondary'}>
                        {index + 1}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{model.modelName}</TableCell>
                    <TableCell className="text-muted-foreground">{model.brandName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        {model.saleCount}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Şehir Detayları Tablosu */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Şehir Detayları
          </CardTitle>
          <CardDescription>Tüm şehirlerin satış istatistikleri</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Şehir</TableHead>
                <TableHead>Satış Sayısı</TableHead>
                <TableHead>Müşteri Sayısı</TableHead>
                <TableHead>Toplam Ciro</TableHead>
                <TableHead>İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.cityDistribution
                .sort((a: any, b: any) => b.saleCount - a.saleCount)
                .map((city: any) => (
                  <TableRow key={city.city}>
                    <TableCell className="font-medium">{city.city}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{city.saleCount}</Badge>
                    </TableCell>
                    <TableCell>{city.customerCount}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('tr-TR', {
                        style: 'currency',
                        currency: 'TRY',
                      }).format(city.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      {city.plateNumber && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCity({
                              ...city,
                              name: city.city,
                            });
                            setIsCityDetailOpen(true);
                          }}
                        >
                          Detay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
