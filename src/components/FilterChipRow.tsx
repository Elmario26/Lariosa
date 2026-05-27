import React, { FC } from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform, ScrollView, View } from 'react-native';
import { HOME_COLORS } from '../constants/homeDesign';
import { THEME } from '../constants/theme';

/** Chip body height; container adds vertical padding so ScrollView does not clip */
const CHIP_HEIGHT = 44;
const ROW_PADDING_V = 10;

export interface FilterChipOption {
  key: string;
  label: string;
  count?: number;
}

export interface FilterChipRowProps {
  options: FilterChipOption[];
  value: string;
  onChange: (key: string) => void;
  hideZeroCount?: boolean;
  alwaysShowKeys?: string[];
  style?: object;
}

const FilterChipRow: FC<FilterChipRowProps> = ({
  options,
  value,
  onChange,
  hideZeroCount = false,
  alwaysShowKeys = [],
  style,
}) => (
  <View style={[styles.container, style]}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      nestedScrollEnabled
    >
      {options.map((opt) => {
        const active = value === opt.key;
        const hasCount = opt.count !== undefined && opt.count > 0;
        if (
          hideZeroCount &&
          opt.count !== undefined &&
          opt.count === 0 &&
          !alwaysShowKeys.includes(opt.key)
        ) {
          return null;
        }
        return (
          <TouchableOpacity
            key={opt.key}
            style={[styles.filterChip, active && styles.filterChipActive]}
            onPress={() => onChange(opt.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[styles.filterChipText, active && styles.filterChipTextActive]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
            {hasCount && (
              <View style={[styles.filterCountBadge, active && styles.filterCountBadgeActive]}>
                <Text
                  style={[styles.filterCountText, active && styles.filterCountTextActive]}
                >
                  {opt.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const styles = StyleSheet.create({
  container: {
    minHeight: CHIP_HEIGHT + ROW_PADDING_V * 2,
    paddingVertical: ROW_PADDING_V,
  },
  scroll: {
    flexGrow: 0,
    height: CHIP_HEIGHT,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: CHIP_HEIGHT,
    paddingRight: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: CHIP_HEIGHT,
    paddingLeft: 20,
    paddingRight: 16,
    borderRadius: 22,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: THEME.brand,
    borderColor: THEME.brand,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
    color: HOME_COLORS.text,
    ...(Platform.OS === 'android'
      ? { includeFontPadding: false, textAlignVertical: 'center' as const }
      : {}),
  },
  filterChipTextActive: {
    color: THEME.textInverse,
  },
  filterCountBadge: {
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
    color: HOME_COLORS.textMuted,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  filterCountTextActive: {
    color: THEME.textInverse,
  },
});

export default FilterChipRow;
