import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, FieldError, Input } from 'heroui-native';
import { FullScreenLoader } from '../components/FullScreenLoader';
import { GoogleIcon } from '../components/GoogleIcon';
import { PasswordField } from '../components/PasswordField';
import { useAuth } from '../context/AuthContext';
import { mapAuthError } from '../utils/authErrors';
import { validarContrasena, validarCorreo } from '../utils/validation';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const logoFull = require('../assets/images/logo-full.png');

// Coincide con el mínimo que exige el backend (RegistroRequest: @Size(min = 8)).
const LONGITUD_MINIMA_CONTRASENA = 8;

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { registrar, loginConGoogle } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [correoError, setCorreoError] = useState<string | null>(null);
  const [contrasenaError, setContrasenaError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const isBusy = loading || googleLoading;

  const handleContinuar = async () => {
    setError(null);
    const errorCorreo = validarCorreo(correo);
    const errorContrasena = validarContrasena(contrasena, LONGITUD_MINIMA_CONTRASENA);
    setCorreoError(errorCorreo);
    setContrasenaError(errorContrasena);
    if (errorCorreo || errorContrasena) {
      return;
    }

    setLoading(true);
    try {
      await registrar(correo, contrasena, nombre);
    } catch (e) {
      const errores = mapAuthError(e, 'registro');
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
    } catch (e) {
      setError(mapAuthError(e, 'registro').general ?? 'No se pudo iniciar sesión con Google');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.body}>
        <Image source={logoFull} style={styles.logo} resizeMode="contain" />

        <Text style={styles.title}>Crea tu cuenta</Text>
        <Text style={styles.subtitle}>
          Ingresa tus datos para crear tu cuenta.
        </Text>

        <Input
          value={nombre}
          onChangeText={text => {
            setNombre(text);
            setError(null);
          }}
          placeholder="Nombre completo"
          isInvalid={!!error}
          isDisabled={isBusy}
        />

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

        {error && <FieldError isInvalid>{error}</FieldError>}

        <Button isDisabled={isBusy} onPress={handleContinuar} className="bg-[#2b2420]">
          <Button.Label className="text-[#fbf7f3]">Continuar</Button.Label>
        </Button>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>¿Ya tienes una cuenta? </Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.switchLink}>Iniciar sesión</Text>
          </Pressable>
        </View>

        <Text style={styles.dividerText}>O continúa con:</Text>

        <Button
          variant="outline"
          className="justify-center border-[#ede6de] bg-white"
          isDisabled={isBusy}
          onPress={handleGoogle}>
          <GoogleIcon size={18} />
          <Button.Label className="text-[#2b2420]">Continuar con Google</Button.Label>
        </Button>
      </View>

      {isBusy && <FullScreenLoader />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    flex: 1,
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
  title: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  switchRow: {
    flexDirection: 'row',
  },
  switchText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  switchLink: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  dividerText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
});
