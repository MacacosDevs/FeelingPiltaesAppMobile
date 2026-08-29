import React, { useState } from 'react';
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
import { PrimaryButton } from '../components/PrimaryButton';
import { Avatar } from '../components/Avatar';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';
import { resolveMediaUrl } from '../utils/media';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const { user, photoVersion, updateProfile, updatePhoto } = useAuth();
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [telefono, setTelefono] = useState(user?.telefono ?? '');
  const [descripcion, setDescripcion] = useState(user?.descripcion ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleGuardar = async () => {
    setError(null);
    setSaving(true);
    try {
      await updateProfile(nombre, telefono, descripcion);
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
            <Text style={styles.avatarHint}>
              {uploadingPhoto ? 'Subiendo...' : 'Cambiar foto'}
            </Text>
          </Pressable>

          <View style={styles.fields}>
            <TextField
              label="Nombre completo"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Nombre completo"
            />
            <TextField
              label="Teléfono"
              value={telefono}
              onChangeText={setTelefono}
              placeholder="Teléfono"
              keyboardType="phone-pad"
            />
            <TextField
              label="Sobre ti"
              value={descripcion}
              onChangeText={setDescripcion}
              placeholder="Cuéntanos algo sobre ti"
              multiline
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
