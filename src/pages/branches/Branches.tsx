import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { branchService, agencyService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Branch, Agency } from '@/types';
import { UserRole } from '@/types';
import { 
  Plus, Search, Edit, Trash2, Eye, GitBranch, 
  RefreshCcw, Percent
} from 'lucide-react';

export default function Branches() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  // Form verileri - komisyon oranı ZORUNLU
  const [formData, setFormData] = useState({
    name: '',
    agency_id: '',
    address: '',
    phone: '',
    commission_rate: ''  // Zorunlu alan
  });
  
  // Seçili acentenin maksimum komisyon oranı (validasyon için)
  const [maxCommissionRate, setMaxCommissionRate] = useState<number>(100);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Komisyon bilgileriyle birlikte şubeleri getir
      const [branchesData, agenciesData] = await Promise.all([
        branchService.getAllWithCommission(),
        isSuperAdmin ? agencyService.getAll() : Promise.resolve([])
      ]);
      setBranches(branchesData);
      setAgencies(agenciesData);
    } catch (error) {
      console.error('Veriler yuklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch =>
    branch.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async () => {
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
      
      const createData = {
        name: formData.name,
        agency_id: isSuperAdmin ? formData.agency_id : user?.agency_id,
        address: formData.address,
        phone: formData.phone,
        commission_rate: commissionRate
      };
      
      await branchService.create(createData);
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Sube olusturulurken hata:', error);
      alert(error.response?.data?.message || 'Sube olusturulurken hata olustu');
    }
  };

  const handleUpdate = async () => {
    if (!selectedBranch) return;
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
      
      const updateData = {
        name: formData.name,
        agency_id: formData.agency_id,
        address: formData.address,
        phone: formData.phone,
        commission_rate: commissionRate
      };
      
      await branchService.update(selectedBranch.id, updateData);
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Sube guncellenirken hata:', error);
      alert(error.response?.data?.message || 'Sube guncellenirken hata olustu');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bu subeyi silmek istediginize emin misiniz?')) return;
    try {
      await branchService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Sube silinirken hata:', error);
    }
  };

  const handleEdit = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      agency_id: branch.agency_id,
      address: branch.address,
      phone: branch.phone,
      commission_rate: String(branch.commission_rate)
    });
    // Acentenin maksimum komisyon oranını ayarla
    if (branch.agency_max_commission) {
      setMaxCommissionRate(branch.agency_max_commission);
    } else if (branch.agency?.commission_rate) {
      setMaxCommissionRate(branch.agency.commission_rate);
    }
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      agency_id: '',
      address: '',
      phone: '',
      commission_rate: ''
    });
    setSelectedBranch(null);
    setMaxCommissionRate(100);
  };

  const getAgencyName = (agencyId: string) => {
    const agency = agencies.find(a => a.id === agencyId);
    return agency?.name || '-';
  };

  // Acente seçildiğinde maksimum komisyon oranını güncelle
  const handleAgencyChange = (agencyId: string) => {
    setFormData({ ...formData, agency_id: agencyId });
    const agency = agencies.find(a => a.id === agencyId);
    if (agency) {
      setMaxCommissionRate(agency.commission_rate);
      // Eğer mevcut komisyon oranı yeni acentenin oranından fazlaysa sıfırla
      if (formData.commission_rate && parseFloat(formData.commission_rate) > agency.commission_rate) {
        setFormData(prev => ({ ...prev, agency_id: agencyId, commission_rate: '' }));
      }
    }
  };

  // Istatistikler
  const stats = {
    total: branches.length,
    active: branches.filter(b => b.is_active).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-8 w-8" />
            Subeler
          </h1>
          <p className="text-muted-foreground">Subeleri goruntuleyip yonetin</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Sube
        </Button>
      </div>

      {/* Istatistik Kartlari */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Sube</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <GitBranch className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Sube</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <GitBranch className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sube Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Sube adi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setSearchQuery('')} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sifirla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sube Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Sube Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredBranches.length} sube bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-center py-12">
              <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henuz sube bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sube Adi</TableHead>
                    {isSuperAdmin && <TableHead>Acente</TableHead>}
                    <TableHead>Telefon</TableHead>
                    <TableHead>Komisyon Orani</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Islemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBranches.map((branch) => (
                    <TableRow 
                      key={branch.id}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                            {branch.name?.[0]}
                          </div>
                          {branch.name}
                        </div>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell>
                          <Badge variant="outline">{getAgencyName(branch.agency_id)}</Badge>
                        </TableCell>
                      )}
                      <TableCell>{branch.phone}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="default" className="gap-1">
                            <Percent className="h-3 w-3" />
                            {Number(branch.commission_rate).toFixed(1)}%
                          </Badge>
                          {branch.agency_max_commission && (
                            <span className="text-xs text-muted-foreground">
                              (max: %{branch.agency_max_commission})
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={branch.is_active ? 'success' : 'secondary'}>
                          {branch.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/branches/${branch.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detay
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => handleEdit(branch, e)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDelete(branch.id, e)}
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

      {/* Yeni Sube Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Sube</DialogTitle>
            <DialogDescription>Yeni sube kaydi olusturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Acente *</Label>
                <Select
                  value={formData.agency_id}
                  onValueChange={handleAgencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Acente secin" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name} (Komisyon: %{agency.commission_rate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">Sube Adi *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={3}
              />
            </div>
            
            {/* Komisyon Oranı Alanı - ZORUNLU */}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Iptal</Button>
            <Button onClick={handleCreate}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duzenle Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sube Duzenle</DialogTitle>
            <DialogDescription>Sube bilgilerini guncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Acente *</Label>
                <Select
                  value={formData.agency_id}
                  onValueChange={handleAgencyChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Acente secin" />
                  </SelectTrigger>
                  <SelectContent>
                    {agencies.map((agency) => (
                      <SelectItem key={agency.id} value={agency.id}>
                        {agency.name} (Komisyon: %{agency.commission_rate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit_name">Sube Adi *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_phone">Telefon *</Label>
              <Input
                id="edit_phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
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
            
            {/* Komisyon Oranı Alanı - Düzenleme - ZORUNLU */}
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Iptal</Button>
            <Button onClick={handleUpdate}>Guncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
