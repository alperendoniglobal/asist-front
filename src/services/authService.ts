import apiClient from '../api/config';
import type { LoginResponse, User, ApiResponse } from '../types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  agency_id?: string;
  branch_id?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    const { user, accessToken, refreshToken, managed_agencies } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    // AGENCY_ADMIN için managed_agencies'i localStorage'a kaydet
    if (managed_agencies && managed_agencies.length > 0) {
      localStorage.setItem('managed_agencies', JSON.stringify(managed_agencies));
      // İlk acenteyi varsayılan olarak seç
      localStorage.setItem('selected_agency_id', managed_agencies[0].id);
    }

    return response.data.data;
  },

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
    const { user, accessToken, refreshToken } = response.data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));

    return response.data.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { oldPassword, newPassword });
  },

  async forgotPassword(phone: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { phone });
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('managed_agencies');
    localStorage.removeItem('selected_agency_id');
  },

  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
};
