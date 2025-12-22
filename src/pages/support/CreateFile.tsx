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
import { FilePlus, ArrowLeft, Search, Loader2, FileText, User, Car, Calendar, MapPin, DollarSign, Wrench, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { saleService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Sale } from '@/types';

// Türkiye şehirleri listesi
const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya', 'Artvin',
  'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan',
  'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta',
  'İçel', 'İstanbul', 'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak',
  'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman', 'Kırıkkale', 'Batman',
  'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

// Yapılacak işlem seçenekleri
const SERVICE_OPTIONS = [
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
 * Destek Ekibi için Dosya Oluşturma Sayfası
 * Çağrı merkezi için yeni dosya oluşturur
 */
export default function CreateFile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searching, setSearching] = useState(false);
  const [foundSale, setFoundSale] = useState<Sale | null>(null);
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
    request_date_time: new Date().toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }),
    service_type: 'Çekici Hizmeti – Kaza',
    service_amount: '',
    road_assistance_coverage: '',
    service_city: 'Adana',
    kilometer: '',
    is_heavy_commercial: false,
    start_address: '',
    end_address: ''
  });

  // Plaka sorgusu yap
  const handlePlateSearch = async () => {
    if (!formData.plate || formData.plate.trim() === '') {
      toast.error('Lütfen plaka giriniz');
      return;
    }

    setSearching(true);
    try {
      const sales = await saleService.getAll();
      const plate = formData.plate.trim().toUpperCase();
      
      // Plakaya göre satış bul
      const sale = sales.find(s => 
        s.vehicle?.plate?.toUpperCase() === plate
      );

      if (sale) {
        setFoundSale(sale);
        
        // Otomatik doldur
        setFormData(prev => ({
          ...prev,
          // Satış bilgileri
          policy_number: sale.policy_number || '',
          
          // Hasar dosya bilgileri
          damage_policy_number: sale.policy_number || '',
          policy_start_date: sale.start_date ? new Date(sale.start_date).toLocaleDateString('tr-TR') : '',
          
          // Sigortalı bilgileri
          insured_name: `${sale.customer?.name || ''} ${sale.customer?.surname || ''}`.trim(),
          insured_phone: sale.customer?.phone || '',
          vehicle_plate: sale.vehicle?.plate || '',
          vehicle_model: sale.vehicle?.model?.name || '',
          model_year: sale.vehicle?.model_year?.toString() || '',
          vehicle_brand: sale.vehicle?.brand?.name || '',
          vehicle_segment: sale.package?.vehicle_type || '',
        }));
        
        toast.success('Plaka bulundu, bilgiler otomatik dolduruldu');
      } else {
        setFoundSale(null);
        toast.error('Bu plakaya ait satış bulunamadı');
      }
    } catch (error) {
      console.error('Plaka sorgusu hatası:', error);
      toast.error('Plaka sorgulanırken bir hata oluştu');
    } finally {
      setSearching(false);
    }
  };

  // Form submit (şimdilik sadece console'a yazdır)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Personel adını otomatik ekle
    const fileData = {
      ...formData,
      staff_name: user ? `${user.name} ${user.surname}`.trim() : ''
    };
    console.log('Dosya bilgileri:', fileData);
    toast.info('Form bilgileri konsola yazdırıldı (Kaydetme henüz aktif değil)');
  };

  return (
    <div className="space-y-6">
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FilePlus className="h-8 w-8" />
            Yeni Dosya Oluştur
          </h1>
          <p className="text-muted-foreground">Çağrı merkezi için yeni dosya oluşturun</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plaka Sorgusu - Öne Çıkarılmış */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-primary" />
              Plaka Sorgusu
            </CardTitle>
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
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sol Kolon */}
          <div className="space-y-6">
            {/* Satış Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-primary" />
                  Satış Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policy_number">Satış Numarası</Label>
                  <Input
                    id="policy_number"
                    value={formData.policy_number}
                    onChange={(e) => setFormData({ ...formData, policy_number: e.target.value })}
                    placeholder="Satış numarası"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hasar Dosya Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Hasar Dosya Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="damage_file_number">Hasar Dosya Numarası</Label>
                  <Input
                    id="damage_file_number"
                    value={formData.damage_file_number}
                    onChange={(e) => setFormData({ ...formData, damage_file_number: e.target.value })}
                    placeholder="Hasar dosya numarası"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="damage_policy_number">Satış Numarası</Label>
                  <Input
                    id="damage_policy_number"
                    value={formData.damage_policy_number}
                    onChange={(e) => setFormData({ ...formData, damage_policy_number: e.target.value })}
                    placeholder="Satış numarası"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="policy_start_date">Satış Başlangıç Tarihi</Label>
                  <Input
                    id="policy_start_date"
                    value={formData.policy_start_date}
                    onChange={(e) => setFormData({ ...formData, policy_start_date: e.target.value })}
                    placeholder="Satış başlangıç tarihi"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sigortalı Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="h-5 w-5 text-blue-500" />
                  Sigortalı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insured_name">Ad Soyad</Label>
                    <Input
                      id="insured_name"
                      value={formData.insured_name}
                      onChange={(e) => setFormData({ ...formData, insured_name: e.target.value })}
                      placeholder="Ad soyad"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="insured_phone">Telefon</Label>
                    <Input
                      id="insured_phone"
                      value={formData.insured_phone}
                      onChange={(e) => setFormData({ ...formData, insured_phone: e.target.value })}
                      placeholder="Telefon numarası"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sağ Kolon */}
          <div className="space-y-6">
            {/* Araç Bilgileri */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Car className="h-5 w-5 text-green-500" />
                  Araç Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_plate">Araç Plakası</Label>
                    <Input
                      id="vehicle_plate"
                      value={formData.vehicle_plate}
                      onChange={(e) => setFormData({ ...formData, vehicle_plate: e.target.value })}
                      placeholder="Plaka"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_brand">Araç Markası</Label>
                    <Input
                      id="vehicle_brand"
                      value={formData.vehicle_brand}
                      onChange={(e) => setFormData({ ...formData, vehicle_brand: e.target.value })}
                      placeholder="Marka"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle_model">Araç Modeli</Label>
                    <Input
                      id="vehicle_model"
                      value={formData.vehicle_model}
                      onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                      placeholder="Model"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model_year">Model Yılı</Label>
                    <Input
                      id="model_year"
                      value={formData.model_year}
                      onChange={(e) => setFormData({ ...formData, model_year: e.target.value })}
                      placeholder="Yıl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_segment">Araç Segment</Label>
                  <Input
                    id="vehicle_segment"
                    value={formData.vehicle_segment}
                    onChange={(e) => setFormData({ ...formData, vehicle_segment: e.target.value })}
                    placeholder="Segment"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Çekici Section */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wrench className="h-5 w-5 text-purple-500" />
                  Çekici
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="request_date_time" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Sigortalı Talep Tarihi ve Saat
                    </Label>
                    <Input
                      id="request_date_time"
                      value={formData.request_date_time}
                      onChange={(e) => setFormData({ ...formData, request_date_time: e.target.value })}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service_type">Yapılacak İşlem</Label>
                    <Select
                      value={formData.service_type}
                      onValueChange={(value) => setFormData({ ...formData, service_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="İşlem seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {SERVICE_OPTIONS.map((service) => (
                          <SelectItem key={service} value={service}>
                            {service}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="service_amount" className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      İşlem Tutarı
                    </Label>
                    <Input
                      id="service_amount"
                      value={formData.service_amount}
                      onChange={(e) => setFormData({ ...formData, service_amount: e.target.value })}
                      placeholder="Anahtar Kelime Giriniz..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="road_assistance_coverage">Yol Yardım Teyminatı</Label>
                    <Input
                      id="road_assistance_coverage"
                      value={formData.road_assistance_coverage}
                      onChange={(e) => setFormData({ ...formData, road_assistance_coverage: e.target.value })}
                      placeholder="Anahtar Kelime Giriniz..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service_city" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Çekim İşleminin Yapılacağı Şehir
                  </Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="kilometer">Kilometre</Label>
                    <Input
                      id="kilometer"
                      value={formData.kilometer}
                      onChange={(e) => setFormData({ ...formData, kilometer: e.target.value })}
                      placeholder="Anahtar Kelime Giriniz..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="is_heavy_commercial">Ağır Ticari</Label>
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
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_address">Başlangıç Adresi</Label>
                <Textarea
                  id="start_address"
                  value={formData.start_address}
                  onChange={(e) => setFormData({ ...formData, start_address: e.target.value })}
                  placeholder="Anahtar Kelime Giriniz..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_address">Bitiş Adresi</Label>
                <Textarea
                  id="end_address"
                  value={formData.end_address}
                  onChange={(e) => setFormData({ ...formData, end_address: e.target.value })}
                  placeholder="Anahtar Kelime Giriniz..."
                  rows={3}
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
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            İptal
          </Button>
          <Button
            type="submit"
            className="gap-2"
            size="lg"
          >
            <FilePlus className="h-4 w-4" />
            Formu Görüntüle (Konsol)
          </Button>
        </div>
      </form>
    </div>
  );
}
