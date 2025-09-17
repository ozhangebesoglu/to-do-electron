# Günlük To-Do & Pomodoro Uygulaması

![License](https://img.shields.io/badge/license-MIT-b97723.svg) ![Release](https://img.shields.io/github/v/release/ozhangebesoglu/to-do-electron)

Modern Electron + React tabanlı günlük görev yöneticisi. Görev başına banner (resim/video), notlar (metin veya işaretlenebilir maddeler), Pomodoro zamanlayıcı, öncelik, son tarih ve kapsamlı kısayol desteği içerir. Tek koyu (siyah + kahve) tema.

## Özellikler
- Günlük görev listesi (tarih otomatik)
- Görev oluştururken isteğe bağlı banner (resim / video) + ekleme formu arka plan önizlemesi
- Banner'ı detayda seçme / kaldırma ve görseli sürükleyerek (drag) dikey konum ayarlama (veya Alt+↑/↓)
- Görev içi notlar: Metin veya checkbox (tamamlanınca üstü çizili)
- Not ekleme / silme, görev tamamlama / geri alma, görev silme
- Görev başlığını detayda çift tıkla hızlı düzenleme (Enter kaydet, Esc iptal)
- Öncelik (low / med / high) döngüsü ve renkli rozetler
- Son tarih seçimi (date picker) ve geciken görev için uyarı stili
- Arama kutusu (başlık + not içi gerçek zamanlı filtre)
- Pomodoro zamanlayıcı (odak / kısa / uzun) ayarlanabilir süreler + localStorage kalıcılığı
- Özel frameless pencere + sağ üstte özel pencere kontrol butonları
- Banner dikey offset ince ayarı (sürükle veya Alt+↑ / Alt+↓)
- Kalıcı yerel JSON depolama (kullanıcı klasörü)

## Kurulum & Çalıştırma
```powershell
npm install
npm run dev
```
Üretim benzeri sadece derlemek için:
```powershell
npm run build
```

## Klavye Kısayolları
Genel:
- Enter: Yeni görev ekle & detaya gir (liste görünümünde)
- Ctrl+Alt+S: Pomodoro Başlat / Duraklat
- Ctrl+Alt+R: Pomodoro Sıfırla
- Ctrl+Alt+K: Görev başlığı inputuna odak
- Ctrl+Alt+F: Arama kutusuna odak
- Esc: Detaydan çık / listeye dön

Detay Ekranı Ekstra:
- Ctrl+Enter: Not ekle
- Ctrl+Alt+C: Görevi tamamla / geri al
- Ctrl+Alt+D: Görevi sil (onay)
- Ctrl+Alt*P: Öncelik döngüsü
- Ctrl+Alt+U: Tarih alanına odak
- Alt+↑ / Alt+↓: Banner dikey konumunu 5px artır / azalt

## Veri Yapısı (Örnek)
```json
{
	"YYYY-M-D": [
		{
			"title": "...",
			"notes": [ { "type": "text", "text": "..." }, { "type": "task", "text": "...", "done": false } ],
			"banner": { "type": "image|video", "path": "..." } | null,
			"bannerOffset": 0,
			"completed": false,
			"priority": "low|med|high",
			"dueDate": "YYYY-MM-DD" | null
		}
	]
}
```

## Teknik Notlar
- Electron main → `main.cjs`, güvenli köprü → `preload.cjs`
- React + esbuild (hızlı watch) `build.mjs`
- Migration: Eski string notlar otomatik obje formuna çevrilir.
- Frameless pencere (`frame:false`) ve custom kontrol butonları (min/max/close) preload üzerinden IPC.

## Paketleme (Masaüstü Kurulum Dosyası)

Önce üretim renderer çıktısını ve dağıtımı oluştur:
```powershell
npm install
npm run dist
```
Oluşan çıktı `dist/` (geçici build) ve kurulum dosyası `dist/*.exe` (NSIS) içinde yer alır.

İkonu değiştirmek için `build/icon.ico` dosyasını kendi 256x256 ICO dosyanızla değiştirin (gerekirse PNG'den çevirebilirsiniz).

Sadece geliştirme için (hot build + electron):
```powershell
npm run dev
```

## Release (GitHub Releases)

1. `package.json` sürümünü artır (semver).
2. Commit & tag:
	```powershell
	git add package.json
	git commit -m "chore: bump version to vX.Y.Z"
	git tag vX.Y.Z
	git push origin main --tags
	```
3. Derle:
	```powershell
	npm run dist
	```
4. GitHub > Releases > Draft new release
	- Tag: `vX.Y.Z`
	- Title: `vX.Y.Z`
	- Değişiklik listesi (Added / Fixed / Changed)
	- `dist/` içindeki `.exe` ve `.zip` dosyalarını ekle
5. Publish.

İleride otomasyon için GitHub Actions ile `electron-builder --publish onTag` eklenebilir.

## Yol Haritası (Gelecek Fikirleri)
- Etiket / kategori desteği
- Tekrarlayan görevler (günlük / haftalık / custom pattern)
- Sürükle-bırak ile görev sıralama
- Arşiv sekmesi (tamamlananları gizle)
- Export / import (JSON / Markdown)
- İstatistikler (tamamlanan görev sayısı, odak süresi grafiği)
- Pomodoro bitiş bildirimi
- Geçmiş günleri görüntüleme / günler arası geçiş
- Bulut senkron opsiyonu

## Güvenlik
- `contextIsolation: true`, minimum IPC yüzeyi.

## Katkı
PR açmadan önce: stili koru, gereksiz bağımlılık ekleme, açıklayıcı commit mesajları.

## Lisans
MIT © 2025 Özhan Gebeşoğlu – ayrıntı için `LICENSE` dosyasına bak.

## Katkı / Açık Kaynak
Issue veya PR açarak katkıda bulunabilirsiniz. Büyük özellikler için önce tartışma açmanız önerilir. Kod stilini ve minimal bağımlılık politikasını koruyun.
