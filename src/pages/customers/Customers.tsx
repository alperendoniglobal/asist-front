import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataPagination } from '@/components/ui/pagination';
import { customerService, vehicleService, saleService } from '@/services/apiService';
import type { Customer, Vehicle, Sale } from '@/types';
import { 
  Plus, Search, Edit, Trash2, Eye, Users, Car, ShoppingCart, 
  Phone, Mail, MapPin, FileText, Calendar, RefreshCcw, Building2
} from 'lucide-react';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

// Türkiye İlleri
const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Aksaray', 'Amasya', 'Ankara', 'Antalya',
  'Artvin', 'Aydın', 'Balıkesir', 'Bartın', 'Batman', 'Bayburt', 'Bilecik', 'Bingöl',
  'Bitlis', 'Bolu', 'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkâri', 'Hatay', 'Iğdır', 'Isparta', 'İstanbul', 'İzmir',
  'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu', 'Kayseri', 'Kırıkkale',
  'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Osmaniye', 'Rize',
  'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas', 'Şanlıurfa', 'Şırnak', 'Tekirdağ',
  'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van', 'Yalova', 'Yozgat', 'Zonguldak'
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [formData, setFormData] = useState({
    is_corporate: false,
    tc_vkn: '',
    name: '',
    surname: '',
    tax_office: '',
    birth_date: '',
    phone: '',
    email: '',
    city: '',
    district: '',
    address: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (error) {
      console.error('Müşteriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      fetchCustomers();
      return;
    }
    try {
      setLoading(true);
      const data = await customerService.search(searchQuery);
      setCustomers(data);
    } catch (error) {
      console.error('Arama yapılırken hata:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const handleCreate = async () => {
    try {
      await customerService.create(formData);
      setIsCreateOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri oluşturulurken hata:', error);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;
    try {
      await customerService.update(selectedCustomer.id, formData);
      setIsEditOpen(false);
      resetForm();
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri güncellenirken hata:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return;
    try {
      await customerService.delete(id);
      fetchCustomers();
    } catch (error) {
      console.error('Müşteri silinirken hata:', error);
    }
  };

  const handleView = async (customer: Customer) => {
    setSelectedCustomer(customer);
    try {
      const [vehicles, sales] = await Promise.all([
        vehicleService.getByCustomer(customer.id),
        saleService.getAll({ customer_id: customer.id })
      ]);
      setCustomerVehicles(vehicles);
      setCustomerSales(sales.filter(s => s.customer_id === customer.id));
    } catch (error) {
      console.error('Müşteri detayları yüklenirken hata:', error);
    }
    setIsViewOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      is_corporate: customer.is_corporate || false,
      tc_vkn: customer.tc_vkn,
      name: customer.name,
      surname: customer.surname || '',
      tax_office: customer.tax_office || '',
      birth_date: customer.birth_date ? customer.birth_date.split('T')[0] : '',
      phone: customer.phone,
      email: customer.email || '',
      city: customer.city || '',
      district: customer.district || '',
      address: customer.address || ''
    });
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormData({
      is_corporate: false,
      tc_vkn: '',
      name: '',
      surname: '',
      tax_office: '',
      birth_date: '',
      phone: '',
      email: '',
      city: '',
      district: '',
      address: ''
    });
    setSelectedCustomer(null);
  };

  // Pagination hesaplamalari
  const totalPages = Math.ceil(customers.length / ITEMS_PER_PAGE);
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return customers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [customers, currentPage]);

  // Musteriler degistiginde sayfa numarasini sifirla
  useEffect(() => {
    setCurrentPage(1);
  }, [customers.length]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8" />
            Müşteriler
          </h1>
          <p className="text-muted-foreground">Müşteri kayıtlarını yönetin</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Müşteri
        </Button>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Müşteri Ara</CardTitle>
          <CardDescription>TC/VKN, isim veya telefon ile arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="TC/VKN, isim, soyisim veya telefon..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} variant="secondary" className="gap-2">
              <Search className="h-4 w-4" />
              Ara
            </Button>
            <Button onClick={() => { setSearchQuery(''); fetchCustomers(); }} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Müşteri Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Müşteri Listesi</CardTitle>
          <CardDescription>
            Toplam {customers.length} müşteri bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz müşteri bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tip</TableHead>
                      <TableHead>TC/VKN</TableHead>
                      <TableHead>Ad Soyad / Unvan</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Il</TableHead>
                      <TableHead>Kayit Tarihi</TableHead>
                      <TableHead className="text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedCustomers.map((customer) => (
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell>
                          {customer.is_corporate ? (
                            <Badge variant="secondary" className="gap-1">
                              <Building2 className="h-3 w-3" />
                              Kurumsal
                            </Badge>
                          ) : (
                            <Badge variant="outline">Bireysel</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono">{customer.tc_vkn}</TableCell>
                        <TableCell className="font-medium">
                          {customer.is_corporate ? customer.name : `${customer.name} ${customer.surname || ''}`}
                        </TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.city || '-'}</TableCell>
                        <TableCell>{formatDate(customer.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(customer)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(customer)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
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

      {/* Yeni Müşteri Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Müşteri</DialogTitle>
            <DialogDescription>Yeni müşteri kaydı oluşturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Kurumsal Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <Label className="font-medium">Kurumsal Müşteri</Label>
              </div>
              <Switch
                checked={formData.is_corporate}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_corporate: checked,
                  surname: checked ? '' : formData.surname,
                  tax_office: checked ? formData.tax_office : ''
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tc_vkn">{formData.is_corporate ? 'Vergi Kimlik No' : 'TC Kimlik No'} *</Label>
              <Input
                id="tc_vkn"
                value={formData.tc_vkn}
                onChange={(e) => setFormData({ ...formData, tc_vkn: e.target.value })}
                placeholder={formData.is_corporate ? 'Vergi Kimlik Numarası' : 'TC Kimlik Numarası'}
                maxLength={11}
              />
            </div>

            {formData.is_corporate ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Ünvan *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ticari Ünvan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_office">Vergi Dairesi *</Label>
                  <Input
                    id="tax_office"
                    value={formData.tax_office}
                    onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                    placeholder="Vergi Dairesi"
                  />
                </div>
              </>
            ) : (
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
            )}

            <div className="space-y-2">
              <Label htmlFor="birth_date">Doğum Tarihi {!formData.is_corporate && '*'}</Label>
              <Input
                id="birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="05XX XXX XX XX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">İl *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İl Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="district">İlçe *</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  placeholder="İlçe"
                  disabled={!formData.city}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate}>Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Düzenle Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Müşteri Düzenle</DialogTitle>
            <DialogDescription>Müşteri bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Kurumsal Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <Label className="font-medium">Kurumsal Müşteri</Label>
              </div>
              <Switch
                checked={formData.is_corporate}
                onCheckedChange={(checked) => setFormData({ 
                  ...formData, 
                  is_corporate: checked,
                  surname: checked ? '' : formData.surname,
                  tax_office: checked ? formData.tax_office : ''
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_tc_vkn">{formData.is_corporate ? 'Vergi Kimlik No' : 'TC Kimlik No'} *</Label>
              <Input
                id="edit_tc_vkn"
                value={formData.tc_vkn}
                onChange={(e) => setFormData({ ...formData, tc_vkn: e.target.value })}
                maxLength={11}
              />
            </div>

            {formData.is_corporate ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Ünvan *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_tax_office">Vergi Dairesi *</Label>
                  <Input
                    id="edit_tax_office"
                    value={formData.tax_office}
                    onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
                  />
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_name">Ad *</Label>
                  <Input
                    id="edit_name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_surname">Soyad *</Label>
                  <Input
                    id="edit_surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="edit_birth_date">Doğum Tarihi</Label>
              <Input
                id="edit_birth_date"
                type="date"
                value={formData.birth_date}
                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Telefon *</Label>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit_city">İl *</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value, district: '' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="İl Seçiniz" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {CITIES.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_district">İlçe *</Label>
                <Input
                  id="edit_district"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  disabled={!formData.city}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit_address">Adres</Label>
              <Textarea
                id="edit_address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>İptal</Button>
            <Button onClick={handleUpdate}>Güncelle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {selectedCustomer?.name?.[0]}{selectedCustomer?.surname?.[0]}
              </div>
              {selectedCustomer?.name} {selectedCustomer?.surname}
            </DialogTitle>
            <DialogDescription>Müşteri detayları ve ilişkili kayıtlar</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="info" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="gap-2">
                <FileText className="h-4 w-4" />
                Bilgiler
              </TabsTrigger>
              <TabsTrigger value="vehicles" className="gap-2">
                <Car className="h-4 w-4" />
                Araçlar ({customerVehicles.length})
              </TabsTrigger>
              <TabsTrigger value="sales" className="gap-2">
                <ShoppingCart className="h-4 w-4" />
                Satışlar ({customerSales.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <FileText className="h-4 w-4" />
                      TC/VKN
                    </div>
                    <p className="font-mono font-medium">{selectedCustomer?.tc_vkn}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Phone className="h-4 w-4" />
                      Telefon
                    </div>
                    <p className="font-medium">{selectedCustomer?.phone}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Mail className="h-4 w-4" />
                    E-posta
                  </div>
                  <p className="font-medium">{selectedCustomer?.email || '-'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    Adres
                  </div>
                  <p className="font-medium">{selectedCustomer?.address || '-'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    Kayıt Tarihi
                  </div>
                  <p className="font-medium">{selectedCustomer && formatDate(selectedCustomer.created_at)}</p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vehicles">
              {customerVehicles.length === 0 ? (
                <div className="text-center py-8">
                  <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Bu müşteriye ait araç bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Car className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{vehicle.plate}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.brand?.name} {vehicle.model?.name} - {vehicle.model_year}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">{vehicle.model_year}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="sales">
              {customerSales.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Bu müşteriye ait satış bulunmuyor</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {customerSales.map((sale) => (
                    <div key={sale.id} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{sale.policy_number || '-'}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(sale.start_date)} - {formatDate(sale.end_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">{formatCurrency(sale.price)}</p>
                          <Badge variant="success">Komisyon: {formatCurrency(sale.commission)}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
