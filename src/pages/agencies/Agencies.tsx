import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { agencyService } from '@/services/apiService';
import type { Agency } from '@/types';
import { EntityStatus } from '@/types';
import { formatIBAN, validateIBAN } from '@/utils/validators';
import { 
  Plus, Search, Edit, Trash2, Eye, Building2, 
  Phone, Mail, MapPin, Wallet, RefreshCcw, Calendar, Percent, Upload, X, Image as ImageIcon, CreditCard, CheckCircle2
} from 'lucide-react';

// Durum etiketleri ve renkleri
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

export default function Agencies() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  
  // Form state - komisyon oranı eklendi
  const [formData, setFormData] = useState({
    name: '',
    tax_number: '',
    address: '',
    phone: '',
    email: '',
    commission_rate: 20, // Varsayılan %20 komisyon
    status: EntityStatus.ACTIVE,
    logo: null as string | null, // Base64 logo
    account_name: '', // Banka hesap adı
    iban: '' // IBAN
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const data = await agencyService.getAll();
      setAgencies(data);
    } catch (error) {
      console.error('Acenteler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgencies = agencies.filter(agency =>
    agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agency.tax_number?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
    // IBAN validasyonu - IBAN girildiyse geçerli format olmalı
    if (formData.iban && formData.iban.trim().length > 0) {
      if (!validateIBAN(formData.iban)) {
        alert('Lütfen geçerli bir IBAN formatı giriniz (TR + 24 karakter)');
        return;
      }
    }
    
    try {
      await agencyService.create(formData);
      setIsCreateOpen(false);
      resetForm();
      fetchAgencies();
      alert('Acente başarıyla oluşturuldu!');
    } catch (error) {
      console.error('Acente oluşturulurken hata:', error);
      alert('Acente oluşturulamadı!');
    }
  };

  const handleUpdate = async () => {
    if (!selectedAgency) return;
    
    // IBAN validasyonu - IBAN girildiyse geçerli format olmalı
    if (formData.iban && formData.iban.trim().length > 0) {
      if (!validateIBAN(formData.iban)) {
        alert('Lütfen geçerli bir IBAN formatı giriniz (TR + 24 karakter)');
        return;
      }
    }
    
    try {
      await agencyService.update(selectedAgency.id, formData);
      setIsEditOpen(false);
      resetForm();
      fetchAgencies();
      alert('Acente başarıyla güncellendi!');
    } catch (error) {
      console.error('Acente güncellenirken hata:', error);
      alert('Acente güncellenemedi!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu acenteyi silmek istediğinize emin misiniz?')) return;
    try {
      await agencyService.delete(id);
      fetchAgencies();
      alert('Acente başarıyla silindi!');
    } catch (error) {
      console.error('Acente silinirken hata:', error);
      alert('Acente silinemedi!');
    }
  };

  const handleView = (agency: Agency) => {
    setSelectedAgency(agency);
    setIsViewOpen(true);
  };

  const handleEdit = (agency: Agency) => {
    setSelectedAgency(agency);
    setFormData({
      name: agency.name,
      tax_number: agency.tax_number || '',
      address: agency.address || '',
      phone: agency.phone || '',
      email: agency.email || '',
      commission_rate: Number(agency.commission_rate) || 20,
      status: agency.status,
      logo: agency.logo || null,
      account_name: agency.account_name || '',
      iban: agency.iban || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      tax_number: '',
      address: '',
      phone: '',
      email: '',
      commission_rate: 20,
      status: EntityStatus.ACTIVE,
      logo: null,
      account_name: '',
      iban: ''
    });
    setSelectedAgency(null);
  };

  // Logo yükleme fonksiyonu - Base64'e çevirir
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya tipi kontrolü (sadece resim)
    if (!file.type.startsWith('image/')) {
      alert('Lütfen bir resim dosyası seçin!');
      return;
    }

    // Dosya boyutu kontrolü (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo dosyası 2MB\'dan büyük olamaz!');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setFormData({ ...formData, logo: base64String });
    };
    reader.onerror = () => {
      alert('Logo yüklenirken bir hata oluştu!');
    };
    reader.readAsDataURL(file);
  };

  // Logo silme fonksiyonu
  const handleLogoRemove = () => {
    setFormData({ ...formData, logo: null });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  // Para formatı - Backend'den string gelebilir, güvenli dönüşüm
  const formatCurrency = (value: number | string | undefined | null) => {
    const numValue = Number(value) || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(numValue);
  };

  // İstatistikler
  // Not: Backend'den decimal değerler string olarak gelebilir, Number() ile çeviriyoruz
  const stats = {
    total: agencies.length,
    active: agencies.filter(a => a.status === EntityStatus.ACTIVE).length,
    totalBalance: agencies.reduce((sum, a) => sum + (Number(a.balance) || 0), 0),
    avgCommission: agencies.length > 0 
      ? agencies.reduce((sum, a) => sum + (Number(a.commission_rate) || 0), 0) / agencies.length 
      : 0
  };

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Acenteler
          </h1>
          <p className="text-muted-foreground">Tüm acenteleri görüntüleyin ve yönetin</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Acente
        </Button>
      </div>

      {/* ===== İSTATİSTİK KARTLARI ===== */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Acente</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Acente</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Bakiye</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ort. Komisyon</p>
                <p className="text-2xl font-bold">%{stats.avgCommission.toFixed(1)}</p>
              </div>
              <Percent className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== ARAMA ===== */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acente Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Acente adı veya vergi numarası..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setSearchQuery('')} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ===== ACENTE LİSTESİ ===== */}
      <Card>
        <CardHeader>
          <CardTitle>Acente Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredAgencies.length} acente bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAgencies.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz acente bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Acente Adı</TableHead>
                    <TableHead>Vergi No</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead className="text-center">Komisyon</TableHead>
                    <TableHead>Bakiye</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAgencies.map((agency) => (
                    <TableRow key={agency.id} className="hover:bg-muted/50">
                      <TableCell>
                        {agency.logo ? (
                          <img 
                            src={agency.logo} 
                            alt={`${agency.name} logosu`}
                            className="h-10 w-10 object-contain rounded"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{agency.name}</TableCell>
                      <TableCell className="font-mono">{agency.tax_number || '-'}</TableCell>
                      <TableCell>{agency.phone || '-'}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-semibold">
                          %{Number(agency.commission_rate) || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(agency.balance)}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[agency.status]}>
                          {statusLabels[agency.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(agency)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(agency)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(agency.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== YENİ ACENTE MODAL ===== */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Acente</DialogTitle>
            <DialogDescription>Yeni acente kaydı oluşturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* İki Kolonlu Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sol Kolon */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Acente Adı *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Örn: ABC Sigorta Acentesi"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax_number">Vergi Numarası</Label>
                    <Input
                      id="tax_number"
                      value={formData.tax_number}
                      onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                      placeholder="1234567890"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="commission_rate">Komisyon Oranı (%) *</Label>
                    <Input
                      id="commission_rate"
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="0XXX XXX XXXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="info@acente.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="address">Adres</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Acente adresi..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-4">
                {/* Logo Yükleme */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  {formData.logo ? (
                    <div className="relative">
                      <div className="border rounded-lg p-4 flex items-center gap-4">
                        <img 
                          src={formData.logo} 
                          alt="Acente logosu" 
                          className="h-20 w-20 object-contain rounded border"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Logo yüklendi</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLogoRemove}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Logoyu Kaldır
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <Label htmlFor="logo-upload" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Logo Yükle
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG veya GIF (Max 2MB)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Durum</Label>
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

                {/* Hesap Bilgileri */}
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    <Label className="text-base font-semibold">Hesap Bilgileri</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account_name">Hesap Adı</Label>
                    <Input
                      id="account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="Banka hesap adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => {
                        const formatted = formatIBAN(e.target.value);
                        setFormData({ ...formData, iban: formatted });
                      }}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={34}
                    />
                    {formData.iban && formData.iban.trim().length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        {validateIBAN(formData.iban) ? (
                          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span>Geçerli IBAN formatı</span>
                          </div>
                        ) : formData.iban.replace(/\s/g, '').length >= 26 ? (
                          <p className="text-xs text-red-500">Geçersiz IBAN formatı</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">TR + 24 karakter giriniz</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={!formData.name}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DÜZENLE MODAL ===== */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Acente Düzenle</DialogTitle>
            <DialogDescription>Acente bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* İki Kolonlu Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sol Kolon */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Acente Adı *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_tax_number">Vergi Numarası</Label>
                    <Input
                      id="edit_tax_number"
                      value={formData.tax_number}
                      onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_commission_rate">Komisyon Oranı (%) *</Label>
                    <Input
                      id="edit_commission_rate"
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })}
                      min={0}
                      max={100}
                      step={0.5}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_phone">Telefon</Label>
                    <Input
                      id="edit_phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_email">E-posta</Label>
                    <Input
                      id="edit_email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit_address">Adres</Label>
                  <Textarea
                    id="edit_address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-4">
                {/* Logo Yükleme */}
                <div className="space-y-2">
                  <Label>Logo</Label>
                  {formData.logo ? (
                    <div className="relative">
                      <div className="border rounded-lg p-4 flex items-center gap-4">
                        <img 
                          src={formData.logo} 
                          alt="Acente logosu" 
                          className="h-20 w-20 object-contain rounded border"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground">Logo yüklendi</p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleLogoRemove}
                            className="mt-2"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Logoyu Kaldır
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed rounded-lg p-6 text-center">
                      <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                      <Label htmlFor="logo-upload-edit" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            Logo Yükle
                          </span>
                        </Button>
                      </Label>
                      <Input
                        id="logo-upload-edit"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        PNG, JPG veya GIF (Max 2MB)
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Durum</Label>
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

                {/* Hesap Bilgileri */}
                <div className="space-y-4 p-4 border rounded-lg bg-slate-50">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-slate-600" />
                    <Label className="text-base font-semibold">Hesap Bilgileri</Label>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_account_name">Hesap Adı</Label>
                    <Input
                      id="edit_account_name"
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="Banka hesap adı"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit_iban">IBAN</Label>
                    <Input
                      id="edit_iban"
                      value={formData.iban}
                      onChange={(e) => {
                        const formatted = formatIBAN(e.target.value);
                        setFormData({ ...formData, iban: formatted });
                      }}
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={34}
                    />
                    {formData.iban && formData.iban.trim().length > 0 && (
                      <div className="flex items-center gap-2 mt-1">
                        {validateIBAN(formData.iban) ? (
                          <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
                            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                            <span>Geçerli IBAN formatı</span>
                          </div>
                        ) : formData.iban.replace(/\s/g, '').length >= 26 ? (
                          <p className="text-xs text-red-500">Geçersiz IBAN formatı</p>
                        ) : (
                          <p className="text-xs text-muted-foreground">TR + 24 karakter giriniz</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>İptal</Button>
            <Button onClick={handleUpdate} disabled={!formData.name}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== DETAY MODAL ===== */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-6 w-6" />
              {selectedAgency?.name}
            </DialogTitle>
            <DialogDescription>Acente detayları ve şubeleri</DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sol Kolon - Acente Bilgileri */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Acente Bilgileri</h3>
              
              {/* Komisyon ve Bakiye Kartları */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-lg bg-primary/10 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Percent className="h-3 w-3" />
                    Komisyon
                  </div>
                  <p className="text-2xl font-bold text-primary">%{Number(selectedAgency?.commission_rate) || 0}</p>
                </div>
                <div className="p-4 rounded-lg bg-emerald-500/10 text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground text-xs mb-1">
                    <Wallet className="h-3 w-3" />
                    Bakiye
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(selectedAgency?.balance || 0)}</p>
                </div>
              </div>

              {/* Detay Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground text-xs mb-1">Vergi No</div>
                  <p className="font-mono font-medium text-sm">{selectedAgency?.tax_number || '-'}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-muted-foreground text-xs mb-1">Durum</div>
                  {selectedAgency && (
                    <Badge variant={statusColors[selectedAgency.status]}>
                      {statusLabels[selectedAgency.status]}
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <Phone className="h-3 w-3" />
                  Telefon
                </div>
                <p className="font-medium text-sm">{selectedAgency?.phone || '-'}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <Mail className="h-3 w-3" />
                  E-posta
                </div>
                <p className="font-medium text-sm">{selectedAgency?.email || '-'}</p>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                  <MapPin className="h-3 w-3" />
                  Adres
                </div>
                <p className="font-medium text-sm">{selectedAgency?.address || '-'}</p>
              </div>

              {/* Hesap Bilgileri */}
              {(selectedAgency?.account_name || selectedAgency?.iban) && (
                <div className="p-4 rounded-lg border bg-blue-50/50">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <Label className="text-sm font-semibold text-blue-900">Hesap Bilgileri</Label>
                  </div>
                  {selectedAgency.account_name && (
                    <div className="mb-2">
                      <div className="text-muted-foreground text-xs mb-1">Hesap Adı</div>
                      <p className="font-medium text-sm">{selectedAgency.account_name}</p>
                    </div>
                  )}
                  {selectedAgency.iban && (
                    <div>
                      <div className="text-muted-foreground text-xs mb-1">IBAN</div>
                      <p className="font-mono font-medium text-sm">{selectedAgency.iban}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                    <Calendar className="h-3 w-3" />
                    Kayıt Tarihi
                  </div>
                  <p className="font-medium text-sm">{selectedAgency && formatDate(selectedAgency.created_at)}</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-1 text-muted-foreground text-xs mb-1">
                    <RefreshCcw className="h-3 w-3" />
                    Son Güncelleme
                  </div>
                  <p className="font-medium text-sm">{selectedAgency && formatDate(selectedAgency.updated_at)}</p>
                </div>
              </div>
            </div>
            
            {/* Sağ Kolon - Şubeler */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Şubeler
                {selectedAgency?.branches && (
                  <Badge variant="secondary" className="ml-auto">
                    {selectedAgency.branches.length} şube
                  </Badge>
                )}
              </h3>
              
              {selectedAgency?.branches && selectedAgency.branches.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {selectedAgency.branches.map((branch) => (
                    <div key={branch.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-sm">{branch.name}</h4>
                        <Badge variant={branch.is_active ? 'default' : 'secondary'} className="text-xs">
                          {branch.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          <span>{branch.phone || '-'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{branch.address || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs pt-1 border-t mt-2">
                          <Calendar className="h-3 w-3" />
                          <span>Kayıt: {formatDate(branch.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Henüz şube eklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

