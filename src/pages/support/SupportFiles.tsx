import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { DataPagination } from '@/components/ui/pagination';
import { 
  Search, Eye, FileText, RefreshCcw, Plus, User
} from 'lucide-react';

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

// Öncelik badge rengi
const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'URGENT':
      return <Badge variant="destructive">Acil</Badge>;
    case 'HIGH':
      return <Badge className="bg-orange-500">Yüksek</Badge>;
    case 'MEDIUM':
      return <Badge className="bg-yellow-500">Orta</Badge>;
    case 'LOW':
      return <Badge variant="secondary">Düşük</Badge>;
    default:
      return <Badge variant="secondary">{priority}</Badge>;
  }
};

// Durum badge rengi
const getStatusBadge = (status: string) => {
  switch (status) {
    case 'OPEN':
      return <Badge className="bg-blue-500">Açık</Badge>;
    case 'IN_PROGRESS':
      return <Badge className="bg-yellow-500">İşlemde</Badge>;
    case 'RESOLVED':
      return <Badge className="bg-green-500">Çözüldü</Badge>;
    case 'CLOSED':
      return <Badge variant="secondary">Kapalı</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

// Sayfa başına gösterilecek kayıt sayısı
const ITEMS_PER_PAGE = 20;

/**
 * Destek Ekibi için Oluşturulmuş Dosyalar Sayfası
 * Tüm oluşturulmuş dosyaları görüntüleyebilir ve detaylarını inceleyebilir
 */
export default function SupportFiles() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  // Tüm dosyaları getir
  const fetchFiles = async () => {
    try {
      setLoading(true);
      // TODO: API çağrısı yapılacak
      // const filesData = await supportService.getAllFiles();
      // setFiles(filesData);
      
      // Şimdilik boş array
      setFiles([]);
    } catch (error) {
      console.error('Dosyalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrelenmiş dosyalar
  const filteredFiles = useMemo(() => {
    if (!searchQuery) return files;
    
    const query = searchQuery.toLowerCase();
    return files.filter(file => {
      const subject = file.subject?.toLowerCase() || '';
      const customerName = file.customer_name?.toLowerCase() || '';
      const customerTc = file.customer_tc?.toLowerCase() || '';
      const fileId = file.id?.toLowerCase() || '';

      return subject.includes(query) ||
             customerName.includes(query) ||
             customerTc.includes(query) ||
             fileId.includes(query);
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
          <Button onClick={() => navigate('/dashboard/support/files/create')} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Dosya
          </Button>
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
                placeholder="Konu, müşteri adı, TC veya dosya ID ile ara..."
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
              <Button
                onClick={() => navigate('/dashboard/support/files/create')}
                className="mt-4 gap-2"
              >
                <Plus className="h-4 w-4" />
                İlk Dosyayı Oluştur
              </Button>
            </div>
          ) : (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dosya ID</TableHead>
                      <TableHead>Konu</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>TC/VKN</TableHead>
                      <TableHead>Öncelik</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead className="text-right">İşlem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedFiles.map((file) => (
                      <TableRow key={file.id}>
                        <TableCell className="font-mono text-xs">
                          {file.id?.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="font-medium">
                          {file.subject}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{file.customer_name || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {file.customer_tc || '-'}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(file.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(file.status)}
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
              {/* Müşteri Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium">{selectedFile.customer_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">TC/VKN</p>
                    <p className="font-medium font-mono">{selectedFile.customer_tc || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefon</p>
                    <p className="font-medium">{selectedFile.customer_phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Satış ID</p>
                    <p className="font-medium font-mono text-xs">{selectedFile.sale_id || '-'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Dosya Bilgileri */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Dosya Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Konu</p>
                      <p className="font-medium">{selectedFile.subject}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Öncelik</p>
                      <div className="mt-1">{getPriorityBadge(selectedFile.priority)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Durum</p>
                      <div className="mt-1">{getStatusBadge(selectedFile.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Oluşturulma Tarihi</p>
                      <p className="font-medium">
                        {selectedFile.created_at ? formatDate(selectedFile.created_at) : '-'}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Açıklama</p>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedFile.description || '-'}</p>
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

