import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { paymentService } from '@/services/apiService';
import type { Payment } from '@/types';
import { PaymentStatus, PaymentType } from '@/types';
import { 
  Search, Eye, CreditCard, Wallet, RefreshCcw, 
  CheckCircle, XCircle, Clock, RotateCcw, Calendar, 
  Hash, FileText, AlertTriangle
} from 'lucide-react';

// Sayfa basina gosterilecek kayit sayisi
const ITEMS_PER_PAGE = 10;

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundLoading, setRefundLoading] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await paymentService.getAll();
      setPayments(data);
    } catch (error) {
      console.error('Ödemeler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmis odemeler
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = 
        payment.transaction_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.sale?.policy_number?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
      const matchesType = filterType === 'all' || payment.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [payments, searchQuery, filterStatus, filterType]);

  // Pagination hesaplamalari
  const totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPayments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPayments, currentPage]);

  // Filtre degistiginde sayfa numarasini sifirla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterType]);

  const handleView = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsViewOpen(true);
  };

  const handleRefundClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setRefundReason('');
    setIsRefundOpen(true);
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundReason.trim()) return;
    setRefundLoading(true);
    try {
      await paymentService.refund(selectedPayment.id, refundReason);
      setIsRefundOpen(false);
      fetchPayments();
      alert('İade işlemi başarıyla tamamlandı!');
    } catch (error) {
      console.error('İade işlenirken hata:', error);
      alert('İade işlemi başarısız oldu!');
    } finally {
      setRefundLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(value);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Tamamlandı</Badge>;
      case PaymentStatus.PENDING:
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Bekliyor</Badge>;
      case PaymentStatus.FAILED:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Başarısız</Badge>;
      case PaymentStatus.REFUNDED:
        return <Badge variant="secondary" className="gap-1"><RotateCcw className="h-3 w-3" />İade Edildi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: PaymentType) => {
    switch (type) {
      case PaymentType.PAYTR:
        return <Badge variant="info" className="gap-1"><CreditCard className="h-3 w-3" />Kredi Kartı</Badge>;
      case PaymentType.BALANCE:
        return <Badge variant="secondary" className="gap-1"><Wallet className="h-3 w-3" />Bakiye</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // İstatistikler
  const stats = {
    total: payments.length,
    completed: payments.filter(p => p.status === PaymentStatus.COMPLETED).length,
    pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
    refunded: payments.filter(p => p.status === PaymentStatus.REFUNDED).length,
    totalAmount: payments.filter(p => p.status === PaymentStatus.COMPLETED).reduce((sum, p) => sum + p.amount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-8 w-8" />
            Ödemeler
          </h1>
          <p className="text-muted-foreground">Tüm ödeme işlemlerini görüntüleyin ve yönetin</p>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Ödeme</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tamamlanan</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
    <div>
                <p className="text-sm text-muted-foreground">Toplam Tutar</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
          <CardDescription>Ödemeleri filtreleyin ve arayın</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="İşlem ID veya satış numarası..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value={PaymentStatus.COMPLETED}>Tamamlandı</SelectItem>
                <SelectItem value={PaymentStatus.PENDING}>Bekliyor</SelectItem>
                <SelectItem value={PaymentStatus.FAILED}>Başarısız</SelectItem>
                <SelectItem value={PaymentStatus.REFUNDED}>İade Edildi</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Tipler</SelectItem>
                <SelectItem value={PaymentType.PAYTR}>Kredi Kartı</SelectItem>
                <SelectItem value={PaymentType.BALANCE}>Bakiye</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearchQuery(''); setFilterStatus('all'); setFilterType('all'); }} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ödeme Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredPayments.length} ödeme bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Ödeme bulunmuyor</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Islem ID</TableHead>
                      <TableHead>Satis No</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Tip</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="text-right">Islemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedPayments.map((payment) => (
                      <TableRow key={payment.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">
                          {payment.transaction_id?.slice(0, 12) || '-'}...
                        </TableCell>
                        <TableCell>{payment.sale?.policy_number || '-'}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>{getTypeBadge(payment.type)}</TableCell>
                        <TableCell>{getStatusBadge(payment.status)}</TableCell>
                        <TableCell className="text-sm">{formatDate(payment.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleView(payment)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === PaymentStatus.COMPLETED && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRefundClick(payment)}
                                className="text-amber-600 hover:text-amber-700"
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            )}
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

      {/* Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Ödeme Detayı
            </DialogTitle>
            <DialogDescription>Ödeme işlemi detayları</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Hash className="h-4 w-4" />
                İşlem ID
              </div>
              <p className="font-mono text-sm break-all">{selectedPayment?.transaction_id || '-'}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Satış No
                </div>
                <p className="font-medium">{selectedPayment?.sale?.policy_number || '-'}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Tarih
                </div>
                <p className="font-medium">{selectedPayment && formatDate(selectedPayment.created_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-muted-foreground mb-1">Ödeme Tipi</div>
                {selectedPayment && getTypeBadge(selectedPayment.type)}
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-muted-foreground mb-1">Durum</div>
                {selectedPayment && getStatusBadge(selectedPayment.status)}
              </div>
            </div>
            <div className="p-6 rounded-lg bg-primary/10 text-center">
              <div className="text-muted-foreground mb-1">Ödenen Tutar</div>
              <p className="text-3xl font-bold">{formatCurrency(selectedPayment?.amount || 0)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* İade Modal */}
      <Dialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Ödeme İadesi
            </DialogTitle>
            <DialogDescription>Bu işlem geri alınamaz. Lütfen dikkatli olun.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">İade Edilecek Tutar</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">{formatCurrency(selectedPayment?.amount || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="refund_reason">İade Sebebi *</Label>
              <Textarea
                id="refund_reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="İade sebebini açıklayın..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundOpen(false)}>İptal</Button>
            <Button 
              variant="destructive" 
              onClick={handleRefund}
              disabled={!refundReason.trim() || refundLoading}
            >
              {refundLoading ? 'İşleniyor...' : 'İade Et'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
