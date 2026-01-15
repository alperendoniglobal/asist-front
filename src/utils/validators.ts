/**
 * TC Kimlik Numarası Validasyon Fonksiyonu
 * Türkiye Cumhuriyeti TC Kimlik Numarası algoritmasına göre doğrulama yapar
 */

/**
 * TC Kimlik Numarası validasyonu
 * @param tckn - TC Kimlik Numarası (string veya number)
 * @returns true eğer geçerli bir TC kimlik numarası ise
 */
/**
 * Türkiye IBAN formatını kontrol eder
 * Format: TR + 2 haneli kontrol + 4 haneli banka kodu + 1 rezerv + 16 haneli hesap = 26 karakter
 */
export function formatIBAN(value: string): string {
  // Sadece harf ve rakamları al, boşlukları kaldır
  let cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
  
  // TR ile başlamıyorsa ekle
  if (!cleaned.startsWith('TR')) {
    cleaned = 'TR' + cleaned.replace(/^TR/i, '');
  }
  
  // Maksimum 26 karakter (TR dahil)
  cleaned = cleaned.substring(0, 26);
  
  // Formatla: TR00 0000 0000 0000 0000 0000 00
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  const parts = [];
  parts.push(cleaned.substring(0, 2)); // TR
  if (cleaned.length > 2) {
    parts.push(cleaned.substring(2, 4)); // Kontrol rakamları
  }
  if (cleaned.length > 4) {
    parts.push(cleaned.substring(4, 8)); // Banka kodu
  }
  if (cleaned.length > 8) {
    parts.push(cleaned.substring(8, 12)); // İlk 4 hesap hanesi
  }
  if (cleaned.length > 12) {
    parts.push(cleaned.substring(12, 16)); // İkinci 4 hesap hanesi
  }
  if (cleaned.length > 16) {
    parts.push(cleaned.substring(16, 20)); // Üçüncü 4 hesap hanesi
  }
  if (cleaned.length > 20) {
    parts.push(cleaned.substring(20, 24)); // Dördüncü 4 hesap hanesi
  }
  if (cleaned.length > 24) {
    parts.push(cleaned.substring(24, 26)); // Son 2 hesap hanesi
  }
  
  return parts.join(' ');
}

/**
 * Türkiye IBAN formatını doğrular
 * Format: TR + 2 kontrol + 5 banka kodu + 1 rezerv + 16 hesap = 26 karakter
 * Veya: TR + 2 kontrol + 4 banka kodu + 1 rezerv + 17 hesap = 26 karakter
 */
export function validateIBAN(iban: string): boolean {
  if (!iban || iban.trim().length === 0) {
    return false;
  }
  
  // Boşlukları kaldır
  const cleaned = iban.replace(/\s/g, '').toUpperCase();
  
  // TR ile başlamalı
  if (!cleaned.startsWith('TR')) {
    return false;
  }
  
  // Toplam 26 karakter olmalı
  if (cleaned.length !== 26) {
    return false;
  }
  
  // Sadece harf ve rakam içermeli
  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    return false;
  }
  
  // TR'den sonraki kısım sadece rakam olmalı (24 karakter)
  const numericPart = cleaned.substring(2);
  if (!/^\d{24}$/.test(numericPart)) {
    return false;
  }
  
  return true;
}

export function validateTCKN(tckn: string | number): boolean {
  // String'e çevir
  const tcknStr = String(tckn).trim();
  
  // 1. 11 haneli olmalı ve sadece rakamlardan oluşmalı
  if (!/^\d{11}$/.test(tcknStr)) {
    return false;
  }
  
  // 2. İlk hane 0 olamaz
  if (tcknStr[0] === '0') {
    return false;
  }
  
  // Rakamları sayısal değerlere çevir
  const digits = tcknStr.split('').map(Number);
  
  // 3. 10. hane kontrolü
  // 1., 3., 5., 7. ve 9. hanelerin toplamı
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  
  // 2., 4., 6. ve 8. hanelerin toplamı
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  // 10. haneyi kontrol et: (tek haneler toplamı * 7 - çift haneler toplamı) % 10
  const tenthDigit = ((oddSum * 7) - evenSum) % 10;
  // Negatif sonuç için düzeltme
  const calculatedTenth = tenthDigit < 0 ? tenthDigit + 10 : tenthDigit;
  
  if (calculatedTenth !== digits[9]) {
    return false;
  }
  
  // 4. 11. hane kontrolü
  // İlk 10 hanenin toplamının 10'a bölümünden kalan
  const totalSum = digits.slice(0, 10).reduce((acc, val) => acc + val, 0);
  const eleventhDigit = totalSum % 10;
  
  if (eleventhDigit !== digits[10]) {
    return false;
  }
  
  return true;
}

/**
 * Vergi Kimlik Numarası (VKN) validasyonu
 * Sadece format kontrolü yapar: 10 haneli ve ilk hane 0 olamaz
 * 
 * @param vkn - Vergi Kimlik Numarası (string veya number)
 * @returns true eğer format olarak geçerli bir VKN ise
 */
export function validateVKN(vkn: string | number): boolean {
  const vknStr = String(vkn).trim();
  
  // 10 haneli olmalı ve sadece rakamlardan oluşmalı
  if (!/^\d{10}$/.test(vknStr)) {
    return false;
  }
  
  // İlk hane 0 olamaz
  if (vknStr[0] === '0') {
    return false;
  }
  
  return true;
}

/**
 * Şifre gücü kontrolü sonuçları
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * Güçlü şifre validasyonu
 * Şifre kuralları:
 * - En az 8 karakter
 * - En az bir büyük harf (A-Z)
 * - En az bir küçük harf (a-z)
 * - En az bir rakam (0-9)
 * - En az bir özel karakter (!@#$%^&*()_+-=[]{}|;:,.<>?)
 * 
 * @param password - Kontrol edilecek şifre
 * @returns Şifre validasyon sonucu
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  
  if (!password || password.length === 0) {
    return {
      isValid: false,
      errors: ['Şifre boş olamaz'],
      strength: 'weak'
    };
  }

  // En az 8 karakter
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır');
  }

  // En az bir büyük harf
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir (A-Z)');
  }

  // En az bir küçük harf
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir (a-z)');
  }

  // En az bir rakam
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir (0-9)');
  }

  // En az bir özel karakter
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push('Şifre en az bir özel karakter içermelidir (!@#$%^&*()_+-=[]{}|;:,.<>?)');
  }

  // Şifre gücü hesaplama
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (errors.length === 0) {
    // Tüm kurallar sağlanıyorsa gücü hesapla
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password);
    const length = password.length;
    
    let score = 0;
    if (hasUpper) score++;
    if (hasLower) score++;
    if (hasNumber) score++;
    if (hasSpecial) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    
    if (score >= 5) {
      strength = 'strong';
    } else if (score >= 3) {
      strength = 'medium';
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

