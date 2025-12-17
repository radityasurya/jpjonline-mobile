# Internal Testing → Closed Testing Guide

Your app is now submitted to Internal Testing! Here's exactly what to do next.

---

## 🎯 PHASE 1: Internal Testing (Current Stage)

### Step 1: Add Internal Testers

1. **Go to Google Play Console**: [play.google.com/console](https://play.google.com/console)
2. **Select your app**: jpjonline
3. **Navigate to**: Testing → Internal testing
4. **Click on "Testers" tab**
5. **Create an email list**:
   - Click "Create email list"
   - Name it: "Internal Team" (or any name)
   - Add tester emails (up to 100):
     ```
     tester1@example.com
     tester2@example.com
     your.email@example.com
     ```
   - Click "Save changes"

### Step 2: Get the Testing Link

1. In **Internal testing** page, you'll see a section called **"How testers join your test"**
2. Copy the **opt-in URL** (looks like: `https://play.google.com/apps/internaltest/...`)
3. Share this link with your testers via:
   - Email
   - Slack/Teams
   - WhatsApp
   - Any communication channel

### Step 3: Testers Install the App

**Testers need to:**

1. **Click the opt-in URL** you shared
2. **Accept the invitation** to become a tester
3. **Wait a few minutes** (usually 5-10 minutes)
4. **Open Google Play Store** on their Android device
5. **Search for "jpjonline"** or use the direct link
6. **Install the app** (it will show "Internal test" badge)

**Important**: Testers MUST use the same Google account that was added to the email list!

### Step 4: Test Your App Thoroughly

Create a testing checklist and share with testers:

#### ✅ Functional Testing
- [ ] App launches successfully
- [ ] Login/Registration works
- [ ] All tabs are accessible (Home, Tests, Notes, Profile)
- [ ] Test taking functionality works
- [ ] Questions display correctly
- [ ] Answer selection works
- [ ] Timer functions properly
- [ ] Results are calculated correctly
- [ ] Bookmarking works
- [ ] Search functionality works
- [ ] Profile updates work
- [ ] Logout works

#### ✅ Performance Testing
- [ ] App loads quickly
- [ ] No crashes or freezes
- [ ] Smooth scrolling
- [ ] Images load properly
- [ ] Sounds play correctly (correct/wrong answers)
- [ ] No memory leaks (test for extended periods)

#### ✅ UI/UX Testing
- [ ] All text is readable
- [ ] Buttons are easily tappable
- [ ] Navigation is intuitive
- [ ] Colors and design look good
- [ ] No layout issues on different screen sizes
- [ ] Dark mode works (if applicable)

#### ✅ Device Testing
Test on multiple devices:
- [ ] Small phone (5-6 inch screen)
- [ ] Large phone (6.5+ inch screen)
- [ ] Tablet (if supported)
- [ ] Different Android versions (Android 10, 11, 12, 13, 14)

### Step 5: Collect Feedback

**Create a feedback form** (Google Forms, Typeform, etc.) with questions like:

1. What device are you using? (Brand, model, Android version)
2. Did the app install successfully?
3. Did you encounter any crashes or errors?
4. What features worked well?
5. What features had issues?
6. Any suggestions for improvement?
7. Overall rating (1-5 stars)

**Share the feedback form** with all testers and give them **3-7 days** to test.

### Step 6: Monitor Crashes and Issues

1. **Go to Google Play Console**
2. **Navigate to**: Quality → Android vitals → Crashes & ANRs
3. **Check for**:
   - Crash reports
   - ANR (App Not Responding) reports
   - Performance issues

**Fix any critical issues** before moving to closed testing!

---

## 📋 PHASE 2: Prepare for Closed Testing

Before you can move to closed testing, you MUST complete all required metadata in Google Play Console.

### Required Metadata Checklist

#### 1. Store Listing ⭐ REQUIRED
**Navigate to**: Store presence → Main store listing

**Fill in ALL fields**:

**App name**: 
```
JPJOnline
```

**Short description** (80 characters max):
```
Malaysian driving license test preparation with practice questions
```

**Full description** (4000 characters max):
```
JPJOnline is your comprehensive companion for Malaysian driving license preparation.

🎯 FEATURES:
• Extensive practice questions for JPJ driving tests
• Multiple test categories covering all topics
• Detailed explanations for every answer
• Track your progress and performance
• Bookmark difficult questions for later review
• Offline access to all study materials
• Realistic exam simulation
• Timer for timed practice tests

📚 WHAT YOU'LL LEARN:
• Road signs and traffic rules
• Safe driving practices
• Malaysian traffic laws
• Defensive driving techniques
• Emergency procedures

✨ WHY CHOOSE JPJONLINE:
• Updated content based on latest JPJ requirements
• User-friendly interface
• Progress tracking and analytics
• Practice at your own pace
• Completely offline - no internet required after download

Perfect for anyone preparing for their Malaysian driving license exam. Start practicing today and pass your JPJ test with confidence!

🇲🇾 Made for Malaysian drivers
```

**App icon**: 
- Upload 512x512px PNG
- Use your [`assets/images/icon.png`](assets/images/icon.png) (resize if needed)
- No transparency
- High quality

**Feature graphic**: 
- Create 1024x500px image
- Should showcase your app's main feature
- Can include app name and tagline
- Tools: Canva, Figma, Photoshop

**Screenshots** (REQUIRED - at least 2):
- Phone: 16:9 or 9:16 aspect ratio
- Minimum 320px on shortest side
- Maximum 3840px on longest side
- PNG or JPEG format
- Show actual app screens
- Recommended: 4-8 screenshots showing key features

**To capture screenshots**:
```bash
# Install your app on device/emulator
# Use Android Studio's screenshot tool
# Or use device's screenshot function
# Edit to remove status bar if needed
```

#### 2. App Category ⭐ REQUIRED
**Navigate to**: Store presence → Main store listing

**Select**:
- **Category**: Education
- **Tags**: Learning, Test Preparation, Driving (select up to 5)

#### 3. Content Rating ⭐ REQUIRED
**Navigate to**: Policy → App content → Content rating

**Complete questionnaire**:
1. Click "Start questionnaire"
2. Select app category: "Education"
3. Answer questions honestly:
   - Does your app contain violence? → No
   - Does your app contain sexual content? → No
   - Does your app contain profanity? → No
   - Does your app contain drugs/alcohol? → No
   - Does your app contain gambling? → No
4. Submit questionnaire
5. You'll receive rating: **Everyone** (most likely)

#### 4. Target Audience ⭐ REQUIRED
**Navigate to**: Policy → App content → Target audience

**Select**:
- **Age groups**: 13+ (or 18+ if driving age requirement)
- **Younger users**: No (unless specifically designed for children)

#### 5. Privacy Policy ⭐ REQUIRED
**Navigate to**: Policy → App content → Privacy policy

**Add URL**: You need a hosted privacy policy

**Option 1 - Quick Solution**: Use a privacy policy generator
- [App Privacy Policy Generator](https://app-privacy-policy-generator.firebaseapp.com/)
- [TermsFeed](https://www.termsfeed.com/privacy-policy-generator/)

**Option 2 - Use template**: 
- Use the template in [`docs/PRIVACY_POLICY.md`](docs/PRIVACY_POLICY.md)
- Host it on:
  - GitHub Pages (free)
  - Your website
  - Google Sites (free)

**Minimum requirements**:
```
Your privacy policy must explain:
- What data you collect (if any)
- How you use the data
- How you protect the data
- User rights (access, deletion)
- Contact information
```

#### 6. Data Safety ⭐ REQUIRED
**Navigate to**: Policy → App content → Data safety

**Answer questions about**:
- Does your app collect data? (Yes/No)
- What types of data? (Personal info, app activity, etc.)
- Is data shared with third parties? (Yes/No)
- Is data encrypted? (Yes/No)
- Can users request data deletion? (Yes/No)

**For JPJOnline** (adjust based on your actual data handling):
```
Data collected:
- Account info (email, name) - if you have user accounts
- App activity (test scores, progress) - stored locally

Data NOT collected:
- Location
- Financial info
- Photos/videos
- Contacts

Data security:
- Data encrypted in transit (HTTPS)
- Data stored locally on device
- No data shared with third parties
```

#### 7. App Access ⭐ REQUIRED (if applicable)
**Navigate to**: Policy → App content → App access

**If your app requires login**:
- Provide demo credentials for Google reviewers
- Or explain how to access without login

**Example**:
```
Demo account:
Email: demo@jpjonline.com
Password: Demo123!

Or users can register for free account
```

#### 8. Ads Declaration ⭐ REQUIRED
**Navigate to**: Policy → App content → Ads

**Select**:
- Does your app contain ads? → Yes/No
- If yes, are they from Google AdMob? → Yes/No

---

## 🚀 PHASE 3: Move to Closed Testing

Once internal testing is successful and all metadata is complete:

### Step 1: Verify Everything is Ready

**Checklist**:
- [x] Internal testing completed successfully
- [x] No critical bugs found
- [x] All metadata filled in Google Play Console
- [x] Screenshots uploaded
- [x] Privacy policy URL added
- [x] Content rating completed
- [x] Data safety form completed

### Step 2: Create Closed Testing Release

**Option A: Promote from Internal Testing** (Recommended)

1. **Go to**: Testing → Internal testing
2. **Find your release**
3. **Click "Promote release"**
4. **Select**: Closed testing
5. **Choose track**: Alpha (or Beta)
6. **Review and confirm**

**Option B: Submit New Build**

```bash
# If you made changes and need new build
eas build --platform android --profile production

# Submit to closed testing
eas submit --platform android --profile closed
```

### Step 3: Configure Closed Testing

1. **Go to**: Testing → Closed testing
2. **Select track**: Alpha (for smaller group) or Beta (for larger group)
3. **Add testers**:
   - Create new email list (up to 100,000 testers)
   - Or use Google Groups
   - Can have multiple lists
4. **Set rollout**: 
   - Start with 100% to all closed testers
   - Or staged rollout (20%, 50%, 100%)

### Step 4: Add Release Notes

**In the release**:
```
Beta Release v1.0.1

What's New:
• Initial beta release for testing
• All core features implemented
• Practice questions for JPJ driving tests
• Progress tracking
• Bookmark functionality

Known Issues:
• None currently

Please report any bugs or feedback to: support@jpjonline.com
```

### Step 5: Review and Publish

1. **Click "Review release"**
2. **Check for warnings/errors**
3. **Fix any issues**
4. **Click "Start rollout to Closed testing"**

**Timeline**: Usually available within **2-4 hours** (limited review by Google)

### Step 6: Share with Closed Testers

1. **Get the opt-in URL** from Closed testing page
2. **Share with testers** (email, social media, etc.)
3. **Testers follow same process** as internal testing:
   - Click opt-in URL
   - Accept invitation
   - Install from Play Store

### Step 7: Gather Feedback (Again)

- Give testers **1-2 weeks** for thorough testing
- Collect feedback via form
- Monitor crashes in Play Console
- Fix any issues and release updates if needed

---

## 📊 Monitoring Your Tests

### Check Test Status

**Google Play Console**:
1. Testing → Internal testing (or Closed testing)
2. View statistics:
   - Number of testers
   - Install count
   - Crash rate
   - ANR rate

### Update Your Test Build

**If you need to fix bugs**:

```bash
# 1. Fix the code
# 2. Update version in app.json
# 3. Build new version
eas build --platform android --profile production

# 4. Submit to same track
eas submit --platform android --profile internal
# or
eas submit --platform android --profile closed
```

---

## ⏭️ Next Steps After Closed Testing

Once closed testing is successful:

1. **Gather all feedback**
2. **Fix any remaining issues**
3. **Prepare for production release**
4. **Follow production release guide** in [`GOOGLE_PLAY_RELEASE_GUIDE.md`](GOOGLE_PLAY_RELEASE_GUIDE.md)

---

## 🆘 Common Issues

### "Testers can't find the app"
- Wait 5-10 minutes after opt-in
- Ensure they're using correct Google account
- Check if they accepted the invitation
- Try searching by package name: `com.onepage.jpjonline`

### "App not available in your country"
- Check app availability settings in Play Console
- Go to: Production → Countries/regions
- Add Malaysia and other desired countries

### "Can't move to closed testing - missing metadata"
- Complete ALL required fields in store listing
- Upload at least 2 screenshots
- Add privacy policy URL
- Complete content rating
- Complete data safety form

### "Release is stuck in review"
- Closed testing usually takes 2-4 hours
- If longer, check for emails from Google
- May need to provide additional information

---

## 📞 Need Help?

- **Google Play Console Help**: [support.google.com/googleplay/android-developer](https://support.google.com/googleplay/android-developer)
- **EAS Documentation**: [docs.expo.dev/submit/android/](https://docs.expo.dev/submit/android/)
- **Expo Forums**: [forums.expo.dev](https://forums.expo.dev)

---

## ✅ Quick Summary

**Current Stage**: Internal Testing ✓

**Next Steps**:
1. Add testers to internal testing
2. Share opt-in URL with testers
3. Test for 3-7 days
4. Complete ALL metadata in Play Console
5. Promote to closed testing
6. Test for 1-2 weeks
7. Move to production

**Timeline**: 
- Internal testing: 3-7 days
- Closed testing: 1-2 weeks
- Production review: 1-3 days
- **Total**: ~3-4 weeks to production

Good luck with your testing! 🚀