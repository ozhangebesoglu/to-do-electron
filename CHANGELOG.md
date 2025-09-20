# Changelog

## 1.2.1 - 2025-09-20
### Fixed
- Tarih değiştirirken not ekleme sorunu düzeltildi
- Not ekleme işlemleri artık doğru tarih verilerine kaydediliyor
- DateKey parametresi NoteDetail komponentinde doğru şekilde kullanılıyor

## 1.2.0 - 2025-09-18
### Added
- Tarih bazlı görev yönetimi sistemi
- Takvim widget'ı ile kolay tarih navigasyonu
- Açık tema desteği (krem arka plan, kahve rengi yazılar)
- Tema geçiş butonu (koyu/açık tema arası geçiş)
- Günlük bazında görev görüntüleme ve yönetim
- Mevcut tarihlerin takvimde gösterimi
- Geliştirilmiş tarih navigasyon bar'ı

### Changed
- Kullanıcı arayüzü tema sistemi yeniden tasarlandı
- CSS custom properties ile çift tema desteği
- localStorage ile tema tercihi kalıcılığı

## 1.1.0 - 2025-09-18
### Added
- Workspace desteği (çoklu çalışma alanı, seçim & kalıcılık)
- Etiket sistemi (#tag ekleme, listeleme, aramada #tag filtresi)
- Arşivleme özelliği (görev arşivle / geri al, arşivli gösterim toggle)
- İstatistik paneli (toplam, tamamlanan, arşivli sayıları)
- Quick Capture (Ctrl+Alt+N ile hızlı görev ekleme overlay)
- Banner offset, öncelik, due date, not yapısı geliştirmeleri korunarak genişletildi
- 21st.dev Toolbar entegrasyonu (yalnızca development)

### Changed
- Veri modeli: Legacy günlük yapı -> `{ workspaces: { <ws>: { <date>: [...] }}}` formuna migrasyon
- Tüm IPC kanalları workspace parametreleriyle uyumlu hale getirildi

### Fixed
- Pomodoro kısayol tutarsızlığı (e.code bazlı çoklu kombinasyon)
- Çift Electron import kaynaklı başlangıç hatası

### Notes
- Eski veriler ilk açılışta `default` workspace altına taşınır.
- İleride: grafiksel istatistik, tag autocomplete, workspace rename/silme planlanabilir.
