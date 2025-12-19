export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  AGENCY_ADMIN = 'AGENCY_ADMIN',
  BRANCH_ADMIN = 'BRANCH_ADMIN',
  BRANCH_USER = 'BRANCH_USER'
}

export interface User {
  id: string;
  agency_id?: string;
  branch_id?: string;
  name: string;
  surname?: string;
  email: string;
  phone: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Acente
 * Her acentenin kendine özel komisyon oranı vardır
 */
export interface Agency {
  id: string;
  name: string;
  tax_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  commission_rate: number;     // Komisyon oranı (%) - örn: 25.00 = %25
  balance: number;             // Bakiye (TL) - Biriken komisyonlar
  status: EntityStatus;        // Acente durumu
  logo?: string | null;         // Logo (Base64 formatında)
  created_at: string;
  updated_at: string;
  branches?: Branch[];         // Acenteye bağlı şubeler (opsiyonel)
}

export interface Branch {
  id: string;
  agency_id: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  // Şube komisyon oranı (%) - ZORUNLU alan
  // Acente komisyonundan fazla OLAMAZ
  commission_rate: number;
  // Şube bakiyesi (TL) - Biriken komisyonlar
  balance: number;
  // Acentenin maksimum komisyon oranı (validasyon için)
  agency_max_commission?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export interface Customer {
  id: string;
  agency_id: string;
  branch_id: string;
  created_by?: string;
  is_corporate: boolean;        // Kurumsal müşteri mi?
  tc_vkn: string;               // TC Kimlik (Bireysel) veya Vergi Kimlik (Kurumsal)
  name: string;                 // Ad (Bireysel) veya Ünvan (Kurumsal)
  surname?: string;             // Soyad (Bireysel için zorunlu, Kurumsal için opsiyonel)
  tax_office?: string;          // Vergi Dairesi (Kurumsal için)
  birth_date?: string;          // Doğum Tarihi
  phone: string;
  email?: string;
  city?: string;                // İl
  district?: string;            // İlçe
  address?: string;             // Detaylı adres
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
  sales?: Sale[];
}

export interface Vehicle {
  id: string;
  customer_id: string;
  agency_id: string;
  branch_id: string;
  is_foreign_plate: boolean;    // Yabancı plaka mı?
  plate: string;
  // Ruhsat Seri ve No
  registration_serial?: string | null;
  registration_number?: string | null;
  brand_id?: number;
  model_id?: number;
  model_year: number;
  usage_type: string;
  created_at: string;
  updated_at: string;
  // İlişkiler (API'den populate edilince dolu gelir)
  customer?: Customer;
  brand?: CarBrand;
  model?: CarModel;
  agency?: Agency;
  branch?: Branch;
}

export interface CarBrand {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
  value?: string;
  created_at: string;
  updated_at: string;
}

// Entity durumu enum'u - Backend ile senkronize
export enum EntityStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

// ===== PAKET TİPLERİ =====

/**
 * Yol Asistan Paketi
 * Araç türüne göre sabit fiyatlı paketler
 */
export interface Package {
  id: string;
  name: string;                // Paket adı (örn: "Hususi Paket (T)")
  description?: string;        // Paket açıklaması
  vehicle_type: string;        // Araç türü (Otomobil, Motosiklet, Minibüs, vs.)
  price: number;               // Sabit fiyat (TL)
  max_vehicle_age: number;     // Maksimum araç yaşı
  status: EntityStatus;        // Paket durumu
  created_at: string;
  updated_at: string;
  covers?: PackageCover[];     // Paket kapsamları
}

/**
 * Paket Kapsamı / Teminat
 * Her paketteki hizmet/teminat detayları
 */
export interface PackageCover {
  id: string;
  package_id: string;
  title: string;               // Kapsam başlığı (örn: "Çekici Hizmeti Kaza")
  description?: string;        // Kapsam açıklaması
  usage_count: number;         // Kullanım adedi (örn: 2 = 2 kez)
  limit_amount: number;        // Limit tutarı TL
  sort_order: number;          // Sıralama
  created_at?: string;
  updated_at?: string;
}

export interface Sale {
  id: string;
  customer_id: string;
  vehicle_id: string;
  agency_id: string;
  branch_id: string;
  user_id?: string;
  package_id: string;
  price: number;
  commission: number;
  start_date: string;
  end_date: string;
  policy_number?: string;
  // ===== İADE BİLGİLERİ =====
  is_refunded: boolean;           // İade yapıldı mı?
  refunded_at?: string;           // İade tarihi
  refund_amount?: number;         // İade tutarı (TL)
  refund_reason?: string;         // İade sebebi
  refunded_by?: string;           // İade yapan kullanıcı ID
  // ===========================
  created_at: string;
  updated_at: string;
  customer?: Customer;
  vehicle?: Vehicle;
  package?: Package;
}

// İade hesaplama sonucu (API'den dönen)
export interface RefundCalculation {
  sale: {
    id: string;
    customer_name: string;
    vehicle_plate: string;
    package_name: string;
    total_price: number;
    start_date: string;
    end_date: string;
  };
  calculation: {
    total_price: number;      // KDV dahil toplam
    kdv_amount: number;       // KDV tutarı
    net_price: number;        // KDV hariç net
    contract_days: number;    // Toplam sözleşme günü
    used_days: number;        // Kullanılan gün
    remaining_days: number;   // Kalan gün
    daily_rate: number;       // Günlük ücret (net)
    refund_amount: number;    // İade tutarı
  };
}

export enum PaymentType {
  IYZICO = 'IYZICO',
  BALANCE = 'BALANCE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface Payment {
  id: string;
  sale_id: string;
  agency_id: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  transaction_id?: string;
  payment_details?: Record<string, any>;
  created_at: string;
  updated_at: string;
  sale?: Sale;
}

export enum CommissionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export interface Commission {
  id: string;
  agency_id: string;
  amount: number;
  status: CommissionStatus;
  notes?: string;
  bank_account?: string;
  approved_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
  agency?: Agency;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface SupportTicket {
  id: string;
  user_id: string;
  agency_id?: string;
  branch_id?: string;
  subject: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalCommission: number;
  totalCustomers: number;
  recentSales?: Sale[];
  dailySales?: Array<{ day: string; date: string; count: number; revenue: number }>; // Son 7 gün
  monthlySales?: Array<{ month: string; count: number; revenue: number }>; // Aylık (opsiyonel)
  topPackages?: Array<{ name: string; count: number }>;
  agencyPerformance?: Array<{  // Acente performans karşılaştırması
    id: string;
    name: string;
    salesCount: number;
    totalRevenue: number;
    totalCommission: number;
  }>;
  // İade istatistikleri
  totalRefunds?: number;           // Toplam iade sayısı
  totalRefundAmount?: number;      // Toplam iade tutarı
  recentRefunds?: Sale[];          // Son iadeler listesi
}
