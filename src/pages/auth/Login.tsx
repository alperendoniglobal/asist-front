import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { 
  Mail, Lock, LogIn, AlertTriangle, 
  Car, Users, CreditCard, TrendingUp 
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(formData.email, formData.password);
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

  // Özellik kartları
  const features = [
    { icon: Users, title: 'Müşteri Yönetimi', description: 'Müşterilerinizi kolayca yönetin' },
    { icon: Car, title: 'Araç Takibi', description: 'Araç kayıtlarını düzenleyin' },
    { icon: CreditCard, title: 'Ödeme Entegrasyonu', description: 'Iyzico ile güvenli ödeme' },
    { icon: TrendingUp, title: 'Raporlama', description: 'Detaylı istatistikler' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sol Panel - Özellikler */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Dekoratif arka plan deseni */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>
        
        {/* Gradient overlay efektleri */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-4">
            <img 
              src="/cozumasistanlog.svg" 
              alt="Çözüm Asistan" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-slate-400 text-lg">Sigorta Acente Yönetim Sistemi</p>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-semibold mb-8">Neden Yol Asistan?</h2>
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
            © 2023 Yol Asistan. Tüm hakları saklıdır.
          </p>
        </div>
      </div>

      {/* Sağ Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-background to-muted/50">
        <Card className="w-full max-w-md shadow-2xl border-0">
          <CardHeader className="space-y-1 text-center pb-8">
            {/* Icon Logo - formun üstünde */}
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/25">
              <img 
                src="/iconlogo.svg" 
                alt="Çözüm Asistan" 
                className="h-10 w-10"
              />
            </div>
            <CardTitle className="text-2xl font-bold">Hoş Geldiniz</CardTitle>
            <CardDescription>
              Hesabınıza giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Hata mesajı */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Giriş formu */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            </form>

            {/* Ödeme Logoları - Login formunun altında */}
            <div className="mt-8 pt-6 border-t">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground">Güvenli Ödeme</p>
                <div className="flex items-center justify-center gap-4 opacity-70 hover:opacity-100 transition-opacity">
                  <img 
                    src="/iyzicologo.png" 
                    alt="Iyzico" 
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
