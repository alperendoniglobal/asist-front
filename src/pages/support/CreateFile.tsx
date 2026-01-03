import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { FilePlus, ArrowLeft, Search, Loader2, FileText, User, Car, MapPin, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { saleService, carBrandService, carModelService, motorBrandService, motorModelService, packageService, supportFileService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Sale } from '@/types';
// Şehir ve ilçe verilerini import et
import cityData from '@/data/city.json';

// Türkiye İlleri - city.json'dan al
const CITIES = cityData.map((city) => city.il);

// Yapılacak işlem seçenekleri (paket kapsamlarından gelecek, fallback olarak bu liste kullanılacak)
const DEFAULT_SERVICE_OPTIONS = [
  'Çekici Hizmeti – Kaza',
  'Çekici Hizmeti – Arıza',
  'Aracın Vinç ile Kurtarılması',
  'Lastik Patlaması',
  'Yakıt Bitmesi',
  'Oto Kapı Kilit',
  'Yedek Parça Temini',
  'Profesyonel Sürücü Hizmeti',
  'Aracın Kullanılamayışı Nedeni ile Konaklama',
  'Daimi İkametgaha Dönüş Organizasyonu',
  'İkame Araç Talebi',
  'Aracın Getirilmesi İçin Seyehat',
  'Aracın Otopark ile Muhafazası'
];

/**
 * Sayıyı Türkçe formatına çevirir (15000.00 -> 15.000)
 * @param value - Formatlanacak değer (string veya number)
 * @returns Formatlanmış string (örn: "15.000")
 */
const formatTurkishNumber = (value: string | number | null | undefined): string => {
  if (!value && value !== 0) return '';
  
  // String ise parse et, number ise direkt kullan
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return '';
  
  // Ondalık kısmı kaldır ve binlik ayırıcı olarak nokta kullan
  const integerPart = Math.floor(Math.abs(numValue));
  const formatted = integerPart.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  
  return formatted;
};

/**
 * Formatlanmış sayıyı parse eder (15.000 -> 15000.00)
 * @param value - Parse edilecek string (örn: "15.000")
 * @returns Parse edilmiş sayı string'i (örn: "15000.00")
 */
const parseFormattedNumber = (value: string): string => {
  if (!value || value.trim() === '') return '';
  
  // Noktaları kaldır (binlik ayırıcılar)
  const cleaned = value.replace(/\./g, '');
  const numValue = parseFloat(cleaned);
  
  if (isNaN(numValue)) return '';
  
  // İki ondalık basamakla döndür
  return numValue.toFixed(2);
};

/**
 * Destek Ekibi için Dosya Oluşturma Sayfası
 * Çağrı merkezi için yeni dosya oluşturur
 */
export default function CreateFile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [foundSale, setFoundSale] = useState<Sale | null>(null);
  const [serviceOptions, setServiceOptions] = useState<string[]>(DEFAULT_SERVICE_OPTIONS);
  // Paket kapsamlarını saklamak için state (limit_amount bilgisi için)
  const [packageCovers, setPackageCovers] = useState<any[]>([]);
  const [loadingCovers, setLoadingCovers] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Plakaya ait hasar dosyaları
  const [existingFiles, setExistingFiles] = useState<any[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  // Modal state - dosya detaylarını göstermek için
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  // İşlem tutarı validasyon hatası
  const [serviceAmountError, setServiceAmountError] = useState<string>('');
  const [formData, setFormData] = useState({
    // Satış Bilgileri
    policy_number: '',
    plate: '',
    
    // Hasar Dosya Bilgileri
    damage_file_number: '',
    damage_policy_number: '',
    policy_start_date: '',
    
    // Sigortalı Bilgileri
    insured_name: '',
    insured_phone: '',
    vehicle_plate: '',
    vehicle_model: '',
    model_year: '',
    vehicle_brand: '',
    vehicle_segment: '',
    
    // Diğer Bilgiler
    is_tow_truck: false,
    // request_date_time'ı ISO string olarak tut (datetime-local input için)
    request_date_time: new Date().toISOString().slice(0, 16), // YYYY-MM-DDTHH:mm formatı
    service_type: 'Çekici Hizmeti – Kaza',
    service_amount: '',
    road_assistance_coverage: '',
    service_city: 'Adana',
    kilometer: '',
    is_heavy_commercial: false,
    start_address: '',
    end_address: ''
  });

  /**
   * Her hizmet tipi için kullanım durumunu hesaplar
   * @param serviceType - Hizmet tipi adı (örn: "Çekici Hizmeti Kaza")
   * @returns Kullanım bilgisi objesi { used, total, remaining, isLimitReached }
   */
  const getServiceUsageInfo = (serviceType: string) => {
    // Mevcut dosyalardan bu hizmet tipi kaç kez kullanılmış?
    const usedCount = existingFiles.filter(
      (file: any) => file.service_type === serviceType
    ).length;
    
    // Paket kapsamından bu hizmet tipi için toplam kullanım hakkını bul
    const cover = packageCovers.find((c: any) => c.title === serviceType);
    const totalCount = cover?.usage_count || 1; // Bulunamazsa varsayılan 1
    
    return {
      used: usedCount,
      total: totalCount,
      remaining: Math.max(0, totalCount - usedCount),
      isLimitReached: usedCount >= totalCount
    };
  };

  /**
   * Hizmet seçeneği için gösterilecek label'ı oluşturur
   * Format: "Çekici Hizmeti Kaza (1/2)" veya "Lastik Patlaması (Limit Doldu)"
   */
  const getServiceOptionLabel = (serviceType: string) => {
    const usage = getServiceUsageInfo(serviceType);
    
    if (usage.isLimitReached) {
      return `${serviceType} (❌ Limit Doldu - ${usage.total}/${usage.total})`;
    }
    
    return `${serviceType} (${usage.used}/${usage.total} kullanıldı)`;
  };

  // Plaka sorgusu yap - Backend'e istek at
  const handlePlateSearch = async () => {
    if (!formData.plate || formData.plate.trim() === '') {
      toast.error('Lütfen plaka giriniz');
      return;
    }

    setSearching(true);
    try {
      const plate = formData.plate.trim().toUpperCase();
      // Backend'e plaka ile sorgu gönder
      const sales = await saleService.getAll({ search: plate });
      
      // Backend'den gelen sonuçlardan plaka tam eşleşmesi olanı bul
      const sale = sales.find(s => 
        s.vehicle?.plate?.toUpperCase() === plate
      );

      if (sale && sale.vehicle?.plate?.toUpperCase() === plate) {
        setFoundSale(sale);
        
        // Bu satışa ait hasar dosyalarını çek
        // files değişkenini dışarıda tanımla ki covers yüklenirken kullanılabilsin
        let fetchedFiles: any[] = [];
        setLoadingFiles(true);
        try {
          const files = await supportFileService.getBySaleId(sale.id);
          fetchedFiles = files || [];
          setExistingFiles(fetchedFiles);
        } catch (error) {
          console.error('Hasar dosyaları çekilirken hata:', error);
          fetchedFiles = [];
          setExistingFiles([]);
        } finally {
          setLoadingFiles(false);
        }
        
        // Satış numarası: policy_number varsa kullan, yoksa ID'nin ilk 8 karakteri
        const policyNumber = sale.policy_number || sale.id.slice(0, 8).toUpperCase();
        
        // Model adını çek (model null ise ama model_id varsa)
        // Paket tipine göre motor veya car model servisini kullan
        let modelName = sale.vehicle?.model?.name || '';
        const isMotorcyclePackage = sale.package?.vehicle_type === 'Motosiklet';
        
        if (!modelName && sale.vehicle?.model_id) {
          try {
            const model = isMotorcyclePackage 
              ? await motorModelService.getById(sale.vehicle.model_id)
              : await carModelService.getById(sale.vehicle.model_id);
            if (model && model.name) {
              modelName = model.name;
            }
            // Model bulunamazsa (null döndü) sessizce devam et, model adı boş kalacak
          } catch (error: any) {
            // Beklenmeyen hata durumunda log yaz ama devam et
            console.warn('Model adı çekilirken hata (model_id: ' + sale.vehicle.model_id + '):', error.message);
            // Model adı boş kalacak, kullanıcı manuel girebilir
          }
        }
        
        // Brand adını çek (brand null ise ama brand_id varsa)
        let brandName = sale.vehicle?.brand?.name || '';
        if (!brandName && sale.vehicle?.brand_id) {
          try {
            const brand = isMotorcyclePackage
              ? await motorBrandService.getById(sale.vehicle.brand_id)
              : await carBrandService.getById(sale.vehicle.brand_id);
            if (brand && brand.name) {
              brandName = brand.name;
            }
          } catch (error: any) {
            console.warn('Brand adı çekilirken hata (brand_id: ' + sale.vehicle.brand_id + '):', error.message);
          }
        }
        
        // Paket kapsamlarını çek (service seçenekleri için)
        if (sale.package_id) {
          setLoadingCovers(true);
          try {
            const covers = await packageService.getCovers(sale.package_id);
            if (covers && covers.length > 0) {
              // Tüm cover objelerini sakla (limit_amount bilgisi için)
              setPackageCovers(covers);
              // PackageCover title'larını service seçenekleri olarak kullan
              const coverTitles = covers.map((cover: any) => cover.title);
              setServiceOptions(coverTitles);
              
              // Kullanılabilir ilk hizmeti bul (limit dolmamış olan)
              // fetchedFiles kullanarak mevcut kullanım sayısını hesapla
              const findAvailableService = () => {
                for (const cover of covers) {
                  // Bu hizmet tipi için kaç kez kullanılmış?
                  const usedCount = fetchedFiles.filter(
                    (file: any) => file.service_type === cover.title
                  ).length;
                  
                  // Kullanım hakkı kaldı mı?
                  if (usedCount < cover.usage_count) {
                    return cover;
                  }
                }
                // Tüm limitler dolmuşsa ilk hizmeti döndür (uyarı gösterilecek)
                return covers[0];
              };
              
              const availableCover = findAvailableService();
              const limitAmount = formatTurkishNumber(availableCover.limit_amount) || '';
              
              setFormData(prev => {
                // Teyminat set edilirken mevcut işlem tutarını kontrol et
                const serviceAmount = parseFloat(prev.service_amount || '0');
                const coverageAmount = parseFloat(parseFormattedNumber(limitAmount));
                
                if (!isNaN(serviceAmount) && !isNaN(coverageAmount) && serviceAmount > coverageAmount) {
                  setServiceAmountError(`İşlem tutarı teyminattan (${limitAmount} TL) büyük olamaz!`);
                } else {
                  setServiceAmountError('');
                }
                
                return { 
                  ...prev, 
                  service_type: availableCover.title,
                  // Seçilen kapsamın limit_amount'unu formatlanmış şekilde Yol Yardım Teyminatı alanına ekle
                  road_assistance_coverage: limitAmount
                };
              });
            }
          } catch (error) {
            console.error('Paket kapsamları çekilirken hata:', error);
            // Hata durumunda default seçenekleri kullan
            setServiceOptions(DEFAULT_SERVICE_OPTIONS);
            setPackageCovers([]);
          } finally {
            setLoadingCovers(false);
          }
        }
        
        // Otomatik doldur
        setFormData(prev => ({
          ...prev,
          // Satış bilgileri
          policy_number: policyNumber,
          
          // Hasar dosya bilgileri
          damage_policy_number: policyNumber,
          // policy_start_date'i ISO formatında tut (YYYY-MM-DD) - backend'e gönderirken kullanılacak
          policy_start_date: sale.start_date ? new Date(sale.start_date).toISOString().split('T')[0] : '',
          
          // Sigortalı bilgileri
          insured_name: `${sale.customer?.name || ''} ${sale.customer?.surname || ''}`.trim(),
          insured_phone: sale.customer?.phone || '',
          vehicle_plate: sale.vehicle?.plate || '',
          vehicle_model: modelName,
          model_year: sale.vehicle?.model_year?.toString() || '',
          vehicle_brand: brandName || sale.vehicle?.brand?.name || (sale.vehicle?.brand_id ? `Brand ID: ${sale.vehicle.brand_id}` : ''),
          vehicle_segment: sale.package?.vehicle_type || '',
        }));
        
        toast.success('Plaka bulundu, bilgiler otomatik dolduruldu');
      } else {
        setFoundSale(null);
        setExistingFiles([]);
        toast.error('Bu plakaya ait satış bulunamadı');
      }
    } catch (error) {
      console.error('Plaka sorgusu hatası:', error);
      toast.error('Plaka sorgulanırken bir hata oluştu');
    } finally {
      setSearching(false);
    }
  };

  // Form submit - Hasar dosyası kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!foundSale || !foundSale.id) {
      toast.error('Lütfen önce plaka sorgusu yapın ve satış bulun');
      return;
    }

    // Validasyon: Kullanım limiti kontrolü
    // Seçilen hizmet için kullanım hakkı kaldı mı?
    if (formData.service_type) {
      const usage = getServiceUsageInfo(formData.service_type);
      if (usage.isLimitReached) {
        toast.error(
          `"${formData.service_type}" hizmeti için kullanım limiti dolmuş! ` +
          `(${usage.total}/${usage.total} kullanım hakkı kullanıldı)`
        );
        return;
      }
    }

    // Validasyon: İşlem tutarı teyminattan büyük olamaz
    if (formData.service_amount && formData.road_assistance_coverage) {
      const serviceAmount = parseFloat(formData.service_amount.toString());
      const coverageAmount = parseFloat(parseFormattedNumber(formData.road_assistance_coverage));
      
      if (!isNaN(serviceAmount) && !isNaN(coverageAmount) && serviceAmount > coverageAmount) {
        toast.error(`İşlem tutarı teyminattan (${formData.road_assistance_coverage} TL) büyük olamaz!`);
        setServiceAmountError(`İşlem tutarı teyminattan (${formData.road_assistance_coverage} TL) büyük olamaz!`);
        setSubmitting(false);
        return;
      }
    }

    setSubmitting(true);
    try {
      // request_date_time'ı parse et (datetime-local formatı: YYYY-MM-DDTHH:mm)
      // Bu format direkt Date constructor ile parse edilebilir
      let requestDateTime: Date;
      if (formData.request_date_time) {
        // datetime-local formatı direkt parse edilebilir
        requestDateTime = new Date(formData.request_date_time);
        // Eğer geçerli bir tarih değilse şu anki tarih/saati kullan
        if (isNaN(requestDateTime.getTime())) {
          requestDateTime = new Date();
        }
      } else {
        // Boşsa şu anki tarih/saati kullan
        requestDateTime = new Date();
      }

      // policy_start_date'i parse et ve ISO formatına çevir (YYYY-MM-DD)
      // Türkçe format (DD.MM.YYYY) veya ISO format (YYYY-MM-DD) gelebilir
      let policyStartDate: string | null = null;
      if (formData.policy_start_date && formData.policy_start_date.trim() !== '') {
        const dateStr = formData.policy_start_date.trim();
        
        // ISO format kontrolü (YYYY-MM-DD)
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          // Zaten ISO formatında
          policyStartDate = dateStr;
        } else {
          // Türkçe format kontrolü (DD.MM.YYYY)
          const turkishFormatMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
          if (turkishFormatMatch) {
            const [, day, month, year] = turkishFormatMatch;
            // ISO formatına çevir (YYYY-MM-DD)
            policyStartDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          } else {
            // Diğer formatları Date constructor ile parse etmeyi dene
            const parsedDate = new Date(dateStr);
            if (!isNaN(parsedDate.getTime())) {
              // Geçerli bir tarih ise ISO formatına çevir
              policyStartDate = parsedDate.toISOString().split('T')[0];
            } else {
              // Parse edilemezse null bırak
              console.warn('policy_start_date parse edilemedi:', dateStr);
              policyStartDate = null;
            }
          }
        }
      }

      // Form verilerini backend formatına çevir
      const fileData = {
        sale_id: foundSale.id,
        // Hasar dosya numarası backend'de otomatik oluşturulacak (boş gönderebiliriz)
        damage_file_number: '', // Backend otomatik oluşturacak
        policy_number: formData.policy_number || null,
        damage_policy_number: formData.damage_policy_number || null,
        // policy_start_date artık her zaman ISO formatında (YYYY-MM-DD)
        policy_start_date: policyStartDate,
        insured_name: formData.insured_name,
        insured_phone: formData.insured_phone,
        vehicle_plate: formData.vehicle_plate,
        vehicle_model: formData.vehicle_model || null,
        model_year: formData.model_year || null,
        vehicle_brand: formData.vehicle_brand || null,
        vehicle_segment: formData.vehicle_segment || null,
        service_type: formData.service_type,
        service_amount: formData.service_amount ? parseFloat(formData.service_amount.toString()) : null,
        // roadside_assistance_coverage formatlanmış olabilir (15.000), backend'e parse edilmiş gönder (15000.00)
        roadside_assistance_coverage: formData.road_assistance_coverage 
          ? parseFormattedNumber(formData.road_assistance_coverage) 
          : null,
        city: formData.service_city,
        staff_name: user ? `${user.name} ${user.surname}`.trim() : '',
        kilometer: formData.kilometer ? parseInt(formData.kilometer.toString()) : null,
        heavy_commercial: formData.is_heavy_commercial ? 'Evet' : 'Hayır',
        start_address: formData.start_address || null,
        end_address: formData.end_address || null,
        request_date_time: requestDateTime.toISOString(),
      };

      await supportFileService.create(fileData);
      
      toast.success('Hasar dosyası başarıyla oluşturuldu');
      // Dosyalar sayfasına yönlendir
      navigate('/dashboard/support/files');
    } catch (error: any) {
      console.error('Dosya kaydetme hatası:', error);
      toast.error(error.response?.data?.message || 'Dosya kaydedilirken bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/dashboard/support/files')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Yeni Hasar Dosyası Oluştur</h1>
          <p className="text-sm text-muted-foreground mt-1">Plaka sorgusu yaparak yeni dosya oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plaka Sorgusu - Öne Çıkarılmış */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Plaka Sorgusu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-1 space-y-2">
                <Label htmlFor="plate">Plaka (Örnek: 31.AGB532)</Label>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value })}
                  placeholder="Plaka giriniz..."
                  className="text-lg font-semibold"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePlateSearch();
                    }
                  }}
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handlePlateSearch}
                  disabled={searching}
                  className="gap-2 h-10"
                  size="lg"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {searching ? 'Sorgulanıyor...' : 'Sorgula'}
                </Button>
              </div>
            </div>
            {foundSale && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      ✓ Plaka bulundu ve bilgiler otomatik dolduruldu
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {foundSale.vehicle?.plate} - {foundSale.customer?.name} {foundSale.customer?.surname}
                    </p>
                  </div>
                </div>
                
                {/* Mevcut Hasar Dosyaları */}
                {loadingFiles ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Yükleniyor...</span>
                  </div>
                ) : existingFiles.length > 0 ? (
                  <div className="p-3 bg-muted/50 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">
                        Mevcut Hasar Dosyaları ({existingFiles.length})
                      </p>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {existingFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-2.5 bg-background rounded border text-sm hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {file.damage_file_number || `Dosya: ${file.id.substring(0, 8)}`}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {file.service_type || '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {file.created_at ? new Date(file.created_at).toLocaleDateString('tr-TR', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) : '-'}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedFile(file);
                                setIsFileModalOpen(true);
                              }}
                              className="text-xs h-7 px-2 flex-shrink-0"
                            >
                              Görüntüle
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Sol Kolon */}
          <div className="space-y-4">
            {/* Satış Bilgileri */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Satış Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="policy_number" className="text-sm">Satış Numarası</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                    className="bg-muted/50"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sigortalı Bilgileri */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Sigortalı Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="insured_name" className="text-sm">Ad Soyad</Label>
                  <Input
                    id="insured_name"
                    value={formData.insured_name}
                    onChange={(e) => setFormData({ ...formData, insured_name: e.target.value })}
                    className="bg-muted/50"
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="insured_phone" className="text-sm">Telefon</Label>
                  <Input
                    id="insured_phone"
                    value={formData.insured_phone}
                    onChange={(e) => setFormData({ ...formData, insured_phone: e.target.value })}
                    className="bg-muted/50"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon */}
          <div className="space-y-4">
            {/* Araç Bilgileri */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Araç Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle_plate" className="text-sm">Plaka</Label>
                    <Input
                      id="vehicle_plate"
                      value={formData.vehicle_plate}
                      onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                      className="bg-muted/50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle_brand" className="text-sm">Marka</Label>
                    <Input
                      id="vehicle_brand"
                      value={formData.vehicle_brand}
                      onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                      className="bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="vehicle_model" className="text-sm">Model</Label>
                    <Input
                      id="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      className="bg-muted/50"
                      readOnly
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="model_year" className="text-sm">Model Yılı</Label>
                    <Input
                      id="model_year"
                      value={formData.model_year}
                      onChange={(e) => setFormData({ ...formData, model_year: e.target.value })}
                      className="bg-muted/50"
                      readOnly
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vehicle_segment" className="text-sm">Segment</Label>
                  <Input
                    id="vehicle_segment"
                    value={formData.vehicle_segment}
                    onChange={(e) => setFormData({ ...formData, vehicle_segment: e.target.value })}
                    className="bg-muted/50"
                    readOnly
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hizmet Section */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Hizmet Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="request_date_time" className="text-sm">Talep Tarihi ve Saati</Label>
                    <Input
                      id="request_date_time"
                      type="datetime-local"
                      value={formData.request_date_time}
                      onChange={(e) => setFormData({ ...formData, request_date_time: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="service_type" className="text-sm">Yapılacak İşlem</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => {
                        // Kullanım limiti kontrolü - limit dolmuşsa seçtirme
                        const usage = getServiceUsageInfo(value);
                        if (usage.isLimitReached) {
                          toast.error(`"${value}" hizmeti için kullanım limiti dolmuş (${usage.total}/${usage.total})`);
                          return;
                        }
                        
                        // Seçilen hizmetin limit_amount'unu bul
                        const selectedCover = packageCovers.find((cover: any) => cover.title === value);
                        // Yol Yardım Teyminatı alanına formatlanmış limit_amount'u ekle
                        const limitAmount = formatTurkishNumber(selectedCover?.limit_amount) || '';
                        setFormData(prev => {
                          // Teyminat değiştiğinde işlem tutarını kontrol et
                          const serviceAmount = parseFloat(prev.service_amount || '0');
                          const coverageAmount = parseFloat(parseFormattedNumber(limitAmount));
                          
                          if (!isNaN(serviceAmount) && !isNaN(coverageAmount) && serviceAmount > coverageAmount) {
                            setServiceAmountError(`İşlem tutarı teyminattan (${limitAmount} TL) büyük olamaz!`);
                          } else {
                            setServiceAmountError('');
                          }
                          
                          return { 
                            ...prev, 
                          service_type: value,
                          road_assistance_coverage: limitAmount
                          };
                        });
                      }}
                      disabled={loadingCovers}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCovers ? "Yükleniyor..." : "İşlem seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceOptions.map((service) => {
                          const usage = getServiceUsageInfo(service);
                          return (
                            <SelectItem 
                              key={service} 
                              value={service}
                              disabled={usage.isLimitReached}
                              className={usage.isLimitReached ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              {getServiceOptionLabel(service)}
                          </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {loadingCovers && (
                      <p className="text-xs text-muted-foreground">Paket kapsamları yükleniyor...</p>
                    )}
                    {/* Seçili hizmet için kalan kullanım hakkı bilgisi */}
                    {formData.service_type && packageCovers.length > 0 && (
                      <p className={`text-xs ${getServiceUsageInfo(formData.service_type).isLimitReached ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {getServiceUsageInfo(formData.service_type).isLimitReached 
                          ? `⚠️ Bu hizmet için kullanım limiti dolmuş!`
                          : `Kalan kullanım hakkı: ${getServiceUsageInfo(formData.service_type).remaining}`
                        }
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="service_amount" className="text-sm">İşlem Tutarı (TL)</Label>
                    <Input
                      id="service_amount"
                      type="number"
                      step="0.01"
                      value={formData.service_amount}
                      onChange={(e) => {
                        const inputValue = e.target.value;
                        setFormData(prev => ({ ...prev, service_amount: inputValue }));
                        
                        // Validasyon: İşlem tutarı teyminattan büyük olamaz
                        if (inputValue && formData.road_assistance_coverage) {
                          const serviceAmount = parseFloat(inputValue);
                          const coverageAmount = parseFloat(parseFormattedNumber(formData.road_assistance_coverage));
                          
                          if (!isNaN(serviceAmount) && !isNaN(coverageAmount)) {
                            if (serviceAmount > coverageAmount) {
                              setServiceAmountError(`İşlem tutarı teyminattan (${formData.road_assistance_coverage} TL) büyük olamaz!`);
                            } else {
                              setServiceAmountError('');
                            }
                          } else {
                            setServiceAmountError('');
                          }
                        } else {
                          setServiceAmountError('');
                        }
                      }}
                      placeholder="0.00"
                      className={serviceAmountError ? 'border-red-500' : ''}
                    />
                    {serviceAmountError && (
                      <p className="text-xs text-red-500 mt-1">{serviceAmountError}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Maksimum: {formData.road_assistance_coverage || '0'} TL
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="road_assistance_coverage" className="text-sm">Yol Yardım Teyminatı (TL)</Label>
                    <Input
                      id="road_assistance_coverage"
                      type="text"
                      value={formData.road_assistance_coverage}
                      className="bg-muted/50"
                      readOnly
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="service_city" className="text-sm">Hizmet Şehri</Label>
                  <Select
                    value={formData.service_city}
                    onValueChange={(value) => setFormData({ ...formData, service_city: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="kilometer" className="text-sm">Kilometre</Label>
                    <Input
                      id="kilometer"
                      type="number"
                      value={formData.kilometer}
                      onChange={(e) => setFormData({ ...formData, kilometer: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="is_heavy_commercial" className="text-sm">Ağır Ticari</Label>
                    <Select
                      value={formData.is_heavy_commercial ? 'Evet' : 'Hayır'}
                      onValueChange={(value) => setFormData({ ...formData, is_heavy_commercial: value === 'Evet' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hayır">Hayır</SelectItem>
                        <SelectItem value="Evet">Evet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Adres Bilgileri - Full Width */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Adres Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="start_address" className="text-sm">Başlangıç Adresi</Label>
                <Textarea
                  id="start_address"
                  value={formData.start_address}
                  onChange={(e) => setFormData({ ...formData, start_address: e.target.value })}
                  placeholder="Hizmetin başlayacağı adres"
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="end_address" className="text-sm">Bitiş Adresi</Label>
                <Textarea
                  id="end_address"
                  value={formData.end_address}
                  onChange={(e) => setFormData({ ...formData, end_address: e.target.value })}
                  placeholder="Hizmetin biteceği adres"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Butonlar */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/dashboard/support/files')}
          >
            İptal
          </Button>
          <Button
            type="submit"
            disabled={submitting || !foundSale}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <FilePlus className="h-4 w-4 mr-2" />
                Dosyayı Kaydet
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Dosya Detay Modal */}
      <Dialog open={isFileModalOpen} onOpenChange={setIsFileModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Hasar Dosyası Detayları
            </DialogTitle>
            <DialogDescription>
              {selectedFile?.damage_file_number || 'Dosya detayları'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedFile && (
            <div className="space-y-6 mt-4">
              {/* Dosya Bilgileri */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dosya Numarası</Label>
                  <p className="font-medium">{selectedFile.damage_file_number || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Hizmet Tipi</Label>
                  <p className="font-medium">{selectedFile.service_type || '-'}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Oluşturulma Tarihi</Label>
                  <p className="font-medium">
                    {selectedFile.created_at ? new Date(selectedFile.created_at).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">İşlem Tutarı</Label>
                  <p className="font-medium">{selectedFile.service_amount ? `${selectedFile.service_amount} TL` : '-'}</p>
                </div>
              </div>

              {/* Sigortalı Bilgileri */}
              {selectedFile.sale?.customer && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Sigortalı Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ad Soyad</Label>
                      <p className="font-medium">
                        {selectedFile.sale.customer.name} {selectedFile.sale.customer.surname}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Telefon</Label>
                      <p className="font-medium">{selectedFile.sale.customer.phone || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Araç Bilgileri */}
              {selectedFile.sale?.vehicle && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Araç Bilgileri
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Plaka</Label>
                      <p className="font-medium">{selectedFile.sale.vehicle.plate || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Marka</Label>
                      <p className="font-medium">{selectedFile.sale.vehicle.brand?.name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Model</Label>
                      <p className="font-medium">{selectedFile.sale.vehicle.model?.name || '-'}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Model Yılı</Label>
                      <p className="font-medium">{selectedFile.sale.vehicle.model_year || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Diğer Bilgiler */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Diğer Bilgiler</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Şehir</Label>
                    <p className="font-medium">{selectedFile.city || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Kilometre</Label>
                    <p className="font-medium">{selectedFile.kilometer || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Ağır Ticari</Label>
                    <p className="font-medium">{selectedFile.heavy_commercial || '-'}</p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Yol Yardım Teyminatı</Label>
                    <p className="font-medium">{selectedFile.roadside_assistance_coverage || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Adres Bilgileri */}
              {(selectedFile.start_address || selectedFile.end_address) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Adres Bilgileri
                  </h4>
                  <div className="space-y-3">
                    {selectedFile.start_address && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Başlangıç Adresi</Label>
                        <p className="text-sm">{selectedFile.start_address}</p>
                      </div>
                    )}
                    {selectedFile.end_address && (
                      <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Bitiş Adresi</Label>
                        <p className="text-sm">{selectedFile.end_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
