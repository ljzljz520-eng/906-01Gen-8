import { AlertTriangle, ShieldCheck, Eraser, Zap, Target } from 'lucide-react';
import { SensitivityAnalysisResult } from '@/types';
import { SENSITIVITY_META } from '@/utils/sensitivity';
import { SensitivityBadge } from './Badges';

export function SensitivityAnalysisPanel({
  result,
  onChangeLevel,
  currentLevel,
}: {
  result: SensitivityAnalysisResult;
  onChangeLevel?: (l: any) => void;
  currentLevel?: any;
}) {
  const meta = SENSITIVITY_META[result.suggestedLevel];
  const scoreColor =
    result.riskScore >= 70
      ? 'text-sens-topsecret'
      : result.riskScore >= 45
      ? 'text-sens-confidential'
      : result.riskScore >= 25
      ? 'text-sens-internal'
      : 'text-sens-public';

  return (
    <div className="card overflow-hidden">
      <div className={`h-1.5 w-full ${meta.dotColor}`} />
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm bg-cyber-teal/10 border border-cyber-teal/30 flex items-center justify-center text-cyber-teal">
              <Zap size={16} />
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-100">敏感初判</div>
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                AI 实时分析
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-500 mb-0.5">风险指数</div>
            <div className={`font-mono-display text-xl font-bold ${scoreColor}`}>
              {result.riskScore}
              <span className="text-xs text-gray-500">/100</span>
            </div>
          </div>
        </div>

        <div className="h-1.5 w-full rounded-full bg-space-light overflow-hidden">
          <div
            className={`h-full ${meta.dotColor} transition-all duration-700 ease-out`}
            style={{ width: `${result.riskScore}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-space-light/50 border border-white/5 rounded-sm p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              建议级别
            </div>
            <SensitivityBadge level={result.suggestedLevel} size="md" />
          </div>
          <div className="bg-space-light/50 border border-white/5 rounded-sm p-3">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              命中特征
            </div>
            <div className={`font-mono-display text-xl font-bold ${result.matches.length > 0 ? 'text-sens-internal' : 'text-sens-public'}`}>
              {result.matches.length}
              <span className="text-xs text-gray-500 ml-1">项</span>
            </div>
          </div>
        </div>

        {onChangeLevel && (
          <div>
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1.5">
              调整判定级别（研究员可参考）
            </div>
            <div className="grid grid-cols-4 gap-1">
              {([
                'public',
                'internal',
                'confidential',
                'top_secret',
              ] as const).map((lvl) => {
                const m = SENSITIVITY_META[lvl];
                const active = currentLevel === lvl;
                return (
                  <button
                    key={lvl}
                    onClick={() => onChangeLevel(lvl)}
                    className={`px-1.5 py-1.5 text-[10px] rounded-sm border transition-all ${
                      active
                        ? `${m.bgColor} ${m.color} ${m.borderColor} font-semibold`
                        : 'bg-space-light/30 text-gray-500 border-white/5 hover:text-gray-300'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {result.matches.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              <Target size={10} /> 命中关键词
            </div>
            <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {result.matches.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-xs bg-space-light/40 border border-white/5 rounded-sm px-2.5 py-2"
                >
                  <span
                    className={`shrink-0 inline-flex items-center justify-center w-4 h-4 rounded-sm mt-0.5 ${SENSITIVITY_META[m.suggestedLevel].bgColor} ${SENSITIVITY_META[m.suggestedLevel].color} text-[9px] font-bold`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className={`font-medium ${SENSITIVITY_META[m.suggestedLevel].color}`}>
                      {m.keyword}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5 font-mono-code truncate">
                      "{m.highlight}"
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.needDesensitization && (
          <div className="bg-sens-internal/10 border border-sens-internal/30 rounded-sm p-3 flex items-start gap-2">
            <Eraser size={14} className="text-sens-internal mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-sens-internal mb-1">
                检测到需脱敏内容
              </div>
              <ul className="text-[11px] text-gray-400 space-y-0.5">
                {result.desensitizationHints.map((h, i) => (
                  <li key={i}>• {h}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result.matches.length === 0 && (
          <div className="bg-sens-public/10 border border-sens-public/30 rounded-sm p-3 flex items-center gap-2">
            <ShieldCheck size={14} className="text-sens-public shrink-0" />
            <span className="text-xs text-sens-public">
              未检测到明显高危特征，内容可按公开级常规审核
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function WarnIconPulse() {
  return (
    <span className="relative inline-flex">
      <AlertTriangle size={14} className="text-sens-internal relative z-10" />
      <span className="absolute inset-0 animate-ping bg-sens-internal/40 rounded-full" />
    </span>
  );
}
