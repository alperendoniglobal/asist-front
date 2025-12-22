import { useEffect, useState, useMemo } from 'react';
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
import { vehicleService, customerService, carBrandService, carModelService } from '@/services/apiService';
import type { Vehicle, Customer, CarBrand, CarModel } from '@/types';
import { 
  Plus, Search, Edit, Trash2, Eye, Car, User, Calendar,
  Hash, Settings, RefreshCcw, Building2, MapPin, FileText, Globe
} from 'lucide-react';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

export default function Vehicles() {
  // State tanimlamalari
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [carModels, setCarModels] = useState<CarModel[]>([]);
  const [modelSearchQuery, setModelSearchQuery] = useState(''); // Model arama sorgusu
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  // Form verisi - yeni yapıya uygun
  const [formData, setFormData] = useState({
    customer_id: '',
    is_foreign_plate: false,  // Yabancı plaka mı?
    plate: '',
    registration_serial: '',  // Ruhsat Seri
    registration_number: '',  // Ruhsat No
    brand_id: '',
    model_id: '',
    model_year: new Date().getFullYear(),
    usage_type: 'PRIVATE'
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Verileri çek
  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesData, customersData, brandsData] = await Promise.all([
        vehicleService.getAll(),
        customerService.getAll(),
        carBrandService.getAll()
      ]);
      setVehicles(vehiclesData);
      setCustomers(customersData);
      setCarBrands(brandsData);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Marka seçildiğinde modelleri çek
  const handleBrandChange = async (brandId: string) => {
    setFormData({ ...formData, brand_id: brandId, model_id: '' });
    setModelSearchQuery(''); // Marka değiştiğinde arama sorgusunu temizle
    if (brandId) {
      try {
        const models = await carModelService.getByBrandId(parseInt(brandId));
        setCarModels(models);
      } catch (error) {
        console.error('Modeller yüklenirken hata:', error);
        setCarModels([]);
      }
    } else {
      setCarModels([]);
    }
  };

  // Marka adını güvenli şekilde al
  const getBrandName = (vehicle: Vehicle): string => {
    if (vehicle.brand && typeof vehicle.brand === 'object') {
      return vehicle.brand.name || '-';
    }
    return '-';
  };

  // Model adını güvenli şekilde al
  const getModelName = (vehicle: Vehicle): string => {
    if (vehicle.model && typeof vehicle.model === 'object') {
      return vehicle.model.name || '-';
    }
    return '-';
  };

  // Filtreleme - artik obje icindeki name alanina bak
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(vehicle => {
      const brandName = getBrandName(vehicle).toLowerCase();
      const modelName = getModelName(vehicle).toLowerCase();
      const query = searchQuery.toLowerCase();
      
      return vehicle.plate.toLowerCase().includes(query) ||
        brandName.includes(query) ||
        modelName.includes(query);
    });
  }, [vehicles, searchQuery]);

  // Pagination hesaplamalari
  const totalPages = Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE);
  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredVehicles, currentPage]);

  // Arama degistiginde sayfa numarasini sifirla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Araç oluştur
  const handleCreate = async () => {
    try {
      await vehicleService.create({
        customer_id: formData.customer_id,
        plate: formData.plate.toUpperCase(),
        registration_serial: formData.registration_serial.toUpperCase() || null,
        registration_number: formData.registration_number || null,
        brand_id: parseInt(formData.brand_id),
        model_id: parseInt(formData.model_id),
        model_year: formData.model_year,
        usage_type: formData.usage_type
      });
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Araç oluşturulurken hata:', error);
    }
  };

  // Araç güncelle
  const handleUpdate = async () => {
    if (!selectedVehicle) return;
    try {
      await vehicleService.update(selectedVehicle.id, {
        customer_id: formData.customer_id,
        plate: formData.plate.toUpperCase(),
        registration_serial: formData.registration_serial.toUpperCase() || null,
        registration_number: formData.registration_number || null,
        brand_id: parseInt(formData.brand_id),
        model_id: parseInt(formData.model_id),
        model_year: formData.model_year,
        usage_type: formData.usage_type
      });
      setIsEditOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Araç güncellenirken hata:', error);
    }
  };

  // Araç sil
  const handleDelete = async (id: string) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return;
    try {
      await vehicleService.delete(id);
      fetchData();
    } catch (error) {
      console.error('Araç silinirken hata:', error);
    }
  };

  // Detay görüntüle
  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewOpen(true);
  };

  // Düzenleme modunu aç
  const handleEdit = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    
    // Önce marka için modelleri çek
    if (vehicle.brand_id) {
      try {
        const models = await carModelService.getByBrandId(vehicle.brand_id);
        setCarModels(models);
      } catch (error) {
        console.error('Modeller yüklenirken hata:', error);
      }
    }
    
    setFormData({
      customer_id: vehicle.customer_id,
      is_foreign_plate: vehicle.is_foreign_plate || false,
      plate: vehicle.plate,
      registration_serial: vehicle.registration_serial || '',
      registration_number: vehicle.registration_number || '',
      brand_id: vehicle.brand_id?.toString() || '',
      model_id: vehicle.model_id?.toString() || '',
      model_year: vehicle.model_year || new Date().getFullYear(),
      usage_type: vehicle.usage_type || 'PRIVATE'
    });
    setIsEditOpen(true);
  };

  // Form sıfırla
  const resetForm = () => {
    setFormData({
      customer_id: '',
      is_foreign_plate: false,
      plate: '',
      registration_serial: '',
      registration_number: '',
      brand_id: '',
      model_id: '',
      model_year: new Date().getFullYear(),
      usage_type: 'PRIVATE'
    });
    setSelectedVehicle(null);
    setCarModels([]);
  };

  // Müşteri adını al
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? `${customer.name} ${customer.surname}` : '-';
  };

  // Kullanım tipi etiketi
  const getUsageTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'PRIVATE': 'Hususi',
      'COMMERCIAL': 'Ticari',
      'TAXI': 'Taksi',
      'RENTAL': 'Kiralık'
    };
    return types[type] || type;
  };

  // Yıl seçenekleri
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  // Kullanım tipi seçenekleri
  const usageTypes = [
    { value: 'PRIVATE', label: 'Hususi' },
    { value: 'COMMERCIAL', label: 'Ticari' },
    { value: 'TAXI', label: 'Taksi' },
    { value: 'RENTAL', label: 'Kiralık' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Car className="h-8 w-8" />
            Araçlar
          </h1>
          <p className="text-muted-foreground">Araç kayıtlarını yönetin</p>
        </div>
        <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Araç
        </Button>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Araç Ara</CardTitle>
          <CardDescription>Plaka, marka veya model ile arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Plaka, marka veya model..."
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

      {/* Araç Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Araç Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredVehicles.length} araç bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz araç bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Plaka</TableHead>
                      <TableHead>Ruhsat</TableHead>
                      <TableHead>Marka / Model</TableHead>
                      <TableHead>Yil</TableHead>
                      <TableHead>Kullanim</TableHead>
                      <TableHead>Sahip</TableHead>
                      <TableHead className="text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center justify-center w-8 h-6 text-xs font-bold text-white rounded ${vehicle.is_foreign_plate ? 'bg-amber-500' : 'bg-blue-600'}`}>
                              {vehicle.is_foreign_plate ? 'INT' : 'TR'}
                            </span>
                            <span className="font-mono font-bold">{vehicle.plate}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-muted-foreground">
                          {vehicle.registration_serial && vehicle.registration_number 
                            ? `${vehicle.registration_serial}/${vehicle.registration_number}`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          <div>
                            {/* Marka ve model artik obje - name alanini kullan */}
                            <p className="font-medium">{getBrandName(vehicle)}</p>
                            <p className="text-sm text-muted-foreground">{getModelName(vehicle)}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{vehicle.model_year}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{getUsageTypeLabel(vehicle.usage_type)}</Badge>
                        </TableCell>
                        <TableCell>
                          {/* Musteri bilgisi varsa dogrudan kullan */}
                          {vehicle.customer ? (
                            <span>{vehicle.customer.name} {vehicle.customer.surname}</span>
                          ) : (
                            getCustomerName(vehicle.customer_id)
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(vehicle)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(vehicle.id)}
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

      {/* Yeni Araç Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Araç</DialogTitle>
            <DialogDescription>Yeni araç kaydı oluşturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Müşteri Seçimi */}
            <div className="space-y-2">
              <Label>Müşteri *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.is_corporate ? customer.name : `${customer.name} ${customer.surname || ''}`} - {customer.tc_vkn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Yabancı Plaka Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label className="font-medium">Yabancı Plaka</Label>
              </div>
              <Switch
                checked={formData.is_foreign_plate}
                onCheckedChange={(checked) => setFormData({ ...formData, is_foreign_plate: checked })}
              />
            </div>
            
            {/* Plaka */}
            <div className="space-y-2">
              <Label htmlFor="plate">Plaka *</Label>
              <div className="flex">
                <div className={`flex items-center justify-center w-10 ${formData.is_foreign_plate ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-l-md`}>
                  <span className="text-xs font-bold">{formData.is_foreign_plate ? '🌍' : 'TR'}</span>
                </div>
                <Input
                  id="plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  placeholder={formData.is_foreign_plate ? 'Yabancı Plaka' : '34ABC123'}
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Ruhsat Seri/No */}
            <div className="space-y-2">
              <Label>Ruhsat Seri/No</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={formData.registration_serial}
                  onChange={(e) => setFormData({ ...formData, registration_serial: e.target.value.toUpperCase() })}
                  placeholder="Seri (AA, AB...)"
                  maxLength={10}
                />
                <Input
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  placeholder="No"
                  maxLength={20}
                />
              </div>
            </div>
            
            {/* Marka ve Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marka *</Label>
                <Select value={formData.brand_id} onValueChange={handleBrandChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select
                  value={formData.model_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, model_id: value });
                    setModelSearchQuery(''); // Seçim yapıldığında arama sorgusunu temizle
                  }}
                  disabled={!formData.brand_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Model seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Model arama input'u */}
                    <div className="sticky top-0 z-10 bg-background p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Model ara..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="pl-8"
                          onClick={(e) => e.stopPropagation()} // Select'in kapanmasını engelle
                          onKeyDown={(e) => e.stopPropagation()} // Select'in kapanmasını engelle
                        />
                      </div>
                    </div>
                    {/* Filtrelenmiş modeller */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {carModels
                        .filter((model) =>
                          model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                        )
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </SelectItem>
                        ))}
                      {carModels.filter((model) =>
                        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Model bulunamadı
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Model Yılı ve Kullanım Tipi */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model Yılı *</Label>
                <Select
                  value={formData.model_year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, model_year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kullanım Tipi *</Label>
                <Select
                  value={formData.usage_type}
                  onValueChange={(value) => setFormData({ ...formData, usage_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Araç Düzenle</DialogTitle>
            <DialogDescription>Araç bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Müşteri Seçimi */}
            <div className="space-y-2">
              <Label>Müşteri *</Label>
              <Select
                value={formData.customer_id}
                onValueChange={(value) => setFormData({ ...formData, customer_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.is_corporate ? customer.name : `${customer.name} ${customer.surname || ''}`} - {customer.tc_vkn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Yabancı Plaka Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-primary" />
                <Label className="font-medium">Yabancı Plaka</Label>
              </div>
              <Switch
                checked={formData.is_foreign_plate}
                onCheckedChange={(checked) => setFormData({ ...formData, is_foreign_plate: checked })}
              />
            </div>
            
            {/* Plaka */}
            <div className="space-y-2">
              <Label htmlFor="edit_plate">Plaka *</Label>
              <div className="flex">
                <div className={`flex items-center justify-center w-10 ${formData.is_foreign_plate ? 'bg-amber-500' : 'bg-blue-600'} text-white rounded-l-md`}>
                  <span className="text-xs font-bold">{formData.is_foreign_plate ? '🌍' : 'TR'}</span>
                </div>
                <Input
                  id="edit_plate"
                  value={formData.plate}
                  onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                  className="rounded-l-none"
                />
              </div>
            </div>

            {/* Ruhsat Seri/No */}
            <div className="space-y-2">
              <Label>Ruhsat Seri/No</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  value={formData.registration_serial}
                  onChange={(e) => setFormData({ ...formData, registration_serial: e.target.value.toUpperCase() })}
                  placeholder="Seri (AA, AB...)"
                  maxLength={10}
                />
                <Input
                  value={formData.registration_number}
                  onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                  placeholder="No"
                  maxLength={20}
                />
              </div>
            </div>
            
            {/* Marka ve Model */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marka *</Label>
                <Select value={formData.brand_id} onValueChange={handleBrandChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Marka seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {carBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model *</Label>
                <Select
                  value={formData.model_id}
                  onValueChange={(value) => {
                    setFormData({ ...formData, model_id: value });
                    setModelSearchQuery(''); // Seçim yapıldığında arama sorgusunu temizle
                  }}
                  disabled={!formData.brand_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Model seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Model arama input'u */}
                    <div className="sticky top-0 z-10 bg-background p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Model ara..."
                          value={modelSearchQuery}
                          onChange={(e) => setModelSearchQuery(e.target.value)}
                          className="pl-8"
                          onClick={(e) => e.stopPropagation()} // Select'in kapanmasını engelle
                          onKeyDown={(e) => e.stopPropagation()} // Select'in kapanmasını engelle
                        />
                      </div>
                    </div>
                    {/* Filtrelenmiş modeller */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {carModels
                        .filter((model) =>
                          model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                        )
                        .map((model) => (
                          <SelectItem key={model.id} value={model.id.toString()}>
                            {model.name}
                          </SelectItem>
                        ))}
                      {carModels.filter((model) =>
                        model.name.toLowerCase().includes(modelSearchQuery.toLowerCase())
                      ).length === 0 && (
                        <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                          Model bulunamadı
                        </div>
                      )}
                    </div>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Model Yılı ve Kullanım Tipi */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Model Yılı *</Label>
                <Select
                  value={formData.model_year.toString()}
                  onValueChange={(value) => setFormData({ ...formData, model_year: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Kullanım Tipi *</Label>
                <Select
                  value={formData.usage_type}
                  onValueChange={(value) => setFormData({ ...formData, usage_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {usageTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              {selectedVehicle?.plate}
            </DialogTitle>
            <DialogDescription>Araç detayları</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Plaka */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Hash className="h-4 w-4" />
                  Plaka
                </div>
                <p className="font-mono font-bold text-lg">{selectedVehicle?.plate}</p>
              </div>
              {/* Model Yılı */}
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Model Yılı
                </div>
                <p className="font-bold text-lg">{selectedVehicle?.model_year}</p>
              </div>
            </div>

            {/* Ruhsat Seri/No */}
            {(selectedVehicle?.registration_serial || selectedVehicle?.registration_number) && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Ruhsat Seri/No
                </div>
                <p className="font-mono font-medium">
                  {selectedVehicle?.registration_serial || '-'} / {selectedVehicle?.registration_number || '-'}
                </p>
              </div>
            )}
            
            {/* Marka / Model */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Car className="h-4 w-4" />
                Marka / Model
              </div>
              <p className="font-medium">
                {selectedVehicle && getBrandName(selectedVehicle)} {selectedVehicle && getModelName(selectedVehicle)}
              </p>
            </div>
            
            {/* Kullanım Tipi */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Settings className="h-4 w-4" />
                Kullanım Tipi
              </div>
              <Badge variant="outline">
                {selectedVehicle && getUsageTypeLabel(selectedVehicle.usage_type)}
              </Badge>
            </div>
            
            {/* Sahip */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <User className="h-4 w-4" />
                Sahip
              </div>
              <p className="font-medium">
                {selectedVehicle?.customer ? 
                  `${selectedVehicle.customer.name} ${selectedVehicle.customer.surname}` :
                  (selectedVehicle && getCustomerName(selectedVehicle.customer_id))
                }
              </p>
            </div>
            
            {/* Acente */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                Acente
              </div>
              <p className="font-medium">
                {selectedVehicle?.agency?.name || <span className="text-muted-foreground italic">Sistem</span>}
              </p>
            </div>
            
            {/* Şube */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                Şube
              </div>
              <p className="font-medium">
                {selectedVehicle?.branch?.name || <span className="text-muted-foreground italic">Sistem</span>}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
