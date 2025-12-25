import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LandingPageSettings from './LandingPageSettings';
import BannerManagement from './BannerManagement';
import FeatureManagement from './FeatureManagement';
import StatManagement from './StatManagement';
import PageContentManagement from './PageContentManagement';
import { Settings, Image, Star, BarChart3, FileText } from 'lucide-react';

/**
 * Content Management Ana Sayfa
 * SUPER_ADMIN tarafından kullanılır
 * Tüm içerik yönetimi sayfalarını tab yapısında birleştirir
 */
export default function ContentManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">İçerik Yönetimi</h1>
        <p className="text-muted-foreground mt-1">
          Landing page ve sayfa içeriklerini yönetin
        </p>
      </div>

      <Tabs defaultValue="landing-settings" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="landing-settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Ayarlar</span>
          </TabsTrigger>
          <TabsTrigger value="banners" className="gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Banner'lar</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Star className="h-4 w-4" />
            <span className="hidden sm:inline">Özellikler</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">İstatistikler</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Sayfalar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="landing-settings" className="space-y-4">
          <LandingPageSettings />
        </TabsContent>

        <TabsContent value="banners" className="space-y-4">
          <BannerManagement />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureManagement />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <StatManagement />
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <PageContentManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}

