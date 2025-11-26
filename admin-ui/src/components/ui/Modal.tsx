import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  variant: 'right-slide' | 'center';
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  variant,
  children,
  footer,
  size = 'md',
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-xl',
  };

  const overlayClasses = 'fixed inset-0 bg-black/30 z-50';

  if (variant === 'right-slide') {
    return (
      <>
        <div className={overlayClasses} onClick={onClose} />
        <div
          className={`fixed right-0 top-0 h-full w-[480px] bg-white z-50 transform transition-transform duration-300 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="sticky top-0 border-b p-6 flex justify-between items-start bg-white">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
                {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-text-muted hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">{children}</div>

            {footer && (
              <div className="sticky bottom-0 border-t p-4 flex justify-between bg-white">
                {footer}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={overlayClasses} onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg ${sizeClasses[size]} w-full transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="sticky top-0 border-b p-6 flex justify-between items-start bg-white rounded-t-lg">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
              {subtitle && <p className="text-sm text-text-muted mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6">{children}</div>

          {footer && (
            <div className="sticky bottom-0 border-t p-4 flex justify-end gap-2 bg-white rounded-b-lg">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
