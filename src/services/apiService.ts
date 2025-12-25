import apiClient from '../api/config';
import type {
  ApiResponse,
  Agency,
  Branch,
  User,
  Customer,
  Vehicle,
  Package,
  Sale,
  Payment,
  Commission,
  SupportTicket,
  SupportMessage,
  DashboardStats,
  CarBrand,
  CarModel,
  MotorBrand,
  MotorModel,
  RefundCalculation
} from '../types';

// Generic CRUD operations
const createCRUDService = <T>(endpoint: string) => ({
  async getAll(params?: Record<string, any>): Promise<T[]> {
    const response = await apiClient.get<ApiResponse<T[]>>(endpoint, { params });
    return response.data.data;
  },

  async getById(id: string): Promise<T> {
    const response = await apiClient.get<ApiResponse<T>>(`${endpoint}/${id}`);
    return response.data.data;
  },

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<ApiResponse<T>>(endpoint, data);
    return response.data.data;
  },

  async update(id: string, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<ApiResponse<T>>(`${endpoint}/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${endpoint}/${id}`);
  }
});

// Agency Service
export const agencyService = {
  ...createCRUDService<Agency>('/agencies'),

  // Acente için şube bazlı komisyon dağılım raporu
  async getBranchCommissionDistribution(agencyId: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/agencies/${agencyId}/commission-distribution`);
    return response.data.data;
  },
};

// Branch Service - Sube yonetimi
export const branchService = {
  ...createCRUDService<Branch>('/branches'),

  // Sube detaylari ile performans istatistiklerini getir
  async getByIdWithStats(id: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/branches/${id}/stats`);
    return response.data.data;
  },

  // Komisyon bilgileriyle birlikte tum subeleri getir
  async getAllWithCommission(): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>('/branches', {
      params: { includeCommission: 'true' }
    });
    return response.data.data;
  },

  // Subenin komisyon oranini ve acente max oranini getir
  async getCommissionRate(id: string): Promise<{ commission_rate: number; agency_max_commission: number }> {
    const response = await apiClient.get<ApiResponse<{ commission_rate: number; agency_max_commission: number }>>(`/branches/${id}/commission`);
    return response.data.data;
  },

  // Sube komisyon oranini guncelle
  // Komisyon orani zorunlu ve acente oranindan fazla olamaz
  async updateCommissionRate(id: string, commissionRate: number): Promise<Branch> {
    const response = await apiClient.patch<ApiResponse<Branch>>(`/branches/${id}/commission`, {
      commission_rate: commissionRate
    });
    return response.data.data;
  },
};

// User Service - Kullanici yonetimi
export const userService = {
  ...createCRUDService<User>('/users'),

  // Kullanici aktiviteleri ile birlikte detay getir
  // Acente yoneticisi calisanlarinin islemlerini gormek icin
  async getByIdWithActivity(id: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/users/${id}/activity`);
    return response.data.data;
  },

  // Kullanici durumunu degistir (aktif <-> pasif)
  async toggleStatus(id: string): Promise<User> {
    const response = await apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-status`);
    return response.data.data;
  },
};

// Customer Service
export const customerService = {
  ...createCRUDService<Customer>('/customers'),

  async search(query: string): Promise<Customer[]> {
    const response = await apiClient.get<ApiResponse<Customer[]>>('/customers/search', {
      params: { q: query }
    });
    return response.data.data;
  },

  // TC/VKN ile müşteri sorgula - geçmiş alışverişleriyle birlikte
  async findByTcVkn(tcVkn: string): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>(`/customers/tc/${tcVkn}`);
    return response.data.data;
  }
};

// Vehicle Service
export const vehicleService = {
  ...createCRUDService<Vehicle>('/vehicles'),

  // Müşterinin araçlarını getir
  async getByCustomer(customerId: string): Promise<Vehicle[]> {
    const response = await apiClient.get<ApiResponse<Vehicle[]>>(`/vehicles/customer/${customerId}`);
    return response.data.data;
  },

  // Plakaya göre araç bul
  async findByPlate(plate: string): Promise<Vehicle | null> {
    const response = await apiClient.get<ApiResponse<Vehicle | null>>(`/vehicles/plate/${plate}`);
    return response.data.data;
  },

  // Araç bul veya oluştur (satış akışı için)
  async findOrCreate(data: Partial<Vehicle>): Promise<{ vehicle: Vehicle; isNew: boolean }> {
    const response = await apiClient.post<ApiResponse<{ vehicle: Vehicle; isNew: boolean }>>('/vehicles/find-or-create', data);
    return response.data.data;
  }
};

