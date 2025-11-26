import type { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-1 border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-3 text-base font-medium
            border-b-2 transition-all duration-normal -mb-px
            ${
              activeTab === tab.id
                ? 'border-brand-cyan text-text-primary'
                : 'border-transparent text-text-muted hover:text-text-secondary hover:bg-surface-light'
            }
          `}
        >
          {tab.icon && <span className="w-5 h-5">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
