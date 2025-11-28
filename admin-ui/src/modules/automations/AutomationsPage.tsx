import { useState, useMemo } from 'react';
import { Plus, Zap } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/filters/SearchInput';
import { FilterDropdown } from '../../components/filters/FilterDropdown';
import { AutomationCard } from './components/AutomationCard';
import type { AutomationRule, AutomationFilterState } from './types';
import { createEmptyAutomation } from './types';
import {
  sampleAutomations,
  sampleCustomers,
  sampleSpeeds,
  sampleJobStatuses,
  sampleTaskTemplates,
  sampleNotificationTemplates,
} from './data/sampleData';

export function AutomationsPage() {
  // State
  const [automations, setAutomations] = useState<AutomationRule[]>(sampleAutomations);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newAutomation, setNewAutomation] = useState<AutomationRule | null>(null);

  // Filter state
  const [filters, setFilters] = useState<AutomationFilterState>({
    customerId: 'all',
    speedId: 'all',
    search: '',
  });

  // Filter automations
  const filteredAutomations = useMemo(() => {
    return automations.filter((auto) => {
      // Customer filter
      if (filters.customerId !== 'all') {
        if (
          !auto.scope.allCustomers &&
          !auto.scope.customerIds.includes(filters.customerId)
        ) {
          return false;
        }
      }

      // Speed filter
      if (filters.speedId !== 'all') {
        if (!auto.scope.allSpeeds && !auto.scope.speedIds.includes(filters.speedId)) {
          return false;
        }
      }

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase();
        const matchesSearch =
          auto.name.toLowerCase().includes(query) ||
          auto.description?.toLowerCase().includes(query);
        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [automations, filters]);

  // Handle creating new automation
  const handleNewAutomation = () => {
    const empty = createEmptyAutomation();
    setNewAutomation({
      ...empty,
      id: `auto-new-${Date.now()}`,
      createdAt: '',
      updatedAt: '',
    });
    setIsCreating(true);
    setExpandedId(null);
  };

  // Handle save new automation
  const handleSaveNew = (automation: AutomationRule) => {
    setAutomations((prev) => [automation, ...prev]);
    setIsCreating(false);
    setNewAutomation(null);
  };

  // Handle cancel new automation
  const handleCancelNew = () => {
    setIsCreating(false);
    setNewAutomation(null);
  };

  // Handle update existing automation
  const handleUpdate = (automation: AutomationRule) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === automation.id ? automation : a))
    );
    setExpandedId(null);
  };

  // Handle delete automation
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      setAutomations((prev) => prev.filter((a) => a.id !== id));
    }
  };

  // Filter options
  const customerOptions = [
    'All Customers',
    ...sampleCustomers.map((c) => c.shortName),
  ];
  const speedOptions = ['All Speeds', ...sampleSpeeds.map((s) => s.name)];

  // Handle filter changes
  const handleCustomerChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Customers') {
      setFilters((prev) => ({ ...prev, customerId: 'all' }));
    } else {
      const customer = sampleCustomers.find((c) => c.shortName === value);
      setFilters((prev) => ({ ...prev, customerId: customer?.id || 'all' }));
    }
  };

  const handleSpeedChange = (values: string[]) => {
    const value = values[0];
    if (!value || value === 'All Speeds') {
      setFilters((prev) => ({ ...prev, speedId: 'all' }));
    } else {
      const speed = sampleSpeeds.find((s) => s.name === value);
      setFilters((prev) => ({ ...prev, speedId: speed?.id || 'all' }));
    }
  };

  const clearAllFilters = () => {
    setFilters({
      customerId: 'all',
      speedId: 'all',
      search: '',
    });
  };

  const hasActiveFilters =
    filters.customerId !== 'all' ||
    filters.speedId !== 'all' ||
    filters.search !== '';

  // Get selected filter values for display
  const getSelectedCustomer = (): string[] => {
    if (filters.customerId === 'all') return [];
    const customer = sampleCustomers.find((c) => c.id === filters.customerId);
    return customer ? [customer.shortName] : [];
  };

  const getSelectedSpeed = (): string[] => {
    if (filters.speedId === 'all') return [];
    const speed = sampleSpeeds.find((s) => s.id === filters.speedId);
    return speed ? [speed.name] : [];
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="bg-white border-b border-border px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-cyan/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-brand-cyan" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">Automations</h1>
              <p className="text-sm text-text-secondary">
                Create "if this then that" rules to automate workflows
              </p>
            </div>
          </div>
          <Button onClick={handleNewAutomation} disabled={isCreating}>
            <Plus className="w-4 h-4 mr-2" />
            New Automation
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6 space-y-4">
        {/* Filters */}
        <div className="space-y-3">
          <SearchInput
            value={filters.search}
            onChange={(value) => setFilters((prev) => ({ ...prev, search: value }))}
            placeholder="Search automations by name or description..."
          />

          <div className="flex items-center gap-2 flex-wrap">
            <FilterDropdown
              id="customer"
              label="Customer"
              options={customerOptions}
              selectedValues={getSelectedCustomer()}
              onChange={handleCustomerChange}
            />

            <FilterDropdown
              id="speed"
              label="Speed"
              options={speedOptions}
              selectedValues={getSelectedSpeed()}
              onChange={handleSpeedChange}
            />

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-text-muted hover:text-brand-cyan ml-2 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="text-sm text-text-secondary">
          Showing {filteredAutomations.length} of {automations.length} automations
        </div>

        {/* New Automation Card */}
        {isCreating && newAutomation && (
          <AutomationCard
            automation={newAutomation}
            customers={sampleCustomers}
            speeds={sampleSpeeds}
            jobStatuses={sampleJobStatuses}
            taskTemplates={sampleTaskTemplates}
            notificationTemplates={sampleNotificationTemplates}
            isExpanded={true}
            isNew={true}
            onToggle={() => {}}
            onSave={handleSaveNew}
            onDelete={handleCancelNew}
            onCancel={handleCancelNew}
          />
        )}

        {/* Automations List */}
        <div className="space-y-3">
          {filteredAutomations.map((automation) => (
            <AutomationCard
              key={automation.id}
              automation={automation}
              customers={sampleCustomers}
              speeds={sampleSpeeds}
              jobStatuses={sampleJobStatuses}
              taskTemplates={sampleTaskTemplates}
              notificationTemplates={sampleNotificationTemplates}
              isExpanded={expandedId === automation.id}
              onToggle={() =>
                setExpandedId(expandedId === automation.id ? null : automation.id)
              }
              onSave={handleUpdate}
              onDelete={() => handleDelete(automation.id)}
            />
          ))}

          {filteredAutomations.length === 0 && !isCreating && (
            <div className="text-center py-12 bg-white border-2 border-dashed border-border rounded-lg">
              <Zap className="w-12 h-12 mx-auto text-text-muted mb-3" />
              <p className="text-text-muted font-medium">No automations found</p>
              <p className="text-sm text-text-muted mt-1">
                {hasActiveFilters
                  ? 'Try adjusting your filters'
                  : 'Click "New Automation" to create your first rule'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
