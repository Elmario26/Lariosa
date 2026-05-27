import React, { useState, FC } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import {
  formatDateLabel,
  formatTimeLabel,
  getTodayStart,
  clampTimeIfToday,
} from '../utils/bookingDateTime';
import { THEME } from '../constants/theme';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface BookingDateTimePickerProps {
  date: Date;
  time: Date;
  onDateChange: (d: Date) => void;
  onTimeChange: (t: Date) => void;
  disabled?: boolean;
}

const BookingDateTimePicker: FC<BookingDateTimePickerProps> = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  disabled = false,
}) => {
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const onDatePicked = (event: DateTimePickerEvent, selected?: Date): void => {
    if (Platform.OS === 'android') setShowDate(false);
    if (event.type === 'dismissed' || !selected) return;
    onDateChange(selected);
    onTimeChange(clampTimeIfToday(selected, time));
  };

  const onTimePicked = (event: DateTimePickerEvent, selected?: Date): void => {
    if (Platform.OS === 'android') setShowTime(false);
    if (event.type === 'dismissed' || !selected) return;
    onTimeChange(clampTimeIfToday(date, selected));
  };

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.field, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setShowDate(true)}
        activeOpacity={0.85}
      >
        <View style={styles.iconBox}>
          <Icon name="calendar-month" size={22} color={THEME.accent} />
        </View>
        <View style={styles.fieldText}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{formatDateLabel(date)}</Text>
        </View>
        <Icon name="chevron-down" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      {showDate && (
        <View style={styles.pickerShell}>
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            minimumDate={getTodayStart()}
            locale="en-US"
            onChange={onDatePicked}
            themeVariant="light"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowDate(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <TouchableOpacity
        style={[styles.field, styles.fieldGap, disabled && styles.fieldDisabled]}
        onPress={() => !disabled && setShowTime(true)}
        activeOpacity={0.85}
      >
        <View style={styles.iconBox}>
          <Icon name="clock-outline" size={22} color={THEME.accent} />
        </View>
        <View style={styles.fieldText}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{formatTimeLabel(time)}</Text>
        </View>
        <Icon name="chevron-down" size={22} color="#9CA3AF" />
      </TouchableOpacity>

      {showTime && (
        <View style={styles.pickerShell}>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour={false}
            locale="en-US"
            onChange={onTimePicked}
            themeVariant="light"
          />
          {Platform.OS === 'ios' && (
            <TouchableOpacity style={styles.doneBtn} onPress={() => setShowTime(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: 8 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  fieldGap: { marginTop: 12 },
  fieldDisabled: { opacity: 0.55 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: THEME.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fieldText: { flex: 1 },
  label: { fontSize: 12, color: '#6B7280', fontWeight: '600', marginBottom: 2 },
  value: { fontSize: 16, color: '#111827', fontWeight: '600' },
  pickerShell: {
    marginTop: 8,
    backgroundColor: THEME.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
  },
  doneBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  doneText: { color: THEME.accent, fontWeight: '700', fontSize: 16 },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 10, marginLeft: 4 },
});

export default BookingDateTimePicker;
