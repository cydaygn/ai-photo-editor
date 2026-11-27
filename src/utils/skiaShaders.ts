import { Skia } from '@shopify/react-native-skia';

/**
 * GPU-accelerated SkSL Unsharp Mask & Sharpening Shader.
 * Samples neighboring pixels in real time and computes high-pass convolution
 * to remove blur and boost fine edge details.
 */
export const SHARPEN_SKSL = `
uniform shader image;
uniform float intensity; // 0.0 to 1.0
uniform vec2 resolution;

vec4 main(vec2 coord) {
  vec4 center = image.eval(coord);
  if (intensity <= 0.001) {
    return center;
  }

  // 1 pixel offset in normalized UV space
  vec2 step = 1.0 / resolution;

  // Sample 4 cross neighbors (Laplacian)
  vec4 up    = image.eval(coord + vec2(0.0, -step.y));
  vec4 down  = image.eval(coord + vec2(0.0,  step.y));
  vec4 left  = image.eval(coord + vec2(-step.x, 0.0));
  vec4 right = image.eval(coord + vec2( step.x, 0.0));

  // 3x3 high-pass unsharp kernel
  // [ 0, -1,  0]
  // [-1,  5, -1]
  // [ 0, -1,  0]
  vec4 sharpened = center * 5.0 - (up + down + left + right);
  sharpened.a = center.a;

  // Blend with original depending on user intensity
  return mix(center, clamp(sharpened, 0.0, 1.0), intensity * 0.85);
}
`;

/**
 * Compiles the SkSL runtime effect safely.
 */
export function getSharpenRuntimeEffect() {
  try {
    return Skia.RuntimeEffect.Make(SHARPEN_SKSL);
  } catch (err) {
    console.warn('[SkiaEnhancer] Could not compile SkSL shader, falling back to ColorMatrix:', err);
    return null;
  }
}
