import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { userService, branchService, agencyService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Branch, Agency } from '@/types';
import { UserRole } from '@/types';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, Shield, Calendar,
  ShoppingCart, DollarSign, Car, UserCheck, TrendingUp,
  Building2, GitBranch, Save, X
} from 'lucide-react';

// Kullanici aktivite tipi
interface UserActivity {
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  customer_count: number;
  vehicle_count: number;
  recent_sales: Array<{
    id: string;
    customer_name: string;
    package_name: string;
    price: number;
    created_at: string;
  }>;
  monthly_sales: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
}

// Kullanici detay tipi
interface UserWithActivity extends User {
  activity?: UserActivity;
}

export default function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State'ler
  const [user, setUser] = useState<UserWithActivity | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    password: '',
    role: UserRole.BRANCH_USER as UserRole,
    agency_id: '',
    branch_id: ''
  });

  // Rol kontrolleri
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAgencyAdmin = currentUser?.role === UserRole.AGENCY_ADMIN;
  const canEdit = isSuperAdmin || isAgencyAdmin;
  const isOwnProfile = currentUser?.id === id;

  useEffect(() => {
    if (id) {
      fetchUserDetail();
      fetchBranches();
      if (isSuperAdmin) {
        fetchAgencies();
      }
    }
  }, [id]);

  // Kullanici detaylarini yukle
  const fetchUserDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const userData = await userService.getByIdWithActivity(id);
      setUser(userData);
      
      // Form'u doldur
      setFormData({
        name: userData.name || '',
        surname: userData.surname || '',
        email: userData.email || '',
        phone: userData.phone || '',
        password: '',
        role: userData.role,
        agency_id: userData.agency_id || '',
        branch_id: userData.branch_id || '',
      });
    } catch (error) {
      console.error('Kullanici detaylari yuklenirken hata:', error);
      navigate('/dashboard/users');
    } finally {
      setLoading(false);
    }
  };

  // Subeleri yukle
  const fetchBranches = async () => {
    try {
      const data = await branchService.getAll();
      setBranches(data);
    } catch (error) {
      console.error('Subeler yuklenirken hata:', error);
    }
  };

  // Acenteleri yukle
  const fetchAgencies = async () => {
    try {
      const data = await agencyService.getAll();
      setAgencies(data);
    } catch (error) {
      console.error('Acenteler yuklenirken hata:', error);
    }
  };

  // Acente seçildiğinde hesap bilgilerini yükle
  useEffect(() => {
    if (formData.agency_id && isEditMode) {
      const selectedAgency = agencies.find(a => a.id === formData.agency_id);
      if (selectedAgency) {
        setFormData(prev => ({
          ...prev,
        }));
      }
    }
  }, [formData.agency_id, agencies, isEditMode]);

  // Şube seçildiğinde hesap bilgilerini yükle
  useEffect(() => {
    if (formData.branch_id && isEditMode) {
      const selectedBranch = branches.find(b => b.id === formData.branch_id);
      if (selectedBranch) {
        setFormData(prev => ({
          ...prev,
        }));
      }
    }
  }, [formData.branch_id, branches, isEditMode]);

  // Kullanici guncelle
  const handleSave = async () => {
    if (!id) return;
    try {
      setSaving(true);
      const { password, ...updateData } = formData;
      // SUPPORT rolü global bir rol olduğu için agency_id ve branch_id boş olmalı
      const finalUpdateData = formData.role === UserRole.SUPPORT
        ? { ...updateData, agency_id: '', branch_id: '' }
        : updateData;
      
      // Kullanıcıyı güncelle
      await userService.update(id, password ? { ...formData, ...finalUpdateData } : finalUpdateData);
      
      await fetchUserDetail();
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Kullanici guncellenirken hata:', error);
      // Hata mesajını kullanıcıya göster (örn: toast notification)
      alert(error?.response?.data?.message || error?.message || 'Kullanici guncellenirken bir hata olustu');
    } finally {
      setSaving(false);
    }
  };

  // Kullanici sil
  const handleDelete = async () => {
    if (!id) return;
    try {
      await userService.delete(id);
      navigate('/dashboard/users');
    } catch (error) {
      console.error('Kullanici silinirken hata:', error);
    }
  };

  // Durum degistir
  const handleToggleStatus = async () => {
    if (!id) return;
    try {
      await userService.toggleStatus(id);
      await fetchUserDetail();
    } catch (error) {
      console.error('Durum degistirilirken hata:', error);
    }
  };

  // Tarih formatlama
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Para formatlama
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: 'TRY' 
    }).format(amount);
  };

  // Rol adi
  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.AGENCY_ADMIN:
        return 'kaynak Yoneticisi';
      case UserRole.BRANCH_ADMIN:
        return 'Sube Yoneticisi';
      case UserRole.BRANCH_USER:
        return 'Kullanici';
      case UserRole.SUPPORT:
        return 'Destek Ekibi';
      default:
        return role;
    }
  };

  // Rol badge rengi
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'destructive';
      case UserRole.AGENCY_ADMIN:
        return 'default';
      case UserRole.BRANCH_ADMIN:
        return 'secondary';
      case UserRole.BRANCH_USER:
        return 'outline';
      case UserRole.SUPPORT:
        return 'default'; // Destek ekibi için özel renk
      default:
        return 'outline';
    }
  };

  // Kullanilabilir roller
  // SUPPORT rolü sadece SUPER_ADMIN tarafından oluşturulabilir
  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return [UserRole.SUPER_ADMIN, UserRole.SUPPORT, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER];
    }
    if (isAgencyAdmin) {
      return [UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER];
    }
    return [UserRole.BRANCH_USER];
  };

  // Duzenlemeyi iptal et
  const handleCancelEdit = async () => {
    if (user) {
      // Kullanıcı bilgilerini yeniden yükle
      await fetchUserDetail();
    }
    setIsEditMode(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Kullanici bulunamadi</p>
        <Button variant="link" onClick={() => navigate('/dashboard/users')}>
          Kullanicilara don
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/users')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-2xl font-semibold">
              {user.name?.[0]}{user.surname?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name} {user.surname}</h1>
                <Badge variant={user.is_active ? 'success' : 'secondary'}>
                  {user.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Badge variant={getRoleBadgeVariant(user.role) as any}>
                  {getRoleName(user.role)}
                </Badge>
                <span>-</span>
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Aksiyonlar */}
        {canEdit && !isOwnProfile && (
          <div className="flex items-center gap-2">
            {/* Aktif/Pasif Toggle */}
            <div className="flex items-center gap-2 mr-4">
              <span className="text-sm text-muted-foreground">
                {user.is_active ? 'Aktif' : 'Pasif'}
              </span>
              <Switch
                checked={user.is_active}
                onCheckedChange={handleToggleStatus}
              />
            </div>
            
            {isEditMode ? (
              <>
                <Button variant="outline" onClick={handleCancelEdit} disabled={saving}>
                  <X className="h-4 w-4 mr-2" />
                  Iptal
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Duzenle
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Icerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Bilgiler */}
        <div className="lg:col-span-1 space-y-6">
          {/* Genel Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle>Genel Bilgiler</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                // Duzenleme modu
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ad</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Soyad</Label>
                      <Input
                        value={formData.surname}
                        onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>E-posta</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Yeni Sifre (opsiyonel)</Label>
                    <Input
                      type="password"
                      placeholder="Degistirmek icin doldurun"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => {
                        const newRole = value as UserRole;
                        // SUPPORT rolü seçildiğinde acente ve şube bilgilerini temizle (global rol)
                        if (newRole === UserRole.SUPPORT) {
                          setFormData({ ...formData, role: newRole, agency_id: '', branch_id: '' });
                        } else {
                          setFormData({ ...formData, role: newRole });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableRoles().map((role) => (
                          <SelectItem key={role} value={role}>
                            {getRoleName(role)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* SUPPORT rolü global bir rol olduğu için acente ve şube seçimi gerekmez */}
                  {isSuperAdmin && formData.role !== UserRole.SUPPORT && (
                    <div className="space-y-2">
                      <Label>kaynak</Label>
                      <Select
                        value={formData.agency_id || "none"}
                        onValueChange={(value) => setFormData({ ...formData, agency_id: value === "none" ? "" : value, branch_id: '' })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="kaynak secin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none"> kaynak yok</SelectItem>
                          {agencies.map((agency) => (
                            <SelectItem key={agency.id} value={agency.id}>
                              {agency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {/* SUPPORT rolü global bir rol olduğu için şube seçimi gerekmez */}
                  {formData.role !== UserRole.SUPPORT && (
                    <div className="space-y-2">
                      <Label>Sube</Label>
                      <Select
                        value={formData.branch_id || "none"}
                        onValueChange={(value) => setFormData({ ...formData, branch_id: value === "none" ? "" : value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sube secin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sube yok</SelectItem>
                          {branches.filter(b => !formData.agency_id || b.agency_id === formData.agency_id).map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  

                  {/* SUPPORT rolü bilgilendirmesi */}
                  {formData.role === UserRole.SUPPORT && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                      <p className="font-medium">Destek Ekibi Rolü</p>
                      <p className="text-xs mt-1">Bu rol global bir roldür ve kaynak/şube ataması gerektirmez. Tüm sistem verilerine erişim sağlar.</p>
                    </div>
                  )}
                </>
              ) : (
                // Goruntuleme modu
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">E-posta</p>
                      <p className="font-medium">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="font-medium">{user.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Shield className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Rol</p>
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {getRoleName(user.role)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">kaynak</p>
                      <p className="font-medium">{(user as any).agency?.name || 'Sistem'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <GitBranch className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Sube</p>
                      <p className="font-medium">{(user as any).branch?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kayit Tarihi</p>
                      <p className="font-medium">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sag Kolon - Istatistikler ve Satislar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Istatistik Kartlari */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  <span className="text-sm">Toplam Satis</span>
                </div>
                <p className="text-2xl font-bold">
                  {user.activity?.total_sales || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="text-sm">Toplam Gelir</span>
                </div>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(user.activity?.total_revenue || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm">Musteri</span>
                </div>
                <p className="text-2xl font-bold">
                  {user.activity?.customer_count || 0}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Car className="h-4 w-4" />
                  <span className="text-sm">Arac</span>
                </div>
                <p className="text-2xl font-bold">
                  {user.activity?.vehicle_count || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tab Icerik */}
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="sales">Son Satislar</TabsTrigger>
              <TabsTrigger value="trend">Aylik Trend</TabsTrigger>
            </TabsList>

            {/* Son Satislar */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Son Satislar</CardTitle>
                  <CardDescription>
                    Kullanicinin son 10 satisi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.activity?.recent_sales && user.activity.recent_sales.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Musteri</TableHead>
                            <TableHead>Paket</TableHead>
                            <TableHead className="text-right">Tutar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {user.activity.recent_sales.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>{formatDate(sale.created_at)}</TableCell>
                              <TableCell>{sale.customer_name}</TableCell>
                              <TableCell>{sale.package_name}</TableCell>
                              <TableCell className="text-right font-semibold text-emerald-600">
                                {formatCurrency(sale.price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henuz satis bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aylik Trend */}
            <TabsContent value="trend">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Aylik Satis Trendi
                  </CardTitle>
                  <CardDescription>
                    Son 6 ayin satis performansi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {user.activity?.monthly_sales && user.activity.monthly_sales.length > 0 ? (
                    <div className="space-y-3">
                      {user.activity.monthly_sales.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                          <span className="font-medium">{item.month}</span>
                          <div className="flex items-center gap-6">
                            <span className="text-sm text-muted-foreground">{item.count} satis</span>
                            <span className="font-semibold text-emerald-600 min-w-[100px] text-right">
                              {formatCurrency(item.revenue)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henuz veri bulunmuyor</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Silme Onay Dialogu */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullaniciyi Silmek Istediginize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{user.name} {user.surname}</strong> kullanicisi silinecek.
              <br /><br />
              Bu islem geri alinamaz ancak kullanicinin gecmis verileri (satislar, musteriler vb.) raporlama icin korunacaktir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Iptal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

