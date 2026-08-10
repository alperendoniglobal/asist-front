# Partner Satış Formu Prefill (kısa referans)

> Tam doküman (PDF): [`PARTNER_ENTEGRASYON.pdf`](./PARTNER_ENTEGRASYON.pdf)  
> Production: `https://cozum.net` · API: `https://cozum.net/api/v1`

## Login

```bash
curl -X POST https://cozum.net/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"acente@ornek.com","password":"Sifre123!"}'
```

## Prefill URL

```
https://cozum.net/dashboard/sales/new
  ?accessToken=JWT
  &refreshToken=JWT
  &tc_vkn=10000000146
  &name=Ahmet
  &surname=Yilmaz
  &phone=5551112233
  &email=ahmet@ornek.com
  &city=Istanbul
  &district=Kadikoy
  &vehicle_type=Otomobil
  &plate=34ABC123
  &registration_serial=AA
  &registration_number=123456
  &brand=XYZMarka
  &model=ABCModel
  &model_year=2020
  &usage_type=PRIVATE
  &start_date=2026-08-17
```

## Enum’lar

| Param | Geçerli değerler |
|---|---|
| `usage_type` | `PRIVATE` \| `COMMERCIAL` \| `TAXI` |
| `vehicle_type` | `Otomobil` \| `Motosiklet` \| `Minibüs` \| `Midibüs` \| `Kamyonet` \| `Taksi` \| `Kamyon` \| `Çekici` |
| boolean | `true` / `1` / `yes` = evet |

## Tarihler

| Param | Kural |
|---|---|
| `start_date` | Opsiyonel `YYYY-MM-DD`. Bugünden önce olamaz. Yoksa sistem **bugün+7** yazar. |
| `end_date` | Göndermeyin; sistem `start+1y` üretir. |

## Marka / model

Sadece string: `brand` + `model`.  
Katalog ID (`brand_id`, `model_id`) **göndermeyin**.

Paket (`package_id`) **gönderilmez** — kullanıcı panelde seçer.
