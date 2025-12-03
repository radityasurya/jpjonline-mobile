# Mobile App i18n Integration Guide

## Overview

JPJOnline uses a structured internationalization (i18n) system supporting English (en) and Malay (ms) languages. This guide provides all necessary translations and implementation details for the mobile app.

## Supported Languages

- **English (en)**: Default language
- **Malay (ms)**: Malaysian language (default for web)

## Language Configuration

```typescript
// Default language
const DEFAULT_LANGUAGE = 'ms'; // Malay is default

// Supported languages
type Language = 'en' | 'ms';
```

## Complete Translation Keys

### 1. Navigation (`nav`)

```json
{
  "en": {
    "notes": "Notes",
    "exams": "Exams",
    "directory": "Directory",
    "about": "About Us",
    "faq": "FAQ",
    "privacyPolicy": "Privacy Policy",
    "contact": "Contact",
    "getPremium": "Get Premium",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "menu": "Menu"
  },
  "ms": {
    "notes": "Nota",
    "exams": "Ujian",
    "directory": "Direktori",
    "about": "Mengenai Kami",
    "faq": "Soalan Lazim",
    "privacyPolicy": "Dasar Privasi",
    "contact": "Hubungi Kami",
    "getPremium": "Get Premium",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "menu": "Menu"
  }
}
```

### 2. Authentication (`auth`)

#### Login

```json
{
  "en": {
    "title": "Sign In to JPJOnline",
    "subtitle": "Sign in to access practice exams, notes, and track your progress",
    "email": "Email",
    "password": "Password",
    "forgotPassword": "Forgot your password?",
    "signIn": "Sign In",
    "dontHaveAccount": "Don't have an account?",
    "signUp": "Sign up",
    "enterEmail": "Enter your email",
    "enterPassword": "Enter your password",
    "errors": {
      "invalidCredentials": "Invalid email or password"
    }
  },
  "ms": {
    "title": "Log Masuk ke JPJOnline",
    "subtitle": "Log masuk untuk mengakses ujian latihan, nota, dan jejaki kemajuan anda",
    "email": "Emel",
    "password": "Kata Laluan",
    "forgotPassword": "Lupa kata laluan anda?",
    "signIn": "Log Masuk",
    "dontHaveAccount": "Tidak mempunyai akaun?",
    "signUp": "Daftar",
    "enterEmail": "Masukkan emel anda",
    "enterPassword": "Masukkan kata laluan anda",
    "errors": {
      "invalidCredentials": "Emel atau kata laluan tidak sah"
    }
  }
}
```

#### Signup

```json
{
  "en": {
    "title": "Join JPJOnline",
    "subtitle": "Create your account to start practicing for your driving license exam",
    "fullName": "Full Name",
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "createAccount": "Create Account",
    "alreadyHaveAccount": "Already have an account?",
    "signIn": "Sign in",
    "errors": {
      "passwordsDoNotMatch": "Passwords do not match",
      "passwordTooShort": "Password must be at least 6 characters long",
      "signupFailed": "Signup failed. Email may already be in use."
    }
  },
  "ms": {
    "title": "Sertai JPJOnline",
    "subtitle": "Cipta akaun anda untuk mula berlatih ujian lesen memandu",
    "fullName": "Nama Penuh",
    "email": "Emel",
    "password": "Kata Laluan",
    "confirmPassword": "Sahkan Kata Laluan",
    "createAccount": "Cipta Akaun",
    "alreadyHaveAccount": "Sudah mempunyai akaun?",
    "signIn": "Log Masuk",
    "errors": {
      "passwordsDoNotMatch": "Kata laluan tidak sepadan",
      "passwordTooShort": "Kata laluan mestilah sekurang-kurangnya 6 aksara",
      "signupFailed": "Pendaftaran gagal. Emel mungkin sudah digunakan."
    }
  }
}
```

### 3. Notes (`notes`)

