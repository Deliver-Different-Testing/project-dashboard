import type { ReactNode } from 'react';

type BadgeVariant = 'default' | 'blue' | 'purple' | 'green' | 'cyan' | 'system' | 'customized' | 'orange' | 'yellow';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-border text-text-secondary',
  blue: 'bg-badge-blue-bg text-badge-blue-text',
  purple: 'bg-badge-purple-bg text-badge-purple-text',
  green: 'bg-badge-green-bg text-badge-green-text',
  cyan: 'bg-brand-cyan text-brand-dark',
  system: 'bg-border text-text-secondary',
  customized: 'bg-badge-purple-bg text-badge-purple-text',
  orange: 'bg-badge-orange-bg text-warning',
  yellow: 'bg-badge-yellow-bg text-warning',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
