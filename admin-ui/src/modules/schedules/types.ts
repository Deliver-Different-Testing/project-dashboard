// src/modules/schedules/types.ts
// Schedules Module Types - Complete type definitions for the schedule configuration system

import type { EntityConnections } from '../territory/types';
import { createEmptyConnections } from '../territory/types';

export type { EntityConnections };
export { createEmptyConnections };

// ============================================
// ENUMS & CONSTANTS
// ============================================

export type BookingMode = 'fixed_time' | 'window';

export type LegType = 'collection' | 'depot' | 'linehaul' | 'delivery';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type TemperatureState = 'ambient' | 'chilled' | 'frozen';

export type TimeUnit = 'minutes' | 'hours' | 'days';

export const DAYS_OF_WEEK: { value: DayOfWeek; label: string; short: string }[] = [
  { value: 'mon', label: 'Monday', short: 'Mon' },
  { value: 'tue', label: 'Tuesday', short: 'Tue' },
  { value: 'wed', label: 'Wednesday', short: 'Wed' },
  { value: 'thu', label: 'Thursday', short: 'Thu' },
  { value: 'fri', label: 'Friday', short: 'Fri' },
  { value: 'sat', label: 'Saturday', short: 'Sat' },
  { value: 'sun', label: 'Sunday', short: 'Sun' },
];

export const TEMPERATURE_STATES: { value: TemperatureState; label: string }[] = [
  { value: 'ambient', label: 'Ambient' },
  { value: 'chilled', label: 'Chilled' },
  { value: 'frozen', label: 'Frozen' },
];

export const BOOKING_MODES: { value: BookingMode; label: string; description: string }[] = [
  { value: 'fixed_time', label: 'Fixed Time', description: 'Delivery at specific scheduled time' },
  { value: 'window', label: 'Window', description: 'Delivery within a time range' },
];

// ============================================
// REFERENCE TYPES (from other modules)
// ============================================

export interface DepotReference {
  id: string;
  name: string;
  code?: string;
}

export interface DropoffLocation {
  id: string;
  depotId: string;
  name: string;
  qrCode?: string;
}

export interface ZoneReference {
  id: string;
  name: string;
  code?: string;
  postcodeCount?: number;
}

export interface SpeedReference {
  id: string;
  name: string;
  code: string;
}

export interface LinehaulRunReference {
  id: string;
  name: string;
  originDepotId: string;
  destinationDepotId: string;
  departureTime: string; // HH:MM
  transitDuration: number;
  transitUnit: TimeUnit;
  activeDays: DayOfWeek[];
}

export interface RateCardReference {
  id: string;
  name: string;
}

export interface ClientReference {
  id: string;
  name: string;
  shortName?: string;
}

// ============================================
// LEG CONFIGURATION TYPES
// ============================================

export interface CollectionLegConfig {
  type: 'collection';
  speedId?: string;
  pickupZoneIds: string[];
  pickupMinutesBefore: number; // Minutes before linehaul/delivery
  bookFromClientAddress: boolean;
  createPickupJob: boolean;
}

export interface DepotLegConfig {
  type: 'depot';
  depotId: string;
  dropoffLocationId?: string;
  storageState?: TemperatureState;
}

export interface LinehaulLegConfig {
  type: 'linehaul';
  runId?: string; // Reference to predefined linehaul run
  speedId?: string;
  dayOffset: number; // Days before delivery
  activeDays: DayOfWeek[];
  transitMinutes: number; // For tracking progress display
  insertToBulk: boolean; // Route builder vs live dispatch
  rateCardId?: string;
}

export interface DeliveryLegConfig {
  type: 'delivery';
  speedId?: string;
  deliveryZoneIds: string[];
  deliveryState?: TemperatureState;
  rateCardId?: string;
}

export type LegConfig = CollectionLegConfig | DepotLegConfig | LinehaulLegConfig | DeliveryLegConfig;

// ============================================
// SCHEDULE LEG (Node in the chain)
// ============================================

export interface ScheduleLeg {
  id: string;
  order: number;
  config: LegConfig;
}

// ============================================
// OPERATING SCHEDULE (Days/Times)
// ============================================

export interface DaySchedule {
  enabled: boolean;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
}

