import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, Building2, Users, UserCircle, Car, Package, 
  ShoppingCart, CreditCard, MessageSquare, TrendingUp, GitBranch,
  Menu, X, Plus, Sun, Moon, LogOut, Settings, ChevronDown,
  MoreHorizontal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// Menu yapisi
const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: Building2, label: "Acenteler", path: "/dashboard/agencies", roles: [UserRole.SUPER_ADMIN] },
  { icon: GitBranch, label: "Subeler", path: "/dashboard/branches", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN] },
  { icon: UserCircle, label: "Kullanicilar", path: "/dashboard/users", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN] },
  { icon: Users, label: "Musteriler", path: "/dashboard/customers", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: Car, label: "Araclar", path: "/dashboard/vehicles", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: Package, label: "Paketler", path: "/dashboard/packages", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: ShoppingCart, label: "Satislar", path: "/dashboard/sales", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: CreditCard, label: "Odemeler", path: "/dashboard/payments", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
  { icon: TrendingUp, label: "Komisyonlar", path: "/dashboard/commissions", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN] },
  { icon: MessageSquare, label: "Destek", path: "/dashboard/support", roles: [UserRole.SUPER_ADMIN, UserRole.AGENCY_ADMIN, UserRole.BRANCH_ADMIN, UserRole.BRANCH_USER] },
]

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Kullanicinin gorebilecegi menuler
  const visibleMenuItems = menuItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  // Aktif sayfa kontrolu
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/dashboard/'
    }
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  // Rol badge rengi
  const getRoleColor = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'bg-purple-500'
      case UserRole.AGENCY_ADMIN: return 'bg-blue-500'
      case UserRole.BRANCH_ADMIN: return 'bg-green-500'
      default: return 'bg-orange-500'
    }
  }

  const getRoleLabel = (role?: UserRole) => {
    switch (role) {
      case UserRole.SUPER_ADMIN: return 'Super Admin'
      case UserRole.AGENCY_ADMIN: return 'Acente'
      case UserRole.BRANCH_ADMIN: return 'Sube'
      default: return 'Kullanici'
    }
  }
  
  return (
    <div className="min-h-screen bg-muted/30">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="h-16 px-4 flex items-center gap-4 max-w-[1600px] mx-auto">
          
          {/* Logo - Mavi renkte */}
          <Link to="/dashboard" className="flex-shrink-0 flex items-center gap-3">
            <div className="bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg">
            <img 
              src="/cozumasistanlog.svg" 
                alt="Cozum Yol Asistan Logo" 
              className="h-7 logo-primary"
            />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 ml-8">
            {visibleMenuItems.slice(0, 6).map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "relative px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    "hover:bg-accent",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                  </span>
                  {active && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              )
            })}

            {/* Daha fazla dropdown */}
            {visibleMenuItems.length > 6 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="hidden lg:inline">Diger</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  {visibleMenuItems.slice(6).map((item) => {
                    const Icon = item.icon
                    return (
                      <DropdownMenuItem 
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className={cn(isActive(item.path) && "bg-accent")}
                      >
                        <Icon className="h-4 w-4 mr-2" />
                        {item.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Sag Taraf */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Yeni Satis */}
            <Button 
              onClick={() => navigate('/dashboard/sales/new')}
              className="hidden sm:flex gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Yeni Satis</span>
            </Button>

            {/* Tema */}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Profil */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-accent transition-colors">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                      {user?.name?.[0]}{user?.surname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium leading-none">{user?.name}</span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded text-white mt-0.5", getRoleColor(user?.role))}>
                      {getRoleLabel(user?.role)}
                    </span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground hidden lg:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user?.name} {user?.surname}</span>
                    <span className="text-xs text-muted-foreground font-normal">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/profile')}>
                  <Settings className="h-4 w-4 mr-2" />
                  Profil Ayarlari
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cikis Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        </header>

      {/* ==================== MOBILE MENU (Minimal) ==================== */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          {/* Basit Header */}
          <div className="p-4 border-b">
            <SheetHeader className="text-left">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {user?.name?.[0]}{user?.surname?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <SheetTitle className="text-base truncate">
                    {user?.name} {user?.surname}
                  </SheetTitle>
                  <p className="text-xs text-muted-foreground">{getRoleLabel(user?.role)}</p>
                </div>
              </div>
            </SheetHeader>
          </div>

          {/* Yeni Satis Butonu */}
          <div className="p-3 border-b">
            <Button 
              className="w-full"
              onClick={() => { navigate('/dashboard/sales/new'); setMobileMenuOpen(false) }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Satis
            </Button>
          </div>

          {/* Menu Items - Basit Liste */}
          <div className="flex-1 overflow-y-auto py-2">
            <nav>
              {visibleMenuItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                      active 
                        ? "bg-primary/10 text-primary border-r-2 border-primary" 
                        : "text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Alt Kisim */}
          <div className="border-t p-3 space-y-2">
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 justify-start"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === 'dark' ? 'Acik' : 'Koyu'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-1 justify-start"
                onClick={() => { navigate('/dashboard/profile'); setMobileMenuOpen(false) }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Ayarlar
              </Button>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={() => { logout(); setMobileMenuOpen(false) }}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cikis Yap
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ==================== MAIN CONTENT ==================== */}
      <main>
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
