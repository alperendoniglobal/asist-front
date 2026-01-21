import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { activeUsersService, type ActiveUser } from '@/services/activeUsersService';
import { UserRole } from '@/types';
import { Users, Wifi, WifiOff, Clock, Search, Building2, GitBranch } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Rol isimlerini Türkçe'ye çevir
 */
const getRoleName = (role: string): string => {
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: 'Süper Admin',
    SUPER_AGENCY_ADMIN: 'Süper Broker Yöneticisi',
    AGENCY_ADMIN: 'Broker Yöneticisi',
    BRANCH_ADMIN: 'Acente Yöneticisi',
    BRANCH_USER: 'Kullanıcı',
    SUPPORT: 'Destek',
    USER: 'Kullanıcı',
  };
  return roleMap[role] || role;
};

/**
 * Rol badge variant'ını belirle
 */
const getRoleBadgeVariant = (role: string): string => {
  const variantMap: Record<string, string> = {
    SUPER_ADMIN: 'destructive',
    SUPER_AGENCY_ADMIN: 'default',
    AGENCY_ADMIN: 'secondary',
    BRANCH_ADMIN: 'outline',
    BRANCH_USER: 'outline',
    SUPPORT: 'secondary',
    USER: 'outline',
  };
  return variantMap[role] || 'outline';
};

/**
 * Aktif Kullanıcılar Component'i
 * Dashboard'da gösterilecek aktif kullanıcılar listesi
 * Socket.io ile gerçek zamanlı güncellemeler yapılır
 * Kart formatında gösterilir
 */
export default function ActiveUsers() {
  const { socket, isConnected } = useSocket();
  const { user: currentUser } = useAuth();
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * İlk yüklemede aktif kullanıcıları getir (REST API'den)
   */
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        setLoading(true);
        const users = await activeUsersService.getAll();
        setActiveUsers(users);
      } catch (error) {
        console.error('Aktif kullanıcılar yüklenirken hata:', error);
      } finally {
        setLoading(false);
      }
    };

    // Sadece SUPER_ADMIN ve SUPER_AGENCY_ADMIN için aktif kullanıcıları getir
    if (
      currentUser &&
      (currentUser.role === UserRole.SUPER_ADMIN ||
        currentUser.role === UserRole.SUPER_AGENCY_ADMIN)
    ) {
      fetchActiveUsers();
    }
  }, [currentUser]);

  /**
   * Socket event listener'ları
   */
  useEffect(() => {
    if (!socket || !isConnected) {
      return;
    }

    // Aktif kullanıcıları iste
    socket.emit('get:active-users');

    // Aktif kullanıcılar listesi geldiğinde
    const handleActiveUsers = (users: ActiveUser[]) => {
      setActiveUsers(users);
    };

    // Kullanıcı online olduğunda
    const handleUserOnline = (data: { userId: string; user: ActiveUser }) => {
      setActiveUsers((prev) => {
        // Eğer kullanıcı zaten listede varsa güncelle, yoksa ekle
        const existingIndex = prev.findIndex((u) => u.id === data.userId);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...data.user,
            lastSeen: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              ...data.user,
              lastSeen: new Date().toISOString(),
            },
          ];
        }
      });
    };

    // Kullanıcı offline olduğunda
    const handleUserOffline = (data: { userId: string }) => {
      setActiveUsers((prev) => prev.filter((u) => u.id !== data.userId));
    };

    // Event listener'ları ekle
    socket.on('active-users', handleActiveUsers);
    socket.on('user:online', handleUserOnline);
    socket.on('user:offline', handleUserOffline);

    // Cleanup: Event listener'ları kaldır
    return () => {
      socket.off('active-users', handleActiveUsers);
      socket.off('user:online', handleUserOnline);
      socket.off('user:offline', handleUserOffline);
    };
  }, [socket, isConnected]);

  /**
   * Filtrelenmiş kullanıcılar
   * Kendi kullanıcısını listeden çıkarır
   */
  const filteredUsers = useMemo(() => {
    // Önce kendi kullanıcısını filtrele
    let users = activeUsers.filter((user) => user.id !== currentUser?.id);

    // Sonra arama sorgusu varsa filtrele
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      users = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.surname?.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          getRoleName(user.role).toLowerCase().includes(query) ||
          user.agency?.name?.toLowerCase().includes(query) ||
          user.branch?.name?.toLowerCase().includes(query)
      );
    }

    return users;
  }, [activeUsers, searchQuery, currentUser?.id]);

  // Sadece SUPER_ADMIN ve SUPER_AGENCY_ADMIN için göster
  if (
    !currentUser ||
    (currentUser.role !== UserRole.SUPER_ADMIN &&
      currentUser.role !== UserRole.SUPER_AGENCY_ADMIN)
  ) {
    return null;
  }

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex-shrink-0 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Aktif Kullanıcılar
            </CardTitle>
            <CardDescription>
              Şu anda sistemde aktif olan kullanıcılar
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="default" className="gap-1">
                <Wifi className="h-3 w-3" />
                Bağlı
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <WifiOff className="h-3 w-3" />
                Bağlantı Yok
              </Badge>
            )}
            <Badge variant="outline">{activeUsers.length} Aktif</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Arama/Filtre */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara (ad, email, rol, broker, acente)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Kullanıcı Listesi - Scroll alanı */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="relative w-8 h-8 mx-auto mb-2">
                  <div className="w-8 h-8 border-4 border-primary/20 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-sm text-muted-foreground">Yükleniyor...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'Arama kriterlerine uygun aktif kullanıcı bulunamadı'
                  : 'Şu anda aktif kullanıcı bulunmuyor'}
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '550px' }}>
              {filteredUsers.map((user) => (
              <Card
                key={user.id}
                className="relative overflow-hidden border-2 hover:border-primary/50 transition-colors"
                style={{ minHeight: '100px' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-sm font-semibold">
                        {user.name?.[0]}
                        {user.surname?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Kullanıcı Bilgileri */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm truncate">
                            {user.name} {user.surname}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        {/* Online Badge */}
                        <Badge
                          variant="default"
                          className="gap-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 flex-shrink-0"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Online
                        </Badge>
                      </div>

                      {/* Rol */}
                      <div className="mb-2">
                        <Badge variant={getRoleBadgeVariant(user.role) as any} className="text-xs">
                          {getRoleName(user.role)}
                        </Badge>
                      </div>

                      {/* Broker/Acente */}
                      {(user.agency || user.branch) && (
                        <div className="space-y-1 mb-2">
                          {user.agency && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">{user.agency.name}</span>
                            </div>
                          )}
                          {user.branch && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <GitBranch className="h-3 w-3" />
                              <span className="truncate">{user.branch.name}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Son Aktiflik */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(user.lastSeen), {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
