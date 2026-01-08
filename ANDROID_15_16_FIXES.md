# Android 15 & 16 Compatibility Fixes

## Summary

This document summarizes the fixes applied to address Android 15 and Android 16 compatibility issues reported by Google Play Console.

## Issues Fixed

### ✅ 1. Edge-to-Edge Display (Android 15+)
**Status**: Fixed  
**Impact**: Apps targeting SDK 35 must display edge-to-edge by default

**Changes Made**:
- Enabled `enableEdgeToEdge: true` in [`app.json`](app.json:56)
- Created [`withAndroidStyles.js`](plugins/withAndroidStyles.js) plugin with modern edge-to-edge theme
- Theme uses transparent system bars with contrast enforcement

### ✅ 2. Deprecated APIs (Android 15+)
**Status**: Partially Fixed  
**Impact**: Deprecated window color APIs should not be used

**Changes Made**:
- Updated [`withAndroidStyles.js`](plugins/withAndroidStyles.js) to use declarative approach
- Set transparent status/navigation bars in theme instead of programmatically
- Enabled `android:enforceNavigationBarContrast` and `android:enforceStatusBarContrast`

**Remaining Warnings**:
Some deprecated API warnings will persist from third-party libraries:
- React Native core (`StatusBarModule`, `WindowUtilKt`)
- react-native-screens (`ScreenWindowTraits`)
- expo-dev-launcher (`DevLauncherExpoActivityConfigurator`)
- Material components (`BottomSheetDialog`, `EdgeToEdgeUtils`)
- AndroidX Activity (`EdgeToEdgeApi28`)

These will be resolved when the respective libraries update to Android 15+ APIs.

### ✅ 3. Orientation Restrictions (Android 16+)
**Status**: Fixed  
**Impact**: Android 16 ignores orientation restrictions on large screens

**Detected Activities**:
- `com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity`
- `com.onepage.jpjonline.MainActivity`

**Changes Made**:
- Changed global orientation from `"portrait"` to `"default"` in [`app.json`](app.json:6)
- Updated [`withAndroidEdgeToEdge.js`](plugins/withAndroidEdgeToEdge.js) to:
  - Remove all `android:screenOrientation` attributes
  - Set `android:resizeableActivity="true"` for all activities
  - Add comprehensive `android:configChanges` for orientation handling
- Created [`withAndroidManifestActivities.js`](plugins/withAndroidManifestActivities.js) to:
  - Specifically target ML Kit scanner and MainActivity
  - Ensure proper configuration for third-party activities

## Files Modified

### Configuration
- [`app.json`](app.json) - Added new plugin, changed orientation to "default"

### Plugins
- [`plugins/withAndroidEdgeToEdge.js`](plugins/withAndroidEdgeToEdge.js) - Enhanced to handle all activities
- [`plugins/withAndroidStyles.js`](plugins/withAndroidStyles.js) - Updated with modern edge-to-edge theme
- [`plugins/withAndroidManifestActivities.js`](plugins/withAndroidManifestActivities.js) - **NEW** - Handles specific activities

### Documentation
- [`docs/ANDROID_COMPATIBILITY.md`](docs/ANDROID_COMPATIBILITY.md) - Comprehensive guide updated

## Next Steps

### 1. Rebuild the App
```bash
# Clean previous builds
npx expo prebuild --clean

# Build for testing
eas build --platform android --profile preview
```

### 2. Test Thoroughly
- ✅ Test on Android 15+ devices for edge-to-edge display
- ✅ Test on tablets and foldables for resizability
- ✅ Test screen rotation in all orientations
- ✅ Test ML Kit barcode scanner in landscape mode
- ✅ Test split-screen and multi-window modes
- ✅ Verify no content overlap with system bars

### 3. Submit to Google Play
```bash
# Build production version
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### 4. Monitor Warnings
After submission, check Google Play Console for:
- Reduced warnings about orientation restrictions (should be resolved)
- Reduced warnings about resizability (should be resolved)
- Remaining warnings about deprecated APIs (expected from third-party libraries)

## Expected Results

### ✅ Resolved
- Edge-to-edge display warning
- Orientation restriction warnings for MainActivity
- Orientation restriction warnings for ML Kit scanner
- Resizability restriction warnings

### ⚠️ May Persist (Expected)
- Deprecated API warnings from React Native core
- Deprecated API warnings from third-party libraries
- These will be resolved when libraries update

## Testing Checklist

- [ ] App displays edge-to-edge on Android 15+
- [ ] Status bar and navigation bar are transparent
- [ ] Content doesn't overlap with system bars
- [ ] App works in portrait orientation
- [ ] App works in landscape orientation
- [ ] Screen rotation is smooth
- [ ] ML Kit barcode scanner works in all orientations
- [ ] App works on tablets
- [ ] App works on foldables
- [ ] Split-screen mode works correctly
- [ ] Multi-window mode works correctly
- [ ] Keyboard behavior is correct

## Support

For more details, see:
- [`docs/ANDROID_COMPATIBILITY.md`](docs/ANDROID_COMPATIBILITY.md) - Full compatibility guide
- [Android 15 Edge-to-Edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- [Android 16 Large Screen Support](https://developer.android.com/guide/topics/large-screens)

## Timeline

- **Created**: 2026-01-05
- **Android 15 Release**: Q3 2024
- **Android 16 Release**: Q3 2025
- **Target SDK 35 Requirement**: August 2025 (for new apps), November 2025 (for updates)
