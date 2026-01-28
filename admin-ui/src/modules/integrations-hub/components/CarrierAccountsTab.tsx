import { useState } from 'react';
import { Badge } from '../../../components/ui/Badge';
import { Toggle } from '../../../components/ui/Toggle';
import { sampleCarrierAccounts } from '../data/sampleData';
import { CARRIER_LABELS, CARRIER_COLORS } from '../types';
import type { CarrierAccount, CarrierType } from '../types';

interface CarrierAccountsTabProps {
  carrier: CarrierType;
}

export function CarrierAccountsTab({ carrier }: CarrierAccountsTabProps) {
  const [accounts, setAccounts] = useState<CarrierAccount[]>(
    sampleCarrierAccounts.filter(a => a.carrier === carrier)
  );

  const handleToggleActive = (id: string) => {
    setAccounts(accounts.map(account =>
      account.id === id ? { ...account, isActive: !account.isActive } : account
    ));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">
          {accounts.length} {CARRIER_LABELS[carrier]} account{accounts.length !== 1 ? 's' : ''} configured
        </p>
      </div>

      {/* Accounts List */}
      <div className="space-y-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`p-4 rounded-lg border transition-all ${
              account.isActive
                ? 'bg-white border-border hover:border-brand-cyan/50'
                : 'bg-gray-50 border-border opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              {/* Left: Account Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-text-primary truncate">
                    {account.accountName}
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-text-muted">Account #:</span>{' '}
                    <span className="text-text-secondary font-mono">{account.accountNumber}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Auth:</span>{' '}
                    <span className="text-text-secondary capitalize">{account.authType.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-text-muted">Last Sync:</span>{' '}
                    <span className="text-text-secondary">{formatDate(account.lastSync)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Toggle & Actions */}
              <div className="flex items-center gap-4">
                <Toggle
                  checked={account.isActive}
                  onChange={() => handleToggleActive(account.id)}
                  label={account.isActive ? 'Active' : 'Inactive'}
                />
                <button className="p-2 text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-md transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {accounts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No {CARRIER_LABELS[carrier]} accounts</h3>
          <p className="text-text-secondary mb-4">Add your first {CARRIER_LABELS[carrier]} account to get started</p>
        </div>
      )}
    </div>
  );
}
