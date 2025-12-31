import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { userCustomerService, type UserCustomer, type RegisterUserCustomerData } from '../services/userCustomerService';

/**
 * UserCustomerContext
 * Bireysel kullanıcılar için auth context
 * Mevcut AuthContext'ten ayrı - admin/acente kullanıcıları ile karışmaması için
 */

// Context type tanımı
interface UserCustomerContextType {
  userCustomer: UserCustomer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterUserCustomerData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  updateProfile: (data: Partial<UserCustomer>) => Promise<void>;
}

// Context oluştur
const UserCustomerContext = createContext<UserCustomerContextType | undefined>(undefined);

// Hook
export const useUserCustomer = () => {
  const context = useContext(UserCustomerContext);
  if (!context) {
    throw new Error('useUserCustomer must be used within UserCustomerProvider');
  }
  return context;
};

// Provider props
interface UserCustomerProviderProps {
  children: ReactNode;
}

// Provider component
export const UserCustomerProvider: React.FC<UserCustomerProviderProps> = ({ children }) => {
  const [userCustomer, setUserCustomer] = useState<UserCustomer | null>(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde localStorage'dan kullanıcı bilgilerini al
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = userCustomerService.getStoredUser();
      if (storedUser && userCustomerService.isAuthenticated()) {
        try {
          // Profil bilgilerini API'den al
          const currentUser = await userCustomerService.getProfile();
          setUserCustomer(currentUser);
        } catch (error) {
          // Token geçersiz ise çıkış yap
          userCustomerService.logout();
          setUserCustomer(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Giriş yap
  const login = async (email: string, password: string) => {
    const response = await userCustomerService.login({ email, password });
    setUserCustomer(response.user);
  };

  // Kayıt ol
  const register = async (data: RegisterUserCustomerData) => {
    const response = await userCustomerService.register(data);
    setUserCustomer(response.user);
  };

  // Çıkış yap
  const logout = () => {
    userCustomerService.logout();
    setUserCustomer(null);
  };

  // Profil güncelle
  const updateProfile = async (data: Partial<UserCustomer>) => {
    const updatedUser = await userCustomerService.updateProfile(data);
    setUserCustomer(updatedUser);
  };

  const value: UserCustomerContextType = {
    userCustomer,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!userCustomer,
    updateProfile,
  };

  return (
    <UserCustomerContext.Provider value={value}>
      {children}
    </UserCustomerContext.Provider>
  );
};

