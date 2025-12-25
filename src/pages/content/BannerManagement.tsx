import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileUpload } from '@/components/content/FileUpload';
import { contentService, type LandingPageBanner } from '@/services/contentService';
import { uploadService } from '@/services/uploadService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Loader2, Eye } from 'lucide-react';

/**
 * Banner Management Component
 * Banner'ları yönetir (ekleme, düzenleme, silme, sıralama)
 */
export default function BannerManagement() {
  const [banners, setBanners] = useState<LandingPageBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<LandingPageBanner | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<LandingPageBanner>>({
    image_path: '',
    badge: '',
    left_content: {
      title: '',
      subtitle: '',
      description: '',
      feature: '',
      feature_icon: 'TrendingUp',
    },
    right_content: {
      title: '',
      subtitle: '',
      description: '',
    },
    banner_stats: [],
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllBanners();
      setBanners(data);
    } catch (error: any) {
      toast.error('Banner\'lar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    try {
      setUploading(true);
      const path = await uploadService.uploadBanner(file);
      setFormData({ ...formData, image_path: path });
      toast.success('Görsel yüklendi');
    } catch (error: any) {
      toast.error('Görsel yüklenirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDialog = (banner?: LandingPageBanner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData(banner);
    } else {
      setEditingBanner(null);
      setFormData({
        image_path: '',
        badge: '',
        left_content: { title: '', subtitle: '', description: '', feature: '', feature_icon: 'TrendingUp' },
        right_content: { title: '', subtitle: '', description: '' },
        banner_stats: [],
        order: banners.length,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingBanner(null);
    setFormData({
      image_path: '',
      badge: '',
      left_content: { title: '', subtitle: '', description: '', feature: '', feature_icon: 'TrendingUp' },
      right_content: { title: '', subtitle: '', description: '' },
      banner_stats: [],
      order: 0,
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingBanner) {
        await contentService.updateBanner(editingBanner.id, formData);
        toast.success('Banner güncellendi');
      } else {
        await contentService.createBanner(formData);
        toast.success('Banner oluşturuldu');
      }
      handleCloseDialog();
      fetchBanners();
    } catch (error: any) {
      toast.error('Banner kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banner\'ı silmek istediğinize emin misiniz?')) return;
    try {
      await contentService.deleteBanner(id);
      toast.success('Banner silindi');
      fetchBanners();
    } catch (error: any) {
      toast.error('Banner silinirken hata oluştu');
    }
  };

  const handleToggleActive = async (banner: LandingPageBanner) => {
    try {
      await contentService.updateBanner(banner.id, { is_active: !banner.is_active });
      toast.success(`Banner ${!banner.is_active ? 'aktif' : 'pasif'} edildi`);
      fetchBanners();
    } catch (error: any) {
      toast.error('Banner güncellenirken hata oluştu');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Banner Yönetimi</h2>
          <p className="text-muted-foreground text-sm">Landing page banner'larını yönetin</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Banner
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz banner eklenmemiş
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Görsel</TableHead>
                  <TableHead>Badge</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <img
                        src={banner.image_path}
                        alt={banner.left_content?.title || 'Banner'}
                        className="h-12 w-20 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>{banner.badge || '-'}</TableCell>
                    <TableCell>{banner.left_content?.title || '-'}</TableCell>
                    <TableCell>{banner.order}</TableCell>
                    <TableCell>
                      <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                        {banner.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleActive(banner)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(banner.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Banner Ekleme/Düzenleme Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Ekle'}
            </DialogTitle>
            <DialogDescription>
              Banner bilgilerini doldurun
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Banner Görseli *</Label>
              <FileUpload
                onFileSelect={handleFileSelect}
                currentImage={formData.image_path}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={formData.badge || ''}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="Yol Yardım Hizmeti"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="order">Sıra</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order || 0}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sol İçerik</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="left_title">Başlık</Label>
                  <Input
                    id="left_title"
                    value={formData.left_content?.title || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      left_content: { ...formData.left_content!, title: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="left_subtitle">Alt Başlık</Label>
                  <Input
                    id="left_subtitle"
                    value={formData.left_content?.subtitle || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      left_content: { ...formData.left_content!, subtitle: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="left_description">Açıklama</Label>
                <Textarea
                  id="left_description"
                  value={formData.left_content?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    left_content: { ...formData.left_content!, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sağ İçerik</Label>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="right_title">Başlık</Label>
                  <Input
                    id="right_title"
                    value={formData.right_content?.title || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      right_content: { ...formData.right_content!, title: e.target.value }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="right_subtitle">Alt Başlık</Label>
                  <Input
                    id="right_subtitle"
                    value={formData.right_content?.subtitle || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      right_content: { ...formData.right_content!, subtitle: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="right_description">Açıklama</Label>
                <Textarea
                  id="right_description"
                  value={formData.right_content?.description || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    right_content: { ...formData.right_content!, description: e.target.value }
                  })}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
              <Button type="submit" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

