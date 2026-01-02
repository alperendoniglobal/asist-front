import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { authService, type RegisterData } from '../services/authService';
import { contractService, type ContractStatus } from '../services/contractService';

/**
 * Auth Context Tipi
 * Kullanıcı kimlik doğrulama ve sözleşme durumu bilgilerini içerir
 */
interface AuthContextType {
  // Kullanıcı bilgileri
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  
  // Sözleşme durumu
  contractStatus: ContractStatus | null;
  contractLoading: boolean;
  needsContractAcceptance: boolean;
  
  // Auth işlemleri
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshContractStatus: () => Promise<void>;
}

// Context oluştur
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth hook'u
 * Komponetlerde kullanıcı ve sözleşme durumuna erişim sağlar
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider
 * Kullanıcı oturumu ve sözleşme durumunu yönetir
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // User state
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Contract state
  const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
  const [contractLoading, setContractLoading] = useState(false);

  /**
   * Sözleşme durumunu kontrol eder
   */
  const refreshContractStatus = useCallback(async () => {
    // Super admin için kontrol yapma
    if (user?.role === 'SUPER_ADMIN') {
      setContractStatus({
        accepted: true,
        currentVersion: null,
        acceptedVersion: null,
        needsReacceptance: false,
      });
      return;
    }

    // Kullanıcı yoksa kontrol yapma
    if (!user?.agency_id) {
      setContractStatus(null);
      return;
    }

    try {
      setContractLoading(true);
      const status = await contractService.checkStatus();
      setContractStatus(status);
    } catch (error) {
      console.error('Sözleşme durumu kontrol edilemedi:', error);
      // Hata durumunda varsayılan olarak kabul edilmemiş say
      setContractStatus({
        accepted: false,
        currentVersion: null,
        acceptedVersion: null,
        needsReacceptance: true,
      });
    } finally {
      setContractLoading(false);
    }
  }, [user?.role, user?.agency_id]);

  /**
   * Kullanıcı bilgilerini yeniler
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Kullanıcı bilgisi yenilenemedi:', error);
    }
  }, []);

  /**
   * İlk yüklemede kullanıcı bilgilerini al
   */
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = authService.getStoredUser();
      if (storedUser && authService.isAuthenticated()) {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          authService.logout();
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Kullanıcı değiştiğinde sözleşme durumunu kontrol et
   */
  useEffect(() => {
    if (user) {
      refreshContractStatus();
    } else {
      setContractStatus(null);
    }
  }, [user, refreshContractStatus]);

  /**
   * Giriş işlemi
   */
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    setUser(response.user);
  };

  /**
   * Kayıt işlemi
   */
  const register = async (data: RegisterData) => {
    const response = await authService.register(data);
    setUser(response.user);
  };

  /**
   * Çıkış işlemi
   */
  const logout = () => {
    authService.logout();
    setUser(null);
    setContractStatus(null);
  };

  /**
   * Sözleşme kabulü gerekiyor mu?
   * - Super admin için her zaman false
   * - Sözleşme kabul edilmemişse veya versiyon değişmişse true
   */
  const needsContractAcceptance = Boolean(
    user && 
    user.role !== 'SUPER_ADMIN' && 
    user.agency_id && 
    contractStatus && 
    (!contractStatus.accepted || contractStatus.needsReacceptance)
  );

  // Context değeri
  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    contractStatus,
    contractLoading,
    needsContractAcceptance,
    login,
    register,
    logout,
    refreshUser,
    refreshContractStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
