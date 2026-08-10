<p align="center">
  <img src="logo-cozum.png" alt="Çözüm Net" width="280" />
</p>

# Çözüm Net — Partner Entegrasyon Dokümantasyonu

**Versiyon:** 1.3  
**Tarih:** 10 Ağustos 2026  
**Ürün:** çözüm.net · [cozum.net](https://cozum.net)

Harici sistemlerin panelde oturum açıp **Yeni Satış** formunu ön doldurması için teknik spesifikasyon.

---

## 1. Ortam

| | URL |
|---|---|
| Frontend (panel) | `https://cozum.net` |
| Yeni Satış | `https://cozum.net/dashboard/sales/new` |
| API base | `https://cozum.net/api/v1` |
| Login | `POST https://cozum.net/api/v1/auth/login` |
| Oturum | `GET https://cozum.net/api/v1/auth/me` |
| Token yenile | `POST https://cozum.net/api/v1/auth/refresh-token` |

API header (login hariç):

```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

---

## 2. Akış

1. Partner **backend** → `POST /api/v1/auth/login` → `accessToken` + `refreshToken`
2. Kullanıcıyı tarayıcıda şu adrese yönlendir:

```
https://cozum.net/dashboard/sales/new?accessToken=...&refreshToken=...&<form alanları>
```

3. Frontend token’ı `localStorage`’a alır, `GET /auth/me` ile doğrular, token’ları URL’den siler.
4. Müşteri + araç alanları forma dolar.
5. Kullanıcı **paketi panelde seçer** ve satışı tamamlar.

**Partner paket seçmez.** `package_id` gönderilmez.

---

## 3. Auth API

### 3.1 Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{ "email": "acente@ornek.com", "password": "Sifre123!" }
```

Yanıt `data`:

| Alan | Tip | Açıklama |
|---|---|---|
| `accessToken` | string (JWT) | Prefill URL’ye eklenir |
| `refreshToken` | string (JWT) | Prefill URL’ye eklenmesi önerilir |
| `user` | object | Rol, acente/şube bilgisi |

### 3.2 Me

```http
GET /api/v1/auth/me
Authorization: Bearer <accessToken>
```

### 3.3 Refresh

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{ "refreshToken": "..." }
```

---

## 4. ENUM’LAR (zorunlu değerler)

Query’de **yalnızca bu değerler** geçerlidir. Türkçe etiket göndermeyin.

### 4.1 `usage_type` (kullanım tarzı)

| Değer (gönderilecek) | Anlam |
|---|---|
| `PRIVATE` | Hususi |
| `COMMERCIAL` | Ticari |
| `TAXI` | Taksi |

Varsayılan (gönderilmezse): `PRIVATE`

Yanlış örnekler: `Hususi`, `hususi`, `Ticari` → **geçersiz**

### 4.2 `vehicle_type` (araç tipi)

| Değer (gönderilecek) |
|---|
| `Otomobil` |
| `Motosiklet` |
| `Minibüs` |
| `Midibüs` |
| `Kamyonet` |
| `Taksi` |
| `Kamyon` |
| `Çekici` |

Birebir bu string’ler. `otomobil`, `OTOMOBIL`, `Car` → kullanmayın.

### 4.3 Boolean parametreler

Geçerli alanlar: `is_corporate`, `is_foreign_plate`

| Değer | Anlam |
|---|---|
| `true` / `1` / `yes` | Evet |
| diğer / yok | Hayır |

### 4.4 `model_year`

- 4 haneli yıl: `2018` … `2026` (geçerli model yılı aralığı paneldeki select ile uyumlu olmalı)
- String olarak gönderin: `model_year=2020`

### 4.5 `start_date` (poliçe başlangıcı)

| Durum | Davranış |
|---|---|
| Gönderilmez | Sistem **bugün (Europe/Istanbul) + 7 gün** yazar |
| Gönderilir | Birebir kaydedilir; PDF’de aynı tarih görünür |
| Bugünden önce | **Reddedilir** (400) |

Format: yalnızca `YYYY-MM-DD` (ör. `2026-08-17`)

`end_date` partner tarafından **gönderilmez**; sistem her zaman `start_date + 1 yıl` üretir.

### 4.6 Gönderilmeyecek alanlar

| Alan | Neden |
|---|---|
| `package_id` | Kullanıcı panelde seçer |
| `end_date` | Sistem `start + 1y` üretir |
| fiyat / komisyon / ödeme | Panelde belirlenir |

---

## 5. Marka / Model — sadece string (katalog yok)

Partner entegrasyonunda marka ve model **düz metin** gönderilir.  
Katalog ID (`brand_id`, `model_id`) **kullanılmaz** — karıştırmayın.

| Parametre | Zorunlu | Açıklama | Örnek |
|---|---|---|---|
| `brand` | Evet* | Marka adı (serbest metin) | `Toyota` |
| `model` | Evet* | Model adı (serbest metin) | `Corolla` |

\* Araç satışı için pratikte zorunlu.

Eşdeğer alias (isterseniz): `brand_name`, `model_name` — aynı işi yapar.  
**Önerilen:** yalnızca `brand` + `model`.

Davranış:

- Panelde bu isimler katalogda varsa select dolar.
- Yoksa form **manuel metin** olarak kalır ve satışta string kaydedilir.
- Partner’ın katalog senkronu yapmasına gerek yoktur.

**Göndermeyin:** `brand_id`, `model_id`, `motor_brand_id`, `motor_model_id`

---

## 6. Query parametreleri

### 6.1 Oturum

| Param | Tip | Zorunlu | Not |
|---|---|---|---|
| `accessToken` | string | Evet (SSO) | JWT |
| `refreshToken` | string | Önerilir | JWT |

### 6.2 Müşteri

| Param | Tip | Enum / format | Örnek |
|---|---|---|---|
| `is_corporate` | boolean | §4.3 | `false` |
| `tc_vkn` | string | 10–11 hane | `10000000146` |
| `name` | string | — | `Ahmet` |
| `surname` | string | — | `Yilmaz` |
| `tax_office` | string | kurumsal ise | `Kadıköy` |
| `birth_date` | string | yalnızca `YYYY-MM-DD` | `1990-05-15` |
| `phone` | string | rakam | `5551112233` |
| `email` | string | e-posta | `ahmet@ornek.com` |
| `city` | string | il adı | `Istanbul` veya `İstanbul` |
| `district` | string | ilçe adı | `Kadikoy` veya `Kadıköy` |
| `address` | string | — | — |

İl / ilçe: ASCII (`Istanbul`) veya Türkçe (`İstanbul`) kabul edilir; panel city listesine normalize edilir.

### 6.3 Araç

| Param | Tip | Enum / format | Örnek |
|---|---|---|---|
| `vehicle_type` | enum | §4.2 | `Otomobil` |
| `plate` | string | plaka | `34ABC123` |
| `is_foreign_plate` | boolean | §4.3 | `false` |
| `registration_serial` | string | ruhsat seri | `AA` |
| `registration_number` | string | ruhsat no | `123456` |
| `model_year` | string | §4.4 | `2020` |
| `usage_type` | enum | §4.1 | `PRIVATE` |
| `brand` | string | §5 | `XYZMarka` |
| `model` | string | §5 | `ABCModel` |
| `start_date` | string | §4.5 opsiyonel | `2026-08-17` |

---

## 7. Hazır URL şablonu

```
https://cozum.net/dashboard/sales/new
  ?accessToken=<JWT>
  &refreshToken=<JWT>
  &tc_vkn=10000000146
  &name=Ahmet
  &surname=Yilmaz
  &phone=5551112233
  &email=ahmet@ornek.com
  &city=Istanbul
  &district=Kadikoy
  &birth_date=1990-05-15
  &is_corporate=false
  &vehicle_type=Otomobil
  &plate=34ABC123
  &registration_serial=AA
  &registration_number=123456
  &brand=XYZMarka
  &model=ABCModel
  &model_year=2020
  &usage_type=PRIVATE
  &is_foreign_plate=false
  &start_date=2026-08-17
```

Tek satır:

```
https://cozum.net/dashboard/sales/new?accessToken=JWT&refreshToken=JWT&tc_vkn=10000000146&name=Ahmet&surname=Yilmaz&phone=5551112233&email=ahmet@ornek.com&city=Istanbul&district=Kadikoy&birth_date=1990-05-15&vehicle_type=Otomobil&plate=34ABC123&registration_serial=AA&registration_number=123456&brand=XYZMarka&model=ABCModel&model_year=2020&usage_type=PRIVATE&start_date=2026-08-17
```

---

## 8. Örnek kod (partner backend)

```javascript
const loginRes = await fetch('https://cozum.net/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: AGENCY_EMAIL, password: AGENCY_PASSWORD }),
});
const { data } = await loginRes.json();

