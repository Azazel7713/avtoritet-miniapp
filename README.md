# Avtoritet: Bakı Küçələri

Telegram Mini App üçün mobil RPG prototipi. Oyun Azərbaycan dilindədir və əsas dövrə avtoritet, raundlu döyüş, fokus, kraft, tapşırıqlar, səviyyə, reytinq və referal kodu üzərində qurulub.

## Döyüş sistemi

- Döyüş artıq ayrıca `battle.html` səhifəsində 3D arena kimi açılır.
- 3D səhnə Three.js module CDN ilə yüklənir.
- `Zərbə` - əsas hücum, fokus yığır.
- `Müdafiə` - gələn ziyanı azaldır və kiçik cavab zərbəsi vurur.
- `Xüsusi` - fokus 100% olanda açılır və böyük ziyan verir.
- Qələbə avtoritet, manat, təcrübə və resurs verir.
- Məğlubiyyət az avtoritet aparır, amma təcrübə saxlayır.

## Lokal запуск

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Sonra aç:

```text
http://127.0.0.1:4173/
```

## Telegram Mini App kimi qoşmaq

1. Faylları HTTPS dəstəkləyən hostinqə yüklə.
2. BotFather-da bot üçün Mini App/Web App URL olaraq həmin HTTPS ünvanı göstər.
3. Telegram daxilində açanda `Telegram.WebApp` avtomatik istifadəçi adını, paylaşımı, haptic feedback və ekran genişlənməsini aktiv edəcək.

## Fayllar

- `index.html` - tətbiqin strukturu
- `styles.css` - mobil oyun interfeysi və qrafika
- `app.js` - oyun mexanikası və lokal progress
- `battle.html` - ayrıca 3D döyüş səhifəsi
- `battle.js` - Three.js arena və raundlu döyüş mexanikası
- `assets/hero-bg.png` - əsas ekran üçün generasiya olunmuş fon
- `assets/arena-bg.png` - döyüş arenası üçün generasiya olunmuş fon
- `assets/player.png` və `assets/rival.png` - şəffaf fonlu generasiya olunmuş personajlar
