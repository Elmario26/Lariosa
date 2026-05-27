export type AppointmentKind = 'test_drive' | 'service';

export interface AppointmentDetailRow {
  icon: string;
  label: string;
  value: string;
}

/** Normalized appointment payload for shared detail UI */
export interface AppointmentDetailData {
  kind: AppointmentKind;
  id: string;
  title: string;
  subtitle: string;
  typeLabel: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  status: string;
  statusKey: string;
  date: string;
  time: string;
  rows: AppointmentDetailRow[];
  notes?: string | null;
  staffRemarks?: string | null;
  staffRemarksAt?: string | null;
  footerMessage?: string;
  canEdit: boolean;
  canDelete: boolean;
}
