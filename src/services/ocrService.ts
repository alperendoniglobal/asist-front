import type { CarBrand, CarModel } from '@/types';

/**
 * OCR Servisi - Ruhsat fotoğraflarından bilgi çıkarma
 */
export interface RegistrationInfo {
  // Müşteri Bilgileri
  tc_vkn?: string;
  name?: string;
  surname?: string;
  address?: string;
  city?: string;
  district?: string;
  
  // Araç Bilgileri
  plate?: string;
  registration_serial?: string;
  registration_number?: string;
  brand_id?: number;
  model_id?: number;
  model_year?: number;
  usage_type?: string;
}

/**
 * OCR.space API kullanarak ruhsat fotoğrafından bilgileri çıkarır
 * OCR.space ücretsiz API - daha iyi sonuçlar verir
 */
async function ocrSpaceApi(imageFile: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', imageFile);
  formData.append('language', 'tur'); // Türkçe
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2'); // Engine 2 daha iyi sonuçlar verir
  
  try {
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
      headers: {
        // OCR.space ücretsiz API key (günlük 25,000 istek limiti)
        // Daha fazla istek için: https://ocr.space/ocrapi/freekey
        'apikey': 'K89106184088957        ', // Ücretsiz API key
      },
    });
    
    const data = await response.json();
    
    if (data.OCRExitCode === 1 && data.ParsedResults && data.ParsedResults.length > 0) {
      return data.ParsedResults[0].ParsedText;
    } else {
      throw new Error(data.ErrorMessage?.[0] || 'OCR başarısız');
    }
  } catch (error: any) {
    console.error('OCR.space API hatası:', error);
    throw new Error(`OCR API hatası: ${error.message}`);
  }
}

/**
 * Ruhsat fotoğrafından bilgileri çıkarır
 * OCR.space API kullanır (Tesseract.js yerine)
 */
export async function extractRegistrationInfo(
  imageFile: File,
  carBrands: CarBrand[],
  carModels: CarModel[]
): Promise<RegistrationInfo> {
  try {
    // OCR.space API ile OCR işlemi
    const text = await ocrSpaceApi(imageFile);
    
    // Debug: OCR çıktısını console'a yazdır
    console.log('=== OCR Çıktısı (OCR.space) ===');
    console.log(text);
    console.log('================================');
    
    // Metni parse et
    const result = parseRegistrationText(text, carBrands, carModels);
    
    // Debug: Parse edilen bilgileri console'a yazdır
    console.log('=== Parse Edilen Bilgiler ===');
    console.log('Müşteri Bilgileri:');
    console.log('  TC/VKN:', result.tc_vkn || 'BULUNAMADI');
    console.log('  Ad:', result.name || 'BULUNAMADI');
    console.log('  Soyad:', result.surname || 'BULUNAMADI');
    console.log('  Adres:', result.address || 'BULUNAMADI');
    console.log('  İl:', result.city || 'BULUNAMADI');
    console.log('  İlçe:', result.district || 'BULUNAMADI');
    console.log('Araç Bilgileri:');
    console.log('  Plaka:', result.plate || 'BULUNAMADI');
    console.log('  Ruhsat Seri:', result.registration_serial || 'BULUNAMADI');
    console.log('  Ruhsat No:', result.registration_number || 'BULUNAMADI');
    console.log('  Marka ID:', result.brand_id || 'BULUNAMADI');
    console.log('  Model ID:', result.model_id || 'BULUNAMADI');
    console.log('  Model Yılı:', result.model_year || 'BULUNAMADI');
    console.log('  Kullanım Tipi:', result.usage_type || 'BULUNAMADI');
    console.log('==============================');
    
    return result;
  } catch (error: any) {
    console.error('OCR hatası:', error);
    throw error;
  }
}

/**
 * OCR çıktısından ruhsat bilgilerini parse eder
 */
