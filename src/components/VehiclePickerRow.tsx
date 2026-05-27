import React, { FC } from 'react';
import { View, Text, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import CarImage from './CarImage';
import { getVehicleImageUris, type VehicleLike } from '../utils/vehicle';
import { THEME } from '../constants/theme';

export interface VehiclePickerItem extends VehicleLike {
  id: string | number;
  brand: string;
}

export interface VehiclePickerRowProps {
  vehicles: VehiclePickerItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

const CARD_WIDTH = 160;
const CARD_GAP = 14;
const ROW_HEIGHT = 148;

const VehiclePickerRow: FC<VehiclePickerRowProps> = ({
  vehicles,
  selectedId,
  onSelect,
  loading = false,
}) => {
  if (loading && vehicles.length === 0) {
    return (
      <View style={styles.host}>
        <ActivityIndicator color={THEME.accent} />
      </View>
    );
  }

  if (vehicles.length === 0) {
    return (
      <View style={styles.host}>
        <Text style={styles.empty}>No vehicles available right now.</Text>
      </View>
    );
  }

  return (
    <View style={styles.host}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        {vehicles.map((vehicle) => {
          const id = String(vehicle.id);
          const selected = selectedId === id;
          return (
            <TouchableOpacity
              key={id}
              onPress={() => onSelect(id)}
              activeOpacity={0.85}
              style={[styles.card, selected && styles.cardSelected]}
            >
              <CarImage
                uris={getVehicleImageUris(vehicle)}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {vehicle.brand} {vehicle.model || vehicle.make}
                </Text>
                <Text style={styles.cardYear}>{vehicle.year ?? vehicle.Year ?? '—'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  host: {
    height: ROW_HEIGHT,
    marginBottom: 24,
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  empty: {
    paddingHorizontal: 20,
    color: '#6b7280',
    fontSize: 14,
  },
  card: {
    width: CARD_WIDTH,
    marginRight: CARD_GAP,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'transparent',
    ...Platform.select({
      android: { elevation: 2 },
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
    }),
  },
  cardSelected: {
    borderColor: THEME.accent,
  },
  cardImage: {
    width: CARD_WIDTH,
    height: 96,
    backgroundColor: '#e5e7eb',
  },
  cardBody: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  cardYear: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
});

export default VehiclePickerRow;
