const { withAndroidManifest } = require('@expo/config-plugins');

/**
 * Expo Config Plugin to automatically configure Google ML Kit Vision dependencies
 * in AndroidManifest.xml.
 *
 * This injects:
 * <meta-data
 *   android:name="com.google.mlkit.vision.DEPENDENCIES"
 *   android:value="subject_segment" />
 *
 * This triggers Google Play Services to automatically download the subject segmentation
 * model on Android upon app installation, enabling 100% on-device AI background removal.
 */
const withMlKitManifest = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application?.[0];

    if (!mainApplication) {
      console.warn('[withMlKitManifest] No application tag found in AndroidManifest.xml');
      return config;
    }

    if (!mainApplication['meta-data']) {
      mainApplication['meta-data'] = [];
    }

    const mlKitDepName = 'com.google.mlkit.vision.DEPENDENCIES';
    const mlKitDepValue = 'subject_segment';

    const existingMeta = mainApplication['meta-data'].find(
      (item) => item.$ && item.$['android:name'] === mlKitDepName
    );

    if (existingMeta) {
      // If already present, ensure subject_segment is included
      const currentVal = existingMeta.$['android:value'] || '';
      if (!currentVal.includes('subject_segment')) {
        existingMeta.$['android:value'] = currentVal
          ? `${currentVal},${mlKitDepValue}`
          : mlKitDepValue;
      }
    } else {
      mainApplication['meta-data'].push({
        $: {
          'android:name': mlKitDepName,
          'android:value': mlKitDepValue,
        },
      });
    }

    return config;
  });
};

module.exports = withMlKitManifest;
