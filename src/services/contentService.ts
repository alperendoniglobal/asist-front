import apiClient from '../api/config';
import type { ApiResponse } from '../types';

// Content Types
export interface LandingPageContent {
  id: string;
  support_phone: string;
  support_email?: string;
  company_name: string;
  company_address?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
}

export interface LandingPageBanner {
  id: string;
  image_path: string;
  badge?: string;
  left_content?: {
    title: string;
    subtitle: string;
    description: string;
    feature: string;
    feature_icon: string;
  };
  right_content?: {
    title: string;
    subtitle: string;
    description: string;
  };
  banner_stats?: Array<{
    label: string;
    value: number;
    suffix?: string;
    icon: string;
  }>;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingPageFeature {
  id: string;
  icon_name: string;
  title: string;
  description: string;
  gradient?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingPageStat {
  id: string;
  label: string;
  value: number;
  suffix?: string;
  icon_name: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PageContent {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Content Service
export const contentService = {
  // Landing Page Content
  async getLandingPageContent(): Promise<LandingPageContent> {
    const response = await apiClient.get<ApiResponse<LandingPageContent>>('/content/landing-page');
    return response.data.data;
  },

  async updateLandingPageContent(data: Partial<LandingPageContent>): Promise<LandingPageContent> {
    const response = await apiClient.put<ApiResponse<LandingPageContent>>('/content/landing-page', data);
    return response.data.data;
  },

  // Banners
  async getAllBanners(): Promise<LandingPageBanner[]> {
    const response = await apiClient.get<ApiResponse<LandingPageBanner[]>>('/content/banners');
    return response.data.data;
  },

  async getActiveBanners(): Promise<LandingPageBanner[]> {
    const response = await apiClient.get<ApiResponse<LandingPageBanner[]>>('/content/banners/active');
    return response.data.data;
  },

  async getBannerById(id: string): Promise<LandingPageBanner> {
    const response = await apiClient.get<ApiResponse<LandingPageBanner>>(`/content/banners/${id}`);
    return response.data.data;
  },

  async createBanner(data: Partial<LandingPageBanner>): Promise<LandingPageBanner> {
    const response = await apiClient.post<ApiResponse<LandingPageBanner>>('/content/banners', data);
    return response.data.data;
  },

  async updateBanner(id: string, data: Partial<LandingPageBanner>): Promise<LandingPageBanner> {
    const response = await apiClient.put<ApiResponse<LandingPageBanner>>(`/content/banners/${id}`, data);
    return response.data.data;
  },

  async deleteBanner(id: string): Promise<void> {
    await apiClient.delete(`/content/banners/${id}`);
  },

  async updateBannerOrder(bannerIds: string[]): Promise<LandingPageBanner[]> {
    const response = await apiClient.post<ApiResponse<LandingPageBanner[]>>('/content/banners/order', { bannerIds });
    return response.data.data;
  },

  // Features
  async getAllFeatures(): Promise<LandingPageFeature[]> {
    const response = await apiClient.get<ApiResponse<LandingPageFeature[]>>('/content/features');
    return response.data.data;
  },

  async getActiveFeatures(): Promise<LandingPageFeature[]> {
    const response = await apiClient.get<ApiResponse<LandingPageFeature[]>>('/content/features/active');
    return response.data.data;
  },

  async getFeatureById(id: string): Promise<LandingPageFeature> {
    const response = await apiClient.get<ApiResponse<LandingPageFeature>>(`/content/features/${id}`);
    return response.data.data;
  },

  async createFeature(data: Partial<LandingPageFeature>): Promise<LandingPageFeature> {
    const response = await apiClient.post<ApiResponse<LandingPageFeature>>('/content/features', data);
    return response.data.data;
  },

  async updateFeature(id: string, data: Partial<LandingPageFeature>): Promise<LandingPageFeature> {
    const response = await apiClient.put<ApiResponse<LandingPageFeature>>(`/content/features/${id}`, data);
    return response.data.data;
  },

  async deleteFeature(id: string): Promise<void> {
    await apiClient.delete(`/content/features/${id}`);
  },

  async updateFeatureOrder(featureIds: string[]): Promise<LandingPageFeature[]> {
    const response = await apiClient.post<ApiResponse<LandingPageFeature[]>>('/content/features/order', { featureIds });
    return response.data.data;
  },

  // Stats
  async getAllStats(): Promise<LandingPageStat[]> {
    const response = await apiClient.get<ApiResponse<LandingPageStat[]>>('/content/stats');
    return response.data.data;
  },

  async getActiveStats(): Promise<LandingPageStat[]> {
    const response = await apiClient.get<ApiResponse<LandingPageStat[]>>('/content/stats/active');
    return response.data.data;
  },

  async getStatById(id: string): Promise<LandingPageStat> {
    const response = await apiClient.get<ApiResponse<LandingPageStat>>(`/content/stats/${id}`);
    return response.data.data;
  },

  async createStat(data: Partial<LandingPageStat>): Promise<LandingPageStat> {
    const response = await apiClient.post<ApiResponse<LandingPageStat>>('/content/stats', data);
    return response.data.data;
  },

  async updateStat(id: string, data: Partial<LandingPageStat>): Promise<LandingPageStat> {
    const response = await apiClient.put<ApiResponse<LandingPageStat>>(`/content/stats/${id}`, data);
    return response.data.data;
  },

  async deleteStat(id: string): Promise<void> {
    await apiClient.delete(`/content/stats/${id}`);
  },

  async updateStatOrder(statIds: string[]): Promise<LandingPageStat[]> {
    const response = await apiClient.post<ApiResponse<LandingPageStat[]>>('/content/stats/order', { statIds });
    return response.data.data;
  },

  // Page Contents
  async getAllPages(): Promise<PageContent[]> {
    const response = await apiClient.get<ApiResponse<PageContent[]>>('/content/pages');
    return response.data.data;
  },

  async getPageBySlug(slug: string): Promise<PageContent> {
    const response = await apiClient.get<ApiResponse<PageContent>>(`/content/pages/${slug}`);
    return response.data.data;
  },

  async getPageById(id: string): Promise<PageContent> {
    const response = await apiClient.get<ApiResponse<PageContent>>(`/content/pages/admin/${id}`);
    return response.data.data;
  },

  async createPage(data: Partial<PageContent>): Promise<PageContent> {
    const response = await apiClient.post<ApiResponse<PageContent>>('/content/pages', data);
    return response.data.data;
  },

  async updatePage(id: string, data: Partial<PageContent>): Promise<PageContent> {
    const response = await apiClient.put<ApiResponse<PageContent>>(`/content/pages/${id}`, data);
    return response.data.data;
  },

  async deletePage(id: string): Promise<void> {
    await apiClient.delete(`/content/pages/${id}`);
  },
};

