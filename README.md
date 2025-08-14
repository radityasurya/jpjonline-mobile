# JPJOnline - Portal Latihan Ujian JPJ KPP Malaysia

A comprehensive React Native Expo application for Malaysian driving license preparation, featuring interactive learning materials, practice tests, and real-time progress tracking.

## 🚀 Features

- **Interactive Learning Materials**: Comprehensive notes covering Malaysian traffic laws
- **Practice Tests**: Multiple exam types with immediate feedback and detailed explanations
- **Visual Assessment**: Image-based questions simulating real driving scenarios
- **Progress Tracking**: Real-time statistics and performance analytics
- **Subscription System**: Free and Premium tiers with different access levels
- **Offline Storage**: Local data persistence using AsyncStorage
- **Responsive Design**: Optimized for both mobile and web platforms

## 📱 Tech Stack

- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0.17
- **Language**: TypeScript
- **Storage**: AsyncStorage for local data persistence
- **Icons**: Lucide React Native
- **Styling**: StyleSheet (React Native)
- **State Management**: React Context API

## 🛠️ Development Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jpj-online
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - **Web**: Open http://localhost:8081 in your browser
   - **Mobile**: Use Expo Go app to scan the QR code
   - **Simulator**: Press 'i' for iOS simulator or 'a' for Android emulator

### Demo Accounts

For testing purposes, use these demo accounts:

**Premium Account:**
- Email: `premium@jpj.com`
- Password: `premium123`

**Free Account:**
- Email: `free@jpj.com`
- Password: `free123`

## 📂 Project Structure

```
jpj-online/
├── app/                    # App screens and navigation
│   ├── (tabs)/            # Tab-based navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── notes.tsx      # Notes listing
│   │   ├── tests.tsx      # Exams listing
│   │   └── profile.tsx    # User profile
│   ├── auth/              # Authentication screens
│   ├── exam/              # Exam-related screens
│   └── notes/             # Note detail screens
├── components/            # Reusable components
├── contexts/              # React Context providers
├── data/                  # Mock data and JSON files
├── hooks/                 # Custom React hooks
├── services/              # API services and utilities
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── README.md
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build:web` - Build for web deployment
- `npm run lint` - Run ESLint

## 📱 Building for Mobile Platforms

### Prerequisites for Mobile Builds

1. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

2. **Install EAS CLI for builds**
   ```bash
   npm install -g eas-cli
   ```

### iOS Build

1. **Configure iOS build**
   ```bash
   eas build:configure
   ```

2. **Build for iOS**
   ```bash
   # Development build
   eas build --platform ios --profile development
   
   # Production build
   eas build --platform ios --profile production
   ```

3. **Requirements**
   - Apple Developer Account (for App Store distribution)
   - macOS with Xcode (for local builds)

### Android Build

1. **Build for Android**
   ```bash
   # Development build
   eas build --platform android --profile development
   
   # Production build
   eas build --platform android --profile production
   ```

2. **Generate APK for testing**
   ```bash
   eas build --platform android --profile preview
   ```

### Local Development Builds

For faster development iterations:

1. **Create development build**
   ```bash
   # iOS
   eas build --platform ios --profile development --local
   
   # Android
   eas build --platform android --profile development --local
   ```

2. **Install on device**
   - iOS: Install via Xcode or TestFlight
   - Android: Install APK directly

## 🌐 Web Deployment

1. **Build for web**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting service**
   - The build output will be in `dist/` directory
   - Deploy to Netlify, Vercel, or any static hosting service

## 📊 Data Management

### Local Storage Structure

The app uses AsyncStorage for local data persistence:

- **User Authentication**: Stored securely with tokens
- **Exam Results**: Complete test history and scores
- **Bookmarks**: User-saved notes and materials
- **Activity History**: Learning progress and interactions
- **User Preferences**: App settings and configurations

### Mock Data

Development uses JSON files in the `data/` directory:

- `notes.json` - Learning materials and articles
- `exams.json` - Test configurations and metadata
- `questions.json` - Question bank with answers and explanations
- `users.json` - Demo user accounts and app information

## 🔐 Authentication System

- **Demo Authentication**: Uses predefined accounts for testing
- **Session Management**: JWT-like token simulation
- **Subscription Tiers**: Free and Premium access levels
- **Secure Storage**: Sensitive data encrypted in AsyncStorage

## 🎨 UI/UX Features

- **Responsive Design**: Adapts to different screen sizes
- **Dark/Light Theme**: Automatic theme detection
- **Smooth Animations**: Enhanced user experience
- **Accessibility**: Screen reader support and proper contrast
- **Offline Support**: Works without internet connection

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure

- **Unit Tests**: Component and utility function tests
- **Integration Tests**: API service and storage tests
- **E2E Tests**: Complete user flow testing

## 🚀 Deployment

### Web Deployment

1. **Build the project**
   ```bash
   npm run build:web
   ```

2. **Deploy to hosting platform**
   ```bash
   # Example: Deploy to Netlify
   netlify deploy --prod --dir=dist
   ```

### Mobile App Store Deployment

1. **iOS App Store**
   ```bash
   eas submit --platform ios
   ```

2. **Google Play Store**
   ```bash
   eas submit --platform android
   ```

## 🔧 Configuration

### Environment Variables

Create `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://api.jpjonline.com
EXPO_PUBLIC_API_KEY=your_api_key_here
```

### App Configuration

Modify `app.json` for app-specific settings:

```json
{
  "expo": {
    "name": "JPJOnline",
    "slug": "jpj-online",
    "version": "1.0.0",
    "platforms": ["ios", "android", "web"]
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:

- **Email**: info@jpjonline.com
- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)

## 🔄 Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Added visual assessment tests
- **v1.2.0** - Enhanced offline capabilities

---

**Made with ❤️ for Malaysian driving education**