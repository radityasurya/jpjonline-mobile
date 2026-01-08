# Release Notes - Version 1.0.2

**Release Date**: January 5, 2026  
**Version**: 1.0.2  
**Build Number (Android)**: 4  
**Platform**: Android

## 🎯 Release Purpose

This release addresses critical Android 15 and Android 16 compatibility requirements mandated by Google Play Console for apps targeting SDK 35.

## ✨ What's New

### Android 15 & 16 Compatibility
- **Edge-to-Edge Display**: Full support for Android 15+ edge-to-edge display requirements
- **Modern System Bars**: Transparent status and navigation bars with automatic contrast enforcement
- **Large Screen Support**: Removed orientation restrictions for tablets and foldables (Android 16+ requirement)
- **Multi-Window Support**: Enhanced support for split-screen and multi-window modes

## 🔧 Technical Changes

### Configuration Updates
- Enabled `enableEdgeToEdge: true` for Android
- Changed orientation from `"portrait"` to `"default"` for better large screen support
- Incremented Android versionCode from 3 to 4

### New Plugins
- **withAndroidManifestActivities**: Handles specific activity configurations for ML Kit scanner and MainActivity
- Enhanced **withAndroidEdgeToEdge**: Removes orientation restrictions and enables resizability
- Updated **withAndroidStyles**: Modern edge-to-edge theme with Android 15+ compatibility

### Fixes
- ✅ Fixed edge-to-edge display warnings
- ✅ Fixed orientation restriction warnings for MainActivity
- ✅ Fixed orientation restriction warnings for ML Kit barcode scanner
- ✅ Fixed resizability restriction warnings
- ✅ Migrated away from deprecated window color APIs

## 📱 User Experience Improvements

- Better support for tablets and foldable devices
- Improved screen rotation handling
- Enhanced multi-window and split-screen experience
- Smoother edge-to-edge display on Android 15+

## 🔍 Known Issues

### Expected Warnings
Some deprecated API warnings may still appear in Google Play Console from third-party libraries:
- React Native core modules
- react-native-screens
- expo-dev-launcher
- Material components
- AndroidX Activity

These warnings are expected and will be resolved when the respective libraries update to support Android 15+ APIs. The app functions correctly despite these warnings.

## 📋 Testing Performed

- ✅ Edge-to-edge display on Android 15+
- ✅ Screen rotation in all orientations
- ✅ Tablet and foldable device compatibility
- ✅ Split-screen and multi-window modes
- ✅ ML Kit barcode scanner in all orientations
- ✅ System bar transparency and contrast
- ✅ Keyboard behavior with pan mode

## 🚀 Deployment

### Build Commands
```bash
# Clean previous builds
npx expo prebuild --clean

# Build production version
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

### Google Play Console
- **Track**: Production
- **Release Type**: Managed Publishing
- **Rollout**: 100% (after testing)

## 📚 Documentation

- [`ANDROID_15_16_FIXES.md`](ANDROID_15_16_FIXES.md) - Summary of fixes
- [`docs/ANDROID_COMPATIBILITY.md`](docs/ANDROID_COMPATIBILITY.md) - Detailed technical guide
- [`plugins/withAndroidEdgeToEdge.js`](plugins/withAndroidEdgeToEdge.js) - Edge-to-edge plugin
- [`plugins/withAndroidStyles.js`](plugins/withAndroidStyles.js) - Styles plugin
- [`plugins/withAndroidManifestActivities.js`](plugins/withAndroidManifestActivities.js) - Activities plugin

## 🔗 References

- [Android 15 Edge-to-Edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- [Android 15 Behavior Changes](https://developer.android.com/about/versions/15/behavior-changes-15)
- [Android 16 Large Screen Support](https://developer.android.com/guide/topics/large-screens)
- [Android 16 Resizability Changes](https://developer.android.com/about/versions/16/behavior-changes-16)

## 📝 Changelog

### Added
- Edge-to-edge display support for Android 15+
- Large screen and foldable device support
- Multi-window and split-screen enhancements
- Three new Expo config plugins for Android compatibility

### Changed
- Android versionCode: 3 → 4
- Orientation: "portrait" → "default"
- System bars: Opaque → Transparent with contrast enforcement

### Fixed
- Edge-to-edge display warnings
- Orientation restriction warnings
- Resizability restriction warnings
- Deprecated API usage in app configuration

### Removed
- Portrait orientation restrictions from all activities
- Resizability restrictions

## 👥 Contributors

- Development Team
- QA Team

## 📞 Support

For issues or questions, please refer to the documentation or contact the development team.

---

**Previous Version**: 1.0.1 (versionCode 3)  
**Current Version**: 1.0.2 (versionCode 4)
