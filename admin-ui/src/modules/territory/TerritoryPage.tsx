import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { Toggle } from '../../components/ui/Toggle';
import { Input } from '../../components/ui/Input';
import { DataTable } from '../../components/data/DataTable';
import { ExpandableRow } from '../../components/data/ExpandableRow';
import { FilterBar } from '../../components/filters/FilterBar';
import { FilterChips } from '../../components/filters/FilterChips';
import { SearchInput } from '../../components/filters/SearchInput';
import { TagSidebar } from '../../components/tags/TagSidebar';

// Sample data
const zipZonesData = [
  { id: '1', zoneNumber: 'Z-001', zoneName: 'Downtown Core', region: 'Central', depot: 'Main Depot', status: 'Active' },
  { id: '2', zoneNumber: 'Z-002', zoneName: 'North District', region: 'North', depot: 'North Hub', status: 'Active' },
  { id: '3', zoneNumber: 'Z-003', zoneName: 'East Side', region: 'East', depot: 'East Facility', status: 'Inactive' },
  { id: '4', zoneNumber: 'Z-004', zoneName: 'West End', region: 'West', depot: 'Main Depot', status: 'Active' },
  { id: '5', zoneNumber: 'Z-005', zoneName: 'South Valley', region: 'South', depot: 'South Center', status: 'Active' },
];

const zoneGroupsData = [
  { id: 'g1', name: 'Metro Group A', zones: 12, region: 'Central', status: 'active' as const },
  { id: 'g2', name: 'Suburban Group B', zones: 8, region: 'North', status: 'active' as const },
  { id: 'g3', name: 'Rural Group C', zones: 5, region: 'South', status: 'inactive' as const },
];

const depotsData = [
  { id: 'd1', name: 'Main Depot', address: '123 Industrial Pkwy', city: 'Springfield', state: 'IL', zip: '62701', status: 'active' as const },
  { id: 'd2', name: 'North Hub', address: '456 Commerce Dr', city: 'Northbrook', state: 'IL', zip: '60062', status: 'active' as const },
];

const sampleTags = {
  Region: ['Central', 'North', 'East', 'West', 'South'],
  Depot: ['Main Depot', 'North Hub', 'East Facility', 'South Center'],
  Service: ['Standard', 'Express', 'Overnight'],
  Vehicle: ['Van', 'Truck', 'Semi'],
  Customer: ['Retail', 'Commercial', 'Industrial'],
};

