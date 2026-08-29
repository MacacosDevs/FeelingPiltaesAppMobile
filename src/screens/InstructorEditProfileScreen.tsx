import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { XMarkIcon, CameraIcon } from 'react-native-heroicons/outline';
import { TextField } from '../components/TextField';
import { SocialHandleField } from '../components/SocialHandleField';
import { PrimaryButton } from '../components/PrimaryButton';
import { Avatar } from '../components/Avatar';
import { useAuth } from '@/features/auth';
import { actualizarMiPerfilInstructor, obtenerPerfilInstructor } from '../api/instructores';
import { ApiError } from '../api/client';
import { resolveMediaUrl } from '../utils/media';
import { armarUrl, extraerUsuario, SOCIAL_PREFIX_LABEL } from '../utils/socialLinks';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'InstructorEditProfile'>;

export function InstructorEditProfileScreen({ navigation }: Props) {
  const { user, token, photoVersion, updateProfile, updatePhoto } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    obtenerPerfilInstructor(user.id)
      .then(perfil => {
        if (cancelled) return;
        setBio(perfil.sobreSuClase ?? '');
        setInstagram(extraerUsuario('instagram', perfil.instagramUrl));
        setFacebook(extraerUsuario('facebook', perfil.facebookUrl));
        setTiktok(extraerUsuario('tiktok', perfil.tiktokUrl));
        setWhatsapp(extraerUsuario('whatsapp', perfil.whatsappUrl));
      })
      .catch(() => {
        // sin conexión: se editan campos vacíos, se pisan al guardar
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleGuardar = async () => {
    if (!token) return;
    setError(null);
    setSaving(true);
    try {
      await updateProfile(nombre, telefono, user?.descripcion ?? '');
      await actualizarMiPerfilInstructor(token, {
        sobreSuClase: bio || null,
        instagramUrl: armarUrl('instagram', instagram),
        facebookUrl: armarUrl('facebook', facebook),
        tiktokUrl: armarUrl('tiktok', tiktok),
        whatsappUrl: armarUrl('whatsapp', whatsapp),
      });
      navigation.goBack();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setSaving(false);
    }
  };

  const subirDesde = async (origen: 'camara' | 'galeria') => {
    const response =
      origen === 'camara'
        ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
        : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

    const asset = response.assets?.[0];
    if (!asset?.uri) {
      return;
    }
    setUploadingPhoto(true);
    setError(null);
    try {
      await updatePhoto({ uri: asset.uri, type: asset.type, fileName: asset.fileName });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'No se pudo actualizar la foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const elegirFoto = () => {
    Alert.alert('Foto de perfil', undefined, [
      { text: 'Tomar foto', onPress: () => subirDesde('camara') },
      { text: 'Elegir de galería', onPress: () => subirDesde('galeria') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Editar perfil</Text>
        <Pressable
          style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
          onPress={() => navigation.goBack()}>
          <XMarkIcon color={colors.textPrimary} size={18} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', default: undefined })}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.avatarWrap} onPress={elegirFoto} disabled={uploadingPhoto}>
            <View style={styles.avatarRing}>
              <Avatar uri={resolveMediaUrl(user?.fotoUrl, photoVersion)} name={user?.nombre} size={96} />
              <View style={styles.cameraBadge}>
                <CameraIcon color={colors.background} size={14} />
              </View>
            </View>
            <Text style={styles.avatarHint}>{uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}</Text>
          </Pressable>

          <View style={styles.fields}>
            <TextField label="Nombre completo" value={nombre} onChangeText={setNombre} placeholder="Nombre completo" />
            <TextField
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />
            <TextField
              label="Sobre tu clase"
              value={bio}
              onChangeText={setBio}
              placeholder="Contales a tus alumnas de qué se trata tu clase"
              multiline
            />
          </View>

          <Text style={styles.sectionLabel}>Redes sociales</Text>
          <Text style={styles.sectionHint}>Escribe solo tu usuario, sin arroba ni el link completo.</Text>
          <View style={styles.fields}>
            <SocialHandleField
              label="Instagram"
              prefix={SOCIAL_PREFIX_LABEL.instagram}
              value={instagram}
              onChangeText={setInstagram}
              placeholder="tu_usuario"
            />
            <SocialHandleField
              label="Facebook"
              prefix={SOCIAL_PREFIX_LABEL.facebook}
              value={facebook}
              onChangeText={setFacebook}
              placeholder="tu_pagina"
            />
            <SocialHandleField
              label="TikTok"
              prefix={SOCIAL_PREFIX_LABEL.tiktok}
              value={tiktok}
              onChangeText={setTiktok}
              placeholder="tu_usuario"
            />
            <SocialHandleField
              label="WhatsApp"
              prefix={SOCIAL_PREFIX_LABEL.whatsapp}
              value={whatsapp}
              onChangeText={setWhatsapp}
              placeholder="5212345678"
              keyboardType="phone-pad"
            />
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <PrimaryButton label="Guardar" onPress={handleGuardar} loading={saving} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.chipBackground,
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  body: {
    padding: 28,
    gap: 20,
  },
  avatarWrap: {
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  avatarRing: {
    padding: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentSoft,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.accent,
  },
  fields: {
    gap: 16,
  },
  sectionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
    marginTop: -4,
  },
  sectionHint: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: -14,
  },
  errorBanner: {
    backgroundColor: 'rgba(192, 57, 43, 0.08)',
    borderRadius: radius.input,
    borderWidth: 1,
    borderColor: 'rgba(192, 57, 43, 0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.error,
  },
});
