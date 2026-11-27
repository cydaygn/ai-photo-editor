import { ColorOption } from '../types/editor';

export const COLORS = {
  // Backgrounds
  bgPrimary: '#09090b',    // deep zinc
  bgSecondary: '#121217',  // card dark
  bgTertiary: '#1c1c24',   // elevated
  bgElevated: '#242430',
  
  // Accents
  accent: '#6366f1',       // indigo-500
  accentHover: '#4f46e5',
  accentLight: 'rgba(99, 102, 241, 0.15)',
  accentGlow: 'rgba(99, 102, 241, 0.35)',

  // Secondary Accents
  cyan: '#06b6d4',
  purple: '#a855f7',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',

  // Neutrals / Text
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  border: '#272732',
  borderLight: '#3f3f50',
  
  // States
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Canvas
  checkerLight: '#262631',
  checkerDark: '#1a1a23',
};

export const COLOR_PALETTE_OPTIONS: ColorOption[] = [
  { id: 'transparent', name: 'Şeffaf (PNG)', color: 'transparent', isTransparent: true },
  { id: 'white', name: 'Beyaz', color: '#FFFFFF' },
  { id: 'black', name: 'Siyah', color: '#000000' },
  { id: 'red', name: 'Kırmızı', color: '#EF4444' },
  { id: 'blue', name: 'Mavi', color: '#3B82F6' },
  { id: 'yellow', name: 'Sarı', color: '#EAB308' },
  { id: 'emerald', name: 'Zümrüt', color: '#10B981' },
  { id: 'purple', name: 'Mor', color: '#8B5CF6' },
  { id: 'cyan', name: 'Turkuaz', color: '#06B6D4' },
  { id: 'gray', name: 'Koyu Gri', color: '#334155' },
];

export const ENHANCEMENT_MODES = [
  {
    id: 'sharpen' as const,
    title: 'HD Netleştir',
    subtitle: 'Bulanıklığı giderir & kenar detaylarını keskinleştirir',
    iconName: 'Sparkles',
    badge: 'High-Pass',
  },
  {
    id: 'hdr' as const,
    title: 'Canlılaştır (HDR)',
    subtitle: 'Renk doygunluğunu, dinamik aralığı & kontrastı optimize eder',
    iconName: 'SunMedium',
    badge: 'HDR Boost',
  },
  {
    id: 'portrait' as const,
    title: 'Portre / Yüz Aydınlat',
    subtitle: 'Gölgeleri açar, cilt tonunu canlandırır & yüzü öne çıkarır',
    iconName: 'UserRound',
    badge: 'Face Clarity',
  },
];
