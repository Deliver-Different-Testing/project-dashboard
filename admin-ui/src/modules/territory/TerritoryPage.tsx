import { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Tabs } from '../../components/layout/Tabs';
import { Card } from '../../components/layout/Card';
import { Button } from '../../components/ui/Button';
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
      <div className="px-8 pt-8 pb-4">
        <PageHeader
          title="Territory & Locations"
          subtitle="Manage zip zones, zone groups, and depot locations"
          actions={
            <Button variant="primary">Add New</Button>
          }
        />
      </div>

      {/* Main Content Card */}
      <div className="px-8 pb-8">
        <Card padding="none">
          {/* Sub-tabs at top of card */}
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Search + Filters Section */}
          <div className="p-4 border-b border-border bg-white">
            {/* Search Row */}
            <div className="grid grid-cols-2 gap-4 mb-4">
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

            {/* Inline Filters */}
            {activeTab === 'zip-zones' && (
              <div className="flex items-center gap-2 flex-wrap">
                {zipZoneFilters.map((filter) => {
                  const activeCount = activeFilters[filter.id]?.length || 0;
                  const filterIsActive = activeCount > 0;

                  return (
                    <div key={filter.id} className="relative group">
                      <button
                        onClick={() => {
                          // Simple toggle - cycle through first few options
                          const currentValues = activeFilters[filter.id] || [];
                          if (currentValues.length === 0) {
                            handleFilterChange(filter.id, [filter.options[1] || filter.options[0]]);
                          } else {
                            handleFilterChange(filter.id, []);
                          }
                        }}
                        className={`
                          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors
                          ${filterIsActive
                            ? 'bg-brand-cyan text-white'
                            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                          }
                        `}
                      >
                        {filter.label}
                        {activeCount > 0 && (
                          <span className="bg-white/20 rounded-full px-1.5 text-[10px]">
                            {activeCount}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}

                {Object.values(activeFilters).some(v => v.length > 0) && (
                  <button
                    onClick={() => setActiveFilters({})}
                    className="text-xs text-text-muted hover:text-brand-cyan ml-2"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}

            {/* Active Filter Chips */}
            {getFilterChips().length > 0 && (
              <div className="mt-3">
                <FilterChips
                  chips={getFilterChips()}
                  onRemove={handleRemoveChip}
                  onClearAll={() => setActiveFilters({})}
                />
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'zip-zones' && (
              <ZipZonesTab
                activeFilters={activeFilters}
                searchQuery={searchQuery}
              />
            )}

            {activeTab === 'zone-groups' && (
              <ZoneGroupsTab onConnectionsClick={handleConnectionsClick} />
            )}

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
