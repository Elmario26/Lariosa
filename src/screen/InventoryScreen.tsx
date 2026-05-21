import React, { useEffect, useState, FC } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackScreenProps } from '@react-navigation/stack';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getVehiclesRequest } from '../app/actions';
import { getCarImageUrl } from '../app/config/api';
import { SCREEN_PADDING, TAB_BAR_FLOAT_HEIGHT, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FILTERS = ['All', 'Sedan', 'SUV', 'Truck', 'Hybrid', 'Electric'];

const FALLBACK_IMAGES = {
  default: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
};

interface Vehicle {
  id?: string;
  images?: string[];
  Year?: number;
  year?: number;
  status?: string;
  brand: string;
  make: string;
  price: number;
  conditions?: string;
  Mileage?: number;
  color?: string;
  [key: string]: any;
}

const getVehicleImage = (vehicle: Vehicle): string => {
  if (vehicle.images && Array.isArray(vehicle.images) && vehicle.images.length > 0) {
    return getCarImageUrl(vehicle.images[0]);
  }
  return FALLBACK_IMAGES.default;
};

const VehicleListItem: FC<{ vehicle: Vehicle; onPress: () => void }> = ({ vehicle, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.vehicleCard} activeOpacity={0.9}>
    <Image source={{ uri: getVehicleImage(vehicle) }} style={styles.vehicleImage} resizeMode="cover" />
    <View style={styles.vehicleBody}>
      <View style={styles.vehicleTitleRow}>
        <View style={styles.vehicleTitleBlock}>
          <Text style={styles.vehicleStatus}>{vehicle.status}</Text>
          <Text style={styles.vehicleName}>
            {vehicle.brand} {vehicle.make}
          </Text>
        </View>
        <View style={styles.yearBadge}>
          <Text style={styles.yearText}>{vehicle.Year || vehicle.year}</Text>
        </View>
      </View>

      <View style={styles.specRow}>
        <View style={styles.specItem}>
          <Icon name="gas-station" size={16} color="#6B7280" />
          <Text style={styles.specText}>{vehicle.conditions}</Text>
        </View>
        <View style={styles.specItem}>
          <Icon name="speedometer" size={16} color="#6B7280" />
          <Text style={styles.specText}>{vehicle.Mileage} km</Text>
        </View>
        <View style={styles.specItem}>
          <Icon name="palette" size={16} color="#6B7280" />
          <Text style={styles.specText}>{vehicle.color}</Text>
        </View>
      </View>

      <View style={styles.priceRow}>
        <Text style={styles.price}>₱{(vehicle.price || 0).toLocaleString()}</Text>
        <View style={styles.viewBtn}>
          <Text style={styles.viewBtnText}>View Details</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

type InventoryScreenProps = StackScreenProps<any, 'Inventory'>;

const InventoryScreen: FC<InventoryScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { vehicles, isLoading, error } = useSelector((state: RootState) => state.vehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const listBottomPad = TAB_BAR_FLOAT_HEIGHT + TAB_BAR_BOTTOM_GAP + insets.bottom + 24;

  useEffect(() => {
    dispatch(
      getVehiclesRequest({
        search: searchQuery,
        type: activeFilter,
      })
    );
  }, [dispatch, searchQuery, activeFilter]);

  const ListHeader = (
    <View style={styles.headerBlock}>
      <Text style={styles.title}>Inventory</Text>
      <Text style={styles.subtitle}>Browse our collection</Text>

      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search vehicles..."
          placeholderTextColor="#9CA3AF"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{filter}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={Array.isArray(vehicles) ? vehicles : []}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => (
          <VehicleListItem
            vehicle={item}
            onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAIL, { vehicle: item })}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
          ) : error ? (
            <Text style={styles.emptyError}>{error}</Text>
          ) : (
            <Text style={styles.emptyText}>No vehicles found</Text>
          )
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: listBottomPad, paddingHorizontal: SCREEN_PADDING },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    flexGrow: 1,
  },
  headerBlock: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#111827',
    paddingVertical: 0,
  },
  filterScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  filterLabelActive: {
    color: '#FFFFFF',
  },
  vehicleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  vehicleImage: {
    width: '100%',
    height: 176,
  },
  vehicleBody: {
    padding: 16,
  },
  vehicleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  vehicleTitleBlock: {
    flex: 1,
    marginRight: 8,
  },
  vehicleStatus: {
    fontSize: 11,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  yearBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 12,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563EB',
  },
  viewBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
  },
  emptyError: {
    textAlign: 'center',
    color: '#DC2626',
    marginTop: 40,
  },
});

export default InventoryScreen;
