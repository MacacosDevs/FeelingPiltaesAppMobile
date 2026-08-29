import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { XMarkIcon } from 'react-native-heroicons/outline';
import { FieldError, Input } from 'heroui-native';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { GoogleIcon } from '../components/GoogleIcon';
import { OutlineButton } from '../components/OutlineButton';
import { PasswordField } from '../components/PasswordField';
import { PrimaryButton } from '../components/PrimaryButton';
import { SparkleIcon } from '../components/LumaArt';
import { useAuth } from '../context/AuthContext';
import { mapAuthError, mapGoogleAuthError } from '../utils/authErrors';
import { validarContrasena, validarCorreo } from '../utils/validation';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const imgWelcome = require('../assets/images/welcome-art.jpg');

const LONGITUD_MINIMA_CONTRASENA_REGISTRO = 8;

type Mode = 'login' | 'register';

type Props = NativeStackScreenProps<RootStackParamList, 'Auth'>;

export function AuthScreen({ navigation, route }: Props) {
  const { login, registrar, loginConGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>(route.params?.mode ?? 'login');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [correoError, setCorreoError] = useState<string | null>(null);
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isBusy = loading || googleLoading;
  const isLogin = mode === 'login';

  function cambiarModo(nuevoModo: Mode) {
    if (nuevoModo === mode) return;
    setMode(nuevoModo);
    setCorreoError(null);
    setContrasenaError(null);
    setError(null);
  }

  const handleContinuar = async () => {
    setError(null);
    const errorCorreo = validarCorreo(correo);
    const errorContrasena = isLogin
      ? validarContrasena(contrasena)
      : validarContrasena(contrasena, LONGITUD_MINIMA_CONTRASENA_REGISTRO);
    setCorreoError(errorCorreo);
    setContrasenaError(errorContrasena);
    if (errorCorreo || errorContrasena) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(correo, contrasena);
      } else {
        await registrar(correo, contrasena, nombre);
      }
      volverTrasIniciarSesion();
    } catch (e) {
      const errores = mapAuthError(e, isLogin ? 'login' : 'registro');
      setCorreoError(errores.correoError);
      setContrasenaError(errores.contrasenaError);
      setError(errores.general);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setGoogleLoading(true);
    try {
      await loginConGoogle();
      volverTrasIniciarSesion();
    } catch (e) {
      setError(mapGoogleAuthError(e));
    } finally {
      setGoogleLoading(false);
    }
  };

  const volverTrasIniciarSesion = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  function handleOlvideContrasena() {
    Alert.alert(
      'Restablecer contraseña',
      'Por ahora, comunícate con la recepción del estudio para restablecer tu contraseña.',
    );
  }

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      {navigation.canGoBack() && (
        <View style={styles.header}>
          <Pressable style={styles.backBtn} hitSlop={8} onPress={() => navigation.goBack()}>
            <XMarkIcon color={colors.textPrimary} size={22} />
          </Pressable>
        </View>
      )}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {/* Arte orgánico de bienvenida realista */}
          <View style={styles.artCard}>
            <Image source={imgWelcome} style={styles.artImage} resizeMode="cover" />
          </View>

          {/* Marca y Lema */}
          <View style={styles.brandContainer}>
            <SparkleIcon size={24} color={colors.sage} />
            <Text style={styles.title}>Feeling Pilates</Text>
            <Text style={styles.subtitle}>
              Bienestar y movimiento que ilumina tu día a día.
            </Text>
          </View>

          {/* Toggle de Modo */}
          <View style={styles.modeSwitch}>
            <Pressable
              style={[styles.modeOption, isLogin && styles.modeOptionActive]}
              onPress={() => cambiarModo('login')}>
              <Text style={[styles.modeLabel, isLogin && styles.modeLabelActive]}>Iniciar sesión</Text>
            </Pressable>
            <Pressable
              style={[styles.modeOption, !isLogin && styles.modeOptionActive]}
              onPress={() => cambiarModo('register')}>
              <Text style={[styles.modeLabel, !isLogin && styles.modeLabelActive]}>Crear cuenta</Text>
            </Pressable>
          </View>

          {/* Campos de Entrada */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <Input
                value={nombre}
                onChangeText={text => {
                  setNombre(text);
                  setError(null);
                }}
                placeholder="Nombre completo"
                isInvalid={!!error}
                isDisabled={isBusy}
                style={styles.input}
              />
            )}

            <View>
              <Input
                value={correo}
                onChangeText={text => {
                  setCorreo(text);
                  setCorreoError(null);
                  setError(null);
                }}
                placeholder="Correo electrónico"
                keyboardType="email-address"
                autoCapitalize="none"
                isInvalid={!!correoError || !!error}
                isDisabled={isBusy}
                style={styles.input}
              />
              {correoError && <FieldError isInvalid>{correoError}</FieldError>}
            </View>

            <PasswordField
              value={contrasena}
              onChangeText={text => {
                setContrasena(text);
                setContrasenaError(null);
                setError(null);
              }}
              placeholder="Contraseña"
              isInvalid={!!contrasenaError || !!error}
              isDisabled={isBusy}
              errorMessage={contrasenaError}
            />

            {isLogin && (
              <Pressable
                style={styles.forgotPasswordLink}
                hitSlop={8}
                onPress={handleOlvideContrasena}>
                <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            )}

            {error && <FieldError isInvalid>{error}</FieldError>}

            <PrimaryButton
              label={isLogin ? 'Comenzar sesión' : 'Crear mi cuenta'}
              onPress={handleContinuar}
              disabled={isBusy}
            />

            <Text style={styles.dividerText}>O continúa con</Text>

            <OutlineButton
              label="Continuar con Google"
              onPress={handleGoogle}
              disabled={isBusy}
              icon={<GoogleIcon size={18} />}
              style={styles.googleButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isBusy && <FullScreenLoader />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  body: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 20,
    gap: 18,
  },
  artCard: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
    borderRadius: radius.cardLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSoft,
    ...shadows.card,
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.heading + 4,
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base + 1,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 2,
    padding: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeOption: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modeOptionActive: {
    backgroundColor: colors.surface,
    ...shadows.card,
  },
  modeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  modeLabelActive: {
    color: colors.accent,
    fontWeight: fontWeight.semibold,
  },
  formContainer: {
    gap: 14,
  },
  input: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -4,
  },
  forgotPasswordText: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.accent,
  },
  dividerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs + 1,
    color: colors.textMuted,
    textAlign: 'center',
    marginVertical: 2,
  },
  googleButton: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
