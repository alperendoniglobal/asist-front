import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  carBrandService, carModelService, motorBrandService, motorModelService, agencyService, branchService, pdfService
} from '@/services/apiService';
import { contentService } from '@/services/contentService';
import { extractRegistrationInfo } from '@/services/ocrService';
import { toast } from 'sonner';
import { validateTCKN, validateVKN } from '@/utils/validators';
import { useAuth } from '@/contexts/AuthContext';
import type { Customer, Package, CarBrand, CarModel, MotorBrand, MotorModel, Sale, Agency, Branch } from '@/types';
import { PaymentType, UserRole } from '@/types';
import PaytrIframe from '@/components/payment/PaytrIframe';
import { paymentService } from '@/services/apiService';
import { 
  User, Car, CreditCard, Wallet, Package as PackageIcon,
  Search, CheckCircle, AlertCircle, History, Shield, Building2, Globe,
  Download, ExternalLink, ArrowRight, Upload, Image as ImageIcon, X, Loader2
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from '@/components/ui/dialog';
// Şehir ve ilçe verilerini import et
import cityData from '@/data/city.json';

// Kullanım Tarzları
const USAGE_TYPES = [
  { value: 'PRIVATE', label: 'Hususi' },
  { value: 'COMMERCIAL', label: 'Ticari' },
  { value: 'TAXI', label: 'Taksi' },
];

// Model Yılları (son 40 yıl)
const MODEL_YEARS = Array.from({ length: 40 }, (_, i) => new Date().getFullYear() - i);

// Türkiye İlleri - city.json'dan al
const CITIES = cityData.map((city) => city.il);

// Seçilen ile göre ilçeleri getiren fonksiyon
const getDistrictsByCity = (cityName: string): string[] => {
  const city = cityData.find((c) => c.il === cityName);
  return city ? city.ilceleri : [];
};

/** Türkçe karakter farklarını yok sayarak karşılaştırma (Istanbul ≈ İstanbul) */
const normalizeTrKey = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/\s+/g, '');

const matchCityName = (raw: string): string => {
  const key = normalizeTrKey(raw);
  return CITIES.find((c) => normalizeTrKey(c) === key) || raw.trim();
};

const matchDistrictName = (cityName: string, raw: string): string => {
  const districts = getDistrictsByCity(cityName);
  const key = normalizeTrKey(raw);
  return districts.find((d) => normalizeTrKey(d) === key) || raw.trim();
};

/** Europe/Istanbul takvim günü YYYY-MM-DD */
const todayYmdIstanbul = (): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const addDaysYmd = (ymd: string, days: number): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
};

const addYearsYmd = (ymd: string, years: number): string => {
  const [y, m, d] = ymd.split('-').map(Number);
  const dt = new Date(Date.UTC(y + years, m - 1, d));
  return dt.toISOString().slice(0, 10);
};

/** Varsayılan poliçe başlangıcı: bugün + 7 */
const defaultPolicyStartYmd = (): string => addDaysYmd(todayYmdIstanbul(), 7);

const normalizeStartDateParam = (raw: string): string | null => {
  const trimmed = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const tr = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (tr) return `${tr[3]}-${tr[2]}-${tr[1]}`;
  return null;
};

