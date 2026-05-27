import { resolveCarImageUris } from '../app/config/api';
import { THEME } from '../constants/theme';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800';

export interface VehicleLike {
  id?: string | number;
  brand: string;
  make?: string;
  model?: string;
  year?: number | string;
  Year?: number | string;
  price?: number;
  status?: string;
  conditions?: string;
  Mileage?: number | string;
  color?: string;
  images?: Array<string | { filename?: string; url?: string; name?: string }>;
  /** API Platform — relative paths like /api/car-images/file.jpg */
  imageUrls?: string[];
  image?: string;
  plateNumber?: string;
  engineNumber?: string;
  damageDescription?: string;
  type?: string;
  [key: string]: unknown;
}

export function getVehicleDisplayName(v: VehicleLike): string {
  const model = v.model || v.make || '';
  return `${v.brand} ${model}`.trim();
}

export function getVehicleYear(v: VehicleLike): string {
  return String(v.Year ?? v.year ?? '—');
}

/** Ordered URLs to try for gallery / carousel (first image expanded with alternates) */
export function getVehicleImageUris(v: VehicleLike): string[] {
  const urls: string[] = [];

  if (v.imageUrls && Array.isArray(v.imageUrls)) {
    for (const entry of v.imageUrls) {
      urls.push(...resolveCarImageUris(entry));
    }
  }

  if (urls.length === 0 && v.images && Array.isArray(v.images)) {
    for (const entry of v.images) {
      urls.push(...resolveCarImageUris(entry));
    }
  }

  if (urls.length === 0 && v.image) {
    urls.push(...resolveCarImageUris(v.image));
  }

  const unique = [...new Set(urls)];
  return unique.length > 0 ? unique : [FALLBACK_IMAGE];
}

/** Unique image per slide (one filename → one primary URL) */
export function getVehicleImages(v: VehicleLike): string[] {
  if (!v.images?.length && !v.image) return [FALLBACK_IMAGE];

  const slides: string[] = [];
  if (v.images?.length) {
    for (const entry of v.images) {
      const uris = resolveCarImageUris(entry);
      if (uris[0]) slides.push(uris[0]);
    }
  } else if (v.image) {
    const uris = resolveCarImageUris(v.image);
    if (uris[0]) slides.push(uris[0]);
  }

  return slides.length > 0 ? slides : [FALLBACK_IMAGE];
}

export function getVehiclePrimaryImage(v: VehicleLike): string {
  return getVehicleImageUris(v)[0] ?? FALLBACK_IMAGE;
}

/** Candidate URLs for one gallery slide (by index in `images`) */
export function getVehicleSlideImageUris(v: VehicleLike, slideIndex: number): string[] {
  const entry = v.images?.[slideIndex];
  if (entry != null) {
    const uris = resolveCarImageUris(entry);
    if (uris.length > 0) return uris;
  }
  if (slideIndex === 0 && v.image) {
    const uris = resolveCarImageUris(v.image);
    if (uris.length > 0) return uris;
  }
  return [FALLBACK_IMAGE];
}

export function formatVehiclePrice(price?: number): string {
  return `₱${(price ?? 0).toLocaleString()}`;
}

export function getStatusStyle(status?: string): { bg: string; text: string; label: string } {
  const s = (status ?? 'available').toLowerCase();
  if (s === 'available' || s === 'active') {
    return { bg: THEME.successMuted, text: THEME.success, label: 'Available' };
  }
  if (s === 'sold') {
    return { bg: THEME.errorMuted, text: THEME.error, label: 'Sold' };
  }
  if (s === 'reserved' || s === 'pending') {
    return { bg: THEME.primaryMuted, text: THEME.primary, label: 'Reserved' };
  }
  return { bg: THEME.accentMuted, text: THEME.accent, label: status ?? 'Listed' };
}

export interface VehicleSpecItem {
  icon: string;
  label: string;
  value: string;
}

export function buildVehicleSpecs(v: VehicleLike): VehicleSpecItem[] {
  const specs: VehicleSpecItem[] = [
    { icon: 'calendar', label: 'Year', value: getVehicleYear(v) },
    { icon: 'speedometer', label: 'Mileage', value: v.Mileage != null ? `${v.Mileage} km` : '—' },
    { icon: 'car-cog', label: 'Condition', value: v.conditions || '—' },
    { icon: 'palette', label: 'Color', value: v.color || '—' },
  ];
  if (v.plateNumber) {
    specs.push({ icon: 'card-text-outline', label: 'Plate', value: String(v.plateNumber) });
  }
  if (v.engineNumber) {
    specs.push({ icon: 'engine', label: 'Engine no.', value: String(v.engineNumber) });
  }
  return specs;
}

export function buildVehicleHighlights(v: VehicleLike): string[] {
  const items: string[] = [];
  if (v.conditions) items.push(v.conditions);
  if (v.color) items.push(`${v.color} exterior`);
  if (v.status === 'available') items.push('Ready for test drive');
  items.push('Full dealer inspection');
  items.push('Financing options available');
  return items.slice(0, 6);
}
