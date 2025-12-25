import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { DataPagination } from '@/components/ui/pagination';
import { saleService, pdfService } from '@/services/apiService';
import type { Sale } from '@/types';
import { 
  Search, Eye, ShoppingCart, Download, RefreshCcw,
  User, Car, Package as PackageIcon, Building2, GitBranch
} from 'lucide-react';
// Format fonksiyonları
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(value);
};

// Sayfa başına gösterilecek kayıt sayısı
const ITEMS_PER_PAGE = 20;

/**
 * Destek Ekibi için Satış Sorgulama Sayfası
 * Tüm satışları görüntüleyebilir ve detaylarını inceleyebilir
 */
export default function SupportSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Otomatik arama kaldırıldı - sadece butona basıldığında arama yapılacak

  // Satışları getir (sadece search query ile)
  const fetchSales = async (query: string) => {
    if (!query.trim()) {
      setSales([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const salesData = await saleService.getAll({ search: query.trim() });
      setSales(salesData);
    } catch (error) {
      console.error('Satışlar yüklenirken hata:', error);
      setSales([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Sorgula butonuna tıklandığında
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSales([]);
      return;
    }
    setCurrentPage(1); // Yeni arama yapıldığında sayfa numarasını sıfırla
    fetchSales(searchQuery);
  };

  // Enter tuşuna basıldığında da arama yap
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Filtrelenmiş satışlar (artık backend'de filtreleniyor, burada sadece pagination için)
  const filteredSales = sales;

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSales.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSales, currentPage]);


  // Satış detayını görüntüle
  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsViewOpen(true);
  };

  // PDF indir
  const handleDownloadPDF = async (sale: Sale) => {
    try {
      // downloadSaleContract zaten indirme işlemini yapıyor, void döndürüyor
      await pdfService.downloadSaleContract(sale.id);
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      alert('PDF indirilirken bir hata oluştu');
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="h-8 w-8" />
            Satış Sorgulama
          </h1>
          <p className="text-muted-foreground">Satışları sorgulamak için arama yapın</p>
        </div>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Satış Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Satış numarası veya plaka ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="gap-2">
              <Search className="h-4 w-4" />
              Sorgula
            </Button>
            <Button onClick={() => { setSearchQuery(''); setSales([]); }} variant="outline" className="gap-2">
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
          {isSearching ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : !searchQuery.trim() ? (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Arama yapmak için yukarıdaki arama kutusuna satış numarası veya plaka girin ve "Sorgula" butonuna basın</p>
              <p className="text-sm text-muted-foreground">Satış numarası veya plaka ile arama yapabilirsiniz</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Arama kriterlerinize uygun satış bulunamadı</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Satış ID</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>TC/VKN</TableHead>
                      <TableHead>Araç</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Acente</TableHead>
                      <TableHead>Şube</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Başlangıç</TableHead>
                      <TableHead>Bitiş</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-mono text-xs">
                          {sale.id.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {sale.customer?.name} {sale.customer?.surname}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {sale.customer?.tc_vkn}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{sale.vehicle?.plate}</div>
                              <div className="text-xs text-muted-foreground">
                                {sale.vehicle?.brand?.name} {sale.vehicle?.model?.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PackageIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{sale.package?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{(sale.agency as any)?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <GitBranch className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{(sale.branch as any)?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(parseFloat(sale.price.toString()))}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(sale.start_date)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(sale.end_date)}
                        </TableCell>
                        <TableCell>
                          {sale.is_refunded ? (
                            <Badge variant="destructive">İade Edildi</Badge>
                          ) : new Date(sale.end_date) >= new Date() ? (
                            <Badge variant="default" className="bg-green-500">Aktif</Badge>
                          ) : (
                            <Badge variant="secondary">Süresi Dolmuş</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewSale(sale)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadPDF(sale)}
                            >
                              <Download className="h-4 w-4" />
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

      {/* Satış Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Satış Detayları</DialogTitle>
            <DialogDescription>
              Satış bilgilerini detaylı olarak görüntüleyebilirsiniz
            </DialogDescription>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-6">
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{selectedSale.customer?.name} {selectedSale.customer?.surname}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TC/VKN</p>
                    <p className="font-medium font-mono">{selectedSale.customer?.tc_vkn}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedSale.customer?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">E-posta</p>
                    <p className="font-medium">{selectedSale.customer?.email || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Adres</p>
                    <p className="font-medium">
                      {selectedSale.customer?.address || '-'}
                      {selectedSale.customer?.city && `, ${selectedSale.customer?.city}`}
                      {selectedSale.customer?.district && ` / ${selectedSale.customer?.district}`}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Araç Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="h-5 w-5" />
                    Araç Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plaka</p>
                    <p className="font-medium">{selectedSale.vehicle?.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marka/Model</p>
                    <p className="font-medium">
                      {selectedSale.vehicle?.brand?.name} {selectedSale.vehicle?.model?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Yılı</p>
                    <p className="font-medium">{selectedSale.vehicle?.model_year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Kullanım Tipi</p>
                    <p className="font-medium">{selectedSale.vehicle?.usage_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ruhsat Seri</p>
                    <p className="font-medium">{selectedSale.vehicle?.registration_serial || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ruhsat No</p>
                    <p className="font-medium">{selectedSale.vehicle?.registration_number || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Satış Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Satış Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Paket</p>
                    <p className="font-medium">{selectedSale.package?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tutar</p>
                    <p className="font-medium text-lg">{formatCurrency(parseFloat(selectedSale.price.toString()))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Komisyon</p>
                    <p className="font-medium text-lg text-blue-600">
                      {formatCurrency(parseFloat(selectedSale.commission?.toString() || '0'))}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Acente</p>
                    <p className="font-medium">{(selectedSale.agency as any)?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Şube</p>
                    <p className="font-medium">{(selectedSale.branch as any)?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Durum</p>
                    {selectedSale.is_refunded ? (
                      <Badge variant="destructive">İade Edildi</Badge>
                    ) : new Date(selectedSale.end_date) >= new Date() ? (
                      <Badge variant="default" className="bg-green-500">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary">Süresi Dolmuş</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                    <p className="font-medium">{formatDate(selectedSale.start_date)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                    <p className="font-medium">{formatDate(selectedSale.end_date)}</p>
                  </div>
                  {selectedSale.is_refunded && (
                    <>
                      <div>
                        <p className="text-sm text-muted-foreground">İade Tarihi</p>
                        <p className="font-medium">
                          {selectedSale.refunded_at ? formatDate(selectedSale.refunded_at) : '-'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">İade Tutarı</p>
                        <p className="font-medium text-red-600">
                          {selectedSale.refund_amount ? formatCurrency(selectedSale.refund_amount) : '-'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">İade Sebebi</p>
                        <p className="font-medium">{selectedSale.refund_reason || '-'}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* İşlem Butonları */}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleDownloadPDF(selectedSale)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  PDF İndir
                </Button>
                <Button onClick={() => setIsViewOpen(false)}>Kapat</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