export default function NewSale() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryPrefillDone = useRef(false);
  
  // State
  const [loading, setLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [searchingCustomer, setSearchingCustomer] = useState(false);
  const [existingCustomer, setExistingCustomer] = useState<Customer | null>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [motorBrands, setMotorBrands] = useState<MotorBrand[]>([]);
  const [motorModels, setMotorModels] = useState<MotorModel[]>([]);
  const [modelSearchQuery, setModelSearchQuery] = useState(''); // Model arama sorgusu
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>(PaymentType.PAYTR);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [isPaytrModalOpen, setIsPaytrModalOpen] = useState(false);
  const [agreements, setAgreements] = useState({ kvkk: false, contract: false });
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  /** Şube kullanıcısı ise şube bilgisi (bakiye ve komisyon oranı için) */
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  
  // Araç tipi seçimi (en başta seçilecek)
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('');
  
  // Araç tipleri listesi
  const VEHICLE_TYPES = [
    { value: 'Motosiklet', label: 'Motosiklet' },
    { value: 'Otomobil', label: 'Otomobil' },
    { value: 'Minibüs', label: 'Minibüs' },
    { value: 'Midibüs', label: 'Midibüs' },
    { value: 'Kamyonet', label: 'Kamyonet' },
    { value: 'Taksi', label: 'Taksi' },
    { value: 'Kamyon', label: 'Kamyon' },
    { value: 'Çekici', label: 'Çekici' },
  ];
  
  // Seçilen araç tipine göre motor mu car mı?
  const isMotorcycle = selectedVehicleType === 'Motosiklet';
  
  // Araç bilgilerine göre filtrelenmiş paketler
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  
  // Basari modali
  const [successModal, setSuccessModal] = useState<{ open: boolean; saleId: string | null }>({
    open: false,
    saleId: null
  });

  // Ruhsat fotoğrafı ve OCR state
  const [registrationPhoto, setRegistrationPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);

  // KVKK ve Mesafeli Satış Sözleşmesi Modal state
  const [kvkkModalOpen, setKvkkModalOpen] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [kvkkContent, setKvkkContent] = useState<string>('');
  const [contractContent, setContractContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

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

  // TC/VKN validasyon hatası
  const [tcVknError, setTcVknError] = useState<string>('');

  // Form Data - Araç Bilgileri
  const [vehicleForm, setVehicleForm] = useState({
    is_foreign_plate: false,  // Yabancı plaka mı?
    plate: '',
    registration_serial: '',  // Ruhsat Seri
    registration_number: '',  // Ruhsat No
    brand_id: '',
    model_id: '',
    brand_name: '',
    model_name: '',
    model_year: '',
    usage_type: 'PRIVATE',
  });
  /** Katalogda yoksa serbest marka/model girişi */
  const [useManualBrandModel, setUseManualBrandModel] = useState(false);

  // Form Data - Paket Satış Bilgileri (varsayılan başlangıç = bugün+7)
  const [saleForm, setSaleForm] = useState(() => {
    const start = defaultPolicyStartYmd();
    return {
      start_date: start,
      end_date: addYearsYmd(start, 1),
      package_id: '',
      price: 0,
      commission: 0,
    };
  });

  // Kart Bilgileri - PayTR iFrame kullanıldığı için artık gerekli değil
  // PayTR ödeme formu iframe içinde gösteriliyor

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  // Partner query prefill (paket hariç) — katalog yüklendikten sonra
  useEffect(() => {
    if (queryPrefillDone.current || !user || !initialDataLoaded) return;

    const hasPrefillKeys = [
      'tc_vkn', 'name', 'surname', 'phone', 'email', 'city', 'district', 'address',
      'plate', 'brand', 'brand_name', 'model', 'model_name', 'brand_id', 'model_id',
      'vehicle_type', 'model_year', 'usage_type', 'is_corporate', 'is_foreign_plate',
      'registration_serial', 'registration_number', 'tax_office', 'birth_date',
      'start_date',
    ].some((k) => searchParams.has(k));

    if (!hasPrefillKeys) {
      queryPrefillDone.current = true;
      return;
    }

    queryPrefillDone.current = true;
    void applyQueryPrefill();
  }, [user, initialDataLoaded, searchParams]);

  // Ödeme yöntemi değişince komisyonu güncelle: Bakiye = 0, PayTR = hesaplanan komisyon
  useEffect(() => {
    if (paymentMethod === PaymentType.BALANCE) {
      setSaleForm((prev) => ({ ...prev, commission: 0 }));
      return;
    }
    if (paymentMethod === PaymentType.PAYTR && saleForm.package_id && saleForm.price > 0) {
      const commissionRate =
        user?.role === UserRole.BRANCH_ADMIN || user?.role === UserRole.BRANCH_USER
          ? Number(currentBranch?.commission_rate ?? currentAgency?.commission_rate) || 20
          : Number(currentAgency?.commission_rate) || 20;
      const commission = (saleForm.price * commissionRate) / 100;
      setSaleForm((prev) => ({ ...prev, commission }));
    }
  }, [paymentMethod]);

  const fetchInitialData = async () => {
    try {
      const [packagesData, carBrandsData, motorBrandsData] = await Promise.all([
        packageService.getAll(),
        carBrandService.getAll(),
        motorBrandService.getAll(),
      ]);
      // Status ACTIVE olan paketleri filtrele
      setPackages(packagesData.filter(p => p.status === 'ACTIVE'));
      setCarBrands(carBrandsData);
      setMotorBrands(motorBrandsData);
      setInitialDataLoaded(true);

      // Kullanıcının acentesini çek (komisyon oranı ve acente bakiyesi için)
      if (user?.agency_id) {
        try {
          const agency = await agencyService.getById(user.agency_id);
          setCurrentAgency(agency);
        } catch (error) {
          console.error('Acente bilgisi alınamadı:', error);
        }
      } else if (user?.role === UserRole.SUPER_ADMIN) {
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

      // Şube kullanıcısı ise şube bilgisini çek (şube bakiyesi ve komisyon oranı için)
      if (user?.branch_id) {
        try {
          const branch = await branchService.getById(user.branch_id);
          setCurrentBranch(branch);
        } catch (error) {
          console.error('Şube bilgisi alınamadı:', error);
          setCurrentBranch(null);
        }
      } else {
        setCurrentBranch(null);
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      setInitialDataLoaded(true);
    }
  };

  const getParam = (key: string): string | null => {
    const v = searchParams.get(key);
    if (v == null) return null;
    const trimmed = v.trim();
    return trimmed === '' ? null : trimmed;
  };

  /**
   * Partner URL query → form prefill (paket alanları hariç)
   */
  const applyQueryPrefill = async () => {
    try {
      const customerPatch: Partial<typeof customerForm> = {};
      const corp = getParam('is_corporate');
      if (corp != null) {
        customerPatch.is_corporate = ['1', 'true', 'yes'].includes(corp.toLowerCase());
      }
      for (const key of [
        'tc_vkn', 'name', 'surname', 'tax_office', 'birth_date',
        'phone', 'email', 'address',
      ] as const) {
        const v = getParam(key);
        if (v != null) customerPatch[key] = v;
      }

      // İl / ilçe: Select value city.json ile birebir olmalı (Istanbul → İstanbul)
      const cityRaw = getParam('city');
      const districtRaw = getParam('district');
      if (cityRaw != null) {
        const matchedCity = matchCityName(cityRaw);
        customerPatch.city = matchedCity;
        if (districtRaw != null) {
          customerPatch.district = matchDistrictName(matchedCity, districtRaw);
        }
      } else if (districtRaw != null) {
        customerPatch.district = districtRaw;
      }

      if (Object.keys(customerPatch).length > 0) {
        setCustomerForm((prev) => ({ ...prev, ...customerPatch }));
      }

      // Başlangıç tarihi (opsiyonel) — geçmişse bugüne çek
      const startRaw = getParam('start_date');
      if (startRaw) {
        const normalized = normalizeStartDateParam(startRaw);
        const today = todayYmdIstanbul();
        if (!normalized) {
          toast.error('Geçersiz başlangıç tarihi; varsayılan (bugün+7) kullanılıyor');
        } else if (normalized < today) {
          toast.warning('Başlangıç tarihi bugünden önce olamaz; bugüne alındı');
          setSaleForm((prev) => ({
            ...prev,
            start_date: today,
            end_date: addYearsYmd(today, 1),
          }));
        } else {
          setSaleForm((prev) => ({
            ...prev,
            start_date: normalized,
            end_date: addYearsYmd(normalized, 1),
          }));
        }
      }

      const vehicleType = getParam('vehicle_type');
      if (vehicleType) {
        const matchedType = VEHICLE_TYPES.find(
          (t) => t.value.toLocaleLowerCase('tr-TR') === vehicleType.toLocaleLowerCase('tr-TR')
        );
        setSelectedVehicleType(matchedType?.value || vehicleType);
      }

      const vehiclePatch: Partial<typeof vehicleForm> = {};
      const foreign = getParam('is_foreign_plate');
      if (foreign != null) {
        vehiclePatch.is_foreign_plate = ['1', 'true', 'yes'].includes(foreign.toLowerCase());
      }
      for (const key of [
        'plate', 'registration_serial', 'registration_number', 'model_year', 'usage_type',
      ] as const) {
        const v = getParam(key);
        if (v != null) vehiclePatch[key] = key === 'plate' || key === 'registration_serial' ? v.toUpperCase() : v;
      }

      const resolvedType =
        (vehicleType &&
          (VEHICLE_TYPES.find(
            (t) => t.value.toLocaleLowerCase('tr-TR') === vehicleType.toLocaleLowerCase('tr-TR')
          )?.value ||
            vehicleType)) ||
        selectedVehicleType;
      const motorcycle = resolvedType === 'Motosiklet';

      const brandIdParam = getParam('brand_id') || getParam('motor_brand_id');
      const modelIdParam = getParam('model_id') || getParam('motor_model_id');
      const brandText = getParam('brand') || getParam('brand_name');
      const modelText = getParam('model') || getParam('model_name');

      let manual = false;
      let brandId = '';
      let modelId = '';
      let brandName = brandText || '';
      let modelName = modelText || '';

      const loadModelsForBrand = async (id: number) => {
        try {
          const models = motorcycle
            ? await motorModelService.getByBrandId(id)
            : await carModelService.getByBrandId(id);
          if (motorcycle) {
            setMotorModels(models);
            setCarModels([]);
          } else {
            setCarModels(models);
            setMotorModels([]);
          }
          return models;
        } catch {
          setCarModels([]);
          setMotorModels([]);
          return [];
        }
      };

      if (brandIdParam && /^\d+$/.test(brandIdParam)) {
        brandId = brandIdParam;
        setUseManualBrandModel(false);
        await loadModelsForBrand(parseInt(brandIdParam, 10));
        if (modelIdParam && /^\d+$/.test(modelIdParam)) {
          modelId = modelIdParam;
        }
      } else if (brandText) {
        const brands = motorcycle ? motorBrands : carBrands;
        const matchedBrand = brands.find(
          (b) => b.name.toLocaleLowerCase('tr-TR') === brandText.toLocaleLowerCase('tr-TR')
        );
        if (matchedBrand) {
          brandId = matchedBrand.id.toString();
          brandName = matchedBrand.name;
          setUseManualBrandModel(false);
          const models = await loadModelsForBrand(matchedBrand.id);
          if (modelText) {
            const matchedModel = models.find(
              (m) => m.name.toLocaleLowerCase('tr-TR') === modelText.toLocaleLowerCase('tr-TR')
            );
            if (matchedModel) {
              modelId = matchedModel.id.toString();
              modelName = matchedModel.name;
            } else {
              manual = true;
            }
          }
        } else {
          manual = true;
        }
      }

      if (manual || (!brandId && brandName)) {
        setUseManualBrandModel(true);
        vehiclePatch.brand_id = '';
        vehiclePatch.model_id = '';
        vehiclePatch.brand_name = brandName;
        vehiclePatch.model_name = modelName;
      } else {
        if (brandId) vehiclePatch.brand_id = brandId;
        if (modelId) vehiclePatch.model_id = modelId;
        if (brandName) vehiclePatch.brand_name = brandName;
        if (modelName) vehiclePatch.model_name = modelName;
      }

      if (Object.keys(vehiclePatch).length > 0) {
        setVehicleForm((prev) => ({ ...prev, ...vehiclePatch }));
      }

      // Prefill sonrası paket filtresi (state async olduğu için lokal değerlerle)
      const yearForFilter = vehiclePatch.model_year || getParam('model_year') || '';
      const usageForFilter = vehiclePatch.usage_type || getParam('usage_type') || 'PRIVATE';
      const typeForFilter = resolvedType || '';
      if (yearForFilter && typeForFilter) {
        filterPackagesByVehicleAndType(yearForFilter, usageForFilter, typeForFilter);
      }

      // Form query paramları URL'de kalsın → yenilemede prefill tekrar uygulanır.
      // accessToken/refreshToken AuthProvider'da zaten query'den silindi.

      toast.success('Partner verileri forma aktarıldı. Paketi seçip satışı tamamlayabilirsiniz.');
    } catch (error) {
      console.error('Query prefill hatası:', error);
      toast.error('Form ön doldurma sırasında hata oluştu');
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

  // Araç yaşı, kullanım tarzı ve araç tipine göre paketleri filtrele
  const filterPackagesByVehicleAndType = (modelYear: string, usageType: string, vehicleType?: string) => {
    const typeToFilter = vehicleType || selectedVehicleType;
    if (!modelYear || !typeToFilter) {
      setFilteredPackages([]);
      return;
    }

    const currentYear = new Date().getFullYear();
    const vehicleAge = currentYear - parseInt(modelYear);

    const isMotorcycle = typeToFilter === 'Motosiklet';

    const filtered = packages.filter(pkg => {
      // 1. Araç tipi kontrolü - seçilen araç tipi ile eşleşmeli
      const typeMatch = pkg.vehicle_type === typeToFilter;
      if (!typeMatch) return false;
      
      // 2. Araç yaşı kontrolü - max_vehicle_age'den küçük veya eşit olmalı
      const ageOk = vehicleAge <= (pkg.max_vehicle_age || 999);
      if (!ageOk) return false;
      
      // 3. Kullanım tarzı kontrolü (Motosiklet için kontrol yapılmaz)
      if (isMotorcycle) {
        return true; // Motosiklet için tüm paketler geçerli
      }

      // Paket adı ve vehicle_type'ı normalize et (küçük harfe çevir)
      const pkgName = (pkg.name || '').toLowerCase();
      const pkgVehicleType = (pkg.vehicle_type || '').toLowerCase();
      const combinedText = `${pkgName} ${pkgVehicleType}`;

      // Paket adında kullanım tarzı belirtilmiş mi kontrol et
      const hasHususi = combinedText.includes('hususi');
      const hasTicari = combinedText.includes('ticari');
      const hasTaksi = combinedText.includes('taksi');
      const hasOtomobil = combinedText.includes('otomobil') || combinedText.includes('binek');
      
      // Kullanım tarzı belirtilmiş mi?
      const hasUsageTypeSpecified = hasHususi || hasTicari || hasTaksi;

      // Kullanım tarzına göre kontrol
      if (usageType === 'PRIVATE') {
        // Hususi için:
        // - Paket adında "Hususi", "Otomobil", "Binek" varsa -> Kabul et
        // - Paket adında kullanım tarzı belirtilmemişse (sadece araç tipi) -> Kabul et
        // - Paket adında "Ticari" veya "Taksi" varsa -> Reddet
        if (hasTicari || hasTaksi) {
          return false; // Ticari/Taksi paketleri Hususi için uygun değil
        }
        if (hasHususi || hasOtomobil) {
          return true; // Hususi/Otomobil paketleri uygun
        }
        // Kullanım tarzı belirtilmemişse, sadece araç tipi varsa kabul et
        return !hasUsageTypeSpecified;
      } 
      
      if (usageType === 'COMMERCIAL') {
        // Ticari için:
        // - Paket adında "Ticari" varsa -> Kabul et
        // - Paket adında kullanım tarzı belirtilmemişse (sadece araç tipi) -> Kabul et
        // - Paket adında "Hususi" varsa -> Reddet (ama Otomobil/Binek olabilir, çünkü onlar da ticari olabilir)
        if (hasTicari) {
          return true; // Ticari paketleri uygun
        }
        if (hasHususi && !hasOtomobil) {
          return false; // Sadece Hususi varsa (Otomobil değilse) reddet
        }
        // Kullanım tarzı belirtilmemişse, sadece araç tipi varsa kabul et
        return !hasUsageTypeSpecified;
      }
      
      if (usageType === 'TAXI') {
        // Taksi için: Paket adında "Taksi" veya "Ticari" olmalı
        return hasTaksi || hasTicari;
      }

      // Diğer durumlar için true döndür (güvenlik için)
      return true;
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

  // Eski fonksiyon - geriye dönük uyumluluk için
  const filterPackagesByVehicle = (modelYear: string, usageType: string) => {
    filterPackagesByVehicleAndType(modelYear, usageType);
  };

  // Model yılı değiştiğinde paketleri filtrele
  const handleModelYearChange = (year: string) => {
    setVehicleForm({ ...vehicleForm, model_year: year });
    if (selectedVehicleType) {
      filterPackagesByVehicleAndType(year, vehicleForm.usage_type);
    }
  };

  // Kullanım tarzı değiştiğinde paketleri filtrele
  const handleUsageTypeChange = (usageType: string) => {
    setVehicleForm({ ...vehicleForm, usage_type: usageType });
    if (selectedVehicleType && vehicleForm.model_year) {
      filterPackagesByVehicleAndType(vehicleForm.model_year, usageType);
    }
  };

  // KVKK Modal açma ve içerik çekme
  const handleOpenKvkkModal = async () => {
    setKvkkModalOpen(true);
    if (!kvkkContent) {
      setLoadingContent(true);
      try {
        const content = await contentService.getPageBySlug('kvkk');
        setKvkkContent(content.content || '');
      } catch (error) {
        console.error('KVKK içeriği yüklenirken hata:', error);
        toast.error('KVKK içeriği yüklenirken bir hata oluştu');
        setKvkkContent('İçerik yüklenemedi.');
      } finally {
        setLoadingContent(false);
      }
    }
  };

  // Mesafeli Satış Sözleşmesi Modal açma ve içerik çekme
  const handleOpenContractModal = async () => {
    setContractModalOpen(true);
    if (!contractContent) {
      setLoadingContent(true);
      try {
        const content = await contentService.getPageBySlug('distance-sales-contract');
        setContractContent(content.content || '');
      } catch (error) {
        console.error('Mesafeli Satış Sözleşmesi içeriği yüklenirken hata:', error);
        toast.error('Mesafeli Satış Sözleşmesi içeriği yüklenirken bir hata oluştu');
        setContractContent('İçerik yüklenemedi.');
      } finally {
        setLoadingContent(false);
      }
    }
  };

  // Ruhsat fotoğrafı yükleme
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen bir resim dosyası seçin!');
      return;
    }

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Ruhsat fotoğrafı 10MB\'dan büyük olamaz!');
      return;
    }

    setRegistrationPhoto(file);
    
    // Önizleme oluştur
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.onerror = () => {
      toast.error('Fotoğraf yüklenirken bir hata oluştu!');
    };
    reader.readAsDataURL(file);
  };

  // OCR ile bilgi çıkarma
  const handleOcrExtraction = async () => {
    if (!registrationPhoto || !carBrands.length) {
      toast.error('Ruhsat fotoğrafı ve marka listesi gerekli!');
      return;
    }

    setOcrLoading(true);
    setOcrProgress(0);

    try {
      // Progress simülasyonu (Tesseract.js kendi progress'ini döndürmez, bu yüzden simüle ediyoruz)
      const progressInterval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // OCR işlemi
      const ocrResult = await extractRegistrationInfo(registrationPhoto, carBrands, carModels);
      
      clearInterval(progressInterval);
      setOcrProgress(100);

      // Debug: OCR sonuçlarını logla
      console.log('OCR Sonuçları (Forma doldurulacak):', ocrResult);

      // Müşteri bilgilerini forma doldur
      const updatedCustomerForm: any = {};
      if (ocrResult.tc_vkn) {
        updatedCustomerForm.tc_vkn = ocrResult.tc_vkn;
        console.log('TC Kimlik dolduruluyor:', ocrResult.tc_vkn);
      }
      if (ocrResult.name) {
        updatedCustomerForm.name = ocrResult.name;
        console.log('Ad dolduruluyor:', ocrResult.name);
      }
      if (ocrResult.surname) {
        updatedCustomerForm.surname = ocrResult.surname;
        console.log('Soyad dolduruluyor:', ocrResult.surname);
      }
      if (ocrResult.address) {
        updatedCustomerForm.address = ocrResult.address;
        console.log('Adres dolduruluyor:', ocrResult.address);
      }
      if (ocrResult.city) {
        // İl değerini CITIES array'inde ara (case-insensitive)
        const cityMatch = CITIES.find(city => 
          city.toUpperCase() === ocrResult.city!.toUpperCase() ||
          city.toUpperCase().replace(/İ/g, 'I') === ocrResult.city!.toUpperCase().replace(/İ/g, 'I')
        );
        if (cityMatch) {
          updatedCustomerForm.city = cityMatch; // Tam eşleşmeyi kullan
          console.log('İl dolduruluyor:', cityMatch, '(OCR:', ocrResult.city, ')');
        } else {
          // Eşleşme bulunamadıysa yine de dene (belki Select kabul eder)
          updatedCustomerForm.city = ocrResult.city;
          console.log('İl dolduruluyor (eşleşme bulunamadı):', ocrResult.city);
        }
      }
      if (ocrResult.district) {
        updatedCustomerForm.district = ocrResult.district;
        console.log('İlçe dolduruluyor:', ocrResult.district);
      }
      
      if (Object.keys(updatedCustomerForm).length > 0) {
        setCustomerForm(prev => ({ ...prev, ...updatedCustomerForm }));
        console.log('Müşteri formu güncellendi:', updatedCustomerForm);
      }

      // Araç bilgilerini forma doldur
      const updatedVehicleForm: any = {};
      if (ocrResult.plate) {
        updatedVehicleForm.plate = ocrResult.plate.toUpperCase();
        console.log('Plaka dolduruluyor:', ocrResult.plate);
      }
      if (ocrResult.registration_serial) {
        updatedVehicleForm.registration_serial = ocrResult.registration_serial.toUpperCase();
        console.log('Ruhsat Seri dolduruluyor:', ocrResult.registration_serial);
      }
      if (ocrResult.registration_number) {
        updatedVehicleForm.registration_number = ocrResult.registration_number;
        console.log('Ruhsat No dolduruluyor:', ocrResult.registration_number);
      }
      if (ocrResult.brand_id) {
        updatedVehicleForm.brand_id = ocrResult.brand_id.toString();
        console.log('Marka ID dolduruluyor:', ocrResult.brand_id);
        // Marka seçildiğinde modelleri de yükle
        await handleBrandChange(ocrResult.brand_id.toString());
        if (ocrResult.model_id) {
          updatedVehicleForm.model_id = ocrResult.model_id.toString();
          console.log('Model ID dolduruluyor:', ocrResult.model_id);
        }
      }
      if (ocrResult.model_year) {
        updatedVehicleForm.model_year = ocrResult.model_year.toString();
        console.log('Model Yılı dolduruluyor:', ocrResult.model_year);
        // Paketleri filtrele
        const usageType = ocrResult.usage_type || vehicleForm.usage_type;
        filterPackagesByVehicle(ocrResult.model_year.toString(), usageType);
      }
      if (ocrResult.usage_type) {
        updatedVehicleForm.usage_type = ocrResult.usage_type;
        console.log('Kullanım Tipi dolduruluyor:', ocrResult.usage_type);
        // Paketleri filtrele
        const modelYear = ocrResult.model_year?.toString() || vehicleForm.model_year || '';
        if (modelYear) {
          filterPackagesByVehicle(modelYear, ocrResult.usage_type);
        }
      }
      
      if (Object.keys(updatedVehicleForm).length > 0) {
        setVehicleForm(prev => ({ ...prev, ...updatedVehicleForm }));
        console.log('Araç formu güncellendi:', updatedVehicleForm);
      }

      // Başarı mesajı
      const foundFields = [];
      if (ocrResult.tc_vkn) foundFields.push('TC Kimlik');
      if (ocrResult.name || ocrResult.surname) foundFields.push('Ad/Soyad');
      if (ocrResult.address) foundFields.push('Adres');
      if (ocrResult.plate) foundFields.push('Plaka');
      if (ocrResult.registration_serial || ocrResult.registration_number) foundFields.push('Ruhsat');
      if (ocrResult.brand_id) foundFields.push('Marka');
      if (ocrResult.model_id) foundFields.push('Model');
      if (ocrResult.model_year) foundFields.push('Model Yılı');

      if (foundFields.length > 0) {
        toast.success(`${foundFields.join(', ')} bilgileri otomatik dolduruldu. Lütfen kontrol edin.`);
      } else {
        toast.warning('Ruhsat fotoğrafından bilgi çıkarılamadı. Lütfen manuel girin.');
      }

      // Eşleşmeyen marka/model uyarısı
      if (ocrResult.brand_id && !ocrResult.model_id) {
        toast.info('Marka bulundu ancak model eşleşmedi. Lütfen modeli manuel seçin.');
      }

      // Başarılı OCR sonrası modal'ı kapat
      setOcrModalOpen(false);

    } catch (error: any) {
      console.error('OCR hatası:', error);
      toast.error(`OCR işlemi başarısız: ${error.message || 'Bilinmeyen hata'}`);
    } finally {
      setOcrLoading(false);
      setOcrProgress(0);
    }
  };

  // Araç tipi seçildiğinde marka/model listesini sıfırla ve paketleri filtrele
  const handleVehicleTypeChange = (vehicleType: string) => {
    setSelectedVehicleType(vehicleType);
    setUseManualBrandModel(false);
    setVehicleForm({
      ...vehicleForm,
      brand_id: '',
      model_id: '',
      brand_name: '',
      model_name: '',
    });
    setCarModels([]);
    setMotorModels([]);
    setSelectedPackage(null);
    setSaleForm({ ...saleForm, package_id: '', price: 0, commission: 0 });
    
    if (vehicleForm.model_year && vehicleForm.usage_type) {
      filterPackagesByVehicleAndType(vehicleForm.model_year, vehicleForm.usage_type, vehicleType);
    }
  };

  // Marka seçildiğinde modelleri getir (araç tipine göre motor veya car)
  const handleBrandChange = async (brandId: string) => {
    setUseManualBrandModel(false);
    setVehicleForm((prev) => ({
      ...prev,
      brand_id: brandId,
      model_id: '',
      brand_name: '',
      model_name: '',
    }));
    setModelSearchQuery('');
    if (brandId) {
      try {
        if (isMotorcycle || selectedVehicleType === 'Motosiklet') {
          const models = await motorModelService.getByBrandId(parseInt(brandId));
          setMotorModels(models);
          setCarModels([]);
        } else {
          const models = await carModelService.getByBrandId(parseInt(brandId));
          setCarModels(models);
          setMotorModels([]);
        }
      } catch (error) {
        console.error('Modeller yüklenirken hata:', error);
        setCarModels([]);
        setMotorModels([]);
      }
    } else {
      setCarModels([]);
      setMotorModels([]);
    }
  };

  // Paket seçildiğinde fiyat ve komisyon hesapla (bakiye ile ödemede komisyon 0)
  const handlePackageChange = (packageId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    setSelectedPackage(pkg || null);
    
    if (pkg) {
      const basePrice = Number(pkg.price) || 0;
      const commissionRate =
        user?.role === UserRole.BRANCH_ADMIN || user?.role === UserRole.BRANCH_USER
          ? Number(currentBranch?.commission_rate ?? currentAgency?.commission_rate) || 20
          : Number(currentAgency?.commission_rate) || 20;
      // KDV dahil paket fiyatı üzerinden komisyon (ör. 1000 TL × %30 = 300 TL)
      const commission =
        paymentMethod === PaymentType.BALANCE
          ? 0
          : (basePrice * commissionRate) / 100;
      
      setSaleForm({
        ...saleForm,
        package_id: packageId,
        price: basePrice,
        commission,
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

  // Bakiye ile ödemede: kullanılabilir bakiye (şube kullanıcısı = şube bakiyesi, acente = acente bakiyesi). null = henüz yüklenmedi.
  const isBalancePayment = paymentMethod === PaymentType.BALANCE;
  const availableBalanceForPayment: number | null = isBalancePayment
    ? (user?.branch_id
        ? (currentBranch != null ? Number(currentBranch.balance) || 0 : null)
        : (Number(currentAgency?.balance) || 0))
    : 0;
  // Bakiye yetersizse satışa izin verme (eksiye düşmek yok)
  const isBalanceInsufficient = isBalancePayment && saleForm.price > 0 && (availableBalanceForPayment === null || availableBalanceForPayment < saleForm.price);

  // Satışı tamamla - Transaction ile tek seferde işlenir
  // Hata olursa hiçbir kayıt oluşturulmaz (müşteri, araç dahil)
  const handleSubmit = async () => {
    const hasCatalogBrand = !!vehicleForm.brand_id && !!vehicleForm.model_id;
    const hasManualBrand =
      !!vehicleForm.brand_name?.trim() && !!vehicleForm.model_name?.trim();
    if (!hasCatalogBrand && !hasManualBrand) {
      toast.error('Araç marka ve model bilgisini seçin veya manuel girin');
      return;
    }

    // TC/VKN validasyonu
    if (customerForm.tc_vkn) {
      const isValid = customerForm.is_corporate 
        ? validateVKN(customerForm.tc_vkn)
        : validateTCKN(customerForm.tc_vkn);
      
      if (!isValid) {
        setTcVknError(
          customerForm.is_corporate 
            ? 'Geçersiz Vergi Kimlik Numarası!'
            : 'Geçersiz T.C. Kimlik Numarası!'
        );
        toast.error(
          customerForm.is_corporate 
            ? 'Geçersiz Vergi Kimlik Numarası! Lütfen doğru bir numara girin.'
            : 'Geçersiz T.C. Kimlik Numarası! Lütfen doğru bir numara girin.'
        );
        return;
      }
    }
    if (!agreements.kvkk || !agreements.contract) {
      alert('Lütfen sözleşmeleri onaylayın');
      return;
    }

    // Bakiye ile ödeme: bakiyesi yetmiyorsa satışı yaptırma (eksiye düşmek yok)
    if (paymentMethod === PaymentType.BALANCE) {
      const balance = user?.branch_id
        ? (currentBranch != null ? Number(currentBranch.balance) || 0 : null)
        : (Number(currentAgency?.balance) || 0);
      if (balance === null) {
        toast.error('Şube bakiyesi yükleniyor, lütfen bekleyin.');
        return;
      }
      if (balance < saleForm.price) {
        toast.error(`Yetersiz bakiye. Mevcut: ${formatCurrency(balance)}, Gerekli: ${formatCurrency(saleForm.price)}`);
        return;
      }
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
          vehicle_type: selectedVehicleType, // Araç tipi: Motosiklet, Otomobil, vs.
        is_foreign_plate: vehicleForm.is_foreign_plate,
        plate: vehicleForm.plate.toUpperCase(),
          registration_serial: vehicleForm.registration_serial.toUpperCase() || undefined,
          registration_number: vehicleForm.registration_number || undefined,
          // Katalog ID veya serbest marka/model adı
          ...(useManualBrandModel || (!vehicleForm.brand_id && vehicleForm.brand_name)
            ? {
                brand_name: vehicleForm.brand_name.trim(),
                model_name: vehicleForm.model_name.trim(),
              }
            : isMotorcycle
              ? {
                  motor_brand_id: parseInt(vehicleForm.brand_id),
                  motor_model_id: parseInt(vehicleForm.model_id),
                  brand_name: vehicleForm.brand_name || undefined,
                  model_name: vehicleForm.model_name || undefined,
                }
              : {
                  brand_id: parseInt(vehicleForm.brand_id),
                  model_id: parseInt(vehicleForm.model_id),
                  brand_name: vehicleForm.brand_name || undefined,
                  model_name: vehicleForm.model_name || undefined,
                }),
        model_year: parseInt(vehicleForm.model_year),
        usage_type: vehicleForm.usage_type,
        },
        // Satış bilgileri (bakiye ile ödemede komisyon her zaman 0)
        sale: {
        package_id: saleForm.package_id,
        start_date: saleForm.start_date,
        end_date: saleForm.end_date,
        price: saleForm.price,
        commission: paymentMethod === PaymentType.BALANCE ? 0 : saleForm.commission,
        },
        // Ödeme bilgileri
        payment: {
          type: paymentMethod,
          // PayTR için cardDetails gerekmez, iframe'de ödeme yapılacak
          cardDetails: undefined,
        },
        });

      // PayTR ödeme yöntemi seçildiyse token al ve iframe göster
      if (paymentMethod === PaymentType.PAYTR) {
        try {
          // PayTR için sale kaydedilmedi, sadece payment bilgileri döndü
          const tempMerchantOid = (sale as any).temp_merchant_oid || sale.id;
          
          // temp_merchant_oid'yi localStorage'a kaydet (PaymentSuccess sayfasında kullanmak için)
          localStorage.setItem('last_paytr_merchant_oid', tempMerchantOid);
          
          const tokenResult = await paymentService.getPaytrToken(tempMerchantOid, {
            merchant_ok_url: `${window.location.origin}/payment/success?merchant_oid=${tempMerchantOid}`,
            merchant_fail_url: `${window.location.origin}/payment/fail`,
          });
          setPaytrToken(tokenResult.token);
          setIsPaytrModalOpen(true);
        } catch (error: any) {
          console.error('PayTR token alma hatası:', error);
          toast.error('PayTR token alınamadı. Lütfen tekrar deneyin.');
        }
      } else {
        // Bakiye ödemesi için başarı modalini aç
      setSuccessModal({ open: true, saleId: sale.id });
      }
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Yeni Paket Satışı
          </h1>
          <p className="text-muted-foreground mt-1">
            Müşteri bilgilerini girerek yeni paket satışı yapın
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOcrModalOpen(true)}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          Ruhsat OCR
        </Button>
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
                onCheckedChange={(checked) => {
                  setCustomerForm({ 
                    ...customerForm, 
                    is_corporate: checked,
                    tc_vkn: '', // TC/VKN'i temizle
                    surname: checked ? '' : customerForm.surname,
                    tax_office: checked ? customerForm.tax_office : '',
                  });
                  setTcVknError(''); // Validasyon hatasını temizle
                }}
              />
            </div>

            {/* TC/VKN */}
            <div className="space-y-2">
              <Label className="text-sm">
                {customerForm.is_corporate ? 'Vergi Kimlik No' : 'T.C. Kimlik No'} <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    value={customerForm.tc_vkn}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Sadece rakam
                      const maxLength = customerForm.is_corporate ? 10 : 11;
                      const newValue = value.slice(0, maxLength);
                      
                      setCustomerForm({ ...customerForm, tc_vkn: newValue });
                      
                      // Validasyon kontrolü
                      if (newValue.length === maxLength) {
                        const isValid = customerForm.is_corporate 
                          ? validateVKN(newValue)
                          : validateTCKN(newValue);
                        
                        if (!isValid) {
                          setTcVknError(
                            customerForm.is_corporate 
                              ? 'Geçersiz Vergi Kimlik Numarası!'
                              : 'Geçersiz T.C. Kimlik Numarası!'
                          );
                        } else {
                          setTcVknError('');
                        }
                      } else {
                        setTcVknError('');
                      }
                    }}
                    placeholder={customerForm.is_corporate ? 'Vergi Kimlik Numarası (10 haneli)' : 'T.C. Kimlik Numarası (11 haneli)'}
                    maxLength={customerForm.is_corporate ? 10 : 11}
                    className={tcVknError ? 'border-red-500' : ''}
                  />
                  {tcVknError && (
                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {tcVknError}
                    </p>
                  )}
                </div>
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
                <Select
                  value={customerForm.district}
                  onValueChange={(value) => setCustomerForm({ ...customerForm, district: value })}
                  disabled={!customerForm.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={customerForm.city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {customerForm.city && getDistrictsByCity(customerForm.city).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            {/* Araç Tipi Seçimi - EN BAŞTA */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Araç Tipi <span className="text-red-500">*</span></Label>
              <Select
                value={selectedVehicleType}
                onValueChange={handleVehicleTypeChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Araç Tipi Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

            {/* Araç Marka / Model — katalog veya manuel */}
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm">Araç Marka / Model <span className="text-red-500">*</span></Label>
              <button
                type="button"
                className="text-xs text-primary underline-offset-2 hover:underline"
                onClick={() => {
                  setUseManualBrandModel((v) => !v);
                  if (!useManualBrandModel) {
                    setVehicleForm((prev) => ({ ...prev, brand_id: '', model_id: '' }));
                  } else {
                    setVehicleForm((prev) => ({ ...prev, brand_name: '', model_name: '' }));
                  }
                }}
                disabled={!selectedVehicleType}
              >
                {useManualBrandModel ? 'Katalogdan seç' : 'Listede yok (manuel)'}
              </button>
            </div>

            {useManualBrandModel ? (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Input
                    value={vehicleForm.brand_name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, brand_name: e.target.value })}
                    placeholder="Marka adı"
                    disabled={!selectedVehicleType}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    value={vehicleForm.model_name}
                    onChange={(e) => setVehicleForm({ ...vehicleForm, model_name: e.target.value })}
                    placeholder="Model adı"
                    disabled={!selectedVehicleType}
                  />
                </div>
              </div>
            ) : (
              <>
            <div className="space-y-2">
              <Select
                value={vehicleForm.brand_id}
                onValueChange={handleBrandChange}
                disabled={!selectedVehicleType}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedVehicleType ? "Marka Seçiniz" : "Önce Araç Tipi Seçiniz"} />
                </SelectTrigger>
                <SelectContent>
                  {isMotorcycle ? (
                    motorBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))
                  ) : (
                    carBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select
                value={vehicleForm.model_id}
                onValueChange={(value) => {
                  setVehicleForm({ ...vehicleForm, model_id: value });
                  setModelSearchQuery('');
                }}
                disabled={!vehicleForm.brand_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Önce Marka Seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  <div className="sticky top-0 z-10 bg-background p-2 border-b">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Model ara..."
                        value={modelSearchQuery}
                        onChange={(e) => setModelSearchQuery(e.target.value)}
                        className="pl-8"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {isMotorcycle ? (
                      // Motosiklet için motor modelleri
                      motorModels
                        .filter((model) =>
                          model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                        )
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </SelectItem>
                        ))
                    ) : (
                      // Diğer araç tipleri için car modelleri
                      carModels
                        .filter((model) =>
                          model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                        )
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </SelectItem>
                        ))
                    )}
                    {((isMotorcycle && motorModels.length === 0) || (!isMotorcycle && carModels.length === 0)) && (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Model bulunamadı
                      </div>
                    )}
                  </div>
                </SelectContent>
              </Select>
            </div>
              </>
            )}

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
                  min={todayYmdIstanbul()}
                  value={saleForm.start_date}
                  onChange={(e) => {
                    const start = e.target.value;
                    const today = todayYmdIstanbul();
                    if (start && start < today) {
                      toast.warning('Başlangıç tarihi bugünden önce olamaz');
                      return;
                    }
                    setSaleForm({
                      ...saleForm,
                      start_date: start,
                      end_date: start ? addYearsYmd(start, 1) : saleForm.end_date,
                    });
                  }}
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
                disabled={!selectedVehicleType || !vehicleForm.model_year || filteredPackages.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedVehicleType 
                      ? "Önce araç tipi seçin" 
                      : !vehicleForm.model_year 
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
                    <span className="font-semibold">
                      {paymentMethod === PaymentType.BALANCE
                        ? '₺0,00 (bakiye ile ödemede komisyon kesilmez)'
                        : formatCurrency(saleForm.commission)}
                    </span>
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
                  onClick={() => setPaymentMethod(PaymentType.PAYTR)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    paymentMethod === PaymentType.PAYTR
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CreditCard className="h-6 w-6" />
                    {paymentMethod === PaymentType.PAYTR && (
                      <CheckCircle className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-left">Kredi Kartı (PayTR)</p>
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

            {/* Bakiye ile ödeme: mevcut bakiye + komisyon kesilmez bilgisi */}
            {/* Şube kullanıcısı (branch_id varsa) sadece şube bakiyesini görür; acente bakiyesi gösterilmez. */}
            {paymentMethod === PaymentType.BALANCE && (
              <div className="space-y-2 p-3 bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 rounded-lg">
                <p className="text-sm font-medium text-violet-800 dark:text-violet-200">
                  Bakiye ile ödemede komisyon kesilmez.
                </p>
                <p className="text-sm text-violet-700 dark:text-violet-300">
                  {user?.branch_id
                    ? (currentBranch
                        ? <>Mevcut şube bakiyesi: <span className="font-semibold">{formatCurrency(Number(currentBranch.balance) || 0)}</span></>
                        : <>Şube bakiyesi yükleniyor...</>)
                    : <>Mevcut bakiye: <span className="font-semibold">{formatCurrency(Number(currentAgency?.balance) || 0)}</span></>}
                </p>
                {selectedPackage && saleForm.price > 0 && (
                  <p className="text-xs text-violet-600 dark:text-violet-400">
                    Bu satış tutarı ({formatCurrency(saleForm.price)}) {currentBranch || user?.branch_id ? 'şube ' : ''}bakiyenizden düşülecektir.
                  </p>
                )}
                {/* Bakiye yetersizse kutu içinde uyarı göster */}
                {isBalanceInsufficient && (
                  <p className="text-sm font-medium text-destructive mt-2 pt-2 border-t border-violet-200 dark:border-violet-800">
                    {availableBalanceForPayment === null
                      ? '⚠️ Şube bakiyesi yükleniyor. Lütfen bekleyin veya PayTR ile ödeme yapın.'
                      : `⚠️ Bakiye yetersiz. Bu satış tutarı (${formatCurrency(saleForm.price)}) bakiyenizden (${formatCurrency(availableBalanceForPayment)}) fazla. Satışı tamamlayamazsınız.`}
                  </p>
                )}
              </div>
            )}

            {/* PayTR Bilgilendirme */}
            {paymentMethod === PaymentType.PAYTR && (
              <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  PayTR güvenli ödeme sayfası üzerinden ödeme yapılacaktır. Satış oluşturulduktan sonra ödeme formu açılacaktır.
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
                  <span 
                    className="text-primary underline hover:text-primary/80 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenKvkkModal();
                    }}
                  >
                    KVKK Bilgilendirme Metni
                  </span>
                  'ni okudum onaylıyorum.
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
                  <span 
                    className="text-primary underline hover:text-primary/80 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenContractModal();
                    }}
                  >
                    Mesafeli Satış Sözleşmesi
                  </span>
                  'ni okudum onaylıyorum.
                </span>
              </label>
            </div>

            {/* Submit Button - Bakiye yetersizse devre dışı (eksiye düşmek yok) */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !agreements.kvkk || !agreements.contract || !saleForm.package_id || isBalanceInsufficient}
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
            {isBalanceInsufficient && (
              <p className="text-sm text-destructive text-center mt-2">
                Bakiye yetersiz. Bu paketi almak için bakiyeniz yetmiyor (eksiye düşülemez).
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* OCR Modal */}
      <Dialog open={ocrModalOpen} onOpenChange={setOcrModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Ruhsat Fotoğrafı Yükle ve OCR Yap</DialogTitle>
            <DialogDescription>
              Ruhsat fotoğrafını yükleyin, OCR ile bilgileri otomatik olarak doldurun.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {photoPreview ? (
              <div className="relative">
                <div className="border rounded-lg p-4">
                  <img 
                    src={photoPreview} 
                    alt="Ruhsat önizleme" 
                    className="w-full h-64 object-contain rounded border bg-muted"
                  />
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setRegistrationPhoto(null);
                        setPhotoPreview(null);
                      }}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Kaldır
                    </Button>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleOcrExtraction}
                      disabled={ocrLoading || !registrationPhoto}
                      className="flex-1"
                    >
                      {ocrLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          OCR İşleniyor...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4 mr-2" />
                          OCR ile Doldur
                        </>
                      )}
                    </Button>
                  </div>
                  {ocrLoading && (
                    <div className="mt-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Ruhsat fotoğrafı analiz ediliyor... {Math.round(ocrProgress)}%
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <Label htmlFor="registration-photo-modal" className="cursor-pointer">
                  <Button type="button" variant="outline" size="lg" asChild>
                    <span>
                      <Upload className="h-5 w-5 mr-2" />
                      Ruhsat Fotoğrafı Yükle
                    </span>
                  </Button>
                </Label>
                <Input
                  id="registration-photo-modal"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-4">
                  PNG, JPG veya JPEG formatında ruhsat fotoğrafı yükleyin (Max 10MB)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Fotoğraf net ve okunabilir olmalıdır
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* KVKK Bilgilendirme Metni Modal */}
      <Dialog open={kvkkModalOpen} onOpenChange={setKvkkModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">KVKK Bilgilendirme Metni</DialogTitle>
            <DialogDescription>
              Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme metni
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">İçerik yükleniyor...</span>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: kvkkContent }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Mesafeli Satış Sözleşmesi Modal */}
      <Dialog open={contractModalOpen} onOpenChange={setContractModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Mesafeli Satış Sözleşmesi</DialogTitle>
            <DialogDescription>
              Mesafeli satış sözleşmesi ve tüketici hakları
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {loadingContent ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">İçerik yükleniyor...</span>
              </div>
            ) : (
              <div 
                className="prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: contractContent }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Basari Modali */}
      <Dialog open={successModal.open} onOpenChange={(open) => !open && navigate('/dashboard/sales')}>
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
              onClick={() => navigate('/dashboard/sales')}
            >
              Satislara Git
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* PayTR Iframe Modal */}
      <Dialog open={isPaytrModalOpen} onOpenChange={setIsPaytrModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              PayTR Güvenli Ödeme
            </DialogTitle>
            <DialogDescription>
              Kart bilgilerinizi PayTR güvenli ödeme sayfasında girin
            </DialogDescription>
          </DialogHeader>
          
          {paytrToken && (
            <PaytrIframe
              token={paytrToken}
              containerId="paytr-iframe-container-newsale"
              onError={(error) => {
                toast.error(error.message || 'Ödeme formu yüklenirken bir hata oluştu');
              }}
              onLoad={() => {
                console.log('PayTR iframe yüklendi');
              }}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsPaytrModalOpen(false);
              setPaytrToken(null);
              navigate('/dashboard/sales');
            }}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