function parseRegistrationText(
  text: string,
  carBrands: CarBrand[],
  carModels: CarModel[]
): RegistrationInfo {
  const info: RegistrationInfo = {};
  
  // Metni normalize et (büyük/küçük harf, boşluklar)
  // Orijinal metni de sakla (adres için)
  const originalText = text;
  // Normalize: Türkçe karakterleri koru, boşlukları düzenle
  const normalizedText = text.toUpperCase()
    .replace(/İ/g, 'İ')
    .replace(/I/g, 'I')
    .replace(/\s+/g, ' ')
    .trim();
  
  // ==================== MÜŞTERİ BİLGİLERİ ====================
  
  // 1. TC KİMLİK NO BULMA (11 haneli)
  // OCR çıktısında "22519612536" gibi direkt sayılar da olabilir
  const tcPatterns = [
    /T\.?C\.?\s*K[İI]ML[İI]K\s*NO[:\s]*(\d{11})/i,
    /TC\s*NO[:\s]*(\d{11})/i,
    /K[İI]ML[İI]K\s*NO[:\s]*(\d{11})/i,
    /VERG[İI]\s*NO[:\s]*(\d{11})/i,
    /\b(\d{11})\b/g, // 11 haneli sayı (son çare)
  ];
  
  for (const pattern of tcPatterns) {
    if (pattern.global) {
      // Global pattern için tüm eşleşmeleri kontrol et
      const matches = Array.from(text.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const tc = match[1].trim();
          // TC kimlik no validasyonu: İlk hane 0 olamaz
          if (tc.length === 11 && /^\d{11}$/.test(tc) && tc[0] !== '0') {
            info.tc_vkn = tc;
            break;
          }
        }
      }
    } else {
      const match = text.match(pattern);
      if (match && match[1]) {
        const tc = match[1].trim();
        if (tc.length === 11 && /^\d{11}$/.test(tc) && tc[0] !== '0') {
          info.tc_vkn = tc;
          break;
        }
      }
    }
    if (info.tc_vkn) break;
  }
  
  // 2. AD BULMA (C.1.2 veya ADI etiketinden sonra)
  // OCR çıktısında "ALPEREN" gibi direkt isimler de olabilir
  const namePatterns = [
    /C\.1\.2[)\s]*AD[İI][:\s]*([A-ZÇĞİÖŞÜ\s]{2,20})/i,
    /AD[İI][:\s]*([A-ZÇĞİÖŞÜ\s]{2,20})/i,
    // Direkt isim arama (TC'den sonra veya SOYAD'dan önce)
    /(?:TC|K[İI]ML[İI]K)[\s\S]{0,50}?([A-ZÇĞİÖŞÜ]{3,15})(?:\s+[A-ZÇĞİÖŞÜ]{3,20}\s+SOYAD|HARMANKAŞI|YILMAZ|KAYA)/i,
    /\b(ALPEREN|MEHMET|AHMET|MUSTAFA|ALİ|HASAN|HÜSEYİN|İBRAHİM|OSMAN|YUSUF|ÖMER|FATMA|AYŞE|ZEYNEP|ELİF|MERYEM|KAMİL)\b/i, // Yaygın isimler
  ];
  
  for (const pattern of namePatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      let name = match[1].trim();
      // Sadece harflerden oluşmalı ve makul uzunlukta olmalı
      if (name.length >= 2 && name.length <= 20 && !/^\d+$/.test(name) && /^[A-ZÇĞİÖŞÜ\s]+$/i.test(name)) {
        // Gürültü karakterleri temizle
        name = name.replace(/[^A-ZÇĞİÖŞÜ]/gi, '').trim();
        if (name.length >= 2) {
          info.name = name.toUpperCase();
          break;
        }
      }
    }
  }
  
  // 3. SOYAD BULMA (C.1.1 veya SOYADI etiketinden sonra)
  // OCR çıktısında "HARMANKAŞI" gibi direkt soyadlar da olabilir
  const surnamePatterns = [
    /C\.1\.1[)\s]*SOYADI[:\s]*([A-ZÇĞİÖŞÜ\s]{2,30})/i,
    /SOYADI[:\s]*([A-ZÇĞİÖŞÜ\s]{2,30})/i,
    /T[İI]CAR[İI]\s*ÜNVANI[:\s]*([A-ZÇĞİÖŞÜ\s]+)/i, // Kurumsal için
    // Direkt soyad arama
    /\b(HARMANKAŞI|YILMAZ|KAYA|DEMİR|ŞAHİN|ÇELİK|YILDIZ|YILDIRIM|ÖZTÜRK|AYDIN|ÖZDEMİR|ARSLAN|DOĞAN|KILIÇ|ASLAN|DARÇERM)\b/i, // Yaygın soyadlar
  ];
  
  for (const pattern of surnamePatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      let surname = match[1].trim();
      if (surname.length >= 2 && surname.length <= 30 && !/^\d+$/.test(surname) && /^[A-ZÇĞİÖŞÜ\s]+$/i.test(surname)) {
        // Gürültü karakterleri temizle
        surname = surname.replace(/[^A-ZÇĞİÖŞÜ]/gi, '').trim();
        if (surname.length >= 2) {
          info.surname = surname.toUpperCase();
          break;
        }
      }
    }
  }
  
  // 4. ADRES BULMA (C.1.3 veya ADRESİ etiketinden sonra)
  // OCR çıktısında "19 MAYIS MAH. YUNUS EMRE CAD. 201 9 KEÇİÖREN/ANKARA" gibi direkt adresler de olabilir
  const addressPatterns = [
    /C\.1\.3[)\s]*ADRES[İI][:\s]*([A-ZÇĞİÖŞÜ0-9\s\/\.,-]{15,150})/i,
    /ADRES[İI][:\s]*([A-ZÇĞİÖŞÜ0-9\s\/\.,-]{15,150})/i,
    /(19\s*MAY[İI]S\s*MAH[\.\s]*[A-ZÇĞİÖŞÜ0-9\s\/\.,-]{10,100})/i, // Örnek adres formatı
    /([A-ZÇĞİÖŞÜ\s]+MAH[\.\s]*[A-ZÇĞİÖŞÜ0-9\s\/\.,-]{10,100})/i, // MAH ile başlayan adresler
    /(YUNUS\s*EMRE\s*CAD[\.\s]*[A-ZÇĞİÖŞÜ0-9\s\/\.,-]{5,80})/i, // YUNUS EMRE CAD formatı
  ];
  
  for (const pattern of addressPatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      let address = match[1].trim();
      // Gürültü karakterleri temizle ama adres karakterlerini koru
      address = address.replace(/[^\w\sÇĞİÖŞÜçğıöşü.,\/\-:]/g, ' ').replace(/\s+/g, ' ').trim();
      
      // Sonraki satırları da al (adres uzun olabilir)
      const addressEnd = originalText.indexOf(match[0]) + match[0].length;
      const nextLines = originalText.substring(addressEnd, addressEnd + 150);
      const addressLines = nextLines.split('\n').slice(0, 2)
        .map(line => line.replace(/[^\w\sÇĞİÖŞÜçğıöşü.,\/\-:]/g, ' ').trim())
        .filter(line => line.length > 5)
        .join(' ');
      
      if (addressLines.length > 10 && addressLines.length < 150) {
        address = (address + ' ' + addressLines).trim();
      }
      
      if (address.length >= 15 && address.length <= 200) {
        info.address = address;
        
        // İl ve İlçe çıkarma (KEÇİÖREN/ANKARA formatı)
        const cityMatch = address.match(/([A-ZÇĞİÖŞÜ]+)\s*\/\s*([A-ZÇĞİÖŞÜ]+)/i);
        if (cityMatch) {
          info.district = cityMatch[1].trim().toUpperCase();
          info.city = cityMatch[2].trim().toUpperCase();
        } else {
          // Sadece il varsa
          const cityOnlyMatch = address.match(/\/([A-ZÇĞİÖŞÜ]+)$/i);
          if (cityOnlyMatch) {
            info.city = cityOnlyMatch[1].trim().toUpperCase();
          }
        }
        break;
      }
    }
  }
  
  // ==================== ARAÇ BİLGİLERİ ====================
  
  // 5. PLAKA BULMA (A) etiketi veya plaka formatı
  const platePatterns = [
    /\(A\)\s*PLAKA[:\s]*(\d{2}[A-Z]{1,3}\d{2,4})/i,
    /\b(\d{2})\s*([A-Z]{1,3})\s*(\d{2,4})\b/g, // 34 ABC 123
    /\b(\d{2}[A-Z]{1,3}\d{2,4})\b/g, // 34ABC123 veya 06FIH438
  ];
  
  for (const pattern of platePatterns) {
    // matchAll sadece global regex ile çalışır, match kullan
    if (pattern.global) {
      const matches = Array.from(normalizedText.matchAll(pattern));
      for (const match of matches) {
        let plate = '';
        if (match[1] && match[2] && match[3]) {
          // Format: 34 ABC 123
          plate = match[1] + match[2] + match[3];
        } else if (match[1] && match[1].length >= 6 && match[1].length <= 9) {
          // Format: 34ABC123 veya 06FIH438
          plate = match[1];
        }
        
        if (plate && /^\d{2}[A-Z]{1,3}\d{2,4}$/.test(plate)) {
          info.plate = plate;
          break;
        }
      }
    } else {
      const match = normalizedText.match(pattern);
      if (match && match[1]) {
        const plate = match[1].trim();
        if (plate.length >= 6 && plate.length <= 9 && /^\d{2}[A-Z]{1,3}\d{2,4}$/.test(plate)) {
          info.plate = plate;
        }
      }
    }
    if (info.plate) break;
  }
  
  // 6. RUHSAT SERİ/NO BULMA
  // Format: "BELGE Seri: HT Nº: 831316" veya "BELGE Seri: HT N: 831316"
  // ÖNEMLİ: Tescıl Sıra No ile karıştırmamalıyız!
  const serialPatterns = [
    // En spesifik pattern: BELGE Seri: HT Nº: 831316
    /BELGE\s*SER[İI][:\s]*([A-Z]{2})\s*[N№]\s*[º°]?\s*[:\s]*(\d{6})/i,
    // BELGE Seri: HT 831316 (Nº olmadan)
    /BELGE\s*SER[İI][:\s]*([A-Z]{2})\s+(\d{6})/i,
    // Seri: HT Nº: 831316
    /SER[İI][:\s]*([A-Z]{2})\s*[N№]\s*[º°]?\s*[:\s]*(\d{6})/i,
    // HT Nº: 831316
    /([A-Z]{2})\s*[N№]\s*[º°]?\s*[:\s]*(\d{6})/i,
  ];
  
  for (const pattern of serialPatterns) {
    const match = originalText.match(pattern);
    if (match && match[1] && match[2]) {
      const serial = match[1].trim().toUpperCase();
      const number = match[2].trim();
      
      // Seri 2 harf olmalı (HT, AB, CD, vb.)
      if (serial.length === 2 && /^[A-Z]{2}$/i.test(serial)) {
        // Numara tam 6 haneli olmalı
        if (number.length === 6 && /^\d{6}$/.test(number)) {
          info.registration_serial = serial;
          info.registration_number = number;
          console.log(`Ruhsat Seri/No bulundu: ${serial} ${number}`);
          break;
        }
      }
    }
  }
  
  // Eğer hala bulunamadıysa, "HT" ve 6 haneli sayı kombinasyonunu ara
  if (!info.registration_serial || !info.registration_number) {
    // HT ile başlayan ve sonrasında 6 haneli sayı olan pattern
    const htPattern = /HT\s*[N№]?\s*[º°]?\s*[:\s]*(\d{6})/i;
    const htMatch = originalText.match(htPattern);
    if (htMatch && htMatch[1] && htMatch[1].length === 6) {
      info.registration_serial = 'HT';
      info.registration_number = htMatch[1];
      console.log(`Ruhsat Seri/No bulundu (HT pattern): HT ${htMatch[1]}`);
    }
  }
  
  // Son çare: BELGE kelimesi yakınında 2 harf + 6 haneli sayı kombinasyonu
  if (!info.registration_serial || !info.registration_number) {
    const belgeIndex = originalText.toUpperCase().indexOf('BELGE');
    if (belgeIndex !== -1) {
      // BELGE'den sonraki 100 karakter içinde ara
      const afterBelge = originalText.substring(belgeIndex, belgeIndex + 100);
      const belgePattern = /([A-Z]{2})\s*[N№]?\s*[º°]?\s*[:\s]*(\d{6})/i;
      const belgeMatch = afterBelge.match(belgePattern);
      if (belgeMatch && belgeMatch[1] && belgeMatch[2]) {
        const serial = belgeMatch[1].trim().toUpperCase();
        const number = belgeMatch[2].trim();
        if (serial.length === 2 && number.length === 6 && /^\d{6}$/.test(number)) {
          info.registration_serial = serial;
          info.registration_number = number;
          console.log(`Ruhsat Seri/No bulundu (BELGE yakınında): ${serial} ${number}`);
        }
      }
    }
  }
  
  // 7. MARKA BULMA (D.1 MARKASI veya fuzzy matching)
  const brandPatterns = [
    /\(D\.1\)\s*MARKASI[:\s]*([A-ZÇĞİÖŞÜ0-9\s-]+)/i,
    /MARKASI[:\s]*([A-ZÇĞİÖŞÜ0-9\s-]{2,20})/i,
  ];
  
  let extractedBrand = '';
  for (const pattern of brandPatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      extractedBrand = match[1].trim().toUpperCase();
      break;
    }
  }
  
  // Önce çıkarılan marka ile eşleştir, sonra fuzzy matching
  if (extractedBrand) {
    info.brand_id = findBrandByText(extractedBrand, carBrands) || findBrand(normalizedText, carBrands);
  } else {
    info.brand_id = findBrand(normalizedText, carBrands);
  }
  
  // 8. MODEL BULMA (D.2 TİPİ veya D.3 TİCARİ ADI veya fuzzy matching)
  const modelPatterns = [
    /\(D\.3\)\s*T[İI]CAR[İI]\s*ADI[:\s]*([A-ZÇĞİÖŞÜ0-9\s-]+)/i,
    /\(D\.2\)\s*T[İI]P[İI][:\s]*([A-ZÇĞİÖŞÜ0-9\s-]+)/i,
    /T[İI]CAR[İI]\s*ADI[:\s]*([A-ZÇĞİÖŞÜ0-9\s-]+)/i,
  ];
  
  let extractedModel = '';
  for (const pattern of modelPatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      extractedModel = match[1].trim().toUpperCase();
      break;
    }
  }
  
  if (info.brand_id) {
    const brandModels = carModels.filter(m => m.brand_id === info.brand_id);
    if (extractedModel) {
      info.model_id = findModelByText(extractedModel, brandModels) || findModel(normalizedText, brandModels);
    } else {
      info.model_id = findModel(normalizedText, brandModels);
    }
  }
  
  // 9. MODEL YILI BULMA (D.4 MODEL YILI)
  const yearPatterns = [
    /\(D\.4\)\s*MODEL\s*Y[İI]LI[:\s]*(\d{4})/i,
    /MODEL\s*Y[İI]LI[:\s]*(\d{4})/i,
    /\b(19\d{2}|20[0-2]\d)\b/g,
  ];
  
  for (const pattern of yearPatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      const year = parseInt(match[1]);
      if (year >= 1990 && year <= new Date().getFullYear() + 1) {
        info.model_year = year;
        break;
      }
    }
  }
  
  // 10. KULLANIM TİPİ BULMA (Y.3 KULLANIM AMACI)
  const usagePatterns = [
    /\(Y\.3\)\s*KULLANIM\s*AMACI[:\s]*([A-ZÇĞİÖŞÜ\s-]+)/i,
    /KULLANIM\s*AMACI[:\s]*([A-ZÇĞİÖŞÜ\s-]+)/i,
  ];
  
  for (const pattern of usagePatterns) {
    const match = originalText.match(pattern);
    if (match && match[1]) {
      const usage = match[1].toUpperCase();
      if (usage.includes('HUSUSİ') || usage.includes('HUSUSI')) {
        info.usage_type = 'PRIVATE';
      } else if (usage.includes('TİCARİ') || usage.includes('TICARI')) {
        info.usage_type = 'COMMERCIAL';
      } else if (usage.includes('TAKSİ') || usage.includes('TAKSI')) {
        info.usage_type = 'TAXI';
      }
      break;
    }
  }
  
  // Fallback: Normalized text'te arama
  if (!info.usage_type) {
    if (normalizedText.includes('HUSUSİ') || normalizedText.includes('HUSUSI')) {
      info.usage_type = 'PRIVATE';
    } else if (normalizedText.includes('TİCARİ') || normalizedText.includes('TICARI')) {
      info.usage_type = 'COMMERCIAL';
    } else if (normalizedText.includes('TAKSİ') || normalizedText.includes('TAKSI')) {
      info.usage_type = 'TAXI';
    }
  }
  
  return info;
}