export interface OperatingSchedule {
  // If true, all weekdays use the same schedule
  uniformWeekdays: boolean;
  // Per-day configuration
  days: Record<DayOfWeek, DaySchedule>;
  // Cutoff configuration
  cutoffValue: number;
  cutoffUnit: TimeUnit;
}

// ============================================
// DELIVERY WINDOW RULES
// ============================================

export type DeliveryWindowMode = 'automatic' | 'fixed';

export interface DeliveryWindowRule {
  id: string;
  condition: {
    arrivalBefore: string; // HH:MM - "If final depot arrival is before X"
  };
  result: {
    deliverSameDay: boolean; // true = same day, false = next business day
    windowStart: string; // HH:MM
    windowEnd: string; // HH:MM
  };
}

export interface DeliveryWindowConfig {
  mode: DeliveryWindowMode;
  // For 'automatic' mode
  rules: DeliveryWindowRule[];
  // For 'fixed' mode
  fixedDays: DayOfWeek[];
  fixedWindowStart: string;
  fixedWindowEnd: string;
  fixedTransitDays: number;
}

// ============================================
// MAIN SCHEDULE INTERFACE
// ============================================

export interface Schedule {
  id: string;
  name: string;
  description?: string;

  // Client visibility
  clientVisibility: 'all' | 'specific';
  clientIds: string[]; // Only used if clientVisibility === 'specific'

  // Booking mode
  bookingMode: BookingMode;

  // Speed defaults
  defaultDeliverySpeedId?: string;
  defaultPickupSpeedId?: string;
  defaultLinehaulSpeedId?: string;

  // Origin configuration
  originType: 'depot' | 'client_address';
  originDepotId?: string; // Used if originType === 'depot'
  fallbackDepotId?: string; // Optional fallback if originType === 'client_address'

  // The leg chain
  legs: ScheduleLeg[];

  // Operating schedule
  operatingSchedule: OperatingSchedule;

  // Delivery window configuration
  deliveryWindow: DeliveryWindowConfig;

  // Status
  isActive: boolean;

  // Override info (for client-specific schedules)
  isOverride: boolean;
  baseScheduleId?: string; // Parent schedule if this is an override
  overriddenFields: string[]; // Which fields differ from base

