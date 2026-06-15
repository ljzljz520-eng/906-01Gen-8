import { ReactNode } from 'react';
import { LockKeyhole, ShieldAlert, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SensitivityLevel, UserRole } from '@/types';
import { SENSITIVITY_META, ROLE_META } from '@/utils/sensitivity';
import { useAppStore } from '@/store/useAppStore';
import { SensitivityBadge } from './Badges';

export function PermissionGate({
  level,
  children,
  fallback,
}: {
  level: SensitivityLevel;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { currentUser, canViewSensitiveLevel } = useAppStore();
  const authorized = canViewSensitiveLevel(level);
  const meta = SENSITIVITY_META[level];

  if (authorized) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  return (
    <div className="relative overflow-hidden rounded-sm border border-white/10">
      <div className="absolute inset-0 backdrop-blur-md bg-space-gray/40 z-20">
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-cyber-teal/5 to-white/0" />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(0,0,0,0.2), rgba(0,0,0,0.2) 4px, transparent 4px, transparent 8px)',
          }}
        />
      </div>
      <div className="relative z-30 py-16 px-6 text-center">
        <div className={`inline-flex w-16 h-16 items-center justify-center rounded-full ${meta.bgColor} ${meta.borderColor} border-2 mb-4`}>
          {level === SensitivityLevel.PUBLIC ? (
            <ShieldAlert size={28} className={meta.color} />
          ) : (
            <LockKeyhole size={28} className={meta.color} />
          )}
        </div>
        <SensitivityBadge level={level} size="lg" />
        <h3 className="mt-4 text-lg font-semibold text-gray-100">
          {currentUser ? '当前账号权限不足' : '需要登录后查看'}
        </h3>
        <p className="mt-2 text-sm text-gray-400 max-w-sm mx-auto">
          该条目为
          <span className={`${meta.color} font-medium mx-1`}>{meta.label}</span>
          级别，仅
          <span className="text-cyber-teal font-medium mx-1">SecureVault 授权人员</span>
          可查阅完整 POC 代码与利用细节。
        </p>
        {!currentUser && (
          <Link to="/login" className="btn-primary mt-6">
            <ShieldAlert size={16} />
            登录申请权限
          </Link>
        )}
        {currentUser && (
          <div className="mt-6 space-y-3 max-w-xs mx-auto">
            <div className="text-xs text-gray-500 border border-white/5 rounded-sm p-3">
              <div className="mb-1">您的身份：
                <span className={`${ROLE_META[currentUser.role]?.color ?? 'text-gray-300'} font-medium ml-1`}>
                  {ROLE_META[currentUser.role]?.label}
                </span>
              </div>
              <div>可查看级别：
                <span className="text-cyan-300 font-medium ml-1">
                  {(currentUser.authorizedScope ?? [SensitivityLevel.PUBLIC])
                    .map((s) => SENSITIVITY_META[s].label)
                    .join('、') || '无'}
                </span>
              </div>
            </div>
            {currentUser.role !== UserRole.ADMIN && (
              <Link to="/profile" className="btn-secondary !py-2 text-xs w-full">
                <Send size={14} />
                申请更高访问权限
              </Link>
            )}
          </div>
        )}
      </div>
      <div className="relative z-10 opacity-40 pointer-events-none">{children}</div>
    </div>
  );
}

export function RouteGuard({
  requireRoles,
  children,
  redirectTo = '/403',
}: {
  requireRoles: UserRole[];
  children: ReactNode;
  redirectTo?: string;
}) {
  const { currentUser } = useAppStore();
  const hasAccess = currentUser ? requireRoles.includes(currentUser.role) : false;

  if (hasAccess) return <>{children}</>;
  window.location.hash = `#${redirectTo}`;
  return null;
}
