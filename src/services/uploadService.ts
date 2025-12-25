import apiClient from '../api/config';
import type { ApiResponse } from '../types';

export interface UploadResponse {
  path: string;
}

/**
 * File Upload Service
 * Banner görselleri yüklemek için
 */
export const uploadService = {
  /**
   * Banner görseli yükle
   * @param file - Yüklenecek dosya
   * @returns Yüklenen dosyanın yolu
   */
  async uploadBanner(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post<ApiResponse<UploadResponse>>(
      '/content/upload/banner',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data.data.path;
  },
};

