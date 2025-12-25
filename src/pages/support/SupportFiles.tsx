import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { DataPagination } from '@/components/ui/pagination';
import { 
  Search, Eye, FileText, RefreshCcw, Plus, User, Building2, MapPin
} from 'lucide-react';
import { supportFileService } from '@/services/apiService';
import { toast } from 'sonner';

// Format fonksiyonları
const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};


// Sayfa başına gösterilecek kayıt sayısı
const ITEMS_PER_PAGE = 20;

/**
 * Destek Ekibi için Oluşturulmuş Dosyalar Sayfası
 * Tüm oluşturulmuş dosyaları görüntüleyebilir ve detaylarını inceleyebilir
 */
export default function SupportFiles() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  
  // Sadece SUPPORT rolü yeni dosya oluşturabilir
  const canCreateFile = user?.role === UserRole.SUPPORT;

  useEffect(() => {
    fetchFiles();
  }, []);

  // Tüm dosyaları getir
  const fetchFiles = async () => {
    try {
      setLoading(true);
      const filesData = await supportFileService.getAll();
      setFiles(filesData);
    } catch (error: any) {
      console.error('Dosyalar yüklenirken hata:', error);
      toast.error('Dosyalar yüklenirken bir hata oluştu');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş dosyalar
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => {
      const damageFileNumber = file.damage_file_number?.toLowerCase() || '';
      const insuredName = file.insured_name?.toLowerCase() || '';
      const vehiclePlate = file.vehicle_plate?.toLowerCase() || '';
      const fileId = file.id?.toLowerCase() || '';
      const customerName = file.sale?.customer?.name?.toLowerCase() || '';
      const customerSurname = file.sale?.customer?.surname?.toLowerCase() || '';
      const agencyName = file.sale?.agency?.name?.toLowerCase() || '';
      const branchName = file.sale?.branch?.name?.toLowerCase() || '';

      return damageFileNumber.includes(query) ||
             insuredName.includes(query) ||
             vehiclePlate.includes(query) ||
             fileId.includes(query) ||
             customerName.includes(query) ||
             customerSurname.includes(query) ||
             agencyName.includes(query) ||
             branchName.includes(query);
    });
  }, [files, searchQuery]);

  // Pagination hesaplamaları
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredFiles.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredFiles, currentPage]);

  // Arama değiştiğinde sayfa numarasını sıfırla
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Dosya detayını görüntüle
  const handleViewFile = (file: any) => {
    setSelectedFile(file);
    setIsViewOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Oluşturulmuş Dosyalar
          </h1>
          <p className="text-muted-foreground">Tüm oluşturulmuş dosyaları görüntüleyebilirsiniz</p>
        </div>
        <div className="flex gap-2">
          {canCreateFile && (
          <Button onClick={() => navigate('/dashboard/support/files/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Dosya
          </Button>
          )}
          <Button onClick={fetchFiles} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Arama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dosya Ara</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Dosya no, sigortalı adı, plaka, acente veya şube ile ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setSearchQuery('')} variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Sıfırla
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dosya Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>Dosya Listesi</CardTitle>
          <CardDescription>
            Toplam {filteredFiles.length} dosya bulundu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz dosya bulunmuyor</p>
              {canCreateFile && (
              <Button
                onClick={() => navigate('/dashboard/support/files/create')}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                İlk Dosyayı Oluştur
              </Button>
              )}
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dosya No</TableHead>
                      <TableHead>Sigortalı</TableHead>
                      <TableHead>Plaka</TableHead>
                      <TableHead>Yapılacak İşlem</TableHead>
                      <TableHead>Acente</TableHead>
                      <TableHead>Şube</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-mono text-xs font-medium">
                          {file.damage_file_number || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{file.insured_name || file.sale?.customer?.name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {file.vehicle_plate || file.sale?.vehicle?.plate || '-'}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{file.service_type || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {file.sale?.agency ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.sale.agency.name}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {file.sale?.branch ? (
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{file.sale.branch.name}</span>
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {file.created_at ? formatDate(file.created_at) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewFile(file)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination */}
              <div className="mt-4">
                <DataPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dosya Detay Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dosya Detayları</DialogTitle>
            <DialogDescription>
              Dosya bilgilerini detaylı olarak görüntüleyebilirsiniz
            </DialogDescription>
          </DialogHeader>
          {selectedFile && (
            <div className="space-y-6">
              {/* Satış ve Acente Bilgileri */}
              {selectedFile.sale && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      Satış ve Acente Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    {selectedFile.sale.agency && (
                      <div>
                        <p className="text-sm text-muted-foreground">Acente</p>
                        <p className="font-medium">{selectedFile.sale.agency.name}</p>
                      </div>
                    )}
                    {selectedFile.sale.branch && (
                      <div>
                        <p className="text-sm text-muted-foreground">Şube</p>
                        <p className="font-medium">{selectedFile.sale.branch.name}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground">Satış Numarası</p>
                      <p className="font-medium font-mono text-xs">{selectedFile.sale.policy_number || selectedFile.sale.id?.substring(0, 8) || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Satış Tarihi</p>
                      <p className="font-medium">{selectedFile.sale.created_at ? formatDate(selectedFile.sale.created_at) : '-'}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sigortalı Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Sigortalı Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{selectedFile.insured_name || selectedFile.sale?.customer?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedFile.insured_phone || selectedFile.sale?.customer?.phone || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Araç Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Araç Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Plaka</p>
                    <p className="font-medium font-mono">{selectedFile.vehicle_plate || selectedFile.sale?.vehicle?.plate || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Marka</p>
                    <p className="font-medium">{selectedFile.vehicle_brand || selectedFile.sale?.vehicle?.brand?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{selectedFile.vehicle_model || selectedFile.sale?.vehicle?.model?.name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Model Yılı</p>
                    <p className="font-medium">{selectedFile.model_year || selectedFile.sale?.vehicle?.model_year || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dosya Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Hasar Dosya Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Dosya Numarası</p>
                      <p className="font-medium font-mono">{selectedFile.damage_file_number || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yapılacak İşlem</p>
                      <p className="font-medium">{selectedFile.service_type || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">İşlem Tutarı</p>
                      <p className="font-medium">{selectedFile.service_amount ? `${selectedFile.service_amount} TL` : '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Yol Yardım Teyminatı</p>
                      <p className="font-medium">{selectedFile.roadside_assistance_coverage || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Şehir</p>
                      <p className="font-medium">{selectedFile.city || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Oluşturan</p>
                      <p className="font-medium">{selectedFile.creator ? `${selectedFile.creator.name} ${selectedFile.creator.surname}` : selectedFile.staff_name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
                      <p className="font-medium">
                        {selectedFile.created_at ? formatDate(selectedFile.created_at) : '-'}
                      </p>
                  </div>
                  <div>
                      <p className="text-sm text-muted-foreground">Talep Tarihi</p>
                      <p className="font-medium">
                        {selectedFile.request_date_time ? formatDate(selectedFile.request_date_time) : '-'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* İşlem Butonları */}
              <div className="flex justify-end gap-2">
                <Button onClick={() => setIsViewOpen(false)}>Kapat</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

