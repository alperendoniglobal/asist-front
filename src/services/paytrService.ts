/**
 * PayTR iFrame Service
 * PayTR iframe entegrasyonu için helper fonksiyonlar
 */

/**
 * PayTR iframe script'ini yükle
 * iframeResizer.min.js script'ini dinamik olarak ekler
 */
export const loadPaytrIframeScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Script zaten yüklenmiş mi kontrol et
    if (document.getElementById('paytr-iframe-resizer')) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = 'paytr-iframe-resizer';
    script.src = 'https://www.paytr.com/js/iframeResizer.min.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayTR iframe script yüklenemedi'));
    document.head.appendChild(script);
  });
};

/**
 * PayTR iframe oluştur ve sayfaya ekle
 * @param token - PayTR token
 * @param containerId - iframe'in ekleneceği container ID
 * @returns iframe element
 */
export const createPaytrIframe = (token: string, containerId: string): HTMLIFrameElement => {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with ID "${containerId}" not found`);
  }

  // Mevcut iframe varsa kaldır
  const existingIframe = container.querySelector('iframe');
  if (existingIframe) {
    existingIframe.remove();
  }

  // Yeni iframe oluştur
  const iframe = document.createElement('iframe');
  iframe.id = 'paytriframe';
  iframe.src = `https://www.paytr.com/odeme/guvenli/${token}`;
  iframe.frameBorder = '0';
  iframe.scrolling = 'no';
  iframe.style.width = '100%';
  iframe.style.minHeight = '400px';

  container.appendChild(iframe);

  return iframe;
};

/**
 * PayTR iframe'i başlat (script yükle ve iframe oluştur)
 * @param token - PayTR token
 * @param containerId - iframe'in ekleneceği container ID
 * @returns Promise<void>
 */
export const initPaytrIframe = async (token: string, containerId: string): Promise<HTMLIFrameElement> => {
  // Script'i yükle
  await loadPaytrIframeScript();

  // iframe'i oluştur
  const iframe = createPaytrIframe(token, containerId);

  // iframeResizer'ı başlat (window.iFrameResize fonksiyonu script tarafından sağlanır)
  if (window.iFrameResize) {
    window.iFrameResize({}, '#paytriframe');
  } else {
    console.warn('iFrameResize fonksiyonu bulunamadı, iframe otomatik boyutlandırma çalışmayabilir');
  }

  return iframe;
};

/**
 * PayTR başarılı ödeme sonrası yönlendirme
 * merchant_ok_url'den sonra çağrılır
 */
export const handlePaytrSuccess = (saleId?: string) => {
  // Başarılı ödeme sayfasına yönlendir
  const successUrl = `/payment/success${saleId ? `?sale_id=${saleId}` : ''}`;
  window.location.href = successUrl;
};

/**
 * PayTR başarısız ödeme sonrası yönlendirme
 * merchant_fail_url'den sonra çağrılır
 */
export const handlePaytrFailure = (error?: string) => {
  // Başarısız ödeme sayfasına yönlendir
  const failUrl = `/payment/fail${error ? `?error=${encodeURIComponent(error)}` : ''}`;
  window.location.href = failUrl;
};

// TypeScript için window.iFrameResize tipi
declare global {
  interface Window {
    iFrameResize?: (options: any, selector: string) => void;
  }
}

