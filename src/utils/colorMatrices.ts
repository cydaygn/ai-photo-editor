import { EnhancementMode } from '../types/editor';

// Identity 4x5 Color Matrix (20 elements)
export const IDENTITY_MATRIX: number[] = [
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

// Helper to linearly interpolate between two matrices
export function lerpMatrix(from: number[], to: number[], t: number): number[] {
  const clampedT = Math.max(0, Math.min(1, t));
  return from.map((v, i) => v + (to[i] - v) * clampedT);
}

/**
 * HD Netleştir (Sharpen / High-Pass Micro-Contrast) Color Matrix
 * Enhances micro-edges, acutance, and perceived sharpness.
 */
export function getSharpenColorMatrix(intensity: number): number[] {
  const t = Math.max(0, Math.min(1, intensity / 100));
  
  // Contrast boost with midtone expansion for perceived sharpness
  const contrast = 1.0 + t * 0.40;
  const offset = 0.5 * (1.0 - contrast);
  
  // High-pass clarity punch
  const target: number[] = [
    contrast * 1.05, -0.03 * t,       -0.02 * t,       0, offset * 255,
    -0.02 * t,       contrast * 1.05, -0.03 * t,       0, offset * 255,
    -0.02 * t,       -0.03 * t,       contrast * 1.05, 0, offset * 255,
    0,               0,               0,               1, 0,
  ];

  return lerpMatrix(IDENTITY_MATRIX, target, t);
}

/**
 * Canlılaştır (HDR Boost) Color Matrix
 * Enhances dynamic range, vivid color saturation, and punchy contrast.
 */
export function getHdrBoostColorMatrix(intensity: number): number[] {
  const t = Math.max(0, Math.min(1, intensity / 100));

  // Saturation factor (from 1.0 at 0% to 1.65 at 100%)
  const sat = 1.0 + t * 0.65;
  const invSat = 1.0 - sat;

  // Rec.709 Luminance coefficients
  const lr = 0.2126;
  const lg = 0.7152;
  const lb = 0.0722;

  const rR = invSat * lr + sat;
  const rG = invSat * lg;
  const rB = invSat * lb;

  const gR = invSat * lr;
  const gG = invSat * lg + sat;
  const gB = invSat * lb;

  const bR = invSat * lr;
  const bG = invSat * lg;
  const bB = invSat * lb + sat;

  // Additional contrast curve
  const contrast = 1.0 + t * 0.25;
  const offset = 0.5 * (1.0 - contrast) * 255;

  const target: number[] = [
    rR * contrast, rG * contrast, rB * contrast, 0, offset + (t * 8),
    gR * contrast, gG * contrast, gB * contrast, 0, offset + (t * 8),
    bR * contrast, bG * contrast, bB * contrast, 0, offset + (t * 8),
    0,             0,             0,             1, 0,
  ];

  return lerpMatrix(IDENTITY_MATRIX, target, t);
}

/**
 * Portre / Yüz Aydınlat (Portrait / Face Glow) Color Matrix
 * Gently lifts dark shadows, balances skin tones, warms highlights,
 * and makes facial features pop without blowing out highlights.
 */
export function getPortraitColorMatrix(intensity: number): number[] {
  const t = Math.max(0, Math.min(1, intensity / 100));

  // Shadow lift offset (lifts dark eye circles & harsh shadows)
  const shadowLift = t * 24; 
  // Gentle skin warmth (subtle red/gold tone)
  const redGain = 1.0 + t * 0.12;
  const greenGain = 1.0 + t * 0.06;
  const blueGain = 1.0 - t * 0.02;

  const target: number[] = [
    redGain,   0,         0,         0, shadowLift,
    0,         greenGain, 0,         0, shadowLift * 0.85,
    0,         0,         blueGain,  0, shadowLift * 0.60,
    0,         0,         0,         1, 0,
  ];

  return lerpMatrix(IDENTITY_MATRIX, target, t);
}

/**
 * Retrieves the appropriate 4x5 ColorMatrix based on selected mode and intensity (0-100).
 */
export function getColorMatrixForMode(mode: EnhancementMode, intensity: number): number[] {
  switch (mode) {
    case 'sharpen':
      return getSharpenColorMatrix(intensity);
    case 'hdr':
      return getHdrBoostColorMatrix(intensity);
    case 'portrait':
      return getPortraitColorMatrix(intensity);
    default:
      return IDENTITY_MATRIX;
  }
}
