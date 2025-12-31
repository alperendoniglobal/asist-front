import { useEffect, useState } from 'react'; // v2
import { Card, CardContent } from '@/components/ui/card';
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
  Tabs, TabsList, TabsTrigger
} from '@/components/ui/tabs';
import { dealerApplicationService, type DealerApplicationLocal as DealerApplication, DealerApplicationStatusLocal as DealerApplicationStatus } from '@/services/publicService';
import { toast } from 'sonner';
import { 
  Search, Eye, Store, Phone, Mail, MapPin, Calendar, 
  CheckCircle, XCircle, Clock, Building, User, CreditCard,
  Loader2, RefreshCw
} from 'lucide-react';

// Durum etiketleri ve renkleri
const statusLabels: Record<DealerApplicationStatus, string> = {
  [DealerApplicationStatus.PENDING]: 'Bekliyor',
  [DealerApplicationStatus.APPROVED]: 'Onaylandı',
  [DealerApplicationStatus.REJECTED]: 'Reddedildi'
};

const statusColors: Record<DealerApplicationStatus, 'default' | 'secondary' | 'destructive'> = {
  [DealerApplicationStatus.PENDING]: 'secondary',
  [DealerApplicationStatus.APPROVED]: 'default',
  [DealerApplicationStatus.REJECTED]: 'destructive'
};

/**
 * Bayilik Başvuruları Yönetim Sayfası
 * Super Admin için başvuruları listeleme, onaylama ve reddetme
 */
