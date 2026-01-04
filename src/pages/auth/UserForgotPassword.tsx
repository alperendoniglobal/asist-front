import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { userCustomerService } from '@/services/userCustomerService';
import { toast } from 'sonner';

/**
 * User Forgot Password Page - Bireysel kullanıcılar için (UserCustomer)
 * Telefon numarası ile şifre sıfırlama
 */
export default function UserForgotPassword() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await userCustomerService.forgotPassword(phone);
      setSuccess(true);
      toast.success('Şifre sıfırlama bilgileri gönderildi');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex public-page light" style={{ colorScheme: 'light' }}>
      <div className="flex-1 flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-green-50 to-white">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center">
                <Phone className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Şifremi Unuttum</CardTitle>
            <CardDescription className="text-gray-600">
              Telefon numaranızı girerek yeni şifrenizi SMS ile alabilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Şifre sıfırlama bilgileri telefon numaranıza SMS olarak gönderildi. 
                    Lütfen SMS'inizi kontrol edin ve yeni şifrenizle giriş yapın.
                  </AlertDescription>
                </Alert>
                <Button
                  onClick={() => navigate('/login')}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                >
                  Giriş Sayfasına Dön
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Telefon Numarası
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="h-11"
                  />
                  <p className="text-xs text-gray-500">
                    Kayıtlı telefon numaranızı girin (0 ile başlamadan)
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={loading || !phone}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 h-11"
                >
                  {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Kodu Gönder'}
                </Button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Giriş sayfasına dön
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

