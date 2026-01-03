import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserCustomer } from '@/contexts/UserCustomerContext';
import { userCustomerService } from '@/services/userCustomerService';
import type { UserCustomerPurchase } from '@/services/userCustomerService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  User, Package, Car, LogOut, ShoppingCart,
  Edit, Lock, MapPin, Phone, Mail,
  CheckCircle, XCircle, Clock,
  FileText, Shield, ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
// Şehir ve ilçe verilerini import et
import cityData from '@/data/city.json';
import { validatePassword } from '@/utils/validators';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

// Türkiye İlleri - city.json'dan al
const CITIES = cityData.map((city) => city.il);

// Seçilen ile göre ilçeleri getiren fonksiyon
const getDistrictsByCity = (cityName: string): string[] => {
  const city = cityData.find((c) => c.il === cityName);
  return city ? city.ilceleri : [];
};

/**
 * UserDashboard
 * Bireysel kullanıcılar için panel
 * Profil bilgileri, satın alınan paketler, araçlar
 */
export default function UserDashboard() {
  const navigate = useNavigate();
  const { userCustomer, logout, updateProfile, isAuthenticated, loading: authLoading } = useUserCustomer();
  
  // State'ler
  const [purchases, setPurchases] = useState<UserCustomerPurchase[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  
  // Profil düzenleme state'leri
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    phone: '',
    city: '',
    district: '',
    address: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Şifre değiştirme state'leri
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Auth kontrolü
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Profil formunu doldur
  useEffect(() => {
    if (userCustomer) {
      setProfileForm({
        name: userCustomer.name || '',
        surname: userCustomer.surname || '',
        phone: userCustomer.phone || '',
        city: userCustomer.city || '',
        district: userCustomer.district || '',
        address: userCustomer.address || '',
      });
    }
  }, [userCustomer]);

  // Verileri yükle
  useEffect(() => {
    if (isAuthenticated) {
      loadPurchases();
      loadVehicles();
    }
  }, [isAuthenticated]);

  // Satın alınan paketleri yükle
  const loadPurchases = async () => {
    try {
      const data = await userCustomerService.getPurchases();
      setPurchases(data);
    } catch (error) {
      console.error('Satın almalar yüklenemedi:', error);
    } finally {
      setLoadingPurchases(false);
    }
  };

  // Araçları yükle
  const loadVehicles = async () => {
    try {
      const data = await userCustomerService.getVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Araçlar yüklenemedi:', error);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Profil kaydet
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfile(profileForm);
      setEditMode(false);
      toast.success('Profil güncellendi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
    } finally {
      setSavingProfile(false);
    }
  };

  // Şifre değiştir
  const handleChangePassword = async () => {
    // Şifre validasyonu
    const passwordValidation = validatePassword(passwordForm.newPassword);
    if (!passwordValidation.isValid) {
      setPasswordErrors(passwordValidation.errors);
      toast.error(passwordValidation.errors.join(', '));
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors(['Şifreler eşleşmiyor']);
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    setChangingPassword(true);
    try {
      await userCustomerService.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword
      );
      toast.success('Şifre değiştirildi');
      setPasswordDialog(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordErrors([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre değiştirilemedi');
    } finally {
      setChangingPassword(false);
    }
  };

  // Çıkış yap
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Yükleniyor
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kullanıcı yoksa
  if (!userCustomer) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-16 h-12 rounded-xl bg-[#019242] flex items-center justify-center shadow-lg px-3">
                <img 
                  src="/cozumasistanlog.svg" 
                  alt="Çözüm Asistan" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    // Logo yüklenemezse iconlogo kullan
                    const target = e.target as HTMLImageElement;
                    if (target.src !== window.location.origin + '/iconlogo.svg') {
                      target.src = '/iconlogo.svg';
                    }
                  }}
                />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">Çözüm Asistan</h1>
                <p className="text-xs text-gray-500">Yol Yardım Hizmetleri</p>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700 hidden md:block">
                Hoş geldin, <span className="font-semibold text-gray-900">{userCustomer.name}</span>
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Çıkış</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hoş geldin mesajı */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hesabım</h1>
          <p className="text-gray-600 mt-2">Profil bilgilerinizi ve satın aldığınız paketleri görüntüleyin</p>
        </div>

        {/* Hızlı aksiyonlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/packages">
            <Card className="bg-white hover:shadow-lg transition-all cursor-pointer group border border-gray-200">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Paket Satın Al</h3>
                  <p className="text-sm text-gray-600">Yol yardım paketlerini incele</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Aktif Paketlerim</h3>
                <p className="text-3xl font-bold text-white mt-1">{purchases.filter(p => !p.is_refunded && new Date(p.end_date) > new Date()).length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-md">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/20 backdrop-blur-sm">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Araçlarım</h3>
                <p className="text-3xl font-bold text-white mt-1">{vehicles.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab içerik */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600">
              <Package className="h-4 w-4" />
              Paketlerim
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 text-gray-600">
              <Car className="h-4 w-4" />
              Araçlarım
            </TabsTrigger>
          </TabsList>

          {/* Profil Tab */}
          <TabsContent value="profile">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-gray-900">Profil Bilgileri</CardTitle>
                    <CardDescription className="text-gray-600">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button 
                          variant="outline" 
                          onClick={() => setEditMode(false)}
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          İptal
                        </Button>
                        <Button 
                          onClick={handleSaveProfile} 
                          disabled={savingProfile}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                              <Lock className="h-4 w-4 mr-2" />
                              Şifre Değiştir
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle className="text-gray-900">Şifre Değiştir</DialogTitle>
                              <DialogDescription className="text-gray-600">
                                Güvenliğiniz için şifrenizi düzenli aralıklarla değiştirin
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label className="text-gray-700">Mevcut Şifre</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.oldPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                  className="bg-white border-gray-300"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-700">Yeni Şifre</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.newPassword}
                                  onChange={(e) => {
                                    setPasswordForm({ ...passwordForm, newPassword: e.target.value });
                                    const validation = validatePassword(e.target.value);
                                    setPasswordErrors(validation.errors);
                                  }}
                                  className={`bg-white ${passwordErrors.length > 0 ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordForm.newPassword && (
                                  <div className="bg-gray-50 rounded-lg p-2 space-y-1 text-xs">
                                    <p className="font-semibold text-gray-700 mb-1">Şifre Gereksinimleri:</p>
                                    <div className={`flex items-center gap-1.5 ${passwordForm.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                                      {passwordForm.newPassword.length >= 8 ? '✓' : '✗'} En az 8 karakter
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                      {/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '✗'} Büyük harf (A-Z)
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[a-z]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                      {/[a-z]/.test(passwordForm.newPassword) ? '✓' : '✗'} Küçük harf (a-z)
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                      {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '✗'} Rakam (0-9)
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordForm.newPassword) ? 'text-green-600' : 'text-gray-500'}`}>
                                      {/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(passwordForm.newPassword) ? '✓' : '✗'} Özel karakter
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label className="text-gray-700">Yeni Şifre (Tekrar)</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                  className={`bg-white ${passwordForm.newPassword !== passwordForm.confirmPassword && passwordForm.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                                  <p className="text-xs text-red-500">Şifreler eşleşmiyor</p>
                                )}
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline" 
                                onClick={() => setPasswordDialog(false)}
                                className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                              >
                                İptal
                              </Button>
                              <Button 
                                onClick={handleChangePassword} 
                                disabled={changingPassword || !validatePassword(passwordForm.newPassword).isValid || passwordForm.newPassword !== passwordForm.confirmPassword || !passwordForm.oldPassword}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {changingPassword ? 'Değiştiriliyor...' : 'Değiştir'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setEditMode(true)}
                          className="bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* T.C. Kimlik No - değiştirilemez */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">T.C. Kimlik No</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{userCustomer.tc_vkn}</span>
                      <Shield className="h-4 w-4 text-green-600 ml-auto" />
                    </div>
                  </div>

                  {/* E-posta - değiştirilemez */}
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">E-posta</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="font-medium text-gray-900">{userCustomer.email}</span>
                    </div>
                  </div>

                  {/* Ad */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-700 font-medium">Ad</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Soyad */}
                  <div className="space-y-2">
                    <Label htmlFor="surname" className="text-gray-700 font-medium">Soyad</Label>
                    {editMode ? (
                      <Input
                        id="surname"
                        value={profileForm.surname}
                        onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.surname}</span>
                      </div>
                    )}
                  </div>

                  {/* Telefon */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-700 font-medium">Telefon</Label>
                    {editMode ? (
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.phone || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* İl */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-gray-700 font-medium">İl</Label>
                    {editMode ? (
                      <Select
                        value={profileForm.city}
                        onValueChange={(value) => setProfileForm({ ...profileForm, city: value, district: '' })}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder="İl Seçiniz" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {CITIES.map((city) => (
                            <SelectItem key={city} value={city} className="text-gray-900">
                              {city}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.city || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* İlçe */}
                  <div className="space-y-2">
                    <Label htmlFor="district" className="text-gray-700 font-medium">İlçe</Label>
                    {editMode ? (
                      <Select
                        value={profileForm.district}
                        onValueChange={(value) => setProfileForm({ ...profileForm, district: value })}
                        disabled={!profileForm.city}
                      >
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                          <SelectValue placeholder={profileForm.city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'} />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-200">
                          {profileForm.city && getDistrictsByCity(profileForm.city).map((district) => (
                            <SelectItem key={district} value={district} className="text-gray-900">
                              {district}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.district || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* Adres */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address" className="text-gray-700 font-medium">Adres</Label>
                    {editMode ? (
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                        className="bg-white border-gray-300 text-gray-900"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">{userCustomer.address || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paketlerim Tab */}
          <TabsContent value="purchases">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-gray-900">Satın Aldığım Paketler</CardTitle>
                <CardDescription className="text-gray-600">Tüm yol yardım paketleriniz</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                {loadingPurchases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Yükleniyor...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Henüz paket satın almadınız</h3>
                    <p className="text-gray-600 mt-1 mb-4">Yol yardım paketlerimizi inceleyip satın alabilirsiniz</p>
                    <Link to="/packages">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Paketleri İncele
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.map((purchase) => {
                      const isActive = !purchase.is_refunded && new Date(purchase.end_date) > new Date();
                      const isExpired = new Date(purchase.end_date) < new Date();
                      
                      return (
                        <div 
                          key={purchase.id} 
                          className={`p-4 border rounded-lg ${isActive ? 'border-green-300 bg-green-50' : isExpired ? 'border-gray-300 bg-gray-50' : 'border-red-300 bg-red-50'}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100 text-green-700' : isExpired ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>
                                {isActive ? <CheckCircle className="h-6 w-6" /> : isExpired ? <Clock className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{purchase.package_name}</h4>
                                <p className="text-sm text-gray-600">{purchase.vehicle_plate} • {purchase.vehicle_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Sözleşme No</p>
                                <p className="font-medium text-gray-900">{purchase.policy_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-600">Bitiş Tarihi</p>
                                <p className="font-medium text-gray-900">
                                  {format(new Date(purchase.end_date), 'dd MMM yyyy', { locale: tr })}
                                </p>
                              </div>
                              <Badge 
                                className={
                                  isActive 
                                    ? 'bg-green-600 text-white' 
                                    : isExpired 
                                      ? 'bg-gray-500 text-white' 
                                      : 'bg-red-600 text-white'
                                }
                              >
                                {isActive ? 'Aktif' : isExpired ? 'Süresi Doldu' : 'İade Edildi'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Araçlarım Tab */}
          <TabsContent value="vehicles">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="bg-gray-50 border-b border-gray-200">
                <CardTitle className="text-gray-900">Araçlarım</CardTitle>
                <CardDescription className="text-gray-600">Kayıtlı araçlarınız</CardDescription>
              </CardHeader>
              <CardContent className="bg-white">
                {loadingVehicles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 mt-2">Yükleniyor...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900">Henüz araç kaydınız yok</h3>
                    <p className="text-gray-600 mt-1">Paket satın aldığınızda araç bilgileriniz otomatik kaydedilir</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                            <Car className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{vehicle.plate}</h4>
                            <p className="text-sm text-gray-600">
                              {vehicle.brand?.name || vehicle.motorBrand?.name || 'Bilinmiyor'} {vehicle.model?.name || vehicle.motorModel?.name || ''} • {vehicle.model_year}
                            </p>
                          </div>
                          <Badge className="bg-gray-100 text-gray-700 border-gray-300">{vehicle.vehicle_type}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-600">
              © 2023 Çözüm Asistan. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/kvkk" className="text-gray-600 hover:text-gray-900 transition-colors">KVKK</Link>
              <Link to="/gizlilik-politikasi" className="text-gray-600 hover:text-gray-900 transition-colors">Gizlilik Politikası</Link>
              <Link to="/mesafeli-satis-sozlesmesi" className="text-gray-600 hover:text-gray-900 transition-colors">Sözleşmeler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

