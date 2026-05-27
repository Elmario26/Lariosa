import React, { useCallback, useState, FC } from 'react';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import {
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../utils';
import { HOME_COLORS } from '../constants/homeDesign';
import { SCREEN_PADDING } from '../constants/layout';
import { THEME, CARD_SHADOW } from '../constants/theme';
import VehicleImageGallery from '../components/vehicle/VehicleImageGallery';
import {
  getVehicleDisplayName,
  getVehicleImages,
  formatVehiclePrice,
  getStatusStyle,
  buildVehicleSpecs,
  buildVehicleHighlights,
  type VehicleLike,
} from '../utils/vehicle';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
interface RouteParams {
  vehicle?: VehicleLike;
}

const VehicleDetailScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const vehicle = route.params?.vehicle;
  const insets = useSafeAreaInsets();
  const [isFavorite, setIsFavorite] = useState(false);

  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      if (Platform.OS === 'android') {
        StatusBar.setTranslucent(true);
        StatusBar.setBackgroundColor('transparent');
      }
      return () => {
        StatusBar.setBarStyle('dark-content');
        if (Platform.OS === 'android') {
          StatusBar.setTranslucent(false);
          StatusBar.setBackgroundColor(THEME.background);
        }
      };
    }, [])
  );

  if (!vehicle) {
    return (
      <View style={[styles.emptyRoot, { paddingTop: insets.top }]}>
        <Icon name="car-off" size={48} color={HOME_COLORS.textMuted} />
        <Text style={styles.emptyText}>Vehicle not found</Text>
        <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.emptyBtnText}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = getVehicleImages(vehicle);
  const status = getStatusStyle(vehicle.status);
  const specs = buildVehicleSpecs(vehicle);
  const highlights = buildVehicleHighlights(vehicle);
  const displayName = getVehicleDisplayName(vehicle);
  return (
    <View style={styles.root}>
      <VehicleImageGallery
        images={images}
        vehicle={vehicle}
        topInset={insets.top}
        onBack={() => navigation.goBack()}
        isFavorite={isFavorite}
        onToggleFavorite={() => setIsFavorite(!isFavorite)}
      />

      <ScrollView
        style={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.bodyContent}
        nestedScrollEnabled
      >
        <View style={[styles.content, { marginTop: -8 }]}>
          <View style={styles.titleRow}>
            <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
            </View>
            <Text style={styles.vehicleName}>{displayName}</Text>
            <Text style={styles.vehicleMeta}>
              {vehicle.brand} · {vehicle.conditions || 'Premium listing'}
            </Text>
          </View>

          <Text style={styles.price}>{formatVehiclePrice(vehicle.price)}</Text>

          <View style={styles.quickFacts}>
            <View style={styles.factCard}>
              <Icon name="calendar" size={20} color={THEME.accent} />
              <Text style={styles.factLabel}>Year</Text>
              <Text style={styles.factValue}>{specs[0]?.value ?? '—'}</Text>
            </View>
            <View style={styles.factCard}>
              <Icon name="speedometer" size={20} color={THEME.accent} />
              <Text style={styles.factLabel}>Mileage</Text>
              <Text style={styles.factValue}>
                {vehicle.Mileage != null ? `${vehicle.Mileage} km` : '—'}
              </Text>
            </View>
            <View style={styles.factCard}>
              <Icon name="palette" size={20} color={THEME.accent} />
              <Text style={styles.factLabel}>Color</Text>
              <Text style={styles.factValue} numberOfLines={1}>
                {vehicle.color || '—'}
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specGrid}>
            {specs.map((spec) => (
              <View key={spec.label} style={styles.specCard}>
                <View style={styles.specIconWrap}>
                  <Icon name={spec.icon} size={20} color={THEME.accent} />
                </View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue} numberOfLines={2}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlights}>
            {highlights.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <Icon name="check-circle" size={18} color={THEME.success} />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>About this vehicle</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {vehicle.damageDescription?.trim() ||
                `The ${displayName} is offered through Ramle Wheels with transparent pricing and professional support. Schedule a test drive to experience it in person, or contact us for financing and trade-in options.`}
            </Text>
          </View>

          <View style={{ height: 88 + insets.bottom }} />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.footerPrimary}
          onPress={() => navigation.navigate(ROUTES.TEST_DRIVE, { vehicle })}
          activeOpacity={0.88}
        >
          <Text style={styles.footerPrimaryText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  emptyRoot: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: { fontSize: 16, color: HOME_COLORS.textMuted, marginTop: 12 },
  emptyBtn: {
    marginTop: 20,
    backgroundColor: HOME_COLORS.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700' },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    flexGrow: 1,
  },
  content: {
    backgroundColor: HOME_COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 24,
    ...CARD_SHADOW,
  },
  titleRow: {
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: { fontSize: 12, fontWeight: '700' },
  vehicleName: {
    fontSize: 26,
    fontWeight: '800',
    color: HOME_COLORS.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  vehicleMeta: {
    fontSize: 14,
    color: HOME_COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
    color: THEME.primary,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  quickFacts: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  factCard: {
    flex: 1,
    backgroundColor: THEME.card,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  factLabel: {
    fontSize: 11,
    color: HOME_COLORS.textMuted,
    marginTop: 6,
    fontWeight: '600',
  },
  factValue: {
    fontSize: 13,
    fontWeight: '700',
    color: HOME_COLORS.text,
    marginTop: 2,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: HOME_COLORS.text,
    marginBottom: 14,
  },
  specGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  specCard: {
    width: (SCREEN_WIDTH - SCREEN_PADDING * 2 - 12) / 2,
    backgroundColor: THEME.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  specIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: THEME.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  specLabel: { fontSize: 12, color: HOME_COLORS.textMuted, fontWeight: '600' },
  specValue: { fontSize: 15, fontWeight: '700', color: HOME_COLORS.text, marginTop: 4 },
  highlights: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
    gap: 12,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightText: { flex: 1, fontSize: 14, color: HOME_COLORS.text, fontWeight: '500' },
  aboutCard: {
    backgroundColor: THEME.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: THEME.cardBorder,
    ...CARD_SHADOW,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 24,
    color: HOME_COLORS.textMuted,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 12,
    backgroundColor: THEME.card,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
    ...CARD_SHADOW,
  },
  footerPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.primary,
    gap: 8,
  },
  footerPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default VehicleDetailScreen;
