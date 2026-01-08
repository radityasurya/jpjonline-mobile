# Android Compatibility Guide

This document explains the Android compatibility fixes implemented for Android 15+ and Android 16+ requirements.

## Issues Addressed

### 1. Edge-to-Edge Display (Android 15+)
**Problem**: Apps targeting SDK 35 must display edge-to-edge by default on Android 15+.

**Solution**:
- Added `enableEdgeToEdge: true` in [`app.json`](../app.json:56) Android configuration
- Created custom config plugin [`withAndroidEdgeToEdge.js`](../plugins/withAndroidEdgeToEdge.js) to handle edge-to-edge setup
- Created custom config plugin [`withAndroidStyles.js`](../plugins/withAndroidStyles.js) to add edge-to-edge theme with modern Android 15+ approach

### 2. Deprecated APIs (Android 15+)
**Problem**: The following deprecated APIs were being used:
- `android.view.Window.getStatusBarColor()`
- `android.view.Window.setStatusBarColor()`
- `android.view.Window.setNavigationBarColor()`
- `android.view.Window.getNavigationBarColor()`
- `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES`
- `LAYOUT_IN_DISPLAY_CUTOUT_MODE_DEFAULT`

**Solution**:
- Updated [`withAndroidStyles.js`](../plugins/withAndroidStyles.js) to use transparent system bars (modern approach)
- Uses `android:enforceNavigationBarContrast` and `android:enforceStatusBarContrast` for proper contrast
- Avoids deprecated status/navigation bar color APIs by setting them declaratively in theme
- **Note**: Some deprecated API warnings may still appear from React Native core and third-party libraries (react-native-screens, expo-dev-launcher, Material components). These will be resolved when those libraries update to Android 15+ APIs.

### 3. Resizability and Orientation Restrictions (Android 16+)
**Problem**: Android 16 will ignore resizability and orientation restrictions on large screen devices (foldables, tablets), causing layout issues.

**Detected Issues**:
- `com.google.mlkit.vision.codescanner.internal.GmsBarcodeScanningDelegateActivity` with `android:screenOrientation="PORTRAIT"`
- `com.onepage.jpjonline.MainActivity` with `android:screenOrientation="PORTRAIT"`

**Solution**:
- Changed global orientation from `"portrait"` to `"default"` in [`app.json`](../app.json:6)
- Created [`withAndroidEdgeToEdge.js`](../plugins/withAndroidEdgeToEdge.js) plugin that automatically:
  - Removes `android:screenOrientation` from all activities
  - Removes `android:resizeableActivity="false"` restrictions
  - Sets `android:resizeableActivity="true"` for all activities
  - Adds proper `android:configChanges` to handle orientation and screen size changes
- Created [`withAndroidManifestActivities.js`](../plugins/withAndroidManifestActivities.js) plugin to specifically handle:
  - ML Kit barcode scanner activity
  - MainActivity
  - Any other third-party activities that need configuration
- Added `softwareKeyboardLayoutMode: "pan"` for better keyboard handling on different screen sizes

## Configuration Changes

### app.json
```json
{
  "expo": {
    "orientation": "default",  // Changed from "portrait"
    "android": {
      "enableEdgeToEdge": true,
      "softwareKeyboardLayoutMode": "pan",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/icon.png",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "./plugins/withAndroidEdgeToEdge",
      "./plugins/withAndroidStyles",
      "./plugins/withAndroidManifestActivities"
    ]
  }
}
```

## Custom Config Plugins

### 1. withAndroidEdgeToEdge.js
**Purpose**: Handle edge-to-edge display and remove orientation restrictions

**Actions**:
- Applies `Theme.App.EdgeToEdge` theme to the application
- Removes `android:screenOrientation` from all activities
- Removes `android:resizeableActivity="false"` restrictions
- Sets `android:resizeableActivity="true"` for all activities
- Adds comprehensive `android:configChanges` to handle orientation, screen size, and layout changes

### 2. withAndroidStyles.js
**Purpose**: Create modern edge-to-edge theme compatible with Android 15+

**Actions**:
- Creates `Theme.App.EdgeToEdge` style with `Theme.AppCompat.Light.NoActionBar` parent
- Sets transparent status and navigation bars using declarative approach
- Enables `android:enforceNavigationBarContrast` and `android:enforceStatusBarContrast`
- Configures proper window flags for edge-to-edge display
- Supports foldables and large screens

