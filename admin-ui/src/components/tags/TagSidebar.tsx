import type { ReactNode } from 'react';

interface TagSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  tags: Record<string, string[]>;
  selectedTags?: Record<string, string[]>;
  onTagSelect?: (category: string, tag: string) => void;
  mode?: 'view' | 'edit';
}

const CATEGORY_ICONS: Record<string, string> = {
  'Region': '🌎',
  'Depot': '🏢',
  'Country': '🌍',
  'Customer': '👤',
  'Service': '⚡',
  'Vehicle': '🚚',
  'Notification': '🔔',
  'Rate Card': '💰',
  'Airport': '✈️',
  'Linehaul': '🚛',
};

export function TagSidebar({
  isOpen,
  onClose,
  title,
  subtitle,
  tags,
  selectedTags = {},
  onTagSelect,
  mode = 'view',
}: TagSidebarProps): ReactNode {
  const isTagSelected = (category: string, tag: string): boolean => {
    return selectedTags[category]?.includes(tag) ?? false;
  };

  const handleTagClick = (category: string, tag: string): void => {
    if (mode === 'edit' && onTagSelect) {
      onTagSelect(category, tag);
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 duration-slow transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-sidebar z-50 transition-transform duration-slow ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-sm text-text-secondary">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="overflow-y-auto h-[calc(100%-120px)] p-6">
          {Object.entries(tags).map(([category, categoryTags]) => (
            <div key={category} className="mb-6">
              {/* Category Header */}
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category] || '🏷️'}</span>
                <span>{category}</span>
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {categoryTags.map((tag) => {
                  const selected = isTagSelected(category, tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => handleTagClick(category, tag)}
                      disabled={mode === 'view'}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        selected
                          ? 'bg-brand-cyan text-brand-dark'
                          : 'bg-surface-light text-text-secondary'
                      } ${
                        mode === 'edit'
                          ? 'hover:ring-2 hover:ring-brand-cyan/50 cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
