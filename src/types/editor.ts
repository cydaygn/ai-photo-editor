export type EnhancementMode = 'sharpen' | 'hdr' | 'portrait';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface OptimizedImageResult {
  uri: string;
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  isResized: boolean;
}

export interface BgRemovalResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export interface ColorOption {
  id: string;
  name: string;
  color: string; // 'transparent' or hex code
  isTransparent?: boolean;
}

export interface EditorState {
  originalUri: string;
  currentOptimizedUri: string;
  bgRemovedUri: string | null;
  dimensions: ImageDimensions;
  activeTab: 'bg-removal' | 'enhancer';
  bgRemoval: {
    isProcessing: boolean;
    hasRemoved: boolean;
    selectedColor: string; // 'transparent' or hex
    statusMessage: string;
  };
  enhancer: {
    mode: EnhancementMode;
    intensity: number; // 0 to 100
    isProcessing: boolean;
  };
  sliderPosition: number; // 0 to 1
}
