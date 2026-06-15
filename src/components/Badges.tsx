import { Shield, ShieldHalf, ShieldAlert, LockKeyhole, Globe } from 'lucide-react';
import { SensitivityLevel, VerificationStatus, UserRole } from '@/types';
import { SENSITIVITY_META, STATUS_META, ROLE_META } from '@/utils/sensitivity';
import type { LucideIcon } from 'lucide-react';

const LEVEL_ICONS: Record<SensitivityLevel, LucideIcon> = {
  [SensitivityLevel.PUBLIC]: Globe,
  [SensitivityLevel.INTERNAL]: Shield,
  [SensitivityLevel.CONFIDENTIAL]: ShieldAlert,
  [SensitivityLevel.TOP_SECRET]: LockKeyhole,
};

export function SensitivityBadge({
  level,
  size = 'md',
  showIcon = true,
  asBar = false,
}: {
  level: SensitivityLevel;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  asBar?: boolean;
}) {
  const meta = SENSITIVITY_META[level];
  const Icon = LEVEL_ICONS[level];

  if (asBar) {
    const widths: Record<SensitivityLevel, string> = {
      [SensitivityLevel.PUBLIC]: 'w-1',
      [SensitivityLevel.INTERNAL]: 'w-1.5',
      [SensitivityLevel.CONFIDENTIAL]: 'w-2',
      [SensitivityLevel.TOP_SECRET]: 'w-2.5',
    };
    return (
      <div
        className={`${widths[level]} ${meta.dotColor} rounded-sm self-stretch`}
        title={meta.label}
      />
    );
  }

  const sizeMap = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border ${meta.bgColor} ${meta.color} ${meta.borderColor} ${sizeMap[size]} font-medium tracking-wide`}
    >
      {showIcon && <Icon size={size === 'sm' ? 10 : size === 'md' ? 12 : 14} />}
      <span className="uppercase">{meta.shortLabel}</span>
      <span className="hidden sm:inline">· {meta.label}</span>
    </span>
  );
}

export function StatusBadge({
  status,
  showDot = true,
}: {
  status: VerificationStatus;
  showDot?: boolean;
}) {
  const meta = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border text-xs font-medium ${meta.bgColor} ${meta.color} ${meta.borderColor}`}
    >
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: 'currentColor' }}
        />
      )}
      {meta.label}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const meta = ROLE_META[role];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm border border-white/10 bg-white/5 ${meta.color} text-xs font-medium`}
    >
      {meta.label}
    </span>
  );
}

export function MetaDot({ color = 'bg-cyber-teal' }: { color?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full ${color}`} />;
}
