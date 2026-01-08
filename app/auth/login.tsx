import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';
import { Eye, EyeOff, Check } from 'lucide-react-native';
import { DEMO_CONFIG } from '@/config/app';
import storageService from '@/services/storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const { login, isLoading } = useAuth();
  const { t } = useI18n();

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await storageService.getItem('rememberedEmail');
      const savedPassword = await storageService.getItem('rememberedPassword');
      const wasRemembered = await storageService.getItem('rememberMe');

      if (wasRemembered && savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
        logger.info('LoginScreen', 'Loaded saved credentials');
      }
    } catch (error) {
      logger.error('LoginScreen', 'Failed to load saved credentials', error);
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = t('auth.login.email') + ' diperlukan';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email =
        'Format ' + t('auth.login.email').toLowerCase() + ' tidak sah';
    }

    if (!password) {
      newErrors.password = t('auth.login.password') + ' diperlukan';
    } else if (password.length < 6) {
      newErrors.password =
        t('auth.login.password') + ' mestilah sekurang-kurangnya 6 aksara';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    logger.userAction('Login attempt', { email, rememberMe });
    const result = await login(email, password);
    if (result.success) {
      // Save or clear credentials based on remember me
      if (rememberMe) {
        await storageService.setItem('rememberedEmail', email);
        await storageService.setItem('rememberedPassword', password);
        await storageService.setItem('rememberMe', 'true');
        logger.info('LoginScreen', 'Credentials saved for next login');
      } else {
        await storageService.removeItem('rememberedEmail');
        await storageService.removeItem('rememberedPassword');
        await storageService.removeItem('rememberMe');
        logger.info('LoginScreen', 'Credentials cleared');
      }

      logger.navigation('Home', { from: 'login' });
      router.replace('/(tabs)');
    } else {
      logger.warn('LoginScreen', 'Login failed - showing error alert', {
        error: result.error,
      });
      Alert.alert(
        'Ralat',
        result.error ||
          t('auth.login.errors.invalidCredentials') ||
          'Email atau kata laluan tidak sah. Sila cuba lagi.',
        [{ text: 'OK' }],
      );
    }
  };

  const fillDemoCredentials = (type: 'premium' | 'free') => {
    logger.userAction('Demo credentials filled', { type });
    const credentials = DEMO_CONFIG.accounts[type];
    setEmail(credentials.email);
    setPassword(credentials.password);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('auth.login.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.login.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.login.email')}</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.login.enterEmail')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.login.password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.login.enterPassword')}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} color="#666666" />
              ) : (
                <Eye size={20} color="#666666" />
              )}
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Remember Me Checkbox */}
        <View style={styles.rememberMeContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setRememberMe(!rememberMe)}
          >
            <View
              style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
            >
              {rememberMe && <Check size={16} color="#FFFFFF" />}
            </View>
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotText}>
              {t('auth.login.forgotPassword')}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginButtonText}>{t('auth.login.signIn')}</Text>
          )}
        </TouchableOpacity>

        {DEMO_CONFIG.showDemoAccounts && (
          <View style={styles.demoContainer}>
            <Text style={styles.demoTitle}>Demo Accounts:</Text>
            <View style={styles.demoButtons}>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('premium')}
              >
                <Text style={styles.demoButtonText}>Premium</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.demoButton, styles.freeDemoButton]}
                onPress={() => fillDemoCredentials('free')}
              >
                <Text style={styles.demoButtonText}>Free</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>
            {t('auth.login.dontHaveAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>{t('auth.login.signUp')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#facc15',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333333',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333333',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  rememberMeText: {
    fontSize: 14,
    color: '#666666',
  },
  forgotButton: {
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    color: '#666666',
  },
  loginButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  demoContainer: {
    marginBottom: 24,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  demoButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  freeDemoButton: {
    backgroundColor: '#FF9800',
  },
  demoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#666666',
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
