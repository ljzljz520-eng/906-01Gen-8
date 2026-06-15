import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-deep-space/85 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={`relative w-full ${sizes[size]} bg-space-gray border border-cyber-teal/20 shadow-[0_20px_60px_-15px_rgba(0,212,170,0.25)] rounded-sm animate-in zoom-in-95 duration-200`}
      >
        <div className="h-[2px] bg-gradient-to-r from-transparent via-cyber-teal/60 to-transparent" />
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <h3 className="font-mono-display font-semibold text-base text-gray-100">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-sm text-gray-400 hover:text-cyber-teal hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="p-6 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-white/5 bg-space-light/30 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="text-center py-16 px-4">
      <div className="inline-flex w-16 h-16 items-center justify-center rounded-full bg-space-light/60 border border-white/10 mb-5">
        {icon || <div className="w-8 h-8 rounded-sm bg-cyber-teal/20" />}
      </div>
      <h3 className="text-base font-semibold text-gray-200 mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  change,
  tone = 'neutral',
  icon,
}: {
  label: string;
  value: string | number;
  change?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'danger';
  icon?: ReactNode;
}) {
  const tones: Record<string, string> = {
    neutral: 'text-cyber-teal',
    positive: 'text-sens-public',
    warning: 'text-sens-internal',
    danger: 'text-sens-topsecret',
  };
  return (
    <div className="card p-4 relative overflow-hidden group hover:border-cyber-teal/20 transition-colors">
      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full bg-cyber-teal/5 group-hover:bg-cyber-teal/10 transition-colors" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-wider text-gray-500 mb-1">
            {label}
          </div>
          <div className={`text-2xl font-bold font-mono-display ${tones[tone]}`}>
            {value}
          </div>
          {change && <div className="text-[11px] text-gray-500 mt-1">{change}</div>}
        </div>
        {icon && (
          <div className={`w-9 h-9 rounded-sm bg-space-light flex items-center justify-center border border-white/5 ${tones[tone]}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
