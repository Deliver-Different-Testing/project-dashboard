import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CarrierAccountsTab } from './components/CarrierAccountsTab';
import { ServiceMappingsTab } from './components/ServiceMappingsTab';
import { FedExSetupTab } from './components/FedExSetupTab';
import { FuelSurchargesTab } from './components/FuelSurchargesTab';
import { ZoneMappingsTab } from './components/ZoneMappingsTab';
import { ContractTiersTab } from './components/ContractTiersTab';
import type { CarrierType } from './types';

interface Integration {
  id: CarrierType;
  name: string;
  description: string;
  status: 'connected' | 'warning' | 'disconnected';
  accountCount: number;
  activeMappings: number;
  logo: React.ReactNode;
}

const integrations: Integration[] = [
  {
    id: 'fedex',
    name: 'FedEx',
    description: 'Ground, Express, and Freight services',
    status: 'connected',
    accountCount: 2,
    activeMappings: 3,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
        <span className="text-purple-700 font-bold text-lg">FX</span>
      </div>
    ),
  },
  {
    id: 'ups',
    name: 'UPS',
    description: 'Ground, Next Day Air, and more',
    status: 'connected',
    accountCount: 1,
    activeMappings: 1,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
        <span className="text-amber-700 font-bold text-lg">UPS</span>
      </div>
    ),
  },
  {
    id: 'usps',
    name: 'USPS',
    description: 'Priority Mail, First Class, Parcel Select',
    status: 'disconnected',
    accountCount: 0,
    activeMappings: 0,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
        <span className="text-blue-700 font-bold text-lg">US</span>
      </div>
    ),
  },
  {
    id: 'dhl',
    name: 'DHL',
    description: 'International Express shipping',
    status: 'warning',
    accountCount: 0,
    activeMappings: 0,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
        <span className="text-red-700 font-bold text-lg">DHL</span>
      </div>
    ),
  },
];

// Calculate totals for dashboard
const totalAccounts = integrations.reduce((sum, i) => sum + i.accountCount, 0);
const activeAccounts = integrations.filter(i => i.status === 'connected').reduce((sum, i) => sum + i.accountCount, 0);
const totalMappings = integrations.reduce((sum, i) => sum + i.activeMappings, 0);
const connectedCarriers = integrations.filter(i => i.status === 'connected').length;