export default function DealerApplications() {
  const [applications, setApplications] = useState<DealerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DealerApplicationStatus | 'all'>('all');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [selectedApplication, setSelectedApplication] = useState<DealerApplication | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Başvuruları yükle
  useEffect(() => {
    fetchApplications();
    fetchPendingCount();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await dealerApplicationService.getAll();
      setApplications(data);
    } catch (error) {
      console.error('Başvurular yüklenirken hata:', error);
      toast.error('Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingCount = async () => {
    try {
      const count = await dealerApplicationService.getPendingCount();
      setPendingCount(count);
    } catch (error) {
      console.error('Bekleyen sayısı alınamadı:', error);
    }
  };

  // Filtreleme
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.phone.includes(searchQuery) ||
      app.tc_vkn.includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Onaylama
  const handleApprove = async () => {
    if (!selectedApplication) return;

    setActionLoading(true);
    try {
      await dealerApplicationService.approve(selectedApplication.id, actionNotes);
      toast.success('Başvuru onaylandı, acente oluşturuldu');
      setIsActionOpen(false);
      setActionNotes('');
      fetchApplications();
      fetchPendingCount();
    } catch (error: any) {
      console.error('Onaylama hatası:', error);
      toast.error(error.response?.data?.message || 'Başvuru onaylanamadı');
    } finally {
      setActionLoading(false);
    }
  };

  // Reddetme
  const handleReject = async () => {
    if (!selectedApplication) return;

    if (!actionNotes.trim()) {
      toast.error('Red sebebi belirtilmelidir');
      return;
    }

    setActionLoading(true);
    try {
      await dealerApplicationService.reject(selectedApplication.id, actionNotes);
      toast.success('Başvuru reddedildi');
      setIsActionOpen(false);
      setActionNotes('');
      fetchApplications();
      fetchPendingCount();
    } catch (error: any) {
      console.error('Reddetme hatası:', error);
      toast.error(error.response?.data?.message || 'Başvuru reddedilemedi');
    } finally {
      setActionLoading(false);
    }
  };

  // İşlem dialogunu aç
  const openActionDialog = (app: DealerApplication, type: 'approve' | 'reject') => {
    setSelectedApplication(app);
    setActionType(type);
    setActionNotes('');
    setIsActionOpen(true);
  };

  // Detay görüntüleme
  const openViewDialog = (app: DealerApplication) => {
    setSelectedApplication(app);
    setIsViewOpen(true);
  };

  // Tarih formatlama
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Store className="h-8 w-8" />
            Bayilik Başvuruları
          </h1>
          <p className="text-muted-foreground mt-1">Bayilik başvurularını yönetin</p>
        </div>
        <Button variant="outline" onClick={fetchApplications}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 dark:border-emerald-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Onaylanan</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {applications.filter(a => a.status === DealerApplicationStatus.APPROVED).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reddedilen</p>
                <p className="text-2xl font-bold text-red-600">
                  {applications.filter(a => a.status === DealerApplicationStatus.REJECTED).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ad, soyad, e-posta, telefon veya TC/VKN ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Tümü</TabsTrigger>
                <TabsTrigger value={DealerApplicationStatus.PENDING}>
                  Bekleyen
                  {pendingCount > 0 && (
                    <Badge className="ml-2 bg-amber-500">{pendingCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value={DealerApplicationStatus.APPROVED}>Onaylanan</TabsTrigger>
                <TabsTrigger value={DealerApplicationStatus.REJECTED}>Reddedilen</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Başvuru Listesi */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Başvuru bulunamadı</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Başvuran</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>TC/VKN</TableHead>
                  <TableHead>Şehir</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium">{app.name} {app.surname}</p>
                          {app.company_name && (
                            <p className="text-sm text-muted-foreground">{app.company_name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {app.email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {app.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">{app.tc_vkn}</code>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-3 w-3" />
                        {app.city}
                        {app.district && `, ${app.district}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[app.status]}>
                        {statusLabels[app.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(app.created_at)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(app)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {app.status === DealerApplicationStatus.PENDING && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => openActionDialog(app, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Onayla
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openActionDialog(app, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reddet
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detay Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Başvuru Detayı
            </DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Durum */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <span className="text-muted-foreground">Durum</span>
                <Badge variant={statusColors[selectedApplication.status]} className="text-sm">
                  {statusLabels[selectedApplication.status]}
                </Badge>
              </div>

              {/* Kişisel Bilgiler */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" /> Kişisel Bilgiler
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Ad Soyad</span>
                    <p className="font-medium">{selectedApplication.name} {selectedApplication.surname}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">TC/VKN</span>
                    <p className="font-medium font-mono">{selectedApplication.tc_vkn}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">E-posta</span>
                    <p className="font-medium">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefon</span>
                    <p className="font-medium">{selectedApplication.phone}</p>
                  </div>
                </div>
              </div>

              {/* Şirket Bilgileri */}
              {selectedApplication.company_name && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Building className="h-4 w-4" /> Şirket Bilgileri
                  </h4>
                  <p className="text-sm">{selectedApplication.company_name}</p>
                </div>
              )}

              {/* Adres Bilgileri */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Adres Bilgileri
                </h4>
                <div className="text-sm">
                  <p>{selectedApplication.city}{selectedApplication.district && `, ${selectedApplication.district}`}</p>
                  {selectedApplication.address && (
                    <p className="text-muted-foreground">{selectedApplication.address}</p>
                  )}
                </div>
              </div>

              {/* Referans */}
              {selectedApplication.referral_code && (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CreditCard className="h-4 w-4" /> Referans Kodu
                  </h4>
                  <p className="text-sm font-mono">{selectedApplication.referral_code}</p>
                </div>
              )}

              {/* Tarihler */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Tarih Bilgileri
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Başvuru Tarihi</span>
                    <p className="font-medium">{formatDate(selectedApplication.created_at)}</p>
                  </div>
                  {selectedApplication.reviewed_at && (
                    <div>
                      <span className="text-muted-foreground">İncelenme Tarihi</span>
                      <p className="font-medium">{formatDate(selectedApplication.reviewed_at)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Notlar */}
              {selectedApplication.notes && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Admin Notu</h4>
                  <p className="text-sm p-3 rounded-lg bg-muted">{selectedApplication.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOpen(false)}>
              Kapat
            </Button>
            {selectedApplication?.status === DealerApplicationStatus.PENDING && (
              <>
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    setIsViewOpen(false);
                    openActionDialog(selectedApplication, 'approve');
                  }}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Onayla
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewOpen(false);
                    openActionDialog(selectedApplication, 'reject');
                  }}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Onay/Red Dialog */}
      <Dialog open={isActionOpen} onOpenChange={setIsActionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Başvuruyu Onayla
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Başvuruyu Reddet
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? 'Bu başvuru onaylandığında otomatik olarak acente ve kullanıcı hesabı oluşturulacaktır.'
                : 'Bu başvuruyu reddetmek istediğinize emin misiniz? Red sebebi belirtilmelidir.'}
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="font-medium">{selectedApplication.name} {selectedApplication.surname}</p>
                <p className="text-sm text-muted-foreground">{selectedApplication.email}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">
                  {actionType === 'approve' ? 'Not (Opsiyonel)' : 'Red Sebebi *'}
                </Label>
                <Textarea
                  id="notes"
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={actionType === 'approve' 
                    ? 'Onay notu ekleyin...' 
                    : 'Red sebebini belirtin...'}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionOpen(false)} disabled={actionLoading}>
              İptal
            </Button>
            <Button
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={actionLoading}
              className={actionType === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  İşleniyor...
                </>
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Onayla
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Reddet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

