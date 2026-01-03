import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  publicService, 
  type PublicPackage,
  type CarBrand,
  type CarModel,
  type MotorBrand,
  type MotorModel,
} from '@/services/publicService';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { userCustomerService } from '@/services/userCustomerService';
import PaytrIframe from '@/components/payment/PaytrIframe';
import { 
  ArrowRight, 
  ArrowLeft,
  User,
  Car, 
  Bike,
  CreditCard,
  Check,
  Shield,
  Loader2,
  Phone,
  Menu,
  X,
  LogIn,
  UserPlus
} from 'lucide-react';

/**
 * Kullanıcı Satın Alma Sayfası
 * Dark mode'dan etkilenmeyen, responsive tasarım
 * Adım adım: Araç Bilgileri -> Ödeme (Giriş yapmış kullanıcılar için)
 * Kullanıcılar önce kayıt olup giriş yapmak zorunda
 */
export default function Purchase() {
  const { packageId } = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const { userCustomer, isAuthenticated, loading: authLoading } = useUserCustomer();

  // States - Giriş yapmış kullanıcılar için 2 adım: Araç -> Ödeme
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Paket bilgisi
  const [pkg, setPkg] = useState<PublicPackage | null>(null);

  // Marka/Model
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [motorBrands, setMotorBrands] = useState<MotorBrand[]>([]);
  const [motorModels, setMotorModels] = useState<MotorModel[]>([]);

  const [vehicle, setVehicle] = useState({
    plate: '',
    brand_id: '',
    model_id: '',
    model_year: new Date().getFullYear().toString(),
    usage_type: 'PRIVATE',
    is_foreign_plate: false,
  });

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paytrToken, setPaytrToken] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(false);

  // Paket ve marka/model bilgilerini yükle
  useEffect(() => {
    const fetchData = async () => {
      if (!packageId) {
        navigate('/packages');
        return;
      }

      try {
        setLoading(true);
        const [packageData, carBrandsData, motorBrandsData] = await Promise.all([
          publicService.getPackageById(packageId),
          publicService.getCarBrands(),
          publicService.getMotorBrands(),
        ]);

        setPkg(packageData);
        setCarBrands(carBrandsData);
        setMotorBrands(motorBrandsData);
      } catch (error) {
        console.error('Veri yüklenirken hata:', error);
        toast.error('Paket bilgisi yüklenemedi');
        navigate('/packages');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [packageId, navigate]);

  // Marka değiştiğinde modelleri yükle
  const handleBrandChange = async (brandId: string) => {
    setVehicle({ ...vehicle, brand_id: brandId, model_id: '' });

    if (!brandId) return;

    try {
      const isMotorcycle = pkg?.vehicle_type === 'Motosiklet';
      const models = isMotorcycle
        ? await publicService.getMotorModels(parseInt(brandId))
        : await publicService.getCarModels(parseInt(brandId));

      if (isMotorcycle) {
        setMotorModels(models as MotorModel[]);
      } else {
        setCarModels(models as CarModel[]);
      }
    } catch (error) {
      console.error('Modeller yüklenirken hata:', error);
    }
  };

  // Form validasyonu - Artık sadece 2 adım: Araç -> Ödeme
  const validateStep = (currentStep: number): boolean => {
    // Adım 1: Araç Bilgileri
    if (currentStep === 1) {
      if (!vehicle.plate || !vehicle.brand_id || !vehicle.model_id || !vehicle.model_year) {
        toast.error('Lütfen tüm araç bilgilerini doldurun');
        return false;
      }
      // Araç yaşı kontrolü
      const vehicleAge = new Date().getFullYear() - parseInt(vehicle.model_year);
      if (pkg && vehicleAge > pkg.max_vehicle_age) {
        toast.error(`Bu paket için araç yaşı maksimum ${pkg.max_vehicle_age} olmalıdır`);
        return false;
      }
      return true;
    }

    // Adım 2: Ödeme Bilgileri (PayTR iframe gösterilecek)
    if (currentStep === 2) {
      if (!termsAccepted) {
        toast.error('Mesafeli satış sözleşmesini onaylamanız gerekmektedir');
        return false;
      }
      return true;
    }

    return true;
  };

  // İleri git - Step 1'den Step 2'ye geçerken ödeme başlat
  const handleNext = async () => {
    if (step === 1 && validateStep(step)) {
      // Step 2'ye geçmeden önce PayTR token al
      await handleInitiatePayment();
    } else if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  // Geri git
  const handleBack = () => {
    setStep(step - 1);
  };

  // PayTR token alma ve iframe gösterme
  const handleInitiatePayment = async () => {
    if (!validateStep(1) || !pkg || !userCustomer) return;

    setSubmitting(true);
    setIframeLoading(true);

    try {
      const isMotorcycle = pkg.vehicle_type === 'Motosiklet';

      // UserCustomer için satın alma verisi (PayTR token almak için)
      const purchaseData = {
        package_id: pkg.id,
        vehicle: {
          plate: vehicle.plate.toUpperCase().replace(/\s/g, ''),
          brand_id: isMotorcycle ? undefined : parseInt(vehicle.brand_id),
          model_id: isMotorcycle ? undefined : parseInt(vehicle.model_id),
          motor_brand_id: isMotorcycle ? parseInt(vehicle.brand_id) : undefined,
          motor_model_id: isMotorcycle ? parseInt(vehicle.model_id) : undefined,
          model_year: parseInt(vehicle.model_year),
          usage_type: vehicle.usage_type,
          vehicle_type: pkg.vehicle_type,
          is_foreign_plate: vehicle.is_foreign_plate,
        },
        terms_accepted: termsAccepted,
        merchant_ok_url: `${window.location.origin}/payment/success`,
        merchant_fail_url: `${window.location.origin}/payment/fail`,
      };

      // UserCustomer servisi üzerinden PayTR token al
      const result = await userCustomerService.purchase(purchaseData);
      
      if (result.token) {
        setPaytrToken(result.token);
        setStep(2); // Ödeme adımına geç
        toast.success('Ödeme formu hazırlanıyor...');
      } else {
        throw new Error('PayTR token alınamadı');
      }
    } catch (error: any) {
      console.error('Token alma hatası:', error);
      toast.error(error.response?.data?.message || 'Ödeme başlatılamadı');
    } finally {
      setSubmitting(false);
      setIframeLoading(false);
    }
  };

  // Model yılları (son 50 yıl)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Loading
  if (loading || authLoading) {
    return (
      <div className="light min-h-screen bg-gray-50 flex items-center justify-center" style={{ colorScheme: 'light' }}>
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#019242] mx-auto mb-4" />
          <span className="text-gray-500">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa login/register sayfasına yönlendir
  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Giriş Yapın | Çözüm Asistan</title>
        </Helmet>

        <div className="light min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
          <Card className="max-w-lg w-full border-gray-200 bg-white shadow-xl">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-8 w-8 sm:h-10 sm:w-10 text-[#019242]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Giriş Yapın</h1>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Satın alma yapabilmek için önce hesabınıza giriş yapmanız gerekmektedir.
              </p>

              {/* Paket Bilgisi */}
              {pkg && (
                <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{pkg.description}</p>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#019242] text-white">{pkg.vehicle_type}</Badge>
                    <span className="text-xs text-gray-500">Maks. Araç Yaşı: {pkg.max_vehicle_age} yıl</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Link to="/login">
                  <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-full h-12">
                    <LogIn className="h-4 w-4 mr-2" />
                    Giriş Yap
                  </Button>
                </Link>
                <Link to="/user-register">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full h-12">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Üye Ol
                  </Button>
                </Link>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                Hesabınız yoksa üye olarak satın alma işleminize devam edebilirsiniz.
              </p>

              <Link to="/packages" className="inline-flex items-center gap-2 text-sm text-[#019242] hover:underline mt-4">
                <ArrowLeft className="h-4 w-4" />
                Paketlere Dön
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Not: PayTR iFrame kullanıldığı için ödeme sonrası merchant_ok_url'e yönlendiriliyor
  // Success ekranı ayrı bir route'da (/payment/success) gösteriliyor

  // Marka/Model listesi (araç türüne göre)
  const isMotorcycle = pkg?.vehicle_type === 'Motosiklet';
  const brands = isMotorcycle ? motorBrands : carBrands;
  const models = isMotorcycle ? motorModels : carModels;

  return (
    <>
      <Helmet>
        <title>Satın Al - {pkg?.name} | Çözüm Asistan</title>
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page min-h-screen bg-gray-50 text-gray-900" style={{ colorScheme: 'light' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#019242] text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <img src="/cozumasistanlog.svg" alt="Logo" className="h-5 sm:h-6" />
              </div>
              <span className="font-bold text-sm sm:text-base hidden sm:block">Çözüm Asistan</span>
            </Link>
            
            {/* Desktop Contact & User Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-200" />
                <span className="text-blue-100 text-sm">+90 (850) 304 54 40</span>
              </div>
              {/* Giriş yapmış kullanıcı için dashboard linki */}
              {isAuthenticated && userCustomer && (
                <Link to="/user/dashboard">
                  <Button variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <User className="h-4 w-4 mr-2" />
                    {userCustomer.name}
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-[#017A35] px-4 py-4">
              <nav className="flex flex-col gap-2">
                <Link 
                  to="/" 
                  className="text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
                <Link 
                  to="/packages" 
                  className="text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Paketler
                </Link>
                <a 
                  href="tel:4446250" 
                  className="flex items-center gap-2 text-white/90 hover:text-white py-2 px-3 rounded-lg hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Phone className="h-4 w-4" />
                  +90 (850) 304 54 40
                </a>
              </nav>
            </div>
          )}
        </header>

        <div className="container mx-auto px-4 py-6 sm:py-8">
          {/* Back link */}
          <Link to="/packages" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" />
            Paketlere Dön
          </Link>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Sol: Form */}
            <div className="lg:col-span-2">
              {/* Hoş Geldin Mesajı - Giriş yapmış kullanıcı için */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                    <Check className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Hoş geldiniz, {userCustomer?.name} {userCustomer?.surname}!</p>
                    <p className="text-sm text-gray-500">Satın alma işleminize devam edebilirsiniz.</p>
                  </div>
                </div>
              </div>

              {/* Progress Steps - Artık sadece 2 adım */}
              <div className="flex items-center justify-between mb-6 sm:mb-8">
                {[
                  { num: 1, label: 'Araç', fullLabel: 'Araç Bilgileri', icon: isMotorcycle ? Bike : Car },
                  { num: 2, label: 'Ödeme', fullLabel: 'Ödeme', icon: CreditCard },
                ].map((s, index) => (
                  <div key={s.num} className="flex items-center flex-1">
                    <div className={`flex items-center gap-2 sm:gap-3 ${step >= s.num ? 'text-gray-900' : 'text-gray-400'}`}>
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        step > s.num 
                          ? 'bg-emerald-500 text-white' 
                          : step === s.num 
                            ? 'bg-[#019242] text-white' 
                            : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step > s.num ? <Check className="h-4 w-4 sm:h-5 sm:w-5" /> : <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </div>
                      <span className="font-medium text-xs sm:text-sm hidden sm:block">{s.fullLabel}</span>
                      <span className="font-medium text-xs sm:hidden">{s.label}</span>
                    </div>
                    {index < 1 && (
                      <div className={`flex-1 h-0.5 sm:h-1 mx-2 sm:mx-4 rounded ${step > s.num ? 'bg-emerald-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Araç Bilgileri */}
              {step === 1 && (
                <Card className="bg-white border-gray-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                      {isMotorcycle ? <Bike className="h-4 w-4 sm:h-5 sm:w-5" /> : <Car className="h-4 w-4 sm:h-5 sm:w-5" />}
                      Araç Bilgileri
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">
                      {pkg?.vehicle_type} bilgilerinizi girin
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="plate" className="text-gray-700 text-sm">Plaka *</Label>
                      <Input
                        id="plate"
                        value={vehicle.plate}
                        onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value.toUpperCase() })}
                        placeholder="34 ABC 123"
                        className="bg-white border-gray-200 text-gray-900 h-10 sm:h-11"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-gray-700 text-sm">Marka *</Label>
                        <Select value={vehicle.brand_id} onValueChange={handleBrandChange}>
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-10 sm:h-11">
                            <SelectValue placeholder="Marka seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-gray-700 text-sm">Model *</Label>
                        <Select 
                          value={vehicle.model_id} 
                          onValueChange={(val) => setVehicle({ ...vehicle, model_id: val })}
                          disabled={!vehicle.brand_id}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-10 sm:h-11">
                            <SelectValue placeholder="Model seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {models.map((model) => (
                              <SelectItem key={model.id} value={model.id.toString()}>
                                {model.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-gray-700 text-sm">Model Yılı *</Label>
                        <Select 
                          value={vehicle.model_year} 
                          onValueChange={(val) => setVehicle({ ...vehicle, model_year: val })}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-10 sm:h-11">
                            <SelectValue placeholder="Yıl seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            {years.map((year) => (
                              <SelectItem key={year} value={year.toString()}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5 sm:space-y-2">
                        <Label className="text-gray-700 text-sm">Kullanım Tipi</Label>
                        <Select 
                          value={vehicle.usage_type} 
                          onValueChange={(val) => setVehicle({ ...vehicle, usage_type: val })}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-10 sm:h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="PRIVATE">Hususi</SelectItem>
                            <SelectItem value="COMMERCIAL">Ticari</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="foreign_plate"
                        checked={vehicle.is_foreign_plate}
                        onCheckedChange={(checked) => setVehicle({ ...vehicle, is_foreign_plate: checked as boolean })}
                      />
                      <Label htmlFor="foreign_plate" className="text-sm cursor-pointer text-gray-700">
                        Yabancı plaka
                      </Label>
                    </div>

                    {/* Sözleşme onayı */}
                    <div className="border rounded-lg p-3 sm:p-4 bg-gray-50 mt-4 sm:mt-6">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="terms"
                          checked={termsAccepted}
                          onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                        />
                        <Label htmlFor="terms" className="text-xs sm:text-sm cursor-pointer leading-relaxed text-gray-700">
                          <Link to="/distance-sales-contract" target="_blank" className="text-[#019242] hover:underline">
                            Mesafeli Satış Sözleşmesi
                          </Link>
                          'ni okudum ve kabul ediyorum. *
                        </Label>
                      </div>
                    </div>

                    <div className="flex justify-end pt-3 sm:pt-4">
                      <Button 
                        onClick={handleNext} 
                        disabled={submitting || iframeLoading}
                        className="bg-[#019242] hover:bg-[#017A35] text-white rounded-full px-6 text-sm sm:text-base"
                      >
                        {submitting || iframeLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Hazırlanıyor...
                          </>
                        ) : (
                          <>
                            Devam Et
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Ödeme (PayTR iframe) */}
              {step === 2 && paytrToken && (
                <Card className="bg-white border-gray-200">
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="flex items-center gap-2 text-gray-900 text-base sm:text-lg">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                      Güvenli Ödeme
                    </CardTitle>
                    <CardDescription className="text-gray-500 text-sm">Kart bilgilerinizi PayTR güvenli ödeme sayfasında girin</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
                    {/* PayTR iframe */}
                    <PaytrIframe
                      token={paytrToken}
                      containerId="paytr-iframe-container"
                      onLoading={setIframeLoading}
                      onError={(error) => {
                        toast.error(error.message || 'Ödeme formu yüklenirken bir hata oluştu');
                      }}
                      onLoad={() => {
                        toast.success('Ödeme formu hazır');
                      }}
                    />

                    {/* Güvenlik bildirimi */}
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                      <Shield className="h-4 w-4 text-emerald-600" />
                      <span>Ödeme bilgileriniz PayTR tarafından 256-bit SSL ile şifrelenmektedir.</span>
                    </div>

                    <div className="flex justify-start pt-3 sm:pt-4">
                      <Button variant="outline" onClick={handleBack} className="border-gray-200 text-gray-700 hover:bg-gray-50 rounded-full text-sm sm:text-base">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Geri
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sağ: Paket Özeti */}
            <div className="order-first lg:order-last">
              <Card className="sticky top-20 lg:top-24 border-gray-200 bg-white">
                <CardHeader className="bg-[#019242] text-white rounded-t-lg p-4 sm:p-6">
                  <CardTitle className="text-base sm:text-lg">Sipariş Özeti</CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {pkg && (
                    <>
                      <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900">{pkg.name}</h3>
                      <Badge className="mb-3 sm:mb-4 bg-gray-100 text-gray-700">{pkg.vehicle_type}</Badge>

                      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <h4 className="font-medium text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">Paket İçeriği</h4>
                        <ul className="space-y-1.5 sm:space-y-2">
                          {pkg.covers.slice(0, 4).map((cover) => (
                            <li key={cover.id} className="flex items-start gap-2 text-xs sm:text-sm">
                              <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span className="text-gray-700">{cover.title}</span>
                            </li>
                          ))}
                          {pkg.covers.length > 4 && (
                            <li className="text-xs sm:text-sm text-gray-500 pl-5 sm:pl-6">
                              +{pkg.covers.length - 4} daha fazla
                            </li>
                          )}
                        </ul>
                      </div>

                      {/* Fiyat - Giriş yapmış kullanıcılar için göster */}
                      {isAuthenticated && pkg.price && (
                        <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 pb-3 sm:pb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-600">Toplam Tutar</span>
                            <span className="text-xl sm:text-2xl font-bold text-[#019242]">
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                minimumFractionDigits: 2
                              }).format(Number(pkg.price))}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Geçerlilik</span>
                          <span className="font-medium text-gray-900">1 Yıl</span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600">Max Araç Yaşı</span>
                          <span className="font-medium text-gray-900">{pkg.max_vehicle_age} yıl</span>
                        </div>
                      </div>

                      <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xs sm:text-sm font-medium">7/24 Yol Yardım Güvencesi</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