const getStatusBadge = (status: Integration['status']) => {
  switch (status) {
    case 'connected':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs text-green-700">Connected</span>
        </div>
      );
    case 'warning':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-xs text-amber-700">Setup Required</span>
        </div>
      );
    case 'disconnected':
      return (
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-400" />
          <span className="text-xs text-gray-600">Not Connected</span>
        </div>
      );
  }
};

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  return (
    <div className={`p-5 rounded-xl border border-border bg-white relative overflow-hidden`}>
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full ${color} opacity-10`} />
      <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-0.5">{value}</div>
      <div className="text-sm text-text-secondary">{title}</div>
      <div className="text-xs text-text-muted mt-1">{subtitle}</div>
    </div>
  );
}

export function IntegrationsHubPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<CarrierType | null>(null);
  const [activeTab, setActiveTab] = useState('accounts');

  const tabs = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'service-mappings', label: 'Service Mappings' },
    { id: 'fuel-surcharges', label: 'Fuel Surcharges' },
    { id: 'zone-mappings', label: 'Zone Mappings' },
    { id: 'contract-tiers', label: 'Contract Tiers' },
    { id: 'setup', label: 'Setup Wizard' },
  ];

  // If an integration is selected, show its detail view
  if (selectedIntegration) {
    const integration = integrations.find(i => i.id === selectedIntegration);

    return (
      <div className="min-h-screen bg-surface-light">
        {/* Header with back button */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setSelectedIntegration(null)}
              className="p-2 -ml-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              {integration?.logo}
              <div>
                <h1 className="text-2xl font-semibold text-text-primary">
                  {integration?.name} Integration
                </h1>
                <p className="text-text-secondary">{integration?.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Content */}
        <div className="px-6 pb-6">
          <Card padding="none">
            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="p-4">
              {activeTab === 'accounts' && <CarrierAccountsTab carrier={selectedIntegration} />}
              {activeTab === 'service-mappings' && <ServiceMappingsTab carrier={selectedIntegration} />}
              {activeTab === 'fuel-surcharges' && <FuelSurchargesTab carrier={selectedIntegration} />}
              {activeTab === 'zone-mappings' && <ZoneMappingsTab carrier={selectedIntegration} />}
              {activeTab === 'contract-tiers' && <ContractTiersTab carrier={selectedIntegration} />}
              {activeTab === 'setup' && <FedExSetupTab carrier={selectedIntegration} />}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Dashboard overview
  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Integrations Hub"
          subtitle="Monitor and manage your carrier integrations"
          actions={
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Integration
            </Button>
          }
        />
      </div>

      {/* Stats Cards */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Carrier Accounts"
            value={totalAccounts}
            subtitle={`${activeAccounts} active`}
            color="bg-brand-cyan"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
          />
          <StatCard
            title="Service Mappings"
            value={totalMappings}
            subtitle={`${totalMappings} active`}
            color="bg-secondary-purple"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />
          <StatCard
            title="Fuel Surcharges"
            value={5}
            subtitle="Currently active"
            color="bg-purple-500"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 22V12h4v10H3z" />
                <path d="M10 22V8h4v14h-4z" />
                <path d="M17 22V4h4v18h-4z" />
              </svg>
            }
          />
          <StatCard
            title="Connected Carriers"
            value={`${connectedCarriers}/${integrations.length}`}
            subtitle="FedEx, UPS active"
            color="bg-orange-500"
            icon={
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" />
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                <circle cx="5.5" cy="18.5" r="2.5" />
                <circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Carrier Status & Getting Started */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Carrier Status */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Carrier Status</h3>
            <div className="space-y-3">
              {integrations.map((integration) => (
                <button
                  key={integration.id}
                  onClick={() => {
                    setSelectedIntegration(integration.id);
                    setActiveTab('accounts');
                  }}
                  className="w-full p-3 rounded-lg border border-border bg-gray-50 hover:bg-gray-100 hover:border-brand-cyan/30 transition-all flex items-center gap-3 text-left"
                >
                  {integration.logo}
                  <div className="flex-1">
                    <div className="font-medium text-text-primary">{integration.name}</div>
                    <div className="text-xs text-text-muted">
                      {integration.accountCount} account{integration.accountCount !== 1 ? 's' : ''} configured
                    </div>
                  </div>
                  {getStatusBadge(integration.status)}
                </button>
              ))}
            </div>
          </Card>

          {/* Getting Started */}
          <Card>
            <h3 className="text-lg font-semibold text-text-primary mb-4">Getting Started</h3>
            <div className="space-y-3">
              {[
                { title: 'Set up FedEx', description: 'Configure FedEx API credentials', progress: 60, carrier: 'fedex' as CarrierType },
                { title: 'Set up UPS', description: 'Configure UPS API credentials', progress: 25, carrier: 'ups' as CarrierType },
                { title: 'Configure Service Mappings', description: 'Link job types to carrier services', progress: 100, carrier: null },
                { title: 'Configure Fuel Surcharges', description: 'Set up fuel surcharge rates', progress: 100, carrier: null },
              ].map((item) => (
                <button
                  key={item.title}
                  onClick={() => {
                    if (item.carrier) {
                      setSelectedIntegration(item.carrier);
                      setActiveTab('setup');
                    }
                  }}
                  className="w-full p-3 rounded-lg border border-border bg-gray-50 hover:bg-gray-100 transition-all text-left"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-text-primary">{item.title}</span>
                    <Badge className={item.progress === 100 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {item.progress === 100 ? 'Complete' : 'In Progress'}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-muted mb-2">{item.description}</p>
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${item.progress === 100 ? 'bg-green-500' : 'bg-brand-cyan'}`}
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Carrier Grid */}
      <div className="px-6 pb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Carrier Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => {
                setSelectedIntegration(integration.id);
                setActiveTab('accounts');
              }}
              className="text-left p-5 rounded-xl border border-border bg-white hover:border-brand-cyan/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3 mb-3">
                {integration.logo}
                <div className="flex-1">
                  <h4 className="font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                    {integration.name}
                  </h4>
                  {getStatusBadge(integration.status)}
                </div>
              </div>
              <p className="text-sm text-text-secondary mb-3">{integration.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {integration.accountCount} account{integration.accountCount !== 1 ? 's' : ''}
                </span>
                <span className="text-brand-cyan font-medium group-hover:underline">
                  Configure →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IntegrationsHubPage;
