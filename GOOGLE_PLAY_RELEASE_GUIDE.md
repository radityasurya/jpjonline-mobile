# Google Play Store Release Guide - Step by Step with EAS

This guide walks you through releasing your Android app from Internal Testing → Closed Testing → Production using EAS.

## 🚨 Current Issue - FIXED!

**Error**: "The app is missing the required metadata to submit the app to Google Play Store"

**Solution**: Updated [`eas.json`](eas.json:18) to use `"releaseStatus": "draft"` which bypasses the metadata requirement for initial submissions.

---

## 📋 Prerequisites

### 1. Required Accounts & Setup
```bash
# Install EAS CLI (if not already installed)
npm install -g eas-cli

# Login to Expo
eas login

# Verify login
eas whoami
```

### 2. Google Play Console Setup
- **Account**: $25 one-time fee at [play.google.com/console](https://play.google.com/console)
- **App Created**: Create your app in Google Play Console first
- **Service Account**: EAS needs API access (will be prompted during first submit)

---

## 🎯 Release Workflow Overview

```
Internal Testing (draft) → Closed Testing (alpha) → Production
     ↓                           ↓                      ↓
  Quick testing            Beta testers           Public release
  (no review)              (limited users)        (full review)
```

---

## 📱 STEP 1: Internal Testing Track

Internal testing is the fastest way to test your app with a small group (up to 100 testers). No Google review required!

### 1.1 Build for Internal Testing

```bash
# Build production AAB
eas build --platform android --profile production
```

**Wait for build to complete** (usually 10-15 minutes). You'll get a build URL.

### 1.2 Submit to Internal Testing

```bash
# Submit with internal profile (uses draft + internal track)
eas submit --platform android --profile internal
```

**What happens:**
- EAS uploads your AAB to Google Play Console
- App is released as "draft" to internal testing track
- No metadata required at this stage
- Available immediately (no review)

### 1.3 Add Internal Testers

1. Go to [Google Play Console](https://play.google.com/console)
2. Select your app: **jpjonline**
3. Navigate to: **Testing → Internal testing**
4. Click **Testers** tab
5. Create an email list of testers (up to 100)
6. Share the testing link with your testers

### 1.4 Test Your App

**Testers can install via:**
- Direct link from Google Play Console
- Google Play Store (search for your app with tester account)

**Test thoroughly:**
- [ ] All features work correctly
- [ ] No crashes or bugs
- [ ] Performance is acceptable
- [ ] UI/UX is polished

---

## 🔒 STEP 2: Closed Testing Track (Alpha/Beta)

Once internal testing is successful, promote to closed testing for a larger group of beta testers.

### 2.1 Complete Required Metadata

Before closed testing, you MUST complete these in Google Play Console:

#### A. Store Listing
1. Go to **Store presence → Main store listing**
2. Fill in:
   - **App name**: JPJOnline
   - **Short description** (80 chars max):
     ```
     Malaysian driving license test preparation app with practice questions
     ```
   - **Full description** (4000 chars max):
     ```
     JPJOnline is your comprehensive companion for Malaysian driving license preparation.
     
     Features:
     • Practice questions for JPJ driving tests
     • Multiple test categories
     • Detailed explanations for answers
     • Track your progress
     • Bookmark difficult questions
     • Offline access to study materials
     
     Perfect for preparing for your Malaysian driving license exam!
     ```
   - **App icon**: 512x512px PNG (upload from [`assets/images/icon.png`](assets/images/icon.png))
   - **Feature graphic**: 1024x500px (create a banner image)
   - **Screenshots**: At least 2 screenshots (phone + tablet if applicable)

#### B. Content Rating
1. Go to **Policy → App content → Content rating**
2. Complete the questionnaire
3. Suggested rating: **Everyone** (educational content)

#### C. Target Audience
1. Go to **Policy → App content → Target audience**
2. Select age groups: **13+** (or appropriate for your app)

#### D. Privacy Policy
1. Go to **Policy → App content → Privacy policy**
2. Add your privacy policy URL
3. If you don't have one, use the template in [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)

#### E. App Category
1. Go to **Store presence → Main store listing**
2. Select **Category**: Education
3. Select **Tags**: Driving, Learning, Test Preparation

### 2.2 Build and Submit to Closed Testing

```bash
# Build production AAB (if you need a new build)
eas build --platform android --profile production

# Submit to closed testing (alpha track)
eas submit --platform android --profile closed
```

### 2.3 Set Up Closed Testing

1. Go to **Testing → Closed testing**
2. Create a new release
3. Upload your AAB (or use the one from EAS submit)
4. Add release notes:
   ```
   Beta release for testing
   - All core features implemented
   - Bug fixes and improvements
   ```
5. Add testers:
   - Create email lists (can have multiple lists)
   - Or use Google Groups
   - Up to 100,000 testers allowed

### 2.4 Review and Publish

1. Review all details
2. Click **Review release**
3. Click **Start rollout to Closed testing**

**Timeline**: Usually available within a few hours (no full review for closed testing)

---

## 🚀 STEP 3: Production Release

Once closed testing is successful and you're confident, release to production!

### 3.1 Ensure All Metadata is Complete

Double-check everything from Step 2.1 is filled in correctly.

### 3.2 Update EAS Config for Production

Update [`eas.json`](eas.json:18) to remove draft status for production:

```json
{
  "submit": {
    "production": {
      "android": {
        "track": "production"
      }
    }
  }
}
```

### 3.3 Build Final Production Version

```bash
# Increment version in app.json first
# Current: version "1.0.1", versionCode 2
# Update to: version "1.0.2", versionCode 3 (or appropriate version)

# Build production AAB
eas build --platform android --profile production
```

### 3.4 Submit to Production

```bash
# Submit to production track
eas submit --platform android --profile production
```

### 3.5 Create Production Release in Console

1. Go to **Production → Releases**
2. Create new release
3. Upload AAB (or use from EAS)
4. Add release notes:
   ```
   Initial release of JPJOnline
   
   Features:
   • Practice questions for Malaysian driving license tests
   • Multiple test categories
   • Progress tracking
   • Bookmark functionality
   • Offline access
   ```
5. Set rollout percentage:
   - Start with **20%** for staged rollout (recommended)
   - Or **100%** for full release

### 3.6 Review and Submit

1. Click **Review release**
2. Review all warnings/errors
3. Click **Start rollout to Production**

**Timeline**: 
- Review usually takes **1-3 days**
- You'll receive email notifications about review status
- Can take up to 7 days in some cases

---

## 🔄 Version Management

### Before Each Release

Update version numbers in [`app.json`](app.json:5):

```json
{
  "expo": {
    "version": "1.0.2",  // Semantic version (user-facing)
    "android": {
      "versionCode": 3   // Integer, must increment with each release
    }
  }
}
```

**Version Rules:**
- `version`: User-facing (1.0.0 → 1.0.1 → 1.1.0 → 2.0.0)
- `versionCode`: Must be higher than previous (1 → 2 → 3 → 4...)

### Quick Version Bump

```bash
# Update package.json version
npm version patch  # 1.0.1 → 1.0.2

# Then manually update app.json version and versionCode
```

---

## 📊 Complete Command Reference

### Internal Testing
```bash
# 1. Build
eas build --platform android --profile production

# 2. Submit to internal
eas submit --platform android --profile internal

# 3. Check status
eas build:list
eas submit:list
```

### Closed Testing
```bash
# 1. Build (if needed)
eas build --platform android --profile production

# 2. Submit to closed testing
eas submit --platform android --profile closed

# 3. Monitor
eas submit:list
```

### Production
```bash
# 1. Update version in app.json

# 2. Build
eas build --platform android --profile production

# 3. Submit to production
eas submit --platform android --profile production

# 4. Monitor
eas submit:list
```

---

## 🐛 Troubleshooting

### Error: "Missing metadata"
**Solution**: Use `"releaseStatus": "draft"` in eas.json (already fixed!)

### Error: "Version code must be higher"
**Solution**: Increment `versionCode` in [`app.json`](app.json:40)

### Error: "Service account not configured"
**Solution**: Follow EAS prompts to set up Google Play API access

### Build fails
```bash
# Check build logs
eas build:view [BUILD_ID]

# Clear credentials and retry
eas credentials --platform android --clear-all
eas build --platform android --profile production
```

### Submission fails
```bash
# Check submission status
eas submit:list

# Retry submission
eas submit --platform android --profile internal
```

---

## ✅ Pre-Release Checklist

### Before Internal Testing
- [ ] App builds successfully
- [ ] All features work on physical device
- [ ] No demo accounts visible (check [`config/app.js`](config/app.js))
- [ ] Version numbers updated in [`app.json`](app.json:5)

### Before Closed Testing
- [ ] Internal testing completed successfully
- [ ] All metadata filled in Google Play Console
- [ ] Screenshots uploaded (at least 2)
- [ ] Privacy policy URL added
- [ ] Content rating completed
- [ ] App icon uploaded (512x512px)

### Before Production
- [ ] Closed testing completed successfully
- [ ] All feedback addressed
- [ ] Final testing on multiple devices
- [ ] Release notes prepared
- [ ] Marketing materials ready
- [ ] Support email/website set up

---

## 📈 Post-Release Monitoring

### Track Your Release
1. **Google Play Console**: Monitor installs, crashes, ratings
2. **EAS Dashboard**: Track build and submission history
3. **User Reviews**: Respond to user feedback promptly

### Update Strategy
- **Patch updates** (1.0.1 → 1.0.2): Bug fixes, minor improvements
- **Minor updates** (1.0.0 → 1.1.0): New features
- **Major updates** (1.0.0 → 2.0.0): Significant changes

---

## 🆘 Getting Help

### Official Resources
- [EAS Submit Docs](https://docs.expo.dev/submit/android/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [Expo Forums](https://forums.expo.dev/)

### Quick Help Commands
```bash
# EAS help
eas submit --help
eas build --help

# Check status
eas whoami
eas build:list
eas submit:list
```

---

## 🎉 Success Timeline

**Typical timeline from start to production:**

| Stage | Duration | Notes |
|-------|----------|-------|
| Internal Testing | Immediate | No review required |
| Closed Testing | Few hours | Limited review |
| Production Review | 1-3 days | Full Google review |
| Production Live | Immediate | After approval |

**Total**: ~3-5 days from first build to production (if all goes smoothly)

---

## 📝 Current Configuration

Your current [`eas.json`](eas.json) is configured with:

- ✅ **Internal testing**: Draft release to internal track
- ✅ **Closed testing**: Draft release to alpha track  
- ✅ **Production**: Ready for production track

You're all set to start the release process! 🚀