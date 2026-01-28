import type { CarrierAccount, ServiceMapping, FedExSetupStep } from '../types';

export const sampleCarrierAccounts: CarrierAccount[] = [
  // FedEx - Primary (tenant default)
  {
    id: '1',
    carrier: 'fedex',
    accountNumber: '123456789',
    accountName: 'Primary FedEx Account',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-15T10:30:00Z',
    createdAt: '2023-06-01T00:00:00Z',
    clientId: null, // Primary account
  },
  // FedEx - Secondary (client-specific)
  {
    id: '1a',
    carrier: 'fedex',
    accountNumber: '555123456',
    accountName: 'Acme Corp FedEx',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-15T09:00:00Z',
    createdAt: '2023-09-15T00:00:00Z',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
  },
  {
    id: '1b',
    carrier: 'fedex',
    accountNumber: '555789012',
    accountName: 'Beta Industries FedEx',
    isActive: true,
    authType: 'oauth',
    lastSync: '2024-01-14T14:20:00Z',
    createdAt: '2023-11-01T00:00:00Z',
    clientId: 'client-002',
    clientName: 'Beta Industries',
  },
  // UPS - Primary (tenant default)
  {
    id: '2',
    carrier: 'ups',
    accountNumber: '987654321',
    accountName: 'UPS Business Account',
    isActive: true,
    authType: 'api_key',
    lastSync: '2024-01-14T15:45:00Z',
    createdAt: '2023-08-15T00:00:00Z',
    clientId: null, // Primary account
  },
  // UPS - Secondary (client-specific)
  {
    id: '2a',
    carrier: 'ups',
    accountNumber: '111222333',
    accountName: 'Acme Corp UPS',
    isActive: false,
    authType: 'api_key',
    lastSync: '2024-01-10T11:00:00Z',
    createdAt: '2023-10-20T00:00:00Z',
    clientId: 'client-001',
    clientName: 'Acme Corporation',
  },
  // USPS - Primary only
  {
    id: '3',
    carrier: 'usps',
    accountNumber: 'USPS-001',
    accountName: 'USPS Commercial',
    isActive: false,
    authType: 'credentials',
    createdAt: '2023-10-01T00:00:00Z',
    clientId: null, // Primary account
  },
];

export const sampleServiceMappings: ServiceMapping[] = [
  {
    id: '1',
    jobType: 'Standard Delivery',
    carrierService: 'FedEx Ground',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '2',
    jobType: 'Express Delivery',
    carrierService: 'FedEx Express Saver',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '3',
    jobType: 'Overnight',
    carrierService: 'FedEx Priority Overnight',
    carrier: 'fedex',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '4',
    jobType: 'Standard Delivery',
    carrierService: 'UPS Ground',
    carrier: 'ups',
    dimensionalFactor: 139,
    isActive: true,
  },
  {
    id: '5',
    jobType: 'Economy',
    carrierService: 'USPS Priority Mail',
    carrier: 'usps',
    dimensionalFactor: 166,
    isActive: false,
  },
];

export const fedExSetupSteps: FedExSetupStep[] = [
  {
    id: '1',
    title: 'Create FedEx Developer Account',
    description: 'Register for a FedEx Developer Portal account to get API access',
    status: 'completed',
  },
  {
    id: '2',
    title: 'Configure OAuth Credentials',
    description: 'Set up Client ID and Client Secret for API authentication',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Add Shipping Account',
    description: 'Link your FedEx shipping account number',
    status: 'in_progress',
  },
  {
    id: '4',
    title: 'Test Connection',
    description: 'Verify API connectivity with a test request',
    status: 'pending',
  },
  {
    id: '5',
    title: 'Enable Production Mode',
    description: 'Switch from sandbox to production environment',
    status: 'pending',
  },
];
