# AI Fotoğraf Düzenleyici (Arka Plan Silici & Netleştirici)

Modern, karanlık temalı, tamamen **ücretsiz**, sıfır sunucu ve sıfır bulut API gerektiren, tüm yapay zeka ve görüntü işleme işlemlerini **100% cihaz içinde (on-device)** gerçekleştiren profesyonel React Native / Expo mobil uygulaması.

---

## 🌟 Temel Özellikler

1. **Google ML Kit ile Cihaz İçi Arka Plan Silme:**
   - `@six33/react-native-bg-removal` ile Google ML Kit Subject Segmentation modelini doğrudan cihaz CPU/NPU üzerinde çalıştırır.
   - Saniyeler içinde nesneyi milisaniyeler seviyesinde arka plandan ayırarak şeffaf PNG üretir.
   - Şeffaf arka planın yanı sıra tek tıkla düz renk (Beyaz, Siyah, Kırmızı, Mavi, Sarı, Zümrüt, Mor vb.) ekleme desteği.

2. **Shopify Skia GPU ile Gerçek Zamanlı Fotoğraf Netleştirme & HDR:**
   - `@shopify/react-native-skia` 2D GPU motoru kullanılarak gerçek zamanlı 60fps render.
   - **HD Netleştir (Sharpen):** Bulanıklığı gideren Unsharp Mask ve kenar keskinleştirici mikro-kontrast matrisi.
   - **Canlılaştır (HDR Boost):** Dinamik renk aralığını, doygunluğu ve kontrastı optimize eden Skia `<ColorMatrix />`.
   - **Portre / Yüz Aydınlat:** Gölgeleri yumuşatan, cilt tonlarını canlandıran ve yüz detaylarını belirginleştiren özel renk matrisi.
   - **%0 - %100 Yoğunluk Kaydırıcısı (Intensity Slider):** Efekt gücünü anlık olarak kontrol etme.
   - `makeImageSnapshot` veya `react-native-view-shot` ile doğrudan Skia GPU canvas'ından kayıpsız çıktı alma.

3. **Akıcı "Öncesi / Sonrası" (Before / After) Karşılaştırma Slider'ı:**
   - `react-native-reanimated` ve `react-native-gesture-handler` ile 60fps donanımsal ivmeli kaydırma çizgisi.
   - Dikey tutamak (handle) ile orijinal fotoğraf (sol) ve işlenmiş fotoğraf (sağ) arasında pürüzsüz geçiş.
   - Şeffaflığı net göstermek için en alt katmanda dama tahtası (checkerboard) deseni.

4. **12MP+ Fotoğraflar İçin RAM (OOM) Koruması:**
   - Kullanıcı galeriden veya kameradan yüksek çözünürlüklü (12MP, 48MP, 4K) fotoğraf seçtiğinde, Android sisteminin "Out of Memory" (OOM) çökmesini engellemek için `expo-image-manipulator` ile uzun kenar otomatik olarak maksimum 1080px'e ölçeklendirilir.
   - Tüm yapay zeka ve Skia operasyonları bu optimize edilmiş bellek bütçesinde çalışır.

5. **Galeriye Dışa Aktarma & Kaydetme:**
   - `expo-media-library` izin kontrolü ile tek dokunuşla galeriye kaydetme.
   - Şeffaf arka planlı görseller kayıpsız PNG olarak, renkli/netleştirilmiş görseller ise yüksek kaliteli JPEG olarak "AI Photo Editor" albümüne kaydedilir.

---

## 📁 Proje Dizin Yapısı

```
ai-photo-editor/
├── app/                                # Expo Router Ekranları
│   ├── _layout.tsx                     # Kök Layout (Reanimated, Dark Theme, Stack)
│   ├── index.tsx                       # Karşılama Ekranı (Fotoğraf Seçici, Kamera, Demo)
│   └── editor.tsx                      # Ana Düzenleme Ekranı (Canvas, Slider, Kontroller)
├── src/
│   ├── components/                     # Yeniden Kullanılabilir Bileşenler
│   │   ├── BeforeAfterSlider.tsx       # Öncesi/Sonrası Karşılaştırma Bileşeni (Reanimated)
│   │   ├── SkiaEnhancer.tsx            # Shopify Skia Canvas & Filtre Bileşeni
│   │   ├── ColorPalettePicker.tsx      # Arka Plan Rengi Paleti
│   │   ├── ModeSelector.tsx            # 3 Netleştirme Modu Seçici
│   │   ├── CustomSlider.tsx            # Akıcı Reanimated Yoğunluk Slider'ı (%0 - %100)
│   │   └── Toast.tsx                   # Modern Bildirim Bileşeni
│   ├── services/                       # İş Mantığı & Cihaz İçi Servisler
│   │   ├── bgRemovalService.ts         # Google ML Kit Arka Plan Silme Servisi
│   │   ├── imageOptimizerService.ts    # RAM Koruyucu 1080px Yeniden Boyutlandırıcı
│   │   └── exportService.ts            # MediaLibrary Galeriye Kaydetme Servisi
│   ├── utils/                          # Yardımcı Fonksiyonlar & Matrisler
│   │   ├── colorMatrices.ts            # Skia 4x5 Renk Matrisleri (Sharpen, HDR, Portrait)
│   │   └── skiaShaders.ts              # SkSL GPU Unsharp Mask Shader Kaynak Kodu
│   ├── constants/                      # Sabitler & Tasarım Sistemi
│   │   └── theme.ts                    # Koyu Tema Renkleri, Paletler ve Modlar
│   └── types/
│       └── editor.ts                   # TypeScript Tip Tanımları
├── plugins/
│   └── withMlKitManifest.js            # AndroidManifest ML Kit Bağımlılık Config Plugin'i
├── assets/                             # İkon ve Açılış Görselleri
├── app.json                            # Expo ve Native Android Yapılandırması
├── package.json                        # Paket Bağımlılıkları
├── tsconfig.json                       # TypeScript Yapılandırması
└── babel.config.js                     # Reanimated Babel Plugin Yapılandırması
```

---

## 🚀 Kurulum ve Çalıştırma

Bu projede kullanılan `@six33/react-native-bg-removal` (Google ML Kit) ve `@shopify/react-native-skia` native C++/Java/Android kütüphaneleri içerdiğinden standart Expo Go yerine **Expo Prebuild (Development Build)** ile çalıştırılır.

### 1. Bağımlılıkları Yükleyin:
```bash
npm install
```

### 2. Android Native Projesini Oluşturun (Prebuild):
```bash
npx expo prebuild
```
> Bu komut çalıştığında `plugins/withMlKitManifest.js` config eklentisi otomatik olarak `AndroidManifest.xml` içine şu satırı ekler:
> `<meta-data android:name="com.google.mlkit.vision.DEPENDENCIES" android:value="subject_segment" />`
> Böylece cihazınız Google ML Kit modelini arka planda otomatik olarak hazırlar.

### 3. Android Cihazda veya Emülatörde Çalıştırın:
```bash
npx expo run:android
```

---

## 🛡️ Gizlilik ve Güvenlik

- **Hiçbir veri sunucuya gitmez:** Fotoğraflarınız internete yüklenmez, üçüncü taraf yapay zeka API'larına (OpenAI, Replicate, Clipdrop vb.) gönderilmez.
- **İnternetsiz çalışır:** İlk model kurulumunun ardından uçak modunda dahi tüm fonksiyonlar kesintisiz çalışır.
- **Ücretsiz ve sınırsız:** Kredi kartı, abonelik veya API anahtarı gerekmez.
