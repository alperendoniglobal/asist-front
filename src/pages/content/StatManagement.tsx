import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IconSelector } from '@/components/content/IconSelector';
import { contentService, type LandingPageStat } from '@/services/contentService';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

/**
 * Stat Management Component
 */
export default function StatManagement() {
  const [stats, setStats] = useState<LandingPageStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<LandingPageStat | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LandingPageStat>>({
    label: '',
    value: 0,
    suffix: '',
    icon_name: 'Users',
    order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllStats();
      setStats(data);
    } catch (error: any) {
      toast.error('İstatistikler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (stat?: LandingPageStat) => {
    if (stat) {
      setEditingStat(stat);
      setFormData(stat);
    } else {
      setEditingStat(null);
      setFormData({
        label: '',
        value: 0,
        suffix: '',
        icon_name: 'Users',
        order: stats.length,
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingStat(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingStat) {
        await contentService.updateStat(editingStat.id, formData);
        toast.success('İstatistik güncellendi');
      } else {
        await contentService.createStat(formData);
        toast.success('İstatistik oluşturuldu');
      }
      handleCloseDialog();
      fetchStats();
    } catch (error: any) {
      toast.error('İstatistik kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu istatistiği silmek istediğinize emin misiniz?')) return;
    try {
      await contentService.deleteStat(id);
      toast.success('İstatistik silindi');
      fetchStats();
    } catch (error: any) {
      toast.error('İstatistik silinirken hata oluştu');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">İstatistik Yönetimi</h2>
          <p className="text-muted-foreground text-sm">Landing page istatistiklerini yönetin</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni İstatistik
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : stats.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Henüz istatistik eklenmemiş
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>İkon</TableHead>
                  <TableHead>Etiket</TableHead>
                  <TableHead>Değer</TableHead>
                  <TableHead>Sıra</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.map((stat) => {
                  const Icon = (LucideIcons as any)[stat.icon_name];
                  return (
                    <TableRow key={stat.id}>
                      <TableCell>
                        {Icon ? <Icon className="h-5 w-5" /> : '-'}
                      </TableCell>
                      <TableCell>{stat.label}</TableCell>
                      <TableCell>
                        {stat.value}{stat.suffix || ''}
                      </TableCell>
                      <TableCell>{stat.order}</TableCell>
                      <TableCell>
                        <Badge variant={stat.is_active ? 'default' : 'secondary'}>
                          {stat.is_active ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(stat)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(stat.id)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStat ? 'İstatistik Düzenle' : 'Yeni İstatistik Ekle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <IconSelector
              value={formData.icon_name || 'Users'}
              onChange={(iconName) => setFormData({ ...formData, icon_name: iconName })}
              label="İkon"
            />
            <div className="space-y-2">
              <Label htmlFor="label">Etiket *</Label>
              <Input
                id="label"
                value={formData.label || ''}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Değer *</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value || 0}
                  onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="suffix">Ek (%, +, vb.)</Label>
                <Input
                  id="suffix"
                  value={formData.suffix || ''}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  placeholder="%, +, K, M"
                />
              </div>
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

