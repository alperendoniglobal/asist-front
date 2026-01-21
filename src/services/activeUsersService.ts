import apiClient from '../api/config';
import type { ApiResponse } from '../types';

/**
 * Aktif kullanıcı bilgisi interface'i
 */
export interface ActiveUser {
  id: string;
  name: string;
  surname: string;
  email: string;
  role: string;
  agency?: {
    id: string;
    name: string;
  };
  branch?: {
    id: string;
    name: string;
  };
  lastSeen: string; // ISO date string
}

/**
 * Active Users Service
 * REST API üzerinden aktif kullanıcıları getirir
 * Socket.io ile gerçek zamanlı takip yapılır, bu servis fallback olarak kullanılabilir
 */
export const activeUsersService = {
  /**
   * Tüm aktif kullanıcıları getir
   * SUPER_ADMIN: Tüm aktif kullanıcılar
   * SUPER_AGENCY_ADMIN: Yönettiği broker'lardaki aktif kullanıcılar
   */
  async getAll(): Promise<ActiveUser[]> {
    const response = await apiClient.get<ApiResponse<ActiveUser[]>>('/active-users');
    return response.data.data;
  },

  /**
   * Aktif kullanıcı sayısını getir
   */
  async getCount(): Promise<number> {
    const response = await apiClient.get<ApiResponse<{ count: number }>>('/active-users/count');
    return response.data.data.count;
  },

  /**
   * Belirli bir kullanıcının aktif olup olmadığını kontrol et
   */
  async checkUserActive(userId: string): Promise<boolean> {
    const response = await apiClient.get<ApiResponse<{ isActive: boolean }>>(
      `/active-users/${userId}/check`
    );
    return response.data.data.isActive;
  },
};
