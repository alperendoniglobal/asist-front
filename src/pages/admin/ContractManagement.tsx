import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { 
  contractService, 
  type ContractVersion, 
  type ContractReport
} from '@/services/contractService';
import {
  FileText, Plus, Edit, Check, AlertTriangle, Eye,
  Loader2, CheckCircle, Monitor, Globe,
  Calendar, User, Building, RefreshCw, Download
} from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Sözleşme Yönetimi Sayfası (Super Admin)
 * - Sözleşme versiyonlarını görüntüleme ve düzenleme
 * - Yeni sözleşme versiyonu oluşturma
 * - Aktif versiyonu değiştirme
 * - Onay raporlarını görüntüleme
 */
export default function ContractManagement() {
  // State
  const [loading, setLoading] = useState(true);
  const [versions, setVersions] = useState<ContractVersion[]>([]);
  const [report, setReport] = useState<ContractReport | null>(null);
  
  // Dialog states
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ContractVersion | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    version: '',
    title: '',
    content: '',
    summary: '',
    change_notes: '',
    is_active: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Verileri yükle
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [versionsData, reportData] = await Promise.all([
        contractService.getAllVersions(),
        contractService.getReport(),
      ]);
      setVersions(versionsData);
      setReport(reportData);
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yeni versiyon dialog'u aç
  const handleNewVersion = () => {
    setFormData({
      version: '',
      title: 'kaynak Hizmet sözleşmesi',
      content: '',
      summary: '',
      change_notes: '',
      is_active: false,
    });
    setEditMode(false);
    setSelectedVersion(null);
    setShowVersionDialog(true);
  };

  // Versiyon düzenleme dialog'u aç
  const handleEditVersion = (version: ContractVersion) => {
    setFormData({
      version: version.version,
      title: version.title,
      content: version.content,
      summary: version.summary || '',
      change_notes: version.change_notes || '',
      is_active: version.is_active,
    });
    setEditMode(true);
    setSelectedVersion(version);
    setShowVersionDialog(true);
  };

  // Versiyon önizleme
  const handlePreview = (version: ContractVersion) => {
    setSelectedVersion(version);
    setShowPreviewDialog(true);
  };

  // Versiyon aktifleştirme onayı
  const handleActivateConfirm = (version: ContractVersion) => {
    setSelectedVersion(version);
    setShowActivateDialog(true);
  };

  // Versiyonu aktifleştir
  const handleActivate = async () => {
    if (!selectedVersion) return;

    try {
      setSubmitting(true);
      await contractService.activateVersion(selectedVersion.id);
      toast.success('sözleşme versiyonu aktifleştirildi. Tüm kaynaklar yeniden onay verecek.');
      setShowActivateDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Versiyon kaydet
  const handleSaveVersion = async () => {
    // Validasyon
    if (!formData.version || !formData.title || !formData.content) {
      toast.error('Versiyon, başlık ve içerik zorunludur');
      return;
    }

    try {
      setSubmitting(true);

      if (editMode && selectedVersion) {
        await contractService.updateVersion(selectedVersion.id, formData);
        toast.success('Sözleşme versiyonu güncellendi');
      } else {
        await contractService.createVersion(formData);
        toast.success('Yeni sözleşme versiyonu oluşturuldu');
      }

      setShowVersionDialog(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  // Raporu CSV olarak indir
  const handleExportReport = () => {
    if (!report) return;

    const headers = ['kaynak', 'Kullanıcı', 'E-posta', 'Versiyon', 'IP Adresi', 'Onay Tarihi'];
    const rows = report.acceptances.map(acc => [
      acc.agency?.name || '-',
      acc.user ? `${acc.user.name} ${acc.user.surname}` : '-',
      acc.user?.email || '-',
      acc.contractVersion?.version || '-',
      acc.ip_address,
      format(new Date(acc.accepted_at), 'dd.MM.yyyy HH:mm', { locale: tr })
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sozlesme-rapor-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Yükleniyor
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Aktif versiyon
  const activeVersion = versions.find(v => v.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Sözleşme Yönetimi
          </h1>
          <p className="text-muted-foreground">
            kaynak hizmet sözleşmelerini yönetin ve onay raporlarını görüntüleyin
          </p>
        </div>
        <Button onClick={handleNewVersion}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Versiyon
        </Button>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktif Versiyon</p>
                <p className="text-2xl font-bold">{activeVersion?.version || '-'}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam kaynak</p>
                <p className="text-2xl font-bold">{report?.total || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <Building className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kabul Eden</p>
                <p className="text-2xl font-bold text-green-600">{report?.accepted || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <Check className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bekleyen</p>
                <p className="text-2xl font-bold text-orange-600">{report?.pending || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="versions">
        <TabsList>
          <TabsTrigger value="versions">Sözleşme Versiyonları</TabsTrigger>
          <TabsTrigger value="report">Onay Raporu</TabsTrigger>
        </TabsList>

        {/* Versiyonlar Tab */}
        <TabsContent value="versions">
          <Card>
            <CardHeader>
              <CardTitle>Sözleşme Versiyonları</CardTitle>
              <CardDescription>
                Tüm sözleşme versiyonlarını görüntüleyin ve yönetin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Versiyon</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Henüz sözleşme versiyonu bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    versions.map((version) => (
                      <TableRow key={version.id}>
                        <TableCell className="font-mono font-bold">
                          v{version.version}
                        </TableCell>
                        <TableCell>{version.title}</TableCell>
                        <TableCell>
                          {version.is_active ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                              <Check className="h-3 w-3 mr-1" />
                              Aktif
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pasif</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(version.created_at), 'dd MMM yyyy', { locale: tr })}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePreview(version)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditVersion(version)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {!version.is_active && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleActivateConfirm(version)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rapor Tab */}
        <TabsContent value="report">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Onay Raporu</CardTitle>
                <CardDescription>
                  kaynakların sözleşme onay kayıtları
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportReport}>
                  <Download className="h-4 w-4 mr-2" />
                  CSV İndir
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>kaynak</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Versiyon</TableHead>
                    <TableHead>IP Adresi</TableHead>
                    <TableHead>Cihaz</TableHead>
                    <TableHead>Onay Tarihi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!report || report.acceptances.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Henüz onay kaydı bulunmuyor
                      </TableCell>
                    </TableRow>
                  ) : (
                    report.acceptances.map((acc) => (
                      <TableRow key={acc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{acc.agency?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">
                                {acc.user ? `${acc.user.name} ${acc.user.surname}` : '-'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {acc.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            v{acc.contractVersion?.version || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm">{acc.ip_address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <span className="text-xs truncate max-w-[150px]" title={acc.user_agent}>
                              {acc.user_agent.split(' ')[0]}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(acc.accepted_at), 'dd MMM yyyy HH:mm', { locale: tr })}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Versiyon Oluştur/Düzenle Dialog */}
      <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editMode ? 'Sözleşme Versiyonunu Düzenle' : 'Yeni Sözleşme Versiyonu'}
            </DialogTitle>
            <DialogDescription>
              {editMode 
                ? 'Sözleşme versiyonunu güncelleyin' 
                : 'Yeni bir sözleşme versiyonu oluşturun'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="version">Versiyon Numarası *</Label>
                <Input
                  id="version"
                  placeholder="1.0"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  placeholder="kaynak Hizmet sözleşmesi"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Özet</Label>
              <Input
                id="summary"
                placeholder="Sözleşmenin kısa açıklaması"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="change_notes">Değişiklik Notları</Label>
              <Input
                id="change_notes"
                placeholder="Bu versiyonda yapılan değişiklikler"
                value={formData.change_notes}
                onChange={(e) => setFormData({ ...formData, change_notes: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Sözleşme İçeriği (HTML) *</Label>
              <Textarea
                id="content"
                placeholder="<h1>Sözleşme Başlığı</h1><p>İçerik...</p>"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={15}
                className="font-mono text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">
                Bu versiyonu aktif yap
                {formData.is_active && (
                  <span className="text-orange-600 text-sm ml-2">
                    (Tüm acenteler yeniden onay verecek)
                  </span>
                )}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVersionDialog(false)}>
              İptal
            </Button>
            <Button onClick={handleSaveVersion} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editMode ? 'Güncelle' : 'Oluştur'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Önizleme Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedVersion?.title} - v{selectedVersion?.version}
            </DialogTitle>
          </DialogHeader>

          <div 
            className="prose prose-sm max-w-none p-4 border rounded-lg bg-white"
            dangerouslySetInnerHTML={{ __html: selectedVersion?.content || '' }}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Aktifleştirme Onay Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Versiyonu Aktifleştir
            </AlertDialogTitle>
            <AlertDialogDescription>
              <strong>v{selectedVersion?.version}</strong> versiyonunu aktifleştirmek istediğinizden emin misiniz?
              <br /><br />
              <span className="text-orange-600 font-medium">
                Bu işlem, tüm kaynakların sözleşme kabulünü sıfırlayacak ve yeniden onay vermelerini gerektirecektir.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleActivate} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Aktifleştir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