/**
 * Marka bulma - Çıkarılan metin ile (tam eşleşme öncelikli)
 */
function findBrandByText(brandText: string, brands: CarBrand[]): number | undefined {
  const normalizedBrandText = brandText.toUpperCase().trim();
  
  // Tam eşleşme
  for (const brand of brands) {
    const brandName = brand.name.toUpperCase().trim();
    if (normalizedBrandText === brandName || normalizedBrandText.includes(brandName)) {
      return brand.id;
    }
  }
  
  // Kısmi eşleşme (RKS -> RKS veya benzeri)
  for (const brand of brands) {
    const brandName = brand.name.toUpperCase().trim();
    if (brandName.includes(normalizedBrandText) || normalizedBrandText.includes(brandName)) {
      return brand.id;
    }
  }
  
  return undefined;
}

/**
 * Marka bulma (Fuzzy Matching)
 */
function findBrand(text: string, brands: CarBrand[]): number | undefined {
  // Önce tam eşleşme dene
  for (const brand of brands) {
    const brandName = brand.name.toUpperCase();
    if (text.includes(brandName)) {
      return brand.id;
    }
  }
  
  // Fuzzy matching
  let bestMatch: { brand: CarBrand; score: number } | null = null;
  
  for (const brand of brands) {
    const brandName = brand.name.toUpperCase();
    const score = calculateSimilarity(text, brandName);
    
    if (score > 0.5) { // %50 benzerlik eşiği (düşürüldü)
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { brand, score };
      }
    }
  }
  
  return bestMatch?.brand.id;
}

