import * as React from 'react';
import { useState } from 'react';
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
import { Eye, EyeOff, ArrowLeft } from 'lucide-react-native';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});
  const { register, isLoading } = useAuth();
  const { t } = useI18n();

  const validateForm = () => {
    const newErrors: any = {};

    if (!name) {
      newErrors.name = t('auth.signup.fullName') + ' diperlukan';
    } else if (name.length < 1 || name.length > 100) {
      newErrors.name =
        t('auth.signup.fullName') + ' mestilah antara 1-100 aksara';
    }

    if (!email) {
      newErrors.email = t('auth.signup.email') + ' diperlukan';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email =
        'Format ' + t('auth.signup.email').toLowerCase() + ' tidak sah';
    }

    if (!password) {
      newErrors.password = t('auth.signup.password') + ' diperlukan';
    } else if (password.length < 6) {
      newErrors.password = t('auth.signup.errors.passwordTooShort');
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        t('auth.signup.confirmPassword') + ' diperlukan';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.signup.errors.passwordsDoNotMatch');
    }

    if (!acceptTerms) {
      newErrors.acceptTerms = 'Anda mesti menerima terma dan syarat';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    console.log('Registration data:', {
      name,
      email,
      password,
      confirmPassword,
      acceptTerms,
    });

    try {
      const success = await register({
        name,
        email,
        password,
        confirmPassword,
        acceptTerms,
      });

      console.log('Registration success result:', success);

      if (success) {
        console.log('Registration successful, navigating to welcome screen...');

        // Navigate to welcome screen with user's name
        router.replace(`/auth/welcome?name=${encodeURIComponent(name)}`);
      } else {
        console.log('Registration returned false, showing error');
        Alert.alert('Ralat', t('auth.signup.errors.signupFailed'));
      }
    } catch (error: any) {
      console.error('Registration error:', error);

      // Handle validation errors from API
      if (error.validationErrors && error.validationErrors.length > 0) {
        // Clear existing errors first
        setErrors({});

        // Map API validation errors to form errors
        const newErrors: any = {};
        error.validationErrors.forEach((validationError: any) => {
          const field = validationError.field;
          const message = validationError.message;

          // Map API field names to form field names
          if (field === 'acceptTerms') {
            newErrors.acceptTerms = message;
          } else if (field === 'email') {
            newErrors.email = message;
          } else if (field === 'password') {
            newErrors.password = message;
          } else if (field === 'confirmPassword') {
            newErrors.confirmPassword = message;
          } else if (field === 'name') {
            newErrors.name = message;
          }
        });

        setErrors(newErrors);

        // Show a general validation error message
        Alert.alert(
          'Validation Error',
          error.message || 'Please check the highlighted fields and try again.',
        );
      } else if (
        error.message.includes('email already exists') ||
        error.message.includes('email address already exists') ||
        error.message.includes('User with this email already exists')
      ) {
        // Also show the error under the email field
        setErrors({ email: 'This email is already registered' });

        Alert.alert(
          'Email Already Exists',
          'An account with this email address already exists. Please use a different email or try logging in.',
        );
      } else if (error.statusCode === 400) {
        Alert.alert(
          'Validation Error',
          error.message ||
            'Please check all fields are filled correctly and try again.',
        );
      } else {
        Alert.alert('Error', 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.title}>{t('auth.signup.title')}</Text>
        <Text style={styles.subtitle}>{t('auth.signup.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.signup.fullName')}</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={setName}
            placeholder={'Masukkan ' + t('auth.signup.fullName').toLowerCase()}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.signup.email')}</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={setEmail}
            placeholder={'Masukkan ' + t('auth.signup.email').toLowerCase()}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.signup.password')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.password && styles.inputError,
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder={
                'Masukkan ' + t('auth.signup.password').toLowerCase()
              }
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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t('auth.signup.confirmPassword')}</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.passwordInput,
                errors.confirmPassword && styles.inputError,
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t('auth.signup.confirmPassword')}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff size={20} color="#666666" />
              ) : (
                <Eye size={20} color="#666666" />
              )}
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        <View style={styles.termsContainer}>
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
          >
            <View
              style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}
            >
              {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.termsText}>
              I accept the{' '}
              <Text style={styles.termsLink}>Terms and Conditions</Text>
            </Text>
          </TouchableOpacity>
          {errors.acceptTerms && (
            <Text style={styles.errorText}>{errors.acceptTerms}</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.registerButtonText}>
              {t('auth.signup.createAccount')}
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>
            {t('auth.signup.alreadyHaveAccount')}{' '}
          </Text>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.loginLink}>{t('auth.signup.signIn')}</Text>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
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
  registerButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  termsContainer: {
    marginBottom: 20,
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
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 14,
    color: '#666666',
    flex: 1,
  },
  termsLink: {
    color: '#333333',
    fontWeight: '600',
  },
});
