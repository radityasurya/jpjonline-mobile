# EAS Build & Submission Guide for JPJOnline

This guide provides step-by-step instructions for building and submitting your JPJOnline app to both iOS App Store and Google Play Store using Expo Application Services (EAS).

## 📋 Prerequisites

### Required Tools
```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login
```

### Required Accounts
- **Expo Account**: Free account at [expo.dev](https://expo.dev)
- **Apple Developer Account**: $99/year for iOS App Store
- **Google Play Console Account**: $25 one-time fee for Android

## 🔧 Initial Setup

### 1. Configure EAS Build
```bash
# Initialize EAS configuration (if not already done)
eas build:configure
```

This creates/updates your `eas.json` file with build profiles.

### 2. Update App Configuration
Ensure your `app.json` has the correct bundle identifiers:

```json
{
  "expo": {
    "name": "JPJOnline App",
    "slug": "jpjonline",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.onepage.jpjonline",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.onepage.jpjonline",
      "versionCode": 1
    }
  }
}
```

## 🍎 iOS Build & Submission

### Step 1: Build for iOS

#### Development Build (for testing)
```bash
eas build --platform ios --profile development
```

#### Production Build (for App Store)
```bash
eas build --platform ios --profile production
```

**Important**: EAS automatically runs **preflight checks** during iOS builds to catch common App Store rejection issues:
- Missing or invalid Info.plist entries
- Unused permission strings (like your NSCameraUsageDescription issue)
- Bundle identifier conflicts
- Invalid app icons or assets
- Code signing issues

If preflight fails, the build will stop and show you exactly what needs to be fixed before proceeding.

### Step 2: Submit to App Store

#### Automatic Submission
```bash
eas submit --platform ios
```

#### Manual Submission Steps
1. **Download the IPA file** from EAS build dashboard
2. **Upload to App Store Connect** using:
   - Xcode Organizer, or
   - Transporter app, or
   - App Store Connect web interface

3. **Configure App Store listing**:
   - App name: "JPJOnline App"
   - Description: Malaysian driving license preparation app
   - Keywords: JPJ, driving, license, Malaysia, test, exam
   - Screenshots: Required for all device sizes
   - App category: Education

4. **Set app information**:
   - Age rating: 4+ (Educational content)
   - Price: Free (with in-app purchases if applicable)
   - Availability: Malaysia and other desired countries

5. **Submit for review**

### Step 3: Handle App Store Review
If rejected (like your camera permission issue):

1. **Fix the issue** (remove unused dependencies)
2. **Increment build number** in `app.json`
3. **Rebuild and resubmit**:
   ```bash
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

## 🤖 Android Build & Submission

### Step 1: Generate Signing Key (First time only)
```bash
# EAS will generate and manage your signing key automatically
# Or use existing keystore:
eas credentials
```

### Step 2: Build for Android

#### Development Build (APK for testing)
```bash
eas build --platform android --profile development
```

#### Preview Build (APK for internal testing)
```bash
eas build --platform android --profile preview
```

#### Production Build (AAB for Play Store)
```bash
eas build --platform android --profile production
```

### Step 3: Submit to Google Play Store

#### Automatic Submission
```bash
eas submit --platform android
```

#### Manual Submission Steps
1. **Download the AAB file** from EAS build dashboard
2. **Upload to Google Play Console**:
   - Go to [Google Play Console](https://play.google.com/console)
   - Select your app
   - Go to "Release" → "Production"
   - Upload the AAB file

3. **Configure Play Store listing**:
   - App name: "JPJOnline App"
   - Short description: Malaysian JPJ driving test preparation
   - Full description: Comprehensive app for Malaysian driving license preparation
   - Screenshots: Required for phone and tablet
   - Feature graphic: 1024x500px banner image
   - App category: Education
   - Content rating: Everyone

4. **Set up app content**:
   - Privacy policy URL (required)
   - Target audience: 13+ (or appropriate age)
   - Content rating questionnaire

5. **Release to production**

## 🔄 Build Profiles Explained

Your `eas.json` contains different build profiles:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

- **Development**: For testing with Expo Dev Client
- **Preview**: Internal testing builds (APK/IPA)
- **Production**: App store ready builds (AAB/IPA)

## 🚀 Quick Commands Reference

### Building
```bash
# Build for both platforms (production)
eas build --platform all --profile production

# Build specific platform
eas build --platform ios --profile production
eas build --platform android --profile production

# Dry run (check without building) - useful for preflight validation
eas build --platform ios --profile production --dry-run

# Check build status
eas build:list

# View build logs
eas build:view [BUILD_ID]
```

### Submitting
```bash
# Submit to both stores
eas submit --platform all

# Submit specific platform
eas submit --platform ios
eas submit --platform android

# Check submission status
eas submit:list
```

### Managing Credentials
```bash
# View/manage credentials
eas credentials

# Reset credentials (if needed)
eas credentials --platform ios --clear-all
eas credentials --platform android --clear-all
```

## 🔧 Troubleshooting Common Issues

### iOS Issues

#### 1. Preflight Check Failures
EAS runs preflight checks before building. Common failures:

**Missing Permissions (Your Current Issue)**
```bash
# Remove unused dependencies first
npm uninstall expo-camera expo-blur expo-secure-store

# Update app.json to remove unused plugins
# Then rebuild - preflight will verify the fix
eas build --platform ios --profile production
```

**Invalid Bundle Identifier**
- Preflight will catch bundle ID mismatches
- Ensure it matches your Apple Developer account

**Missing App Icons**
- Preflight verifies all required icon sizes are present
- Check `assets/images/icon.png` meets requirements

#### 2. Bundle Identifier Issues
- Ensure bundle ID matches Apple Developer account
- Check for typos in `app.json`

#### 3. Provisioning Profile Issues
```bash
# Clear and regenerate credentials
eas credentials --platform ios --clear-all
eas build --platform ios --profile production
```

### Android Issues

#### 1. Signing Key Problems
```bash
# Reset Android credentials
eas credentials --platform android --clear-all
```

#### 2. Version Code Conflicts
- Increment `versionCode` in `app.json`
- Or use `autoIncrement: true` in production profile

## 📱 Testing Your Builds

### Internal Testing
1. **iOS**: Use TestFlight for beta testing
2. **Android**: Use Google Play Console internal testing

### Installing Development Builds
```bash
# Install on connected device
# iOS: Use Xcode or Apple Configurator
# Android: Install APK directly

# Or use Expo Dev Client
npx expo install expo-dev-client
eas build --platform ios --profile development
```

## 📊 Monitoring & Analytics

### Build Monitoring
- Check build status at [expo.dev/builds](https://expo.dev/builds)
- Set up build notifications in Expo dashboard

### App Store Analytics
- **iOS**: App Store Connect analytics
- **Android**: Google Play Console statistics

## 🔄 Update Workflow

### Over-the-Air Updates (for minor changes)
```bash
# Install EAS Update
npx expo install expo-updates

# Publish update
eas update --branch production --message "Bug fixes"
```

### App Store Updates (for major changes)
1. Update version in `app.json`
2. Build new version
3. Submit to stores
4. Wait for approval

## 🎨 App Icon Configuration for Apple App Store

### 1. **App Icon in Your Code (app.json)**

Your current configuration in [`app.json`](app.json):
```json
{
  "expo": {
    "icon": "./assets/images/icon.png"  // This is your app icon
  }
}
```

**Requirements for the icon file:**
- **Size**: 1024x1024 pixels (minimum)
- **Format**: PNG (no transparency for iOS)
- **Location**: [`assets/images/icon.png`](assets/images/icon.png) ✅ (you have this)

### 2. **App Store Connect Icon Upload**

When you submit to the App Store, you need to upload the icon in **App Store Connect**:

#### **Automatic Upload (Recommended)**
EAS automatically extracts and uploads your icon when you run:
```bash
eas submit --platform ios
```

#### **Manual Upload in App Store Connect**
If you need to upload manually:

1. **Go to App Store Connect**: [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Select your app**: "JPJOnline App"
3. **Go to App Information** → **App Store Icon**
4. **Upload Requirements**:
   - **Size**: Exactly 1024x1024 pixels
   - **Format**: PNG or JPEG
   - **No transparency**: Solid background required
   - **No rounded corners**: Apple adds them automatically

### 3. **Icon Size Requirements**

Apple requires different icon sizes for different contexts:

| Context | Size | Auto-generated by Expo |
|---------|------|------------------------|
| App Store | 1024x1024 | ✅ From your icon.png |
| iPhone App | 60x60, 120x120, 180x180 | ✅ Auto-generated |
| iPad App | 76x76, 152x152 | ✅ Auto-generated |
| Settings | 29x29, 58x58, 87x87 | ✅ Auto-generated |
| Spotlight | 40x40, 80x80, 120x120 | ✅ Auto-generated |

**Good News**: Expo automatically generates all required sizes from your single 1024x1024 icon.png file!

### 4. **Verify Your Current Icon**

Check your current icon file:
```bash
# Check icon dimensions
file assets/images/icon.png
```

**Your icon should be:**
- At least 1024x1024 pixels
- PNG format
- No transparency (solid background)
- Square aspect ratio

### 5. **Icon Best Practices**

- **Simple Design**: Clear and recognizable at small sizes
- **No Text**: Avoid text in the icon (use app name instead)
- **Consistent Branding**: Match your app's visual identity
- **Test at Different Sizes**: Ensure it looks good when scaled down

### 6. **Troubleshooting Icon Issues**

**If your icon is rejected:**

1. **Check dimensions**: Must be exactly 1024x1024
2. **Remove transparency**: Use solid background
3. **Avoid rounded corners**: Apple adds them automatically
4. **No offensive content**: Follow Apple's guidelines

**Update your icon:**
1. Replace [`assets/images/icon.png`](assets/images/icon.png) with new version
2. Rebuild: `eas build --platform ios --profile production`
3. Resubmit: `eas submit --platform ios`

## 🔄 Version Management & Internal Testing

### Bumping Version Numbers

Before building for internal testing or production, you need to update version numbers:

#### 1. **Update App Version (Semantic Versioning)**
In [`app.json`](app.json):
```json
{
  "expo": {
    "version": "1.0.1", // Increment for new releases
    "ios": {
      "buildNumber": "2" // Increment for each iOS build
    },
    "android": {
      "versionCode": 2 // Increment for each Android build
    }
  }
}
```

#### 2. **Version Bumping Commands**
```bash
# Quick version bump (patch version: 1.0.0 → 1.0.1)
npm version patch

# Minor version bump (1.0.0 → 1.1.0)
npm version minor

# Major version bump (1.0.0 → 2.0.0)
npm version major
```

**Note**: These commands update `package.json`. You still need to manually update `app.json`.

### Internal Testing Workflow

#### Step 1: Build for Internal Testing
```bash
# Build preview version for internal testing
eas build --platform all --profile preview

# Or build specific platform
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

#### Step 2: Distribute to Internal Testers

**iOS - TestFlight Internal Testing:**
```bash
# Submit to TestFlight for internal testing
eas submit --platform ios --profile preview
```

**Android - Internal Testing Track:**
```bash
# Submit to Google Play Internal Testing
eas submit --platform android --profile preview
```

#### Step 3: Manual Distribution (Alternative)
```bash
# Get build URLs for manual distribution
eas build:list

# Share the download links with your internal testers
# iOS: .ipa file (install via TestFlight or Apple Configurator)
# Android: .apk file (direct install)
```

### Complete Internal Testing Commands

**Quick Internal Testing Release:**
```bash
# 1. Update version in app.json (done above: v1.0.1, build 2)

# 2. Build for internal testing
eas build --platform all --profile preview

# 3. Submit to internal testing tracks
eas submit --platform all --profile preview

# 4. Check status
eas build:list
eas submit:list
```

### Version History Tracking

Keep track of your releases:

| Version | Build | Platform | Type | Date | Notes |
|---------|-------|----------|------|------|-------|
| 1.0.0 | 1 | iOS/Android | Production | 2024-01-15 | Initial release |
| 1.0.1 | 2 | iOS/Android | Internal | 2024-01-20 | Demo accounts disabled |

## 📋 Pre-Submission Checklist

### Before Building
- [ ] Remove unused dependencies (expo-camera, etc.)
- [ ] Update version numbers
- [ ] Test on physical devices
- [ ] Verify all features work offline
- [ ] Check app icons and splash screens
- [ ] **Disable demo accounts**: Set `showDemoAccounts: false` in `config/app.js`
- [ ] Run preflight check: `eas build --platform ios --profile production --dry-run`

### Before Submitting
- [ ] Test production build thoroughly
- [ ] Prepare app store screenshots
- [ ] Write compelling app descriptions
- [ ] Set up privacy policy (required)
- [ ] Configure age ratings appropriately

### iOS Specific
- [ ] Verify bundle identifier
- [ ] Check Info.plist permissions
- [ ] Test on multiple iOS versions
- [ ] Prepare App Store Connect metadata
- [ ] Ensure no demo/test features are visible in production build
- [ ] Verify app icon meets Apple requirements (1024x1024px)

### Android Specific
- [ ] Test on multiple Android versions
- [ ] Verify package name
- [ ] Prepare Play Store listing
- [ ] Set up content rating
- [ ] Ensure no demo/test features are visible in production build

## 🆘 Getting Help

### Official Resources
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Forums](https://forums.expo.dev/)

### Common Commands for Help
```bash
# Get help for any command
eas build --help
eas submit --help

# Check EAS status
eas whoami
eas build:list
```

---

**Remember**: Always test your builds thoroughly before submitting to app stores. The review process can take 1-7 days for iOS and 1-3 days for Android.