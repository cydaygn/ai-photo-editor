import React, { useState, useRef, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Download,
  RotateCcw,
  Wand2,
  Sparkles,
  Sliders,
  Check,
} from 'lucide-react-native';
import { BeforeAfterSlider } from '../src/components/BeforeAfterSlider';
import { SkiaEnhancer, SkiaEnhancerRef } from '../src/components/SkiaEnhancer';
import { ColorPalettePicker } from '../src/components/ColorPalettePicker';
import { ModeSelector } from '../src/components/ModeSelector';
import { CustomSlider } from '../src/components/CustomSlider';
import { Toast, ToastConfig } from '../src/components/Toast';
import { removeBackground } from '../src/services/bgRemovalService';
import { savePhotoToGallery } from '../src/services/exportService';
import { COLORS } from '../src/constants/theme';
import { EnhancementMode } from '../src/types/editor';

export default function EditorScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri: string;
    width: string;
    height: string;
    originalWidth?: string;
    originalHeight?: string;
    isResized?: string;
  }>();

  const originalUri = params.uri || '';
  const imgWidth = parseInt(params.width || '1080', 10);
  const imgHeight = parseInt(params.height || '1080', 10);

  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  // Active Bottom Tab: 'bg-removal' or 'enhancer'
  const [activeTab, setActiveTab] = useState<'bg-removal' | 'enhancer'>('bg-removal');

  // Background Removal State
  const [bgRemovedUri, setBgRemovedUri] = useState<string | null>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgressMessage, setBgProgressMessage] = useState('');
  const [selectedBgColor, setSelectedBgColor] = useState<string>('transparent');

  // Enhancer State
  const [enhancementMode, setEnhancementMode] = useState<EnhancementMode>('sharpen');
  const [intensity, setIntensity] = useState<number>(60);
  const [isEnhancerActive, setIsEnhancerActive] = useState(false);

  // Export / Save State
  const [isSaving, setIsSaving] = useState(false);

  // Toast Notification State
  const [toastConfig, setToastConfig] = useState<ToastConfig>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastConfig({ visible: true, message, type });
  };

  const skiaEnhancerRef = useRef<SkiaEnhancerRef>(null);

  // Calculate responsive dimensions for the central canvas
  // Keeps aspect ratio intact within available screen space
  const canvasDimensions = useMemo(() => {
    const maxWidth = windowWidth - 32;
    // Reserve space for header (~60px) and bottom controls (~280px)
    const maxHeight = Math.max(260, windowHeight - 370);

    const aspectRatio = imgWidth / (imgHeight || 1);

    let finalW = maxWidth;
    let finalH = finalW / aspectRatio;

    if (finalH > maxHeight) {
      finalH = maxHeight;
      finalW = finalH * aspectRatio;
    }

    return {
      width: Math.round(finalW),
      height: Math.round(finalH),
    };
  }, [windowWidth, windowHeight, imgWidth, imgHeight]);

  // Determine if any edit has been applied (activates Before/After Slider)
  const isEdited = useMemo(() => {
    if (activeTab === 'bg-removal') {
      return !!bgRemovedUri;
    } else {
      return isEnhancerActive && intensity > 0;
    }
  }, [activeTab, bgRemovedUri, isEnhancerActive, intensity]);

  // Handle Triggering Background Removal with Google ML Kit
  const handleRemoveBackground = async () => {
    try {
      setIsRemovingBg(true);
      setBgProgressMessage('Google ML Kit hazırlanıyor...');

      const result = await removeBackground(originalUri, (msg) => {
        setBgProgressMessage(msg);
      });

      if (result.success && result.uri) {
        setBgRemovedUri(result.uri);
        showToast('Arka plan başarıyla kaldırıldı!', 'success');
      } else {
        showToast(result.error || 'Arka plan silinemedi.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Beklenmedik bir hata oluştu.', 'error');
    } finally {
      setIsRemovingBg(false);
      setBgProgressMessage('');
    }
  };

  // Revert back to original photo
  const handleReset = () => {
    setBgRemovedUri(null);
    setSelectedBgColor('transparent');
    setIntensity(0);
    setIsEnhancerActive(false);
    showToast('Fotoğraf orijinal haline döndürüldü.', 'info');
  };

  // Handle High-Quality Export & Save to Gallery
  const handleSaveToGallery = async () => {
    try {
      setIsSaving(true);

      let targetUriToSave = originalUri;
      let isTransparent = false;

      if (activeTab === 'enhancer' && isEnhancerActive && intensity > 0) {
        // Capture Skia Canvas Snapshot
        if (skiaEnhancerRef.current) {
          const snapshotUri = await skiaEnhancerRef.current.captureSnapshot();
          targetUriToSave = snapshotUri;
        }
      } else if (bgRemovedUri) {
        targetUriToSave = bgRemovedUri;
        isTransparent = selectedBgColor === 'transparent';
      }

      const saveResult = await savePhotoToGallery(targetUriToSave, isTransparent);

      if (saveResult.success) {
        showToast('Fotoğraf cihaz galerisine başarıyla kaydedildi!', 'success');
      } else {
        showToast(saveResult.error || 'Kaydetme başarısız.', 'error');
      }
    } catch (err: any) {
      console.error('[EditorScreen] Save error:', err);
      showToast('Galeriye kaydedilirken bir hata oluştu.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Mode Selection Handler
  const handleSelectMode = (mode: EnhancementMode) => {
    setEnhancementMode(mode);
    setIsEnhancerActive(true);
    if (intensity === 0) {
      setIntensity(50);
    }
  };

  // Intensity Change Handler
  const handleIntensityChange = (val: number) => {
    setIntensity(val);
    if (!isEnhancerActive) {
      setIsEnhancerActive(true);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Toast config={toastConfig} onDismiss={() => setToastConfig((c) => ({ ...c, visible: false }))} />

      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconButton}
          activeOpacity={0.7}
        >
          <ChevronLeft size={22} color={COLORS.textPrimary} />
        </TouchableOpacity>

        {/* Center Info Badge */}
        <View style={styles.headerCenterBadge}>
          <Text style={styles.headerBadgeText}>
            {canvasDimensions.width}x{canvasDimensions.height} px
            {params.isResized === 'true' ? ' • RAM Koruma' : ''}
          </Text>
        </View>

        {/* Action Buttons: Reset & Save */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity
            onPress={handleReset}
            style={styles.headerIconButton}
            activeOpacity={0.7}
          >
            <RotateCcw size={18} color={COLORS.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSaveToGallery}
            style={styles.saveButton}
            activeOpacity={0.8}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Download size={15} color="#ffffff" style={{ marginRight: 4 }} />
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Canvas Area */}
      <View style={styles.canvasContainer}>
        <BeforeAfterSlider
          width={canvasDimensions.width}
          height={canvasDimensions.height}
          originalUri={originalUri}
          processedUri={bgRemovedUri}
          isProcessed={isEdited}
          backgroundColor={activeTab === 'bg-removal' ? selectedBgColor : 'transparent'}
          processedComponent={
            activeTab === 'enhancer' ? (
              <SkiaEnhancer
                ref={skiaEnhancerRef}
                imageUri={bgRemovedUri || originalUri}
                width={canvasDimensions.width}
                height={canvasDimensions.height}
                mode={enhancementMode}
                intensity={isEnhancerActive ? intensity : 0}
                backgroundColor={selectedBgColor}
              />
            ) : undefined
          }
        />
      </View>

      {/* Bottom Controls Sheet */}
      <View style={styles.bottomSheet}>
        {/* Feature Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'bg-removal' && styles.tabItemActive]}
            onPress={() => setActiveTab('bg-removal')}
            activeOpacity={0.8}
          >
            <Wand2
              size={16}
              color={activeTab === 'bg-removal' ? '#ffffff' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'bg-removal' && styles.tabItemTextActive,
              ]}
            >
              Arka Plan Silici
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'enhancer' && styles.tabItemActive]}
            onPress={() => {
              setActiveTab('enhancer');
              if (!isEnhancerActive) setIsEnhancerActive(true);
            }}
            activeOpacity={0.8}
          >
            <Sparkles
              size={16}
              color={activeTab === 'enhancer' ? '#ffffff' : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabItemText,
                activeTab === 'enhancer' && styles.tabItemTextActive,
              ]}
            >
              Netleştirici & HDR
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1 Content: Background Removal */}
        {activeTab === 'bg-removal' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabContentScroll}
          >
            {!bgRemovedUri ? (
              <TouchableOpacity
                style={styles.magicAiButton}
                activeOpacity={0.85}
                onPress={handleRemoveBackground}
                disabled={isRemovingBg}
              >
                {isRemovingBg ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.magicBtnText}>
                      {bgProgressMessage || 'Arka Plan Siliniyor...'}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.loadingRow}>
                    <Wand2 size={18} color="#ffffff" />
                    <Text style={styles.magicBtnText}>
                      Arka Planı Yapay Zeka ile Sil
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.bgSuccessBanner}>
                <View style={styles.bgSuccessLeft}>
                  <Check size={16} color={COLORS.emerald} />
                  <Text style={styles.bgSuccessText}>Arka plan silindi</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBgRemovedUri(null)}
                  style={styles.undoBgButton}
                >
                  <Text style={styles.undoBgText}>Geri Al</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Background Color Palette */}
            <ColorPalettePicker
              selectedColor={selectedBgColor}
              onSelectColor={(color) => setSelectedBgColor(color)}
              disabled={!bgRemovedUri}
            />

            {!bgRemovedUri && (
              <Text style={styles.paletteHint}>
                * Renk seçmek için önce yukarıdaki butonla arka planı silin.
              </Text>
            )}
          </ScrollView>
        )}

        {/* Tab 2 Content: Skia Image Enhancer */}
        {activeTab === 'enhancer' && (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabContentScroll}
          >
            {/* 3 Enhancement Modes */}
            <ModeSelector
              currentMode={enhancementMode}
              onSelectMode={handleSelectMode}
            />

            {/* Intensity Slider (0% - 100%) */}
            <CustomSlider
              value={intensity}
              onValueChange={handleIntensityChange}
              label={`${enhancementMode === 'sharpen' ? 'Netleştirme' : enhancementMode === 'hdr' ? 'Canlılık' : 'Portre Aydınlığı'} Yoğunluğu`}
            />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.bgSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerCenterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: COLORS.bgElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  bottomSheet: {
    backgroundColor: COLORS.bgSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: COLORS.border,
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: 290,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgTertiary,
    borderRadius: 14,
    padding: 3,
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 11,
  },
  tabItemActive: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  tabItemText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabItemTextActive: {
    color: '#ffffff',
  },
  tabContentScroll: {
    paddingBottom: 10,
  },
  magicAiButton: {
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  magicBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  bgSuccessBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 8,
  },
  bgSuccessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bgSuccessText: {
    fontSize: 13,
    color: COLORS.emerald,
    fontWeight: '600',
  },
  undoBgButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: COLORS.bgElevated,
  },
  undoBgText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  paletteHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
