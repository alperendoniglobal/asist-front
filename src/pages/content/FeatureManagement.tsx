import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IconSelector } from '@/components/content/IconSelector';
import { contentService, type LandingPageFeature } from '@/services/contentService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Feature Management Component
 */
export default function FeatureManagement() {
  const [features, setFeatures] = useState<LandingPageFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<LandingPageFeature | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LandingPageFeature>>({
    icon_name: 'Users',
    title: '',
    description: '',
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllFeatures();
      setFeatures(data);
    } catch (error: any) {
      toast.error('Özellikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (feature?: LandingPageFeature) => {
    if (feature) {
      setEditingFeature(feature);
      setFormData(feature);
    } else {
      setEditingFeature(null);
      setFormData({
        icon_name: 'Users',
        title: '',
        description: '',
        gradient: 'from-blue-500 via-blue-600 to-blue-700',
        order: features.length,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingFeature(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingFeature) {
        await contentService.updateFeature(editingFeature.id, formData);
        toast.success('Özellik güncellendi');
      } else {
        await contentService.createFeature(formData);
        toast.success('Özellik oluşturuldu');
      }
      handleCloseDialog();
      fetchFeatures();
    } catch (error: any) {
      toast.error('Özellik kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu özelliği silmek istediğinize emin misiniz?')) return;
    try {
      await contentService.deleteFeature(id);
      toast.success('Özellik silindi');
      fetchFeatures();
    } catch (error: any) {
      toast.error('Özellik silinirken hata oluştu');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Özellik Yönetimi</h2>
          <p className="text-muted-foreground text-sm">Landing page özelliklerini yönetin</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Özellik
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : features.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz özellik eklenmemiş
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İkon</TableHead>
                  <TableHead>Başlık</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => {
                  const Icon = (LucideIcons as any)[feature.icon_name];
                  return (
                    <TableRow key={feature.id}>
                      <TableCell>
                        {Icon ? <Icon className="h-5 w-5" /> : '-'}
                      </TableCell>
                      <TableCell>{feature.title}</TableCell>
                      <TableCell>{feature.order}</TableCell>
                      <TableCell>
                        <Badge variant={feature.is_active ? 'default' : 'secondary'}>
                          {feature.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(feature)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(feature.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFeature ? 'Özellik Düzenle' : 'Yeni Özellik Ekle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <IconSelector
              value={formData.icon_name || 'Users'}
              onChange={(iconName) => setFormData({ ...formData, icon_name: iconName })}
              label="İkon"
            />
            <div className="space-y-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="gradient">Gradient</Label>
                <Input
                  id="gradient"
                  value={formData.gradient || ''}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  placeholder="from-blue-500 via-blue-600 to-blue-700"
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
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Aktif</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

