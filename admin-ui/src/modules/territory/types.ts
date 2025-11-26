// Territory Module Types

export interface ZipZone {
  id: string;
  zip: string;
  zoneNumber: string;
  zoneName: string;
  region: string;
  depot: string;
  service: string;
  vehicle: string;
  customer: string;
  rateCard: string;
  status: 'Active' | 'Inactive';
  tags?: string[];
}

export interface ZoneGroup {
  id: string;
  name: string;
  region: string;
  status: 'active' | 'inactive';
  zipCount: number;
  zips: string[]; // Array of zip zone IDs
  filters?: Record<string, string[]>;
}

export interface DropOffLocation {
  id: string;
  name: string;
  address: string;
  hours?: string;
  contact?: string;
}

export interface Depot {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  status: 'active' | 'inactive';
  zoneGroups: string[]; // Array of zone group IDs
  dropOffLocations: DropOffLocation[];
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: string[];
  type?: 'select' | 'text' | 'multiselect';
}

export const TERRITORY_TAGS = {
  Region: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Middle East', 'Africa'],
  Depot: ['NYC Central', 'Brooklyn Hub', 'JFK Facility', 'Newark Gateway', 'Hoboken Depot', 'Queens Hub'],
  Country: ['United States', 'Canada', 'Mexico', 'United Kingdom', 'Germany', 'France', 'Japan', 'Australia'],
  Customer: ['1976 Limited', 'Acme Corp', 'Global Logistics', 'Metro Traders', 'Prime Distribution', 'Swift Transport'],
  Service: ['Standard', 'Express', 'Overnight', 'Same Day', 'Scheduled', 'On-Demand'],
  Vehicle: ['Van', 'Truck', 'Semi', 'Cargo Bike', 'Motorcycle', 'Walking Courier'],
  Notification: ['Email Alerts', 'SMS Updates', 'Push Notifications', 'Webhook Events'],
  'Rate Card': ['Standard Rates', 'Premium Rates', 'Corporate Rates', 'Volume Discounts', 'Off-Peak Rates'],
  Airport: ['JFK', 'LaGuardia', 'Newark', 'Teterboro', 'White Plains'],
  Linehaul: ['NYC-BOS', 'NYC-PHL', 'NYC-DC', 'NYC-BUF', 'NYC-PIT'],
};
