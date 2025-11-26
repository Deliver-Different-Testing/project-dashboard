import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/filters/FilterBar';
import { FilterChips } from '../../components/filters/FilterChips';
import { SearchInput } from '../../components/filters/SearchInput';
import { TagSidebar, TagSearchInput } from '../../components/tags';
import { ZipZonesTab } from './components/ZipZonesTab';
import { ZoneGroupsTab } from './components/ZoneGroupsTab';
import { DepotsTab } from './components/DepotsTab';
import { zipZoneFilters } from './data/sampleData';
import type { SourceItem, EntityConnections } from './types';
import { createEmptyConnections } from './types';

export function TerritoryPage() {
  const [activeTab, setActiveTab] = useState('zip-zones');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [tagSearch, setTagSearch] = useState('');

  // State for the connection sidebar
  const [sidebarSourceItem, setSidebarSourceItem] = useState<SourceItem>({
    type: 'zipZone',
    id: '',
    name: '',
  });
  const [sidebarConnections, setSidebarConnections] = useState<EntityConnections>(createEmptyConnections());

  // Handle opening the sidebar for a specific item
  const handleConnectionsClick = (sourceItem: SourceItem, connections: EntityConnections) => {
    setSidebarSourceItem(sourceItem);
    setSidebarConnections(connections);
    setTagSidebarOpen(true);
  };

  // Handle navigation from the sidebar
  const handleNavigate = (targetRoute: string, searchQuery: string) => {
    // In a real app, this would use a router
    // For now, just log and update tag search
    console.log(`Navigate to ${targetRoute}?tagSearch=${searchQuery}`);
    setTagSearch(searchQuery);
    // Could also switch tabs based on route
    if (targetRoute.includes('tab=groups')) {
      setActiveTab('zone-groups');
    } else if (targetRoute.includes('tab=depots')) {
      setActiveTab('depots');
    }
  };

  const tabs = [
    { id: 'zip-zones', label: 'All Zip Zones' },
    { id: 'zone-groups', label: 'Zone Groups' },
    { id: 'depots', label: 'Depots/Locations' },
  ];

  const handleFilterChange = (filterId: string, values: string[]) => {
    setActiveFilters({ ...activeFilters, [filterId]: values });
  };

  const getFilterChips = () => {
    const chips: { category: string; value: string }[] = [];
    Object.entries(activeFilters).forEach(([category, values]) => {
      values.forEach((value) => {
        // Don't show "All X" chips
        if (!value.startsWith('All ')) {
          chips.push({ category, value });
        }
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
        filters={zipZoneFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClear={() => setActiveFilters({})}
      />

      {/* Search Row - Master Search + Tag Search */}
      <div className="px-8 py-4">
        <div className="grid grid-cols-2 gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search zones, groups, or depots..."
          />
          <TagSearchInput
            value={tagSearch}
            onChange={setTagSearch}
            placeholder="Filter by connected entity..."
            entityType={activeTab === 'zip-zones' ? 'zip zone' : activeTab === 'zone-groups' ? 'zone group' : 'depot'}
          />
        </div>
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
              <ZipZonesTab
                activeFilters={activeFilters}
                searchQuery={searchQuery}
              />
            )}

            {/* Tab 2: Zone Groups */}
            {activeTab === 'zone-groups' && (
              <ZoneGroupsTab onConnectionsClick={handleConnectionsClick} />
            )}

            {/* Tab 3: Depots */}
            {activeTab === 'depots' && (
              <DepotsTab onConnectionsClick={handleConnectionsClick} />
            )}
          </div>
        </Card>
      </div>

      {/* Tag Sidebar - Connection Navigator */}
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

export default TerritoryPage;
