import { useState } from 'react';
import { Button, Badge, Toggle, Input, Select } from './components/ui';
import { Tabs, PageHeader, Card } from './components/layout';
import { ExpandableRow } from './components/data';
import { FilterBar, FilterChips } from './components/filters';
import { TagSidebar } from './components/tags';

// Icons
const TagIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SearchIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function App() {
  const [activeTab, setActiveTab] = useState('zones');
  const [toggle1, setToggle1] = useState(true);
  const [toggle2, setToggle2] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>('zone-1');
  const [tagSidebarOpen, setTagSidebarOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  const tabs = [
    { id: 'zones', label: 'All Zip Zones' },
    { id: 'groups', label: 'Zone Groups' },
    { id: 'depots', label: 'Depots/Locations' },
  ];

  const selectOptions = [
    { value: 'all', label: 'All Regions' },
    { value: 'north', label: 'North America' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia Pacific' },
  ];

  const filters = [
    { id: 'region', label: 'Region', options: ['North America', 'Europe', 'Asia Pacific', 'Australia'] },
    { id: 'depot', label: 'Depot', options: ['NYC Central', 'LA Hub', 'London', 'Sydney'] },
    { id: 'service', label: 'Service', options: ['Standard', 'Express', 'Same Day', 'Next Day'] },
  ];

  const sampleTags = {
    Region: ['North America', 'Europe', 'Asia Pacific'],
    Depot: ['NYC Central', 'LA Hub', 'London HQ'],
    Service: ['Express', 'Standard'],
    Customer: ['1976 Limited', 'Acme Corp'],
  };

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
      {/* Page Header */}
      <div className="p-8 pb-0">
        <PageHeader
          title="Territory & Locations"
          subtitle="Manage zip zones, zone groups, and depot locations"
          actions={
            <>
              <Button variant="secondary" onClick={() => setTagSidebarOpen(true)}>
                <TagIcon />
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

      {/* Filter Chips */}
      {getFilterChips().length > 0 && (
        <div className="px-8 py-3 border-b border-border bg-white">
          <FilterChips
            chips={getFilterChips()}
            onRemove={handleRemoveChip}
            onClearAll={() => setActiveFilters({})}
          />
        </div>
      )}

      <div className="p-8 space-y-8">
        {/* Tabs Demo */}
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">
            {/* Expandable Rows */}
            <div className="space-y-2">
              <ExpandableRow
                id="zone-1"
                name="Manhattan Central"
                badge={{ text: 'Customized', variant: 'customized' }}
                stats={[
                  { label: 'Zips', value: 156 },
                  { label: 'Active', value: '98%' },
                ]}
                tagCount={5}
                preview="Region, Depot, Service"
                isExpanded={expandedRow === 'zone-1'}
                onToggle={() => setExpandedRow(expandedRow === 'zone-1' ? null : 'zone-1')}
                onTagsClick={() => setTagSidebarOpen(true)}
              >
                <div className="p-6 bg-surface-cream">
                  <p className="text-text-secondary">Expanded content for Manhattan Central zone group...</p>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <Input label="Zone Name" placeholder="Manhattan Central" />
                    <Select label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
                  </div>
                </div>
              </ExpandableRow>

              <ExpandableRow
                id="zone-2"
                name="Brooklyn Hub"
                badge={{ text: 'System', variant: 'system' }}
                stats={[
                  { label: 'Zips', value: 89 },
                  { label: 'Active', value: '100%' },
                ]}
                tagCount={3}
                isExpanded={expandedRow === 'zone-2'}
                onToggle={() => setExpandedRow(expandedRow === 'zone-2' ? null : 'zone-2')}
                onTagsClick={() => setTagSidebarOpen(true)}
              >
                <div className="p-6 bg-surface-cream">
                  <p className="text-text-secondary">Expanded content for Brooklyn Hub zone group...</p>
                </div>
              </ExpandableRow>
            </div>
          </div>
        </Card>

        {/* Component Showcase */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Component Library</h2>

          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="save">Save</Button>
              <Button variant="danger">Delete</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>Disabled</Button>
            </div>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default">Default</Badge>
              <Badge variant="blue">Blue</Badge>
              <Badge variant="purple">Purple</Badge>
              <Badge variant="green">Green</Badge>
              <Badge variant="cyan">Cyan</Badge>
              <Badge variant="system">System</Badge>
              <Badge variant="customized">Customized</Badge>
            </div>
          </div>

          {/* Toggles */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Toggles</h3>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Toggle checked={toggle1} onChange={setToggle1} />
                <span className="text-text-secondary">Active</span>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={toggle2} onChange={setToggle2} />
                <span className="text-text-secondary">Inactive</span>
              </div>
              <div className="flex items-center gap-2">
                <Toggle checked={true} onChange={() => {}} size="sm" />
                <span className="text-text-secondary">Small</span>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Inputs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <Input
                label="Zone Name"
                placeholder="Enter zone name..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input
                label="Search"
                placeholder="Search zones..."
                icon={<SearchIcon />}
              />
              <Select
                label="Region"
                options={selectOptions}
                value={selectValue}
                onChange={(e) => setSelectValue(e.target.value)}
              />
              <Input
                label="With Error"
                placeholder="Invalid input"
                error="This field is required"
              />
            </div>
          </div>
        </Card>

        {/* Color Palette */}
        <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-6">Brand Colors</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-6 rounded-lg bg-brand-dark text-white">
              <div className="text-sm opacity-75">Main Dark</div>
              <div className="font-mono">#14152D</div>
            </div>
            <div className="p-6 rounded-lg bg-brand-cyan text-brand-dark">
              <div className="text-sm opacity-75">Main Highlight</div>
              <div className="font-mono">#43C7F4</div>
            </div>
            <div className="p-6 rounded-lg bg-brand-purple text-white">
              <div className="text-sm opacity-75">Secondary</div>
              <div className="font-mono">#606DB4</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Tag Sidebar */}
      <TagSidebar
        isOpen={tagSidebarOpen}
        onClose={() => setTagSidebarOpen(false)}
        title="Zone Tags"
        subtitle="Manhattan Central"
        tags={sampleTags}
        mode="view"
      />
    </div>
  );
}

export default App;
