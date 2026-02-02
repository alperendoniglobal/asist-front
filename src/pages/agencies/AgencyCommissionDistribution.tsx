import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { agencyService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import type { Agency } from '@/types';
import { Loader2, TrendingUp, Building2, Calculator, RefreshCw, Banknote, Wallet } from 'lucide-react';

// Para formatı fonksiyonu
const formatCurrency = (value: number | string | undefined | null) => {
  const numValue = Number(value) || 0;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(numValue);
};

/**
 * Broker Komisyon Dağılım Raporu
 * Broker (üst kurum) için her acentesi (şube) ile arasındaki komisyon dağılımını gösterir
 * - Her acente için: Toplam satış, Acente komisyonu, Broker komisyonu
 * - Özet: Toplam satış, Toplam acente komisyonu, Toplam broker komisyonu
 */
export default function AgencyCommissionDistribution() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [distribution, setDistribution] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [loadingAgencies, setLoadingAgencies] = useState(false);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAgencies();
    } else {
      // Broker admin için direkt kendi brokerını yükle
      if (user?.agency_id) {
        setSelectedAgencyId(user.agency_id);
        fetchDistribution(user.agency_id);
      }
    }
  }, [user]);

  useEffect(() => {
    if (selectedAgencyId && isSuperAdmin) {
      fetchDistribution(selectedAgencyId);
    }
  }, [selectedAgencyId, isSuperAdmin]);

  const fetchAgencies = async () => {
    try {
      setLoadingAgencies(true);
      const data = await agencyService.getAll();
      setAgencies(data);
      // İlk brokerı seç
      if (data.length > 0) {
        setSelectedAgencyId(data[0].id);
      }
    } catch (err: any) {
      console.error('Acenteler yüklenirken hata:', err);
      setError('Brokerlar yüklenirken bir hata oluştu');
    } finally {
      setLoadingAgencies(false);
    }
  };

  const fetchDistribution = async (agencyId: string) => {
    try {
      setLoading(true);
      setError(null);

      const data = await agencyService.getBranchCommissionDistribution(agencyId);
      setDistribution(data);
    } catch (err: any) {
      console.error('Komisyon dağılım raporu yüklenirken hata:', err);
      setError(err.response?.data?.message || 'Komisyon dağılım raporu yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (error && !distribution) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              {selectedAgencyId && (
                <Button onClick={() => fetchDistribution(selectedAgencyId)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tekrar Dene
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!distribution) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Calculator className="h-8 w-8" />
            Komisyon Dağılım Raporu
          </h1>
          <p className="text-muted-foreground mt-1">
            {distribution ? `${distribution.agency_name} - Acente bazlı komisyon dağılımı` : 'Acente bazlı komisyon dağılımı'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isSuperAdmin && (
            <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId} disabled={loadingAgencies}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Broker seçin" />
              </SelectTrigger>
              <SelectContent>
                {agencies.map((agency) => (
                  <SelectItem key={agency.id} value={agency.id}>
                    {agency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedAgencyId && (
            <Button onClick={() => fetchDistribution(selectedAgencyId)} variant="outline" disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          )}
        </div>
      </div>

      {!selectedAgencyId && isSuperAdmin && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Lütfen bir broker seçin</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!distribution && selectedAgencyId && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Komisyon dağılım raporu yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Broker Bilgileri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Broker Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Broker Adı</p>
              <p className="font-semibold">{distribution.agency_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Broker Komisyon Oranı</p>
              <p className="font-semibold text-primary">{distribution.agency_commission_rate}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Özet Kartları: Kazanılan + Ödenen / Ödenecek */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Satış</p>
                <p className="text-2xl font-bold">{distribution.summary.total_sales_count}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(distribution.summary.total_sales_amount)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Kazanılan Komisyon</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(distribution.summary.total_commission)}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-emerald-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ödenen (Komisyon)</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(distribution.summary.total_paid_all ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Broker + acentelere ödenen</p>
              </div>
              <Banknote className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/5 to-violet-500/10 border-violet-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ödenecek (Bakiye)</p>
                <p className="text-2xl font-bold text-violet-600">
                  {formatCurrency(distribution.summary.total_balance_all ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Henüz ödenmemiş alacak</p>
              </div>
              <Wallet className="h-8 w-8 text-violet-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Acente Komisyonu</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(distribution.summary.total_branch_commission)}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20 lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bakiye ile Ödenen Satışlar</p>
                <p className="text-2xl font-bold text-amber-600">
                  {(distribution.balance_paid_sales_count ?? 0)} adet · {formatCurrency(distribution.balance_paid_sales_amount ?? 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Bu satışlarda komisyon kesilmez</p>
              </div>
              <Wallet className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Broker Komisyonu</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(distribution.summary.total_agency_commission)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Broker düzeyi (acentesiz) ödenen / bakiye */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Broker (acentesiz) — Ödenen</p>
              <p className="text-lg font-bold text-emerald-600">
                {formatCurrency(distribution.summary.agency_total_paid ?? 0)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Broker (acentesiz) — Bakiye</p>
              <p className="text-lg font-bold text-violet-600">
                {formatCurrency(distribution.summary.agency_balance ?? 0)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Acenteye atanmadan broker adına yapılan ödemeler ve broker bakiyesi
          </p>
        </CardContent>
      </Card>

      {/* Acente Bazlı Detaylar */}
      <Card>
        <CardHeader>
          <CardTitle>Acente Bazlı Komisyon Dağılımı</CardTitle>
          <CardDescription>
            Her acente için satış, kazanılan komisyon, ödenen komisyon ve bakiye
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distribution.branches.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Henüz acente bulunmuyor</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Acente Adı</TableHead>
                    <TableHead>Acente Komisyon Oranı</TableHead>
                    <TableHead>Satış Sayısı</TableHead>
                    <TableHead>Toplam Satış Tutarı</TableHead>
                    <TableHead className="text-blue-600">Acente Komisyonu</TableHead>
                    <TableHead className="text-emerald-600">Broker Komisyonu</TableHead>
                    <TableHead className="text-purple-600">Toplam Komisyon</TableHead>
                    <TableHead className="text-emerald-600">Ödenen</TableHead>
                    <TableHead className="text-violet-600">Bakiye</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distribution.branches.map((branch: any) => (
                    <TableRow key={branch.branch_id}>
                      <TableCell className="font-medium">{branch.branch_name}</TableCell>
                      <TableCell>{branch.branch_commission_rate}%</TableCell>
                      <TableCell>{branch.total_sales_count}</TableCell>
                      <TableCell>{formatCurrency(branch.total_sales_amount)}</TableCell>
                      <TableCell className="text-blue-600 font-semibold">
                        {formatCurrency(branch.total_branch_commission)}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-semibold">
                        {formatCurrency(branch.total_agency_commission)}
                      </TableCell>
                      <TableCell className="text-purple-600 font-semibold">
                        {formatCurrency(branch.total_commission)}
                      </TableCell>
                      <TableCell className="text-emerald-600 font-semibold">
                        {formatCurrency(branch.total_paid ?? 0)}
                      </TableCell>
                      <TableCell className="text-violet-600 font-semibold">
                        {formatCurrency(branch.balance ?? 0)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Acenteye Atanmamış Satışlar */}
      {distribution.sales_without_branch.total_sales_count > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acenteye Atanmamış Satışlar</CardTitle>
            <CardDescription>
              Acenteye atanmamış satışlar (sadece broker komisyonu)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Satış Sayısı</p>
                <p className="text-xl font-bold">{distribution.sales_without_branch.total_sales_count}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Satış Tutarı</p>
                <p className="text-xl font-bold">
                  {formatCurrency(distribution.sales_without_branch.total_sales_amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Broker Komisyonu</p>
                <p className="text-xl font-bold text-emerald-600">
                  {formatCurrency(distribution.sales_without_branch.total_agency_commission)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

