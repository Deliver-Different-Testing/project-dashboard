export interface CarrierAccount {
  id: string;
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  authType: 'oauth' | 'api_key' | 'credentials';
  lastSync?: string;
  createdAt: string;
}

export interface ServiceMapping {
  id: string;
  jobType: string;
  carrierService: string;
  carrier: 'fedex' | 'ups' | 'usps' | 'dhl';
  dimensionalFactor: number;
  isActive: boolean;
}

export interface FedExSetupStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
}

export type CarrierType = 'fedex' | 'ups' | 'usps' | 'dhl';

export const CARRIER_LABELS: Record<CarrierType, string> = {
  fedex: 'FedEx',
  ups: 'UPS',
  usps: 'USPS',
  dhl: 'DHL',
};

export const CARRIER_COLORS: Record<CarrierType, string> = {
  fedex: 'bg-purple-100 text-purple-700',
  ups: 'bg-amber-100 text-amber-700',
  usps: 'bg-blue-100 text-blue-700',
  dhl: 'bg-red-100 text-red-700',
};
