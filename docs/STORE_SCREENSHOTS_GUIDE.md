# App Store Screenshots Guide

This guide will help you capture the required screenshots for both Apple App Store and Google Play Store submissions.

## 📱 Screenshot Requirements

### Apple App Store

#### Required Sizes

You need screenshots for these device sizes:

1. **6.7" Display (iPhone 15 Pro Max, 14 Pro Max, 13 Pro Max, 12 Pro Max)**
   - Resolution: 1290 x 2796 pixels (portrait)
   - Required: Yes (primary)

2. **6.5" Display (iPhone 11 Pro Max, XS Max)**
   - Resolution: 1242 x 2688 pixels (portrait)
   - Required: Yes

3. **5.5" Display (iPhone 8 Plus, 7 Plus, 6s Plus)**
   - Resolution: 1242 x 2208 pixels (portrait)
   - Required: Yes

#### Optional Sizes

- iPad Pro (12.9-inch) - 2048 x 2732 pixels
- iPad Pro (11-inch) - 1668 x 2388 pixels

#### Quantity

- Minimum: 1 screenshot per device size
- Maximum: 10 screenshots per device size
- Recommended: 5-8 screenshots showing key features

### Google Play Store

#### Required Sizes

1. **Phone Screenshots**
   - Minimum: 320 x 320 pixels
   - Maximum: 3840 x 3840 pixels
   - Recommended: 1080 x 1920 pixels (portrait)
   - Required: At least 2 screenshots

2. **7-inch Tablet Screenshots** (Optional but recommended)
   - Recommended: 1200 x 1920 pixels

3. **10-inch Tablet Screenshots** (Optional)
   - Recommended: 1600 x 2560 pixels

#### Quantity

- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Recommended: 5-8 screenshots

#### Feature Graphic (Required)

- Size: 1024 x 500 pixels
- Format: PNG or JPEG
- No transparency

## 📸 What to Capture

### Recommended Screenshots (in order)

1. **Welcome/Login Screen**
   - Shows the app branding
   - Clean, professional first impression
   - Demonstrates the authentication flow

2. **Home Dashboard**
   - Overview of available features
   - Shows statistics and progress
   - Highlights key navigation

3. **Notes/Learning Materials**
   - Display of learning content
   - Category organization
   - Search and filter capabilities

4. **Practice Test Interface**
   - Question display
   - Answer options
   - Timer and progress indicators

5. **Exam Results**
   - Score display
   - Performance breakdown
   - Review options

6. **Progress Tracking**
   - User statistics
   - Learning history
   - Achievement indicators

7. **Profile/Settings** (Optional)
   - User profile information
   - App settings
   - Subscription status

8. **Offline Mode** (Optional)
   - Demonstrates offline functionality
   - Downloaded content access

## 🎨 Screenshot Best Practices

### Content Guidelines

✅ **DO:**

- Use real, representative content
- Show the app in use with actual data
- Ensure text is readable
- Use high-quality images
- Show key features and benefits
- Keep UI clean and uncluttered
- Use consistent device frames (optional)
- Highlight unique selling points

❌ **DON'T:**

- Include personal information
- Show placeholder or lorem ipsum text
- Use low-resolution images
- Include device status bar with personal info
- Show error states or bugs
- Use outdated UI
- Include competitor references
- Show inappropriate content

### Design Tips

1. **Consistency**
   - Use the same device orientation for all screenshots
   - Maintain consistent styling
   - Use similar lighting/theme settings

2. **Clarity**
   - Ensure text is legible at thumbnail size
   - Avoid cluttered screens
   - Focus on one feature per screenshot

3. **Context**
   - Show realistic usage scenarios
   - Include relevant data/content
   - Demonstrate value proposition

## 🛠️ How to Capture Screenshots

### Method 1: Using Physical Device (Recommended)

#### iOS

1. Open the app on your iPhone
2. Navigate to the screen you want to capture
3. Press **Volume Up + Side Button** simultaneously
4. Screenshots saved to Photos app
5. Transfer to computer via AirDrop or iCloud

#### Android

1. Open the app on your Android device
2. Navigate to the screen you want to capture
3. Press **Volume Down + Power Button** simultaneously
4. Screenshots saved to Gallery
5. Transfer to computer via USB or cloud storage

### Method 2: Using Simulator/Emulator

#### iOS Simulator (Mac only)

```bash
# Launch simulator
open -a Simulator

# Take screenshot
# Method 1: Cmd + S (saves to Desktop)
# Method 2: File > New Screen Shot

# Or use command line:
xcrun simctl io booted screenshot screenshot.png
```

#### Android Emulator

```bash
# Launch emulator
emulator -avd <device_name>

# Take screenshot using Android Studio
# Click camera icon in emulator toolbar
# Or: Tools > Device Manager > Screenshot
```

### Method 3: Using Expo/React Native Tools

