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

## 📱 Building & Deployment

### Quick Start
```bash
# Install required tools
npm install -g @expo/cli eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform all --profile production

# Submit to app stores
eas submit --platform all
```

### Comprehensive Guide
For detailed instructions on building and submitting your app to iOS App Store and Google Play Store, see **[EAS Build & Submission Guide](./eas.md)**.

The guide covers:
- Complete setup process
- iOS App Store submission
- Google Play Store submission
- Troubleshooting common issues
- Testing and deployment workflows

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

For complete mobile deployment instructions, see **[EAS Build & Submission Guide](./eas.md)**.

**Quick Commands:**
```bash
# Build and submit to both stores
eas build --platform all --profile production
eas submit --platform all
```

**Important Notes:**
- Remove unused dependencies before building (especially `expo-camera` if not used)
- Ensure proper bundle identifiers in `app.json`
- Test thoroughly on physical devices before submission

## 🔧 Configuration

### App Configuration

The app uses a centralized configuration system in [`config/app.js`](config/app.js):

```javascript
// Demo account configuration
const DEMO_CONFIG = {
  showDemoAccounts: false, // Set to false for production releases
  accounts: {
    premium: { email: 'premium@jpjonline.com', password: 'premium123' },
    free: { email: 'user@jpjonline.com', password: 'user123' }
  }
};
```

**Important for Production**:
- Demo accounts are **disabled by default** for App Store/Play Store releases
- Set `showDemoAccounts: true` only for development/testing builds
- This prevents demo login buttons from appearing in production

### Environment Variables

Create `.env` file in the root directory:

```env
EXPO_PUBLIC_API_URL=https://api.jpjonline.com
EXPO_PUBLIC_API_KEY=your_api_key_here
```

### Expo Configuration

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