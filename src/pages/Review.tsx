import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Clock,
  Eraser,
  CheckCircle2,
  XCircle,
  Eye,
  FilterX,
  ChevronRight,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SensitivityBadge, StatusBadge, MetaDot } from '@/components/Badges';
import { Modal, EmptyState, StatCard } from '@/components/Common';
import { SensitivityLevel, VerificationStatus } from '@/types';
import { SENSITIVITY_META, STATUS_META } from '@/utils/sensitivity';
import { CodeBlock } from '@/components/CodeBlock';

type TabKey = 'all' | VerificationStatus;

const TABS: Array<{ key: TabKey; label: string; icon: any; color: string }> = [
  { key: VerificationStatus.PENDING, label: '待审核', icon: Clock, color: 'text-blue-400' },
  { key: VerificationStatus.DESENSITIZATION, label: '待脱敏', icon: Eraser, color: 'text-sens-internal' },
  { key: VerificationStatus.VERIFIED, label: '已发布', icon: CheckCircle2, color: 'text-sens-public' },
  { key: VerificationStatus.REJECTED, label: '已驳回', icon: XCircle, color: 'text-sens-topsecret' },
  { key: 'all', label: '全部', icon: ClipboardCheck, color: 'text-cyber-teal' },
];

const REVIEW_ACTIONS = [
  { key: 'verify', label: '通过发布', tone: 'primary' as const, icon: CheckCircle2 },
  { key: 'desensitize', label: '要求脱敏', tone: 'warning' as const, icon: Eraser },
  { key: 'reject', label: '驳回提交', tone: 'danger' as const, icon: XCircle },
] as const;

