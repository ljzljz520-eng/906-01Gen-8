import { Search, SlidersHorizontal, RotateCcw, Shield, Clock, Package } from 'lucide-react';
import { SensitivityLevel, VerificationStatus, VulnFilter } from '@/types';
import { SENSITIVITY_META, STATUS_META } from '@/utils/sensitivity';
import { useAppStore } from '@/store/useAppStore';

const ALL_LEVELS = [
  SensitivityLevel.PUBLIC,
  SensitivityLevel.INTERNAL,
  SensitivityLevel.CONFIDENTIAL,
  SensitivityLevel.TOP_SECRET,
];

const ALL_STATUSES = [
  VerificationStatus.PENDING,
  VerificationStatus.DESENSITIZATION,
  VerificationStatus.VERIFIED,
  VerificationStatus.REJECTED,
];

export function FilterPanel({ compact = false }: { compact?: boolean }) {
  const { filters, setFilters, clearFilters } = useAppStore();

  const toggleArr = <K extends keyof VulnFilter>(key: K, value: any) => {
    const cur = (filters[key] as any[]) ?? [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    setFilters({ [key]: next.length ? next : undefined } as Partial<VulnFilter>);
  };

  const activeCount =
    (filters.sensitivity?.length ?? 0) +
    (filters.status?.length ?? 0) +
    (filters.product ? 1 : 0) +
    (filters.dateFrom || filters.dateTo ? 1 : 0);

  return (
    <div className="card p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-200">
          <SlidersHorizontal size={16} className="text-cyber-teal" />
          <span className="font-semibold text-sm">条件筛选</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-cyber-teal text-deep-space text-[10px] font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-cyber-teal transition-colors"
          >
            <RotateCcw size={11} /> 重置
          </button>
        )}
      </div>

      <div>
        <div className="label flex items-center gap-1.5">
          <Search size={10} /> 关键词
        </div>
        <input
          value={filters.keyword}
          onChange={(e) => setFilters({ keyword: e.target.value })}
          placeholder="漏洞编号、CVE、描述..."
          className="input-field"
        />
      </div>

      <div>
        <div className="label flex items-center gap-1.5">
          <Shield size={10} /> 敏感级别
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_LEVELS.map((lvl) => {
            const meta = SENSITIVITY_META[lvl];
            const active = (filters.sensitivity ?? []).includes(lvl);
            return (
              <button
                key={lvl}
                onClick={() => toggleArr('sensitivity', lvl)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-sm border transition-all ${
                  active
                    ? `${meta.bgColor} ${meta.color} ${meta.borderColor} shadow-[0_0_12px_var(--tw-shadow-color)]`
                    : 'bg-space-light/50 text-gray-400 border-white/5 hover:text-gray-200 hover:border-white/10'
                }`}
                style={active ? { ['--tw-shadow-color' as any]: getComputedColor(meta.color) } : undefined}
              >
                <span className={`w-1.5 h-1.5 rounded-sm ${meta.dotColor}`} />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="label flex items-center gap-1.5">
          <Clock size={10} /> 验证状态
        </div>
        <div className="flex flex-wrap gap-1.5">
          {ALL_STATUSES.map((st) => {
            const meta = STATUS_META[st];
            const active = (filters.status ?? []).includes(st);
            return (
              <button
                key={st}
                onClick={() => toggleArr('status', st)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-sm border transition-all ${
                  active
                    ? `${meta.bgColor} ${meta.color} ${meta.borderColor}`
                    : 'bg-space-light/50 text-gray-400 border-white/5 hover:text-gray-200 hover:border-white/10'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: active ? 'currentColor' : undefined, backgroundColor: active ? undefined : '#6b7280' }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </div>

      {!compact && (
        <>
          <div>
            <div className="label flex items-center gap-1.5">
              <Package size={10} /> 产品/厂商
            </div>
            <input
              value={filters.product ?? ''}
              onChange={(e) => setFilters({ product: e.target.value || undefined })}
              placeholder="如：Nginx、Spring、Atlassian..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="label">起始日期</div>
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) => setFilters({ dateFrom: e.target.value || undefined })}
                className="input-field"
              />
            </div>
            <div>
              <div className="label">结束日期</div>
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) => setFilters({ dateTo: e.target.value || undefined })}
                className="input-field"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function getComputedColor(cls: string) {
  const map: Record<string, string> = {
    'text-sens-public': 'rgba(34,197,94,0.4)',
    'text-sens-internal': 'rgba(234,179,8,0.4)',
    'text-sens-confidential': 'rgba(249,115,22,0.4)',
    'text-sens-topsecret': 'rgba(239,68,68,0.4)',
  };
  return map[cls] ?? 'rgba(0,212,170,0.3)';
}
