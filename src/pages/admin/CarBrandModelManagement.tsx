/**
 * Araç Marka / Model Yönetimi – Super Admin
 * Marka ve model ekleme, düzenleme, silme (CARS.md API).
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  carBrandService,
  carModelService,
  type CarBrandListItem,
} from '@/services/carBrandModelService';
import type { CarBrand, CarModel } from '@/types';
import { Car, Plus, Edit, Trash2, RefreshCw, Loader2, Search } from 'lucide-react';

export default function CarBrandModelManagement() {
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<CarBrandListItem[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  /** Radix Select boş string value kabul etmez; "tümü" için özel değer kullanıyoruz */
  const ALL_BRANDS_VALUE = '__all__';
  const [modelBrandFilter, setModelBrandFilter] = useState<string>(ALL_BRANDS_VALUE);
  /** Modeller tablosunda isme göre arama (client-side filtre) */
  const [modelNameSearch, setModelNameSearch] = useState('');

  // Marka dialog
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [brandEditId, setBrandEditId] = useState<number | null>(null);
  const [brandName, setBrandName] = useState('');
  const [brandSubmitting, setBrandSubmitting] = useState(false);

  // Model dialog
  const [modelDialogOpen, setModelDialogOpen] = useState(false);
  const [modelEditId, setModelEditId] = useState<number | null>(null);
  const [modelForm, setModelForm] = useState({ brand_id: '', name: '', value: '' });
  const [modelSubmitting, setModelSubmitting] = useState(false);

  // Silme onay
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'brand' | 'model'; id: number } | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const fetchBrands = async () => {
    try {
      const data = await carBrandService.getAll();
      setBrands(data);
    } catch (err) {
      console.error(err);
      toast.error('Markalar yüklenirken hata oluştu');
    }
  };

  const fetchModels = async () => {
    try {
      const brandId =
        modelBrandFilter && modelBrandFilter !== ALL_BRANDS_VALUE
          ? parseInt(modelBrandFilter, 10)
          : undefined;
      const data = await carModelService.getAll(brandId);
      setModels(data);
    } catch (err) {
      console.error(err);
      toast.error('Modeller yüklenirken hata oluştu');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchBrands(), fetchModels()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!loading) fetchModels();
  }, [modelBrandFilter]);

  const openNewBrand = () => {
    setBrandEditId(null);
    setBrandName('');
    setBrandDialogOpen(true);
  };

  const openEditBrand = (b: CarBrand) => {
    setBrandEditId(b.id);
    setBrandName(b.name);
    setBrandDialogOpen(true);
  };

  const saveBrand = async () => {
    const name = brandName.trim();
    if (!name) {
      toast.error('Marka adı girin');
      return;
    }
    setBrandSubmitting(true);
    try {
      if (brandEditId != null) {
        await carBrandService.update(brandEditId, { name });
        toast.success('Marka güncellendi');
      } else {
        await carBrandService.create({ name });
        toast.success('Marka eklendi');
      }
      setBrandDialogOpen(false);
      await fetchBrands();
      await fetchModels();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'İşlem başarısız';
      toast.error(msg);
    } finally {
      setBrandSubmitting(false);
    }
  };

  const openNewModel = () => {
    setModelEditId(null);
    const defaultBrandId =
      modelBrandFilter && modelBrandFilter !== ALL_BRANDS_VALUE
        ? modelBrandFilter
        : (brands[0]?.id?.toString() ?? '');
    setModelForm({
      brand_id: defaultBrandId,
      name: '',
      value: '',
    });
    setModelDialogOpen(true);
  };

  const openEditModel = (m: CarModel) => {
    setModelEditId(m.id);
    setModelForm({
      brand_id: m.brand_id.toString(),
      name: m.name,
      value: m.value ?? '',
    });
    setModelDialogOpen(true);
  };

  const saveModel = async () => {
    const brand_id = parseInt(modelForm.brand_id, 10);
    const name = modelForm.name.trim();
    if (!name || Number.isNaN(brand_id)) {
      toast.error('Marka ve model adı girin');
      return;
    }
    setModelSubmitting(true);
    try {
      if (modelEditId != null) {
        await carModelService.update(modelEditId, {
          brand_id,
          name,
          value: modelForm.value.trim() || undefined,
        });
        toast.success('Model güncellendi');
      } else {
        await carModelService.create({
          brand_id,
          name,
          value: modelForm.value.trim() || undefined,
        });
        toast.success('Model eklendi');
      }
      setModelDialogOpen(false);
      await fetchModels();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'İşlem başarısız';
      toast.error(msg);
    } finally {
      setModelSubmitting(false);
    }
  };

  const confirmDelete = (type: 'brand' | 'model', id: number) => setDeleteTarget({ type, id });

  const doDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      if (deleteTarget.type === 'brand') {
        await carBrandService.delete(deleteTarget.id);
        toast.success('Marka silindi');
      } else {
        await carModelService.delete(deleteTarget.id);
        toast.success('Model silindi');
      }
      setDeleteTarget(null);
      await fetchBrands();
      await fetchModels();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Silme başarısız (araç kaydında kullanılıyor olabilir)';
      toast.error(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const getBrandName = (brandId: number) => brands.find((b) => b.id === brandId)?.name ?? String(brandId);

  /** İsme göre filtrelenmiş model listesi (arama inputu için) */
  const filteredModels = modelNameSearch.trim()
    ? models.filter((m) =>
        m.name.toLowerCase().includes(modelNameSearch.trim().toLowerCase())
      )
    : models;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Car className="h-7 w-7" />
          Araç Marka / Model Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Araç markaları ve modellerini ekleyin, düzenleyin veya silin. Sadece hiçbir araçta kullanılmayan kayıtlar silinebilir.
        </p>
      </div>

      <Tabs defaultValue="brands">
        <TabsList>
          <TabsTrigger value="brands">Markalar</TabsTrigger>
          <TabsTrigger value="models">Modeller</TabsTrigger>
        </TabsList>

        <TabsContent value="brands">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Markalar</CardTitle>
                <CardDescription>Araç markalarını listele, ekle, düzenle veya sil</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button size="sm" onClick={openNewBrand}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni marka
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Marka adı</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {brands.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                          Henüz marka yok
                        </TableCell>
                      </TableRow>
                    ) : (
                      brands.map((b) => (
                        <TableRow key={b.id}>
                          <TableCell className="font-mono">{b.id}</TableCell>
                          <TableCell className="font-medium">{b.name}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditBrand(b)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => confirmDelete('brand', b.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle>Modeller</CardTitle>
                <CardDescription>Araç modellerini listele, ekle, düzenle veya sil</CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Model adına göre ara..."
                    value={modelNameSearch}
                    onChange={(e) => setModelNameSearch(e.target.value)}
                    className="w-[200px] h-9 pl-8"
                  />
                </div>
                <Select value={modelBrandFilter} onValueChange={setModelBrandFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tüm markalar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_BRANDS_VALUE}>Tüm markalar</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
                <Button size="sm" onClick={openNewModel} disabled={brands.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni model
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Marka</TableHead>
                      <TableHead>Model adı</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredModels.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          {modelNameSearch.trim()
                            ? 'Arama kriterine uygun model bulunamadı'
                            : modelBrandFilter !== ALL_BRANDS_VALUE
                              ? 'Bu markaya ait model yok'
                              : 'Henüz model yok'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredModels.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-mono">{m.id}</TableCell>
                          <TableCell>{getBrandName(m.brand_id)}</TableCell>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="text-muted-foreground">{m.value ?? '–'}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => openEditModel(m)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => confirmDelete('model', m.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Marka ekle/düzenle dialog */}
      <Dialog open={brandDialogOpen} onOpenChange={setBrandDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{brandEditId != null ? 'Marka düzenle' : 'Yeni marka'}</DialogTitle>
            <DialogDescription>Marka adını girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Marka adı</Label>
              <Input
                id="brand-name"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="Örn. Toyota"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBrandDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveBrand} disabled={brandSubmitting}>
              {brandSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Model ekle/düzenle dialog */}
      <Dialog open={modelDialogOpen} onOpenChange={setModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modelEditId != null ? 'Model düzenle' : 'Yeni model'}</DialogTitle>
            <DialogDescription>Marka seçin ve model adını girin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Marka</Label>
              <Select
                value={modelForm.brand_id}
                onValueChange={(v) => setModelForm((f) => ({ ...f, brand_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Marka seçin" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-name">Model adı</Label>
              <Input
                id="model-name"
                value={modelForm.name}
                onChange={(e) => setModelForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Örn. Corolla"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-value">Value (opsiyonel)</Label>
              <Input
                id="model-value"
                value={modelForm.value}
                onChange={(e) => setModelForm((f) => ({ ...f, value: e.target.value }))}
                placeholder="Opsiyonel değer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModelDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={saveModel} disabled={modelSubmitting}>
              {modelSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Silme onay */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Silme onayı</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget?.type === 'brand'
                ? 'Bu markayı silmek istediğinize emin misiniz? Bu markayı kullanan araç varsa silme yapılamaz.'
                : 'Bu modeli silmek istediğinize emin misiniz? Bu modeli kullanan araç varsa silme yapılamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDelete}
              disabled={deleteSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
