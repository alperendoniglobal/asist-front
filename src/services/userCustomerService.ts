import axios from 'axios';

// API base URL - UserCustomer Service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cozum.net/api/v1';

/**
 * UserCustomer tipi
 * Bireysel kullanıcı bilgileri
 */
export interface UserCustomer {
  id: string;
  tc_vkn: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  city?: string;
  district?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Kayıt için gerekli veriler
 */
export interface RegisterUserCustomerData {
  tc_vkn: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  city?: string;
  district?: string;
  address?: string;
}

/**
 * Giriş için gerekli veriler
 */
export interface LoginUserCustomerCredentials {
  email: string;
  password: string;
}

/**
 * Giriş/Kayıt yanıtı
 */
export interface UserCustomerAuthResponse {
  user: UserCustomer;
  accessToken: string;
  refreshToken: string;
}

/**
 * Satın alınan paket bilgisi
 */
export interface UserCustomerPurchase {
  id: string;
  package_name: string;
  package_type: string;
  vehicle_plate: string;
  vehicle_type: string;
  price: number;
  start_date: string;
  end_date: string;
  policy_number: string;
  is_refunded: boolean;
  created_at: string;
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// LocalStorage key'leri - admin auth'dan ayrı tutulması için farklı isimler
const USER_CUSTOMER_TOKEN_KEY = 'userCustomerAccessToken';
const USER_CUSTOMER_REFRESH_TOKEN_KEY = 'userCustomerRefreshToken';
const USER_CUSTOMER_DATA_KEY = 'userCustomerData';

// Axios instance oluştur
const userCustomerClient = axios.create({
  baseURL: `${API_BASE_URL}/user-customer`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
userCustomerClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(USER_CUSTOMER_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - token yenileme
userCustomerClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 hatası ve henüz retry yapılmamışsa
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem(USER_CUSTOMER_REFRESH_TOKEN_KEY);
        if (refreshToken) {
          // Token yenile
          const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
            `${API_BASE_URL}/user-customer/refresh-token`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;

          // Yeni token'ları kaydet
          localStorage.setItem(USER_CUSTOMER_TOKEN_KEY, accessToken);
          localStorage.setItem(USER_CUSTOMER_REFRESH_TOKEN_KEY, newRefreshToken);

          // Orijinal isteği yeni token ile tekrarla
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return userCustomerClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token da geçersizse çıkış yap
        userCustomerService.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

/**
 * UserCustomer Service
 * Bireysel kullanıcılar için API işlemleri
 */
export const userCustomerService = {
  /**
   * Kayıt ol
   */
  async register(data: RegisterUserCustomerData): Promise<UserCustomerAuthResponse> {
    const response = await userCustomerClient.post<ApiResponse<UserCustomerAuthResponse>>('/register', data);
    const { user, accessToken, refreshToken } = response.data.data;

    // Token ve kullanıcı bilgilerini kaydet
    localStorage.setItem(USER_CUSTOMER_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_CUSTOMER_REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_CUSTOMER_DATA_KEY, JSON.stringify(user));

    return response.data.data;
  },

  /**
   * Giriş yap
   */
  async login(credentials: LoginUserCustomerCredentials): Promise<UserCustomerAuthResponse> {
    const response = await userCustomerClient.post<ApiResponse<UserCustomerAuthResponse>>('/login', credentials);
    const { user, accessToken, refreshToken } = response.data.data;

    // Token ve kullanıcı bilgilerini kaydet
    localStorage.setItem(USER_CUSTOMER_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_CUSTOMER_REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_CUSTOMER_DATA_KEY, JSON.stringify(user));

    return response.data.data;
  },

  /**
   * Çıkış yap
   */
  logout() {
    localStorage.removeItem(USER_CUSTOMER_TOKEN_KEY);
    localStorage.removeItem(USER_CUSTOMER_REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_CUSTOMER_DATA_KEY);
  },

  /**
   * Profil bilgilerini getir
   */
  async getProfile(): Promise<UserCustomer> {
    const response = await userCustomerClient.get<ApiResponse<UserCustomer>>('/profile');
    return response.data.data;
  },

  /**
   * Profil güncelle
   */
  async updateProfile(data: Partial<UserCustomer>): Promise<UserCustomer> {
    const response = await userCustomerClient.put<ApiResponse<UserCustomer>>('/profile', data);
    
    // localStorage'daki kullanıcı bilgilerini güncelle
    localStorage.setItem(USER_CUSTOMER_DATA_KEY, JSON.stringify(response.data.data));
    
    return response.data.data;
  },

  /**
   * Şifre değiştir
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await userCustomerClient.put('/change-password', { oldPassword, newPassword });
  },

  /**
   * Satın alınan paketleri getir
   */
  async getPurchases(): Promise<UserCustomerPurchase[]> {
    const response = await userCustomerClient.get<ApiResponse<UserCustomerPurchase[]>>('/purchases');
    return response.data.data;
  },

  /**
   * Araçları getir
   */
  async getVehicles(): Promise<any[]> {
    const response = await userCustomerClient.get<ApiResponse<any[]>>('/vehicles');
    return response.data.data;
  },

  /**
   * Paket satın al
   */
  async purchase(data: {
    package_id: string;
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
    card: {
      cardHolderName: string;
      cardNumber: string;
      expireMonth: string;
      expireYear: string;
      cvc: string;
    };
    terms_accepted: boolean;
  }): Promise<{
    success: boolean;
    policy_number: string;
    package_name: string;
    customer_name: string;
    vehicle_plate: string;
    start_date: string;
    end_date: string;
    price: number;
  }> {
    const response = await userCustomerClient.post<ApiResponse<any>>('/purchase', data);
    return response.data.data;
  },

  /**
   * localStorage'dan kullanıcı bilgilerini al
   */
  getStoredUser(): UserCustomer | null {
    const userStr = localStorage.getItem(USER_CUSTOMER_DATA_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Kullanıcı giriş yapmış mı kontrol et
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(USER_CUSTOMER_TOKEN_KEY);
  },
};

