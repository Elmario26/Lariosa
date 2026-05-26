import { getCarImageUrl } from '../app/config/api';
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
  images?: string[];
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

export function getVehicleImages(v: VehicleLike): string[] {
  if (v.images && Array.isArray(v.images) && v.images.length > 0) {
    return v.images.map((f) => getCarImageUrl(String(f)));
  }
  if (v.image) return [v.image];
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
