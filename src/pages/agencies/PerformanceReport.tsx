import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { statsService } from '@/services/apiService';
import { UserRole } from '@/types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { 
  Loader2, 
  TrendingUp, 
  Building2, 
  GitBranch, 
  RefreshCw,
  ShoppingCart,
  DollarSign,
  Percent,
  ChevronDown,
  ChevronRight,
  BarChart3,
  Award,
  Mail,
  Phone,
  MapPin,
  Activity,
  Package,
  UserCheck,
  Trophy,
  Calendar,
  Filter
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Para formatı fonksiyonu
const formatCurrency = (value: number | string | undefined | null) => {
  const numValue = Number(value) || 0;
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2
  }).format(numValue);
};

// Kısa para formatı
const formatShortCurrency = (value: number) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M ₺`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K ₺`;
  }
  return `${value.toFixed(0)} ₺`;
};

// Performans raporu interface'leri
interface UserPerformance {
  id: string;
  name: string;
  surname?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: string;
  performance: {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
}

interface BranchPerformance {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  status: string;
  commission_rate: number;
  balance: number;
  performance: {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
  users: UserPerformance[];
}

interface AgencyPerformance {
  id: string;
  name: string;
  tax_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  status: string;
  commission_rate: number;
  balance: number;
  performance: {
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
  branches: BranchPerformance[];
  agencyUsers: UserPerformance[];
}

interface PerformanceReport {
  agencies: AgencyPerformance[];
  summary: {
    totalAgencies: number;
    totalBranches: number;
    totalUsers: number;
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
}

interface AgencySalesData {
  dailySales: Array<{
    date: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
  monthlySales: Array<{
    month: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
  branchSales: Array<{
    branchId: string;
    branchName: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
  userSales: Array<{
    userId: string;
    userName: string;
    userEmail?: string;
    userRole?: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
  packageSales: Array<{
    packageId: string;
    packageName: string;
    vehicleType: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
  userPackageSales: Array<{
    userId: string;
    userName: string;
    packageId: string;
    packageName: string;
    count: number;
    revenue: number;
    commission: number;
  }>;
}

/**
 * SUPER_AGENCY_ADMIN Performans Raporu
 */
export default function PerformanceReport() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [salesData, setSalesData] = useState<AgencySalesData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('');
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(new Set());
  const [loadingSales, setLoadingSales] = useState(false);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    fetchReport();
  }, []);

  useEffect(() => {
    if (report && report.agencies.length > 0 && !selectedAgencyId) {
      setSelectedAgencyId(report.agencies[0].id);
    }
  }, [report, selectedAgencyId]);

  useEffect(() => {
    if (selectedAgencyId) {
      fetchSalesData(selectedAgencyId, startDate, endDate);
    }
  }, [selectedAgencyId, startDate, endDate]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await statsService.getSuperAgencyAdminPerformanceReport();
      setReport(data);
    } catch (err: any) {
      console.error('Performans raporu yüklenirken hata:', err);
      setError(err.response?.data?.message || 'Performans raporu yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async (agencyId: string, start?: string, end?: string) => {
    try {
      setLoadingSales(true);
      const data = await statsService.getAgencySalesData(agencyId, start, end);
      setSalesData(data);
    } catch (err: any) {
      console.error('Satış verileri yüklenirken hata:', err);
    } finally {
      setLoadingSales(false);
    }
  };

  const handleDateFilter = () => {
    if (selectedAgencyId) {
      fetchSalesData(selectedAgencyId, startDate || undefined, endDate || undefined);
    }
  };

  const clearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    if (selectedAgencyId) {
      fetchSalesData(selectedAgencyId);
    }
  };

  const toggleBranch = (branchId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'destructive';
      case UserRole.SUPER_AGENCY_ADMIN:
        return 'default';
      case UserRole.AGENCY_ADMIN:
        return 'default';
      case UserRole.BRANCH_ADMIN:
        return 'secondary';
      case UserRole.BRANCH_USER:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleName = (role: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return 'Super Admin';
      case UserRole.SUPER_AGENCY_ADMIN:
        return 'Süper Broker Yöneticisi';
      case UserRole.AGENCY_ADMIN:
        return 'Broker Yöneticisi';
      case UserRole.BRANCH_ADMIN:
        return 'Acente Yöneticisi';
      case UserRole.BRANCH_USER:
        return 'Kullanıcı';
      default:
        return role;
    }
  };

  const getInitials = (name: string, surname?: string) => {
    const first = name.charAt(0).toUpperCase();
    const second = surname ? surname.charAt(0).toUpperCase() : '';
    return first + second;
  };

  // Seçili agency'yi bul
  const selectedAgency = report?.agencies.find(a => a.id === selectedAgencyId);

  // Tarih filtresine göre özet değerleri hesapla
  const calculateFilteredTotals = () => {
    if (!salesData) {
      return {
        totalSales: selectedAgency?.performance.totalSales || 0,
        totalRevenue: selectedAgency?.performance.totalRevenue || 0,
        totalCommission: selectedAgency?.performance.totalCommission || 0,
      };
    }

    // Günlük satışlardan toplamları hesapla (en doğru yöntem)
    const totalSales = salesData.dailySales.reduce((sum, item) => sum + item.count, 0);
    const totalRevenue = salesData.dailySales.reduce((sum, item) => sum + item.revenue, 0);
    const totalCommission = salesData.dailySales.reduce((sum, item) => sum + item.commission, 0);

    return {
      totalSales,
      totalRevenue,
      totalCommission,
    };
  };

  const filteredTotals = calculateFilteredTotals();

  // Grafik verilerini hazırla
  const dailyChartData = salesData?.dailySales.map(item => {
    const date = new Date(item.date);
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      gelir: item.revenue,
      komisyon: item.commission,
    };
  }) || [];

  const monthlyChartData = salesData?.monthlySales.map(item => {
    const [year, month] = item.month.split('-');
    const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
    return {
      month: `${monthNames[parseInt(month) - 1]} ${year.slice(2)}`,
      gelir: item.revenue,
      komisyon: item.commission,
    };
  }).reverse() || [];

  const packageChartData = salesData?.packageSales.map(item => ({
    name: item.packageName.length > 15 ? item.packageName.slice(0, 15) + '...' : item.packageName,
    satış: item.count,
    gelir: item.revenue,
    komisyon: item.commission,
  })) || [];

  const packageDistributionData = salesData?.packageSales.map(item => ({
    name: item.packageName.length > 12 ? item.packageName.slice(0, 12) + '...' : item.packageName,
    value: item.count,
    fill: `hsl(var(--chart-${(salesData.packageSales.indexOf(item) % 5) + 1}))`
  })) || [];

  const topUsersData = salesData?.userSales.slice(0, 10).map(item => ({
    name: item.userName.length > 20 ? item.userName.slice(0, 20) + '...' : item.userName,
    satış: item.count,
    gelir: item.revenue,
    komisyon: item.commission,
  })) || [];

  // Chart config - Shadcn/ui stili
  const chartConfig = {
    gelir: {
      label: 'Gelir',
      color: '#3b82f6',
    },
    komisyon: {
      label: 'Komisyon',
      color: '#10b981',
    },
    satış: {
      label: 'Satış',
      color: '#8b5cf6',
    },
  };

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={fetchReport} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!report || report.agencies.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Performans Raporu</h1>
            <p className="text-muted-foreground mt-1">Yönettiğiniz brokerların performansları</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz yönettiğiniz bir broker bulunmuyor.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Performans Raporu</h1>
          <p className="text-muted-foreground mt-1">
            Broker, acente ve kullanıcı bazlı detaylı performans analizi
          </p>
        </div>
        <Button onClick={fetchReport} variant="outline" size="sm" disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Broker Seçici */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            Broker Seçin
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedAgencyId} onValueChange={setSelectedAgencyId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Bir broker seçin" />
            </SelectTrigger>
            <SelectContent>
              {report.agencies.map((agency) => (
                <SelectItem key={agency.id} value={agency.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{agency.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {agency.performance.totalSales} satış
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedAgency && (
        <>
          {/* Tarih Filtresi */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                Tarih Filtresi
              </CardTitle>
              <CardDescription>
                Belirli bir tarih aralığındaki performans verilerini görüntüleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="startDate">Başlangıç Tarihi</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    placeholder="Başlangıç tarihi seçin"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="endDate">Bitiş Tarihi</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    placeholder="Bitiş tarihi seçin"
                    min={startDate}
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDateFilter} 
                    variant="default"
                    disabled={loadingSales}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Filtrele
                  </Button>
                  {(startDate || endDate) && (
                    <Button 
                      onClick={clearDateFilter} 
                      variant="outline"
                      disabled={loadingSales}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Temizle
                    </Button>
                  )}
                </div>
              </div>
              {!startDate && !endDate && (
                <p className="text-xs text-muted-foreground mt-2">
                  Tarih filtresi uygulanmadı. Son 30 günün verileri gösteriliyor.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Özet Kartları - Tarih filtresine göre güncellenir */}
          {(startDate || endDate) && (
            <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
              <Filter className="h-3 w-3 inline mr-1" />
              Özet kartları seçili tarih aralığına göre filtrelenmiştir.
              {startDate && endDate && (
                <span className="ml-1">
                  ({startDate} - {endDate})
                </span>
              )}
            </div>
          )}
          <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-blue-100/80 uppercase tracking-wider">Toplam Satış</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-black tracking-tight">{filteredTotals.totalSales}</p>
                      <span className="text-lg text-blue-200">adet</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-emerald-100/80 uppercase tracking-wider">Toplam Ciro</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black tracking-tight">{formatShortCurrency(filteredTotals.totalRevenue)}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <DollarSign className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-violet-600 to-purple-700"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-violet-100/80 uppercase tracking-wider">Toplam Komisyon</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black tracking-tight">{formatShortCurrency(filteredTotals.totalCommission)}</p>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <Percent className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-red-700"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
              <CardContent className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-orange-100/80 uppercase tracking-wider">Acente Sayısı</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-4xl font-black tracking-tight">{selectedAgency.branches.length}</p>
                      <span className="text-lg text-orange-200">acente</span>
                    </div>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                    <GitBranch className="h-7 w-7" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Broker Bilgileri */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">{selectedAgency.name}</CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-3 text-xs">
                    {selectedAgency.tax_number && (
                      <span>Vergi No: {selectedAgency.tax_number}</span>
                    )}
                    {selectedAgency.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {selectedAgency.email}
                      </span>
                    )}
                    {selectedAgency.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {selectedAgency.phone}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <Badge variant={selectedAgency.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {selectedAgency.status === 'ACTIVE' ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Tabs ile detaylı raporlar */}
          {loadingSales ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="packages">Paketler</TabsTrigger>
                <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
                <TabsTrigger value="branches">Acenteler</TabsTrigger>
              </TabsList>

              {/* Genel Bakış Tab */}
              <TabsContent value="overview" className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Son 30 Gün Satış Trendi */}
                  {dailyChartData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          Son 30 Gün Satış Trendi
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                          <AreaChart data={dailyChartData}>
                            <defs>
                              <linearGradient id="fillGelir" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.gelir.color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={chartConfig.gelir.color} stopOpacity={0}/>
                              </linearGradient>
                              <linearGradient id="fillKomisyon" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={chartConfig.komisyon.color} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={chartConfig.komisyon.color} stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                            />
                            <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={formatShortCurrency}
                            />
                            <ChartTooltip 
                              content={(props: any) => {
                                if (!props.active || !props.payload?.length) return null;
                                return <ChartTooltipContent {...props} />;
                              }}
                            />
                            <Area 
                              dataKey="gelir" 
                              type="monotone" 
                              fill="url(#fillGelir)" 
                              stroke={chartConfig.gelir.color}
                              stackId="a"
                            />
                            <Area 
                              dataKey="komisyon" 
                              type="monotone" 
                              fill="url(#fillKomisyon)" 
                              stroke={chartConfig.komisyon.color}
                              stackId="b"
                            />
                          </AreaChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Aylık Satış Karşılaştırması */}
                  {monthlyChartData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <BarChart3 className="h-4 w-4 text-primary" />
                          Aylık Satış Karşılaştırması
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[300px]">
                          <BarChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="month" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              tickFormatter={formatShortCurrency}
                            />
                            <ChartTooltip 
                              content={(props: any) => {
                                if (!props.active || !props.payload?.length) return null;
                                return <ChartTooltipContent {...props} />;
                              }}
                            />
                            <Bar dataKey="gelir" fill={chartConfig.gelir.color} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="komisyon" fill={chartConfig.komisyon.color} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Paketler Tab */}
              <TabsContent value="packages" className="space-y-5">
                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Paket Bazlı Satış Grafiği */}
                  {packageChartData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" />
                          Paket Bazlı Satış Performansı
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer config={chartConfig} className="h-[350px]">
                          <BarChart data={packageChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                              angle={-45}
                              textAnchor="end"
                              height={80}
                            />
                            <YAxis 
                              tickLine={false}
                              axisLine={false}
                              tickMargin={8}
                            />
                            <ChartTooltip 
                              content={(props: any) => {
                                if (!props.active || !props.payload?.length) return null;
                                return <ChartTooltipContent {...props} />;
                              }}
                            />
                            <Legend />
                            <Bar dataKey="satış" fill={chartConfig.satış.color} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="gelir" fill={chartConfig.gelir.color} radius={[4, 4, 0, 0]} />
                            <Bar dataKey="komisyon" fill={chartConfig.komisyon.color} radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Paket Dağılımı */}
                  {packageDistributionData.length > 0 && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Activity className="h-4 w-4 text-primary" />
                          Paket Satış Dağılımı
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ChartContainer
                          config={{
                            value: {
                              label: 'Satış',
                            },
                          }}
                          className="h-[350px]"
                        >
                          <PieChart>
                            <ChartTooltip
                              content={(props: any) => {
                                if (!props.active || !props.payload?.length) return null;
                                return <ChartTooltipContent {...props} />;
                              }}
                            />
                            <Pie
                              data={packageDistributionData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                            >
                              {packageDistributionData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ChartContainer>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Paket Detay Tablosu */}
                {salesData?.packageSales && salesData.packageSales.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Paket Detayları
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="h-10 text-xs font-semibold">Paket Adı</TableHead>
                              <TableHead className="h-10 text-xs font-semibold">Araç Türü</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Satış Adedi</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Toplam Gelir</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Toplam Komisyon</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesData.packageSales.map((pkg) => (
                              <TableRow key={pkg.packageId} className="h-12">
                                <TableCell className="font-medium">{pkg.packageName}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {pkg.vehicleType}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{pkg.count}</TableCell>
                                <TableCell className="text-right">{formatCurrency(pkg.revenue)}</TableCell>
                                <TableCell className="text-right text-primary font-medium">
                                  {formatCurrency(pkg.commission)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Kullanıcılar Tab */}
              <TabsContent value="users" className="space-y-5">
                {/* En İyi Performanslı Kullanıcılar Grafiği */}
                {topUsersData.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        En İyi Performanslı Kullanıcılar (Top 10)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[400px]">
                        <BarChart data={topUsersData} layout="vertical" margin={{ left: 120 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                          <XAxis 
                            type="number" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={formatShortCurrency}
                          />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={115}
                          />
                          <ChartTooltip 
                            content={(props: any) => {
                              if (!props.active || !props.payload?.length) return null;
                              return <ChartTooltipContent {...props} />;
                            }}
                          />
                          <Legend />
                          <Bar dataKey="gelir" fill={chartConfig.gelir.color} radius={[0, 4, 4, 0]} />
                          <Bar dataKey="komisyon" fill={chartConfig.komisyon.color} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}

                {/* Kullanıcı Detay Tablosu */}
                {salesData?.userSales && salesData.userSales.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-primary" />
                        Tüm Kullanıcı Performansları
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="h-10 text-xs font-semibold">Kullanıcı</TableHead>
                              <TableHead className="h-10 text-xs font-semibold">Rol</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Satış Adedi</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Toplam Gelir</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Toplam Komisyon</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesData.userSales.map((user) => (
                              <TableRow key={user.userId} className="h-12">
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {user.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="font-medium text-sm">{user.userName}</div>
                                      {user.userEmail && (
                                        <div className="text-xs text-muted-foreground">{user.userEmail}</div>
                                      )}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {user.userRole && (
                                    <Badge variant={getRoleBadgeVariant(user.userRole as UserRole)} className="text-xs">
                                      {getRoleName(user.userRole as UserRole)}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-semibold">{user.count}</TableCell>
                                <TableCell className="text-right">{formatCurrency(user.revenue)}</TableCell>
                                <TableCell className="text-right text-primary font-medium">
                                  {formatCurrency(user.commission)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Kullanıcı-Paket Kombinasyonu */}
                {salesData?.userPackageSales && salesData.userPackageSales.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        Kullanıcı-Paket Detayları (Kim Hangi Paketi Satmış)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="h-10 text-xs font-semibold">Kullanıcı</TableHead>
                              <TableHead className="h-10 text-xs font-semibold">Paket</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Satış Adedi</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Gelir</TableHead>
                              <TableHead className="h-10 text-xs font-semibold text-right">Komisyon</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {salesData.userPackageSales.map((item, index) => (
                              <TableRow key={`${item.userId}-${item.packageId}-${index}`} className="h-12">
                                <TableCell className="font-medium">{item.userName}</TableCell>
                                <TableCell>
                                  <Badge variant="secondary" className="text-xs">
                                    {item.packageName}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-semibold">{item.count}</TableCell>
                                <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                                <TableCell className="text-right text-primary font-medium">
                                  {formatCurrency(item.commission)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Acenteler Tab */}
              <TabsContent value="branches" className="space-y-5">
                {/* Acenteler Listesi */}
                {selectedAgency.branches.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-primary" />
                        Acenteler ({selectedAgency.branches.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {selectedAgency.branches.map((branch) => (
                        <Card 
                          key={branch.id} 
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <CardHeader 
                            className="pb-2 cursor-pointer"
                            onClick={() => toggleBranch(branch.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1">
                                {expandedBranches.has(branch.id) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{branch.name}</span>
                                    {branch.status === 'ACTIVE' && (
                                      <Badge variant="secondary" className="text-xs">Aktif</Badge>
                                    )}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3">
                                    {branch.address && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {branch.address.slice(0, 40)}
                                      </span>
                                    )}
                                    <span>Komisyon: %{branch.commission_rate}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-semibold">{branch.performance.totalSales} Satış</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatCurrency(branch.performance.totalRevenue)}
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedBranches.has(branch.id) && (
                            <CardContent className="pt-0 space-y-3">
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded bg-muted/50 text-center">
                                  <div className="text-xs text-muted-foreground">Satış</div>
                                  <div className="text-sm font-bold">{branch.performance.totalSales}</div>
                                </div>
                                <div className="p-2 rounded bg-muted/50 text-center">
                                  <div className="text-xs text-muted-foreground">Gelir</div>
                                  <div className="text-xs font-bold">{formatCurrency(branch.performance.totalRevenue)}</div>
                                </div>
                                <div className="p-2 rounded bg-muted/50 text-center">
                                  <div className="text-xs text-muted-foreground">Komisyon</div>
                                  <div className="text-xs font-bold">{formatCurrency(branch.performance.totalCommission)}</div>
                                </div>
                              </div>
                              {branch.users.length > 0 && (
                                <div>
                                  <h4 className="text-xs font-semibold mb-2">Kullanıcılar ({branch.users.length})</h4>
                                  <div className="rounded border overflow-hidden">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/50">
                                          <TableHead className="h-8 text-xs">Kullanıcı</TableHead>
                                          <TableHead className="h-8 text-xs">Rol</TableHead>
                                          <TableHead className="h-8 text-xs text-right">Satış</TableHead>
                                          <TableHead className="h-8 text-xs text-right">Gelir</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {branch.users.map((user) => (
                                          <TableRow key={user.id} className="h-10">
                                            <TableCell className="py-2">
                                              <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {getInitials(user.name, user.surname)}
                                                  </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                  <div className="text-xs font-medium">
                                                    {user.name} {user.surname}
                                                  </div>
                                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="py-2">
                                              <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs">
                                                {getRoleName(user.role)}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="py-2 text-right text-xs font-semibold">
                                              {user.performance.totalSales}
                                            </TableCell>
                                            <TableCell className="py-2 text-right text-xs">
                                              {formatCurrency(user.performance.totalRevenue)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          )}
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                )}


              </TabsContent>
            </Tabs>
          )}
        </>
      )}
    </div>
  );
}
