import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { packageService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Package, PackageCover } from '@/types';
import { UserRole, EntityStatus } from '@/types';
import { 
  Plus, Search, Eye, Package as PackageIcon,
  Shield, Edit, Trash2, Save, X, Car, Bike, Truck, Clock, Check
} from 'lucide-react';

// ===== ARAÇ TÜRLERİ =====
const VEHICLE_TYPES = [
  'Otomobil',
  'Motosiklet',
  'Minibüs',
  'Midibüs',
  'Kamyonet',
  'Kamyon',
  'Taksi',
  'Çekici'
];

// Araç türüne göre ikon
const getVehicleIcon = (type: string) => {
  switch (type) {
    case 'Motosiklet':
      return Bike;
    case 'Kamyon':
    case 'Kamyonet':
    case 'Çekici':
      return Truck;
    default:
      return Car;
  }
};

// ===== STATUS LABELS & COLORS =====
const statusLabels: Record<EntityStatus, string> = {
  [EntityStatus.ACTIVE]: 'Aktif',
  [EntityStatus.INACTIVE]: 'Pasif',
  [EntityStatus.SUSPENDED]: 'Askıda'
};

const statusColors: Record<EntityStatus, 'default' | 'secondary' | 'destructive'> = {
  [EntityStatus.ACTIVE]: 'default',
  [EntityStatus.INACTIVE]: 'secondary',
  [EntityStatus.SUSPENDED]: 'destructive'
};

