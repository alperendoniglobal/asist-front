import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { 
  customerService, packageService, saleService,
  carBrandService, carModelService, agencyService, pdfService
} from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Customer, Package, CarBrand, CarModel, Sale, Agency } from '@/types';
import { PaymentType, UserRole } from '@/types';
import { 
  User, Car, CreditCard, Wallet, Package as PackageIcon,
  Search, CheckCircle, AlertCircle, History, Shield, Building2, Globe,
  Download, ExternalLink, ArrowRight
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';

// Kullanım Tarzları
const USAGE_TYPES = [
  { value: 'PRIVATE', label: 'Hususi' },
  { value: 'COMMERCIAL', label: 'Ticari' },
  { value: 'TAXI', label: 'Taksi' },
];

// Model Yılları (son 30 yıl)
const MODEL_YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);

// Türkiye İlleri
const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl',
  'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

export default function NewSale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [loading, setLoading] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>(PaymentType.IYZICO);
  const [agreements, setAgreements] = useState({ kvkk: false, contract: false });
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  
  // Araç bilgilerine göre filtrelenmiş paketler
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  
  // Basari modali
  const [successModal, setSuccessModal] = useState<{ open: boolean; saleId: string | null }>({
    open: false,
    saleId: null
  });

  // Form Data - Müşteri Bilgileri
  const [customerForm, setCustomerForm] = useState({
    is_corporate: false,      // Kurumsal mı?
    tc_vkn: '',               // TC Kimlik (Bireysel) veya Vergi Kimlik (Kurumsal)
    name: '',                 // Ad (Bireysel) veya Ünvan (Kurumsal)
    surname: '',              // Soyad (Bireysel için)
    tax_office: '',           // Vergi Dairesi (Kurumsal için)
    birth_date: '',           // Doğum Tarihi
    email: '',
    phone: '',
    city: '',                 // İl
    district: '',             // İlçe
    address: '',
  });

  // Form Data - Araç Bilgileri
  const [vehicleForm, setVehicleForm] = useState({
    is_foreign_plate: false,  // Yabancı plaka mı?
    plate: '',
    registration_serial: '',  // Ruhsat Seri
    registration_number: '',  // Ruhsat No
    brand_id: '',
    model_id: '',
    model_year: '',
    usage_type: 'PRIVATE',
  });

  // Form Data - Paket Satış Bilgileri
  const [saleForm, setSaleForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    package_id: '',
    price: 0,
    commission: 0,
  });

  // Kart Bilgileri
  const [cardForm, setCardForm] = useState({
    card_holder: '',
    card_number: '',
    expire_month: '',
    expire_year: '',
    cvv: '',
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      const [packagesData, brandsData] = await Promise.all([
        packageService.getAll(),
        carBrandService.getAll(),
      ]);
      // Status ACTIVE olan paketleri filtrele
      setPackages(packagesData.filter(p => p.status === 'ACTIVE'));
      setCarBrands(brandsData);

      // Kullanıcının acentesini çek (komisyon oranı için)
      if (user?.agency_id) {
        try {
          const agency = await agencyService.getById(user.agency_id);
          setCurrentAgency(agency);
        } catch (error) {
          console.error('Acente bilgisi alınamadı:', error);
        }
      } else if (user?.role === UserRole.SUPER_ADMIN) {
        // Super Admin için varsayılan acente (ilk aktif acente)
        try {
          const agencies = await agencyService.getAll();
          const activeAgency = agencies.find(a => a.status === 'ACTIVE');
          if (activeAgency) {
            setCurrentAgency(activeAgency);
          }
        } catch (error) {
          console.error('Acenteler alınamadı:', error);
        }
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    }
  };

  // TC/VKN ile müşteri sorgula
  const handleSearchCustomer = async () => {
    if (customerForm.tc_vkn.length < 10) return;
    
    setSearchingCustomer(true);
    try {
      const customer = await customerService.findByTcVkn(customerForm.tc_vkn);
      if (customer) {
        setExistingCustomer(customer);
        setCustomerForm({
          ...customerForm,
          is_corporate: customer.is_corporate || false,
          name: customer.name,
          surname: customer.surname || '',
          tax_office: customer.tax_office || '',
          birth_date: customer.birth_date ? customer.birth_date.split('T')[0] : '',
          phone: customer.phone,
          email: customer.email || '',
          city: customer.city || '',
          district: customer.district || '',
          address: customer.address || '',
        });
      } else {
        setExistingCustomer(null);
      }
    } catch (error) {
      console.error('Müşteri sorgulanırken hata:', error);
      setExistingCustomer(null);
    } finally {
      setSearchingCustomer(false);
    }
  };

  // Araç yaşı ve kullanım tarzına göre paketleri filtrele
  const filterPackagesByVehicle = (modelYear: string, usageType: string) => {
    if (!modelYear) {
      setFilteredPackages([]);
      return;
    }

    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(modelYear);

    // Kullanım tarzı mapping: PRIVATE -> Hususi, COMMERCIAL -> Ticari, TAXI -> Taksi
    const usageTypeMapping: { [key: string]: string[] } = {
      'PRIVATE': ['Hususi', 'Otomobil', 'Binek'],
      'COMMERCIAL': ['Ticari', 'Kamyon', 'Kamyonet', 'Minibüs'],
      'TAXI': ['Taksi', 'Ticari'],
    };

    const matchingKeywords = usageTypeMapping[usageType] || [];

    const filtered = packages.filter(pkg => {
      // Araç yaşı kontrolü - max_vehicle_age'den küçük veya eşit olmalı
      const ageOk = vehicleAge <= (pkg.max_vehicle_age || 999);
      
      // Kullanım tarzı kontrolü - vehicle_type içinde arama yap (opsiyonel)
      // Eğer matchingKeywords boşsa tüm paketler gösterilir
      const typeOk = matchingKeywords.length === 0 || 
        matchingKeywords.some(keyword => 
          pkg.vehicle_type?.toLowerCase().includes(keyword.toLowerCase()) ||
          pkg.name?.toLowerCase().includes(keyword.toLowerCase())
        );

      return ageOk && typeOk;
    });

    setFilteredPackages(filtered);

    // Seçili paket artık uygun değilse temizle
    if (selectedPackage && !filtered.some(p => p.id === selectedPackage.id)) {
      setSelectedPackage(null);
      setSaleForm({
        ...saleForm,
        package_id: '',
        price: 0,
        commission: 0,
      });
    }
  };

  // Model yılı değiştiğinde paketleri filtrele
  const handleModelYearChange = (year: string) => {
    setVehicleForm({ ...vehicleForm, model_year: year });
    filterPackagesByVehicle(year, vehicleForm.usage_type);
  };

  // Kullanım tarzı değiştiğinde paketleri filtrele
  const handleUsageTypeChange = (usageType: string) => {
    setVehicleForm({ ...vehicleForm, usage_type: usageType });
    filterPackagesByVehicle(vehicleForm.model_year, usageType);
  };

  // Marka seçildiğinde modelleri getir
  const handleBrandChange = async (brandId: string) => {
    setVehicleForm({ ...vehicleForm, brand_id: brandId, model_id: '' });
    if (brandId) {
      try {
        const models = await carModelService.getByBrandId(parseInt(brandId));
        setCarModels(models);
      } catch (error) {
        console.error('Modeller yüklenirken hata:', error);
        setCarModels([]);
      }
    } else {
      setCarModels([]);
    }
  };

  // Paket seçildiğinde fiyat hesapla
  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    setSelectedPackage(pkg || null);
    
    if (pkg) {
      // Fiyat paketten geliyor (satış anındaki fiyat olarak kaydedilecek)
      const basePrice = Number(pkg.price) || 0;
      
      // Komisyon oranı acentenin gerçek oranından alınıyor
      // Bu oran satış anında sabitlenip commission alanına kaydediliyor
      // Böylece sonradan acente oranı değişse bile bu satış etkilenmiyor
      const commissionRate = Number(currentAgency?.commission_rate) || 20; // Varsayılan %20
      const commission = basePrice * (commissionRate / 100);
      
      setSaleForm({
        ...saleForm,
        package_id: packageId,
        price: basePrice,
        commission: commission,
      });
    } else {
      setSaleForm({
        ...saleForm,
        package_id: '',
        price: 0,
        commission: 0,
      });
    }
  };

  // Satışı tamamla - Transaction ile tek seferde işlenir
  // Hata olursa hiçbir kayıt oluşturulmaz (müşteri, araç dahil)
  const handleSubmit = async () => {
    if (!agreements.kvkk || !agreements.contract) {
      alert('Lütfen sözleşmeleri onaylayın');
      return;
    }

    setLoading(true);
    try {
      // Tüm işlemleri tek seferde yap (transaction ile)
      // Herhangi bir adımda hata olursa hiçbir kayıt oluşturulmaz
      const sale = await saleService.completeSale({
        // Müşteri bilgileri
        customer: {
          id: existingCustomer?.id,  // Mevcut müşteri varsa ID'sini gönder
          is_corporate: customerForm.is_corporate,
          tc_vkn: customerForm.tc_vkn,
          name: customerForm.name,
          surname: customerForm.surname,
          tax_office: customerForm.tax_office,
          birth_date: customerForm.birth_date,
          phone: customerForm.phone,
          email: customerForm.email,
          city: customerForm.city,
          district: customerForm.district,
          address: customerForm.address,
        },
        // Araç bilgileri
        vehicle: {
        is_foreign_plate: vehicleForm.is_foreign_plate,
        plate: vehicleForm.plate.toUpperCase(),
          registration_serial: vehicleForm.registration_serial.toUpperCase() || undefined,
          registration_number: vehicleForm.registration_number || undefined,
        brand_id: parseInt(vehicleForm.brand_id),
        model_id: parseInt(vehicleForm.model_id),
        model_year: parseInt(vehicleForm.model_year),
        usage_type: vehicleForm.usage_type,
        },
        // Satış bilgileri
        sale: {
        package_id: saleForm.package_id,
        start_date: saleForm.start_date,
        end_date: saleForm.end_date,
        price: saleForm.price,
        commission: saleForm.commission,
        },
        // Ödeme bilgileri
        payment: {
          type: paymentMethod,
          cardDetails: paymentMethod === PaymentType.IYZICO ? {
          cardHolderName: cardForm.card_holder,
          cardNumber: cardForm.card_number,
          expireMonth: cardForm.expire_month,
          expireYear: cardForm.expire_year,
          cvc: cardForm.cvv,
          } : undefined,
        },
        });

      // Başarı modalini aç
      setSuccessModal({ open: true, saleId: sale.id });
    } catch (error: any) {
      console.error('Satış oluşturulurken hata:', error);
      // Hata mesajını göster - transaction sayesinde hiçbir kayıt oluşturulmadı
      alert(error.response?.data?.message || error.response?.data?.error || 'Satış oluşturulamadı! Hiçbir kayıt oluşturulmadı.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(value);
  };

  return (
    <div className="space-y-6 pb-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Yeni Paket Satışı
        </h1>
        <p className="text-muted-foreground mt-1">
          Müşteri bilgilerini girerek yeni paket satışı yapın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Müşteri Bilgileri */}
        <Card className="lg:col-span-1 card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              MÜŞTERİ BİLGİLERİ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Kurumsal Müşteri Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <Label className="font-medium cursor-pointer">Kurumsal Müşteri</Label>
              </div>
              <Switch
                checked={customerForm.is_corporate}
                onCheckedChange={(checked) => setCustomerForm({ 
                  ...customerForm, 
                  is_corporate: checked,
                  surname: checked ? '' : customerForm.surname,
                  tax_office: checked ? customerForm.tax_office : '',
                })}
              />
            </div>

            {/* TC/VKN */}
            <div className="space-y-2">
              <Label className="text-sm">
                {customerForm.is_corporate ? 'Vergi Kimlik No' : 'T.C. Kimlik No'} <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  value={customerForm.tc_vkn}
                  onChange={(e) => setCustomerForm({ ...customerForm, tc_vkn: e.target.value })}
                  placeholder={customerForm.is_corporate ? 'Vergi Kimlik Numarası' : 'T.C. Kimlik Numarası'}
                  maxLength={11}
                />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleSearchCustomer}
                  disabled={searchingCustomer || customerForm.tc_vkn.length < 10}
                >
                  {searchingCustomer ? (
                    <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {existingCustomer && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded">
                  <CheckCircle className="h-4 w-4" />
                  Mevcut müşteri bulundu
                </div>
              )}
            </div>

            {/* Kurumsal için: Ünvan ve Vergi Dairesi */}
            {customerForm.is_corporate ? (
              <>
                <div className="space-y-2">
                  <Label className="text-sm">Ünvan <span className="text-red-500">*</span></Label>
                  <Input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="Ticari Ünvan"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Vergi Dairesi <span className="text-red-500">*</span></Label>
                  <Input
                    value={customerForm.tax_office}
                    onChange={(e) => setCustomerForm({ ...customerForm, tax_office: e.target.value })}
                    placeholder="Vergi Dairesi"
                  />
                </div>
              </>
            ) : (
              /* Bireysel için: İsim ve Soyisim */
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-sm">İsim <span className="text-red-500">*</span></Label>
                  <Input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                    placeholder="İsim"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Soyisim <span className="text-red-500">*</span></Label>
                  <Input
                    value={customerForm.surname}
                    onChange={(e) => setCustomerForm({ ...customerForm, surname: e.target.value })}
                    placeholder="Soyisim"
                  />
                </div>
              </div>
            )}

            {/* Doğum Tarihi */}
            <div className="space-y-2">
              <Label className="text-sm">Doğum Tarihi {!customerForm.is_corporate && <span className="text-red-500">*</span>}</Label>
              <Input
                type="date"
                value={customerForm.birth_date}
                onChange={(e) => setCustomerForm({ ...customerForm, birth_date: e.target.value })}
              />
            </div>

            {/* E-Posta ve Telefon */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">E-Posta</Label>
                <Input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="E-Posta"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Telefon <span className="text-red-500">*</span></Label>
                <Input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="(___) ___-____"
                />
              </div>
            </div>

            {/* İl ve İlçe */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">İl <span className="text-red-500">*</span></Label>
                <Select
                  value={customerForm.city}
                  onValueChange={(value) => setCustomerForm({ ...customerForm, city: value, district: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İl Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">İlçe <span className="text-red-500">*</span></Label>
                <Input
                  value={customerForm.district}
                  onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })}
                  placeholder={customerForm.city ? 'İlçe' : 'Önce İl Seçiniz'}
                  disabled={!customerForm.city}
                />
              </div>
            </div>

            {/* Müşteri Geçmişi */}
            {existingCustomer && existingCustomer.sales && existingCustomer.sales.length > 0 && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 font-medium mb-2">
                  <History className="h-4 w-4" />
                  Müşteri Geçmişi
                </div>
                <div className="space-y-2">
                  {existingCustomer.sales.slice(0, 3).map((sale: Sale) => (
                    <div key={sale.id} className="flex items-center justify-between text-sm">
                      <span className="text-amber-700 dark:text-amber-300">
                        {sale.vehicle?.plate} - {sale.package?.name}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(sale.end_date).toLocaleDateString('tr-TR')}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orta Kolon - Araç Bilgileri */}
        <Card className="lg:col-span-1 card-hover">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5 text-primary" />
              ARAÇ BİLGİLERİ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Yabancı Plaka Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label className="font-medium cursor-pointer">Yabancı Plaka</Label>
              </div>
              <Switch
                checked={vehicleForm.is_foreign_plate}
                onCheckedChange={(checked) => setVehicleForm({ ...vehicleForm, is_foreign_plate: checked })}
              />
            </div>

            {/* Plaka */}
            <div className="space-y-2">
              <Label className="text-sm">Plaka <span className="text-red-500">*</span></Label>
              <div className="flex">
                <div className={`flex items-center justify-center w-10 ${vehicleForm.is_foreign_plate ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-l-md`}>
                  <span className="text-xs font-bold">{vehicleForm.is_foreign_plate ? '🌍' : 'TR'}</span>
                </div>
                <Input
                  value={vehicleForm.plate}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, plate: e.target.value.toUpperCase() })}
                  placeholder={vehicleForm.is_foreign_plate ? 'Yabancı Plaka' : '34ABC123'}
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Ruhsat Seri/No */}
            <div className="space-y-2">
              <Label className="text-sm">Ruhsat Seri/No <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={vehicleForm.registration_serial}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, registration_serial: e.target.value.toUpperCase() })}
                  placeholder="Seri (AA, AB...)"
                  maxLength={10}
                />
                <Input
                  value={vehicleForm.registration_number}
                  onChange={(e) => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })}
                  placeholder="No"
                  maxLength={20}
                />
              </div>
            </div>

            {/* Araç Marka */}
            <div className="space-y-2">
              <Label className="text-sm">Araç Marka <span className="text-red-500">*</span></Label>
              <Select
                value={vehicleForm.brand_id}
                onValueChange={handleBrandChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Marka Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {carBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Araç Model */}
            <div className="space-y-2">
              <Label className="text-sm">Araç Model <span className="text-red-500">*</span></Label>
              <Select
                value={vehicleForm.model_id}
                onValueChange={(value) => setVehicleForm({ ...vehicleForm, model_id: value })}
                disabled={!vehicleForm.brand_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Önce Marka Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {carModels.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model Yılı ve Kullanım Tarzı */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Model Yılı <span className="text-red-500">*</span></Label>
                <Select
                  value={vehicleForm.model_year}
                  onValueChange={handleModelYearChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Yıl" />
                  </SelectTrigger>
                  <SelectContent>
                    {MODEL_YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Kullanım Tarzı <span className="text-red-500">*</span></Label>
                <Select
                  value={vehicleForm.usage_type}
                  onValueChange={handleUsageTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tarz" />
                  </SelectTrigger>
                  <SelectContent>
                    {USAGE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Araç Yaşı Bilgisi */}
            {vehicleForm.model_year && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 dark:text-blue-300">Araç Yaşı:</span>
                  <Badge variant="outline" className="text-blue-700 dark:text-blue-300">
                    {new Date().getFullYear() - parseInt(vehicleForm.model_year)} yıl
                  </Badge>
                </div>
                <p className="text-blue-600/70 dark:text-blue-400/70 text-xs mt-1">
                  {filteredPackages.length > 0 
                    ? `${filteredPackages.length} uygun paket bulundu`
                    : 'Bu araç için uygun paket bulunamadı'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sağ Kolon - Paket ve Ödeme */}
        <Card className="lg:col-span-1 card-hover">
          <CardContent className="space-y-4 pt-6">
            {/* Tarihler */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Başlangıç <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={saleForm.start_date}
                  onChange={(e) => setSaleForm({ ...saleForm, start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Bitiş</Label>
                <Input
                  type="date"
                  value={saleForm.end_date}
                  className="bg-muted"
                  readOnly
                />
              </div>
            </div>

            {/* Paket Seçimi */}
            <div className="space-y-2">
              <Label className="text-sm">
                Paket <span className="text-red-500">*</span>
                {!vehicleForm.model_year && (
                  <span className="text-xs text-amber-600 ml-2">(Önce araç bilgilerini doldurun)</span>
                )}
              </Label>
              <Select
                value={saleForm.package_id}
                onValueChange={handlePackageChange}
                disabled={!vehicleForm.model_year || filteredPackages.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !vehicleForm.model_year 
                      ? "Önce model yılı seçin" 
                      : filteredPackages.length === 0 
                        ? "Bu araç için uygun paket yok" 
                        : "Paket Seçiniz"
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {filteredPackages.map((pkg) => (
                    <SelectItem key={pkg.id} value={pkg.id}>
                      <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between w-full gap-2">
                          <span className="font-medium">{pkg.name}</span>
                          <span className="font-semibold text-primary">
                            {Number(pkg.price).toLocaleString('tr-TR')} ₺
                        </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{pkg.vehicle_type}</span>
                          <span>•</span>
                          <span>Maks. {pkg.max_vehicle_age} yaş</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Uygun paket yoksa uyarı */}
              {vehicleForm.model_year && filteredPackages.length === 0 && (
                <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {new Date().getFullYear() - parseInt(vehicleForm.model_year)} yaşındaki {USAGE_TYPES.find(t => t.value === vehicleForm.usage_type)?.label || ''} araç için uygun paket bulunamadı.
                  </span>
                </div>
              )}
            </div>

            {/* Paket Detayları */}
            {selectedPackage ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200 font-medium mb-2">
                  <PackageIcon className="h-4 w-4" />
                  {selectedPackage.name}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300">
                  {selectedPackage.description || 'Paket detayları'}
                </div>
                <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-700">
                  <div className="flex justify-between text-sm">
                    <span>Fiyat:</span>
                    <span className="font-semibold">{formatCurrency(saleForm.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-emerald-600 dark:text-emerald-400">
                    <span>Komisyon:</span>
                    <span className="font-semibold">{formatCurrency(saleForm.commission)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm">
                <AlertCircle className="h-4 w-4" />
                Paket seçiniz
              </div>
            )}

            {/* Ödeme Yeri */}
            <div className="space-y-2">
              <Label className="text-sm">Ödeme Yöntemi <span className="text-red-500">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentType.IYZICO)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === PaymentType.IYZICO
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-6 w-6" />
                    {paymentMethod === PaymentType.IYZICO && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Kredi Kartı</p>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod(PaymentType.BALANCE)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === PaymentType.BALANCE
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Wallet className="h-6 w-6" />
                    {paymentMethod === PaymentType.BALANCE && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Bakiye</p>
                </button>
              </div>
            </div>

            {/* Kart Bilgileri */}
            {paymentMethod === PaymentType.IYZICO && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">Kart Sahibi</Label>
                  <Input
                    value={cardForm.card_holder}
                    onChange={(e) => setCardForm({ ...cardForm, card_holder: e.target.value })}
                    placeholder="Ad Soyad"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Kart Numarası</Label>
                  <Input
                    value={cardForm.card_number}
                    onChange={(e) => setCardForm({ ...cardForm, card_number: e.target.value })}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label className="text-sm">Ay</Label>
                    <Input
                      value={cardForm.expire_month}
                      onChange={(e) => setCardForm({ ...cardForm, expire_month: e.target.value })}
                      placeholder="MM"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">Yıl</Label>
                    <Input
                      value={cardForm.expire_year}
                      onChange={(e) => setCardForm({ ...cardForm, expire_year: e.target.value })}
                      placeholder="YY"
                      maxLength={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">CVV</Label>
                    <Input
                      type="password"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      placeholder="***"
                      maxLength={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Sözleşmeler */}
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.kvkk}
                  onChange={(e) => setAgreements({ ...agreements, kvkk: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="text-primary underline">KVKK Bilgilendirme Metni</span>'ni okudum onaylıyorum.
                </span>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreements.contract}
                  onChange={(e) => setAgreements({ ...agreements, contract: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-sm">
                  <span className="text-primary underline">Mesafeli Satış Sözleşmesi</span>'ni okudum onaylıyorum.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !agreements.kvkk || !agreements.contract || !saleForm.package_id}
              className="w-full h-12 text-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              {loading ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Satışı Tamamla
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Basari Modali */}
      <Dialog open={successModal.open} onOpenChange={(open) => !open && navigate('/sales')}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl">Satis Basariyla Tamamlandi!</DialogTitle>
            <DialogDescription>
              Sozlesme belgesi olusturuldu. Asagidaki butonlardan PDF'i indirebilir veya goruntuleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 pt-4">
            {/* PDF Indir */}
            <Button 
              variant="default" 
              className="w-full gap-2"
              onClick={() => {
                if (successModal.saleId) {
                  pdfService.downloadSaleContract(successModal.saleId);
                }
              }}
            >
              <Download className="h-5 w-5" />
              Sozlesme PDF Indir
            </Button>
            
            {/* PDF Goruntule */}
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => {
                if (successModal.saleId) {
                  pdfService.viewSaleContract(successModal.saleId);
                }
              }}
            >
              <ExternalLink className="h-5 w-5" />
              PDF Goruntule (Yeni Sekme)
            </Button>
            
            {/* Satislara Git */}
            <Button 
              variant="ghost" 
              className="w-full gap-2 mt-4"
              onClick={() => navigate('/sales')}
            >
              Satislara Git
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
