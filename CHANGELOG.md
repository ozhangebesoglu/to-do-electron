# Changelog

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
