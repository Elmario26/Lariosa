export type PmsServiceCategoryId = 'pms' | 'tires' | 'fluids' | 'inspection' | 'other';

export interface PmsServiceCategory {
  id: PmsServiceCategoryId;
  label: string;
  icon: string;
}

export interface PmsServiceOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  categoryId: PmsServiceCategoryId;
  /** Typical visit duration shown in the picker */
  estimatedMinutes?: number;
}

export const PMS_SERVICE_CATEGORIES: PmsServiceCategory[] = [
  { id: 'pms', label: 'Preventive maintenance', icon: 'car-wrench' },
  { id: 'tires', label: 'Tires & wheels', icon: 'tire' },
  { id: 'fluids', label: 'Fluids & filters', icon: 'oil' },
  { id: 'inspection', label: 'Inspection & diagnostics', icon: 'clipboard-check-outline' },
  { id: 'other', label: 'Other services', icon: 'dots-horizontal' },
];

/** Catalog aligned with typical dealership PMS offerings */
export const PMS_SERVICES: PmsServiceOption[] = [
  {
    id: 'oil-change',
    name: 'Oil change',
    description: 'Engine oil & filter replacement',
    icon: 'oil',
    categoryId: 'fluids',
    estimatedMinutes: 45,
  },
  {
    id: 'tire-change',
    name: 'Tire change',
    description: 'Mount & balance new tires',
    icon: 'tire',
    categoryId: 'tires',
    estimatedMinutes: 60,
  },
  {
    id: 'tire-rotation',
    name: 'Tire rotation',
    description: 'Extend tire life & even wear',
    icon: 'rotate-3d-variant',
    categoryId: 'tires',
    estimatedMinutes: 30,
  },
  {
    id: 'wheel-alignment',
    name: 'Wheel alignment',
    description: 'Steering & suspension alignment',
    icon: 'steering',
    categoryId: 'tires',
    estimatedMinutes: 60,
  },
  {
    id: 'brake-service',
    name: 'Brake service',
    description: 'Pads, rotors & fluid check',
    icon: 'car-brake-abs',
    categoryId: 'pms',
    estimatedMinutes: 90,
  },
  {
    id: 'battery-service',
    name: 'Battery check & replacement',
    description: 'Test, charge or replace battery',
    icon: 'car-battery',
    categoryId: 'pms',
    estimatedMinutes: 30,
  },
  {
    id: 'ac-service',
    name: 'A/C service',
    description: 'Cooling performance & leak check',
    icon: 'air-conditioner',
    categoryId: 'pms',
    estimatedMinutes: 60,
  },
  {
    id: 'air-filter',
    name: 'Air filter replacement',
    description: 'Engine & cabin air filters',
    icon: 'air-filter',
    categoryId: 'fluids',
    estimatedMinutes: 25,
  },
  {
    id: 'fluid-flush',
    name: 'Fluid flush',
    description: 'Coolant, brake or transmission fluid',
    icon: 'water-sync',
    categoryId: 'fluids',
    estimatedMinutes: 75,
  },
  {
    id: 'pms-10k',
    name: 'PMS — 10,000 km',
    description: 'Scheduled maintenance package',
    icon: 'speedometer',
    categoryId: 'pms',
    estimatedMinutes: 120,
  },
  {
    id: 'pms-20k',
    name: 'PMS — 20,000 km',
    description: 'Mid-interval service package',
    icon: 'speedometer-medium',
    categoryId: 'pms',
    estimatedMinutes: 150,
  },
  {
    id: 'pms-30k',
    name: 'PMS — 30,000 km',
    description: 'Major interval service package',
    icon: 'speedometer-slow',
    categoryId: 'pms',
    estimatedMinutes: 180,
  },
  {
    id: 'engine-tuneup',
    name: 'Engine tune-up',
    description: 'Spark plugs, belts & performance check',
    icon: 'engine',
    categoryId: 'pms',
    estimatedMinutes: 120,
  },
  {
    id: 'full-inspection',
    name: 'Full vehicle inspection',
    description: 'Comprehensive safety & condition report',
    icon: 'clipboard-check-outline',
    categoryId: 'inspection',
    estimatedMinutes: 60,
  },
  {
    id: 'diagnostics',
    name: 'Computer diagnostics',
    description: 'Scan for warning lights & fault codes',
    icon: 'car-connected',
    categoryId: 'inspection',
    estimatedMinutes: 45,
  },
  {
    id: 'detailing',
    name: 'Detailing & wash',
    description: 'Interior / exterior cleaning packages',
    icon: 'spray-bottle',
    categoryId: 'other',
    estimatedMinutes: 90,
  },
  {
    id: 'financing-consult',
    name: 'Financing consultation',
    description: 'Payment plans & loan options',
    icon: 'calculator-variant',
    categoryId: 'other',
    estimatedMinutes: 30,
  },
  {
    id: 'trade-in-valuation',
    name: 'Trade-in valuation',
    description: 'Fair market estimate for your vehicle',
    icon: 'swap-horizontal',
    categoryId: 'other',
    estimatedMinutes: 45,
  },
];

export const INTENT_DEFAULT_SERVICE: Record<string, string> = {
  service: 'oil-change',
  financing: 'financing-consult',
  'trade-in': 'trade-in-valuation',
};

export function getPmsServiceById(id: string): PmsServiceOption | undefined {
  return PMS_SERVICES.find((s) => s.id === id);
}

export function getPmsCategoryLabel(categoryId: PmsServiceCategoryId): string {
  return PMS_SERVICE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? 'Service';
}
