import axios from 'axios';

// v2 - Force rebuild
// Bayilik başvuru durumu enum - local tanım
export enum DealerApplicationStatusLocal {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Bayilik başvurusu interface - local tanım
export interface DealerApplicationLocal {
  id: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  tc_vkn: string;
  company_name?: string;
  city: string;
  district?: string;
  address?: string;
  referral_code?: string;
  status: DealerApplicationStatusLocal;
  notes?: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer?: {
    id: string;
    name: string;
    surname: string;
  };
  created_at: string;
  updated_at: string;
}

// API base URL - public endpoint'ler için
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Public API client (authentication gerektirmez)
const publicClient = axios.create({
  baseURL: `${API_BASE_URL}/public`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Authenticated API client (dealer applications için)
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token interceptor for authenticated requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== TİP TANIMLAMALARI =====

// Fiyatsız paket (public görünüm için)
export interface PublicPackage {
  id: string;
  name: string;
  description?: string;
  vehicle_type: string;
  max_vehicle_age: number;
  covers: PublicPackageCover[];
}

// Fiyatsız kapsam (public görünüm için)
export interface PublicPackageCover {
  id: string;
  title: string;
  description?: string;
  usage_count: number;
}

// Satın alma isteği
export interface PurchaseRequest {
  customer: {
    name: string;
    surname: string;
    tc_vkn: string;
    phone: string;
    email?: string;
    city?: string;
    district?: string;
    address?: string;
  };
  vehicle: {
    plate: string;
    brand_id?: number;
    model_id?: number;
    motor_brand_id?: number;
    motor_model_id?: number;
    model_year: number;
    usage_type: string;
    vehicle_type: string;
    is_foreign_plate?: boolean;
  };
  package_id: string;
  card: {
    cardHolderName: string;
    cardNumber: string;
    expireMonth: string;
    expireYear: string;
    cvc: string;
  };
  terms_accepted: boolean;
}

// Satın alma sonucu
export interface PurchaseResult {
  success: boolean;
  sale_id: string;
  policy_number: string;
  customer_name: string;
  vehicle_plate: string;
  package_name: string;
  price: number;
  start_date: string;
  end_date: string;
}

// Bayilik başvuru isteği
export interface DealerApplicationRequest {
  name: string;
  surname: string;
  email: string;
  phone: string;
  tc_vkn: string;
  company_name?: string;
  city: string;
  district?: string;
  address?: string;
  referral_code?: string;
  password: string;
}

// Marka/Model tipleri
export interface CarBrand {
  id: number;
  name: string;
}

export interface CarModel {
  id: number;
  brand_id: number;
  name: string;
}

export interface MotorBrand {
  id: number;
  name: string;
}

export interface MotorModel {
  id: number;
  brand_id: number;
  name: string;
}

// ===== PUBLIC SERVİS =====

export const publicService = {
  // ===== TC KONTROL =====

  /**
   * TC Kimlik No kontrolü - Satın alma için
   * Sistemde bu TC ile kayıtlı müşteri var mı?
   * Satın alma yapabilmek için TC'nin kayıtlı olması ZORUNLU
   */
  async checkTc(tc: string): Promise<{ exists: boolean; message: string; customer?: { name: string; surname: string } }> {
    const response = await publicClient.get(`/check-tc/${tc}`);
    return response.data.data;
  },

  // ===== PAKETLER =====

  /**
   * Tüm aktif paketleri fiyatsız olarak getir
   */
  async getPackages(): Promise<PublicPackage[]> {
    const response = await publicClient.get('/packages');
    return response.data.data;
  },

  /**
   * Tek bir paketi fiyatsız olarak getir
   */
  async getPackageById(id: string): Promise<PublicPackage> {
    const response = await publicClient.get(`/packages/${id}`);
    return response.data.data;
  },

  // ===== HİZMETLER =====

  /**
   * Tüm unique hizmet başlıklarını getir (footer için)
   */
  async getServices(): Promise<string[]> {
    const response = await publicClient.get('/services');
    return response.data.data;
  },

  // ===== ARAÇ MARKA/MODEL =====

  /**
   * Araba markalarını getir
   */
  async getCarBrands(): Promise<CarBrand[]> {
    const response = await publicClient.get('/car-brands');
    return response.data.data;
  },

  /**
   * Araba modellerini getir
   */
  async getCarModels(brandId: number): Promise<CarModel[]> {
    const response = await publicClient.get(`/car-models/${brandId}`);
    return response.data.data;
  },

  /**
   * Motor markalarını getir
   */
  async getMotorBrands(): Promise<MotorBrand[]> {
    const response = await publicClient.get('/motor-brands');
    return response.data.data;
  },

  /**
   * Motor modellerini getir
   */
  async getMotorModels(brandId: number): Promise<MotorModel[]> {
    const response = await publicClient.get(`/motor-models/${brandId}`);
    return response.data.data;
  },

  // ===== SATIN ALMA =====

  /**
   * Satın alma işlemi
   */
  async purchase(data: PurchaseRequest): Promise<PurchaseResult> {
    const response = await publicClient.post('/purchase', data);
    return response.data.data;
  },

  // ===== BAYİLİK BAŞVURU =====

  /**
   * Yeni bayilik başvurusu oluştur
   */
  async createDealerApplication(data: DealerApplicationRequest): Promise<DealerApplicationLocal> {
    const response = await publicClient.post('/dealer-application', data);
    return response.data.data;
  },
};

// ===== BAYİLİK BAŞVURU YÖNETİMİ (Super Admin) =====

export const dealerApplicationService = {
  /**
   * Tüm başvuruları getir
   */
  async getAll(status?: DealerApplicationStatusLocal): Promise<DealerApplicationLocal[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get('/dealer-applications', { params });
    return response.data.data;
  },

  /**
   * Tek bir başvuruyu getir
   */
  async getById(id: string): Promise<DealerApplicationLocal> {
    const response = await apiClient.get(`/dealer-applications/${id}`);
    return response.data.data;
  },

  /**
   * Başvuruyu onayla
   */
  async approve(id: string, notes?: string): Promise<any> {
    const response = await apiClient.put(`/dealer-applications/${id}/approve`, { notes });
    return response.data.data;
  },

  /**
   * Başvuruyu reddet
   */
  async reject(id: string, notes: string): Promise<any> {
    const response = await apiClient.put(`/dealer-applications/${id}/reject`, { notes });
    return response.data.data;
  },

  /**
   * Bekleyen başvuru sayısını getir
   */
  async getPendingCount(): Promise<number> {
    const response = await apiClient.get('/dealer-applications/pending-count');
    return response.data.data.count;
  },
};

