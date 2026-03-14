import type { AutomationScope, CustomerOption, SpeedOption, SiteOption, RegionOption, JobStatus } from '../types';

interface ScopeSelectorProps {
  scope: AutomationScope;
  customers: CustomerOption[];
  speeds: SpeedOption[];
  sites: SiteOption[];
  regions: RegionOption[];
  jobStatuses: JobStatus[];
  onChange: (scope: AutomationScope) => void;
}

export function ScopeSelector({
  scope,
  customers,
  speeds,
  sites,
  regions,
  jobStatuses,
  onChange,
}: ScopeSelectorProps) {
  const handleAllCustomersChange = (checked: boolean) => {
    onChange({ ...scope, allCustomers: checked, customerIds: checked ? [] : scope.customerIds });
  };

  const handleAllSpeedsChange = (checked: boolean) => {
    onChange({ ...scope, allSpeeds: checked, speedIds: checked ? [] : scope.speedIds });
  };

  const toggleCustomer = (customerId: string) => {
    const newIds = scope.customerIds.includes(customerId)
      ? scope.customerIds.filter((id) => id !== customerId)
      : [...scope.customerIds, customerId];
    onChange({ ...scope, customerIds: newIds });
  };

  const toggleSpeed = (speedId: string) => {
    const newIds = scope.speedIds.includes(speedId)
      ? scope.speedIds.filter((id) => id !== speedId)
      : [...scope.speedIds, speedId];
    onChange({ ...scope, speedIds: newIds });
  };

  return (
    <div className="space-y-4">
      {/* Customers */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="all-customers" checked={scope.allCustomers}
            onChange={(e) => handleAllCustomersChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan" />
          <label htmlFor="all-customers" className="text-sm font-medium text-text-primary">Apply to all customers</label>
        </div>
        {!scope.allCustomers && (
          <div className="ml-6 p-3 bg-white border border-border rounded-lg">
            <p className="text-xs text-text-secondary mb-2">Select customers:</p>
            <div className="flex flex-wrap gap-2">
              {customers.map((c) => {
                const sel = scope.customerIds.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => toggleCustomer(c.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${sel ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium' : 'border-border bg-white text-text-secondary hover:border-gray-300'}`}>
                    {c.shortName}
                  </button>
                );
              })}
            </div>
            {scope.customerIds.length === 0 && <p className="text-xs text-text-muted mt-2">No selection = applies to all customers</p>}
          </div>
        )}
      </div>

      {/* Speeds */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input type="checkbox" id="all-speeds" checked={scope.allSpeeds}
            onChange={(e) => handleAllSpeedsChange(e.target.checked)}
            className="w-4 h-4 rounded border-border text-brand-cyan focus:ring-brand-cyan" />
          <label htmlFor="all-speeds" className="text-sm font-medium text-text-primary">Apply to all speeds</label>
        </div>
        {!scope.allSpeeds && (
          <div className="ml-6 p-3 bg-white border border-border rounded-lg">
            <p className="text-xs text-text-secondary mb-2">Select speeds:</p>
            <div className="flex flex-wrap gap-2">
              {speeds.map((s) => {
                const sel = scope.speedIds.includes(s.id);
                return (
                  <button key={s.id} type="button" onClick={() => toggleSpeed(s.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${sel ? 'border-brand-cyan bg-brand-cyan/10 text-brand-cyan font-medium' : 'border-border bg-white text-text-secondary hover:border-gray-300'}`}>
                    {s.name}
                  </button>
                );
              })}
            </div>
            {scope.speedIds.length === 0 && <p className="text-xs text-text-muted mt-2">No selection = applies to all speeds</p>}
          </div>
        )}
      </div>

      {/* Additional Filters */}
      <div className="pt-3 border-t border-gray-100">
        <h4 className="text-sm font-medium text-text-primary mb-3">Additional Filters</h4>
        <div className="grid grid-cols-2 gap-3">
          {/* Job Status Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Job Status Filter</label>
            <select value={scope.jobStatusFilter || ''}
              onChange={(e) => onChange({ ...scope, jobStatusFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All statuses</option>
              {jobStatuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs in this status. Leave empty for all.</p>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Priority Filter</label>
            <select value={scope.priorityFilter || ''}
              onChange={(e) => onChange({ ...scope, priorityFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All priorities</option>
              <option value="1">Critical</option>
              <option value="2">High</option>
              <option value="3">Normal</option>
              <option value="4">Low</option>
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Filter by job priority.</p>
          </div>

          {/* From Site */}
          <div>
            <label className="text-xs text-text-secondary font-medium">From Site Filter</label>
            <select value={scope.fromSiteFilter || ''}
              onChange={(e) => onChange({ ...scope, fromSiteFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All origin sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs from these sites.</p>
          </div>

          {/* To Site */}
          <div>
            <label className="text-xs text-text-secondary font-medium">To Site Filter</label>
            <select value={scope.toSiteFilter || ''}
              onChange={(e) => onChange({ ...scope, toSiteFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All destination sites</option>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs going to these sites.</p>
          </div>

          {/* From Region */}
          <div>
            <label className="text-xs text-text-secondary font-medium">From Region Filter</label>
            <select value={scope.fromRegionFilter || ''}
              onChange={(e) => onChange({ ...scope, fromRegionFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All origin regions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs from these regions.</p>
          </div>

          {/* To Region */}
          <div>
            <label className="text-xs text-text-secondary font-medium">To Region Filter</label>
            <select value={scope.toRegionFilter || ''}
              onChange={(e) => onChange({ ...scope, toRegionFilter: e.target.value || undefined })}
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan">
              <option value="">All destination regions</option>
              {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <p className="text-[10px] text-text-muted mt-0.5">Only apply to jobs going to these regions.</p>
          </div>

          {/* Time Threshold */}
          <div>
            <label className="text-xs text-text-secondary font-medium">Time Threshold (minutes)</label>
            <input type="number" value={scope.timeThreshold ?? ''}
              onChange={(e) => onChange({ ...scope, timeThreshold: e.target.value ? parseInt(e.target.value, 10) : undefined })}
              placeholder="e.g. 15"
              className="w-full mt-1 px-2 py-1.5 text-sm border border-border rounded bg-white text-text-primary focus:outline-none focus:border-brand-cyan"
              min={0} />
            <p className="text-[10px] text-text-muted mt-0.5">Job must be in state for at least X minutes before rule fires.</p>
          </div>
        </div>
      </div>

      {/* Scope Summary */}
      <div className="p-2 bg-surface-cream rounded text-xs text-text-secondary">
        <strong>Scope:</strong> This automation applies to{' '}
        {scope.allCustomers || scope.customerIds.length === 0 ? 'all customers' : (
          <span className="font-medium text-text-primary">{scope.customerIds.length} customer{scope.customerIds.length !== 1 ? 's' : ''}</span>
        )}{' '}and{' '}
        {scope.allSpeeds || scope.speedIds.length === 0 ? 'all speeds' : (
          <span className="font-medium text-text-primary">{scope.speedIds.length} speed{scope.speedIds.length !== 1 ? 's' : ''}</span>
        )}.
      </div>
    </div>
  );
}