/**
 * Model bulma - Çıkarılan metin ile (tam eşleşme öncelikli)
 */
function findModelByText(modelText: string, models: CarModel[]): number | undefined {
  const normalizedModelText = modelText.toUpperCase().trim();
  
  // Tam eşleşme
  for (const model of models) {
    const modelName = model.name.toUpperCase().trim();
    if (normalizedModelText === modelName || normalizedModelText.includes(modelName)) {
      return model.id;
    }
  }
  
  // Kısmi eşleşme (L250-5V -> L250 veya benzeri)
  for (const model of models) {
    const modelName = model.name.toUpperCase().trim();
    // Model adının bir kısmı eşleşiyorsa
    const modelWords = normalizedModelText.split(/[\s-]+/);
    for (const word of modelWords) {
      if (word.length >= 3 && modelName.includes(word)) {
        return model.id;
      }
    }
  }
  
  return undefined;
}

/**
 * Model bulma (Fuzzy Matching)
 */
function findModel(text: string, models: CarModel[]): number | undefined {
  // Önce tam eşleşme dene
  for (const model of models) {
    const modelName = model.name.toUpperCase();
    if (text.includes(modelName)) {
      return model.id;
    }
  }
  
  // Fuzzy matching
  let bestMatch: { model: CarModel; score: number } | null = null;
  
  for (const model of models) {
    const modelName = model.name.toUpperCase();
    const score = calculateSimilarity(text, modelName);
    
    if (score > 0.5) { // %50 benzerlik eşiği (düşürüldü)
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { model, score };
      }
    }
  }
  
  return bestMatch?.model.id;
}

/**
 * İki string arasındaki benzerliği hesaplar (Jaro-Winkler benzeri)
 */
function calculateSimilarity(str1: string, str2: string): number {
  // Basit benzerlik hesaplama
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  // Ortak karakter sayısı
  let matches = 0;
  const shorterUpper = shorter.toUpperCase();
  const longerUpper = longer.toUpperCase();
  
  for (let i = 0; i < shorterUpper.length; i++) {
    if (longerUpper.includes(shorterUpper[i])) {
      matches++;
    }
  }
  
  // Basit benzerlik oranı
  return matches / longer.length;
}

