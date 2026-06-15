import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCog,
  ShieldCheck,
  Send,
  FileText,
  Calendar,
  Upload,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  KeyRound,
  LogOut,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { SensitivityBadge, StatusBadge, RoleBadge } from '@/components/Badges';
import { Modal } from '@/components/Common';
import { SensitivityLevel, VerificationStatus, UserRole } from '@/types';
import { SENSITIVITY_META, ROLE_META } from '@/utils/sensitivity';

export default function Profile() {
  const navigate = useNavigate();
  const { currentUser, getUserVulns, logout, initStore } = useAppStore();
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestedLevel, setRequestedLevel] = useState<SensitivityLevel | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useState(() => initStore());

  if (!currentUser || currentUser.role === UserRole.GUEST) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <UserCog size={48} className="mx-auto text-gray-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-100 mb-2">请先登录</h2>
        <p className="text-gray-500 mb-6">个人中心仅登录用户可访问</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          前往登录
        </button>
      </div>
    );
  }

  const myVulns = getUserVulns();
  const authorizedScope = currentUser.authorizedScope ?? [SensitivityLevel.PUBLIC];

  const statusCounts = {
    pending: myVulns.filter((v) =>
      [VerificationStatus.PENDING, VerificationStatus.DESENSITIZATION].includes(
        v.verificationStatus
      )
    ).length,
    verified: myVulns.filter((v) => v.verificationStatus === VerificationStatus.VERIFIED).length,
    rejected: myVulns.filter((v) => v.verificationStatus === VerificationStatus.REJECTED).length,
  };

  const levels = Object.values(SensitivityLevel);

  const handleSubmitRequest = () => {
    setSubmitted(true);
    setTimeout(() => {
      setRequestOpen(false);
      setRequestedLevel(null);
      setRequestReason('');
      setSubmitted(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 xl:px-6 py-8">
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">
          <aside className="space-y-5 self-start">
            <div className="card overflow-hidden">
              <div className="h-24 bg-gradient-to-br from-cyber-teal/30 via-space-light to-transparent" />
              <div className="px-5 pb-5 -mt-10 relative">
                <div className="w-20 h-20 rounded-sm bg-gradient-to-br from-cyber-teal to-cyan-700 border-4 border-space-gray flex items-center justify-center shadow-cyber-glow-30 mb-4">
                  <UserCog size={32} className="text-deep-space" strokeWidth={2.2} />
                </div>
                <div className="mb-1">
                  <span className="text-lg font-semibold text-gray-100">
                    {currentUser.displayName.split('·')[0].trim()}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <RoleBadge role={currentUser.role} />
                </div>
                <div className="text-xs text-gray-500 space-y-0.5">
                  <div>📧 {currentUser.email}</div>
                  <div>
                    📅 加入于 {new Date(currentUser.createdAt).toLocaleDateString('zh-CN')}
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="mt-4 btn-ghost !w-full !justify-start border border-white/5 hover:border-sens-topsecret/40 hover:text-sens-topsecret"
                >
                  <LogOut size={14} /> 退出登录
                </button>
              </div>
            </div>

            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck size={14} className="text-cyber-teal" />
                <h3 className="text-sm font-semibold text-gray-100">授权范围</h3>
              </div>
              <ul className="space-y-2">
                {levels.map((lvl) => {
                  const m = SENSITIVITY_META[lvl];
                  const access = authorizedScope.includes(lvl);
                  return (
                    <li
                      key={lvl}
                      className={`flex items-center gap-3 px-3 py-2 rounded-sm border ${
                        access
                          ? `${m.bgColor} ${m.borderColor}`
                          : 'bg-space-light/30 border-white/5 opacity-60'
                      }`}
                    >
                      <span className={`w-1 h-6 rounded-sm ${m.dotColor}`} />
                      <span className={`text-xs font-medium flex-1 ${m.color}`}>
                        {m.label}
                      </span>
                      {access ? (
                        <CheckCircle2 size={14} className="text-sens-public" />
                      ) : (
                        <button
                          onClick={() => {
                            setRequestedLevel(lvl);
                            setRequestOpen(true);
                          }}
                          className="text-[11px] text-cyber-teal hover:underline"
                        >
                          申请
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 text-[11px] text-gray-500 leading-relaxed">
                未授权级别需提交申请，由管理员根据身份背景、安全资质与业务需要审批。
              </p>
            </div>
          </aside>

          <main className="space-y-6">
            <section className="card p-6">
              <h2 className="text-base font-semibold text-gray-100 mb-4 flex items-center gap-2">
                <FileText size={16} className="text-cyber-teal" />
                我的提交统计
              </h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-space-light/40 rounded-sm p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">已提交</span>
                    <Upload size={14} className="text-cyber-teal" />
                  </div>
                  <div className="text-2xl font-bold font-mono-display text-gray-100">{myVulns.length}</div>
                </div>
                <div className="bg-space-light/40 rounded-sm p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">通过发布</span>
                    <CheckCircle2 size={14} className="text-sens-public" />
                  </div>
                  <div className="text-2xl font-bold font-mono-display text-sens-public">{statusCounts.verified}</div>
                </div>
                <div className="bg-space-light/40 rounded-sm p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] uppercase tracking-wider text-gray-500">处理中</span>
                    <Clock size={14} className="text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono-display text-blue-400">{statusCounts.pending}</div>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
                  <Calendar size={16} className="text-cyber-teal" />
                  我提交的漏洞
                </h2>
                <Link to="/submit" className="btn-secondary !py-1.5 text-xs">
                  <Upload size={12} /> 继续提交
                </Link>
              </div>

              {myVulns.length === 0 ? (
                <div className="card p-12 text-center">
                  <FileText size={36} className="mx-auto text-gray-600 mb-3" />
                  <p className="text-gray-400 text-sm mb-2">暂无提交记录</p>
                  <p className="text-gray-500 text-xs">点击右上角按钮提交第一条漏洞 POC</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myVulns.map((v) => (
                    <div
                      key={v.id}
                      className="card hover:border-cyber-teal/20 transition-colors overflow-hidden"
                    >
                      <div className="flex items-stretch">
                        <SensitivityBadge level={v.sensitivityLevel} asBar />
                        <div className="flex-1 p-4 flex items-center gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-space-light text-cyber-teal border border-cyber-teal/20">
                                {v.vulnCode}
                              </span>
                              {v.cveId && (
                                <span className="font-mono-code text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-300">
                                  {v.cveId}
                                </span>
                              )}
                              <SensitivityBadge level={v.sensitivityLevel} size="sm" showIcon={false} />
                              <StatusBadge status={v.verificationStatus} />
                            </div>
                            <div className="text-sm font-medium text-gray-200 truncate">
                              {v.title}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                              {new Date(v.submittedAt).toLocaleString('zh-CN')}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {v.verificationStatus === VerificationStatus.REJECTED && v.rejectReason && (
                              <div className="flex items-start gap-1.5 max-w-xs text-[11px] text-sens-topsecret bg-sens-topsecret/10 border border-sens-topsecret/30 rounded-sm p-2">
                                <XCircle size={11} className="mt-0.5 shrink-0" />
                                <span className="line-clamp-2">{v.rejectReason}</span>
                              </div>
                            )}
                            {v.verificationStatus === VerificationStatus.DESENSITIZATION && v.desensitizationRequest && (
                              <div className="flex items-start gap-1.5 max-w-xs text-[11px] text-sens-internal bg-sens-internal/10 border border-sens-internal/30 rounded-sm p-2">
                                <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                                <span className="line-clamp-2">
                                  需要脱敏: {v.desensitizationRequest.slice(0, 60)}
                                </span>
                              </div>
                            )}
                            <Link
                              to={`/vuln/${v.id}`}
                              className="inline-flex items-center gap-1 text-[11px] text-cyber-teal hover:underline"
                            >
                              <Eye size={11} /> 查看详情
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {currentUser.role !== UserRole.ADMIN && (
              <section className="card p-6 border-cyber-teal/20 bg-cyber-teal/[0.03]">
                <h2 className="text-base font-semibold text-gray-100 mb-3 flex items-center gap-2">
                  <KeyRound size={16} className="text-cyber-teal" />
                  申请更高授权级别
                </h2>
                <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                  如因业务需要（应急响应、红队演练、合规审计等）查阅更高级别漏洞资料，
                  请提交说明并等待管理员审批。一般 1-2 个工作日内反馈。
                </p>
                <div className="flex flex-wrap gap-2">
                  {levels
                    .filter((l) => !authorizedScope.includes(l))
                    .map((lvl) => {
                      const m = SENSITIVITY_META[lvl];
                      return (
                        <button
                          key={lvl}
                          onClick={() => {
                            setRequestedLevel(lvl);
                            setRequestOpen(true);
                          }}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm border transition-all ${m.bgColor} ${m.color} ${m.borderColor} hover:shadow-md`}
                        >
                          <Send size={11} /> 申请 {m.label} 权限
                        </button>
                      );
                    })}
                  {levels.filter((l) => !authorizedScope.includes(l)).length === 0 && (
                    <span className="text-xs text-sens-public flex items-center gap-1.5">
                      <CheckCircle2 size={12} /> 您已拥有最高授权范围
                    </span>
                  )}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>

      <Modal
        open={requestOpen}
        onClose={() => {
          setRequestOpen(false);
          setRequestedLevel(null);
        }}
        title="授权申请"
        size="md"
        footer={
          submitted ? undefined : (
            <>
              <button
                onClick={() => {
                  setRequestOpen(false);
                  setRequestedLevel(null);
                }}
                className="btn-ghost"
              >
                取消
              </button>
              <button
                onClick={handleSubmitRequest}
                disabled={requestReason.trim().length < 10}
                className="btn-primary"
              >
                <Send size={14} /> 提交申请
              </button>
            </>
          )
        }
      >
        {submitted ? (
          <div className="py-8 text-center">
            <CheckCircle2 size={40} className="mx-auto text-sens-public mb-4" />
            <h3 className="text-base font-semibold text-gray-100 mb-1">申请已提交</h3>
            <p className="text-sm text-gray-500">管理员将在 1-2 个工作日内完成审批</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-sm border ${requestedLevel ? SENSITIVITY_META[requestedLevel].bgColor + ' ' + SENSITIVITY_META[requestedLevel].borderColor : ''}`}>
              {requestedLevel && <SensitivityBadge level={requestedLevel} size="md" />}
              <span className={`text-sm ${requestedLevel ? SENSITIVITY_META[requestedLevel].color : ''}`}>
                级别访问申请
              </span>
            </div>
            <div>
              <label className="label">申请理由 *</label>
              <textarea
                rows={5}
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="请详细说明：1. 所属单位/部门 2. 业务场景与需求 3. 过往安全资质证明..."
                className="input-field resize-none"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                已输入 {requestReason.length} 字符（建议不少于 10 字）
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
