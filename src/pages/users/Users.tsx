import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { DataPagination } from '@/components/ui/pagination';
import { userService, agencyService, branchService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { User, Agency, Branch } from '@/types';
import { UserRole } from '@/types';
import { 
  Plus, Search, Eye, Users as UsersIcon, 
  Shield, RefreshCcw, Power, UserCheck
} from 'lucide-react';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

export default function Users() {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  
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

  useEffect(() => {
    fetchData();
  }, []);

  // Verileri yukle
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, agenciesData, branchesData] = await Promise.all([
        userService.getAll(),
        isSuperAdmin ? agencyService.getAll() : Promise.resolve([]),
        branchService.getAll()
      ]);
      setUsers(usersData);
      setAgencies(agenciesData);
      setBranches(branchesData);
    } catch (error) {
      console.error('Veriler yuklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmis kullanicilar
  const filteredUsers = useMemo(() => {
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [users, searchQuery]);

  // Pagination hesaplamalari
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Arama degistiginde sayfa numarasini sifirla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);


  // Kullanici olustur
  const handleCreate = async () => {
    try {
      // SUPPORT rolü global bir rol olduğu için agency_id ve branch_id boş olmalı
      const createData = {
        ...formData,
        agency_id: formData.role === UserRole.SUPPORT 
          ? '' 
          : (isSuperAdmin ? formData.agency_id : currentUser?.agency_id),
        branch_id: formData.role === UserRole.SUPPORT 
          ? '' 
          : (isAgencyAdmin && !formData.branch_id ? currentUser?.branch_id : formData.branch_id)
      };
      
      // Kullanıcıyı oluştur
      await userService.create(createData);
      
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Kullanici olusturulurken hata:', error);
      // Hata mesajını kullanıcıya göster (örn: toast notification)
      alert(error?.response?.data?.message || error?.message || 'Kullanici olusturulurken bir hata olustu');
    }
  };

  // Kullanici durumunu degistir
  const handleToggleStatus = async (user: User, e: React.MouseEvent) => {
    e.stopPropagation(); // Satir tiklamasini engelle
    try {
      await userService.toggleStatus(user.id);
      fetchData();
    } catch (error) {
      console.error('Kullanici durumu degistirilirken hata:', error);
    }
  };

  // Form sifirla
  const resetForm = () => {
    setFormData({
      name: '',
      surname: '',
      email: '',
      phone: '',
      password: '',
      role: UserRole.BRANCH_USER,
      agency_id: '',
      branch_id: ''
    });
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

  // Secili acenteye gore subeler
  const filteredBranches = isSuperAdmin 
    ? branches.filter(b => b.agency_id === formData.agency_id)
    : branches;

  // Istatistikler
  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    inactive: users.filter(u => !u.is_active).length,
    admins: users.filter(u => [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN].includes(u.role)).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UsersIcon className="h-8 w-8" />
            Kullanicilar
          </h1>
          <p className="text-muted-foreground">Kullanicilari goruntuleyip yonetin</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Kullanici
        </Button>
      </div>

      {/* Istatistik Kartlari */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kullanici</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Kullanici</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pasif Kullanici</p>
                <p className="text-2xl font-bold text-gray-500">{stats.inactive}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Power className="h-5 w-5 text-gray-500" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Yonetici</p>
                <p className="text-2xl font-bold text-blue-600">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kullanici Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ad, soyad veya e-posta..."
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

      {/* Kullanici Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Kullanici Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredUsers.length} kullanici bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henuz kullanici bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Aktif/Pasif</TableHead>
                      <TableHead className="text-right">Islem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow 
                        key={user.id} 
                        className={`${!user.is_active ? 'opacity-60' : ''}`}
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
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role) as any}>
                            {getRoleName(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.is_active ? 'success' : 'secondary'}>
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Switch
                            checked={user.is_active}
                            onCheckedChange={() => {}}
                            onClick={(e) => handleToggleStatus(user, e)}
                            disabled={user.id === currentUser?.id}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/dashboard/users/${user.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Detay
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="mt-4">
                <DataPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Yeni Kullanici Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Kullanici</DialogTitle>
            <DialogDescription>Yeni kullanici kaydi olusturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Soyad *</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <Label htmlFor="password">Sifre *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Rol *</Label>
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
                  <SelectValue placeholder="Rol secin" />
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
                  value={formData.agency_id}
                  onValueChange={(value) => setFormData({ ...formData, agency_id: value, branch_id: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="kaynak secin" />
                  </SelectTrigger>
                  <SelectContent>
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
            {(isSuperAdmin || isAgencyAdmin) && formData.role !== UserRole.SUPPORT && (
              <div className="space-y-2">
                <Label>Sube</Label>
                <Select
                  value={formData.branch_id}
                  onValueChange={(value) => setFormData({ ...formData, branch_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sube secin" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredBranches.map((branch) => (
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

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Iptal</Button>
            <Button onClick={handleCreate}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
