# 🎨 Yol Asistan - Custom Theme Guide

## Tema Özellikleri

Ant Design'ın `ConfigProvider` ve `theme` prop'u kullanılarak tamamen özelleştirilmiş modern bir tema uygulandı.

## 🎯 Ana Renkler

### Primary Color (Ana Renk)
- **Renk:** `#667eea` (Modern mor-mavi)
- **Kullanım:** Butonlar, linkler, seçili öğeler, aktif durumlar

### Semantic Colors (Anlamsal Renkler)
- **Success:** `#10b981` (Yeşil) - Başarılı işlemler
- **Warning:** `#f59e0b` (Turuncu) - Uyarılar
- **Error:** `#ef4444` (Kırmızı) - Hatalar
- **Info:** `#3b82f6` (Mavi) - Bilgilendirme

## 📐 Tasarım Özellikleri

### Border Radius (Köşe Yuvarlaklığı)
- **XS:** 4px
- **SM:** 6px
- **Default:** 8px
- **LG:** 12px

### Spacing (Boşluklar)
- **XS:** 8px
- **SM:** 12px
- **Default:** 16px
- **LG:** 24px

### Control Heights (Kontrol Yükseklikleri)
- **Small:** 32px
- **Default:** 40px
- **Large:** 48px

## 🎨 Component Customizations

### Button
- ✅ Yükseklik: 40px (default), 48px (large), 32px (small)
- ✅ Border radius: 8px
- ✅ Primary shadow: Mor-mavi gölge efekti

### Card
- ✅ Border radius: 12px
- ✅ Header background: `#f9fafb`
- ✅ Hafif gölge efekti

### Table
- ✅ Header background: `#f9fafb`
- ✅ Hover rengi: `#f3f4f6`
- ✅ Modern, temiz görünüm

### Modal
- ✅ Border radius: 12px
- ✅ Header background: `#f9fafb`

### Input & Select
- ✅ Yükseklik: 40px
- ✅ Border radius: 8px
- ✅ Hover/active renk: `#667eea`

### Menu (Sidebar)
- ✅ Dark background: `#1f2937`
- ✅ Seçili item rengi: Mor-mavi
- ✅ Hover efekti: Hafif mor-mavi
- ✅ Border radius: 8px

### Layout
- ✅ Header: Beyaz background
- ✅ Sidebar: Dark gray (`#1f2937`)
- ✅ Body: `#f5f5f5`

### Form
- ✅ Label rengi: `#374151`
- ✅ Item margin: 24px
- ✅ Modern spacing

### Pagination
- ✅ Active background: `#667eea`
- ✅ Item size: 32px
- ✅ Border radius: 6px

### Progress
- ✅ Default rengi: `#667eea`
- ✅ Remaining rengi: `#e5e7eb`

### Avatar
- ✅ Border radius: 8px
- ✅ Sizes: 32px, 40px, 48px

### Switch
- ✅ Track height: 24px
- ✅ Track width: 48px
- ✅ Handle size: 20px

## 🎭 Kullanım

Theme dosyası `src/theme/index.ts` konumunda bulunur ve `App.tsx`'te uygulanır:

```typescript
import theme from './theme';

<ConfigProvider
  locale={trTR}
  theme={theme}
>
  {/* App content */}
</ConfigProvider>
```

## ✨ Özelleştirme

### Yeni Renk Ekleme

`src/theme/index.ts` içinde `token` bölümüne yeni renkler ekleyin:

```typescript
token: {
  colorPrimary: '#667eea',
  colorCustom: '#your-color', // Yeni renk
  // ...
}
```

### Component Stilini Değiştirme

`components` bölümünde istediğiniz component'i özelleştirin:

```typescript
components: {
  Button: {
    controlHeight: 40,
    primaryShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    // Yeni özellikler...
  },
}
```

## 🎨 Design System

### Tipografi
- **Font Family:** System font stack
- **Base Size:** 14px
- **Heading 1:** 38px
- **Heading 2:** 30px
- **Heading 3:** 24px
- **Heading 4:** 20px
- **Heading 5:** 16px

### Shadows
- **Default:** Hafif gölge (1px 3px)
- **Secondary:** Orta gölge (4px 6px)
- **Button Primary:** Mor-mavi gölge

### Animations
- **Slow:** 0.3s
- **Mid:** 0.2s
- **Fast:** 0.1s

## 🌈 Color Palette

### Grays
- **50:** `#f9fafb`
- **100:** `#f3f4f6`
- **200:** `#e5e7eb`
- **300:** `#d1d5db`
- **400:** `#9ca3af`
- **500:** `#6b7280`
- **600:** `#4b5563`
- **700:** `#374151`
- **800:** `#1f2937`
- **900:** `#111827`

### Primary (Purple-Blue)
- **Base:** `#667eea`
- **Light:** Hover/active states
- **Dark:** Sidebar, dark elements

## 📱 Responsive Breakpoints

Ant Design'ın default breakpoint'leri kullanılır:
- **xs:** < 576px
- **sm:** ≥ 576px
- **md:** ≥ 768px
- **lg:** ≥ 992px
- **xl:** ≥ 1200px
- **xxl:** ≥ 1600px

## 🎯 Best Practices

1. **Consistency:** Tema renklerini ve spacing değerlerini kullanın
2. **Accessibility:** Kontrast oranlarına dikkat edin
3. **Performance:** Gereksiz inline style kullanmayın
4. **Maintainability:** Tüm stil değişikliklerini theme dosyasında yapın

## 🔧 Debugging

Theme değişikliklerini görmek için:

```bash
# Development server'ı yeniden başlatın
npm run dev
```

Browser'da değişiklikleri anında göreceksiniz.

## 📚 Ant Design Theme Documentation

Daha fazla bilgi için:
- [Ant Design Theme Customization](https://ant.design/docs/react/customize-theme)
- [Design Tokens](https://ant.design/docs/react/customize-theme#seedtoken)
- [Component Tokens](https://ant.design/docs/react/customize-theme#component-token)

---

**Modern, profesyonel ve tutarlı bir tasarım sistemi!** 🎨