### 3. withAndroidManifestActivities.js
**Purpose**: Configure specific third-party activities

**Actions**:
- Targets specific activities by name (ML Kit scanner, MainActivity)
- Removes orientation restrictions from these activities
- Enables resizability
- Adds proper config changes for multi-window and orientation support
- Runs after other plugins to ensure third-party activities are properly configured

## Testing

To test these changes:

1. **Clean and rebuild the app**:
   ```bash
   # Clean previous builds
   npx expo prebuild --clean
   
   # Build for Android
   eas build --platform android --profile preview
   ```

2. **Test on different devices**:
   - Test on Android 15+ devices to verify edge-to-edge display
   - Test on Android 16+ devices (or emulator) for orientation handling
   - Test on tablets and foldables to verify resizability
   - Test screen rotation in all orientations
   - Test split-screen and multi-window modes

3. **Verify layouts**:
   - Check that content doesn't overlap with system bars
   - Verify proper insets handling with `SafeAreaView`
   - Test on different screen sizes and orientations
   - Verify ML Kit barcode scanner works in all orientations
   - Test keyboard behavior with `softwareKeyboardLayoutMode: "pan"`

4. **Check for warnings**:
   - Build the app and check Google Play Console for warnings
   - Some deprecated API warnings from third-party libraries are expected and will be resolved by library updates

## Known Limitations

### Deprecated API Warnings from Third-Party Libraries

Some deprecated API warnings may still appear from:

1. **React Native Core**:
   - `com.facebook.react.modules.statusbar.StatusBarModule`
   - `com.facebook.react.views.view.WindowUtilKt`

2. **React Native Screens**:
   - `com.swmansion.rnscreens.ScreenWindowTraits`

3. **Expo Dev Launcher**:
   - `expo.modules.devlauncher.launcher.configurators.DevLauncherExpoActivityConfigurator`

4. **Material Components**:
   - `com.google.android.material.bottomsheet.BottomSheetDialog`
   - `com.google.android.material.sidesheet.SheetDialog`
   - `com.google.android.material.internal.EdgeToEdgeUtils`

5. **AndroidX Activity**:
   - `androidx.activity.EdgeToEdgeApi28`

**Resolution**: These warnings will be automatically resolved when the respective libraries update to support Android 15+ APIs. The app will still function correctly on Android 15+ despite these warnings.

## Future Considerations

1. **Library Updates**: Monitor and update these libraries when new versions are released:
   - `react-native` - Core framework
   - `react-native-screens` - Screen management
   - `expo-dev-launcher` - Development tools
   - `@react-native-community/material` - Material components

2. **Layout Testing**: Thoroughly test all screens in:
   - Portrait and landscape orientations
   - Different screen sizes (phones, tablets, foldables)
   - Split-screen mode
   - Multi-window mode
   - Different Android versions (14, 15, 16+)

3. **Insets Handling**: Ensure all screens properly handle system insets using:
   - `SafeAreaView` from React Native
   - `useSafeAreaInsets()` hook from react-native-safe-area-context
   - Proper padding for system bars
   - Test with different system UI configurations

4. **Edge Cases**:
   - Test with system font size changes
   - Test with display size changes
   - Test with different system themes (light/dark)
   - Test with gesture navigation vs button navigation

## Build Commands

```bash
# Clean prebuild
npx expo prebuild --clean

# Development build
eas build --platform android --profile development

# Preview build (for testing)
eas build --platform android --profile preview

# Production build
eas build --platform android --profile production

# Submit to Google Play
eas submit --platform android
```

## References

- [Android 15 Edge-to-Edge](https://developer.android.com/develop/ui/views/layout/edge-to-edge)
- [Android 15 Behavior Changes](https://developer.android.com/about/versions/15/behavior-changes-15)
- [Android 16 Large Screen Support](https://developer.android.com/guide/topics/large-screens)
- [Android 16 Resizability Changes](https://developer.android.com/about/versions/16/behavior-changes-16)
- [Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
- [React Native Safe Area Context](https://github.com/th3rdwave/react-native-safe-area-context)
