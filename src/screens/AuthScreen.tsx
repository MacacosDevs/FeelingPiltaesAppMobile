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
import { useAuth } from '../context/AuthContext';
import { mapAuthError, mapGoogleAuthError } from '../utils/authErrors';
import { validarContrasena, validarCorreo } from '../utils/validation';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius, shadows } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const logoFull = require('../assets/images/logo-full.png');

// Coincide con el mínimo que exige el backend (RegistroRequest: @Size(min = 8)).
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

  // Cambiar de modo es un toggle local, no una navegación: se ve y se siente
  // como cambiar de pestaña, no como pasar a otra pantalla.
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

  // Auth ya no es la puerta de entrada obligatoria: se alcanza bajo demanda
  // (p. ej. al intentar reservar o comprar un paquete como invitado), así que
  // al autenticarse con éxito hay que volver a la pantalla que lo pidió.
  const volverTrasIniciarSesion = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  function handleOlvideContrasena() {
    Alert.alert(
      'Restablecer contraseña',
      'Por ahora, comunícate con el estudio para restablecer tu contraseña.',
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
          <Image source={logoFull} style={styles.logo} resizeMode="contain" />

          <Text style={styles.subtitle}>
            {isLogin
              ? 'Ingresa tu correo electrónico para iniciar sesión.'
              : 'Ingresa tus datos para crear tu cuenta.'}
          </Text>

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
              placeholder="Ingresa tu correo electrónico"
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

          {error && <FieldError isInvalid>{error}</FieldError>}

          <PrimaryButton
            label={isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
            onPress={handleContinuar}
            disabled={isBusy}
          />

          <Text style={styles.dividerText}>O continúa con:</Text>

          <OutlineButton
            label="Continuar con Google"
            onPress={handleGoogle}
            disabled={isBusy}
            icon={<GoogleIcon size={18} />}
            style={styles.googleButton}
          />
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
    width: 34,
    height: 34,
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
    paddingVertical: 24,
    gap: 16,
  },
  logo: {
    width: 220,
    height: 92,
    alignSelf: 'center',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -8,
  },
  forgotPasswordText: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.smMedium,
    color: colors.accent,
  },
  modeSwitch: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 2,
    padding: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.chipBackground,
  },
  modeOption: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  modeOptionActive: {
    backgroundColor: colors.textPrimary,
    ...shadows.pill,
  },
  modeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  modeLabelActive: {
    color: colors.surface,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
  },
  dividerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  googleButton: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
});
