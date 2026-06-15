import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  UserCheck2,
  AlertCircle,
  Tag,
  Eraser,
  Save,
  Eye,
  GitBranch,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SensitivityBadge, StatusBadge } from '@/components/Badges';
import { CodeBlock } from '@/components/CodeBlock';
import { Timeline } from '@/components/Timeline';
import { BottomDisclaimerBar } from '@/components/DisclaimerBar';
import { PermissionGate } from '@/components/PermissionGate';
import { Modal } from '@/components/Common';
import { SensitivityLevel, UserRole } from '@/types';
import { SENSITIVITY_META } from '@/utils/sensitivity';

export default function VulnDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vulnerabilities, currentUser, submitDesensitized, canAccessReview, reviewVulnerability } =
    useAppStore();
  const [desensitizeOpen, setDesensitizeOpen] = useState(false);
  const [desensitizedCode, setDesensitizedCode] = useState('');
  const [viewMode, setViewMode] = useState<'original' | 'desensitized'>('desensitized');

  const vuln = vulnerabilities.find((v) => v.id === id);

  if (!vuln) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-semibold text-gray-200 mb-2">未找到该漏洞条目</h2>
        <p className="text-gray-500 mb-6">编号不存在、已被删除或您无权访问</p>
        <Link to="/" className="btn-secondary">
          <ArrowLeft size={16} /> 返回漏洞库
        </Link>
      </div>
    );
  }

  const isOwner = currentUser?.id === vuln.submitterId;
  const needDesensitize =
    vuln.verificationStatus === 'desensitization' && isOwner;
  const isAdmin = canAccessReview();
  const showDesensitizedToggle = !!vuln.pocCodeDesensitized;

  const handleSubmitDesensitized = () => {
    if (!desensitizedCode.trim()) return;
    submitDesensitized(vuln.id, desensitizedCode);
    setDesensitizeOpen(false);
    setDesensitizedCode('');
  };

  const quickPublish = () => {
    reviewVulnerability(vuln.id, 'verify', { level: vuln.sensitivityLevel });
  };

  const submittedDate = new Date(vuln.submittedAt);

  return (
    <div className="min-h-screen pb-28">
      <div className="container mx-auto px-4 xl:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost mb-5 !px-2 text-gray-400 text-sm"
        >
          <ArrowLeft size={16} /> 返回列表
        </button>

        <div className={`${SENSITIVITY_META[vuln.sensitivityLevel].dotColor} rounded-t-sm h-1.5`} />
        <div className="card rounded-t-none">
          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div className="space-y-3 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono-code text-[11px] px-2 py-1 rounded-sm bg-space-light text-cyber-teal border border-cyber-teal/20">
                    {vuln.vulnCode}
                  </span>
                  {vuln.cveId && (
                    <a
                      href={`https://nvd.nist.gov/vuln/detail/${vuln.cveId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono-code text-[11px] px-2 py-1 rounded-sm bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                    >
                      {vuln.cveId} ↗
                    </a>
                  )}
                  <SensitivityBadge level={vuln.sensitivityLevel} size="md" />
                  <StatusBadge status={vuln.verificationStatus} />
                </div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-100 leading-snug">
                  {vuln.title}
                </h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar size={12} />
                    提交于 {submittedDate.toLocaleDateString('zh-CN')}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <User size={12} />
                    提交人 {vuln.submitterName}
                  </span>
                  {vuln.reviewerName && (
                    <span className="inline-flex items-center gap-1.5">
                      <UserCheck2 size={12} />
                      审核 {vuln.reviewerName}
                    </span>
                  )}
                  {vuln.reviewedAt && (
                    <span className="inline-flex items-center gap-1.5">
                      <GitBranch size={12} />
                      审核于 {new Date(vuln.reviewedAt).toLocaleDateString('zh-CN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {needDesensitize && (
                  <button
                    onClick={() => {
                      setDesensitizedCode(vuln.pocCodeDesensitized ?? vuln.pocCode);
                      setDesensitizeOpen(true);
                    }}
                    className="btn-danger"
                  >
                    <Eraser size={16} /> 提交脱敏代码
                  </button>
                )}
                {isAdmin && vuln.verificationStatus === 'pending' && (
                  <Link to="/review" className="btn-secondary">
                    <Eye size={16} /> 去审核
                  </Link>
                )}
                {isAdmin &&
                  (vuln.verificationStatus === 'pending' ||
                    vuln.verificationStatus === 'desensitization') && (
                    <button onClick={quickPublish} className="btn-primary">
                      <Save size={16} /> 快速通过
                    </button>
                  )}
              </div>
            </div>

            {vuln.verificationStatus === 'rejected' && vuln.rejectReason && (
              <div className="bg-sens-topsecret/10 border border-sens-topsecret/30 rounded-sm p-4 mb-6 flex items-start gap-3">
                <AlertCircle size={18} className="text-sens-topsecret shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-sens-topsecret mb-1">
                    该条目已被驳回
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{vuln.rejectReason}</p>
                </div>
              </div>
            )}

            {vuln.desensitizationRequest &&
              vuln.verificationStatus === 'desensitization' && (
                <div className="bg-sens-internal/10 border border-sens-internal/30 rounded-sm p-4 mb-6 flex items-start gap-3">
                  <Eraser size={18} className="text-sens-internal shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-sens-internal mb-1">
                      管理员脱敏要求
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {vuln.desensitizationRequest}
                    </p>
                  </div>
                </div>
              )}

            <div className="grid lg:grid-cols-[1fr_320px] gap-8">
              <div className="space-y-8">
                <Section title="漏洞概要" index={1}>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {vuln.description}
                  </p>
                </Section>

                <Section title="影响版本" index={2}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium pb-2 pr-4">
                            厂商
                          </th>
                          <th className="text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium pb-2 pr-4">
                            产品
                          </th>
                          <th className="text-left text-[11px] uppercase tracking-wider text-gray-500 font-medium pb-2">
                            影响版本范围
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {vuln.affectedVersions.map((av, i) => (
                          <tr key={i} className="border-b border-white/5 last:border-0">
                            <td className="py-2.5 pr-4 text-gray-300">
                              <span className="inline-flex items-center gap-1.5">
                                <Tag size={11} className="text-cyber-teal/60" />
                                {av.vendor}
                              </span>
                            </td>
                            <td className="py-2.5 pr-4 text-gray-200 font-medium">
                              {av.product}
                            </td>
                            <td className="py-2.5">
                              <span className="inline-block px-2 py-0.5 rounded-sm bg-space-light font-mono-code text-[11px] text-gray-300 border border-white/5">
                                {av.versionRange}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section title="复现条件" index={3}>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-space-light/30 border border-white/5 rounded-sm p-4">
                    {vuln.reproductionConditions}
                  </div>
                </Section>

                <Section title="修复建议" index={4}>
                  <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap bg-sens-public/5 border border-sens-public/20 rounded-sm p-4">
                    {vuln.repairSuggestion}
                  </div>
                </Section>

                <Section
                  title="POC 验证代码"
                  index={5}
                  action={
                    showDesensitizedToggle ? (
                      <div className="flex rounded-sm border border-white/10 overflow-hidden text-[11px]">
                        <button
                          onClick={() => setViewMode('desensitized')}
                          className={`px-3 py-1 transition-colors ${
                            viewMode === 'desensitized'
                              ? 'bg-cyber-teal/15 text-cyber-teal'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          脱敏发布版
                        </button>
                        <button
                          onClick={() => setViewMode('original')}
                          className={`px-3 py-1 transition-colors ${
                            viewMode === 'original'
                              ? 'bg-cyber-teal/15 text-cyber-teal'
                              : 'text-gray-400 hover:text-gray-200'
                          }`}
                        >
                          原始提交版
                        </button>
                      </div>
                    ) : null
                  }
                >
                  <PermissionGate level={vuln.sensitivityLevel}>
                    {showDesensitizedToggle && viewMode === 'desensitized' && vuln.pocCodeDesensitized ? (
                      <CodeBlock code={vuln.pocCodeDesensitized} filename="poc_desensitized.py" maxHeight={520} />
                    ) : (
                      <CodeBlock code={vuln.pocCode} filename="poc.py" maxHeight={520} />
                    )}
                  </PermissionGate>
                </Section>
              </div>

              <aside className="space-y-6">
                <div className="card p-5">
                  <h3 className="text-sm font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <GitBranch size={14} className="text-cyber-teal" />
                    审核时间线
                  </h3>
                  <Timeline events={vuln.timeline} />
                </div>

                {vuln.sensitivityLevel !== SensitivityLevel.PUBLIC && (
                  <div className="card p-5 border-white/5">
                    <h3 className="text-sm font-semibold text-gray-100 mb-3">访问级别说明</h3>
                    <div className={`flex items-center gap-3 p-3 rounded-sm ${SENSITIVITY_META[vuln.sensitivityLevel].bgColor} border ${SENSITIVITY_META[vuln.sensitivityLevel].borderColor}`}>
                      <SensitivityBadge level={vuln.sensitivityLevel} size="lg" />
                    </div>
                    <ul className="mt-4 space-y-2 text-xs text-gray-400">
                      <li className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1 h-1 rounded-full ${SENSITIVITY_META[vuln.sensitivityLevel].dotColor}`} />
                        仅限 SecureVault {SENSITIVITY_META[vuln.sensitivityLevel].label} 及以上授权人员查阅
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1 h-1 rounded-full ${SENSITIVITY_META[vuln.sensitivityLevel].dotColor}`} />
                        严禁转发、截图、外发相关 POC 代码
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1 h-1 rounded-full ${SENSITIVITY_META[vuln.sensitivityLevel].dotColor}`} />
                        仅限在授权测试环境复现验证
                      </li>
                    </ul>
                  </div>
                )}

                {vuln.verificationStatus === 'verified' && (
                  <div className="card p-5 border-sens-public/20 bg-sens-public/5">
                    <div className="flex items-center gap-2 text-sens-public text-sm font-semibold mb-2">
                      <UserCheck2 size={14} /> 已验证发布
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      该 POC 已由平台审核团队通过独立环境复现验证，修复建议由安全专家组复核。
                      如有更新版本会同步发布至本条目。
                    </p>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      </div>

      <Modal
        open={desensitizeOpen}
        onClose={() => setDesensitizeOpen(false)}
        title="提交脱敏后 POC 代码"
        size="lg"
        footer={
          <>
            <button onClick={() => setDesensitizeOpen(false)} className="btn-ghost">
              取消
            </button>
            <button
              onClick={handleSubmitDesensitized}
              disabled={!desensitizedCode.trim()}
              className="btn-primary"
            >
              <Save size={16} /> 提交重新审核
            </button>
          </>
        }
      >
        {vuln.desensitizationRequest && (
          <div className="bg-sens-internal/10 border border-sens-internal/30 rounded-sm p-3 mb-4">
            <div className="text-xs font-semibold text-sens-internal mb-1 flex items-center gap-1.5">
              <Eraser size={12} /> 脱敏要求回顾
            </div>
            <p className="text-xs text-gray-300 whitespace-pre-wrap">{vuln.desensitizationRequest}</p>
          </div>
        )}
        <label className="label">编辑脱敏后 POC（可删除敏感 IP、域名、账号信息）</label>
        <textarea
          value={desensitizedCode}
          onChange={(e) => setDesensitizedCode(e.target.value)}
          className="w-full h-[420px] font-mono-code text-xs p-3 bg-[#1a1a1a] border border-white/10 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyber-teal text-gray-200"
          spellCheck={false}
        />
        <p className="text-[11px] text-gray-500 mt-2">
          字符数：{desensitizedCode.length} · 按要求完成脱敏后，条目会重新进入待审核队列。
        </p>
      </Modal>

      <BottomDisclaimerBar />
    </div>
  );
}

function Section({
  title,
  index,
  action,
  children,
}: {
  title: string;
  index: number;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-stagger-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-100 flex items-center gap-2">
          <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20">
            0{index}
          </span>
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