// Package Service - Yol Asistan paketleri yönetimi
export const packageService = {
  ...createCRUDService<Package>('/packages'),

  // ===== Kapsam Yönetimi =====
  
  // Paketin tüm kapsamlarını getir
  async getCovers(packageId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/packages/${packageId}/covers`);
    return response.data.data;
  },

  // Pakete yeni kapsam ekle
  async addCover(packageId: string, data: { 
    title: string; 
    description?: string; 
    usage_count: number;
    limit_amount: number;
    sort_order?: number 
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(`/packages/${packageId}/covers`, data);
    return response.data.data;
  },

  // Kapsam güncelle
  async updateCover(packageId: string, coverId: string, data: { 
    title?: string; 
    description?: string; 
    usage_count?: number;
    limit_amount?: number;
    sort_order?: number 
  }): Promise<any> {
    const response = await apiClient.put<ApiResponse<any>>(`/packages/${packageId}/covers/${coverId}`, data);
    return response.data.data;
  },

  // Kapsam sil
  async deleteCover(packageId: string, coverId: string): Promise<void> {
    await apiClient.delete(`/packages/${packageId}/covers/${coverId}`);
  },

  // ===== Yardımcı Metodlar =====

  // Araç türüne göre paketleri getir
  async getByVehicleType(vehicleType: string): Promise<Package[]> {
    const response = await apiClient.get<ApiResponse<Package[]>>(`/packages/vehicle-type/${vehicleType}`);
    return response.data.data;
  },

  // Araç yaşına uygun paketleri getir (satış sırasında)
  async getAvailablePackages(vehicleType: string, vehicleAge: number): Promise<Package[]> {
    const response = await apiClient.get<ApiResponse<Package[]>>('/packages/available', {
      params: { vehicleType, vehicleAge }
    });
    return response.data.data;
  }
};

// Sale Service
export const saleService = {
  ...createCRUDService<Sale>('/sales'),

  async getStats(): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/sales/stats');
    return response.data.data;
  },

  /**
   * Komple satış işlemi - Transaction ile tüm adımları tek seferde yapar
   * Müşteri + Araç + Satış + Ödeme hepsi birlikte işlenir
   * Herhangi birinde hata olursa hiçbir kayıt oluşturulmaz
   */
  async completeSale(data: {
    customer: {
      id?: string;
      is_corporate: boolean;
      tc_vkn: string;
      name: string;
      surname?: string;
      tax_office?: string;
      birth_date?: string;
      phone: string;
      email?: string;
      city?: string;
      district?: string;
      address?: string;
    };
    vehicle: {
      vehicle_type: string; // Araç tipi: Otomobil, Motosiklet, vs.
      is_foreign_plate: boolean;
      plate: string;
      registration_serial?: string;
      registration_number?: string;
      brand_id?: number; // Otomobil için
      model_id?: number; // Otomobil için
      motor_brand_id?: number; // Motosiklet için
      motor_model_id?: number; // Motosiklet için
      model_year: number;
      usage_type: string;
    };
    sale: {
      package_id: string;
      start_date: string;
      end_date: string;
      price: number;
      commission?: number;
    };
    payment: {
      type: string;
      cardDetails?: {
        cardHolderName: string;
        cardNumber: string;
        expireMonth: string;
        expireYear: string;
        cvc: string;
      };
    };
  }): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>('/sales/complete', data);
    return response.data.data;
  },

  // ===== İADE İŞLEMLERİ =====

  /**
   * İade tutarını hesapla
   * Formül: (Net Fiyat / 365) × Kalan Gün
   * Net Fiyat = Toplam / 1.20 (KDV hariç)
   * @param saleId - Satış ID'si
   */
  async calculateRefund(saleId: string): Promise<RefundCalculation> {
    const response = await apiClient.get<ApiResponse<RefundCalculation>>(`/sales/${saleId}/refund`);
    return response.data.data;
  },

  /**
   * İade işlemini gerçekleştir
   * Satışı iptal eder ve iade tutarını hesaplar
   * @param saleId - Satış ID'si
   * @param reason - İade sebebi
   */
  async processRefund(saleId: string, reason: string): Promise<Sale> {
    const response = await apiClient.post<ApiResponse<Sale>>(`/sales/${saleId}/refund`, { reason });
    return response.data.data;
  },

  /**
   * Satışları Excel formatında export et
   * Rol bazlı filtreleme otomatik olarak uygulanır
   * @param startDate - Başlangıç tarihi (opsiyonel, format: YYYY-MM-DD)
   * @param endDate - Bitiş tarihi (opsiyonel, format: YYYY-MM-DD)
   * @returns Excel dosyası blob
   */
  async exportToExcel(startDate?: string, endDate?: string): Promise<Blob> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get(`/sales/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

// Payment Service
export const paymentService = {
  ...createCRUDService<Payment>('/payments'),

  async processIyzico(saleId: string, cardDetails: any): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments/iyzico', {
      sale_id: saleId,  // Backend sale_id bekliyor
      ...cardDetails
    });
    return response.data.data;
  },

  async processBalance(saleId: string): Promise<Payment> {
    const response = await apiClient.post<ApiResponse<Payment>>('/payments/balance', { 
      sale_id: saleId  // Backend sale_id bekliyor
    });
    return response.data.data;
  },

  async refund(paymentId: string, reason: string): Promise<void> {
    await apiClient.post(`/payments/${paymentId}/refund`, { reason });
  }
};

