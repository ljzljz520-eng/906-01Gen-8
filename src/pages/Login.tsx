import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldHalf,
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  Globe2,
  ArrowRight,
  UserCog,
  UserCheck2,
  Code2,
  EyeOff,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole, SensitivityLevel } from '@/types';
import { ROLE_META, SENSITIVITY_META } from '@/utils/sensitivity';

const ROLE_CARDS: Array<{
  role: UserRole;
  icon: any;
  tone: string;
  title: string;
  desc: string;
  sampleUsername: string;
  permissions: string[];
}> = [
  {
    role: UserRole.GUEST,
    icon: Globe2,
    tone: 'from-gray-500 to-gray-700',
    title: '匿名访客',
    desc: '浏览公开漏洞列表与概要信息',
    sampleUsername: 'guest',
    permissions: ['浏览公开漏洞列表', '查看免责声明', '查看概要信息'],
  },
  {
    role: UserRole.RESEARCHER,
    icon: Code2,
    tone: 'from-cyan-500 to-blue-700',
    title: '安全研究员',
    desc: '可提交漏洞、管理本人提交记录',
    sampleUsername: 'researcher',
    permissions: ['提交漏洞 POC', '查看本人记录', '响应脱敏要求', '公开 + 内部 级可见'],
  },
  {
    role: UserRole.AUTHORIZED,
    icon: UserCheck2,
    tone: 'from-purple-500 to-fuchsia-700',
    title: '授权安全人员',
    desc: '全级别查阅权限',
    sampleUsername: 'authorized',
    permissions: ['浏览完整漏洞库', '查看所有级别 POC', '下载 PoC 代码', '应急响应场景'],
  },
  {
    role: UserRole.ADMIN,
    icon: UserCog,
    tone: 'from-red-500 to-orange-600',
    title: '平台管理员',
    desc: '审核发布、脱敏管理、用户授权',
    sampleUsername: 'admin',
    permissions: ['漏洞审核发布', '判定敏感级别', '下发脱敏要求', '管理用户授权'],
  },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const { login, currentUser, initStore } = useAppStore();
  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    initStore();
    if (currentUser) navigate(from, { replace: true });
  }, [initStore, currentUser, navigate, from]);

  const handleLogin = (role: UserRole) => {
    login(role);
    setTimeout(() => navigate(from, { replace: true }), 250);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(0, 212, 170, 0.12), transparent), radial-gradient(ellipse 50% 40% at 70% 80%, rgba(168, 85, 247, 0.1), transparent)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative w-full max-w-5xl z-10 animate-stagger-in">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-3 group mb-5">
            <div className="relative">
              <div className="absolute inset-0 bg-cyber-teal/40 blur-md rounded-full group-hover:bg-cyber-teal/60 transition-all" />
              <div className="relative w-12 h-12 rounded-sm bg-gradient-to-br from-cyber-teal to-cyan-600 flex items-center justify-center shadow-cyber-glow-60">
                <ShieldHalf size={26} className="text-deep-space" strokeWidth={2.5} />
              </div>
            </div>
            <div className="text-left">
              <div className="font-mono-display font-bold text-2xl text-gradient">SecureVault</div>
              <div className="text-[11px] text-gray-500 uppercase tracking-[0.2em]">
                POC Security Repository
              </div>
            </div>
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3">
            选择身份登录 <span className="text-cyber-teal">体验不同视角</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-lg mx-auto">
            为演示完整功能，平台预设四种角色。点击下方卡片即可切换身份，
            体验漏洞收录、审核发布、分级管控等全流程。
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-stagger">
          {ROLE_CARDS.map((card) => {
            const Icon = card.icon;
            const meta = ROLE_META[card.role];
            return (
              <button
                key={card.role}
                onClick={() => handleLogin(card.role)}
                className="group text-left card-hoverable flex flex-col transition-all duration-300"
              >
                <div className="relative h-28 overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.tone} opacity-90`} />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <Icon size={32} strokeWidth={2} className="drop-shadow-lg" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm bg-black/30 backdrop-blur-sm text-[10px] ${meta.color} font-medium border border-white/20`}>
                      {meta.label}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-100">{card.title}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{card.desc}</div>
                    </div>
                  </div>

                  <div className="mt-3 mb-4 space-y-1.5">
                    {card.permissions.map((p, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[11px] text-gray-400">
                        <span className="mt-1 w-1 h-1 rounded-full bg-cyber-teal/70 shrink-0" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>

                  {card.role !== UserRole.GUEST && (
                    <div className="mt-auto pt-3 border-t border-white/5">
                      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                        演示账号
                      </div>
                      <div className="font-mono-code text-xs text-cyber-teal/90">
                        {card.sampleUsername}
                      </div>
                    </div>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-white/5">
                    <span className="text-xs font-semibold text-gray-300 group-hover:text-cyber-teal transition-colors">
                      以此身份登录
                    </span>
                    <ArrowRight
                      size={16}
                      className="text-gray-500 group-hover:text-cyber-teal group-hover:translate-x-1 transition-all"
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
              <ShieldCheck size={14} className="text-cyber-teal" />
              建议体验流程
            </h3>
            <ol className="space-y-2 text-xs text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 shrink-0 rounded-full bg-cyber-teal/15 border border-cyber-teal/40 text-cyber-teal text-[10px] font-bold flex items-center justify-center mt-0.5">1</span>
                <span>以<span className="text-cyan-400 mx-1">研究员</span>身份前往「提交」页面填写漏洞表单，观察实时敏感级别分析</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 shrink-0 rounded-full bg-cyber-teal/15 border border-cyber-teal/40 text-cyber-teal text-[10px] font-bold flex items-center justify-center mt-0.5">2</span>
                <span>切换为<span className="text-sens-topsecret mx-1">管理员</span>进入「审核台」：调整敏感级别、下发脱敏要求</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-4 h-4 shrink-0 rounded-full bg-cyber-teal/15 border border-cyber-teal/40 text-cyber-teal text-[10px] font-bold flex items-center justify-center mt-0.5">3</span>
                <span>切换<span className="text-purple-400 mx-1">授权人员/访客</span>浏览漏洞详情，查看敏感级别权限拦截效果</span>
              </li>
            </ol>
          </div>

          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-100 mb-3 flex items-center gap-2">
              <LockKeyhole size={14} className="text-sens-internal" />
              敏感级别分级管控
            </h3>
            <div className="space-y-2">
              {[
                SensitivityLevel.PUBLIC,
                SensitivityLevel.INTERNAL,
                SensitivityLevel.CONFIDENTIAL,
                SensitivityLevel.TOP_SECRET,
              ].map((lvl) => {
                const m = SENSITIVITY_META[lvl];
                return (
                  <div
                    key={lvl}
                    className="flex items-center gap-3 px-3 py-2 rounded-sm border border-white/5 bg-space-light/30"
                  >
                    <span className={`w-1 h-8 rounded-sm ${m.dotColor}`} />
                    <span className={`text-xs font-semibold ${m.color} min-w-[50px]`}>
                      {m.label}
                    </span>
                    <span className="text-[11px] text-gray-500 flex-1">
                      {lvl === SensitivityLevel.PUBLIC && '所有用户可见，POC 需登录'}
                      {lvl === SensitivityLevel.INTERNAL && '研究员及以上身份可查看'}
                      {lvl === SensitivityLevel.CONFIDENTIAL && '授权安全人员或管理员可查阅'}
                      {lvl === SensitivityLevel.TOP_SECRET && <span className="inline-flex items-center gap-1"><EyeOff size={10} /> 绝密级，严格管控</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