```json
{
  "en": {
    "title": "Driving Theory Notes",
    "subtitle": "Your comprehensive guide to mastering the JPJ curriculum. Select a category below to start learning.",
    "allCategories": "All Categories",
    "selectCategory": "Select a category",
    "searchTopics": "Search topics...",
    "selectTopic": "Select a topic",
    "categoryNotFound": "Category not found.",
    "failedToLoad": "Failed to load category data.",
    "backToTopics": "Back to Topics"
  },
  "ms": {
    "title": "Nota Teori Pemanduan",
    "subtitle": "Panduan komprehensif anda untuk menguasai kurikulum JPJ. Pilih kategori di bawah untuk mula belajar.",
    "allCategories": "Semua Kategori",
    "selectCategory": "Pilih kategori",
    "searchTopics": "Cari topik...",
    "selectTopic": "Pilih topik",
    "categoryNotFound": "Kategori tidak dijumpai.",
    "failedToLoad": "Gagal memuatkan data kategori.",
    "backToTopics": "Kembali ke Topik"
  }
}
```

### 4. Exams (`exams`)

```json
{
  "en": {
    "title": "Exams",
    "categories": {
      "title": "Exam Categories",
      "subtitle": "Select a category to start your practice exams."
    },
    "backToCategories": "Back to Categories",
    "examNotFound": "Exam not found",
    "failedToLoad": "Failed to load exam",
    "exitExam": "Exit Exam",
    "exitExamDescription": "Are you sure you want to exit the exam? Your progress will be lost.",
    "submitExam": "Submit Exam",
    "submitExamDescription": "Are you sure you want to submit your exam?",
    "question": "Question",
    "timeRemaining": "Time Remaining",
    "previous": "Previous",
    "next": "Next",
    "submit": "Submit",
    "startExam": "Start Exam",
    "upgradeToPremium": "Upgrade to Premium",
    "questions": "Questions",
    "duration": "Duration",
    "unlimited": "Unlimited",
    "passScore": "Pass Score"
  },
  "ms": {
    "title": "Ujian",
    "categories": {
      "title": "Kategori Ujian",
      "subtitle": "Pilih kategori untuk mulakan latihan ujian."
    },
    "backToCategories": "Kembali ke Kategori",
    "examNotFound": "Ujian tidak dijumpai",
    "failedToLoad": "Gagal memuatkan ujian",
    "exitExam": "Keluar Ujian",
    "exitExamDescription": "Adakah anda pasti mahu keluar dari ujian? Kemajuan anda akan hilang.",
    "submitExam": "Hantar Ujian",
    "submitExamDescription": "Adakah anda pasti mahu menghantar ujian anda?",
    "question": "Soalan",
    "timeRemaining": "Masa Berbaki",
    "previous": "Sebelum",
    "next": "Seterusnya",
    "submit": "Hantar",
    "startExam": "Mula Ujian",
    "upgradeToPremium": "Naik Taraf ke Premium",
    "questions": "Soalan",
    "duration": "Tempoh",
    "unlimited": "Tanpa Had",
    "passScore": "Markah Lulus"
  }
}
```

### 5. Directory (`directory`)

```json
{
  "en": {
    "title": "Business Directory",
    "subtitle": "Find driving schools, instructors, and other services near you.",
    "noListingsFound": "No listings found",
    "businessName": "Business Name",
    "category": "Category",
    "phone": "Phone",
    "email": "Email",
    "website": "Website",
    "address": "Address",
    "state": "State",
    "city": "City"
  },
  "ms": {
    "title": "Direktori Perniagaan",
    "subtitle": "Dapatkan sekolah memandu, instruktor dan perkhidmatan kenderaan lain berdekatan anda.",
    "noListingsFound": "Tiada penyenaraian dijumpai",
    "businessName": "Nama Perniagaan",
    "category": "Kategori",
    "phone": "Telefon",
    "email": "Emel",
    "website": "Laman Web",
    "address": "Alamat",
    "state": "Negeri",
    "city": "Bandar"
  }
}
```

### 6. Packages/Premium (`packages`)

```json
{
  "en": {
    "title": "Choose Your Plan",
    "subtitle": "Start your driving license journey with our comprehensive study platform.",
    "freePlan": {
      "title": "Free Plan",
      "description": "Perfect for getting started",
      "getStarted": "Get Started Free"
    },
    "premiumPlan": {
      "title": "Premium Plan",
      "description": "Everything you need to pass",
      "mostPopular": "Most Popular",
      "unlockFeatures": "Unlock Premium Features",
      "alreadyPremium": "You're Already Premium"
    }
  },
  "ms": {
    "title": "Pilih Pelan Anda",
    "subtitle": "Mulakan perjalanan lesen memandu anda dengan platform pembelajaran komprehensif kami.",
    "freePlan": {
      "title": "Pelan Percuma",
      "description": "Sempurna untuk bermula",
      "getStarted": "Mula Percuma"
    },
    "premiumPlan": {
      "title": "Pelan Premium",
      "description": "Segala yang anda perlukan untuk lulus",
      "mostPopular": "Paling Popular",
      "unlockFeatures": "Buka Ciri Premium",
      "alreadyPremium": "Anda Sudah Premium"
    }
  }
}
```

