import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { 
  Mail, Lock, User, Phone, MapPin, FileText,
  AlertTriangle, UserPlus, ArrowLeft, Shield,
  CheckCircle, Package
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * UserRegister Page
 * Bireysel kullanıcılar için kayıt sayfası
 */
export default function UserRegister() {
  const navigate = useNavigate();
  const { register } = useUserCustomer();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tc_vkn: '',
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    district: '',
    address: '',
  });

  // TC Kimlik No validasyonu
  const validateTcNumber = (tc: string): boolean => {
    if (tc.length !== 11) return false;
    if (tc[0] === '0') return false;
    
    const digits = tc.split('').map(Number);
    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
    const check10 = ((oddSum * 7) - evenSum) % 10;
    if (check10 !== digits[9]) return false;
    
    const totalSum = digits.slice(0, 10).reduce((a, b) => a + b, 0);
    if (totalSum % 10 !== digits[10]) return false;
    
    return true;
  };

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validasyonlar
    if (!formData.tc_vkn || !formData.name || !formData.surname || !formData.email || !formData.phone || !formData.password) {
      setError('Lütfen zorunlu alanları doldurun');
      return;
    }

    if (!validateTcNumber(formData.tc_vkn)) {
      setError('Geçersiz T.C. Kimlik No');
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      await register({
        tc_vkn: formData.tc_vkn,
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        city: formData.city || undefined,
        district: formData.district || undefined,
        address: formData.address || undefined,
      });

      toast.success('Kayıt başarılı! Hoş geldiniz.');
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kayıt işlemi başarısız. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Input değişikliği
  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  // Özellik listesi
  const features = [
    { icon: Package, title: 'Paket Satın Al', description: 'Dilediğiniz yol yardım paketini seçin' },
    { icon: Shield, title: 'Güvenli Ödeme', description: 'PayTR ile güvenli ödeme yapın' },
    { icon: CheckCircle, title: '7/24 Destek', description: 'Her an yanınızdayız' },
  ];

  return (
    <div className="min-h-screen flex public-page light" style={{ colorScheme: 'light' }}>
      {/* Sol Panel - Bilgi */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#019242] via-[#017A35] to-[#015A28] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif arka plan */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
        
        {/* Gradient efektleri */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img 
              src="/cozumasistanlog.svg" 
              alt="Çözüm Asistan" 
              className="h-10 w-auto cursor-pointer"
            />
          </Link>
          <p className="text-white/80 text-lg">Yol Yardım Hizmetleri</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-semibold mb-8">Üye Olun, Avantajlardan Yararlanın</h2>
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur border border-white/10"
              >
                <div className="p-2 rounded-lg bg-white/10">
                  <feature.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/50 text-sm">
            © 2023 Çözüm Asistan. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Sağ Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-lg shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-6">
            {/* Geri butonu */}
            <div className="flex justify-start mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/')}
                className="text-gray-500 hover:text-gray-700"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Ana Sayfa
              </Button>
            </div>
            
            {/* Icon */}
            <div className="mx-auto w-14 h-14 bg-gradient-to-br from-[#019242] to-[#017A35] rounded-xl flex items-center justify-center mb-2 shadow-lg">
              <UserPlus className="h-7 w-7 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Üye Ol</CardTitle>
            <CardDescription>
              Hemen üye olun, yol yardım paketlerinden yararlanın
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Hata mesajı */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TC Kimlik No */}
              <div className="space-y-2">
                <Label htmlFor="tc_vkn">T.C. Kimlik No *</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="tc_vkn"
                    type="text"
                    placeholder="11 haneli T.C. Kimlik No"
                    value={formData.tc_vkn}
                    onChange={(e) => handleChange('tc_vkn', e.target.value.replace(/\D/g, '').slice(0, 11))}
                    className="pl-10"
                    maxLength={11}
                    required
                  />
                </div>
              </div>

              {/* Ad Soyad */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Adınız"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Soyad *</Label>
                  <Input
                    id="surname"
                    type="text"
                    placeholder="Soyadınız"
                    value={formData.surname}
                    onChange={(e) => handleChange('surname', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">E-posta *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Telefon */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Şifre */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar *</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* İl/İlçe - Opsiyonel */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="city">İl</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="city"
                      type="text"
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">İlçe</Label>
                  <Input
                    id="district"
                    type="text"
                    placeholder="Kadıköy"
                    value={formData.district}
                    onChange={(e) => handleChange('district', e.target.value)}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full h-11 bg-[#019242] hover:bg-[#017A35]" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Kayıt yapılıyor...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    Üye Ol
                  </div>
                )}
              </Button>

              {/* Login link */}
              <p className="text-center text-sm text-gray-600">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="text-[#019242] hover:underline font-medium">
                  Giriş Yap
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

