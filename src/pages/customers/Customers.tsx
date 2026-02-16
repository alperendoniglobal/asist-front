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
import { customerService, vehicleService, saleService, smsService } from '@/services/apiService';
import type { Customer, Vehicle, Sale } from '@/types';
import { 
  Plus, Search, Edit, Trash2, Eye, Users, Car, ShoppingCart, 
  Phone, Mail, MapPin, FileText, Calendar, RefreshCcw, Building2, Send, CloudRain
} from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
// Şehir ve ilçe verilerini import et
import cityData from '@/data/city.json';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

// Türkiye İlleri - city.json'dan al
const CITIES = cityData.map((city) => city.il);

// Seçilen ile göre ilçeleri getiren fonksiyon
const getDistrictsByCity = (cityName: string): string[] => {
  const city = cityData.find((c) => c.il === cityName);
  return city ? city.ilceleri : [];
};

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
  // Seçili müşteri id'leri (manuel SMS için)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsLoading, setSmsLoading] = useState(false);
  const [weatherSmsLoading, setWeatherSmsLoading] = useState(false);
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

  // Seçili müşteri id'sini tek tıkla aç/kapa
  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Sayfadaki tüm müşterileri seç/kaldır
  const toggleSelectAllPage = () => {
    const pageIds = paginatedCustomers.map((c) => c.id);
    const allSelected = pageIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  // Seçilenlere SMS gönder
  const handleSendSms = async () => {
    const phones = customers
      .filter((c) => selectedIds.has(c.id) && c.phone?.trim())
      .map((c) => c.phone!.trim());
    const uniquePhones = Array.from(new Set(phones));
    if (uniquePhones.length === 0) {
      toast.error('Seçilen müşterilerde geçerli telefon numarası yok.');
      return;
    }
    if (!smsMessage.trim()) {
      toast.error('Mesaj yazın.');
      return;
    }
    try {
      setSmsLoading(true);
      await smsService.sendToMultiple(uniquePhones, smsMessage.trim());
      toast.success(`${uniquePhones.length} kişiye SMS gönderildi.`);
      setIsSmsOpen(false);
      setSmsMessage('');
      setSelectedIds(new Set());
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'SMS gönderilemedi';
      toast.error(msg);
    } finally {
      setSmsLoading(false);
    }
  };

  // Seçilenlere hava durumlu SMS (her kişiye kendi ilinin hava durumu)
  const handleSendWeatherSms = async () => {
    const ids = Array.from(selectedIds);
    const withCityAndPhone = customers.filter(
      (c) => selectedIds.has(c.id) && c.city?.trim() && c.phone?.trim()
    );
    if (withCityAndPhone.length === 0) {
      toast.error('Seçilen müşterilerde il ve telefon dolu olan yok.');
      return;
    }
    try {
      setWeatherSmsLoading(true);
      const result = await smsService.sendWeatherToSelected(ids);
      toast.success(`${result.sent} kişiye hava durumlu SMS gönderildi.`);
      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} hata oluştu.`);
      }
      setSelectedIds(new Set());
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'SMS gönderilemedi';
      toast.error(msg);
    } finally {
      setWeatherSmsLoading(false);
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Müşteri Listesi</CardTitle>
              <CardDescription>
                Toplam {customers.length} müşteri bulundu
                {selectedIds.size > 0 && (
                  <span className="ml-2 text-primary font-medium"> • {selectedIds.size} seçili</span>
                )}
              </CardDescription>
            </div>
            {selectedIds.size > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  className="gap-2 bg-sky-600 hover:bg-sky-700"
                  onClick={handleSendWeatherSms}
                  disabled={weatherSmsLoading}
                >
                  {weatherSmsLoading ? (
                    <>Gönderiliyor...</>
                  ) : (
                    <>
                      <CloudRain className="h-4 w-4" />
                      Hava durumlu SMS gönder ({selectedIds.size})
                    </>
                  )}
                </Button>
                <Button
                  variant="default"
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setIsSmsOpen(true)}
                >
                  <Send className="h-4 w-4" />
                  Aynı mesajı gönder ({selectedIds.size})
                </Button>
              </div>
            )}
          </div>
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
                      <TableHead className="w-10">
                        <Checkbox
                          checked={
                            paginatedCustomers.length > 0 &&
                            paginatedCustomers.every((c) => selectedIds.has(c.id))
                          }
                          onCheckedChange={toggleSelectAllPage}
                          aria-label="Tümünü seç"
                        />
                      </TableHead>
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
                          <Checkbox
                            checked={selectedIds.has(customer.id)}
                            onCheckedChange={() => toggleSelected(customer.id)}
                            aria-label={`${customer.name} seç`}
                          />
                        </TableCell>
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
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {formData.city && getDistrictsByCity(formData.city).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                <Select
                  value={formData.district}
                  onValueChange={(value) => setFormData({ ...formData, district: value })}
                  disabled={!formData.city}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={formData.city ? 'İlçe Seçiniz' : 'Önce İl Seçiniz'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {formData.city && getDistrictsByCity(formData.city).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {/* Seçilenlere SMS Gönder Modal */}
      <Dialog open={isSmsOpen} onOpenChange={setIsSmsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Seçilenlere SMS gönder
            </DialogTitle>
            <DialogDescription>
              {selectedIds.size} kişiye aynı mesaj gidecek. Telefonu olmayan müşteriler otomatik atlanır.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="sms-message">Mesaj *</Label>
              <Textarea
                id="sms-message"
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value)}
                placeholder="Örn: Sayın müşterimiz, yol yardım paketiniz aktif..."
                rows={4}
                maxLength={160}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {smsMessage.length}/160 karakter (tek SMS)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSmsOpen(false)} disabled={smsLoading}>
              İptal
            </Button>
            <Button onClick={handleSendSms} disabled={smsLoading} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {smsLoading ? (
                <>Gönderiliyor...</>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {customers.filter((c) => selectedIds.has(c.id) && c.phone?.trim()).length} kişiye gönder
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
