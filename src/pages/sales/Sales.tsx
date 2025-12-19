import { useEffect, useState, useMemo } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataPagination } from '@/components/ui/pagination';
import { saleService, customerService, vehicleService, packageService, paymentService, pdfService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Sale, Customer, Vehicle, Package, RefundCalculation } from '@/types';
import { PaymentType, UserRole } from '@/types';
import { 
  Plus, Search, Eye, ShoppingCart, User, Car, Package as PackageIcon,
  Calendar, CreditCard, Wallet, FileText, RefreshCcw,
  Download, ExternalLink, RotateCcw, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

export default function Sales() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [customerVehicles, setCustomerVehicles] = useState<Vehicle[]>([]);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customer_id: '',
    vehicle_id: '',
    package_id: '',
    start_date: '',
    end_date: '',
    price: 0,
    commission: 0
  });
  const [paymentData, setPaymentData] = useState({
    payment_type: 'IYZICO' as PaymentType,
    card_number: '',
    card_holder: '',
    expire_month: '',
    expire_year: '',
    cvv: ''
  });
  const [paymentLoading, setPaymentLoading] = useState(false);

  // ===== İADE STATE'LERİ =====
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [refundCalculation, setRefundCalculation] = useState<RefundCalculation | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundCalculating, setRefundCalculating] = useState(false);

  // İade yapabilme yetkisi kontrolü - sadece Agency Admin ve üstü yapabilir
  const canRefund = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.AGENCY_ADMIN;
  
  // Komisyon görüntüleme yetkisi - sadece Super Admin, Agency Admin ve Branch Admin görebilir
  // Branch User komisyonu göremez
  const canViewCommission = user?.role === UserRole.SUPER_ADMIN 
    || user?.role === UserRole.AGENCY_ADMIN 
    || user?.role === UserRole.BRANCH_ADMIN;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesData, customersData, packagesData] = await Promise.all([
        saleService.getAll(),
        customerService.getAll(),
        packageService.getAll()
      ]);
      setSales(salesData);
      setCustomers(customersData);
      setPackages(packagesData);
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmis satislar
  const filteredSales = useMemo(() => {
    return sales.filter(sale =>
      sale.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.customer?.surname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.vehicle?.plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sale.package?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sales, searchQuery]);

  // Pagination hesaplamalari
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);

  // Arama degistiginde sayfa numarasini sifirla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleCustomerSelect = async (customerId: string) => {
    setFormData({ ...formData, customer_id: customerId, vehicle_id: '' });
    try {
      const vehicles = await vehicleService.getByCustomer(customerId);
      setCustomerVehicles(vehicles);
    } catch (error) {
      console.error('Araçlar yüklenirken hata:', error);
      setCustomerVehicles([]);
    }
  };

  const handlePackageSelect = async (packageId: string) => {
    const selectedPackage = packages.find(p => p.id === packageId);
    if (selectedPackage) {
      // Paket fiyatını hesapla (örnek değer)
      const basePrice = 5000;
      const commission = basePrice * 0.15;
      setFormData({ 
        ...formData, 
        package_id: packageId,
        price: basePrice,
        commission: commission
      });
    }
  };

  const handleCreate = async () => {
    try {
      const newSale = await saleService.create(formData);
      setSelectedSale(newSale);
      setIsCreateOpen(false);
      setIsPaymentOpen(true);
      fetchData();
    } catch (error) {
      console.error('Satış oluşturulurken hata:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedSale) return;
    setPaymentLoading(true);
    try {
      if (paymentData.payment_type === 'IYZICO') {
        await paymentService.processIyzico(selectedSale.id, {
          card_number: paymentData.card_number,
          card_holder: paymentData.card_holder,
          expire_month: paymentData.expire_month,
          expire_year: paymentData.expire_year,
          cvv: paymentData.cvv
        });
      } else {
        await paymentService.processBalance(selectedSale.id);
      }
      setIsPaymentOpen(false);
      resetForm();
      fetchData();
      alert('Ödeme başarıyla tamamlandı!');
    } catch (error) {
      console.error('Ödeme işlenirken hata:', error);
      alert('Ödeme işlemi başarısız oldu!');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleView = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewOpen(true);
  };

  // ===== İADE FONKSİYONLARI =====

  /**
   * İade modalını aç ve iade tutarını hesapla
   * @param sale - İade edilecek satış
   */
  const handleOpenRefundModal = async (sale: Sale) => {
    setSelectedSale(sale);
    setRefundReason('');
    setRefundCalculation(null);
    setRefundCalculating(true);
    setIsRefundModalOpen(true);

    try {
      // İade tutarını hesapla
      const calculation = await saleService.calculateRefund(sale.id);
      setRefundCalculation(calculation);
    } catch (error: any) {
      console.error('İade hesaplanamadı:', error);
      alert(error.response?.data?.message || 'İade tutarı hesaplanamadı');
      setIsRefundModalOpen(false);
    } finally {
      setRefundCalculating(false);
    }
  };

  /**
   * İade işlemini onayla ve gerçekleştir
   */
  const handleConfirmRefund = async () => {
    if (!selectedSale || !refundReason.trim()) {
      alert('Lütfen iade sebebini girin');
      return;
    }

    if (!confirm('Bu satışı iade etmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setRefundLoading(true);
    try {
      await saleService.processRefund(selectedSale.id, refundReason);
      alert('İade işlemi başarıyla tamamlandı!');
      setIsRefundModalOpen(false);
      setIsViewOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('İade işlemi başarısız:', error);
      alert(error.response?.data?.message || 'İade işlemi başarısız oldu');
    } finally {
      setRefundLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      vehicle_id: '',
      package_id: '',
      start_date: '',
      end_date: '',
      price: 0,
      commission: 0
    });
    setPaymentData({
      payment_type: 'IYZICO' as PaymentType,
      card_number: '',
      card_holder: '',
      expire_month: '',
      expire_year: '',
      cvv: ''
    });
    setStep(1);
    setCustomerVehicles([]);
    setSelectedSale(null);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(value);
  };

  // Satış durumu badge'i - İade durumunu da gösterir
  const getStatusBadge = (sale: Sale) => {
    // İade edilmiş mi?
    if (sale.is_refunded) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> İade Edildi</Badge>;
    }
    
    const today = new Date();
    const endDate = new Date(sale.end_date);
    if (endDate < today) {
      return <Badge variant="secondary">Süresi Dolmuş</Badge>;
    }
    return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" /> Aktif</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Satışlar
          </h1>
          <p className="text-muted-foreground">Satış kayıtlarını yönetin ve yeni satış oluşturun</p>
        </div>
        <Button onClick={() => navigate('/dashboard/sales/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Yeni Satış
        </Button>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Satış Ara</CardTitle>
          <CardDescription>Satış no, müşteri adı, plaka veya paket ile arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Satış numarası veya müşteri adı..."
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

      {/* Satış Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Satış Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredSales.length} satış bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz satış bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Satis No</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Musteri</TableHead>
                      <TableHead>Arac</TableHead>
                      <TableHead>Satisi Yapan</TableHead>
                      <TableHead>Baslangic</TableHead>
                      <TableHead>Bitis</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id} className={`hover:bg-muted/50 ${sale.is_refunded ? 'opacity-60' : ''}`}>
                        <TableCell className="font-mono text-xs">{sale.id.slice(0, 8).toUpperCase()}</TableCell>
                        <TableCell className="text-sm">{sale.package?.name || '-'}</TableCell>
                        <TableCell>
                          {sale.customer?.name} {sale.customer?.surname}
                        </TableCell>
                        <TableCell>{sale.vehicle?.plate || '-'}</TableCell>
                        <TableCell>
                          {sale.user?.name} {sale.user?.surname}
                          {sale.branch?.name && (
                            <span className="text-xs text-muted-foreground block">
                              {sale.branch.name}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(sale.start_date)}</TableCell>
                        <TableCell>{formatDate(sale.end_date)}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(sale.price)}</TableCell>
                        <TableCell>{getStatusBadge(sale)}</TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleView(sale)} title="Detay">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => pdfService.downloadSaleContract(sale.id)}
                            title="PDF Indir"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => pdfService.viewSaleContract(sale.id)}
                            title="PDF Goruntule"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          {/* İade butonu - sadece aktif satışlar için ve yetkili kullanıcılar için */}
                          {canRefund && !sale.is_refunded && new Date(sale.end_date) > new Date() && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleOpenRefundModal(sale)}
                              title="İade Et"
                              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
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

      {/* Yeni Satış Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Yeni Satış</DialogTitle>
            <DialogDescription>Adım adım yeni satış oluşturun</DialogDescription>
          </DialogHeader>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`w-20 h-1 mx-2 ${step > s ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          {/* Step 1: Müşteri ve Araç Seçimi */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri ve Araç Seçimi
              </h3>
              <div className="space-y-2">
                <Label>Müşteri *</Label>
                <Select value={formData.customer_id} onValueChange={handleCustomerSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.surname} - {customer.tc_vkn}
                      </SelectItem>
                    ))}
                  </SelectContent>
            </Select>
              </div>
              {formData.customer_id && (
                <div className="space-y-2">
                  <Label>Araç *</Label>
                  <Select
                    value={formData.vehicle_id}
                    onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Araç seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {customerVehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.plate} - {vehicle.brand?.name} {vehicle.model?.name} ({vehicle.model_year})
                        </SelectItem>
                      ))}
                    </SelectContent>
            </Select>
                  {customerVehicles.length === 0 && (
                    <p className="text-sm text-muted-foreground">Bu müşteriye ait araç bulunmuyor</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Paket Seçimi */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PackageIcon className="h-5 w-5" />
                Paket Seçimi
              </h3>
              <div className="space-y-2">
                <Label>Sigorta Paketi *</Label>
                <Select value={formData.package_id} onValueChange={handlePackageSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Paket seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
            </Select>
              </div>
              {formData.package_id && (
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <div className="flex justify-between">
                    <span>Fiyat:</span>
                    <span className="font-semibold">{formatCurrency(formData.price)}</span>
                  </div>
                  {/* Komisyon sadece yetkili kullanıcılar görebilir (Super Admin, Agency Admin, Branch Admin) */}
                  {canViewCommission && (
                    <div className="flex justify-between">
                      <span>Komisyon:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(formData.commission)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Tarih Seçimi */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Paket Tarihleri
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Başlangıç Tarihi *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">Bitiş Tarihi *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>
              {/* Özet */}
              <div className="p-4 rounded-lg border space-y-2">
                <h4 className="font-semibold">Satış Özeti</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Müşteri:</span>
                  <span>{customers.find(c => c.id === formData.customer_id)?.name || '-'}</span>
                  <span className="text-muted-foreground">Araç:</span>
                  <span>{customerVehicles.find(v => v.id === formData.vehicle_id)?.plate || '-'}</span>
                  <span className="text-muted-foreground">Paket:</span>
                  <span>{packages.find(p => p.id === formData.package_id)?.name || '-'}</span>
                  <span className="text-muted-foreground">Toplam:</span>
                  <span className="font-semibold">{formatCurrency(formData.price)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>Geri</Button>
            )}
            {step < 3 ? (
              <Button 
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && (!formData.customer_id || !formData.vehicle_id)) ||
                  (step === 2 && !formData.package_id)
                }
              >
                İleri
              </Button>
            ) : (
              <Button 
                onClick={handleCreate}
                disabled={!formData.start_date || !formData.end_date}
              >
                Satışı Oluştur
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ödeme Modal */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödeme İşlemi
            </DialogTitle>
            <DialogDescription>Ödeme yöntemini seçin ve bilgileri girin</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="iyzico" onValueChange={(v) => setPaymentData({ ...paymentData, payment_type: v as PaymentType })}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="IYZICO" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Kredi Kartı
              </TabsTrigger>
              <TabsTrigger value="BALANCE" className="gap-2">
                <Wallet className="h-4 w-4" />
                Bakiye
              </TabsTrigger>
            </TabsList>

            <TabsContent value="IYZICO" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="card_holder">Kart Sahibi</Label>
                <Input
                  id="card_holder"
                  value={paymentData.card_holder}
                  onChange={(e) => setPaymentData({ ...paymentData, card_holder: e.target.value })}
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card_number">Kart Numarası</Label>
                <Input
                  id="card_number"
                  value={paymentData.card_number}
                  onChange={(e) => setPaymentData({ ...paymentData, card_number: e.target.value })}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expire_month">Ay</Label>
                  <Input
                    id="expire_month"
                    value={paymentData.expire_month}
                    onChange={(e) => setPaymentData({ ...paymentData, expire_month: e.target.value })}
                    placeholder="MM"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expire_year">Yıl</Label>
                  <Input
                    id="expire_year"
                    value={paymentData.expire_year}
                    onChange={(e) => setPaymentData({ ...paymentData, expire_year: e.target.value })}
                    placeholder="YY"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    type="password"
                    value={paymentData.cvv}
                    onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                    placeholder="***"
                    maxLength={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="BALANCE" className="mt-4">
              <div className="p-6 text-center rounded-lg bg-muted/50">
                <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Ödeme acente bakiyesinden düşülecektir</p>
                <p className="font-semibold text-lg mt-2">{formatCurrency(selectedSale?.price || 0)}</p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="p-4 rounded-lg border mt-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Ödenecek Tutar:</span>
              <span className="text-2xl font-bold">{formatCurrency(selectedSale?.price || 0)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>İptal</Button>
            <Button onClick={handlePayment} disabled={paymentLoading}>
              {paymentLoading ? 'İşleniyor...' : 'Ödemeyi Tamamla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Satış Detayı
            </DialogTitle>
            <DialogDescription>Satış detayları</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* İade edilmiş uyarısı */}
            {selectedSale?.is_refunded && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 font-medium mb-2">
                  <XCircle className="h-5 w-5" />
                  Bu Satış İade Edildi
                </div>
                <div className="text-sm text-red-600 dark:text-red-400 space-y-1">
                  <p><strong>İade Tarihi:</strong> {selectedSale.refunded_at && formatDate(selectedSale.refunded_at)}</p>
                  <p><strong>İade Tutarı:</strong> {formatCurrency(selectedSale.refund_amount || 0)}</p>
                  {selectedSale.refund_reason && (
                    <p><strong>İade Sebebi:</strong> {selectedSale.refund_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Yatay Layout - Sol ve Sağ Kolonlar */}
            <div className="grid grid-cols-2 gap-6">
              {/* Sol Kolon */}
              <div className="space-y-4">
                {/* Müşteri ve Araç */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Müşteri</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {selectedSale?.customer?.name} {selectedSale?.customer?.surname}
                  </p>
                  {selectedSale?.customer?.phone && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSale.customer.phone}</p>
                  )}
                  {selectedSale?.customer?.email && (
                    <p className="text-sm text-muted-foreground">{selectedSale.customer.email}</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Car className="h-4 w-4" />
                    <span className="font-medium">Araç</span>
                  </div>
                  <p className="font-semibold text-lg">{selectedSale?.vehicle?.plate || '-'}</p>
                  {selectedSale?.vehicle?.model_year && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Model Yılı: {selectedSale.vehicle.model_year}
                    </p>
                  )}
                </div>

                {/* Paket */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <PackageIcon className="h-4 w-4" />
                    <span className="font-medium">Paket</span>
                  </div>
                  <p className="font-semibold">{selectedSale?.package?.name || '-'}</p>
                  {selectedSale?.package?.description && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSale.package.description}</p>
                  )}
                </div>
              </div>

              {/* Sağ Kolon */}
              <div className="space-y-4">
                {/* Satışı Yapan ve Acente/Şube */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Satışı Yapan</span>
                  </div>
                  <p className="font-semibold text-lg">
                    {selectedSale?.user?.name} {selectedSale?.user?.surname}
                  </p>
                  {selectedSale?.user?.email && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedSale.user.email}</p>
                  )}
                </div>

                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <ShoppingCart className="h-4 w-4" />
                    <span className="font-medium">Acente / Şube</span>
                  </div>
                  <p className="font-semibold">{selectedSale?.agency?.name || '-'}</p>
                  {selectedSale?.branch?.name && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Şube: {selectedSale.branch.name}
                    </p>
                  )}
                </div>

                {/* Tarihler */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      Başlangıç
                    </div>
                    <p className="font-medium">{selectedSale && formatDate(selectedSale.start_date)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1 text-xs">
                      <Calendar className="h-3 w-3" />
                      Bitiş
                    </div>
                    <p className="font-medium">{selectedSale && formatDate(selectedSale.end_date)}</p>
                  </div>
                </div>

                {/* Fiyat ve Komisyon */}
                <div className={canViewCommission ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <div className="text-muted-foreground mb-1 text-xs">Fiyat</div>
                    <p className="font-bold text-lg">{formatCurrency(selectedSale?.price || 0)}</p>
                  </div>
                  {/* Komisyon sadece yetkili kullanıcılar görebilir (Super Admin, Agency Admin, Branch Admin) */}
                  {canViewCommission && (
                    <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      <div className="text-muted-foreground mb-1 text-xs">Komisyon</div>
                      <p className="font-bold text-lg text-emerald-600">{formatCurrency(selectedSale?.commission || 0)}</p>
                    </div>
                  )}
                </div>

                {/* Poliçe Numarası ve Oluşturulma Tarihi */}
                {(selectedSale?.policy_number || selectedSale?.created_at) && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSale?.policy_number && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1 text-xs">Poliçe No</div>
                        <p className="font-medium text-sm">{selectedSale.policy_number}</p>
                      </div>
                    )}
                    {selectedSale?.created_at && (
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="text-muted-foreground mb-1 text-xs">Oluşturulma</div>
                        <p className="font-medium text-sm">{formatDate(selectedSale.created_at)}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {/* PDF ve İade Butonları */}
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => selectedSale && pdfService.downloadSaleContract(selectedSale.id)}
              >
                <Download className="h-4 w-4" />
                PDF Indir
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 gap-2"
                onClick={() => selectedSale && pdfService.viewSaleContract(selectedSale.id)}
              >
                <ExternalLink className="h-4 w-4" />
                PDF Goruntule
              </Button>
              {/* İade butonu - detay modalında da göster */}
              {canRefund && selectedSale && !selectedSale.is_refunded && new Date(selectedSale.end_date) > new Date() && (
                <Button 
                  variant="destructive" 
                  className="flex-1 gap-2"
                  onClick={() => {
                    setIsViewOpen(false);
                    handleOpenRefundModal(selectedSale);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                  İade Et
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ===== İADE MODAL - Geniş Layout ===== */}
      <Dialog open={isRefundModalOpen} onOpenChange={setIsRefundModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <RotateCcw className="h-5 w-5" />
              Satış İadesi
            </DialogTitle>
            <DialogDescription>
              Sözleşmeyi iptal edin ve kalan günlerin ücretini iade edin
            </DialogDescription>
          </DialogHeader>

          {refundCalculating ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">İade tutarı hesaplanıyor...</p>
              </div>
            </div>
          ) : refundCalculation ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SOL KOLON - Satış Bilgileri ve Hesaplama */}
              <div className="space-y-4">
                {/* Satış Bilgileri */}
                <div className="p-3 rounded-lg bg-muted/50">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2">SATIŞ BİLGİLERİ</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Müşteri:</span>
                      <span className="font-medium">{refundCalculation.sale.customer_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Plaka:</span>
                      <span className="font-medium">{refundCalculation.sale.vehicle_plate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paket:</span>
                      <span className="font-medium">{refundCalculation.sale.package_name}</span>
                    </div>
                  </div>
                </div>

                {/* Fiyat Hesaplama */}
                <div className="p-3 rounded-lg border">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2">FİYAT DETAYI</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Toplam (KDV Dahil):</span>
                      <span>{formatCurrency(refundCalculation.calculation.total_price)}</span>
                    </div>
                    <div className="flex justify-between text-amber-600">
                      <span>- KDV (%20):</span>
                      <span>{formatCurrency(refundCalculation.calculation.kdv_amount)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-1">
                      <span className="text-muted-foreground">Net Fiyat:</span>
                      <span className="font-medium">{formatCurrency(refundCalculation.calculation.net_price)}</span>
                    </div>
                  </div>
                </div>

                {/* Gün Hesaplama */}
                <div className="p-3 rounded-lg border">
                  <h4 className="font-semibold text-xs text-muted-foreground mb-2">GÜN HESABI</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sözleşme:</span>
                      <span>{refundCalculation.calculation.contract_days} gün</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Kullanılan:</span>
                      <span className="text-red-600">-{refundCalculation.calculation.used_days} gün</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-medium border-t pt-1 mt-1">
                      <span>Kalan:</span>
                      <span>{refundCalculation.calculation.remaining_days} gün</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground pt-1">
                      <span>Günlük ücret:</span>
                      <span>{formatCurrency(refundCalculation.calculation.daily_rate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SAĞ KOLON - İade Tutarı ve Form */}
              <div className="space-y-4">
                {/* İade Tutarı */}
                <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-center">
                    <p className="text-sm text-emerald-600 mb-1">İade Tutarı</p>
                    <p className="text-3xl font-bold text-emerald-600">
                      {formatCurrency(refundCalculation.calculation.refund_amount)}
                    </p>
                    <p className="text-xs text-emerald-600/70 mt-2">
                      {formatCurrency(refundCalculation.calculation.daily_rate)} × {refundCalculation.calculation.remaining_days} gün
                    </p>
                  </div>
                </div>

                {/* İade Sebebi */}
                <div className="space-y-2">
                  <Label htmlFor="refund_reason">İade Sebebi <span className="text-red-500">*</span></Label>
                  <Textarea
                    id="refund_reason"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="İade sebebini yazın..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Uyarı */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Bu işlem geri alınamaz. Satış iptal edilecek ve iade tutarı hesaba aktarılacaktır.
                  </p>
                </div>

                {/* Butonlar */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsRefundModalOpen(false)} 
                    disabled={refundLoading}
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleConfirmRefund} 
                    disabled={refundLoading || !refundReason.trim() || refundCalculating}
                    className="flex-1"
                  >
                    {refundLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        İade...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        İade Onayla
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
