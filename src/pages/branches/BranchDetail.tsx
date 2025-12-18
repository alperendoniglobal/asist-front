import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { branchService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Branch, User } from '@/types';
import { UserRole } from '@/types';
import { 
  ArrowLeft, Edit, Trash2, Phone, Calendar,
  ShoppingCart, DollarSign, Users, TrendingUp,
  Building2, MapPin, Save, X, Trophy, UserCheck, Percent
} from 'lucide-react';

// Sube istatistikleri tipi
interface BranchStats {
  total_sales: number;
  total_revenue: number;
  total_commission: number;
  customer_count: number;
  user_count: number;
  active_user_count: number;
  recent_sales: Array<{
    id: string;
    customer_name: string;
    package_name: string;
    user_name: string;
    price: number;
    created_at: string;
  }>;
  monthly_sales: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  user_performance: Array<{
    user_id: string;
    user_name: string;
    sales_count: number;
    total_revenue: number;
  }>;
}

// Sube detay tipi
interface BranchWithStats extends Branch {
  users?: User[];
  stats?: BranchStats;
  // Acentenin maksimum komisyon oranı (validasyon için)
  agency_max_commission?: number;
}

export default function BranchDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // State'ler
  const [branch, setBranch] = useState<BranchWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state - komisyon alanı ZORUNLU
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    commission_rate: ''  // Zorunlu alan
  });
  
  // Acentenin maksimum komisyon oranı (validasyon için)
  const [maxCommissionRate, setMaxCommissionRate] = useState<number>(100);

  // Rol kontrolleri
  const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
  const isAgencyAdmin = currentUser?.role === UserRole.AGENCY_ADMIN;
  const canEdit = isSuperAdmin || isAgencyAdmin;

  useEffect(() => {
    if (id) {
      fetchBranchDetail();
    }
  }, [id]);

  // Sube detaylarini yukle
  const fetchBranchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await branchService.getByIdWithStats(id);
      setBranch(data);
      
      setFormData({
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        commission_rate: String(data.commission_rate)
      });
      
      // Acentenin maksimum komisyon oranını ayarla
      if (data.agency_max_commission) {
        setMaxCommissionRate(data.agency_max_commission);
      } else if (data.agency?.commission_rate) {
        setMaxCommissionRate(data.agency.commission_rate);
      }
    } catch (error) {
      console.error('Sube detaylari yuklenirken hata:', error);
      navigate('/branches');
    } finally {
      setLoading(false);
    }
  };

  // Sube guncelle
  const handleSave = async () => {
    if (!id) return;
    try {
      // Komisyon oranı zorunlu
      if (!formData.commission_rate) {
        alert('Komisyon orani zorunludur');
        return;
      }
      
      const commissionRate = parseFloat(formData.commission_rate);
      
      // Acente komisyonundan fazla olamaz kontrolü
      if (commissionRate > maxCommissionRate) {
        alert(`Komisyon orani acente komisyonundan (%${maxCommissionRate}) fazla olamaz`);
        return;
      }
      
      setSaving(true);
      
      const updateData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        commission_rate: commissionRate
      };
      
      await branchService.update(id, updateData);
      await fetchBranchDetail();
      setIsEditMode(false);
    } catch (error: any) {
      console.error('Sube guncellenirken hata:', error);
      alert(error.response?.data?.message || 'Sube guncellenirken hata olustu');
    } finally {
      setSaving(false);
    }
  };

  // Sube sil
  const handleDelete = async () => {
    if (!id) return;
    try {
      await branchService.delete(id);
      navigate('/branches');
    } catch (error) {
      console.error('Sube silinirken hata:', error);
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
        return 'Acente Yoneticisi';
      case UserRole.BRANCH_ADMIN:
        return 'Sube Yoneticisi';
      case UserRole.BRANCH_USER:
        return 'Kullanici';
      default:
        return role;
    }
  };

  // Duzenlemeyi iptal et
  const handleCancelEdit = () => {
    if (branch) {
      setFormData({
        name: branch.name || '',
        address: branch.address || '',
        phone: branch.phone || '',
        commission_rate: String(branch.commission_rate)
      });
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

  if (!branch) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sube bulunamadi</p>
        <Button variant="link" onClick={() => navigate('/branches')}>
          Subelere don
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/branches')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
              {branch.name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{branch.name}</h1>
                <Badge variant={branch.status === 'active' ? 'success' : 'secondary'}>
                  {branch.status === 'active' ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span>{branch.agency?.name || 'Acente'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Aksiyonlar */}
        {canEdit && (
          <div className="flex items-center gap-2">
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

      {/* Istatistik Kartlari */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {/* Komisyon Oranı Kartı */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
              <Percent className="h-4 w-4" />
              <span className="text-sm font-medium">Komisyon Orani</span>
            </div>
            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              %{Number(branch.commission_rate).toFixed(1)}
            </p>
            {branch.agency_max_commission && (
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70 mt-1">
                Maks: %{branch.agency_max_commission}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-sm">Toplam Satis</span>
            </div>
            <p className="text-2xl font-bold">
              {branch.stats?.total_sales || 0}
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
              {formatCurrency(branch.stats?.total_revenue || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Komisyon</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(branch.stats?.total_commission || 0)}
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
              {branch.stats?.customer_count || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Calisan</span>
            </div>
            <p className="text-2xl font-bold">
              {branch.stats?.active_user_count || 0} / {branch.stats?.user_count || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Icerik */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Bilgiler */}
        <div className="lg:col-span-1 space-y-6">
          {/* Sube Bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle>Sube Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditMode ? (
                // Duzenleme modu
                <>
                  <div className="space-y-2">
                    <Label>Sube Adi</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Adres</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefon</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  
                  {/* Komisyon Oranı Düzenleme - ZORUNLU */}
                  <div className="space-y-3 p-4 rounded-lg border bg-purple-50/50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-700">
                    <Label className="text-sm font-medium flex items-center gap-2 text-purple-700 dark:text-purple-400">
                      <Percent className="h-4 w-4" />
                      Komisyon Orani *
                    </Label>
                    
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max={maxCommissionRate}
                        placeholder="Orn: 20"
                        value={formData.commission_rate}
                        onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                        className="w-24"
                        required
                      />
                      <span className="text-sm text-muted-foreground">%</span>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Komisyon orani zorunludur ve acente komisyonundan
                      <span className="font-semibold text-purple-600 dark:text-purple-400"> (maks. %{maxCommissionRate}) </span>
                      fazla olamaz.
                    </p>
                  </div>
                </>
              ) : (
                // Goruntuleme modu
                <>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Acente</p>
                      <p className="font-medium">{branch.agency?.name || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Adres</p>
                      <p className="font-medium">{branch.address || '-'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Telefon</p>
                      <p className="font-medium">{branch.phone || '-'}</p>
                    </div>
                  </div>
                  {/* Komisyon Bilgisi */}
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                    <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Komisyon Orani</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-purple-700 dark:text-purple-300">
                          %{Number(branch.commission_rate).toFixed(1)}
                        </p>
                        {branch.agency_max_commission && (
                          <span className="text-xs text-muted-foreground">
                            (maks: %{branch.agency_max_commission})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Kayit Tarihi</p>
                      <p className="font-medium">{formatDate(branch.created_at)}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* En Iyi Performans Gosteren Calisanlar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                En Iyi Performans
              </CardTitle>
              <CardDescription>
                En cok satis yapan calisanlar
              </CardDescription>
            </CardHeader>
            <CardContent>
              {branch.stats?.user_performance && branch.stats.user_performance.length > 0 ? (
                <div className="space-y-3">
                  {branch.stats.user_performance.map((user, index) => (
                    <div key={user.user_id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white font-semibold ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-muted-foreground'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.user_name}</p>
                          <p className="text-sm text-muted-foreground">{user.sales_count} satis</p>
                        </div>
                      </div>
                      <span className="font-semibold text-emerald-600">
                        {formatCurrency(user.total_revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  Henuz veri bulunmuyor
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sag Kolon - Detaylar */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="sales" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="sales">Son Satislar</TabsTrigger>
              <TabsTrigger value="users">Calisanlar</TabsTrigger>
              <TabsTrigger value="trend">Aylik Trend</TabsTrigger>
            </TabsList>

            {/* Son Satislar */}
            <TabsContent value="sales">
              <Card>
                <CardHeader>
                  <CardTitle>Son Satislar</CardTitle>
                  <CardDescription>
                    Subenin son 10 satisi
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {branch.stats?.recent_sales && branch.stats.recent_sales.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tarih</TableHead>
                            <TableHead>Musteri</TableHead>
                            <TableHead>Paket</TableHead>
                            <TableHead>Calisan</TableHead>
                            <TableHead className="text-right">Tutar</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branch.stats.recent_sales.map((sale) => (
                            <TableRow key={sale.id}>
                              <TableCell>{formatDate(sale.created_at)}</TableCell>
                              <TableCell>{sale.customer_name}</TableCell>
                              <TableCell>{sale.package_name}</TableCell>
                              <TableCell>{sale.user_name}</TableCell>
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

            {/* Calisanlar */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Calisanlar</CardTitle>
                  <CardDescription>
                    Subede calisan kullanicilar ({branch.users?.length || 0} kisi)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {branch.users && branch.users.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ad Soyad</TableHead>
                            <TableHead>E-posta</TableHead>
                            <TableHead>Telefon</TableHead>
                            <TableHead>Rol</TableHead>
                            <TableHead>Durum</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {branch.users.map((user: any) => (
                            <TableRow 
                              key={user.id} 
                              className="cursor-pointer hover:bg-muted/50"
                              onClick={() => navigate(`/users/${user.id}`)}
                            >
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                                    {user.name?.[0]}{user.surname?.[0]}
                                  </div>
                                  {user.name} {user.surname}
                                </div>
                              </TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>{user.phone || '-'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getRoleName(user.role)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={user.is_active ? 'success' : 'secondary'}>
                                  {user.is_active ? 'Aktif' : 'Pasif'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">Henuz calisan bulunmuyor</p>
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
                  {branch.stats?.monthly_sales && branch.stats.monthly_sales.length > 0 ? (
                    <div className="space-y-3">
                      {branch.stats.monthly_sales.map((item, index) => (
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
            <AlertDialogTitle>Subeyi Silmek Istediginize Emin Misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{branch.name}</strong> subesi silinecek.
              <br /><br />
              Bu islem geri alinamaz. Subeye bagli tum veriler de silinecektir.
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

