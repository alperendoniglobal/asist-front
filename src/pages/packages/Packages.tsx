import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { packageService } from '@/services/apiService';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import type { Package, PackageCover } from '@/types';
import { UserRole, EntityStatus } from '@/types';
import { 
  Plus, Search, Eye, Package as PackageIcon,
  Shield, Edit, Trash2, Save, X, Car, Bike, Truck, Clock, Check, ShoppingCart
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

  const navigate = useNavigate();

  /** Silme onayı bekleyen paket (yanlışlıkla silmeyi önlemek için ayrı onay) */
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);

  /** Detay modalından yeni satış sayfasına paketi seçili şekilde götür */
  const handleBuyPackage = (pkg: Package) => {
    setIsViewOpen(false);
    navigate(`/dashboard/sales/new?package_id=${encodeURIComponent(pkg.id)}`);
  };

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

  /** Silme isteği → onay diyaloğunu açar (doğrudan silmez) */
  const handleDelete = (pkg: Package) => {
    setPackageToDelete(pkg);
  };

  /** Onay diyaloğunda onaylandığında gerçek silme işlemi */
  const confirmDeletePackage = async () => {
    const pkg = packageToDelete;
    if (!pkg) return;
    try {
      await packageService.delete(pkg.id);
      setPackageToDelete(null);
      setIsViewOpen(false);
      fetchPackages();
      toast.success(`"${pkg.name}" paketi silindi`);
    } catch (error) {
      console.error('Paket silinirken hata:', error);
      setPackageToDelete(null);
      toast.error('Paket silinemedi!');
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Arama */}
          <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
              placeholder="Paket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-9 w-full sm:w-[240px]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  aria-label="Aramayı temizle"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          {isSuperAdmin && (
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              Yeni Paket
            </Button>
          )}
        </div>
          </div>

      {/* ===== SOL FİLTRE + SAĞ PAKETLER ===== */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Sol Kolon - Kategori Filtreleri */}
        <aside className="w-full lg:w-56 xl:w-64 shrink-0 lg:sticky lg:top-20">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Araç Kategorisi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Mobil: yatay kaydırmalı çipler / Masaüstü: dikey liste */}
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors shrink-0 lg:w-full whitespace-nowrap",
                    activeTab === 'all'
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  <PackageIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">Tümü</span>
                  <span className={cn(
                    "text-xs tabular-nums rounded-full px-1.5 py-0.5",
                    activeTab === 'all' ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                  )}>
                    {packages.length}
                  </span>
                </button>

                {activeCategories.map(category => {
                  const Icon = getVehicleIcon(category);
                  const isActive = activeTab === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setActiveTab(category)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors shrink-0 lg:w-full whitespace-nowrap",
                        isActive
                          ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted text-foreground/80"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-left">{category}</span>
                      <span className={cn(
                        "text-xs tabular-nums rounded-full px-1.5 py-0.5",
                        isActive ? "bg-primary-foreground/20" : "bg-muted text-muted-foreground"
                      )}>
                        {categoryCounts[category]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Sağ Kolon - Paket Kartları */}
        <div className="flex-1 min-w-0 w-full">
      {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div className="h-8 w-8 rounded-lg bg-muted" />
                        <div className="space-y-1.5 flex-1">
                          <div className="h-3 w-3/4 rounded bg-muted" />
                          <div className="h-2.5 w-1/2 rounded bg-muted" />
                        </div>
                      </div>
                      <div className="h-5 w-14 rounded-full bg-muted" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <div className="h-7 w-28 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-8 w-full rounded bg-muted" />
                  </CardContent>
                </Card>
              ))}
        </div>
      ) : filteredPackages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
                <PackageIcon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                {searchQuery ? (
                  <>
                    <p className="font-medium">"{searchQuery}" için sonuç bulunamadı</p>
                    <p className="text-sm text-muted-foreground mt-1">Farklı bir arama deneyin veya filtreyi temizleyin.</p>
                    <Button variant="outline" size="sm" className="mt-4" onClick={() => setSearchQuery('')}>
                      <X className="h-4 w-4 mr-1" />
                      Aramayı Temizle
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Bu kategoride paket bulunmuyor</p>
                )}
          </CardContent>
        </Card>
      ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPackages.map((pkg) => {
                const VehicleIcon = getVehicleIcon(pkg.vehicle_type);
            return (
                    <Card 
                      key={pkg.id} 
                    className={cn(
                      "group flex flex-col hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer border hover:border-primary/50",
                      pkg.status !== EntityStatus.ACTIVE && "opacity-70"
                    )}
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
                      <div className="mb-3">
                        <div className="text-2xl font-bold text-primary leading-tight">
                          {formatCurrency(pkg.price)}
                        </div>
                        <p className="text-[11px] text-muted-foreground">KDV dahil / yıllık</p>
                      </div>

                      {/* Bilgiler */}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground border-t pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          Max {pkg.max_vehicle_age} yaş
                        </span>
                        {typeof pkg.covers?.length === 'number' && pkg.covers.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Shield className="h-3.5 w-3.5" />
                            {pkg.covers.length} teminat
                          </span>
                        )}
                      </div>

                      {/* Aksiyonlar */}
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-8 gap-1"
                          onClick={(e) => { e.stopPropagation(); handleView(pkg); }}
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Detay
                        </Button>
                        {pkg.status === EntityStatus.ACTIVE && (
                          <Button
                            size="sm"
                            className="flex-1 h-8 gap-1"
                            onClick={(e) => { e.stopPropagation(); handleBuyPackage(pkg); }}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            Satın Al
                          </Button>
                        )}
                      </div>
                      </CardContent>
                    </Card>
            );
          })}
        </div>
      )}
        </div>
      </div>

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
        <DialogContent className="max-w-3xl w-[calc(100vw-2rem)] max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                  <PackageIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="truncate">{selectedPackage?.name}</DialogTitle>
                  <DialogDescription className="line-clamp-2">{selectedPackage?.description || 'Açıklama yok'}</DialogDescription>
                </div>
              </div>
              {/* Not: Sil butonu bilinçli olarak burada DEĞİL — modalın kapatma (X)
                  butonuna yakın olduğu için yanlışlıkla tıklanma riski var.
                  Silme işlemi modalın en altındaki "Tehlikeli Alan" bölümünde. */}
              <div className="flex gap-2 shrink-0 mr-8">
                {isSuperAdmin && selectedPackage && (
                  <Button variant="outline" size="sm" onClick={() => handleEdit(selectedPackage)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Düzenle
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          {/* Kaydırılabilir gövde */}
          <div className="flex-1 overflow-y-auto px-6 py-4 min-h-0">
          {/* Paket Bilgileri */}
          {selectedPackage && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground">Fiyat</p>
                <p className="text-xl font-bold text-primary leading-tight">{formatCurrency(selectedPackage.price)}</p>
                <p className="text-[11px] text-muted-foreground">KDV dahil / yıllık</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Araç Türü</p>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  {(() => { const I = getVehicleIcon(selectedPackage.vehicle_type); return <I className="h-4 w-4 text-primary" />; })()}
                  {selectedPackage.vehicle_type}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Max Araç Yaşı</p>
                <p className="font-medium flex items-center gap-1.5 mt-0.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {selectedPackage.max_vehicle_age} yıl
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Durum</p>
                <Badge variant={statusColors[selectedPackage.status]} className="mt-1">
                  {statusLabels[selectedPackage.status]}
                </Badge>
              </div>
            </div>
          )}

          {/* Kapsamlar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Paket Kapsamları
                {!detailsLoading && packageCovers.length > 0 && (
                  <Badge variant="secondary" className="ml-1">{packageCovers.length}</Badge>
                )}
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
              <>
                {/* Masaüstü: tablo */}
                <div className="rounded-md border hidden sm:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Teminat</TableHead>
                      <TableHead className="text-center w-[110px]">Kullanım</TableHead>
                      <TableHead className="text-right w-[140px]">Limit</TableHead>
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
                        <TableCell className="text-right font-medium tabular-nums">
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

                {/* Mobil: kart listesi */}
                <div className="space-y-2 sm:hidden">
                  {packageCovers.map((cover) => (
                    <div key={cover.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm">{cover.title}</p>
                          {cover.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{cover.description}</p>
                          )}
                        </div>
                        {isSuperAdmin && (
                          <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openCoverModal(cover)}>
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteCover(cover)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                        <Badge variant="secondary">{cover.usage_count}x kullanım</Badge>
                        <span className="font-semibold tabular-nums">{formatCurrency(cover.limit_amount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Tehlikeli Alan - kapatma butonundan uzakta, en altta */}
          {isSuperAdmin && selectedPackage && (
            <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-medium text-sm text-destructive">Tehlikeli Alan</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paketi silmek geri alınamaz. Bu pakete bağlı satışlar etkilenebilir.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="shrink-0 gap-1"
                  onClick={() => handleDelete(selectedPackage)}
                >
                  <Trash2 className="h-4 w-4" />
                  Paketi Sil
                </Button>
              </div>
            </div>
          )}
          </div>

          {/* Alt CTA - sabit */}
          {selectedPackage?.status === EntityStatus.ACTIVE && (
            <DialogFooter className="p-4 border-t bg-muted/30 shrink-0 sm:justify-between gap-3">
              <div className="text-sm text-muted-foreground">
                Toplam:{' '}
                <span className="text-lg font-bold text-primary">{formatCurrency(selectedPackage.price)}</span>
                <span className="text-xs ml-1">(KDV dahil)</span>
              </div>
              <Button onClick={() => handleBuyPackage(selectedPackage)} className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Bu Paketi Satın Al
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ===== PAKET SİLME ONAYI ===== */}
      <AlertDialog open={!!packageToDelete} onOpenChange={(open) => !open && setPackageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paketi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{packageToDelete?.name}</strong> paketi kalıcı olarak
              silinecek. Bu işlem geri alınamaz ve pakete bağlı satışlar etkilenebilir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePackage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Evet, Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
