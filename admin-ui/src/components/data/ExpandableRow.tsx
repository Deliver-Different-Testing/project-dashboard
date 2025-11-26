import type { ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';

interface ExpandableRowProps {
  id: string;
  name: string;
  badge?: {
    text: string;
    variant: 'default' | 'customized' | 'system';
  };
  preview?: string;
  stats: {
    label: string;
    value: string | number;
  }[];
  tagCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  onTagsClick: () => void;
  children: ReactNode;
}

export function ExpandableRow({
  id: _id,
  name,
  badge,
  preview,
  stats,
  tagCount,
  isExpanded,
  onToggle,
  onTagsClick,
  children,
}: ExpandableRowProps) {
  return (
    <div
      className={`border-l-4 transition-colors duration-expand ${
        isExpanded ? 'border-brand-cyan' : 'border-transparent'
      }`}
    >
      {/* Header Row */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border">
        {/* Toggle */}
        <Toggle checked={isExpanded} onChange={onToggle} />

        {/* Name and Badge */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-text-primary font-medium truncate">{name}</span>
          {badge && <Badge variant={badge.variant}>{badge.text}</Badge>}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-end">
              <span className="text-text-muted text-sm">{stat.label}</span>
              <span className="text-text-primary font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Tags Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onTagsClick}
          className="min-w-fit"
        >
          <span className="text-text-primary">
            {tagCount} {tagCount === 1 ? 'Tag' : 'Tags'}
          </span>
          {preview && (
            <span className="text-text-muted ml-2 truncate max-w-[200px]">
              {preview}
            </span>
          )}
        </Button>

        {/* Chevron */}
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-100 rounded transition-colors duration-normal"
          aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
        >
          <ChevronDown
            className={`w-5 h-5 text-text-secondary transition-transform duration-expand ease-out ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Expanded Content */}
      <div
        className={`overflow-hidden transition-all duration-expand ease-out ${
          isExpanded ? 'max-h-auto' : 'max-h-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
