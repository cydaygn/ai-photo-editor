import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import {
  Wand2,
  Sparkles,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react-native';
import { COLORS } from '../src/constants/theme';
import { optimizeImageForEditing } from '../src/services/imageOptimizerService';

// High-quality test image URL for instant evaluation
const DEMO_IMAGE_URL =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1080&auto=format&fit=crop';

export default function HomeScreen() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  // Process chosen image through RAM-protective 1080px optimizer
  const handleSelectedImage = async (
    uri: string,
    width?: number,
    height?: number
  ) => {
    try {
      setIsProcessing(true);
      setLoadingText('Bellek optimize ediliyor (Maks 1080px)...');

      const optimized = await optimizeImageForEditing(uri, width, height);

      router.push({
        pathname: '/editor',
        params: {
          uri: optimized.uri,
          width: String(optimized.width),
          height: String(optimized.height),
          originalWidth: String(optimized.originalWidth),
          originalHeight: String(optimized.originalHeight),
          isResized: String(optimized.isResized),
        },
      });
    } catch (err: any) {
      console.error('[HomeScreen] Image optimization error:', err);
      Alert.alert(
        'Hata',
        'Fotoğraf hazırlanırken bir sorun oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsProcessing(false);
      setLoadingText('');
    }
  };

  // Pick from Gallery
  const handlePickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf seçebilmek için galeri erişim izni vermelisiniz.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleSelectedImage(asset.uri, asset.width, asset.height);
      }
    } catch (err) {
      console.error('[HomeScreen] Gallery picker error:', err);
      Alert.alert('Hata', 'Galeri açılırken bir sorun oluştu.');
    }
  };

  // Capture with Camera
  const handlePickFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'İzin Gerekli',
          'Fotoğraf çekebilmek için kamera erişim izni vermelisiniz.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        await handleSelectedImage(asset.uri, asset.width, asset.height);
      }
    } catch (err) {
      console.error('[HomeScreen] Camera error:', err);
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu.');
    }
  };

  // Instant demo photo
  const handleTryDemoPhoto = async () => {
    await handleSelectedImage(DEMO_IMAGE_URL, 1080, 1440);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App Title & Badge */}
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Cpu size={12} color={COLORS.accent} />
              <Text style={styles.badgeText}>100% Cihaz İçi (On-Device)</Text>
            </View>
            <View style={[styles.badge, styles.badgeFree]}>
              <ShieldCheck size={12} color={COLORS.emerald} />
              <Text style={[styles.badgeText, { color: COLORS.emerald }]}>
                Ücretsiz & Gizli
              </Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            AI Fotoğraf <Text style={styles.heroTitleAccent}>Düzenleyici</Text>
          </Text>
          <Text style={styles.heroSubtitle}>
            Google ML Kit ile arka plan silme, Skia GPU ile HD netleştirme &
            portre iyileştirme. Sıfır sunucu, sıfır maliyet.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handlePickFromGallery}
            disabled={isProcessing}
          >
            <View style={styles.btnIconWrap}>
              <ImageIcon size={22} color="#ffffff" />
            </View>
            <View style={styles.btnTextWrap}>
              <Text style={styles.primaryBtnTitle}>Galeriden Fotoğraf Seç</Text>
              <Text style={styles.primaryBtnSubtitle}>
                Cihazınızdaki fotoğrafları anında düzenleyin
              </Text>
            </View>
            <ArrowRight size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            activeOpacity={0.85}
            onPress={handlePickFromCamera}
            disabled={isProcessing}
          >
            <View style={[styles.btnIconWrap, styles.btnIconWrapSecondary]}>
              <Camera size={22} color={COLORS.textPrimary} />
            </View>
            <View style={styles.btnTextWrap}>
              <Text style={styles.secondaryBtnTitle}>Kamera ile Çek</Text>
              <Text style={styles.secondaryBtnSubtitle}>
                Yeni bir kare yakalayıp hemen işleyin
              </Text>
            </View>
            <ArrowRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {/* Demo sample photo button */}
          <TouchableOpacity
            style={styles.demoButton}
            activeOpacity={0.8}
            onPress={handleTryDemoPhoto}
            disabled={isProcessing}
          >
            <Wand2 size={16} color={COLORS.cyan} />
            <Text style={styles.demoButtonText}>
              Örnek Portre ile Hemen Dene (Hızlı Test)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>ÖNE ÇIKAN ÖZELLİKLER</Text>

          <View style={styles.featureGrid}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
                <Wand2 size={20} color={COLORS.accent} />
              </View>
              <Text style={styles.featureTitle}>Arka Plan Silme</Text>
              <Text style={styles.featureDesc}>
                Google ML Kit Subject Segmentation ile nesneyi milisaniyelerde ayıklar, şeffaf PNG üretir.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(6, 182, 212, 0.15)' }]}>
                <Sparkles size={20} color={COLORS.cyan} />
              </View>
              <Text style={styles.featureTitle}>HD Netleştirme</Text>
              <Text style={styles.featureDesc}>
                Shopify Skia GPU motoruyla bulanıklığı gideren Unsharp Mask ve kenar keskinleştirme.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}>
                <Layers size={20} color={COLORS.amber} />
              </View>
              <Text style={styles.featureTitle}>Canlı HDR & Portre</Text>
              <Text style={styles.featureDesc}>
                Dinamik renk aralığı, gölge açma ve yüz aydınlatıcı ColorMatrix filtreleri.
              </Text>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIconWrap, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <ShieldCheck size={20} color={COLORS.emerald} />
              </View>
              <Text style={styles.featureTitle}>RAM & OOM Koruması</Text>
              <Text style={styles.featureDesc}>
                12MP+ fotoğrafları akıllıca 1080px'e ölçeklendirerek çökmesiz akıcı performans sağlar.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isProcessing && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.loadingBoxText}>{loadingText}</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  badgeFree: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  heroTitleAccent: {
    color: COLORS.accent,
  },
  heroSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 18,
    padding: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  btnIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  btnTextWrap: {
    flex: 1,
  },
  primaryBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  primaryBtnSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnIconWrapSecondary: {
    backgroundColor: COLORS.bgElevated,
  },
  secondaryBtnTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  secondaryBtnSubtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    marginTop: 4,
  },
  demoButtonText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  featureCard: {
    width: '48%',
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featureIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: COLORS.bgElevated,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    maxWidth: '80%',
  },
  loadingBoxText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});