const params = new URLSearchParams({
  accessToken: data.accessToken,
  refreshToken: data.refreshToken,
  tc_vkn: '10000000146',
  name: 'Ahmet',
  surname: 'Yilmaz',
  phone: '5551112233',
  email: 'ahmet@ornek.com',
  city: 'Istanbul',
  district: 'Kadikoy',
  birth_date: '1990-05-15',
  vehicle_type: 'Otomobil',          // enum §4.2
  plate: '34ABC123',
  registration_serial: 'AA',
  registration_number: '123456',
  brand: 'XYZMarka',                 // string — katalog ID yok
  model: 'ABCModel',                 // string — katalog ID yok
  model_year: '2020',
  usage_type: 'PRIVATE',             // enum §4.1
  is_corporate: 'false',
  is_foreign_plate: 'false',
  // start_date: '2026-08-17',       // opsiyonel; yoksa bugün+7
});

return `https://cozum.net/dashboard/sales/new?${params.toString()}`;
```

Login e-posta/şifre **yalnızca partner sunucusunda** tutulur; tarayıcıya koyulmaz.

---

## 9. Frontend davranışı (özet)

| Konu | Davranış |
|---|---|
| Token | URL → localStorage → `/auth/me` → query’den silinir |
| Form query | Kalır; refresh’te tekrar dolar |
| Paket | Prefill yok; `model_year` + `vehicle_type` + `usage_type` ile listelenir |
| Marka/model | String; katalog ID beklenmez |
| Başlangıç | Query `start_date` varsa dolar; yoksa form varsayılanı bugün+7 |

---

## 10. Hata kontrolü

| Belirti | Kontrol |
|---|---|
| Login sayfası | `accessToken` geçerli mi? |
| `/auth/me` 401 | `Authorization: Bearer ...` |
| Form boş | Param adları tabloya uyuyor mu? |
| İl/ilçe boş | `city` / `district` gönderildi mi? |
| Paket yok | `model_year`, `vehicle_type`, `usage_type` enum’lara uygun mu? |
| Kullanım tarzı yanlış | `Hususi` değil → `PRIVATE` |

---

## 11. Destek

- Panel: https://cozum.net/dashboard  
- Destek: **0850 304 54 40**

---

*© Çözüm Net A.Ş — Partner Entegrasyon v1.3*
