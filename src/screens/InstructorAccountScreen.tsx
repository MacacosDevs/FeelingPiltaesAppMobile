import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, type CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PencilSquareIcon } from 'react-native-heroicons/outline';
import { Avatar } from '../components/Avatar';
import { OutlineButton } from '../components/OutlineButton';
import { useAuth } from '../context/AuthContext';
import { resolveMediaUrl } from '../utils/media';
import { colors, commonStyles, fontFamily, fontSize, fontWeight, radius } from '../theme';
import type { InstructorTabParamList, RootStackParamList } from '@/app/navigation/types';

type NavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<InstructorTabParamList, 'Cuenta'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function InstructorAccountScreen() {
  const { user, logout, photoVersion } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const avatarUri = resolveMediaUrl(user?.fotoUrl, photoVersion);

  return (
    <SafeAreaView style={commonStyles.screen} edges={['top']}>
      <View style={styles.content}>
        <View style={styles.profileRow}>
          <Avatar uri={avatarUri} name={user?.nombre} size={60} />
          <View style={styles.profileText}>
            <Text style={styles.name}>{user?.nombre ?? ''}</Text>
            <Text style={styles.email}>{user?.correo ?? ''}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeLabel}>Instructora</Text>
            </View>
          </View>
        </View>

        <OutlineButton
          label="Editar perfil"
          icon={<PencilSquareIcon color={colors.textPrimary} size={16} />}
          onPress={() => navigation.navigate('InstructorEditProfile')}
        />

        <OutlineButton label="Cerrar sesión" onPress={logout} style={styles.logoutButton} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 24,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  profileText: {
    gap: 4,
  },
  name: {
    fontFamily: fontFamily.display,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  email: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    color: colors.textMuted,
  },
  badge: {
    alignSelf: 'flex-start',
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
  },
  badgeLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.xs,
    color: colors.accent,
  },
  logoutButton: {
    paddingHorizontal: 16,
  },
});
