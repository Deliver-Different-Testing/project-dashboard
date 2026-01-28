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
import type { CarrierType } from './types';

interface Integration {
  id: CarrierType;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'setup_required';
  accountCount: number;
  logo: React.ReactNode;
}

const integrations: Integration[] = [
  {
    id: 'fedex',
    name: 'FedEx',
    description: 'Ship with FedEx Ground, Express, and Freight services',
    status: 'active',
    accountCount: 2,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
        <span className="text-purple-700 font-bold text-lg">FX</span>
      </div>
    ),
  },
  {
    id: 'ups',
    name: 'UPS',
    description: 'Connect to UPS Ground, Next Day Air, and more',
    status: 'active',
    accountCount: 1,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
        <span className="text-amber-700 font-bold text-lg">UPS</span>
      </div>
    ),
  },
  {
    id: 'usps',
    name: 'USPS',
    description: 'Priority Mail, First Class, and Parcel Select',
    status: 'inactive',
    accountCount: 0,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
        <span className="text-blue-700 font-bold text-lg">US</span>
      </div>
    ),
  },
  {
    id: 'dhl',
    name: 'DHL',
    description: 'International shipping with DHL Express',
    status: 'setup_required',
    accountCount: 0,
    logo: (
      <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
        <span className="text-red-700 font-bold text-lg">DHL</span>
      </div>
    ),
  },
];

const getStatusBadge = (status: Integration['status']) => {
  switch (status) {
    case 'active':
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    case 'inactive':
      return <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>;
    case 'setup_required':
      return <Badge className="bg-amber-100 text-amber-700">Setup Required</Badge>;
  }
};

export function IntegrationsHubPage() {
  const [selectedIntegration, setSelectedIntegration] = useState<CarrierType | null>(null);
  const [activeTab, setActiveTab] = useState('accounts');

  const tabs = [
    { id: 'accounts', label: 'Accounts' },
    { id: 'service-mappings', label: 'Service Mappings' },
    { id: 'fuel-surcharges', label: 'Fuel Surcharges' },
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
              {activeTab === 'setup' && <FedExSetupTab carrier={selectedIntegration} />}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Main integrations overview
  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Integrations Hub"
          subtitle="Connect and manage your carrier integrations"
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

      {/* Integrations Grid */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((integration) => (
            <button
              key={integration.id}
              onClick={() => {
                setSelectedIntegration(integration.id);
                setActiveTab('accounts');
              }}
              className="text-left p-5 rounded-xl border border-border bg-white hover:border-brand-cyan/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                {integration.logo}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary group-hover:text-brand-cyan transition-colors">
                      {integration.name}
                    </h3>
                    {getStatusBadge(integration.status)}
                  </div>
                  <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                    {integration.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-text-muted">
                      {integration.accountCount} account{integration.accountCount !== 1 ? 's' : ''}
                    </span>
                    <span className="text-brand-cyan font-medium group-hover:underline">
                      Configure →
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}

          {/* Add New Integration Card */}
          <button
            className="p-5 rounded-xl border-2 border-dashed border-border hover:border-brand-cyan/50 bg-gray-50/50 hover:bg-brand-cyan/5 transition-all group flex items-center justify-center min-h-[140px]"
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 group-hover:bg-brand-cyan/20 flex items-center justify-center transition-colors">
                <svg className="w-6 h-6 text-text-muted group-hover:text-brand-cyan transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-muted group-hover:text-brand-cyan transition-colors">
                Add New Integration
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IntegrationsHubPage;
