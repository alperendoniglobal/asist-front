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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/cozumasistanlog.svg" 
                alt="Çözüm Asistan" 
                className="h-8 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                Hoş geldin, <span className="font-medium">{userCustomer.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hoş geldin mesajı */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Hesabım</h1>
          <p className="text-gray-600 mt-1">Profil bilgilerinizi ve satın aldığınız paketleri görüntüleyin</p>
        </div>

        {/* Hızlı aksiyonlar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link to="/packages">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Paket Satın Al</h3>
                  <p className="text-sm text-gray-500">Yol yardım paketlerini incele</p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 ml-auto group-hover:text-blue-600 transition-colors" />
              </CardContent>
            </Card>
          </Link>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/20">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Aktif Paketlerim</h3>
                <p className="text-2xl font-bold">{purchases.filter(p => !p.is_refunded && new Date(p.end_date) > new Date()).length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-white/20">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Araçlarım</h3>
                <p className="text-2xl font-bold">{vehicles.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab içerik */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm">
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="purchases" className="gap-2">
              <Package className="h-4 w-4" />
              Paketlerim
            </TabsTrigger>
            <TabsTrigger value="vehicles" className="gap-2">
              <Car className="h-4 w-4" />
              Araçlarım
            </TabsTrigger>
          </TabsList>

          {/* Profil Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Profil Bilgileri</CardTitle>
                    <CardDescription>Kişisel bilgilerinizi görüntüleyin ve düzenleyin</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {editMode ? (
                      <>
                        <Button variant="outline" onClick={() => setEditMode(false)}>
                          İptal
                        </Button>
                        <Button onClick={handleSaveProfile} disabled={savingProfile}>
                          {savingProfile ? 'Kaydediliyor...' : 'Kaydet'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Lock className="h-4 w-4 mr-2" />
                              Şifre Değiştir
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Şifre Değiştir</DialogTitle>
                              <DialogDescription>
                                Güvenliğiniz için şifrenizi düzenli aralıklarla değiştirin
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Mevcut Şifre</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.oldPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Yeni Şifre</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.newPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Yeni Şifre (Tekrar)</Label>
                                <Input
                                  type="password"
                                  value={passwordForm.confirmPassword}
                                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setPasswordDialog(false)}>
                                İptal
                              </Button>
                              <Button onClick={handleChangePassword} disabled={changingPassword}>
                                {changingPassword ? 'Değiştiriliyor...' : 'Değiştir'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button variant="outline" size="sm" onClick={() => setEditMode(true)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* T.C. Kimlik No - değiştirilemez */}
                  <div className="space-y-2">
                    <Label className="text-gray-500">T.C. Kimlik No</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{userCustomer.tc_vkn}</span>
                      <Shield className="h-4 w-4 text-green-500 ml-auto" />
                    </div>
                  </div>

                  {/* E-posta - değiştirilemez */}
                  <div className="space-y-2">
                    <Label className="text-gray-500">E-posta</Label>
                    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{userCustomer.email}</span>
                    </div>
                  </div>

                  {/* Ad */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Ad</Label>
                    {editMode ? (
                      <Input
                        id="name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Soyad */}
                  <div className="space-y-2">
                    <Label htmlFor="surname">Soyad</Label>
                    {editMode ? (
                      <Input
                        id="surname"
                        value={profileForm.surname}
                        onChange={(e) => setProfileForm({ ...profileForm, surname: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.surname}</span>
                      </div>
                    )}
                  </div>

                  {/* Telefon */}
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    {editMode ? (
                      <Input
                        id="phone"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.phone || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* İl */}
                  <div className="space-y-2">
                    <Label htmlFor="city">İl</Label>
                    {editMode ? (
                      <Input
                        id="city"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.city || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* İlçe */}
                  <div className="space-y-2">
                    <Label htmlFor="district">İlçe</Label>
                    {editMode ? (
                      <Input
                        id="district"
                        value={profileForm.district}
                        onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.district || '-'}</span>
                      </div>
                    )}
                  </div>

                  {/* Adres */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Adres</Label>
                    {editMode ? (
                      <Input
                        id="address"
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">{userCustomer.address || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paketlerim Tab */}
          <TabsContent value="purchases">
            <Card>
              <CardHeader>
                <CardTitle>Satın Aldığım Paketler</CardTitle>
                <CardDescription>Tüm yol yardım paketleriniz</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingPurchases ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Yükleniyor...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Henüz paket satın almadınız</h3>
                    <p className="text-gray-500 mt-1 mb-4">Yol yardım paketlerimizi inceleyip satın alabilirsiniz</p>
                    <Link to="/packages">
                      <Button>
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
                          className={`p-4 border rounded-lg ${isActive ? 'border-green-200 bg-green-50' : isExpired ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${isActive ? 'bg-green-100 text-green-600' : isExpired ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'}`}>
                                {isActive ? <CheckCircle className="h-6 w-6" /> : isExpired ? <Clock className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                              </div>
                              <div>
                                <h4 className="font-semibold">{purchase.package_name}</h4>
                                <p className="text-sm text-gray-500">{purchase.vehicle_plate} • {purchase.vehicle_type}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm text-gray-500">sözleşme No</p>
                                <p className="font-medium">{purchase.policy_number}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-gray-500">Bitiş Tarihi</p>
                                <p className="font-medium">
                                  {format(new Date(purchase.end_date), 'dd MMM yyyy', { locale: tr })}
                                </p>
                              </div>
                              <Badge variant={isActive ? 'default' : isExpired ? 'secondary' : 'destructive'}>
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
            <Card>
              <CardHeader>
                <CardTitle>Araçlarım</CardTitle>
                <CardDescription>Kayıtlı araçlarınız</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingVehicles ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="text-gray-500 mt-2">Yükleniyor...</p>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-8">
                    <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Henüz araç kaydınız yok</h3>
                    <p className="text-gray-500 mt-1">Paket satın aldığınızda araç bilgileriniz otomatik kaydedilir</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="p-4 border rounded-lg bg-white hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                            <Car className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{vehicle.plate}</h4>
                            <p className="text-sm text-gray-500">
                              {vehicle.brand?.name || vehicle.motorBrand?.name || 'Bilinmiyor'} {vehicle.model?.name || vehicle.motorModel?.name || ''} • {vehicle.model_year}
                            </p>
                          </div>
                          <Badge variant="outline">{vehicle.vehicle_type}</Badge>
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
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2023 Çözüm Asistan. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <Link to="/kvkk" className="text-gray-500 hover:text-gray-700">KVKK</Link>
              <Link to="/gizlilik-politikasi" className="text-gray-500 hover:text-gray-700">Gizlilik Politikası</Link>
              <Link to="/mesafeli-satis-sozlesmesi" className="text-gray-500 hover:text-gray-700">Sözleşmeler</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

