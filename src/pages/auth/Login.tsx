import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { UserRole } from '@/types';
import { motion } from 'framer-motion';
import {
  Mail, Lock, LogIn, AlertTriangle,
  Car, Users, CreditCard, TrendingUp,
  User, Building2, UserPlus, Check,
} from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login: adminLogin } = useAuth();
  const { login: userLogin } = useUserCustomer();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'admin'>('admin');
  const [userFormData, setUserFormData] = useState({ email: '', password: '' });
  const [adminFormData, setAdminFormData] = useState({ email: '', password: '' });

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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(adminFormData.email, adminFormData.password);
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

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'user' | 'admin');
    setError(null);
  };

  const features = [
    { icon: Users, title: 'Müşteri Yönetimi', description: 'Müşterilerinizi kolayca yönetin' },
    { icon: Car, title: 'Araç Takibi', description: 'Araç kayıtlarını düzenleyin' },
    { icon: CreditCard, title: 'Ödeme Entegrasyonu', description: 'PayTR ile güvenli ödeme' },
    { icon: TrendingUp, title: 'Raporlama', description: 'Detaylı istatistikler' },
  ];

  return (
    <div className="min-h-screen flex public-page light bg-white" style={{ colorScheme: 'light' }}>

      {/* ===== SOL PANEL ===== */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#019242] text-white flex-col justify-between relative overflow-hidden p-12">

        {/* Dekoratif şekiller */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-white/5 translate-x-1/3 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] rounded-full bg-black/10 -translate-x-1/4 translate-y-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-white/10" />
        </div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/iconlogo.svg"
              alt="Çözüm Net A.Ş"
              className="h-10 w-10 object-contain filter brightness-0 invert"
            />
            <div>
              <p className="font-bold text-white text-lg leading-tight">Çözüm Net A.Ş</p>
              <p className="text-white/60 text-xs">Yol Yardım Hizmetleri</p>
            </div>
          </Link>
        </motion.div>

        {/* Orta içerik */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative z-10 space-y-8"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-white/50 mb-3">
              {activeTab === 'user' ? 'Üye Avantajları' : 'Neden Çözüm Net?'}
            </p>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Türkiye'nin Her<br />
              Noktasında<br />
              <span className="text-white/70">Yanınızdayız</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + index * 0.07 }}
                className="p-4 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-3">
                  <feature.icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-0.5">{feature.title}</h3>
                <p className="text-xs text-white/55 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-2">
            {[
              { val: '3.400+', label: 'Mutlu Müşteri' },
              { val: '81 İl', label: 'Kapsama Alanı' },
              { val: '7/24', label: 'Destek' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white leading-none">{s.val}</p>
                <p className="text-xs text-white/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Alt */}
        <div className="relative z-10">
          <p className="text-white/35 text-xs">© 2025 Çözüm Net A.Ş. Tüm hakları saklıdır.</p>
        </div>
      </div>

      {/* ===== SAĞ PANEL — FORM ===== */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobilde logo */}
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <img
              src="/iconlogo.svg"
              alt=""
              className="h-8 w-8 object-contain"
              style={{ filter: 'invert(35%) sepia(98%) saturate(600%) hue-rotate(120deg) brightness(0.9)' }}
            />
            <span className="font-bold text-gray-900">Çözüm Net A.Ş</span>
          </div>

          {/* Başlık */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#019242] mb-2">Hoş Geldiniz</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Hesabınıza Giriş Yapın</h1>
            <p className="text-sm text-gray-500 mt-2">Devam etmek için giriş türünüzü seçin.</p>
          </div>

          {/* Tab seçici */}
          <div className="grid grid-cols-2 gap-2.5 mb-7">
            <button
              type="button"
              onClick={() => handleTabChange('user')}
              className={`p-3.5 rounded-xl border-2 transition-all text-left ${
                activeTab === 'user'
                  ? 'border-[#019242] bg-green-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeTab === 'user' ? 'bg-[#019242]' : 'bg-gray-100'
                }`}>
                  <User className={`h-4 w-4 ${activeTab === 'user' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${activeTab === 'user' ? 'text-[#019242]' : 'text-gray-900'}`}>
                    Bireysel
                  </p>
                  <p className="text-xs text-gray-400">Müşteri Girişi</p>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('admin')}
              className={`p-3.5 rounded-xl border-2 transition-all text-left ${
                activeTab === 'admin'
                  ? 'border-[#019242] bg-green-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  activeTab === 'admin' ? 'bg-[#019242]' : 'bg-gray-100'
                }`}>
                  <Building2 className={`h-4 w-4 ${activeTab === 'admin' ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <p className={`font-semibold text-sm ${activeTab === 'admin' ? 'text-[#019242]' : 'text-gray-900'}`}>
                    Kurumsal
                  </p>
                  <p className="text-xs text-gray-400">Yetkili Girişi</p>
                </div>
              </div>
            </button>
          </div>

          {/* Hata */}
          {error && (
            <div className="flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-5">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Formlar */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>

            {/* Bireysel */}
            <TabsContent value="user">
              <form onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="user-email" className="text-sm font-medium text-gray-700">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-email"
                      type="email"
                      placeholder="ornek@email.com"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className="pl-10 h-11 border-gray-200 rounded-xl focus:border-[#019242] focus:ring-0 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="user-password" className="text-sm font-medium text-gray-700">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="user-password"
                      type="password"
                      placeholder="••••••••"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      className="pl-10 h-11 border-gray-200 rounded-xl focus:border-[#019242] focus:ring-0 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password-user" className="text-xs text-[#019242] hover:text-[#017A35] font-medium transition-colors">
                    Şifremi Unuttum
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#019242] hover:bg-[#017A35] text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Giriş Yap
                    </div>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  Hesabınız yok mu?{' '}
                  <Link to="/user-register" className="text-[#019242] hover:text-[#017A35] font-semibold inline-flex items-center gap-1 transition-colors">
                    <UserPlus className="h-3.5 w-3.5" />
                    Üye Ol
                  </Link>
                </p>
              </form>
            </TabsContent>

            {/* Kurumsal */}
            <TabsContent value="admin">
              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="admin-email" className="text-sm font-medium text-gray-700">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="yetkili@email.com"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      className="pl-10 h-11 border-gray-200 rounded-xl focus:border-[#019242] focus:ring-0 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="admin-password" className="text-sm font-medium text-gray-700">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="admin-password"
                      type="password"
                      placeholder="••••••••"
                      value={adminFormData.password}
                      onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                      className="pl-10 h-11 border-gray-200 rounded-xl focus:border-[#019242] focus:ring-0 bg-white text-gray-900"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link to="/forgot-password" className="text-xs text-[#019242] hover:text-[#017A35] font-medium transition-colors">
                    Şifremi Unuttum
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#019242] hover:bg-[#017A35] text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Giriş yapılıyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="h-4 w-4" />
                      Yetkili Girişi
                    </div>
                  )}
                </Button>

                <p className="text-center text-sm text-gray-500 pt-1">
                  Bayimiz olmak ister misiniz?{' '}
                  <Link to="/bayilik-basvurusu" className="text-[#019242] hover:text-[#017A35] font-semibold transition-colors">
                    Başvuru Yap
                  </Link>
                </p>
              </form>
            </TabsContent>
          </Tabs>

          {/* Güvenli ödeme */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[#019242]" />
                <p className="text-xs text-gray-400 font-medium">Güvenli Ödeme</p>
              </div>
              <div className="flex items-center justify-center gap-4 opacity-60 hover:opacity-90 transition-opacity">
                <img src="/PayTR---2025-New-Logo-Color.png" alt="PayTR" className="h-6 w-auto object-contain" />
                <img src="/visalogo.png" alt="Visa" className="h-6 w-auto object-contain" />
                <img src="/mastercardlogo.png" alt="Mastercard" className="h-6 w-auto object-contain" />
              </div>
            </div>
          </div>

          {/* Anasayfaya dön */}
          <div className="mt-5 text-center">
            <Link to="/" className="text-xs text-gray-400 hover:text-[#019242] transition-colors">
              ← Anasayfaya Dön
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