  // Connections (for tag system)
  connections: EntityConnections;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// ============================================
// SCHEDULE GROUP (Optional feature)
// ============================================

export interface ScheduleGroup {
  id: string;
  name: string;
  description?: string;
  scheduleIds: string[];
  isActive: boolean;
  connections: EntityConnections;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FILTER STATE
// ============================================

export interface ScheduleFilterState {
  search: string;
  status: 'all' | 'active' | 'inactive';
  type: 'all' | 'base' | 'override';
  clientId: string | 'all';
  originDepotId: string | 'all';
  destinationDepotId: string | 'all';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getBookingModeLabel(mode: BookingMode): string {
  const found = BOOKING_MODES.find(m => m.value === mode);
  return found?.label ?? mode;
}

export function getDayLabel(day: DayOfWeek, short = false): string {
  const found = DAYS_OF_WEEK.find(d => d.value === day);
  return short ? (found?.short ?? day) : (found?.label ?? day);
}

export function getTemperatureLabel(state?: TemperatureState): string {
  if (!state) return '—';
  const found = TEMPERATURE_STATES.find(t => t.value === state);
  return found?.label ?? state;
}

export function getLegTypeLabel(type: LegType): string {
  const labels: Record<LegType, string> = {
    collection: 'Collection',
    depot: 'Depot Stop',
    linehaul: 'Linehaul',
    delivery: 'Delivery',
  };
  return labels[type] ?? type;
}

export function countLegs(schedule: Schedule): number {
  return schedule.legs.length;
}

export function getRouteDescription(schedule: Schedule, depots: DepotReference[]): string {
  const parts: string[] = [];

  if (schedule.originType === 'client_address') {
    parts.push('Client');
  } else if (schedule.originDepotId) {
    const depot = depots.find(d => d.id === schedule.originDepotId);
    parts.push(depot?.code ?? depot?.name ?? 'Depot');
  }

  // Add intermediate depots from legs
  schedule.legs.forEach(leg => {
    if (leg.config.type === 'depot') {
      const depotConfig = leg.config as DepotLegConfig;
      const depot = depots.find(d => d.id === depotConfig.depotId);
      if (depot) {
        parts.push(depot.code ?? depot.name);
      }
    }
  });

  // Always ends at client for delivery
  parts.push('Client');

  return parts.join(' → ');
}

export function getActiveDaysSummary(schedule: OperatingSchedule): string {
  const activeDays = DAYS_OF_WEEK.filter(d => schedule.days[d.value].enabled);

  if (activeDays.length === 7) return 'Every day';
  if (activeDays.length === 0) return 'No days';

  // Check for Mon-Fri
  const weekdays = ['mon', 'tue', 'wed', 'thu', 'fri'] as DayOfWeek[];
  const weekend = ['sat', 'sun'] as DayOfWeek[];

  const hasAllWeekdays = weekdays.every(d => schedule.days[d].enabled);
  const hasNoWeekend = weekend.every(d => !schedule.days[d].enabled);

  if (hasAllWeekdays && hasNoWeekend) return 'Mon–Fri';

  // Otherwise list short names
  return activeDays.map(d => d.short).join(', ');
}

export function createDefaultOperatingSchedule(): OperatingSchedule {
  const defaultDay: DaySchedule = {
    enabled: true,
    startTime: '09:00',
    endTime: '17:00',
  };

  const weekendDay: DaySchedule = {
    enabled: false,
    startTime: '09:00',
    endTime: '17:00',
  };

  return {
    uniformWeekdays: true,
    days: {
      mon: { ...defaultDay },
      tue: { ...defaultDay },
      wed: { ...defaultDay },
      thu: { ...defaultDay },
      fri: { ...defaultDay },
      sat: { ...weekendDay },
      sun: { ...weekendDay },
    },
    cutoffValue: 60,
    cutoffUnit: 'minutes',
  };
}

export function createDefaultDeliveryWindow(): DeliveryWindowConfig {
  return {
    mode: 'automatic',
    rules: [
      {
        id: 'rule-1',
        condition: { arrivalBefore: '10:00' },
        result: { deliverSameDay: true, windowStart: '12:00', windowEnd: '17:00' },
      },
      {
        id: 'rule-2',
        condition: { arrivalBefore: '23:59' },
        result: { deliverSameDay: false, windowStart: '08:00', windowEnd: '12:00' },
      },
    ],
    fixedDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    fixedWindowStart: '08:00',
    fixedWindowEnd: '17:00',
    fixedTransitDays: 1,
  };
}

export function createEmptySchedule(): Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    clientVisibility: 'all',
    clientIds: [],
    bookingMode: 'window',
    defaultDeliverySpeedId: undefined,
    defaultPickupSpeedId: undefined,
    defaultLinehaulSpeedId: undefined,
    originType: 'depot',
    originDepotId: undefined,
    fallbackDepotId: undefined,
    legs: [
      {
        id: 'leg-delivery-1',
        order: 0,
        config: {
          type: 'delivery',
          deliveryZoneIds: [],
        },
      },
    ],
    operatingSchedule: createDefaultOperatingSchedule(),
    deliveryWindow: createDefaultDeliveryWindow(),
    isActive: true,
    isOverride: false,
    baseScheduleId: undefined,
    overriddenFields: [],
    connections: createEmptyConnections(),
  };
}

export function createEmptyScheduleGroup(): Omit<ScheduleGroup, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    name: '',
    description: '',
    scheduleIds: [],
    isActive: true,
    connections: createEmptyConnections(),
  };
}

// ============================================
// OVERRIDE SYSTEM HELPERS
// ============================================

export const OVERRIDABLE_FIELDS: { field: string; label: string }[] = [
  { field: 'operatingSchedule.cutoffValue', label: 'Booking Cutoff' },
  { field: 'operatingSchedule.days', label: 'Operating Days' },
  { field: 'legs[0].config.pickupMinutesBefore', label: 'Pickup Time Offset' },
  { field: 'defaultDeliverySpeedId', label: 'Delivery Speed' },
  { field: 'defaultPickupSpeedId', label: 'Pickup Speed' },
];

export const NON_OVERRIDABLE_FIELDS = [
  'legs', // Route structure
  'originType',
  'originDepotId',
  'deliveryWindow.mode', // Delivery rules are route-level
];

export function isFieldOverridable(field: string): boolean {
  return !NON_OVERRIDABLE_FIELDS.some(nof => field.startsWith(nof));
}