export default function Review() {
  const { vulnerabilities, canAccessReview, reviewVulnerability, initStore } = useAppStore();
  const [tab, setTab] = useState<TabKey>(VerificationStatus.PENDING);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<(typeof REVIEW_ACTIONS)[number]['key'] | null>(null);
  const [reviewLevel, setReviewLevel] = useState<SensitivityLevel | null>(null);
  const [reviewText, setReviewText] = useState('');
  const [search, setSearch] = useState('');

  useMemo(() => initStore(), [initStore]);

  if (!canAccessReview()) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <XCircle size={48} className="mx-auto text-sens-topsecret mb-4" />
        <h2 className="text-xl font-semibold text-gray-100 mb-2">仅管理员可访问</h2>
        <p className="text-gray-500 mb-6">审核工作台仅限平台管理员访问</p>
        <Link to="/login" className="btn-primary">管理员登录</Link>
      </div>
    );
  }

  const filtered = vulnerabilities
    .filter((v) => (tab === 'all' ? true : v.verificationStatus === tab))
    .filter((v) => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        v.title.toLowerCase().includes(q) ||
        v.vulnCode.toLowerCase().includes(q) ||
        (v.cveId ?? '').toLowerCase().includes(q) ||
        v.submitterName.toLowerCase().includes(q)
      );
    });

  const active = vulnerabilities.find((v) => v.id === activeId) || null;

  const openReview = (id: string, action: (typeof REVIEW_ACTIONS)[number]['key']) => {
    const v = vulnerabilities.find((x) => x.id === id);
    setActiveId(id);
    setReviewAction(action);
    setReviewLevel(v?.sensitivityLevel ?? SensitivityLevel.PUBLIC);
    setReviewText('');
  };

  const confirm = () => {
    if (!activeId || !reviewAction) return;
    reviewVulnerability(activeId, reviewAction, {
      level: reviewLevel ?? undefined,
      reason: reviewAction === 'reject' ? reviewText : undefined,
      request: reviewAction === 'desensitize' ? reviewText : undefined,
    });
    setActiveId(null);
    setReviewAction(null);
  };

  const counts = {
    pending: vulnerabilities.filter((v) => v.verificationStatus === VerificationStatus.PENDING).length,
    desensitization: vulnerabilities.filter((v) => v.verificationStatus === VerificationStatus.DESENSITIZATION).length,
    verified: vulnerabilities.filter((v) => v.verificationStatus === VerificationStatus.VERIFIED).length,
    rejected: vulnerabilities.filter((v) => v.verificationStatus === VerificationStatus.REJECTED).length,
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 xl:px-6 py-8">
        <div className="mb-7">
          <div className="inline-flex items-center gap-2 text-[11px] text-sens-topsecret uppercase tracking-wider mb-3 font-medium">
            <AlertTriangle size={12} /> 管理工作区 · 请严格遵守权限分级规范
          </div>
          <h1 className="text-2xl font-bold font-mono-display text-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-gradient-to-br from-sens-topsecret to-orange-600 flex items-center justify-center">
              <ClipboardCheck size={18} className="text-white" />
            </div>
            漏洞审核工作台
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            对研究员提交的漏洞进行敏感级别判定、脱敏要求下发、发布或驳回
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 animate-stagger">
          <StatCard label="待审核" value={counts.pending} tone="neutral" icon={<Clock size={16} />} change="建议今日处理" />
          <StatCard label="待研究员脱敏" value={counts.desensitization} tone="warning" icon={<Eraser size={16} />} change={counts.desensitization > 0 ? `${counts.desensitization} 条阻塞中` : undefined} />
          <StatCard label="累计已发布" value={counts.verified} tone="positive" icon={<CheckCircle2 size={16} />} />
          <StatCard label="累计驳回" value={counts.rejected} tone="danger" icon={<XCircle size={16} />} />
        </div>

        <div className="card overflow-hidden mb-5">
          <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-white/5">
            {TABS.map((t) => {
              const Icon = t.icon;
              const count =
                t.key === 'all'
                  ? vulnerabilities.length
                  : t.key === VerificationStatus.PENDING
                  ? counts.pending
                  : t.key === VerificationStatus.DESENSITIZATION
                  ? counts.desensitization
                  : t.key === VerificationStatus.VERIFIED
                  ? counts.verified
                  : counts.rejected;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative inline-flex items-center gap-2 px-3.5 py-2 rounded-sm text-sm font-medium transition-all ${
                    active
                      ? `${t.color} bg-white/5`
                      : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                  <span
                    className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-cyber-teal/20 text-cyber-teal' : 'bg-white/5 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                  {active && (
                    <span className="absolute left-0 right-0 -bottom-[13px] h-[2px] bg-cyber-teal/60 animate-glow-pulse" />
                  )}
                </button>
              );
            })}
            <div className="ml-auto relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索编号 / 标题 / 提交人"
                className="pl-8 pr-3 py-1.5 w-64 text-xs bg-space-light/50 border border-white/5 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyber-teal/50 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="当前分类暂无条目"
              description="切换其他标签页或清空筛选条件查看更多提交。"
              icon={<FilterX size={28} className="text-gray-500" />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-space-light/30 text-[11px] uppercase tracking-wider text-gray-500">
                    <th className="text-left font-medium px-5 py-3">漏洞信息</th>
                    <th className="text-left font-medium px-3 py-3">提交人</th>
                    <th className="text-left font-medium px-3 py-3">敏感级别</th>
                    <th className="text-left font-medium px-3 py-3">状态</th>
                    <th className="text-left font-medium px-3 py-3">提交时间</th>
                    <th className="text-right font-medium px-5 py-3">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((v) => (
                    <tr
                      key={v.id}
                      className="border-t border-white/5 hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`mt-1 w-1 h-10 rounded-sm ${SENSITIVITY_META[v.sensitivityLevel].dotColor}`} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-space-light text-cyber-teal border border-cyber-teal/20">
                                {v.vulnCode}
                              </span>
                              {v.cveId && (
                                <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-300 border border-purple-500/20">
                                  {v.cveId}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-200 font-medium leading-snug truncate max-w-md group-hover:text-cyber-teal transition-colors">
                              {v.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-xs text-gray-300">{v.submitterName}</span>
                      </td>
                      <td className="px-3 py-4">
                        <SensitivityBadge level={v.sensitivityLevel} size="sm" />
                      </td>
                      <td className="px-3 py-4">
                        <StatusBadge status={v.verificationStatus} />
                      </td>
                      <td className="px-3 py-4">
                        <span className="text-[11px] text-gray-500 inline-flex items-center gap-1.5 whitespace-nowrap">
                          <MetaDot />
                          {new Date(v.submittedAt).toLocaleDateString('zh-CN')}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/vuln/${v.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-sm border border-white/10 text-gray-300 hover:text-cyber-teal hover:border-cyber-teal/40 transition-colors"
                          >
                            <Eye size={11} /> 详情
                          </Link>
                          {(v.verificationStatus === VerificationStatus.PENDING ||
                            v.verificationStatus === VerificationStatus.DESENSITIZATION) && (
                            <div className="flex items-center">
                              {REVIEW_ACTIONS.map((a) => (
                                <button
                                  key={a.key}
                                  onClick={() => openReview(v.id, a.key)}
                                  title={a.label}
                                  className={`inline-flex items-center justify-center w-7 h-7 rounded-sm border transition-colors ${
                                    a.tone === 'primary'
                                      ? 'border-cyber-teal/30 text-cyber-teal hover:bg-cyber-teal/10 hover:border-cyber-teal/60'
                                      : a.tone === 'warning'
                                      ? 'border-sens-internal/30 text-sens-internal hover:bg-sens-internal/10 hover:border-sens-internal/60'
                                      : 'border-sens-topsecret/30 text-sens-topsecret hover:bg-sens-topsecret/10 hover:border-sens-topsecret/60'
                                  }`}
                                >
                                  <a.icon size={11} />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {active && (
          <CardPreviewSummary v={active} />
        )}
      </div>

      <Modal
        open={!!activeId && !!reviewAction}
        onClose={() => {
          setActiveId(null);
          setReviewAction(null);
        }}
        title={
          REVIEW_ACTIONS.find((a) => a.key === reviewAction)?.label + '审核确认'
        }
        size="lg"
        footer={
          <>
            <button
              onClick={() => {
                setActiveId(null);
                setReviewAction(null);
              }}
              className="btn-ghost"
            >
              取消
            </button>
            <button
              onClick={confirm}
              disabled={
                (reviewAction === 'reject' || reviewAction === 'desensitize') &&
                reviewText.trim().length < 5
              }
              className={
                reviewAction === 'reject'
                  ? 'btn-danger'
                  : reviewAction === 'desensitize'
                  ? 'inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all bg-sens-internal text-deep-space font-semibold hover:bg-sens-internal/90 focus:ring-2 focus:ring-offset-2 focus:ring-offset-deep-space focus:ring-sens-internal disabled:opacity-50'
                  : 'btn-primary'
              }
            >
              {reviewAction === 'verify' ? (
                <><CheckCircle2 size={14} /> 通过并发布</>
              ) : reviewAction === 'desensitize' ? (
                <><Eraser size={14} /> 下发脱敏要求</>
              ) : (
                <><XCircle size={14} /> 驳回该提交</>
              )}
            </button>
          </>
        }
      >
        {active && reviewAction && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 p-4 rounded-sm bg-space-light/40 border border-white/5">
              <div className={`w-1 self-stretch rounded-sm ${SENSITIVITY_META[active.sensitivityLevel].dotColor}`} />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-space-light text-cyber-teal border border-cyber-teal/20">
                    {active.vulnCode}
                  </span>
                  {active.cveId && (
                    <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-300">
                      {active.cveId}
                    </span>
                  )}
                  <SensitivityBadge level={active.sensitivityLevel} size="sm" />
                  <StatusBadge status={active.verificationStatus} />
                </div>
                <div className="text-sm font-semibold text-gray-100">{active.title}</div>
                <div className="text-[11px] text-gray-500 mt-1">
                  提交人：{active.submitterName}
                </div>
              </div>
            </div>

            <div>
              <label className="label">
                {reviewAction === 'verify'
                  ? '确认敏感级别（可调整）'
                  : reviewAction === 'desensitize'
                  ? '脱敏要求（必须说明）'
                  : '驳回原因（必须填写）'}
              </label>
              {reviewAction === 'verify' ? (
                <div className="grid grid-cols-4 gap-2">
                  {([
                    SensitivityLevel.PUBLIC,
                    SensitivityLevel.INTERNAL,
                    SensitivityLevel.CONFIDENTIAL,
                    SensitivityLevel.TOP_SECRET,
                  ] as const).map((lvl) => {
                    const m = SENSITIVITY_META[lvl];
                    const selected = reviewLevel === lvl;
                    return (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setReviewLevel(lvl)}
                        className={`px-2 py-3 text-xs rounded-sm border transition-all flex flex-col items-center gap-1.5 ${
                          selected
                            ? `${m.bgColor} ${m.color} ${m.borderColor} font-semibold shadow-[0_0_14px_var(--tw-shadow-color)]`
                            : 'bg-space-light/30 text-gray-400 border-white/5 hover:text-gray-200'
                        }`}
                        style={
                          selected
                            ? ({ ['--tw-shadow-color' as any]: shadowForLevel(lvl) } as any)
                            : undefined
                        }
                      >
                        <span className={`w-2 h-2 rounded-full ${m.dotColor}`} />
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={5}
                  placeholder={
                    reviewAction === 'desensitize'
                      ? '请详细说明脱敏要求，例如：删除真实目标 IP、隐去厂商产品具体名称、去除完整 webshell 代码...'
                      : '请说明驳回原因，例如：重复提交、POC 不完整无法复现、资料质量不符合要求...'
                  }
                  className="input-field resize-none"
                />
              )}
              {(reviewAction === 'reject' || reviewAction === 'desensitize') && (
                <p className="text-[11px] text-gray-500 mt-1">
                  已输入 {reviewText.length} 字符（至少 5 个字符）
                </p>
              )}
            </div>

            {reviewAction === 'verify' && (
              <div className="rounded-sm border border-sens-internal/30 bg-sens-internal/5 p-4">
                <div className="flex items-start gap-2 text-xs">
                  <AlertTriangle size={14} className="text-sens-internal shrink-0 mt-0.5" />
                  <div className="text-gray-300 leading-relaxed">
                    确认发布后，条目将按照所选敏感级别分发给所有符合授权范围的用户。
                    公开级内容可被所有访客浏览（不含 POC 代码），请再次确认 POC 中不包含未脱敏的敏感信息。
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function CardPreviewSummary({ v }: { v: any }) {
  return (
    <div className="card p-6">
      <h3 className="text-sm font-semibold text-gray-200 mb-4 flex items-center gap-2">
        <Eye size={14} className="text-cyber-teal" />
        最近选中条目 POC 预览（{v.vulnCode}）
      </h3>
      <CodeBlock code={v.pocCode} collapsed />
      <div className="mt-4 text-right">
        <Link to={`/vuln/${v.id}`} className="btn-secondary !py-1.5 text-xs inline-flex">
          打开完整详情 <ChevronRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function shadowForLevel(lvl: SensitivityLevel) {
  const map: Record<SensitivityLevel, string> = {
    [SensitivityLevel.PUBLIC]: 'rgba(34,197,94,0.4)',
    [SensitivityLevel.INTERNAL]: 'rgba(234,179,8,0.4)',
    [SensitivityLevel.CONFIDENTIAL]: 'rgba(249,115,22,0.4)',
    [SensitivityLevel.TOP_SECRET]: 'rgba(239,68,68,0.4)',
  };
  return map[lvl];
}
