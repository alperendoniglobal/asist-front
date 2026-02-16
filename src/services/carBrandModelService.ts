/**
 * Araç marka ve model yönetimi – Super Admin API servisi.
 * CARS.md dokümantasyonuna göre GET (auth) + POST/PUT/DELETE (sadece SUPER_ADMIN).
 */
import apiClient from '../api/config';
import type { ApiResponse } from '@/types';
import type { CarBrand, CarModel } from '@/types';

/** Marka listesi (ilişkili modeller opsiyonel) */
export type CarBrandListItem = CarBrand & { models?: CarModel[] };

/** Model listesi (marka adı göstermek için brand eklenebilir) */
export type CarModelListItem = CarModel & { brand?: CarBrand };

/** Marka CRUD – Authenticated + Super Admin yazma */
export const carBrandService = {
  getAll: async (): Promise<CarBrandListItem[]> => {
    const response = await apiClient.get<ApiResponse<CarBrandListItem[]>>('/car-brands');
    return response.data.data;
  },

  getById: async (id: number): Promise<CarBrand> => {
    const response = await apiClient.get<ApiResponse<CarBrand>>(`/car-brands/${id}`);
    return response.data.data;
  },

  create: async (data: { name: string }): Promise<CarBrand> => {
    const response = await apiClient.post<ApiResponse<CarBrand>>('/car-brands', data);
    return response.data.data;
  },

  update: async (id: number, data: { name: string }): Promise<CarBrand> => {
    const response = await apiClient.put<ApiResponse<CarBrand>>(`/car-brands/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<{ deleted: boolean; id: number }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(`/car-brands/${id}`);
    return response.data.data;
  },
};

/** Model CRUD – Authenticated + Super Admin yazma */
export const carModelService = {
  getAll: async (brandId?: number): Promise<CarModel[]> => {
    const url = brandId != null ? `/car-models?brandId=${brandId}` : '/car-models';
    const response = await apiClient.get<ApiResponse<CarModel[]>>(url);
    return response.data.data;
  },

  getByBrandId: async (brandId: number): Promise<CarModel[]> => {
    const response = await apiClient.get<ApiResponse<CarModel[]>>(`/car-models/brand/${brandId}`);
    return response.data.data;
  },

  getById: async (id: number): Promise<CarModel> => {
    const response = await apiClient.get<ApiResponse<CarModel>>(`/car-models/${id}`);
    return response.data.data;
  },

  create: async (data: { brand_id: number; name: string; value?: string }): Promise<CarModel> => {
    const response = await apiClient.post<ApiResponse<CarModel>>('/car-models', data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: { brand_id?: number; name?: string; value?: string }
  ): Promise<CarModel> => {
    const response = await apiClient.put<ApiResponse<CarModel>>(`/car-models/${id}`, data);
    return response.data.data;
  },

  delete: async (id: number): Promise<{ deleted: boolean; id: number }> => {
    const response = await apiClient.delete<ApiResponse<{ deleted: boolean; id: number }>>(`/car-models/${id}`);
    return response.data.data;
  },
};
