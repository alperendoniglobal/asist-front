import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { statsService, saleService, customerService, agencyService, branchService, supportFileService } from '@/services/apiService';
import { useAuth } from '@/contexts/AuthContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { 
  TrendingUp, Users, ShoppingCart, Wallet, 
  Calendar, Package, ArrowUpRight,
  Building2, GitBranch, Activity, Plus, Search, Car, 
  UserPlus, Clock, CheckCircle, FileText, Zap, 
  Sparkles, Eye, RotateCcw, XCircle, AlertTriangle, Phone, MapPin
} from 'lucide-react';
import type { DashboardStats, Sale, Customer, Agency, Branch } from '@/types';
import { UserRole } from '@/types';

// Grafik renkleri - modern palette
const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#8b5cf6', 
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4'
};

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// Boş veri durumu için (son 7 gün)
const getEmptyDailyData = () => {
  const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      day: `${dayNames[date.getDay()]} ${date.getDate()}`,
      count: 0,
      revenue: 0
    });
  }
  return data;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  // Super Admin için hasar dosyaları
  const [supportFiles, setSupportFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const promises: Promise<any>[] = [
        statsService.getDashboard(),
        saleService.getAll(),
        customerService.getAll()
      ];

      // Super Admin için ek veriler
      if (user?.role === UserRole.SUPER_ADMIN) {
        promises.push(agencyService.getAll());
        promises.push(branchService.getAll());
        promises.push(supportFileService.getAll()); // Hasar dosyaları
      }

      const results = await Promise.all(promises);
      
      setStats(results[0]);
      setRecentSales(results[1].slice(0, 5));
      setRecentCustomers(results[2].slice(0, 5));
      
      if (user?.role === UserRole.SUPER_ADMIN) {
        setAgencies(results[3] || []);
        setBranches(results[4] || []);
        setSupportFiles(results[5]?.slice(0, 10) || []); // Son 10 hasar dosyası
      }
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Para formatı
  const formatCurrency = (value: number | string | undefined | null) => {
    const numValue = Number(value) || 0;
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      maximumFractionDigits: 0
    }).format(numValue);
  };

  // Kısa para formatı (K, M)
  const formatShortCurrency = (value: number | string | undefined | null) => {
    const numValue = Number(value) || 0;
    if (numValue >= 1000000) return `₺${(numValue / 1000000).toFixed(1)}M`;
    if (numValue >= 1000) return `₺${(numValue / 1000).toFixed(1)}K`;
    return `₺${numValue}`;
  };

  // Tarih formatı
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  // Kullanıcı admin mi kontrol et
  const isAdmin = user?.role !== UserRole.BRANCH_USER;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground animate-pulse">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // ========== BRANCH_USER için Hızlı İşlem Paneli ==========
  if (!isAdmin) {
    const quickActions = [
      { title: 'Yeni Satış', description: 'Paket sat', icon: Plus, link: '/dashboard/sales/new', gradient: 'from-blue-500 to-blue-600' },
      { title: 'Müşteri Ara', description: 'Sorgula', icon: Search, link: '/dashboard/customers', gradient: 'from-cyan-500 to-cyan-600' },
      { title: 'Yeni Müşteri', description: 'Kayıt oluştur', icon: UserPlus, link: '/dashboard/customers', gradient: 'from-emerald-500 to-emerald-600' },
      { title: 'Araç Ekle', description: 'Araç kaydı', icon: Car, link: '/dashboard/vehicles', gradient: 'from-amber-500 to-amber-600' },
      { title: 'Satışlarım', description: 'Görüntüle', icon: FileText, link: '/dashboard/sales', gradient: 'from-violet-500 to-violet-600' },
      { title: 'Paketler', description: 'İncele', icon: Package, link: '/dashboard/packages', gradient: 'from-pink-500 to-pink-600' }
    ];

    return (
      <div className="space-y-6">
        {/* Hoş Geldin Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Hoş Geldiniz!</h1>
            <p className="text-muted-foreground">{user?.name} {user?.surname}, bugün ne yapmak istersiniz?</p>
          </div>
          <Badge variant="outline" className="gap-1 w-fit">
            <Clock className="h-3 w-3" />
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Badge>
        </div>

        {/* Hızlı İşlemler */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Hızlı İşlemler
          </h2>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="h-full cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl group border-2 hover:border-primary/30 overflow-hidden">
                  <CardContent className="p-5 flex flex-col items-center text-center relative">
                    <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${action.gradient} mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm">{action.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Özet + Son İşlemler */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Özet Kartları */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Toplam Satışlarım</p>
                    <p className="text-4xl font-bold mt-1">{stats?.totalSales || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                    <FileText className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Toplam Ciro</p>
                    <p className="text-3xl font-bold mt-1">{formatShortCurrency(stats?.totalRevenue)}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                    <Wallet className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-violet-500 to-violet-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm">Müşterilerim</p>
                    <p className="text-4xl font-bold mt-1">{stats?.totalCustomers || 0}</p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur">
                    <Users className="h-7 w-7" />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Son Satışlar & Müşteriler */}
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ShoppingCart className="h-4 w-4 text-primary" />
                    Son Satışlarım
                  </CardTitle>
                  <Link to="/dashboard/sales">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Tümü <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentSales.length > 0 ? recentSales.slice(0, 4).map((sale) => (
                  <div key={sale.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{sale.customer?.name} {sale.customer?.surname}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(sale.created_at)}</p>
                    </div>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(sale.price)}</p>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <ShoppingCart className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Henüz satış yok</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Son Müşterilerim
                  </CardTitle>
                  <Link to="/dashboard/customers">
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Tümü <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {recentCustomers.length > 0 ? recentCustomers.slice(0, 4).map((customer) => (
                  <div key={customer.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                        {customer.name?.[0]}{customer.surname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{customer.name} {customer.surname}</p>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-6">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">Henüz müşteri yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ========== ADMIN DASHBOARD (Super/Agency/Branch Admin) ==========
  
  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter(a => a.status === 'ACTIVE').length;
  const totalBranches = branches.length;

  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Canlı
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Hoş geldiniz, {user?.name}! İşte bugünkü özet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Card className="px-4 py-2 flex items-center gap-2 bg-muted/50">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </Card>
          <Badge variant="secondary" className="py-1.5">
            {user?.role === UserRole.SUPER_ADMIN ? 'Süper Admin' :
             user?.role === UserRole.AGENCY_ADMIN ? 'Broker Yöneticisi' : // Görüntüleme: Broker Yöneticisi (değer: AGENCY_ADMIN)
             user?.role === UserRole.BRANCH_ADMIN ? 'Acente Yöneticisi' : // Görüntüleme: Acente Yöneticisi (değer: BRANCH_ADMIN)
             'Kullanıcı'}
          </Badge>
        </div>
      </div>

      {/* ===== ANA STATS KARTLARI - Modern Gradient Tasarım ===== */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        {/* Toplam Satış */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
          {/* Gradient Arka Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700"></div>
          {/* Dekoratif Daireler */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-blue-100/80 uppercase tracking-wider">Toplam Satış</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black tracking-tight">{stats?.totalSales || 0}</p>
                  <span className="text-lg text-blue-200">adet</span>
              </div>
                <div className="flex items-center gap-1.5 text-xs text-blue-100/70">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-300 animate-pulse"></div>
                  Paket satışı
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toplam Gelir */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
          {/* Gradient Arka Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700"></div>
          {/* Dekoratif Daireler */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-emerald-100/80 uppercase tracking-wider">Toplam Ciro</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black tracking-tight">{formatShortCurrency(stats?.totalRevenue)}</p>
              </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-100/70">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Toplam gelir
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Wallet className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Toplam Komisyon */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
          {/* Gradient Arka Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700"></div>
          {/* Dekoratif Daireler */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-violet-100/80 uppercase tracking-wider">Komisyon</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black tracking-tight">{formatShortCurrency(stats?.totalCommission)}</p>
              </div>
                <div className="flex items-center gap-1.5 text-xs text-violet-100/70">
                  <Sparkles className="h-3.5 w-3.5" />
                  {user?.role === UserRole.BRANCH_ADMIN || user?.role === UserRole.BRANCH_USER 
                    ? 'Şube komisyonu' 
                    : user?.role === UserRole.AGENCY_ADMIN 
                    ? 'Acente komisyonu' 
                    : 'Kazanılan komisyon'}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Müşteriler */}
        <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 group">
          {/* Gradient Arka Plan */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-orange-500 to-red-600"></div>
          {/* Dekoratif Daireler */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full"></div>
          <CardContent className="relative p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-sm font-medium text-amber-100/80 uppercase tracking-wider">Müşteriler</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-4xl font-black tracking-tight">{stats?.totalCustomers || 0}</p>
                  <span className="text-lg text-amber-200">kişi</span>
              </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-100/70">
                  <Users className="h-3.5 w-3.5" />
                  Kayıtlı müşteri
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== SUPER ADMIN EK KARTLARI ===== */}
      {user?.role === UserRole.SUPER_ADMIN && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
          {/* Brokerlar */}
          <Card className="bg-gradient-to-br from-cyan-500/5 to-cyan-500/10 border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Toplam Broker</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold">{totalAgencies}</p>
                    <Badge className="bg-emerald-500/20 text-emerald-600 border-0">
                      {activeAgencies} aktif
                    </Badge>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-cyan-500/10">
                  <Building2 className="h-8 w-8 text-cyan-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Aktif Oran</span>
                  <span>{totalAgencies > 0 ? Math.round((activeAgencies / totalAgencies) * 100) : 0}%</span>
                </div>
                <Progress value={totalAgencies > 0 ? (activeAgencies / totalAgencies) * 100 : 0} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Acenteler */}
          <Card className="bg-gradient-to-br from-pink-500/5 to-pink-500/10 border-pink-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Toplam Acente</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold">{totalBranches}</p>
                    <span className="text-xs text-muted-foreground">
                      ~{totalAgencies > 0 ? Math.round(totalBranches / totalAgencies) : 0}/broker
                    </span>
                  </div>
      </div>
                <div className="p-4 rounded-2xl bg-pink-500/10">
                  <GitBranch className="h-8 w-8 text-pink-600" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/dashboard/branches" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Acenteleri Gör
                  </Button>
                </Link>
                <Link to="/dashboard/agencies">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Building2 className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Hızlı İşlemler */}
          <Card className="bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">Hızlı İşlemler</p>
                <Sparkles className="h-4 w-4 text-amber-500" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/dashboard/sales/new">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-9">
                    <Plus className="h-3 w-3" /> Satış
                  </Button>
                </Link>
                <Link to="/dashboard/customers">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-9">
                    <UserPlus className="h-3 w-3" /> Müşteri
                  </Button>
                </Link>
                <Link to="/dashboard/packages">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-9">
                    <Package className="h-3 w-3" /> Paketler
                  </Button>
                </Link>
                <Link to="/dashboard/agencies">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1 h-9">
                    <Building2 className="h-3 w-3" /> Brokerlar
                  </Button>
                </Link>
              </div>
              </CardContent>
            </Card>
        </div>
      )}

      {/* ===== GRAFİKLER ===== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Ana Grafik - Super Admin için Acente Kıyaslaması, diğerleri için Günlük Satışlar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
            <CardTitle className="flex items-center gap-2">
                  {user?.role === UserRole.SUPER_ADMIN ? (
                    <>
                      <Building2 className="h-5 w-5 text-primary" />
                      Broker Performansı
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5 text-primary" />
                      Son 7 Günün Satışları
                    </>
                  )}
            </CardTitle>
                <CardDescription>
                  {user?.role === UserRole.SUPER_ADMIN 
                    ? 'Brokerların satış ve gelir karşılaştırması' 
                    : 'Günlük satış ve gelir analizi'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                  <span className="text-muted-foreground">Gelir</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500"></div>
                  <span className="text-muted-foreground">
                    {user?.role === UserRole.SUPER_ADMIN ? 'Komisyon' : 'Satış Adedi'}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {user?.role === UserRole.SUPER_ADMIN ? (
                // Super Admin için Acente Kıyaslama Bar Chart
                <ResponsiveContainer width="100%" height="100%">
                  {stats?.agencyPerformance?.length ? (
                    <BarChart data={stats.agencyPerformance} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => formatShortCurrency(value)} />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11 }} 
                        width={100}
                        tickFormatter={(value) => value.length > 12 ? value.slice(0, 12) + '...' : value}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          name === 'totalRevenue' ? 'Toplam Gelir' : 'Komisyon'
                        ]}
                        labelFormatter={(label) => label}
                      />
                      <Bar dataKey="totalRevenue" fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} name="totalRevenue" />
                      <Bar dataKey="totalCommission" fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} name="totalCommission" />
                    </BarChart>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <Building2 className="h-12 w-12 mb-3 opacity-20" />
                      <p className="text-sm">Henüz acente satış verisi yok</p>
              </div>
            )}
                </ResponsiveContainer>
              ) : (
                // Diğer roller için Günlük Satış Area Chart - Dual Y Axis
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.dailySales?.length ? stats.dailySales : getEmptyDailyData()}>
                <defs>
                      <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                      <linearGradient id="gradientCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART_COLORS.success} stopOpacity={0.3}/>
                        <stop offset="100%" stopColor={CHART_COLORS.success} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                    {/* Sol Y ekseni - Gelir için */}
                    <YAxis 
                      yAxisId="left"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: CHART_COLORS.primary }} 
                      tickFormatter={(value) => formatShortCurrency(value)}
                    />
                    {/* Sağ Y ekseni - Satış Adedi için */}
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 11, fill: CHART_COLORS.success }}
                      allowDecimals={false}
                    />
                <Tooltip 
                  contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                        name === 'revenue' ? formatCurrency(value) : `${value} adet`,
                        name === 'revenue' ? 'Gelir' : 'Satış Adedi'
                  ]}
                      labelFormatter={(label) => label}
                    />
                    {/* Gelir - Sol eksene bağlı */}
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      yAxisId="left"
                      stroke={CHART_COLORS.primary} 
                      strokeWidth={2.5} 
                      fill="url(#gradientRevenue)" 
                      name="revenue" 
                    />
                    {/* Satış Adedi - Sağ eksene bağlı */}
                    <Area 
                      type="monotone" 
                      dataKey="count" 
                      yAxisId="right"
                      stroke={CHART_COLORS.success} 
                      strokeWidth={2.5} 
                      fill="url(#gradientCount)" 
                      name="count" 
                    />
              </AreaChart>
            </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Paket Dağılımı */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Paket Dağılımı
            </CardTitle>
            <CardDescription>En çok satan paketler</CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topPackages?.length ? (
              <div className="space-y-4">
                <div className="h-[160px]">
                  <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                        data={stats.topPackages}
                  cx="50%"
                  cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                  dataKey="count"
                >
                        {stats.topPackages.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {stats.topPackages.slice(0, 4).map((pkg, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                        <span className="text-xs truncate max-w-[120px]">{pkg.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{pkg.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12 mb-3 opacity-20" />
                <p className="text-sm">Henüz paket satışı yok</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== SON İŞLEMLER ===== */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Son Satışlar */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-primary" />
              Son Satışlar
            </CardTitle>
                <CardDescription>En son yapılan satışlar</CardDescription>
              </div>
              <Link to="/dashboard/sales">
                <Button variant="ghost" size="sm" className="gap-1">
                  Tümünü Gör <Eye className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
              {recentSales.length > 0 ? (
              <div className="space-y-3">
                {recentSales.map((sale, index) => (
                  <div key={sale.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50 ${index === 0 ? 'bg-muted/30' : ''}`}>
                    <div className="h-11 w-11 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold shadow-lg">
                      <CheckCircle className="h-5 w-5" />
                      </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">
                          {sale.customer?.name} {sale.customer?.surname}
                        </p>
                        {index === 0 && <Badge variant="secondary" className="text-[10px] py-0">Yeni</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {sale.package?.name || 'Paket'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">{formatCurrency(sale.price)}</p>
                      <p className="text-[10px] text-muted-foreground">{formatDate(sale.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">Henüz satış bulunmuyor</p>
                <Link to="/dashboard/sales/new">
                  <Button size="sm" className="mt-3 gap-1">
                    <Plus className="h-4 w-4" /> İlk Satışı Yap
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Son Müşteriler */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
              Son Müşteriler
            </CardTitle>
                <CardDescription>En son eklenen müşteriler</CardDescription>
              </div>
              <Link to="/dashboard/customers">
                <Button variant="ghost" size="sm" className="gap-1">
                  Tümünü Gör <Eye className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
              {recentCustomers.length > 0 ? (
              <div className="space-y-3">
                {recentCustomers.map((customer, index) => (
                  <div key={customer.id} className={`flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-muted/50 ${index === 0 ? 'bg-muted/30' : ''}`}>
                    <Avatar className="h-11 w-11 border-2 border-primary/20">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-semibold">
                        {customer.name?.[0]}{customer.surname?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">
                          {customer.name} {customer.surname}
                        </p>
                        {customer.is_corporate && (
                          <Badge variant="outline" className="text-[10px] py-0">Kurumsal</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{customer.phone}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-xs">
                        {customer.tc_vkn?.slice(-4)}****
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-1">{formatDate(customer.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-muted-foreground">Henüz müşteri bulunmuyor</p>
                <Link to="/dashboard/customers">
                  <Button size="sm" className="mt-3 gap-1">
                    <UserPlus className="h-4 w-4" /> Müşteri Ekle
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===== İADE VE HASAR DOSYALARI - Super Admin için yan yana ===== */}
      {user?.role === UserRole.SUPER_ADMIN && (
        <div className="grid gap-4 lg:grid-cols-2">
          {/* İade İşlemleri */}
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                  <RotateCcw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">İade İşlemleri</CardTitle>
                    <CardDescription>Tüm sistemdeki iade işlemleri</CardDescription>
                </div>
              </div>
                <div className="flex items-center gap-2">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                    <p className="text-xl font-bold text-red-600">{stats?.totalRefunds || 0}</p>
                    <p className="text-[10px] text-red-600/70">İade</p>
                  </div>
                  <div className="text-center px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                    <p className="text-xl font-bold text-amber-600">{formatShortCurrency(stats?.totalRefundAmount || 0)}</p>
                    <p className="text-[10px] text-amber-600/70">Tutar</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {stats?.recentRefunds && stats.recentRefunds.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {stats.recentRefunds.slice(0, 5).map((refund) => (
                    <div key={refund.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">
                            {refund.customer?.name} {refund.customer?.surname}
                          </p>
                          <Badge variant="outline" className="font-mono text-[10px] flex-shrink-0">
                            {refund.vehicle?.plate}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {refund.refund_reason || refund.package?.name || '-'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-red-600 text-sm">
                          {formatCurrency(refund.refund_amount || 0)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {refund.refunded_at ? formatDate(refund.refunded_at) : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-600">Harika!</p>
                  <p className="text-xs text-muted-foreground">Henüz iade işlemi yok</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hasar Dosyaları */}
          <Card className="border-orange-200 dark:border-orange-900/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Hasar Dosyaları</CardTitle>
                    <CardDescription>Son oluşturulan hasar dosyaları</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900">
                    <p className="text-xl font-bold text-orange-600">{supportFiles.length}</p>
                    <p className="text-[10px] text-orange-600/70">Dosya</p>
                  </div>
                  <Link to="/dashboard/support-files">
                    <Button variant="outline" size="sm" className="gap-1 text-xs">
                      <Eye className="h-3 w-3" /> Tümü
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {supportFiles.length > 0 ? (
                <div className="space-y-2 max-h-[320px] overflow-y-auto">
                  {supportFiles.slice(0, 5).map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{file.insured_name}</p>
                          <Badge variant="outline" className="font-mono text-[10px] flex-shrink-0">
                            {file.vehicle_plate}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{file.service_type}</span>
                          <span className="flex items-center gap-0.5 flex-shrink-0">
                            <MapPin className="h-3 w-3" />
                            {file.city}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-orange-600 text-sm">
                          {file.service_amount ? formatCurrency(file.service_amount) : '-'}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {formatDate(file.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="h-12 w-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <p className="text-sm font-medium text-emerald-600">Temiz!</p>
                  <p className="text-xs text-muted-foreground">Henüz hasar dosyası yok</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ===== İADE BİLGİLERİ - Sadece Agency Admin için (tam genişlik) ===== */}
      {user?.role === UserRole.AGENCY_ADMIN && (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg">
                  <RotateCcw className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">İade İşlemleri</CardTitle>
                  <CardDescription>Acentenize ait iade işlemleri</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <p className="text-2xl font-bold text-red-600">{stats?.totalRefunds || 0}</p>
                  <p className="text-xs text-red-600/70">Toplam İade</p>
                </div>
                <div className="text-center px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                  <p className="text-2xl font-bold text-amber-600">{formatShortCurrency(stats?.totalRefundAmount || 0)}</p>
                  <p className="text-xs text-amber-600/70">İade Tutarı</p>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.recentRefunds && stats.recentRefunds.length > 0 ? (
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Müşteri</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Plaka</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Paket</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">İade Tutarı</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground">Sebep</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRefunds.map((refund) => (
                      <tr key={refund.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                              <XCircle className="h-4 w-4 text-red-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {refund.customer?.name} {refund.customer?.surname}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {refund.customer?.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono text-xs">
                            {refund.vehicle?.plate}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{refund.package?.name || '-'}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-bold text-red-600">
                            {formatCurrency(refund.refund_amount || 0)}
                          </span>
                        </td>
                        <td className="p-3">
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]" title={refund.refund_reason || ''}>
                            {refund.refund_reason || '-'}
                          </p>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-xs text-muted-foreground">
                            {refund.refunded_at ? formatDate(refund.refunded_at) : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-lg font-medium text-emerald-600 mb-1">Harika!</p>
                <p className="text-muted-foreground">Henüz iade işlemi yapılmamış</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
