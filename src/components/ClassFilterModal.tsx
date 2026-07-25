import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { colors, fontFamily, fontSize, fontWeight, radius } from '../theme';

export type FilterOption = {
  value: string;
  label: string;
  description?: string;
};

type ClassFilterModalProps = {
  visible: boolean;
  tipoOptions: FilterOption[];
  salonOptions: FilterOption[];
  selectedTipos: string[];
  selectedSalones: string[];
  onApply: (tipos: string[], salones: string[]) => void;
  onClose: () => void;
  tipoSectionTitle?: string;
  tipoAllLabel?: string;
  salonSectionTitle?: string;
  salonAllLabel?: string;
};

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter(item => item !== value) : [...list, value];
}

export function ClassFilterModal({
  visible,
  tipoOptions,
  salonOptions,
  selectedTipos,
  selectedSalones,
  onApply,
  onClose,
  tipoSectionTitle = 'Actividades',
  tipoAllLabel = 'Todas las actividades',
  salonSectionTitle = 'Salones',
  salonAllLabel = 'Todos los salones',
}: ClassFilterModalProps) {
  const [draftTipos, setDraftTipos] = useState(selectedTipos);
  const [draftSalones, setDraftSalones] = useState(selectedSalones);

  useEffect(() => {
    if (visible) {
      setDraftTipos(selectedTipos);
      setDraftSalones(selectedSalones);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  function handleApply() {
    onApply(draftTipos, draftSalones);
    onClose();
  }

  function renderSection(
    title: string,
    allLabel: string,
    options: FilterOption[],
    draft: string[],
    setDraft: (value: string[]) => void,
  ) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>

        <Pressable style={styles.optionRow} onPress={() => setDraft([])}>
          <View style={[styles.checkbox, draft.length === 0 && styles.checkboxChecked]}>
            {draft.length === 0 && <Text style={styles.checkboxMark}>✓</Text>}
          </View>
          <Text style={styles.optionLabel}>{allLabel}</Text>
        </Pressable>

        {options.map(option => {
          const checked = draft.includes(option.value);
          return (
            <Pressable
              key={option.value}
              style={styles.optionRow}
              onPress={() => setDraft(toggleValue(draft, option.value))}>
              <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
                {checked && <Text style={styles.checkboxMark}>✓</Text>}
              </View>
              <View style={styles.optionTextWrap}>
                <Text style={styles.optionLabel}>{option.label}</Text>
                {option.description && (
                  <Text style={styles.optionDescription}>{option.description}</Text>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => {}}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrar</Text>
            <Pressable
              onPress={() => {
                setDraftTipos([]);
                setDraftSalones([]);
              }}>
              <Text style={styles.clearLabel}>Limpiar</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {renderSection(tipoSectionTitle, tipoAllLabel, tipoOptions, draftTipos, setDraftTipos)}
            {renderSection(salonSectionTitle, salonAllLabel, salonOptions, draftSalones, setDraftSalones)}
          </ScrollView>

          <PrimaryButton label="Aplicar filtros" onPress={handleApply} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(43, 36, 32, 0.4)',
  },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  clearLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.base,
    color: colors.gold,
  },
  scroll: {
    maxHeight: 440,
  },
  section: {
    gap: 2,
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
    color: colors.gold,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: colors.textPrimary,
    backgroundColor: colors.textPrimary,
  },
  checkboxMark: {
    fontSize: 12,
    fontWeight: fontWeight.semibold,
    color: colors.background,
  },
  optionTextWrap: {
    gap: 1,
  },
  optionLabel: {
    fontFamily: fontFamily.body,
    fontWeight: fontWeight.medium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  optionDescription: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.smMedium,
    color: colors.textMuted,
  },
});
