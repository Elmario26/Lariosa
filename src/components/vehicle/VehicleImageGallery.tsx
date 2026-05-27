import React, { FC, useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ListRenderItem,
  ViewToken,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import CarImage from '../CarImage';
import { getVehicleSlideImageUris, type VehicleLike } from '../../utils/vehicle';
import { SCREEN_PADDING } from '../../constants/layout';
import { HOME_COLORS } from '../../constants/homeDesign';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const VEHICLE_GALLERY_HEIGHT = 300;
const THUMB_SIZE = 64;

export interface VehicleImageGalleryProps {
  images: string[];
  vehicle: VehicleLike;
  topInset: number;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

interface SlideItem {
  key: string;
  uri: string;
  index: number;
}

const VehicleImageGallery: FC<VehicleImageGalleryProps> = ({
  images,
  vehicle,
  topInset,
  onBack,
  isFavorite,
  onToggleFavorite,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<FlatList<SlideItem>>(null);

  const slides: SlideItem[] = images.map((uri, index) => ({
    key: `slide-${index}-${uri}`,
    uri,
    index,
  }));

  const scrollToIndex = useCallback(
    (index: number, animated = true) => {
      if (index < 0 || index >= slides.length) return;
      pagerRef.current?.scrollToIndex({ index, animated });
      setActiveIndex(index);
    },
    [slides.length]
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]?.index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 60 }).current;

  const onPagerMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>): void => {
    const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (index >= 0 && index < slides.length) {
      setActiveIndex(index);
    }
  };

  const renderSlide: ListRenderItem<SlideItem> = ({ item }) => (
    <View style={styles.slide}>
      <CarImage
        uris={getVehicleSlideImageUris(vehicle, item.index)}
        uri={item.uri}
        style={styles.slideImage}
        resizeMode="cover"
      />
    </View>
  );

  const renderThumb = (uri: string, index: number) => {
    const selected = index === activeIndex;
    return (
      <TouchableOpacity
        key={`thumb-${index}`}
        onPress={() => scrollToIndex(index)}
        activeOpacity={0.9}
        style={[styles.thumbWrap, selected && styles.thumbWrapActive]}
      >
        <CarImage
          uris={getVehicleSlideImageUris(vehicle, index)}
          uri={uri}
          style={styles.thumbImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  const rootHeight = VEHICLE_GALLERY_HEIGHT + (slides.length > 1 ? THUMB_SIZE + 28 : 0);

  return (
    <View style={[styles.root, { height: rootHeight }]}>
      <FlatList
        ref={pagerRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={slides.length > 1}
        decelerationRate="fast"
        snapToAlignment="center"
        disableIntervalMomentum
        onMomentumScrollEnd={onPagerMomentumEnd}
        onScrollToIndexFailed={(info) => {
          pagerRef.current?.scrollToOffset({
            offset: info.index * SCREEN_WIDTH,
            animated: false,
          });
        }}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <View style={styles.bottomFade} pointerEvents="none" />

      {slides.length > 1 && (
        <View style={styles.counterBadge}>
          <Icon name="image-multiple" size={14} color="#fff" />
          <Text style={styles.counterText}>
            {activeIndex + 1} / {slides.length}
          </Text>
        </View>
      )}

      <View style={[styles.floatingHeader, { top: topInset + 8 }]}>
        <TouchableOpacity style={styles.headerBtn} onPress={onBack} activeOpacity={0.85}>
          <Icon name="arrow-left" size={22} color="#111827" />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} activeOpacity={0.85}>
            <Icon name="share-variant-outline" size={22} color="#111827" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={onToggleFavorite} activeOpacity={0.85}>
            <Icon
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? '#EF4444' : '#111827'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {slides.length > 1 && (
        <>
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => scrollToIndex(i)}
                hitSlop={8}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
            style={styles.thumbScroll}
          >
            {images.map((uri, i) => renderThumb(uri, i))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#111827',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: VEHICLE_GALLERY_HEIGHT,
  },
  slideImage: {
    width: SCREEN_WIDTH,
    height: VEHICLE_GALLERY_HEIGHT,
  },
  bottomFade: {
    position: 'absolute',
    top: VEHICLE_GALLERY_HEIGHT - 80,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  counterBadge: {
    position: 'absolute',
    top: VEHICLE_GALLERY_HEIGHT - 44,
    right: SCREEN_PADDING,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  counterText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  floatingHeader: {
    position: 'absolute',
    left: SCREEN_PADDING,
    right: SCREEN_PADDING,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  dotsRow: {
    position: 'absolute',
    top: VEHICLE_GALLERY_HEIGHT - 20,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 22,
    backgroundColor: '#fff',
  },
  thumbScroll: {
    maxHeight: THUMB_SIZE + 16,
  },
  thumbStrip: {
    paddingHorizontal: SCREEN_PADDING,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 10,
  },
  thumbWrap: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: 10,
  },
  thumbWrapActive: {
    borderColor: HOME_COLORS.accent,
  },
  thumbImage: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
});

export default VehicleImageGallery;
