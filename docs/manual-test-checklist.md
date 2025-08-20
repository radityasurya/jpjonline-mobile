# JPJOnline Manual Test Checklist

Use this checklist before every release (internal testing, TestFlight, Play Console, production). Check items on both iOS and Android where applicable.

## 1. Environment & Build

- [ ] API base URL points to correct environment
  - [ ] Development: http://localhost:3000
  - [ ] Production: https://api.jpjonline.com
- [ ] EAS build profile used is correct (preview for internal, production for store)
- [ ] Version bumped in app.json (version, ios.buildNumber, android.versionCode)
- [ ] Demo accounts hidden (config/app.js → DEMO_CONFIG.showDemoAccounts = false)
- [ ] Unused permissions removed (e.g., expo-camera)
- [ ] App icons and splash render correctly on cold start
- [ ] No redbox errors or console warnings on launch

## 2. Authentication Flows

### 2.1 Register
- [ ] Register with new email succeeds
- [ ] Shows Welcome screen styled like auth pages
- [ ] Auto-redirects to dashboard in 4s or “Get Started” navigates immediately
- [ ] Field validations:
  - [ ] Name: 1–100 chars
  - [ ] Email format
  - [ ] Password ≥ 6 chars
  - [ ] Confirm Password matches
  - [ ] Terms checkbox required (shows proper error under checkbox)
- [ ] Duplicate email shows proper inline error under email and alert

### 2.2 Login
- [ ] Valid credentials log in and land on /(tabs)
- [ ] Invalid credentials show correct error
- [ ] Loading spinner visible while waiting

### 2.3 Forgot/Reset Password
- [ ] Forgot password accepts email and shows neutral success message always
- [ ] 429 rate limit shows “Too many requests” message
- [ ] Reset link token validation path:
  - [ ] Valid token shows reset form
  - [ ] Invalid/expired token shows invalid message and navigation option back to Forgot
- [ ] Reset password flow accepts new password and navigates to login
- [ ] Validation error messages surface inline per field

## 3. Navigation

- [ ] Tabs visible and clickable: Home, Notes, Tests, Profile (or current set)
- [ ] Back navigation works from child screens
- [ ] Deep links (if configured) open correct route

## 4. Notes & Exams

- [ ] Notes list loads with expected categories
- [ ] Open a Note detail and content renders
- [ ] Exams list loads
- [ ] Start an exam:
  - [ ] Timer works
  - [ ] Next/previous questions work
  - [ ] Sound feedback for correct/incorrect (mobile) or haptic fallback where applicable
- [ ] Submit exam → results page renders with:
  - [ ] Score
  - [ ] Performance breakdown
  - [ ] Review answers
  - [ ] Actions (retake/back)

## 5. State & Storage

- [ ] User session persists after app restart
- [ ] Logout clears session and returns to login
- [ ] Bookmarks/favorites persist locally
- [ ] Progress/stats update after activities (open notes, complete exams)

## 6. UI/UX Consistency

- [ ] Splash background is white (#FFFFFF)
- [ ] Auth screens have yellow headers (#facc15)
- [ ] Buttons and text styles match app theme
- [ ] Dark/light mode switching (if applicable) works or is set to automatic
- [ ] No clipped or overflowing text on small devices

## 7. Platform-Specific

### iOS
- [ ] Preflight passes (permissions, Info.plist)
- [ ] App Store icon 1024x1024 (no transparency)
- [ ] TestFlight internal testing works

### Android
- [ ] Play Store internal testing build (AAB/APK) installs
- [ ] Back button behavior consistent with expectations
- [ ] No strict-mode/network-on-main-thread issues

## 8. Accessibility

- [ ] Labels on interactive elements where needed
- [ ] Sufficient color contrast in major UI areas
- [ ] Font scales do not break layout

## 9. Network & Errors

- [ ] Graceful handling of network failure (retry or friendly message)
- [ ] Server-side validation errors map to inline field errors
- [ ] All API failures are logged (without leaking sensitive data)

## 10. Final Pre-Submission

- [ ] EAS preflight check (iOS) passes
- [ ] Demo/test features hidden
- [ ] Privacy policy URL configured in store listings
- [ ] Age rating and content settings updated
- [ ] Screenshots updated for current UI
- [ ] Release notes written

Tip: Record device/OS, build ID, and screenshots for each failed case.