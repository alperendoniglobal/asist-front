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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { commissionService, branchService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Commission, CommissionSummaryItem } from '@/types';
import type { Branch } from '@/types';
import { CommissionStatus, UserRole } from '@/types';
import { 
  Plus, Eye, TrendingUp, Clock, CheckCircle, XCircle, Banknote, 
  Calendar, FileText, AlertTriangle, RefreshCcw, Search, Wallet, Building2, MapPin
} from 'lucide-react';

export default function Commissions() {
  const { user } = useAuth();
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);
  const [formData, setFormData] = useState({
    amount: '',
    bank_account: '',
    notes: ''
  });
  // Super Admin: broker veya acente adına ödeme kaydı oluşturmak için
  const [formDataSuperAdmin, setFormDataSuperAdmin] = useState<{
    paymentTarget: 'agency' | 'branch';
    agency_id: string;
    branch_id: string;
    amount: string;
    bank_account: string;
    notes: string;
  }>({
    paymentTarget: 'agency',
    agency_id: '',
    branch_id: '',
    amount: '',
    bank_account: '',
    notes: ''
  });
  const [branchesForAgency, setBranchesForAgency] = useState<Branch[]>([]);
  const [branchesLoading, setBranchesLoading] = useState(false);
  const [isCreatePaymentOpen, setIsCreatePaymentOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState<CommissionSummaryItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(true);
  /** Bakiye ile ödenen satışlar (komisyondan düşmez; sayfada yansıtılır) */
  const [balancePaidStats, setBalancePaidStats] = useState<{ count: number; totalAmount: number } | null>(null);
  /** Aktif sekme: 'requests' = Komisyon Talepleri, 'summary' = Broker/Acente Komisyon Özeti */
  const [activeTab, setActiveTab] = useState<'requests' | 'summary'>('requests');
  /** Broker / Acente Özeti sekmesi filtreleri: brokera göre, tipe göre (direkt/acente) */
  const [summaryFilterBroker, setSummaryFilterBroker] = useState<string>('all');
  const [summaryFilterType, setSummaryFilterType] = useState<'all' | 'broker' | 'branch'>('all');
  /** Broker / Acente Özeti sıralama: hangi sütuna göre, yön (yüksekten düşüğe / düşükten yükseğe) */
  const [summarySortBy, setSummarySortBy] = useState<'balance' | 'totalEarned' | 'totalPaid' | 'name'>('balance');
  const [summarySortOrder, setSummarySortOrder] = useState<'desc' | 'asc'>('desc');

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchCommissions();
    fetchSummary();
    // Bakiye ile ödenen satış istatistiği (komisyon sayfasında gösterilir)
    commissionService.getBalancePaidStats().then(setBalancePaidStats).catch(() => setBalancePaidStats(null));
  }, []);

  // Seçilen brokera ait acenteleri yükle (Super Admin acente ödemesi için)
  useEffect(() => {
    if (!formDataSuperAdmin.agency_id || formDataSuperAdmin.paymentTarget !== 'branch') {
      setBranchesForAgency([]);
      setFormDataSuperAdmin((f) => ({ ...f, branch_id: '' }));
      return;
    }
    let cancelled = false;
    setBranchesLoading(true);
    branchService.getAll({ agency_id: formDataSuperAdmin.agency_id })
      .then((data) => { if (!cancelled) setBranchesForAgency(data); })
      .catch(() => { if (!cancelled) setBranchesForAgency([]); })
      .finally(() => { if (!cancelled) setBranchesLoading(false); });
    return () => { cancelled = true; };
  }, [formDataSuperAdmin.agency_id, formDataSuperAdmin.paymentTarget]);

  const fetchCommissions = async () => {
    try {
      setLoading(true);
      const data = await commissionService.getAll();
      setCommissions(data);
    } catch (error) {
      console.error('Komisyonlar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Komisyon özeti: toplam ödenen, ödenecek bakiye, broker/acente bazlı (Super Admin) */
  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const data = await commissionService.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Komisyon özeti yüklenirken hata:', error);
    } finally {
      setSummaryLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(commission => {
    const matchesSearch = commission.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || commission.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async () => {
    try {
      await commissionService.create({
        amount: parseFloat(formData.amount),
        bank_account: formData.bank_account,
        notes: formData.notes
      });
      setIsCreateOpen(false);
      resetForm();
      await fetchCommissions();
      await fetchSummary();
      alert('Komisyon talebi oluşturuldu!');
    } catch (error: any) {
      console.error('Komisyon talebi oluşturulurken hata:', error);
      alert(error?.response?.data?.message || 'Komisyon talebi oluşturulamadı!');
    }
  };

  const handleApprove = async () => {
    if (!selectedCommission) return;
    setActionLoading(true);
    try {
      await commissionService.approve(selectedCommission.id);
      setIsApproveOpen(false);
      await fetchCommissions();
      await fetchSummary();
      alert('Komisyon talebi onaylandı!');
    } catch (error) {
      console.error('Komisyon onaylanırken hata:', error);
      alert('Komisyon onaylanamadı!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCommission || !rejectNotes.trim()) return;
    setActionLoading(true);
    try {
      await commissionService.reject(selectedCommission.id, rejectNotes);
      setIsRejectOpen(false);
      setRejectNotes('');
      await fetchCommissions();
      await fetchSummary();
      alert('Komisyon talebi reddedildi!');
    } catch (error) {
      console.error('Komisyon reddedilirken hata:', error);
      alert('Komisyon reddedilemedi!');
    } finally {
      setActionLoading(false);
    }
  };

  const handleView = (commission: Commission) => {
    setSelectedCommission(commission);
    setIsViewOpen(true);
  };

  const handleMarkAsPaid = async (commission: Commission) => {
    if (!commission) return;
    setActionLoading(true);
    try {
      await commissionService.markAsPaid(commission.id);
      await fetchCommissions();
      await fetchSummary();
      setSelectedCommission(null);
      setIsViewOpen(false);
      alert('Komisyon ödendi olarak işaretlendi!');
    } catch (error: any) {
      console.error('Ödendi işaretlenirken hata:', error);
      alert(error?.response?.data?.message || 'İşlem başarısız!');
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      bank_account: '',
      notes: ''
    });
  };

  /** Super Admin: Broker veya acente adına ödeme kaydı oluştur */
  const handleCreatePaymentRecord = async () => {
    if (!formDataSuperAdmin.agency_id || !formDataSuperAdmin.amount) {
      alert('Broker ve tutar seçin.');
      return;
    }
    if (formDataSuperAdmin.paymentTarget === 'branch' && !formDataSuperAdmin.branch_id) {
      alert('Acente seçin.');
      return;
    }
    try {
      await commissionService.create({
        agency_id: formDataSuperAdmin.agency_id,
        branch_id: formDataSuperAdmin.paymentTarget === 'branch' ? formDataSuperAdmin.branch_id : undefined,
        amount: parseFloat(formDataSuperAdmin.amount),
        bank_account: formDataSuperAdmin.bank_account || undefined,
        notes: formDataSuperAdmin.notes || undefined
      });
      setIsCreatePaymentOpen(false);
      resetPaymentForm();
      await fetchCommissions();
      await fetchSummary();
      alert('Ödeme kaydı oluşturuldu. Talebi onaylayıp Ödendi işaretleyin.');
    } catch (error: any) {
      console.error('Ödeme kaydı oluşturulurken hata:', error);
      alert(error?.response?.data?.message || 'Kayıt oluşturulamadı!');
    }
  };

  const resetPaymentForm = () => {
    setFormDataSuperAdmin({ paymentTarget: 'agency', agency_id: '', branch_id: '', amount: '', bank_account: '', notes: '' });
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

  const getStatusBadge = (status: CommissionStatus) => {
    switch (status) {
      case CommissionStatus.PENDING:
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Bekliyor</Badge>;
      case CommissionStatus.APPROVED:
        return <Badge variant="info" className="gap-1"><CheckCircle className="h-3 w-3" />Onaylandı</Badge>;
      case CommissionStatus.REJECTED:
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Reddedildi</Badge>;
      case CommissionStatus.PAID:
        return <Badge variant="success" className="gap-1"><Banknote className="h-3 w-3" />Ödendi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // İstatistikler: tüm durumlar + ödenen toplam (amount sayıya çevrilir, NaN önlenir)
  const stats = {
    total: commissions.length,
    pending: commissions.filter(c => c.status === CommissionStatus.PENDING).length,
    approved: commissions.filter(c => c.status === CommissionStatus.APPROVED).length,
    rejected: commissions.filter(c => c.status === CommissionStatus.REJECTED).length,
    paid: commissions.filter(c => c.status === CommissionStatus.PAID).length,
    totalAmount: commissions
      .filter(c => c.status === CommissionStatus.PAID)
      .reduce((sum, c) => sum + (Number(c.amount) || 0), 0)
  };

  // Özet: ödenecek bakiye (API bazen string dönebilir; Number ile güvenli toplam)
  const totalBalance = summary.reduce((s, i) => s + (Number(i.balance) || 0), 0);
  const totalPaidFromSummary = summary.reduce((s, i) => s + (Number(i.totalPaid) || 0), 0);

  /** Broker / Acente Özeti sekmesi: brokera ve tipe göre filtrelenmiş liste */
  const filteredSummary = summary.filter((row) => {
    const matchBroker = summaryFilterBroker === 'all' || row.agencyId === summaryFilterBroker;
    const matchType =
      summaryFilterType === 'all' ||
      (summaryFilterType === 'broker' && !row.branchId) ||
      (summaryFilterType === 'branch' && !!row.branchId);
    return matchBroker && matchType;
  });
  /** Sıralanmış özet: desc = yüksekten düşüğe (en büyük en üstte), asc = düşükten yükseğe */
  const sortedSummary = [...filteredSummary].sort((a, b) => {
    if (summarySortBy === 'name') {
      const nameA = (a.branchId && a.branchName ? `${a.agencyName ?? ''} — ${a.branchName ?? ''}` : a.agencyName ?? '').toLowerCase();
      const nameB = (b.branchId && b.branchName ? `${b.agencyName ?? ''} — ${b.branchName ?? ''}` : b.agencyName ?? '').toLowerCase();
      const cmp = nameA.localeCompare(nameB, 'tr');
      return summarySortOrder === 'desc' ? -cmp : cmp;
    }
    const valA = summarySortBy === 'balance' ? a.balance : summarySortBy === 'totalEarned' ? a.totalEarned : a.totalPaid;
    const valB = summarySortBy === 'balance' ? b.balance : summarySortBy === 'totalEarned' ? b.totalEarned : b.totalPaid;
    const numA = Number(valA) || 0;
    const numB = Number(valB) || 0;
    // desc = yüksekten düşüğe: büyük önce gelsin → numB - numA (negatif when numA > numB → a önce)
    const diff = numA - numB;
    return summarySortOrder === 'desc' ? -diff : diff;
  });
  /** Filtrelenmiş özet toplamları (Number ile güvenli toplam) */
  const filteredTotalBalance = filteredSummary.reduce((s, i) => s + (Number(i.balance) || 0), 0);
  const filteredTotalPaid = filteredSummary.reduce((s, i) => s + (Number(i.totalPaid) || 0), 0);
  /** Dropdown için benzersiz broker listesi (agencyId + agencyName) */
  const uniqueBrokers = Array.from(
    new Map(summary.map((row) => [row.agencyId, { id: row.agencyId, name: row.agencyName ?? '' }])).values()
  ).sort((a, b) => (a.name || '').localeCompare(b.name || '', 'tr'));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            Komisyon Talepleri
          </h1>
          <p className="text-muted-foreground">
            {isSuperAdmin ? 'Tüm komisyon taleplerini yönetin' : 'Komisyon taleplerinizi görüntüleyin'}
          </p>
        </div>
        <div className="flex gap-2">
          {isSuperAdmin && (
            <Button
              variant="outline"
              onClick={() => setIsCreatePaymentOpen(true)}
              className="gap-2"
              title="Bir broker veya acente adına ödenen tutarı kaydedin (kısmi ödeme). Oluşan talebi onaylayıp Ödendi işaretleyin."
            >
              <Banknote className="h-4 w-4" />
              Ödeme Kaydı Oluştur
            </Button>
          )}
          {!isSuperAdmin && (
            <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
              <Plus className="h-4 w-4" />
              Yeni Talep
            </Button>
          )}
        </div>
      </div>

      {/* Sekmeler: Komisyon Talepleri | Broker / Acente Komisyon Özeti */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'requests' | 'summary')} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="requests" className="gap-2">
            <FileText className="h-4 w-4" />
            Komisyon Talepleri
          </TabsTrigger>
          <TabsTrigger value="summary" className="gap-2">
            <Building2 className="h-4 w-4" />
            Broker / Acente Komisyon Özeti
          </TabsTrigger>
        </TabsList>

        {/* Sekme 1: Komisyon Talepleri – açıklama, özet kartları, istatistikler, filtreler, liste */}
        <TabsContent value="requests" className="space-y-6 mt-0">
          {/* Ödeme nasıl kaydedilir (açıklama) */}
          {isSuperAdmin && (
            <Card className="border-dashed bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Ödeme kaydetmek için:</strong> &quot;Ödeme Kaydı Oluştur&quot; ile <strong>Broker</strong> veya <strong>Acente</strong> seçin (broker ayrı, acente ayrı ödeme yapabilirsiniz). Tutarı girin, oluşan talebi <strong>Onayla</strong>, sonra <strong>Ödendi işaretle</strong> (banknot ikonu). Broker ödemesi broker bakiyesinden, acente ödemesi acente bakiyesinden düşülür.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Özet kartları: Toplam ödenen, Ödenecek (bakiye), Bakiye ile ödenen satışlar (komisyondan düşmez) */}
          {(!summaryLoading && summary.length > 0) || balancePaidStats !== null ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {!summaryLoading && summary.length > 0 && (
                <>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Toplam Ödenen (Komisyon)</p>
                          <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaidFromSummary)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Broker ve acentelere ödenen toplam</p>
                        </div>
                        <Banknote className="h-8 w-8 text-emerald-500" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Ödenecek (Bakiye)</p>
                          <p className="text-2xl font-bold text-violet-600">{formatCurrency(totalBalance)}</p>
                          <p className="text-xs text-muted-foreground mt-1">Henüz ödenmemiş komisyon alacağı</p>
                        </div>
                        <Wallet className="h-8 w-8 text-violet-500" />
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
              {/* Bakiye ile ödenen satışlar: komisyondan düşmez, sayfada yansıtılır */}
              {balancePaidStats !== null && (
                <Card className="bg-amber-500/5 border-amber-500/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Bakiye ile Ödenen Satışlar</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {balancePaidStats.count} adet · {formatCurrency(balancePaidStats.totalAmount)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Bu satışlarda komisyon kesilmez</p>
                      </div>
                      <Wallet className="h-8 w-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : null}

          {/* İstatistik Kartları: Toplam Talep, Bekleyen, Onaylanan, Reddedilen, Ödenen (adet), Ödenen Toplam (tutar) */}
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Toplam Talep</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <FileText className="h-8 w-8 text-muted-foreground" />
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
                    <p className="text-sm text-muted-foreground">Onaylanan</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reddedilen</p>
                    <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ödenen</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.paid}</p>
                    <p className="text-xs text-muted-foreground mt-1">talep ödendi</p>
                  </div>
                  <Banknote className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ödenen Toplam</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground mt-1">toplam tutar</p>
                  </div>
                  <Banknote className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtreler */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Not ile ara..."
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
                <SelectItem value={CommissionStatus.PENDING}>Bekliyor</SelectItem>
                <SelectItem value={CommissionStatus.APPROVED}>Onaylandı</SelectItem>
                <SelectItem value={CommissionStatus.REJECTED}>Reddedildi</SelectItem>
                <SelectItem value={CommissionStatus.PAID}>Ödendi</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => { setSearchQuery(''); setFilterStatus('all'); }} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Komisyon Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Komisyon Talepleri</CardTitle>
          <CardDescription>
            Toplam {filteredCommissions.length} talep bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredCommissions.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Komisyon talebi bulunmuyor</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alıcı</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Talep Tarihi</TableHead>
                    <TableHead>İşlem Tarihi</TableHead>
                    <TableHead>Not</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCommissions.map((commission) => (
                    <TableRow key={commission.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {commission.agency?.name ?? '-'}
                        {commission.branch_id && commission.branch?.name ? ` — ${commission.branch.name}` : ''}
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(commission.amount)}</TableCell>
                      <TableCell>{getStatusBadge(commission.status)}</TableCell>
                      <TableCell className="text-sm">{formatDate(commission.created_at)}</TableCell>
                      <TableCell className="text-sm">
                        {commission.approved_at ? formatDate(commission.approved_at) : 
                         commission.paid_at ? formatDate(commission.paid_at) : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{commission.notes || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleView(commission)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isSuperAdmin && commission.status === CommissionStatus.PENDING && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setSelectedCommission(commission); setIsApproveOpen(true); }}
                                className="text-emerald-600 hover:text-emerald-700"
                                title="Onayla"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setSelectedCommission(commission); setIsRejectOpen(true); }}
                                className="text-destructive hover:text-destructive"
                                title="Reddet"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {isSuperAdmin && commission.status === CommissionStatus.APPROVED && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleMarkAsPaid(commission)}
                              disabled={actionLoading}
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Ödendi işaretle"
                            >
                              <Banknote className="h-4 w-4" />
                            </Button>
                          )}
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
        </TabsContent>

        {/* Sekme 2: Broker / Acente Komisyon Özeti – filtreler, özet kartları, tablo */}
        <TabsContent value="summary" className="space-y-6 mt-0">
          {/* Filtreler: Brokera göre, Tipe göre (Broker Direkt / Acente) */}
          {!summaryLoading && summary.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtreler</CardTitle>
                <CardDescription>
                  Brokera göre veya tipe göre (Broker direkt / Acente) listeleyebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
                  <div className="space-y-2 flex-1 min-w-[140px]">
                    <Label>Broker</Label>
                    <Select value={summaryFilterBroker} onValueChange={setSummaryFilterBroker}>
                      <SelectTrigger>
                        <SelectValue placeholder="Broker seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        {uniqueBrokers.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1 min-w-[140px]">
                    <Label>Tip</Label>
                    <Select
                      value={summaryFilterType}
                      onValueChange={(v) => setSummaryFilterType(v as 'all' | 'broker' | 'branch')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tip" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="broker">Broker (Direkt)</SelectItem>
                        <SelectItem value="branch">Acente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1 min-w-[180px]">
                    <Label>Sırala</Label>
                    <Select
                      value={summarySortBy}
                      onValueChange={(v) => setSummarySortBy(v as 'balance' | 'totalEarned' | 'totalPaid' | 'name')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sırala" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="balance">Ödenecek (Bakiye)</SelectItem>
                        <SelectItem value="totalEarned">Toplam Kazanılan</SelectItem>
                        <SelectItem value="totalPaid">Toplam Ödenen</SelectItem>
                        <SelectItem value="name">Alıcı adı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1 min-w-[160px]">
                    <Label>Yön</Label>
                    <Select value={summarySortOrder} onValueChange={(v) => setSummarySortOrder(v as 'desc' | 'asc')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Yön" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Yüksekten düşüğe</SelectItem>
                        <SelectItem value="asc">Düşükten yükseğe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSummaryFilterBroker('all');
                        setSummaryFilterType('all');
                        setSummarySortBy('balance');
                        setSummarySortOrder('desc');
                      }}
                      className="gap-2"
                    >
                      <RefreshCcw className="h-4 w-4" />
                      Sıfırla
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Özet kartları: Filtrelenmiş toplam ödenen / ödenecek */}
          {!summaryLoading && summary.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Toplam Ödenen (Komisyon)</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatCurrency(filteredTotalPaid)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summaryFilterBroker !== 'all' || summaryFilterType !== 'all'
                          ? 'Filtreye göre ödenen toplam'
                          : 'Broker ve acentelere ödenen toplam'}
                      </p>
                    </div>
                    <Banknote className="h-8 w-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Ödenecek (Bakiye)</p>
                      <p className="text-2xl font-bold text-violet-600">{formatCurrency(filteredTotalBalance)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {summaryFilterBroker !== 'all' || summaryFilterType !== 'all'
                          ? 'Filtreye göre ödenecek bakiye'
                          : 'Henüz ödenmemiş komisyon alacağı'}
                      </p>
                    </div>
                    <Wallet className="h-8 w-8 text-violet-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Broker ve acente ayrı satırlar – filtrelenmiş tablo (Bakiye ile Ödenen sütunu dahil) */}
          {!summaryLoading && summary.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Broker / Acente Komisyon Özeti
                </CardTitle>
                <CardDescription>
                  {filteredSummary.length === summary.length
                    ? 'Broker ve acente alacakları ayrı ayrı: toplam kazanılan, toplam ödenen ve ödenecek bakiye. Sıralama: filtre kartından değiştirilebilir.'
                    : `Filtreye uyan ${filteredSummary.length} satır (toplam ${summary.length})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Alıcı</TableHead>
                      <TableHead className="text-right">Toplam Kazanılan</TableHead>
                      <TableHead className="text-right">Toplam Ödenen</TableHead>
                      <TableHead className="text-right">Ödenecek (Bakiye)</TableHead>
                      <TableHead className="text-right">Bakiye ile Ödenen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSummary.map((row) => (
                      <TableRow key={row.branchId ? `${row.agencyId}-${row.branchId}` : row.agencyId}>
                        <TableCell className="font-medium">
                          {row.branchId && row.branchName ? `${row.agencyName} — ${row.branchName}` : row.agencyName}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(Number(row.totalEarned) || 0)}</TableCell>
                        <TableCell className="text-right text-emerald-600">{formatCurrency(Number(row.totalPaid) || 0)}</TableCell>
                        <TableCell className="text-right text-violet-600">{formatCurrency(Number(row.balance) || 0)}</TableCell>
                        <TableCell className="text-right text-amber-600 text-sm">
                          {(row.balancePaidCount ?? 0) > 0 || (row.balancePaidAmount ?? 0) > 0
                            ? `${row.balancePaidCount ?? 0} adet · ${formatCurrency(row.balancePaidAmount ?? 0)}`
                            : '—'}
                          {(row.balancePaidCount ?? 0) > 0 && (
                            <span className="block text-xs text-muted-foreground">komisyon kesilmez</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {sortedSummary.length === 0 && (
                  <p className="text-center py-6 text-muted-foreground text-sm">
                    Seçilen filtreye uyan kayıt yok. Filtreleri değiştirip tekrar deneyin.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : summaryLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Komisyon özeti verisi bulunamadı.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Super Admin: Ödeme kaydı oluştur (broker veya acente adına) */}
      <Dialog open={isCreatePaymentOpen} onOpenChange={(open) => { if (!open) resetPaymentForm(); setIsCreatePaymentOpen(open); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Ödeme Kaydı Oluştur
            </DialogTitle>
            <DialogDescription>
              Ödediğiniz tutarı kaydedin. Broker veya acente seçin; oluşan talebi onaylayıp Ödendi işaretleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Ödeme yapılan *</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={formDataSuperAdmin.paymentTarget === 'agency' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormDataSuperAdmin((f) => ({ ...f, paymentTarget: 'agency', branch_id: '' }))}
                >
                  <Building2 className="h-4 w-4 mr-1" />
                  Broker
                </Button>
                <Button
                  type="button"
                  variant={formDataSuperAdmin.paymentTarget === 'branch' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormDataSuperAdmin((f) => ({ ...f, paymentTarget: 'branch' }))}
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Acente
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Broker *</Label>
              <Select
                value={formDataSuperAdmin.agency_id}
                onValueChange={(v) => setFormDataSuperAdmin((f) => ({ ...f, agency_id: v, branch_id: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Broker seçin" />
                </SelectTrigger>
                <SelectContent>
                  {summary.map((row) => (
                    <SelectItem key={row.agencyId} value={row.agencyId}>
                      {row.agencyName} — Bakiye: {formatCurrency(Number(row.balance) || 0)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {formDataSuperAdmin.paymentTarget === 'branch' && (
              <div className="space-y-2">
                <Label>Acente *</Label>
                <Select
                  value={formDataSuperAdmin.branch_id}
                  onValueChange={(v) => setFormDataSuperAdmin((f) => ({ ...f, branch_id: v }))}
                  disabled={!formDataSuperAdmin.agency_id || branchesLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={branchesLoading ? 'Yükleniyor...' : 'Acente seçin'} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesForAgency.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name} — Bakiye: {formatCurrency(Number(b.balance) || 0)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="payment_amount">Ödenen tutar (TL) *</Label>
              <Input
                id="payment_amount"
                type="number"
                value={formDataSuperAdmin.amount}
                onChange={(e) => setFormDataSuperAdmin((f) => ({ ...f, amount: e.target.value }))}
                placeholder="Örn. 2000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_bank">IBAN (opsiyonel)</Label>
              <Input
                id="payment_bank"
                value={formDataSuperAdmin.bank_account}
                onChange={(e) => setFormDataSuperAdmin((f) => ({ ...f, bank_account: e.target.value }))}
                placeholder="TR..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_notes">Not</Label>
              <Textarea
                id="payment_notes"
                value={formDataSuperAdmin.notes}
                onChange={(e) => setFormDataSuperAdmin((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Opsiyonel not"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetPaymentForm(); setIsCreatePaymentOpen(false); }}>İptal</Button>
            <Button
              onClick={handleCreatePaymentRecord}
              disabled={
                !formDataSuperAdmin.agency_id ||
                !formDataSuperAdmin.amount ||
                (formDataSuperAdmin.paymentTarget === 'branch' && !formDataSuperAdmin.branch_id)
              }
            >
              Kayıt Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Yeni Talep Modal (Broker kullanıcıları kendi talepleri için) */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Yeni Komisyon Talebi</DialogTitle>
            <DialogDescription>Komisyon çekme talebi oluşturun</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Tutar (TL) *</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bank_account">IBAN *</Label>
              <Input
                id="bank_account"
                value={formData.bank_account}
                onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                placeholder="TR..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Not</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Ek bilgi..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>İptal</Button>
            <Button onClick={handleCreate} disabled={!formData.amount || !formData.bank_account}>
              Talep Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Komisyon Detayı
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-6 rounded-lg bg-primary/10 text-center">
              <div className="text-muted-foreground mb-1">Talep Edilen Tutar</div>
              <p className="text-3xl font-bold">{formatCurrency(selectedCommission?.amount || 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="text-muted-foreground mb-1">Durum</div>
                {selectedCommission && getStatusBadge(selectedCommission.status)}
              </div>
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Talep Tarihi
                </div>
                <p className="font-medium text-sm">{selectedCommission && formatDate(selectedCommission.created_at)}</p>
              </div>
            </div>
            {selectedCommission?.approved_at && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Onay Tarihi
                </div>
                <p className="font-medium">{formatDate(selectedCommission.approved_at)}</p>
              </div>
            )}
            {selectedCommission?.paid_at && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Ödeme Tarihi
                </div>
                <p className="font-medium">{formatDate(selectedCommission.paid_at)}</p>
              </div>
            )}
            {selectedCommission?.notes && (
              <div className="p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Not
                </div>
                <p className="font-medium">{selectedCommission.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Onay Modal */}
      <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              Komisyon Onayı
            </DialogTitle>
            <DialogDescription>Bu komisyon talebini onaylamak istediğinize emin misiniz?</DialogDescription>
          </DialogHeader>
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 mb-2">
              <Banknote className="h-4 w-4" />
              <span className="font-semibold">Onaylanacak Tutar</span>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{formatCurrency(selectedCommission?.amount || 0)}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveOpen(false)}>İptal</Button>
            <Button onClick={handleApprove} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700">
              {actionLoading ? 'İşleniyor...' : 'Onayla'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reddet Modal */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Komisyon Reddi
            </DialogTitle>
            <DialogDescription>Bu komisyon talebini reddetmek istediğinize emin misiniz?</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-semibold">Reddedilecek Tutar</span>
              </div>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(selectedCommission?.amount || 0)}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reject_notes">Red Sebebi *</Label>
              <Textarea
                id="reject_notes"
                value={rejectNotes}
                onChange={(e) => setRejectNotes(e.target.value)}
                placeholder="Red sebebini açıklayın..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>İptal</Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={!rejectNotes.trim() || actionLoading}
            >
              {actionLoading ? 'İşleniyor...' : 'Reddet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


