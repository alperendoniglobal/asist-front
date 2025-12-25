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
import { RichTextEditor } from '@/components/content/RichTextEditor';
import { contentService, type PageContent } from '@/services/contentService';
import { toast } from 'sonner';
import { Edit, Save, X, Loader2, FileText } from 'lucide-react';

const PAGE_SLUGS = [
  { slug: 'about', title: 'Hakkımızda' },
  { slug: 'distance-sales-contract', title: 'Mesafeli Satış Sözleşmesi' },
  { slug: 'privacy-policy', title: 'Gizlilik ve Güvenlik Politikası' },
  { slug: 'kvkk', title: 'KVKK Aydınlatma Metni' },
  { slug: 'delivery-return', title: 'Teslimat ve İade' },
];

/**
 * Page Content Management Component
 */
export default function PageContentManagement() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<PageContent | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<PageContent>>({
    slug: '',
    title: '',
    content: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const data = await contentService.getAllPages();
      setPages(data);
    } catch (error: any) {
      toast.error('Sayfalar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (page?: PageContent) => {
    if (page) {
      setEditingPage(page);
      setFormData(page);
    } else {
      const availableSlug = PAGE_SLUGS.find(
        (p) => !pages.find((existing) => existing.slug === p.slug)
      );
      setEditingPage(null);
      setFormData({
        slug: availableSlug?.slug || '',
        title: availableSlug?.title || '',
        content: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingPage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingPage) {
        await contentService.updatePage(editingPage.id, formData);
        toast.success('Sayfa güncellendi');
      } else {
        await contentService.createPage(formData);
        toast.success('Sayfa oluşturuldu');
      }
      handleCloseDialog();
      fetchPages();
    } catch (error: any) {
      toast.error('Sayfa kaydedilirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Sayfa İçerik Yönetimi</h2>
          <p className="text-muted-foreground text-sm">Hakkımızda, Mesafeli Satış, Gizlilik Politikası, KVKK Aydınlatma Metni ve Teslimat & İade sayfalarını yönetin</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sayfa</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAGE_SLUGS.map((pageSlug) => {
                  const page = pages.find((p) => p.slug === pageSlug.slug);
                  return (
                    <TableRow key={pageSlug.slug}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {pageSlug.title}
                        </div>
                      </TableCell>
                      <TableCell>{pageSlug.slug}</TableCell>
                      <TableCell>
                        {page ? (
                          <Badge variant={page.is_active ? 'default' : 'secondary'}>
                            {page.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Oluşturulmamış</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(page || undefined)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'Sayfa Düzenle' : 'Yeni Sayfa Ekle'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  disabled={!!editingPage}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <RichTextEditor
              value={formData.content || ''}
              onChange={(value) => setFormData({ ...formData, content: value })}
              label="İçerik *"
            />

            <div className="border-t pt-4 space-y-4">
              <h3 className="font-semibold">SEO Ayarları</h3>
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ''}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Input
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords || ''}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
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
              <Button type="submit" disabled={saving}>
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