## Implementation Guide

### 1. Translation Function

```typescript
/**
 * Get translation for a nested key path
 * @param keyPath - Dot-separated path (e.g., 'nav.notes', 'auth.login.title')
 * @param language - 'en' or 'ms'
 */
function t(keyPath: string, language: 'en' | 'ms' = 'ms'): string {
  const translations = { en, ms };
  const keys = keyPath.split('.');
  let value: any = translations[language];
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return keyPath; // Return key if not found
    }
  }
  
  return typeof value === 'string' ? value : keyPath;
}
```

### 2. Usage Examples

#### React Native Component

```typescript
import { t } from './i18n';

function LoginScreen() {
  const [language, setLanguage] = useState<'en' | 'ms'>('ms');
  
  return (
    <View>
      <Text>{t('auth.login.title', language)}</Text>
      <TextInput placeholder={t('auth.login.enterEmail', language)} />
      <TextInput placeholder={t('auth.login.enterPassword', language)} />
      <Button title={t('auth.login.signIn', language)} />
    </View>
  );
}
```

#### Navigation Labels

```typescript
const tabs = [
  { name: 'Home', label: t('nav.notes', language) },
  { name: 'Exams', label: t('nav.exams', language) },
  { name: 'Directory', label: t('nav.directory', language) },
];
```

### 3. Language Switching

```typescript
// Store language preference
import AsyncStorage from '@react-native-async-storage/async-storage';

async function setLanguage(lang: 'en' | 'ms') {
  await AsyncStorage.setItem('language', lang);
}

async function getLanguage(): Promise<'en' | 'ms'> {
  const lang = await AsyncStorage.getItem('language');
  return (lang === 'en' || lang === 'ms') ? lang : 'ms';
}
```

## Complete Translation Files

### For Mobile Implementation

You can copy the complete translation objects from:

- **English**: `lib/i18n/translations.en.ts`
- **Malay**: `lib/i18n/translations.ms.ts`
- **Types**: `lib/i18n/types.ts`

### JSON Format for Mobile

```json
{
  "en": { /* Full English translations */ },
  "ms": { /* Full Malay translations */ }
}
```

## Key Translation Paths

### Most Used Paths

- `nav.*` - Navigation labels
- `auth.login.*` - Login screen
- `auth.signup.*` - Signup screen
- `exams.*` - Exam interface
- `notes.*` - Notes interface
- `directory.*` - Directory interface
- `packages.*` - Premium/pricing

### Error Messages

- `auth.login.errors.invalidCredentials`
- `auth.signup.errors.passwordsDoNotMatch`
- `auth.signup.errors.signupFailed`

### Common Actions

- `exams.submit` - "Submit" / "Hantar"
- `exams.next` - "Next" / "Seterusnya"
- `exams.previous` - "Previous" / "Sebelum"
- `nav.signIn` - "Sign In" / "Sign In"
- `nav.signUp` - "Sign Up" / "Sign Up"

## Best Practices

1. **Always use translation keys**: Never hardcode strings
2. **Default to Malay**: Use 'ms' as default language
3. **Fallback to English**: If translation missing, fall back to 'en'
4. **Cache language preference**: Store user's language choice
5. **Consistent key paths**: Use dot notation for nested keys

## Testing Checklist

- [ ] All screens display correct language
- [ ] Language switching works instantly
- [ ] Language preference persists after app restart
- [ ] All error messages are translated
- [ ] Navigation labels are translated
- [ ] Form placeholders are translated
- [ ] Button labels are translated
- [ ] No hardcoded strings remain

## API Integration

The mobile app should send the user's language preference in API requests:

```typescript
// Add language header to API requests
headers: {
  'Accept-Language': language, // 'en' or 'ms'
}
```

This ensures server responses (if any) match the user's language preference.
