import React, { useMemo, useState, FC } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  PMS_SERVICES,
  PMS_SERVICE_CATEGORIES,
  getPmsServiceById,
  type PmsServiceOption,
} from '../constants/pmsServices';
import { THEME } from '../constants/theme';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ServicePickerProps {
  value: string;
  onChange: (serviceId: string) => void;
  disabled?: boolean;
  label?: string;
}

const ServicePicker: FC<ServicePickerProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Service',
}) => {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = getPmsServiceById(value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return PMS_SERVICES;
    return PMS_SERVICES.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.categoryId.includes(q)
    );
  }, [query]);

  const sections = useMemo(() => {
    return PMS_SERVICE_CATEGORIES.map((cat) => ({
      ...cat,
      items: filtered.filter((s) => s.categoryId === cat.id),
    })).filter((s) => s.items.length > 0);
  }, [filtered]);

  const flatData = useMemo(() => {
    const rows: Array<
      | { type: 'header'; key: string; label: string; icon: string }
      | { type: 'item'; key: string; service: PmsServiceOption }
    > = [];
    for (const section of sections) {
      rows.push({
        type: 'header',
        key: `h-${section.id}`,
        label: section.label,
        icon: section.icon,
      });
      for (const service of section.items) {
        rows.push({ type: 'item', key: service.id, service });
      }
    }
    return rows;
  }, [sections]);

  const pick = (id: string): void => {
    onChange(id);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, disabled && styles.triggerDisabled]}
        onPress={() => !disabled && setOpen(true)}
        activeOpacity={0.88}
      >
        <View style={styles.triggerIcon}>
          <Icon name={selected?.icon ?? 'wrench'} size={22} color={THEME.primary} />
        </View>
        <View style={styles.triggerText}>
          <Text style={styles.triggerLabel}>{label}</Text>
          <Text style={styles.triggerValue} numberOfLines={1}>
            {selected?.name ?? 'Select a service'}
          </Text>
          {selected?.description ? (
            <Text style={styles.triggerHint} numberOfLines={1}>
              {selected.description}
              {selected.estimatedMinutes ? ` · ~${selected.estimatedMinutes} min` : ''}
            </Text>
          ) : null}
        </View>
        <Icon name="chevron-down" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>Choose a service</Text>
          <Text style={styles.sheetSub}>Oil change, tires, PMS packages & more</Text>

          <View style={styles.searchRow}>
            <Icon name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services…"
              placeholderTextColor="#9CA3AF"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')} hitSlop={8}>
                <Icon name="close-circle" size={18} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>

          <FlatList
            data={flatData}
            keyExtractor={(row) => row.key}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item: row }) => {
              if (row.type === 'header') {
                return (
                  <View style={styles.sectionHeader}>
                    <Icon name={row.icon} size={16} color="#6B7280" />
                    <Text style={styles.sectionTitle}>{row.label}</Text>
                  </View>
                );
              }
              const { service } = row;
              const isSelected = service.id === value;
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => pick(service.id)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.optionIcon, isSelected && styles.optionIconSelected]}>
                    <Icon
                      name={service.icon}
                      size={20}
                      color={isSelected ? '#fff' : THEME.primary}
                    />
                  </View>
                  <View style={styles.optionBody}>
                    <Text style={[styles.optionName, isSelected && styles.optionNameSelected]}>
                      {service.name}
                    </Text>
                    <Text style={styles.optionDesc} numberOfLines={2}>
                      {service.description}
                      {service.estimatedMinutes ? ` · ~${service.estimatedMinutes} min` : ''}
                    </Text>
                  </View>
                  {isSelected ? (
                    <Icon name="check-circle" size={22} color={THEME.primary} />
                  ) : (
                    <Icon name="chevron-right" size={20} color="#D1D5DB" />
                  )}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No services match your search.</Text>
            }
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  triggerDisabled: { opacity: 0.55 },
  triggerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  triggerText: { flex: 1 },
  triggerLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  triggerValue: { fontSize: 16, color: '#111827', fontWeight: '700' },
  triggerHint: { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '78%',
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  sheetSub: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 14 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },
  list: { flexGrow: 0 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    marginBottom: 4,
  },
  optionSelected: { backgroundColor: '#FFFBEB' },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionIconSelected: { backgroundColor: THEME.primary },
  optionBody: { flex: 1 },
  optionName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  optionNameSelected: { color: THEME.primary },
  optionDesc: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  empty: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 24 },
});

export default ServicePicker;
