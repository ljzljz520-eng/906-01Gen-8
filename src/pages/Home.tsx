import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldPlus,
  Database,
  UserCheck2,
  AlertOctagon,
  BarChart3,
  UploadCloud,
  FileSearch2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { VulnCard } from '@/components/VulnCard';
import { FilterPanel } from '@/components/FilterPanel';
import { DisclaimerBar, BottomDisclaimerBar } from '@/components/DisclaimerBar';
import { EmptyState, StatCard } from '@/components/Common';
import { SensitivityLevel, VerificationStatus, UserRole } from '@/types';
import { SENSITIVITY_META } from '@/utils/sensitivity';

export default function Home() {
  const { initStore, getFilteredVulns, vulnerabilities, currentUser, canSubmit } =
    useAppStore();
  const filtered = getFilteredVulns();

  useEffect(() => {
    initStore();
  }, [initStore]);

  const stats = useMemo(() => {
    const authorizedScope = currentUser?.authorizedScope ?? [SensitivityLevel.PUBLIC];
    const visible = vulnerabilities.filter((v) => authorizedScope.includes(v.sensitivityLevel));
    const counts = {
      total: visible.length,
      verified: visible.filter((v) => v.verificationStatus === VerificationStatus.VERIFIED).length,
      pending: visible.filter((v) =>
        [VerificationStatus.PENDING, VerificationStatus.DESENSITIZATION].includes(
          v.verificationStatus
        )
      ).length,
      topSecret: visible.filter((v) => v.sensitivityLevel === SensitivityLevel.TOP_SECRET).length,
    };
    return counts;
  }, [vulnerabilities, currentUser]);

  return (
    <div className="min-h-screen pb-20">
      <DisclaimerBar />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyber-teal/5 via-transparent to-transparent pointer-events-none" />
        <div
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 170, 0.15), transparent)',
          }}
        />
        <div className="container mx-auto px-4 xl:px-6 py-12 relative">
          <div className="grid md:grid-cols-[1.3fr_1fr] gap-10 items-center">
            <div className="animate-stagger space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-teal/20 bg-cyber-teal/5 text-[11px] text-cyber-teal font-medium">
                <FileSearch2 size={12} />
                SecureVault POC 知识库 · v2.4
              </div>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight font-mono-display">
                <span className="block text-gray-100">安全漏洞</span>
                <span className="block text-gradient">PoC 验证与收录中心</span>
              </h1>
              <p className="text-sm md:text-base text-gray-400 max-w-xl leading-relaxed">
                面向安全研究员、授权渗透人员的规范化漏洞知识平台。
                覆盖 CVE 编号、影响版本、复现条件、修复建议与验证代码，
                <span className="text-cyber-teal">敏感级别分级管控</span>，
                确保合规分发与最小权限访问。
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/submit" className={canSubmit() ? 'btn-primary' : 'btn-primary pointer-events-none opacity-60'}>
                  <UploadCloud size={16} />
                  {canSubmit() ? '提交漏洞 PoC' : '登录后提交'}
                </Link>
                <a href="#list" className="btn-secondary">
                  <BarChart3 size={16} /> 浏览漏洞库
                </a>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sens-public" />
                  公开级条目 {vulnerabilities.filter(v => v.sensitivityLevel === SensitivityLevel.PUBLIC).length}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sens-internal" />
                  内部级 {vulnerabilities.filter(v => v.sensitivityLevel === SensitivityLevel.INTERNAL).length}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sens-confidential" />
                  机密级 {vulnerabilities.filter(v => v.sensitivityLevel === SensitivityLevel.CONFIDENTIAL).length}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sens-topsecret" />
                  绝密级 {vulnerabilities.filter(v => v.sensitivityLevel === SensitivityLevel.TOP_SECRET).length}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 animate-stagger">
              <StatCard
                label="可见条目"
                value={stats.total}
                tone="neutral"
                icon={<Database size={16} />}
                change={`覆盖 ${Object.values(SensitivityLevel).filter(s => currentUser?.authorizedScope?.includes(s)).length || 1} 个敏感级别`}
              />
              <StatCard
                label="已验证发布"
                value={stats.verified}
                tone="positive"
                icon={<UserCheck2 size={16} />}
                change={stats.total > 0 ? `验证通过率 ${Math.round((stats.verified / stats.total) * 100)}%` : ''}
              />
              <StatCard
                label="审核中"
                value={stats.pending}
                tone="warning"
                icon={<ShieldPlus size={16} />}
                change={currentUser?.role === UserRole.ADMIN ? '前往审核工作台处理' : '由管理员审核发布'}
              />
              <StatCard
                label="绝密条目"
                value={stats.topSecret}
                tone="danger"
                icon={<AlertOctagon size={16} />}
                change={stats.topSecret > 0 && !currentUser?.authorizedScope?.includes(SensitivityLevel.TOP_SECRET) ? '需 TOP 级授权可见' : undefined}
              />
            </div>
          </div>
        </div>
      </section>

      <div id="list" className="container mx-auto px-4 xl:px-6 pb-16">
        <div className="grid xl:grid-cols-[300px_1fr] gap-6">
          <aside className="space-y-4">
            <FilterPanel />
            <div className="card p-4 space-y-3">
              <div className="text-sm font-semibold text-gray-200">敏感级别说明</div>
              <ul className="space-y-2 text-xs">
                {Object.values(SensitivityLevel).map((lvl) => {
                  const m = SENSITIVITY_META[lvl];
                  const access = currentUser?.authorizedScope?.includes(lvl);
                  return (
                    <li
                      key={lvl}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-sm border ${
                        access ? 'border-white/10 bg-white/5' : 'border-white/5 opacity-50'
                      }`}
                    >
                      <span className={`w-1 h-5 rounded-sm ${m.dotColor}`} />
                      <span className={`font-medium ${m.color}`}>{m.label}</span>
                      <span className="text-gray-500 ml-auto">
                        {access ? '已授权' : '无权限'}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          <main>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                  <Database size={18} className="text-cyber-teal" />
                  漏洞列表
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  共 {filtered.length} 条符合条件的记录
                </p>
              </div>
            </div>

            {filtered.length === 0 ? (
              <EmptyState
                title="暂无匹配的漏洞条目"
                description="请调整筛选条件，或与研究员联系提交新的漏洞资料。"
                icon={<FileSearch2 size={28} className="text-gray-500" />}
              />
            ) : (
              <div className="grid md:grid-cols-2 xxl:grid-cols-3 gap-4 animate-stagger">
                {filtered.map((vuln, i) => (
                  <VulnCard key={vuln.id} vuln={vuln} index={i} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <BottomDisclaimerBar />
    </div>
  );
}