// Commission Service
export const commissionService = {
  ...createCRUDService<Commission>('/commissions'),

  async approve(id: string): Promise<void> {
    await apiClient.post(`/commissions/${id}/approve`);
  },

  async reject(id: string, reason: string): Promise<void> {
    await apiClient.post(`/commissions/${id}/reject`, { reason });
  },

  async markAsPaid(id: string): Promise<void> {
    await apiClient.post(`/commissions/${id}/mark-paid`);
  }
};

// Support Service
export const supportService = {
  ...createCRUDService<SupportTicket>('/support'),

  async getMessages(ticketId: string): Promise<SupportMessage[]> {
    const response = await apiClient.get<ApiResponse<SupportMessage[]>>(`/support/${ticketId}/messages`);
    return response.data.data;
  },

  async addMessage(ticketId: string, message: string): Promise<SupportMessage> {
    const response = await apiClient.post<ApiResponse<SupportMessage>>(`/support/${ticketId}/messages`, {
      message
    });
    return response.data.data;
  }
};

// Car Brand Service
export const carBrandService = {
  async getAll(): Promise<CarBrand[]> {
    const response = await apiClient.get<ApiResponse<CarBrand[]>>('/car-brands');
    return response.data.data;
  },

  async getById(id: number): Promise<CarBrand> {
    const response = await apiClient.get<ApiResponse<CarBrand>>(`/car-brands/${id}`);
    return response.data.data;
  }
};

// Car Model Service
export const carModelService = {
  async getAll(): Promise<CarModel[]> {
    const response = await apiClient.get<ApiResponse<CarModel[]>>('/car-models');
    return response.data.data;
  },

  async getById(id: number): Promise<CarModel | null> {
    try {
      const response = await apiClient.get<ApiResponse<CarModel>>(`/car-models/${id}`);
      return response.data.data;
    } catch (error: any) {
      // Model bulunamazsa null döndür
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getByBrandId(brandId: number): Promise<CarModel[]> {
    const response = await apiClient.get<ApiResponse<CarModel[]>>(`/car-models/brand/${brandId}`);
    return response.data.data;
  }
};

// Motor Brand Service
export const motorBrandService = {
  async getAll(): Promise<MotorBrand[]> {
    const response = await apiClient.get<ApiResponse<MotorBrand[]>>('/motor-brands');
    return response.data.data;
  },

  async getById(id: number): Promise<MotorBrand> {
    const response = await apiClient.get<ApiResponse<MotorBrand>>(`/motor-brands/${id}`);
    return response.data.data;
  }
};

// Motor Model Service
export const motorModelService = {
  async getAll(): Promise<MotorModel[]> {
    const response = await apiClient.get<ApiResponse<MotorModel[]>>('/motor-models');
    return response.data.data;
  },

  async getById(id: number): Promise<MotorModel | null> {
    try {
      const response = await apiClient.get<ApiResponse<MotorModel>>(`/motor-models/${id}`);
      return response.data.data;
    } catch (error: any) {
      // Model bulunamazsa null döndür
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  async getByBrandId(brandId: number): Promise<MotorModel[]> {
    const response = await apiClient.get<ApiResponse<MotorModel[]>>(`/motor-models/brand/${brandId}`);
    return response.data.data;
  }
};

// Stats Service
export const statsService = {
  async getDashboard(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/stats/dashboard');
    return response.data.data;
  },

  async getSalesStats(params?: any): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/stats/sales', { params });
    return response.data.data;
  },

  async getRevenueStats(params?: any): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/stats/revenue', { params });
    return response.data.data;
  },

  async getCustomerStats(params?: any): Promise<any> {
    const response = await apiClient.get<ApiResponse<any>>('/stats/customers', { params });
    return response.data.data;
  }
};

// PDF Service - Satis sonrasi belge olusturma
export const pdfService = {
  // Satis PDF'ini indir
  async downloadSaleContract(saleId: string): Promise<void> {
    const response = await apiClient.get(`/pdf/sale/${saleId}`, {
      responseType: 'blob'
    });
    
    // Blob'dan indirme linki olustur
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sozlesme-${saleId.slice(0, 8)}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  // Satis PDF'ini yeni sekmede ac
  async viewSaleContract(saleId: string): Promise<void> {
    const response = await apiClient.get(`/pdf/sale/${saleId}/view`, {
      responseType: 'blob'
    });
    
    // Blob'dan goruntuleme linki olustur
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
  },

  // PDF URL'ini al (iframe veya embed icin)
  getSaleContractUrl(saleId: string): string {
    const baseUrl = apiClient.defaults.baseURL || '';
    return `${baseUrl}/pdf/sale/${saleId}/view`;
  }
};

// Support File Service - Destek ekibi hasar dosyaları
export const supportFileService = {
  ...createCRUDService<any>('/support-files'),

  // Satış ID'ye göre hasar dosyalarını getir
  async getBySaleId(saleId: string): Promise<any[]> {
    const response = await apiClient.get<ApiResponse<any[]>>(`/support-files/sale/${saleId}`);
    return response.data.data;
  },
};
