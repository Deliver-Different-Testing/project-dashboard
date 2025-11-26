import { useState } from 'react';
import { Button, Badge, Toggle, Input, Select } from './components/ui';
import { Tabs, PageHeader, Card } from './components/layout';

// Icons (inline SVGs for now)
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

  return (
    <div className="min-h-screen bg-surface-light p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <PageHeader
          title="Territory & Locations"
          subtitle="Manage zip zones, zone groups, and depot locations"
          actions={
            <>
              <Button variant="secondary">
                <TagIcon />
                Tags
              </Button>
              <Button variant="primary">Add New</Button>
            </>
          }
        />

        {/* Tabs Demo */}
        <Card padding="none">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">
            <p className="text-text-secondary">Active tab: <strong>{activeTab}</strong></p>
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

          {/* Button Sizes */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-text-muted uppercase tracking-wide mb-4">Button Sizes</h3>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm">Small</Button>
              <Button variant="primary" size="md">Medium</Button>
              <Button variant="primary" size="lg">Large</Button>
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
    </div>
  );
}

export default App;
