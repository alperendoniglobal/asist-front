import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { UserRole } from '@/types';
import { 
  Mail, Lock, LogIn, AlertTriangle, 
  Car, Users, CreditCard, TrendingUp,
  User, Building2, UserPlus
} from 'lucide-react';

/**
 * Login Page
 * Hem yetkili (admin/acente) hem de bireysel kullanıcı girişi için
 * Tab yapısı ile ayrılmış iki farklı giriş formu
 */
export default function Login() {
  const navigate = useNavigate();
  const { login: adminLogin } = useAuth();
  const { login: userLogin } = useUserCustomer();
  
  // State'ler
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('user');
  
  // Form verileri
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [adminFormData, setAdminFormData] = useState({ email: '', password: '' });

  // Kullanıcı girişi
  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await userLogin(userFormData.email, userFormData.password);
      navigate('/user/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Yetkili girişi
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await adminLogin(adminFormData.email, adminFormData.password);
      // SUPPORT rolü için özel yönlendirme
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUser.role === UserRole.SUPPORT) {
        navigate('/dashboard/support/sales');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  // Tab değiştiğinde hata temizle
  const handleTabChange = (value: string) => {
    setActiveTab(value as 'user' | 'admin');
    setError(null);
  };

  // Özellik kartları (yetkili girişi için)
  const features = [
    { icon: Users, title: 'Müşteri Yönetimi', description: 'Müşterilerinizi kolayca yönetin' },
    { icon: Car, title: 'Araç Takibi', description: 'Araç kayıtlarını düzenleyin' },
    { icon: CreditCard, title: 'Ödeme Entegrasyonu', description: 'PayTR ile güvenli ödeme' },
    { icon: TrendingUp, title: 'Raporlama', description: 'Detaylı istatistikler' },
  ];

  return (
    <div className="min-h-screen flex public-page light" style={{ colorScheme: 'light' }}>
      {/* Sol Panel - Özellikler */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif arka plan deseni */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
        
        {/* Gradient overlay efektleri */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-4">
            <img 
              src="/cozumasistanlog.svg" 
              alt="Çözüm Asistan" 
              className="h-10 w-auto cursor-pointer"
            />
          </Link>
          <p className="text-slate-400 text-lg">Yol Yardım Hizmetleri</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-semibold mb-8">
            {activeTab === 'user' ? 'Üye Avantajları' : 'Neden Yol Asistan?'}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-4 rounded-xl bg-white/5 backdrop-blur border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 group cursor-default"
              >
                <feature.icon className="h-8 w-8 mb-3 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-500 text-sm">
            © 2023 Çözüm Asistan. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Sağ Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/50">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-4">
            {/* Icon Logo */}
            <Link to="/" className="mx-auto block">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
                <img 
                  src="/iconlogo.svg" 
                  alt="Çözüm Asistan" 
                  className="h-10 w-10"
                />
              </div>
            </Link>
            <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
            <CardDescription>
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {/* Tab yapısı */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="user" className="gap-2">
                  <User className="h-4 w-4" />
                  Kullanıcı
                </TabsTrigger>
                <TabsTrigger value="admin" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Yetkili
                </TabsTrigger>
              </TabsList>

              {/* Hata mesajı */}
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Kullanıcı Girişi */}
              <TabsContent value="user">
                <form onSubmit={handleUserLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-email">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="user-email"
                        type="email"
                        placeholder="ornek@email.com"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user-password">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="user-password"
                        type="password"
                        placeholder="••••••••"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Giriş yapılıyor...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Giriş Yap
                      </div>
                    )}
                  </Button>

                  {/* Kayıt linki */}
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Hesabınız yok mu?{' '}
                    <Link to="/user-register" className="text-primary hover:underline font-medium inline-flex items-center gap-1">
                      <UserPlus className="h-3 w-3" />
                      Üye Ol
                    </Link>
                  </div>
                </form>
              </TabsContent>

              {/* Yetkili Girişi */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">E-posta</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="yetkili@email.com"
                        value={adminFormData.email}
                        onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Şifre</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="admin-password"
                        type="password"
                        placeholder="••••••••"
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Giriş yapılıyor...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Yetkili Girişi
                      </div>
                    )}
                  </Button>

                  {/* Bayilik başvurusu linki */}
                  <div className="text-center text-sm text-muted-foreground pt-2">
                    Bayimiz olmak ister misiniz?{' '}
                    <Link to="/bayilik-basvurusu" className="text-primary hover:underline font-medium">
                      Başvuru Yap
                    </Link>
                  </div>
                </form>
              </TabsContent>
            </Tabs>

            {/* Ödeme Logoları */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground">Güvenli Ödeme</p>
                <div className="flex items-center justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  <img 
                    src="/PayTR---2025-New-Logo-Color.png" 
                    alt="PayTR" 
                    className="h-7 w-auto object-contain"
                  />
                  <img 
                    src="/visalogo.png" 
                    alt="Visa" 
                    className="h-7 w-auto object-contain"
                  />
                  <img 
                    src="/mastercardlogo.png" 
                    alt="Mastercard" 
                    className="h-7 w-auto object-contain"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
