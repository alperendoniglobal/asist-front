import apiClient from '../api/config';

/**
 * Sözleşme Versiyonu Tipi
 */
export interface ContractVersion {
  id: string;
  version: string;
  title: string;
  content: string;
  is_active: boolean;
  summary: string | null;
  change_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Sözleşme Onay Kaydı Tipi
 */
export interface ContractAcceptance {
  id: string;
  agency_id: string;
  user_id: string;
  contract_version_id: string;
  ip_address: string;
  user_agent: string;
  checkbox1_accepted: boolean;
  checkbox2_accepted: boolean;
  scroll_completed: boolean;
  accepted_at: string;
  agency?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  contractVersion?: ContractVersion;
}

/**
 * Sözleşme Durumu Tipi
 */
export interface ContractStatus {
  accepted: boolean;
  currentVersion: string | null;
  acceptedVersion: string | null;
  needsReacceptance: boolean;
}

/**
 * Onay Raporu Tipi
 */
export interface ContractReport {
  total: number;
  accepted: number;
  pending: number;
  acceptances: ContractAcceptance[];
}

/**
 * Sözleşme Servisi
 * Sözleşme versiyonları ve onay işlemleri için API çağrıları
 */
export const contractService = {
  /**
   * Aktif sözleşme versiyonunu getirir
   * Public endpoint - Auth gerektirmez
   */
  getCurrentVersion: async (): Promise<ContractVersion> => {
    const response = await apiClient.get('/contract/current');
    return response.data.data;
  },

  /**
   * Acente için sözleşme durumunu kontrol eder
   */
  checkStatus: async (): Promise<ContractStatus> => {
    const response = await apiClient.get('/contract/status');
    return response.data.data;
  },

  /**
   * Sözleşmeyi onaylar
   */
  acceptContract: async (data: {
    checkbox1_accepted: boolean;
    checkbox2_accepted: boolean;
    scroll_completed: boolean;
  }): Promise<{ accepted_at: string; version: string }> => {
    const response = await apiClient.post('/contract/accept', data);
    return response.data.data;
  },

  /**
   * Acente onay geçmişini getirir
   */
  getHistory: async (agencyId?: string): Promise<ContractAcceptance[]> => {
    const url = agencyId ? `/contract/history/${agencyId}` : '/contract/history';
    const response = await apiClient.get(url);
    return response.data.data;
  },

  /**
   * Tüm sözleşme versiyonlarını getirir (Super Admin)
   */
  getAllVersions: async (): Promise<ContractVersion[]> => {
    const response = await apiClient.get('/contract/versions');
    return response.data.data;
  },

  /**
   * Yeni sözleşme versiyonu oluşturur (Super Admin)
   */
  createVersion: async (data: {
    version: string;
    title: string;
    content: string;
    summary?: string;
    change_notes?: string;
    is_active?: boolean;
  }): Promise<ContractVersion> => {
    const response = await apiClient.post('/contract/versions', data);
    return response.data.data;
  },

  /**
   * Sözleşme versiyonunu günceller (Super Admin)
   */
  updateVersion: async (
    id: string,
    data: {
      version?: string;
      title?: string;
      content?: string;
      summary?: string;
      change_notes?: string;
      is_active?: boolean;
    }
  ): Promise<ContractVersion> => {
    const response = await apiClient.put(`/contract/versions/${id}`, data);
    return response.data.data;
  },

  /**
   * Bir versiyonu aktif yapar (Super Admin)
   */
  activateVersion: async (id: string): Promise<ContractVersion> => {
    const response = await apiClient.post(`/contract/versions/${id}/activate`);
    return response.data.data;
  },

  /**
   * Onay raporunu getirir (Super Admin)
   */
  getReport: async (filters?: {
    start_date?: string;
    end_date?: string;
    version?: string;
  }): Promise<ContractReport> => {
    const params = new URLSearchParams();
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.version) params.append('version', filters.version);

    const response = await apiClient.get(`/contract/report?${params.toString()}`);
    return response.data.data;
  },

  /**
   * Sözleşmeyi PDF formatında getirir
   */
  getPdf: async (versionId?: string): Promise<{
    content: string;
    version: string;
    title: string;
  }> => {
    const url = versionId ? `/contract/pdf/${versionId}` : '/contract/pdf';
    const response = await apiClient.get(url);
    return response.data.data;
  },
};