```bash
# Run app in development
npm run dev

# Press 'i' for iOS or 'a' for Android
# Use device screenshot methods above
```

## 📐 Resizing and Formatting

### Tools for Resizing

1. **Online Tools**
   - [Canva](https://www.canva.com) - Free design tool
   - [Figma](https://www.figma.com) - Professional design tool
   - [Screenshot Maker](https://screenshots.pro) - Specialized tool

2. **Desktop Software**
   - Adobe Photoshop
   - Sketch (Mac)
   - GIMP (Free)

3. **Command Line (ImageMagick)**

```bash
# Install ImageMagick
brew install imagemagick  # Mac
sudo apt-get install imagemagick  # Linux

# Resize screenshot
convert input.png -resize 1290x2796 output.png

# Batch resize
for file in *.png; do
  convert "$file" -resize 1290x2796 "resized_$file"
done
```

### Format Requirements

- **File Format**: PNG or JPEG
- **Color Space**: RGB
- **Transparency**: Not allowed for most stores
- **File Size**: Under 5MB per screenshot

## 🎯 Screenshot Checklist

### Before Capturing

- [ ] App is in production mode (no debug info)
- [ ] Demo accounts are hidden
- [ ] All text is in correct language
- [ ] UI is fully loaded (no loading spinners)
- [ ] Status bar shows good signal/battery
- [ ] Time shows reasonable hour (e.g., 9:41 AM)
- [ ] No personal information visible

### During Capture

- [ ] Device is in portrait orientation
- [ ] Screen brightness is at 100%
- [ ] No notifications visible
- [ ] Clean, professional content
- [ ] All UI elements are visible
- [ ] Text is readable

### After Capture

- [ ] Screenshots are correct resolution
- [ ] Images are clear and sharp
- [ ] Colors are accurate
- [ ] No artifacts or compression issues
- [ ] File names are organized
- [ ] Screenshots are in correct order

## 📁 File Organization

Organize your screenshots like this:

```
screenshots/
├── ios/
│   ├── 6.7-inch/
│   │   ├── 01-welcome.png
│   │   ├── 02-home.png
│   │   ├── 03-notes.png
│   │   ├── 04-exam.png
│   │   └── 05-results.png
│   ├── 6.5-inch/
│   │   └── [same files]
│   └── 5.5-inch/
│       └── [same files]
└── android/
    ├── phone/
    │   ├── 01-welcome.png
    │   ├── 02-home.png
    │   ├── 03-notes.png
    │   ├── 04-exam.png
    │   └── 05-results.png
    ├── tablet-7inch/
    │   └── [same files]
    └── feature-graphic.png
```

## 🎨 Creating Feature Graphic (Play Store)

The feature graphic is displayed at the top of your Play Store listing.

### Requirements

- Size: 1024 x 500 pixels
- Format: PNG or JPEG (24-bit)
- No transparency
- File size: Under 1MB

### Design Tips

1. **Include:**
   - App name/logo
   - Key visual from the app
   - Tagline or value proposition
   - Relevant imagery (driving, learning)

2. **Avoid:**
   - Too much text
   - Cluttered design
   - Low-quality images
   - Misleading content

### Tools

- Canva (has Play Store templates)
- Figma
- Adobe Photoshop
- GIMP

## 📝 Screenshot Captions (Optional)

Both stores allow captions for screenshots:

### Good Caption Examples

- "Master Malaysian traffic laws with interactive lessons"
- "Practice with real exam questions"
- "Track your progress and identify weak areas"
- "Study offline anytime, anywhere"
- "Get instant feedback on your answers"

### Caption Guidelines

- Keep it short (under 170 characters)
- Focus on benefits, not features
- Use action words
- Be specific and clear
- Match the screenshot content

## 🚀 Quick Start Workflow

1. **Prepare the app**
   - Build in production mode
   - Load with realistic data
   - Hide demo features

2. **Capture screenshots**
   - Use physical device or simulator
   - Follow the recommended screen list
   - Take multiple shots of each screen

3. **Edit and resize**
   - Crop to exact dimensions
   - Adjust brightness/contrast if needed
   - Remove status bar if desired

4. **Organize files**
   - Name files clearly
   - Group by device size
   - Keep originals as backup

5. **Upload to stores**
   - App Store Connect: Upload via web interface
   - Play Console: Upload via web interface

## 📞 Need Help?

If you need assistance with screenshots:

- Review store guidelines: [App Store](https://developer.apple.com/app-store/product-page/) | [Play Store](https://support.google.com/googleplay/android-developer/answer/9866151)
- Use screenshot services: [AppLaunchpad](https://theapplaunchpad.com), [PlaceIt](https://placeit.net)
- Hire a designer on Fiverr or Upwork

---

**Pro Tip:** Take screenshots early in development and update them before each release. This ensures you always have current, high-quality images ready for submission.
