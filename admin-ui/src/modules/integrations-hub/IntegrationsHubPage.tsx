import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { CarrierAccountsTab } from './components/CarrierAccountsTab';
import { ServiceMappingsTab } from './components/ServiceMappingsTab';
import { FedExSetupTab } from './components/FedExSetupTab';

export function IntegrationsHubPage() {
  const [activeTab, setActiveTab] = useState('carrier-accounts');

  const tabs = [
    { id: 'carrier-accounts', label: 'Carrier Accounts' },
    { id: 'service-mappings', label: 'Service Mappings' },
    { id: 'fedex-setup', label: 'FedEx Setup' },
  ];

  const getAddButtonLabel = () => {
    switch (activeTab) {
      case 'carrier-accounts':
        return 'Add Carrier';
      case 'service-mappings':
        return 'Add Mapping';
      default:
        return null;
    }
  };

  const addButtonLabel = getAddButtonLabel();

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-3">
        <PageHeader
          title="Integrations Hub"
          subtitle="Manage carrier integrations, service mappings, and API configurations"
          actions={
            addButtonLabel ? (
              <Button variant="primary">{addButtonLabel}</Button>
            ) : undefined
          }
        />
      </div>

      {/* Main Content Card */}
      <div className="px-6 pb-6">
        <Card padding="none">
          {/* Tabs */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab Content */}
          <div className="p-4">
            {activeTab === 'carrier-accounts' && <CarrierAccountsTab />}
            {activeTab === 'service-mappings' && <ServiceMappingsTab />}
            {activeTab === 'fedex-setup' && <FedExSetupTab />}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default IntegrationsHubPage;
