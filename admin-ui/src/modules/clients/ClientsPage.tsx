import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/filters/SearchInput';
import { TagSidebar } from '../../components/tags';
import { ConnectionBadge } from '../../components/tags/ConnectionBadge';
import { GeneralTab } from './components/GeneralTab';
import { ServicesTab } from './components/ServicesTab';
import { ScheduleTab } from './components/ScheduleTab';
import { ContactsTab } from './components/ContactsTab';
import { RatesTab } from './components/RatesTab';
import { HistoryTab } from './components/HistoryTab';
import {
  sampleClients,
  sampleContacts,
  sampleServices,
  sampleSchedules,
  sampleRates,
  sampleHistory,
  sampleClientConnections,
} from './data/sampleData';
import type { Client, SourceItem, EntityConnections } from './types';
import { createEmptyConnections, countConnectedCategories } from './types';

export function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(sampleClients[0]);
  const [activeTab, setActiveTab] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'customer',
    id: '',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(createEmptyConnections());

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'services', label: 'Services' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'contacts', label: 'Contacts' },
    { id: 'rates', label: 'Rates' },
    { id: 'history', label: 'History' },
  ];

  // Filter clients by search
  const filteredClients = sampleClients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get data for selected client
  const clientContacts = sampleContacts.filter(c => c.clientId === selectedClient?.id);
  const clientServices = sampleServices.filter(s => s.clientId === selectedClient?.id);
  const clientSchedules = sampleSchedules.filter(s => s.clientId === selectedClient?.id);
  const clientRates = sampleRates.filter(r => r.clientId === selectedClient?.id);
  const clientHistory = sampleHistory.filter(h => h.clientId === selectedClient?.id);
  const clientConnections = selectedClient
    ? sampleClientConnections[selectedClient.id] || createEmptyConnections()
    : createEmptyConnections();

  const handleConnectionsClick = () => {
    if (!selectedClient) return;
    setSidebarSourceItem({
      type: 'customer',
      id: selectedClient.id,
      name: selectedClient.name,
    });
    setSidebarConnections(clientConnections);
    setTagSidebarOpen(true);
  };

  const handleNavigate = (targetRoute: string, _searchQuery: string) => {
    console.log(`Navigate to ${targetRoute}`);
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="p-8 pb-0">
        <PageHeader
          title="Clients & Customers"
          subtitle="Manage client accounts, services, and billing"
          actions={
            <>
              <Button variant="secondary" onClick={() => setTagSidebarOpen(true)}>
                Tags
              </Button>
              <Button variant="primary">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Client
              </Button>
            </>
          }
        />
      </div>

      {/* Main Content - Split View */}
      <div className="p-8 grid grid-cols-12 gap-6">
        {/* Client List Sidebar */}
        <div className="col-span-3">
          <Card padding="none">
            <div className="p-4 border-b border-border">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search clients..."
              />
            </div>
            <div className="max-h-[calc(100vh-280px)] overflow-y-auto">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`p-4 border-b border-border cursor-pointer transition-colors ${
                    selectedClient?.id === client.id
                      ? 'bg-brand-cyan/10 border-l-4 border-l-brand-cyan'
                      : 'hover:bg-surface-light'
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-text-primary">{client.name}</span>
                    <Badge variant={client.status === 'active' ? 'green' : 'default'} size="sm">
                      {client.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span className="font-mono text-xs">{client.code}</span>
                    <span>•</span>
                    <span>{client.city}</span>
                  </div>
                </div>
              ))}
              {filteredClients.length === 0 && (
                <div className="p-8 text-center text-text-muted">
                  No clients found
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Client Details */}
        <div className="col-span-9">
          {selectedClient ? (
            <Card padding="none">
              {/* Client Header */}
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-lg bg-secondary-purple flex items-center justify-center text-white text-xl font-bold">
                      {selectedClient.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-text-primary">{selectedClient.name}</h2>
                        <Badge variant={selectedClient.status === 'active' ? 'green' : 'red'}>
                          {selectedClient.status}
                        </Badge>
                        <Badge variant={selectedClient.type === 'corporate' ? 'blue' : 'purple'}>
                          {selectedClient.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-text-secondary">
                        <span className="font-mono">{selectedClient.code}</span>
                        <span>•</span>
                        <span>{selectedClient.city}, {selectedClient.state}</span>
                        <span>•</span>
                        <span>{selectedClient.billingType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Connection Badge */}
                  <ConnectionBadge
                    connectionCount={countConnectedCategories(clientConnections)}
                    hasIssues={!clientConnections.airports.hasConnections && !clientConnections.linehauls.hasConnections}
                    onClick={handleConnectionsClick}
                  />
                </div>
              </div>

              {/* Tabs */}
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'general' && (
                  <GeneralTab client={selectedClient} />
                )}
                {activeTab === 'services' && (
                  <ServicesTab services={clientServices} />
                )}
                {activeTab === 'schedule' && (
                  <ScheduleTab schedules={clientSchedules} />
                )}
                {activeTab === 'contacts' && (
                  <ContactsTab contacts={clientContacts} />
                )}
                {activeTab === 'rates' && (
                  <RatesTab rates={clientRates} />
                )}
                {activeTab === 'history' && (
                  <HistoryTab history={clientHistory} />
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-16 text-text-secondary">
                <svg className="w-16 h-16 mx-auto mb-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <p className="text-lg font-medium">Select a client</p>
                <p className="text-sm mt-1">Choose a client from the list to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Tag Sidebar */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        sourceItem={sidebarSourceItem}
        connections={sidebarConnections}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default ClientsPage;
