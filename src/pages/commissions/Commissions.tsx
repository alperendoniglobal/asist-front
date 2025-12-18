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
import { commissionService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import type { Commission } from '@/types';
import { CommissionStatus, UserRole } from '@/types';
import { 
  Plus, Eye, TrendingUp, Clock, CheckCircle, XCircle, Banknote, 
  Calendar, FileText, AlertTriangle, RefreshCcw, Search
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
  const [rejectNotes, setRejectNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    fetchCommissions();
  }, []);

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
      fetchCommissions();
      alert('Komisyon talebi oluşturuldu!');
    } catch (error) {
      console.error('Komisyon talebi oluşturulurken hata:', error);
      alert('Komisyon talebi oluşturulamadı!');
    }
  };

  const handleApprove = async () => {
    if (!selectedCommission) return;
    setActionLoading(true);
    try {
      await commissionService.approve(selectedCommission.id);
      setIsApproveOpen(false);
      fetchCommissions();
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
      fetchCommissions();
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

  const resetForm = () => {
    setFormData({
      amount: '',
      bank_account: '',
      notes: ''
    });
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

  // İstatistikler
  const stats = {
    total: commissions.length,
    pending: commissions.filter(c => c.status === CommissionStatus.PENDING).length,
    approved: commissions.filter(c => c.status === CommissionStatus.APPROVED).length,
    paid: commissions.filter(c => c.status === CommissionStatus.PAID).length,
    totalAmount: commissions.filter(c => c.status === CommissionStatus.PAID).reduce((sum, c) => sum + c.amount, 0)
  };

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
        {!isSuperAdmin && (
          <Button onClick={() => { resetForm(); setIsCreateOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Talep
          </Button>
        )}
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-4">
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
                <p className="text-sm text-muted-foreground">Ödenen Toplam</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(stats.totalAmount)}</p>
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
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => { setSelectedCommission(commission); setIsRejectOpen(true); }}
                                className="text-destructive hover:text-destructive"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
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

      {/* Yeni Talep Modal */}
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


