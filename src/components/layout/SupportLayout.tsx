import { useState } from "react"
import { Outlet, Link, useNavigate } from "react-router-dom"
import { 
  ShoppingCart, LogOut, Menu, FileText, Sun, Moon, FilePlus, Files
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/contexts/ThemeContext"
import { useAuth } from "@/contexts/AuthContext"
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

/**
 * Destek Ekibi için özel layout
 * Sadece satış sorgulama ekranına erişim sağlar
 */
export function SupportLayout() {
  const navigate = useNavigate()
  const { theme, setTheme } = useTheme()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-muted/30">
      {/* ==================== HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="h-16 px-4 flex items-center gap-4 max-w-[1600px] mx-auto">
          
          {/* Logo */}
          <Link to="/dashboard/support" className="flex-shrink-0 flex items-center gap-3">
            <div className="bg-white dark:bg-white/10 px-3 py-1.5 rounded-lg">
              <img 
                src="/cozumasistanlog.svg" 
                alt="Çözüm Yol Asistan Logo" 
                className="h-10 logo-primary"
              />
            </div>
          </Link>

          {/* Menü - Mobil için hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Desktop Menü */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link to="/dashboard/support/sales">
              <Button
                variant="ghost"
                className="gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Satış Sorgulama
              </Button>
            </Link>
            <Link to="/dashboard/support/files">
              <Button
                variant="ghost"
                className="gap-2"
              >
                <Files className="h-4 w-4" />
                Dosyalar
              </Button>
            </Link>
            <Link to="/dashboard/support/files/create">
              <Button
                variant="ghost"
                className="gap-2"
              >
                <FilePlus className="h-4 w-4" />
                Dosya Oluştur
              </Button>
            </Link>
          </nav>

          {/* Sağ taraf - Kullanıcı menüsü */}
          <div className="ml-auto flex items-center gap-2">
            {/* Tema değiştirici */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Kullanıcı dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 h-auto py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name?.[0]}{user?.surname?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.name} {user?.surname}</div>
                    <div className="text-xs text-muted-foreground">Destek Ekibi</div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name} {user?.surname}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard/support/profile')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ==================== MOBİL MENÜ ==================== */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Menü</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-2 mt-6">
            <Link to="/dashboard/support/sales" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <ShoppingCart className="h-4 w-4" />
                Satış Sorgulama
              </Button>
            </Link>
            <Link to="/dashboard/support/files" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Files className="h-4 w-4" />
                Dosyalar
              </Button>
            </Link>
            <Link to="/dashboard/support/files/create" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <FilePlus className="h-4 w-4" />
                Dosya Oluştur
              </Button>
            </Link>
          </nav>
        </SheetContent>
      </Sheet>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="max-w-[1600px] mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  )
}

