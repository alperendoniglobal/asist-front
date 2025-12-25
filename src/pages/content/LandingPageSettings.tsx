import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { contentService, type LandingPageContent } from '@/services/contentService';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';

/**
 * Landing Page Settings Component
 * Genel ayarları yönetir (telefon, email, SEO, vb.)
 */
export default function LandingPageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<LandingPageContent>>({
    support_phone: '',
    support_email: '',
    company_name: '',
    company_address: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await contentService.getLandingPageContent();
      setFormData(data);
    } catch (error: any) {
      toast.error('Ayarlar yüklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await contentService.updateLandingPageContent(formData);
      toast.success('Ayarlar başarıyla güncellendi');
    } catch (error: any) {
      toast.error('Ayarlar güncellenirken hata oluştu: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Genel Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="support_phone">Destek Telefon Numarası</Label>
              <Input
                id="support_phone"
                value={formData.support_phone || ''}
                onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                placeholder="+90 (850) 304 54 40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="support_email">Destek E-posta</Label>
              <Input
                id="support_email"
                type="email"
                value={formData.support_email || ''}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                placeholder="destek@cozum.net"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_name">Şirket Adı</Label>
            <Input
              id="company_name"
              value={formData.company_name || ''}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Çözüm Asistan"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address">Şirket Adresi</Label>
            <Textarea
              id="company_address"
              value={formData.company_address || ''}
              onChange={(e) => setFormData({ ...formData, company_address: e.target.value })}
              placeholder="Türkiye"
              rows={3}
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">SEO Ayarları</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ''}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Yol Yardım | 7/24 Çekici Hizmeti | Çözüm Asistan"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ''}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Yol yardım hizmetleri Türkiye genelinde 7/24..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Meta Keywords</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords || ''}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="yol yardım, çekici hizmeti, yol asistan"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
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
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

