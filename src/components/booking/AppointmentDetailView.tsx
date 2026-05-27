import React, { FC } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { THEME, CARD_SHADOW, getBookingStatusStyle } from '../../constants/theme';
import type { AppointmentDetailData } from '../../types/appointmentDetail';

function capitalizeStatus(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export interface AppointmentDetailViewProps {
  detail: AppointmentDetailData;
  onEdit?: () => void;
  onDelete?: () => void;
  isSubmitting?: boolean;
  deleteLabel?: string;
}

const AppointmentDetailView: FC<AppointmentDetailViewProps> = ({
  detail,
  onEdit,
  onDelete,
  isSubmitting = false,
  deleteLabel = 'Cancel',
}) => {
  const statusStyle = getBookingStatusStyle(detail.statusKey);
  const showActions = (detail.canEdit && onEdit) || (detail.canDelete && onDelete);

  return (
    <View style={styles.root}>
      <View style={[styles.card, CARD_SHADOW]}>
        <View style={styles.heroRow}>
          <View style={[styles.heroIcon, { backgroundColor: detail.iconBg }]}>
            <Icon name={detail.icon} size={26} color={detail.iconColor} />
          </View>
          <View style={styles.heroText}>
            <View style={styles.pillRow}>
              <View style={styles.typePill}>
                <Text style={styles.typePillText}>{detail.typeLabel}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusText, { color: statusStyle.text }]}>
                  {capitalizeStatus(detail.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.title}>{detail.title}</Text>
            <Text style={styles.subtitle}>{detail.subtitle}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, CARD_SHADOW]}>
        <Text style={styles.sectionTitle}>Schedule</Text>
        <View style={styles.scheduleRow}>
          <View style={styles.scheduleChip}>
            <Icon name="calendar-month-outline" size={18} color={THEME.accent} />
            <Text style={styles.scheduleText}>{detail.date}</Text>
          </View>
          <View style={styles.scheduleChip}>
            <Icon name="clock-outline" size={18} color={THEME.accent} />
            <Text style={styles.scheduleText}>{detail.time}</Text>
          </View>
        </View>
      </View>

      {detail.rows.length > 0 && (
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.sectionTitle}>Details</Text>
          {detail.rows.map((row, index) => (
            <View
              key={`${row.label}-${index}`}
              style={[
                styles.detailRow,
                index === detail.rows.length - 1 && styles.detailRowLast,
              ]}
            >
              <Icon name={row.icon} size={20} color={THEME.textMuted} style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>{row.label}</Text>
                <Text style={styles.detailValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {detail.notes ? (
        <View style={[styles.card, CARD_SHADOW]}>
          <Text style={styles.sectionTitle}>Your notes</Text>
          <Text style={styles.bodyText}>{detail.notes}</Text>
        </View>
      ) : null}

      {detail.staffRemarks ? (
        <View style={[styles.card, styles.staffCard, CARD_SHADOW]}>
          <View style={styles.staffHeader}>
            <Icon name="account-tie-outline" size={20} color={THEME.accent} />
            <Text style={styles.staffTitle}>Staff remarks</Text>
          </View>
          <Text style={styles.bodyText}>{detail.staffRemarks}</Text>
          {detail.staffRemarksAt ? (
            <Text style={styles.staffMeta}>Updated {detail.staffRemarksAt}</Text>
          ) : null}
        </View>
      ) : null}

      {detail.footerMessage ? (
        <View style={styles.footerBanner}>
          <Icon name="information-outline" size={18} color={THEME.accent} />
          <Text style={styles.footerText}>{detail.footerMessage}</Text>
        </View>
      ) : null}

      {showActions && (
        <View style={styles.actions}>
          {detail.canEdit && onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              disabled={isSubmitting}
              style={[styles.primaryAction, isSubmitting && styles.actionDisabled]}
              activeOpacity={0.85}
            >
              <Icon name="pencil" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {detail.canDelete && onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              disabled={isSubmitting}
              style={[
                styles.secondaryAction,
                !detail.canEdit && styles.secondaryActionFull,
                isSubmitting && styles.actionDisabled,
              ]}
              activeOpacity={0.85}
            >
              <Icon name="delete-outline" size={18} color={THEME.error} />
              <Text style={styles.secondaryActionText}>{deleteLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroText: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  typePill: {
    backgroundColor: THEME.background,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME.text,
    lineHeight: 24,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
    marginBottom: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scheduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  scheduleText: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.cardBorder,
  },
  detailIcon: {
    marginTop: 2,
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME.textMuted,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 21,
  },
  detailRowLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  bodyText: {
    fontSize: 15,
    color: THEME.textMuted,
    lineHeight: 22,
  },
  staffCard: {
    backgroundColor: THEME.accentMuted,
    borderColor: `${THEME.accent}40`,
  },
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  staffTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.text,
  },
  staffMeta: {
    fontSize: 12,
    color: THEME.accent,
    marginTop: 10,
    fontWeight: '600',
  },
  footerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: THEME.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: THEME.textMuted,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.primary,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.errorMuted,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  secondaryActionFull: {
    flex: 1,
  },
  secondaryActionText: {
    color: THEME.error,
    fontWeight: '700',
    fontSize: 15,
  },
  actionDisabled: {
    opacity: 0.65,
  },
});

export default AppointmentDetailView;
