# Changelog

## 1.3.1 - 2025-09-22
### Fixed
- **Z-index Layer Conflicts**: UI overlapping issues resolved
  - Quick Open Modal z-index increased to 10000 (above TargetCursor)
  - Theme Dropdown z-index set to 5000 (prevents drag item conflicts)
  - Dragging Todo Items z-index set to 3000
  - Window Bar z-index standardized to 1000
- **Theme Compatibility**: Detail page theme inconsistency fixed
  - Notes content background now uses theme variables instead of fixed black
  - All themes now display correctly in note editing areas
- **Window Layout**: Body padding adjusted to match window bar height (32px)

### Technical
- Z-index hierarchy standardization across all UI components
- CSS theme variable consistency in detail page components
- Improved UI layering system for better user experience

## 1.3.0 - 2025-09-20
### Added
- **Tekrarlayan Görev Sistemi**: Günlük, haftalık, aylık tekrarlayan görevler
- **Alt Görev (Subtask) Sistemi**: Ana görevler altında checkbox'lı alt görevler
- **Progress Bar**: Alt görevlerde tamamlanma yüzdesi gösterimi
- **Recurring Indicator**: Ana listede tekrarlayan görevler için 🔄 göstergesi
- **Subtask Preview**: Ana listede alt görev ilerlemesi mini preview'ı
- **Otomatik Görev Oluşturma**: Tekrarlayan görevler otomatik olarak oluşturulur
- **İkon Sistemi Güncellemesi**: Tüm uygulama ikonları (window, favicon, build) güncellendi

### Enhanced
- Veri yapısı genişletildi (recurring, subtasks alanları eklendi)
- Migration sistemi güncellendi
- IPC API'leri yeni özellikler için genişletildi
- UI/UX iyileştirmeleri yapıldı

### Technical
- Yeni IPC handlers: set-recurring, add-subtask, toggle-subtask, delete-subtask
- CSS stilleri: progress bar, subtask, recurring indicator stilleri
- Background interval: her saat tekrarlayan görev kontrolü

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