export default function Packages() {
  const { user } = useAuth();
  
  // ===== STATE =====
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Modal state'leri
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  
  // Seçili paket ve detaylar
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [packageCovers, setPackageCovers] = useState<PackageCover[]>([]);
  const [editingCover, setEditingCover] = useState<PackageCover | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Form state'leri
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vehicle_type: 'Otomobil',
    price: 0,
    max_vehicle_age: 40,
    status: EntityStatus.ACTIVE
  });
  
  const [coverFormData, setCoverFormData] = useState({
    title: '',
    description: '',
    usage_count: 1,
    limit_amount: 0,
    sort_order: 0
  });

  // Super Admin kontrolü
  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  // ===== VERİ YÜKLEME =====
  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const data = await packageService.getAll();
      setPackages(data);
    } catch (error) {
      console.error('Paketler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Paket detaylarını yükle
  const loadPackageDetails = async (pkg: Package) => {
    setDetailsLoading(true);
    try {
      const covers = await packageService.getCovers(pkg.id);
      setPackageCovers(covers);
    } catch (error) {
      console.error('Paket detayları yüklenirken hata:', error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // ===== FİLTRELEME =====
  const filteredPackages = packages.filter(pkg => {
    const matchesSearch = pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === 'all' || pkg.vehicle_type === activeTab;
    return matchesSearch && matchesType;
  });

  // Kategorileri ve paket sayılarını hesapla
  const categoryCounts = packages.reduce((acc, pkg) => {
    acc[pkg.vehicle_type] = (acc[pkg.vehicle_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Aktif kategoriler (en az 1 paket olanlar)
  const activeCategories = Object.keys(categoryCounts).sort();

  // ===== PAKET İŞLEMLERİ =====
  
  const handleCreate = async () => {
    try {
      await packageService.create(formData);
      setIsCreateOpen(false);
      resetForm();
      fetchPackages();
      alert('Paket başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Paket oluşturulurken hata:', error);
      alert('Paket oluşturulamadı!');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPackage) return;
    try {
      await packageService.update(selectedPackage.id, formData);
      setIsEditOpen(false);
      resetForm();
      fetchPackages();
      if (isViewOpen) {
        const updatedPkg = await packageService.getById(selectedPackage.id);
        setSelectedPackage(updatedPkg);
      }
      alert('Paket başarıyla güncellendi!');
    } catch (error) {
      console.error('Paket güncellenirken hata:', error);
      alert('Paket güncellenemedi!');
    }
  };

  const handleDelete = async (pkg: Package) => {
    if (!confirm(`"${pkg.name}" paketini silmek istediğinize emin misiniz?`)) return;
    try {
      await packageService.delete(pkg.id);
      fetchPackages();
      setIsViewOpen(false);
      alert('Paket başarıyla silindi!');
    } catch (error) {
      console.error('Paket silinirken hata:', error);
      alert('Paket silinemedi!');
    }
  };

  const handleView = async (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsViewOpen(true);
    await loadPackageDetails(pkg);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      vehicle_type: pkg.vehicle_type,
      price: pkg.price,
      max_vehicle_age: pkg.max_vehicle_age,
      status: pkg.status
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      vehicle_type: 'Otomobil',
      price: 0,
      max_vehicle_age: 40,
      status: EntityStatus.ACTIVE
    });
  };

  // ===== KAPSAM İŞLEMLERİ =====
  
  const openCoverModal = (cover?: PackageCover) => {
    if (cover) {
      setEditingCover(cover);
      setCoverFormData({
        title: cover.title,
        description: cover.description || '',
        usage_count: cover.usage_count,
        limit_amount: cover.limit_amount,
        sort_order: cover.sort_order
      });
    } else {
      setEditingCover(null);
      setCoverFormData({
        title: '',
        description: '',
        usage_count: 1,
        limit_amount: 0,
        sort_order: packageCovers.length + 1
      });
    }
    setIsCoverModalOpen(true);
  };

  const handleSaveCover = async () => {
    if (!selectedPackage) return;
    try {
      if (editingCover) {
        await packageService.updateCover(selectedPackage.id, editingCover.id, coverFormData);
      } else {
        await packageService.addCover(selectedPackage.id, coverFormData);
      }
      setIsCoverModalOpen(false);
      await loadPackageDetails(selectedPackage);
      alert(editingCover ? 'Kapsam güncellendi!' : 'Kapsam eklendi!');
    } catch (error) {
      console.error('Kapsam kaydedilirken hata:', error);
      alert('Kapsam kaydedilemedi!');
    }
  };

  const handleDeleteCover = async (cover: PackageCover) => {
    if (!selectedPackage) return;
    if (!confirm('Bu kapsamı silmek istediğinize emin misiniz?')) return;
    try {
      await packageService.deleteCover(selectedPackage.id, cover.id);
      await loadPackageDetails(selectedPackage);
      alert('Kapsam silindi!');
    } catch (error) {
      console.error('Kapsam silinirken hata:', error);
      alert('Kapsam silinemedi!');
    }
  };

  // ===== YARDIMCI FONKSİYONLAR =====
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(value);
  };

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <PackageIcon className="h-8 w-8 text-primary" />
            Paketler
          </h1>
          <p className="text-muted-foreground mt-1">
            {packages.length} paket • {activeCategories.length} kategori
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Arama */}
          <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
              placeholder="Paket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px]"
              />
            </div>
          {isSuperAdmin && (
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Yeni Paket
            </Button>
          )}
        </div>
          </div>

      {/* ===== KATEGORİ TAB'LARI ===== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full justify-start h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4"
          >
            Tümü ({packages.length})
          </TabsTrigger>
          {activeCategories.map(category => {
            const Icon = getVehicleIcon(category);
            return (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 gap-2"
              >
                <Icon className="h-4 w-4" />
                {category} ({categoryCounts[category]})
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* ===== PAKET KARTLARI ===== */}
        <TabsContent value={activeTab} className="mt-6">
      {loading ? (
            <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
                <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Bu kategoride paket bulunmuyor</p>
          </CardContent>
        </Card>
      ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPackages.map((pkg) => {
                const VehicleIcon = getVehicleIcon(pkg.vehicle_type);
            return (
                    <Card 
                      key={pkg.id} 
                    className="group hover:shadow-md transition-all cursor-pointer border hover:border-primary/50"
                      onClick={() => handleView(pkg)}
                    >
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <VehicleIcon className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm font-semibold line-clamp-1">
                              {pkg.name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground">{pkg.vehicle_type}</p>
                          </div>
                        </div>
                        {pkg.status === EntityStatus.ACTIVE ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/50">
                            <Check className="h-3 w-3 mr-1" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">{statusLabels[pkg.status]}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {/* Fiyat */}
                      <div className="text-2xl font-bold text-primary mb-3">
                        {formatCurrency(pkg.price)}
                      </div>
                      
                      {/* Bilgiler */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Max {pkg.max_vehicle_age} yaş</span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-primary">
                          <Eye className="h-3.5 w-3.5" />
                            Detay
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
            );
          })}
        </div>
      )}
        </TabsContent>
      </Tabs>

      {/* ===== YENİ PAKET MODAL ===== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Paket Oluştur</DialogTitle>
            <DialogDescription>Yol asistan paketi için gerekli bilgileri girin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Paket Adı *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Örn: Hususi Paket (T)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Paket hakkında kısa açıklama..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Araç Türü *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat (TL) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={10}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_vehicle_age">Max Araç Yaşı *</Label>
                <Input
                  id="max_vehicle_age"
                  type="number"
                  value={formData.max_vehicle_age}
                  onChange={(e) => setFormData({ ...formData, max_vehicle_age: parseInt(e.target.value) || 40 })}
                  min={1}
                  max={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Durum *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EntityStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.price}>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PAKET DÜZENLEME MODAL ===== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Paketi Düzenle</DialogTitle>
            <DialogDescription>{selectedPackage?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Paket Adı *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Açıklama</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Araç Türü *</Label>
                <Select
                  value={formData.vehicle_type}
                  onValueChange={(value) => setFormData({ ...formData, vehicle_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Fiyat (TL) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={10}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-max_vehicle_age">Max Araç Yaşı *</Label>
                <Input
                  id="edit-max_vehicle_age"
                  type="number"
                  value={formData.max_vehicle_age}
                  onChange={(e) => setFormData({ ...formData, max_vehicle_age: parseInt(e.target.value) || 40 })}
                  min={1}
                  max={50}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Durum *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: EntityStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>İptal</Button>
            <Button onClick={handleUpdate} disabled={!formData.name || !formData.price}>
              <Save className="h-4 w-4 mr-2" />
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== PAKET DETAY MODAL ===== */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <PackageIcon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <DialogTitle>{selectedPackage?.name}</DialogTitle>
                  <DialogDescription>{selectedPackage?.description || 'Açıklama yok'}</DialogDescription>
                </div>
              </div>
              {isSuperAdmin && selectedPackage && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(selectedPackage)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedPackage)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Sil
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {/* Paket Bilgileri */}
          {selectedPackage && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Fiyat</p>
                <p className="text-xl font-bold text-primary">{formatCurrency(selectedPackage.price)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Araç Türü</p>
                <p className="font-medium">{selectedPackage.vehicle_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Max Araç Yaşı</p>
                <p className="font-medium">{selectedPackage.max_vehicle_age} yıl</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Durum</p>
                <Badge variant={statusColors[selectedPackage.status]}>
                  {statusLabels[selectedPackage.status]}
                </Badge>
              </div>
            </div>
          )}

          {/* Kapsamlar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Paket Kapsamları
              </h3>
              {isSuperAdmin && (
                <Button onClick={() => openCoverModal()} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Kapsam Ekle
                </Button>
              )}
            </div>
            
            {detailsLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : packageCovers.length === 0 ? (
              <div className="text-center py-8 border rounded-lg">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Kapsam bilgisi bulunmuyor</p>
                {isSuperAdmin && (
                  <Button onClick={() => openCoverModal()} className="mt-4" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Kapsamı Ekle
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teminat</TableHead>
                      <TableHead className="text-center">Kullanım</TableHead>
                      <TableHead className="text-right">Limit</TableHead>
                      {isSuperAdmin && <TableHead className="w-[80px]"></TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {packageCovers.map((cover) => (
                      <TableRow key={cover.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{cover.title}</p>
                            {cover.description && (
                              <p className="text-xs text-muted-foreground">{cover.description}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">{cover.usage_count}x</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(cover.limit_amount)}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openCoverModal(cover)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteCover(cover)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== KAPSAM MODAL ===== */}
      <Dialog open={isCoverModalOpen} onOpenChange={setIsCoverModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCover ? 'Kapsam Düzenle' : 'Yeni Kapsam Ekle'}</DialogTitle>
            <DialogDescription>Teminat bilgilerini girin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cover_title">Teminat Adı *</Label>
              <Input
                id="cover_title"
                value={coverFormData.title}
                onChange={(e) => setCoverFormData({ ...coverFormData, title: e.target.value })}
                placeholder="Örn: Çekici Hizmeti Kaza"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cover_description">Açıklama</Label>
              <Textarea
                id="cover_description"
                value={coverFormData.description}
                onChange={(e) => setCoverFormData({ ...coverFormData, description: e.target.value })}
                placeholder="Teminat açıklaması..."
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usage_count">Kullanım Adedi *</Label>
                <Input
                  id="usage_count"
                  type="number"
                  value={coverFormData.usage_count}
                  onChange={(e) => setCoverFormData({ ...coverFormData, usage_count: parseInt(e.target.value) || 1 })}
                  min={1}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="limit_amount">Limit Tutarı (TL) *</Label>
                <Input
                  id="limit_amount"
                  type="number"
                  value={coverFormData.limit_amount}
                  onChange={(e) => setCoverFormData({ ...coverFormData, limit_amount: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={500}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCoverModalOpen(false)}>
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button onClick={handleSaveCover} disabled={!coverFormData.title}>
              <Save className="h-4 w-4 mr-2" />
              {editingCover ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
