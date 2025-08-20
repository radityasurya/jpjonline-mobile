# JPJOnline Basic Setup Notes

This document outlines the essential steps to set up the project, configure environments, build, test, and prepare for submission.

## 1) Prerequisites

- Node.js v18+
- npm or yarn
- Expo CLI: `npm i -g @expo/cli`
- EAS CLI: `npm i -g eas-cli`
- iOS (macOS): Xcode and Apple Developer account
- Android: Android SDK / Android Studio and Google Play Console
- Git

## 2) Clone & Install

```bash
git clone <repository-url>
cd jpjonline-mobile
npm install
```

## 3) Project Structure (high-level)

- App routes: [`app/`](app/)
- Auth screens: [`app/auth/`](app/auth/)
- Tabs: [`app/(tabs)/`](app/(tabs)/)
- Components: [`components/`](components/)
- Services (API, auth, storage): [`services/`](services/)
- Config: [`config/`](config/)
  - API config: [`config/api.js`](config/api.js)
  - App flags: [`config/app.js`](config/app.js)
- Docs: [`docs/`](docs/)

## 4) Environment Configuration

Centralized API config: [`config/api.js`](config/api.js)

- Set the correct BASE_URL:
  - Development example:
    ```js
    export const API_CONFIG = {
      BASE_URL: 'http://localhost:3000',
      // ...
    };
    ```
  - Production example:
    ```js
    export const API_CONFIG = {
      BASE_URL: 'https://api.jpjonline.com',
      // ...
    };
    ```
- Endpoints are defined under `API_CONFIG.ENDPOINTS` and consumed via `buildApiUrl(endpoint)`

App behavior flags: [`config/app.js`](config/app.js)

- Demo accounts visibility:
  ```js
  const DEMO_CONFIG = {
    showDemoAccounts: false, // keep false for store builds
    // ...
  };
  ```

## 5) Development

Start the dev server:

```bash
npm run dev
```

- Expo Dev Tools opens in your browser
- Press `i` for iOS simulator, `a` for Android emulator
- Mobile (Expo Go): scan QR code

Useful scripts:

- Lint: `npm run lint`
- Build web: `npm run build:web` (outputs to `dist/`)

## 6) Building with EAS

Ensure EAS is configured: [`eas.json`](eas.json)

- Key profiles:
  - development: Dev Client/Internal
  - preview: Internal testing builds
  - production: Store builds (autoIncrement true)

Build commands:

```bash
# iOS
eas build --platform ios --profile preview
eas build --platform ios --profile production

# Android
eas build --platform android --profile preview
eas build --platform android --profile production

# Both
eas build --platform all --profile production
```

Preflight (iOS):

```bash
eas build --platform ios --profile production --dry-run
```

## 7) Submitting with EAS

```bash
# iOS (TestFlight/App Store)
eas submit --platform ios

# Android (Play Console)
eas submit --platform android

# Both
eas submit --platform all
```

Submission requirements:

- Bumped versions in [`app.json`](app.json):
  - `"version"` (semver)
  - `"ios.buildNumber"` (string, increment each build)
  - `"android.versionCode"` (integer, increment each build)
- App icon: [`assets/images/icon.png`](assets/images/icon.png) (1024x1024, no transparency)
- Permissions: Only what you use (remove unused modules like `expo-camera` if not used)

## 8) Versioning

Update app.json before builds:

```json
{
  "expo": {
    "version": "1.0.1",
    "ios": { "buildNumber": "2" },
    "android": { "versionCode": 2 }
  }
}
```

Optional: bump `package.json` as well:

```bash
npm version patch|minor|major
```

## 9) Authentication Integration Summary

Based on [`docs/auth.md`](docs/auth.md):

- Signup: `POST /api/auth/signup` (requires: name, email, password, confirmPassword, acceptTerms)
- Forgot password: `POST /api/auth/forgot-password`
- Reset token verify: `GET /api/auth/reset-password?token=...`
- Reset password: `POST /api/auth/reset-password`

App implementations:
- Register screen: [`app/auth/register.tsx`](app/auth/register.tsx) shows inline field errors and navigates to welcome screen on success
- Forgot password: [`app/auth/forgot-password.tsx`](app/auth/forgot-password.tsx) uses centralized API, handles 429
- Reset password: [`app/auth/reset-password.tsx`](app/auth/reset-password.tsx) validates token and performs reset
- Welcome screen: [`app/auth/welcome.tsx`](app/auth/welcome.tsx) consistent with auth page styling

## 10) Production Readiness Checklist (quick)

- [ ] API BASE_URL set to production
- [ ] Demo accounts hidden: [`config/app.js`](config/app.js)
- [ ] Remove unused Expo modules (e.g., `expo-camera`) to avoid permission strings
- [ ] iOS preflight (dry run) passes
- [ ] App icon 1024x1024, no transparency
- [ ] Version bumped in app.json
- [ ] Manual tests passed (see [`docs/manual-test-checklist.md`](docs/manual-test-checklist.md))

## 11) Troubleshooting

- iOS preflight fails (permissions, Info.plist):
  - Remove unused native modules requiring permissions
  - Ensure Info.plist values are correct (encryption, usage descriptions)
- 429 Too Many Requests on forgot password:
  - Respect rate limiting, retry after suggested window
- Alerts don’t show on web:
  - Prefer in-app screens/UX over `Alert.alert` for web parity
- Navigation not updating after auth:
  - Ensure `router.replace('/(tabs)')` is used, and AuthContext persists user to storage

## 12) Useful Commands Reference

```bash
# EAS
eas whoami
eas build:list
eas build:view <BUILD_ID>
eas submit:list
eas credentials

# Expo
npm run dev
```

For detailed build and submission steps, see the full guide: [`eas.md`](eas.md).