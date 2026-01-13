import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { publicService, type DealerApplicationRequest } from '@/services/publicService';
// Şehir ve ilçe verilerini import et
import cityData from '@/data/city.json';
import { 
  ArrowRight, 
  Store,
  User,
  MapPin,
  Lock,
  CheckCircle,
  Loader2,
  Shield,
  Users,
  TrendingUp,
  Phone,
  Mail,
  Menu,
  X,
  Check,
  Building2
} from 'lucide-react';

// Türkiye İlleri - city.json'dan al
const CITIES = cityData.map((city) => city.il);

// Seçilen ile göre ilçeleri getiren fonksiyon
const getDistrictsByCity = (cityName: string): string[] => {
  const city = cityData.find((c) => c.il === cityName);
  return city ? city.ilceleri : [];
};

/**
 * Bayilik Başvuru Sayfası
 * Split-screen tasarım: Sol taraf bilgi, sağ taraf form
 * Çapraz geçişli modern tasarım
 */
export default function DealerApplication() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Form data
  const [formData, setFormData] = useState<DealerApplicationRequest>({
    name: '',
    surname: '',
    email: '',
    phone: '',
    tc_vkn: '',
    company_name: '',
    city: '',
    district: '',
    address: '',
    referral_code: '',
    password: '',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Validasyon
  const validate = (): boolean => {
    if (!formData.name || !formData.surname) {
      toast.error('Ad ve soyad zorunludur');
      return false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Geçerli bir e-posta adresi girin');
      return false;
    }

    if (!formData.phone) {
      toast.error('Telefon numarası zorunludur');
      return false;
    }

    if (!formData.tc_vkn || formData.tc_vkn.length < 10) {
      toast.error('Geçerli bir T.C. Kimlik veya Vergi No girin');
      return false;
    }

    if (!formData.city) {
      toast.error('Şehir zorunludur');
      return false;
    }

    if (!formData.password || formData.password.length < 8) {
      toast.error('Şifre en az 8 karakter olmalıdır');
      return false;
    }

    if (formData.password !== confirmPassword) {
      toast.error('Şifreler eşleşmiyor');
      return false;
    }

    if (!termsAccepted) {
      toast.error('Kullanım koşullarını kabul etmelisiniz');
      return false;
    }

    return true;
  };

  // Form gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await publicService.createDealerApplication(formData);
      setSuccess(true);
      toast.success('Başvurunuz başarıyla alındı!');
    } catch (error: any) {
      console.error('Başvuru hatası:', error);
      toast.error(error.response?.data?.message || 'Başvuru gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Başarılı başvuru
  if (success) {
    return (
      <>
        <Helmet>
          <title>Başvurunuz Alındı | Çözüm Net A.Ş</title>
        </Helmet>

        <div className="light public-page min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-white flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
          <Card className="max-w-lg w-full border-emerald-200 bg-white">
            <CardContent className="p-6 sm:p-8 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Başvurunuz Alındı!</h1>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                Bayilik başvurunuz başarıyla alındı. Ekibimiz başvurunuzu inceleyecek ve en kısa sürede size dönüş yapacaktır.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 text-left">
                <h3 className="font-semibold mb-3 sm:mb-4 text-gray-800 text-sm sm:text-base">Sonraki Adımlar</h3>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1 rounded-full bg-emerald-500 flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">Başvurunuz inceleme sürecine alındı</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1 rounded-full bg-gray-300 flex-shrink-0 mt-0.5">
                      <span className="block h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">Ekibimiz başvurunuzu değerlendirecek</span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1 rounded-full bg-gray-300 flex-shrink-0 mt-0.5">
                      <span className="block h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    </div>
                    <span className="text-xs sm:text-sm text-gray-600">Onay sonrası hesap bilgileriniz e-posta ile iletilecek</span>
                  </li>
                </ul>
              </div>

              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                Başvurunuz hakkında sorularınız için{' '}
                <a href="tel:08503053094" className="text-[#019242] hover:underline">+90 (850) 305 30 94</a>
                {' '}numaralı telefondan bize ulaşabilirsiniz.
              </p>

              <Link to="/">
                <Button className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-full">
                  Ana Sayfaya Dön
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Bayilik Başvurusu | Çözüm Net A.Ş</title>
        <meta name="description" content="Çözüm Net A.Ş. bayilik ağına katılın. Yol yardım hizmetleri sektöründe yerinizi alın." />
      </Helmet>

      {/* Dark mode'dan korumalı wrapper */}
      <div className="light public-page min-h-screen bg-white text-gray-900" style={{ colorScheme: 'light' }}>
          
        {/* Mobile Header - Sadece mobilde görünür */}
        <header className="lg:hidden sticky top-0 z-50 bg-[#019242] text-white shadow-lg">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                <img src="/cozumasistanlog.svg" alt="Logo" className="h-5" />
              </div>
              <span className="font-bold text-sm">Çözüm Net A.Ş</span>
            </Link>
            
            <button 
              className="p-2 text-white hover:bg-white/10 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menü"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="bg-[#017A35] px-4 py-4">
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
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full bg-white text-[#019242] hover:bg-gray-100 rounded-full mt-2">
                    Giriş Yap
                  </Button>
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Ana İçerik - Split Screen Layout */}
        <div className="flex flex-col lg:flex-row min-h-screen lg:min-h-screen">
          
          {/* Sol Panel - Bilgi Bölümü (Sabit, scroll yok) */}
          <div className="lg:w-1/2 xl:w-[45%] bg-[#019242] text-white relative overflow-hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen">
            {/* Çapraz Kesim - Sadece büyük ekranlarda */}
            <div className="hidden lg:block absolute top-0 right-0 w-24 h-full bg-gray-50 -mr-1" 
                 style={{ 
                   clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
                 }} 
            />
            
            {/* Dekoratif Daireler */}
            <div className="absolute top-10 -left-16 w-48 h-48 bg-white/5 rounded-full" />
            <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full" />
            <div className="absolute top-1/3 left-1/3 w-16 h-16 bg-white/5 rounded-full" />

            {/* İçerik - Scroll yok */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12 h-full flex flex-col overflow-hidden">
              
              {/* Desktop Header - Sol panel içinde */}
              <div className="hidden lg:flex items-center justify-between mb-12">
                <Link to="/" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <img src="/cozumasistanlog.svg" alt="Logo" className="h-7" />
                  </div>
                  <span className="font-bold text-xl">Çözüm Net A.Ş</span>
                </Link>
                <div className="flex items-center gap-4">
                  <Link to="/packages" className="text-blue-100 hover:text-white text-sm font-medium transition-colors">
                    Paketler
                  </Link>
                  <Link to="/login">
                    <Button size="sm" className="bg-white text-[#019242] hover:bg-gray-100 rounded-full">
                      Giriş Yap
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Ana Başlık */}
              <div className="flex-1 flex flex-col justify-center py-6 lg:py-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-white/10">
                    <Store className="h-7 w-7 lg:h-8 lg:w-8" />
                  </div>
                </div>
                
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black mb-3 lg:mb-4 leading-tight">
                  Bayilik<br />Başvurusu
                </h1>
                
                <p className="text-base lg:text-lg text-blue-100 mb-6 lg:mb-8 max-w-md">
                  Yol yardım hizmetleri sektöründe yerinizi alın. Çözüm Net A.Ş. bayilik ağına katılın.
                </p>

                {/* Avantajlar - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6 lg:mb-8">
                  {[
                    { icon: TrendingUp, title: 'Yüksek Komisyon', desc: 'Cazip oranlar', color: 'text-emerald-400' },
                    { icon: Users, title: 'Geniş Ağ', desc: 'Binlerce müşteri', color: 'text-blue-300' },
                    { icon: Shield, title: '7/24 Destek', desc: 'Her an yanınızda', color: 'text-purple-300' },
                    { icon: Building2, title: 'Marka Gücü', desc: 'Güvenilir partner', color: 'text-amber-300' },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start gap-2.5 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="p-1.5 rounded-md bg-white/10">
                        <item.icon className={`h-4 w-4 ${item.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{item.title}</h3>
                        <p className="text-xs text-blue-200">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* İletişim Bilgileri */}
                <div className="border-t border-white/20 pt-4 lg:pt-6">
                  <p className="text-blue-200 text-xs mb-3">Sorularınız için bize ulaşın</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a href="tel:08503045440" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                      <div className="p-1.5 rounded-md bg-white/10">
                        <Phone className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium">+90 (850) 304 54 40</span>
                    </a>
                    <a href="mailto:info@cozum.net" className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                      <div className="p-1.5 rounded-md bg-white/10">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-medium">info@cozum.net</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Footer Links - Desktop */}
              <div className="hidden lg:flex items-center gap-6 text-sm text-blue-200 mt-auto pt-8">
                <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Gizlilik</Link>
                <Link to="/distance-sales-contract" className="hover:text-white transition-colors">Sözleşmeler</Link>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Form Bölümü (Scroll edilebilir) */}
          <div className="lg:w-1/2 xl:w-[55%] lg:ml-[50%] xl:ml-[45%] bg-gray-50 relative">
            {/* Form İçeriği */}
            <div className="relative z-10 p-6 sm:p-8 lg:p-10 xl:p-12 min-h-full flex flex-col justify-center lg:overflow-y-auto">
              <div className="max-w-lg mx-auto w-full">
                
                {/* Form Başlığı */}
                <div className="mb-6 lg:mb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-100">
                      <Check className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl lg:text-2xl font-bold text-gray-900">Başvuru Formu</h2>
                  </div>
                  <p className="text-gray-500 text-sm lg:text-base">
                    Tüm alanları eksiksiz doldurun. En kısa sürede size dönüş yapacağız.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 lg:space-y-6">
                  
                  {/* Kişisel Bilgiler */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                      <User className="h-4 w-4 text-[#019242]" />
                      <span>Kişisel Bilgiler</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-gray-600 text-xs font-medium">Ad *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Adınız"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="surname" className="text-gray-600 text-xs font-medium">Soyad *</Label>
                        <Input
                          id="surname"
                          value={formData.surname}
                          onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                          placeholder="Soyadınız"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-gray-600 text-xs font-medium">E-posta *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="ornek@email.com"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-gray-600 text-xs font-medium">Telefon *</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="05XX XXX XX XX"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="tc_vkn" className="text-gray-600 text-xs font-medium">T.C. / Vergi No *</Label>
                        <Input
                          id="tc_vkn"
                          value={formData.tc_vkn}
                          onChange={(e) => setFormData({ ...formData, tc_vkn: e.target.value.replace(/\D/g, '') })}
                          placeholder="12345678901"
                          maxLength={11}
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="company_name" className="text-gray-600 text-xs font-medium">Şirket Adı</Label>
                        <Input
                          id="company_name"
                          value={formData.company_name}
                          onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                          placeholder="Opsiyonel"
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Adres Bilgileri */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                      <MapPin className="h-4 w-4 text-[#019242]" />
                      <span>Adres Bilgileri</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="city" className="text-gray-600 text-xs font-medium">İl *</Label>
                        <Select
                          value={formData.city}
                          onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-11">
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
                      <div className="space-y-1.5">
                        <Label htmlFor="district" className="text-gray-600 text-xs font-medium">İlçe</Label>
                        <Select
                          value={formData.district}
                          onValueChange={(value) => setFormData({ ...formData, district: value })}
                          disabled={!formData.city}
                        >
                          <SelectTrigger className="bg-white border-gray-200 text-gray-900 h-11">
                            <SelectValue placeholder={formData.city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'} />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {formData.city && getDistrictsByCity(formData.city).map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="address" className="text-gray-600 text-xs font-medium">Açık Adres</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Detaylı adres bilgisi"
                        className="bg-white border-gray-200 text-gray-900 h-11"
                      />
                    </div>
                  </div>

                  {/* Şifre Bilgileri */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                      <Lock className="h-4 w-4 text-[#019242]" />
                      <span>Hesap Şifresi</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-gray-600 text-xs font-medium">Şifre *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="••••••••"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                        <p className="text-xs text-gray-400">En az 8 karakter</p>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="confirmPassword" className="text-gray-600 text-xs font-medium">Şifre Tekrar *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          className="bg-white border-gray-200 text-gray-900 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referans Kodu */}
                  <div className="space-y-1.5">
                    <Label htmlFor="referral_code" className="text-gray-600 text-xs font-medium">Referans Kodu</Label>
                    <Input
                      id="referral_code"
                      value={formData.referral_code}
                      onChange={(e) => setFormData({ ...formData, referral_code: e.target.value })}
                      placeholder="Varsa referans kodunuz"
                      className="bg-white border-gray-200 text-gray-900 h-11"
                    />
                  </div>

                  {/* Kullanım Koşulları */}
                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-200">
                    <Checkbox
                      id="terms"
                      checked={termsAccepted}
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                      className="mt-0.5"
                    />
                    <Label htmlFor="terms" className="text-xs cursor-pointer leading-relaxed text-gray-600">
                      <Link to="/distance-sales-contract" target="_blank" className="text-[#019242] hover:underline font-medium">
                        Kullanım Koşulları
                      </Link>
                      'nı ve{' '}
                      <Link to="/privacy-policy" target="_blank" className="text-[#019242] hover:underline font-medium">
                        Gizlilik Politikası
                      </Link>
                      'nı okudum ve kabul ediyorum. *
                    </Label>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#019242] hover:bg-[#017A35] text-white rounded-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        Başvuruyu Gönder
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>

                  {/* Destek */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-400">
                      Yardıma mı ihtiyacınız var?{' '}
                      <a href="tel:08503045440" className="text-[#019242] hover:underline">
                        Bizi arayın
                      </a>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <footer className="lg:hidden bg-gray-900 text-white py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/cozumasistanlog.svg" alt="Logo" className="h-5" />
                <span className="text-gray-400 text-xs">© 2023 Çözüm Net A.Ş</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <Link to="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                <Link to="/privacy-policy" className="hover:text-white transition-colors">Gizlilik</Link>
                <Link to="/distance-sales-contract" className="hover:text-white transition-colors">Sözleşmeler</Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
