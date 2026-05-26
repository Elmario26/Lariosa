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
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { ROUTES } from '../utils';
import { getVehiclesRequest } from '../app/actions';
import { getCarImageUrl } from '../app/config/api';
import { SCREEN_PADDING, TAB_BAR_BOTTOM_GAP } from '../constants/layout';
import { THEME, CARD_SHADOW } from '../constants/theme';
import { HOME_COLORS } from '../constants/homeDesign';
import { getStatusStyle } from '../utils/vehicle';
import FilterChipRow, { type FilterChipOption } from '../components/FilterChipRow';
import { RootState } from '../app/store';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const FILTER_OPTIONS: FilterChipOption[] = [
  { key: 'All', label: 'All' },
  { key: 'Sedan', label: 'Sedan' },
  { key: 'SUV', label: 'SUV' },
  { key: 'Truck', label: 'Truck' },
  { key: 'Hybrid', label: 'Hybrid' },
  { key: 'Electric', label: 'Electric' },
];

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400';

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
  if (vehicle.images?.length) {
    return getCarImageUrl(vehicle.images[0]);
  }
  return FALLBACK_IMAGE;
};

const VehicleListItem: FC<{ vehicle: Vehicle; onPress: () => void }> = ({ vehicle, onPress }) => {
  const statusStyle = getStatusStyle(vehicle.status);
  const year = vehicle.Year ?? vehicle.year;

  return (
    <TouchableOpacity onPress={onPress} style={styles.vehicleCard} activeOpacity={0.9}>
      <Image source={{ uri: getVehicleImage(vehicle) }} style={styles.vehicleImage} resizeMode="cover" />
      <View style={styles.vehicleBody}>
        <View style={styles.vehicleTitleRow}>
          <View style={styles.vehicleTitleBlock}>
            {vehicle.status ? (
              <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                <Text style={[styles.statusPillText, { color: statusStyle.text }]}>
                  {statusStyle.label}
                </Text>
              </View>
            ) : null}
            <Text style={styles.vehicleName}>
              {vehicle.brand} {vehicle.make}
            </Text>
          </View>
          {year ? (
            <View style={styles.yearBadge}>
              <Text style={styles.yearText}>{year}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.specRow}>
          {vehicle.conditions ? (
            <View style={styles.specChip}>
              <Icon name="gas-station-outline" size={15} color={THEME.accent} />
              <Text style={styles.specText} numberOfLines={1}>
                {vehicle.conditions}
              </Text>
            </View>
          ) : null}
          {vehicle.Mileage != null ? (
            <View style={styles.specChip}>
              <Icon name="speedometer" size={15} color={THEME.accent} />
              <Text style={styles.specText}>{vehicle.Mileage.toLocaleString()} km</Text>
            </View>
          ) : null}
          {vehicle.color ? (
            <View style={styles.specChip}>
              <Icon name="palette-outline" size={15} color={THEME.accent} />
              <Text style={styles.specText} numberOfLines={1}>
                {vehicle.color}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>₱{(vehicle.price || 0).toLocaleString()}</Text>
          <View style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>View details</Text>
            <Icon name="arrow-right" size={16} color="#fff" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

type InventoryScreenProps = StackScreenProps<any, 'Inventory'>;

const InventoryScreen: FC<InventoryScreenProps> = () => {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const { vehicles, isLoading, error } = useSelector((state: RootState) => state.vehicles);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const listBottomPad = 72 + TAB_BAR_BOTTOM_GAP + insets.bottom;
  const vehicleList = Array.isArray(vehicles) ? vehicles : [];

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
      <Text style={styles.subtitle}>
        {isLoading && vehicleList.length === 0
          ? 'Loading vehicles…'
          : `${vehicleList.length} vehicle${vehicleList.length === 1 ? '' : 's'} available`}
      </Text>

      <View style={styles.searchBox}>
        <Icon name="magnify" size={22} color={THEME.accent} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brand, model…"
          placeholderTextColor={HOME_COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={8}>
            <Icon name="close-circle" size={20} color={HOME_COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <FilterChipRow options={FILTER_OPTIONS} value={activeFilter} onChange={setActiveFilter} />
    </View>
  );

  const ListEmpty = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={THEME.accent} style={styles.loader} />;
    }
    if (error) {
      return (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIcon, styles.emptyIconError]}>
            <Icon name="cloud-off-outline" size={36} color={THEME.error} />
          </View>
          <Text style={styles.emptyTitle}>Could not load inventory</Text>
          <Text style={styles.emptySub}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() =>
              dispatch(getVehiclesRequest({ search: searchQuery, type: activeFilter }))
            }
          >
            <Text style={styles.retryBtnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIcon}>
          <Icon name="car-off" size={40} color={THEME.accent} />
        </View>
        <Text style={styles.emptyTitle}>No vehicles found</Text>
        <Text style={styles.emptySub}>Try another filter or search term.</Text>
      </View>
    );
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={vehicleList}
        keyExtractor={(item, index) => String(item.id ?? index)}
        renderItem={({ item }) => (
          <VehicleListItem
            vehicle={item}
            onPress={() => navigation.navigate(ROUTES.VEHICLE_DETAIL, { vehicle: item })}
          />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: listBottomPad }]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: SCREEN_PADDING,
  },
  headerBlock: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: HOME_COLORS.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    marginTop: 4,
    marginBottom: 18,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.card,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: HOME_COLORS.text,
    paddingVertical: 0,
  },
  vehicleCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  vehicleImage: {
    width: '100%',
    height: 180,
    backgroundColor: THEME.background,
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
    marginRight: 10,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: '800',
    color: HOME_COLORS.text,
    lineHeight: 24,
  },
  yearBadge: {
    backgroundColor: THEME.accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  yearText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.accent,
  },
  specRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  specChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.background,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    gap: 5,
    maxWidth: '100%',
  },
  specText: {
    fontSize: 12,
    fontWeight: '600',
    color: HOME_COLORS.textMuted,
    flexShrink: 1,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: THEME.border,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: THEME.primary,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.primary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  viewBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  loader: {
    marginTop: 48,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: THEME.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyIconError: {
    backgroundColor: THEME.errorMuted,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: HOME_COLORS.text,
  },
  emptySub: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 16,
    backgroundColor: THEME.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default InventoryScreen;
