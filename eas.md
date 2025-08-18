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