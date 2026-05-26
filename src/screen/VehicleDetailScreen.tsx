import React, { useState, useRef, FC } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../utils';
import { HOME_COLORS } from '../constants/homeDesign';
import { SCREEN_PADDING } from '../constants/layout';
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
const HERO_HEIGHT = 320;

interface RouteParams {
  vehicle?: VehicleLike;
}

const VehicleDetailScreen: FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const vehicle = route.params?.vehicle;
  const insets = useSafeAreaInsets();

  const [activeImage, setActiveImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const galleryRef = useRef<ScrollView>(null);

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

  const onGalleryScroll = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImage(index);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image gallery */}
        <View style={styles.hero}>
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={onGalleryScroll}
            scrollEventThrottle={16}
          >
            {images.map((uri, i) => (
              <Image key={`${uri}-${i}`} source={{ uri }} style={styles.heroImage} resizeMode="cover" />
            ))}
          </ScrollView>
          <View style={styles.heroBottomFade} pointerEvents="none" />

          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
              ))}
            </View>
          )}

          <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
              <Icon name="arrow-left" size={22} color="#111827" />
            </TouchableOpacity>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.headerBtn} activeOpacity={0.85}>
                <Icon name="share-variant-outline" size={22} color="#111827" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => setIsFavorite(!isFavorite)}
                activeOpacity={0.85}
              >
                <Icon
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#EF4444' : '#111827'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content card */}
        <View style={styles.content}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
              </View>
              <Text style={styles.vehicleName}>{displayName}</Text>
              <Text style={styles.vehicleMeta}>
                {vehicle.brand} · {vehicle.conditions || 'Premium listing'}
              </Text>
            </View>
          </View>

          <Text style={styles.price}>{formatVehiclePrice(vehicle.price)}</Text>

          {/* Quick chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chip}>
              <Icon name="calendar" size={16} color={HOME_COLORS.accent} />
              <Text style={styles.chipText}>{specs[0]?.value ?? '—'}</Text>
            </View>
            <View style={styles.chip}>
              <Icon name="speedometer" size={16} color={HOME_COLORS.accent} />
              <Text style={styles.chipText}>
                {vehicle.Mileage != null ? `${vehicle.Mileage} km` : '—'}
              </Text>
            </View>
            <View style={styles.chip}>
              <Icon name="palette" size={16} color={HOME_COLORS.accent} />
              <Text style={styles.chipText}>{vehicle.color || '—'}</Text>
            </View>
            <View style={styles.chip}>
              <Icon name="car-cog" size={16} color={HOME_COLORS.accent} />
              <Text style={styles.chipText}>{vehicle.conditions || '—'}</Text>
            </View>
          </ScrollView>

          {/* Specs grid */}
          <Text style={styles.sectionTitle}>Specifications</Text>
          <View style={styles.specGrid}>
            {specs.map((spec) => (
              <View key={spec.label} style={styles.specCard}>
                <View style={styles.specIconWrap}>
                  <Icon name={spec.icon} size={20} color={HOME_COLORS.accent} />
                </View>
                <Text style={styles.specLabel}>{spec.label}</Text>
                <Text style={styles.specValue} numberOfLines={2}>
                  {spec.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Highlights */}
          <Text style={styles.sectionTitle}>Highlights</Text>
          <View style={styles.highlights}>
            {highlights.map((item) => (
              <View key={item} style={styles.highlightRow}>
                <Icon name="check-circle" size={18} color="#059669" />
                <Text style={styles.highlightText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About this vehicle</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutText}>
              {vehicle.damageDescription?.trim() ||
                `The ${displayName} is offered through LaRiosa with transparent pricing and professional support. Schedule a test drive to experience it in person, or contact us for financing and trade-in options.`}
            </Text>
          </View>

          <View style={{ height: 100 + insets.bottom }} />
        </View>
      </ScrollView>

      {/* Sticky CTA */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity
          style={styles.footerPrimary}
          onPress={() => navigation.navigate(ROUTES.TEST_DRIVE, { vehicle })}
          activeOpacity={0.88}
        >
          <Icon name="car-clock" size={22} color="#fff" />
          <Text style={styles.footerPrimaryText}>Book test drive</Text>
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
  hero: {
    height: HERO_HEIGHT,
    backgroundColor: '#1F2937',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: HERO_HEIGHT,
  },
  heroBottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: 'rgba(238, 242, 246, 0.55)',
  },
  dots: {
    position: 'absolute',
    bottom: 36,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#fff',
  },
  floatingHeader: {
    position: 'absolute',
    left: SCREEN_PADDING,
    right: SCREEN_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: { flexDirection: 'row', gap: 10 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    marginTop: -28,
    backgroundColor: HOME_COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 24,
  },
  titleRow: { marginBottom: 8 },
  titleBlock: { flex: 1 },
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
    color: HOME_COLORS.accent,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  chipsScroll: { marginBottom: 24 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: HOME_COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    marginRight: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipText: { fontSize: 13, fontWeight: '600', color: HOME_COLORS.text },
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
    backgroundColor: HOME_COLORS.card,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  specIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  specLabel: { fontSize: 12, color: HOME_COLORS.textMuted, fontWeight: '600' },
  specValue: { fontSize: 15, fontWeight: '700', color: HOME_COLORS.text, marginTop: 4 },
  highlights: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 28,
    gap: 12,
  },
  highlightRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  highlightText: { flex: 1, fontSize: 14, color: HOME_COLORS.text, fontWeight: '500' },
  aboutCard: {
    backgroundColor: HOME_COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
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
    backgroundColor: HOME_COLORS.card,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 12,
  },
  footerPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 16,
    backgroundColor: HOME_COLORS.accent,
    gap: 8,
    shadowColor: HOME_COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  footerPrimaryText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});

export default VehicleDetailScreen;