export function TerritoryPage() {
  const [activeTab, setActiveTab] = useState('zip-zones');
  const [expandedItem, setExpandedItem] = useState<string | null>('g1');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  const tabs = [
    { id: 'zip-zones', label: 'All Zip Zones' },
    { id: 'zone-groups', label: 'Zone Groups' },
    { id: 'depots', label: 'Depots/Locations' },
  ];

  const filters = [
    { id: 'region', label: 'Region', options: ['Central', 'North', 'East', 'West', 'South'] },
    { id: 'depot', label: 'Depot', options: ['Main Depot', 'North Hub', 'East Facility', 'South Center'] },
    { id: 'service', label: 'Service', options: ['Standard', 'Express', 'Overnight'] },
    { id: 'vehicle', label: 'Vehicle', options: ['Van', 'Truck', 'Semi'] },
  ];

  const columns = [
    { key: 'zoneNumber', label: 'Zone #' },
    { key: 'zoneName', label: 'Zone Name' },
    { key: 'region', label: 'Region' },
    { key: 'depot', label: 'Depot' },
    { key: 'status', label: 'Status' },
  ];

  const handleFilterChange = (filterId: string, values: string[]) => {
    setActiveFilters({ ...activeFilters, [filterId]: values });
  };

  const getFilterChips = () => {
    const chips: { category: string; value: string }[] = [];
    Object.entries(activeFilters).forEach(([category, values]) => {
      values.forEach((value) => {
        chips.push({ category, value });
      });
    });
    return chips;
  };

  const handleRemoveChip = (category: string, value: string) => {
    const newValues = activeFilters[category]?.filter((v) => v !== value) || [];
    setActiveFilters({ ...activeFilters, [category]: newValues });
  };

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="p-8 pb-0">
        <PageHeader
          title="Territory & Locations"
          subtitle="Manage zip zones, zone groups, and depot locations"
          actions={
            <>
              <Button variant="secondary" onClick={() => setTagSidebarOpen(true)}>
                Tags
              </Button>
              <Button variant="primary">Add New</Button>
            </>
          }
        />
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClear={() => setActiveFilters({})}
      />

      {/* Search */}
      <div className="px-8 py-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search zones, groups, or depots..."
        />
      </div>

      {/* Filter Chips */}
      {getFilterChips().length > 0 && (
        <div className="px-8 pb-4">
          <FilterChips
            chips={getFilterChips()}
            onRemove={handleRemoveChip}
            onClearAll={() => setActiveFilters({})}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="px-8 pb-8">
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-6">
            {/* Tab 1: Zip Zones Table */}
            {activeTab === 'zip-zones' && (
              <DataTable
                columns={columns}
                data={zipZonesData}
                selectable
                selectedIds={selectedZones}
                onSelectionChange={setSelectedZones}
                pagination={{ page: 1, pageSize: 20, total: 156 }}
                actions={() => (
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </div>
                )}
              />
            )}

            {/* Tab 2: Zone Groups */}
            {activeTab === 'zone-groups' && (
              <div className="space-y-2">
                {zoneGroupsData.map((group) => (
                  <ExpandableRow
                    key={group.id}
                    id={group.id}
                    name={group.name}
                    badge={{ text: group.status === 'active' ? 'Active' : 'Inactive', variant: group.status === 'active' ? 'customized' : 'system' }}
                    stats={[
                      { label: 'Zones', value: group.zones },
                      { label: 'Region', value: group.region },
                    ]}
                    tagCount={3}
                    isExpanded={expandedItem === group.id}
                    onToggle={() => setExpandedItem(expandedItem === group.id ? null : group.id)}
                    onTagsClick={() => setTagSidebarOpen(true)}
                  >
                    <div className="p-6 bg-surface-cream space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Group Name" defaultValue={group.name} />
                        <Input label="Region" defaultValue={group.region} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Toggle checked={group.status === 'active'} onChange={() => {}} />
                        <span className="text-text-secondary">Active</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="save" size="sm">Save Changes</Button>
                        <Button variant="secondary" size="sm">Cancel</Button>
                      </div>
                    </div>
                  </ExpandableRow>
                ))}
              </div>
            )}

            {/* Tab 3: Depots */}
            {activeTab === 'depots' && (
              <div className="space-y-2">
                {depotsData.map((depot) => (
                  <ExpandableRow
                    key={depot.id}
                    id={depot.id}
                    name={depot.name}
                    badge={{ text: depot.status === 'active' ? 'Active' : 'Inactive', variant: depot.status === 'active' ? 'customized' : 'system' }}
                    stats={[
                      { label: 'City', value: depot.city },
                      { label: 'State', value: depot.state },
                    ]}
                    tagCount={5}
                    preview="Region, Service"
                    isExpanded={expandedItem === depot.id}
                    onToggle={() => setExpandedItem(expandedItem === depot.id ? null : depot.id)}
                    onTagsClick={() => setTagSidebarOpen(true)}
                  >
                    <div className="p-6 bg-surface-cream space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input label="Depot Name" defaultValue={depot.name} />
                        <Input label="Address" defaultValue={depot.address} />
                        <Input label="City" defaultValue={depot.city} />
                        <Input label="State" defaultValue={depot.state} />
                        <Input label="ZIP Code" defaultValue={depot.zip} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Toggle checked={depot.status === 'active'} onChange={() => {}} />
                        <span className="text-text-secondary">Active</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="save" size="sm">Save Changes</Button>
                        <Button variant="secondary" size="sm">Cancel</Button>
                        <Button variant="danger" size="sm">Delete Depot</Button>
                      </div>
                    </div>
                  </ExpandableRow>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Tag Sidebar */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        title="Zone Tags"
        subtitle="Manage tag connections"
        tags={sampleTags}
        mode="edit"
      />
    </div>
  );
}

export default TerritoryPage;
