import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button, FieldError, Input, Spinner } from 'heroui-native';
import { GoogleIcon } from '../components/GoogleIcon';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { colors, fontFamily, fontSize, fontWeight } from '../theme';
import type { RootStackParamList } from '../navigation/types';

const logoFull = require('../assets/images/logo-full.png');

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { registrar } = useAuth();
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleContinuar = async () => {
    setError(null);
    setLoading(true);
    try {
      await registrar(correo, contrasena, nombre);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setLoading(false);
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
        />
        <Input
          value={correo}
          onChangeText={text => {
            setCorreo(text);
            setError(null);
          }}
          placeholder="Ingresa tu correo electrónico"
          keyboardType="email-address"
          autoCapitalize="none"
          isInvalid={!!error}
        />
        <Input
          value={contrasena}
          onChangeText={text => {
            setContrasena(text);
            setError(null);
          }}
          placeholder="Contraseña"
          secureTextEntry
          autoCapitalize="none"
          isInvalid={!!error}
        />

        {error && <FieldError isInvalid>{error}</FieldError>}

        <Button isDisabled={loading} onPress={handleContinuar} className="bg-[#2b2420]">
          {loading ? (
            <Spinner size="sm" color="#fbf7f3" />
          ) : (
            <Button.Label className="text-[#fbf7f3]">Continuar</Button.Label>
          )}
        </Button>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>¿Ya tienes una cuenta? </Text>
          <Pressable onPress={() => navigation.replace('Login')}>
            <Text style={styles.switchLink}>Iniciar sesión</Text>
          </Pressable>
        </View>

        <Text style={styles.dividerText}>O continúa con:</Text>

        <Button variant="outline" className="justify-start border-[#ede6de] bg-white">
          <GoogleIcon size={18} />
          <Button.Label className="text-[#2b2420]">Continuar con Google</Button.Label>
        </Button>
      </View>
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
