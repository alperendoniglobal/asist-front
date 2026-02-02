import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

/**
 * Socket Context Tipi
 * Socket.io bağlantısını yönetir
 */
interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

// Context oluştur
const SocketContext = createContext<SocketContextType | undefined>(undefined);

/**
 * Socket hook'u
 * Komponetlerde socket bağlantısına erişim sağlar
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: ReactNode;
}

/**
 * Socket Provider
 * Socket.io bağlantısını yönetir
 * Login olduğunda otomatik bağlanır, logout olduğunda disconnect olur
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  /**
   * Socket bağlantısını kur
   */
  const connect = () => {
    // Eğer zaten bağlıysa, bağlanma
    if (socketRef.current?.connected) {
      return;
    }

    // Token'ı al
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.warn('Socket connection: No access token found');
      return;
    }

    // API base URL'den socket URL'ini oluştur
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cozum.net/api/v1';
    // Socket URL'i API base URL'den türetilir (protocol ve host kısmı)
    // Production'da socket.io genellikle aynı domain'de çalışır
    let socketUrl = API_BASE_URL.replace('/api/v1', '').replace('/api', '');
    
    // Eğer URL boşsa veya sadece path ise, window.location'dan al
    if (!socketUrl || socketUrl.startsWith('/')) {
      socketUrl = window.location.origin;
    }

    console.log('Connecting to socket server:', socketUrl);

    // Socket.io client oluştur
    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      reconnectionDelayMax: 5000,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      // Production'da socket bağlantı hatalarını sessizce logla
      // Kullanıcıya gösterme, sadece console'da tut
      if (import.meta.env.DEV) {
        console.error('Socket connection error:', error);
      }
      setIsConnected(false);
    });

    newSocket.on('connected', (data) => {
      console.log('Socket authenticated:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    // Force disconnect event (yeni bağlantı aynı kullanıcıdan geldiğinde)
    newSocket.on('force-disconnect', (data) => {
      console.warn('Socket force disconnect:', data);
      newSocket.disconnect();
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  /**
   * Socket bağlantısını kes
   */
  const disconnect = () => {
    if (socketRef.current) {
      console.log('Disconnecting socket');
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  };

  /**
   * Kullanıcı login olduğunda socket bağlantısını kur
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      connect();
    } else {
      disconnect();
    }

    // Cleanup: Component unmount veya user değiştiğinde disconnect
    return () => {
      if (!isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated, user?.id]);

  /**
   * Token değiştiğinde socket'i yeniden bağla
   */
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('accessToken');
      if (!token && socketRef.current) {
        // Token silinmişse disconnect
        disconnect();
      } else if (token && isAuthenticated && !socketRef.current?.connected) {
        // Token varsa ve bağlı değilse connect
        connect();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

  // Context değeri
  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};
