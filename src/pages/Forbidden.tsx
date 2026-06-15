import { Link } from 'react-router-dom';
import { ShieldAlert, Home, ArrowLeft, LockKeyhole, UserCheck2 } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

export default function Forbidden() {
  const { currentUser } = useAppStore();
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(239, 68, 68, 0.08), transparent)',
          }}
        />
      </div>
      <div className="relative z-10 max-w-xl w-full text-center animate-stagger-in">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute inset-0 bg-sens-topsecret/20 blur-2xl rounded-full" />
          <div className="relative w-24 h-24 rounded-full bg-sens-topsecret/10 border-2 border-sens-topsecret/40 flex items-center justify-center">
            <ShieldAlert size={44} className="text-sens-topsecret" strokeWidth={1.8} />
          </div>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sens-topsecret/30 bg-sens-topsecret/5 mb-5">
          <span className="text-[11px] font-mono-code text-sens-topsecret font-bold tracking-widest">
            HTTP 403 · FORBIDDEN
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-mono-display text-gray-100 mb-3">
          访问被拒绝
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          您当前的账号权限不足以访问此页面或资源。
          {currentUser
            ? `当前身份为「${currentUser.displayName.split('·')[0].trim()}」，请联系平台管理员申请更高授权级别。`
            : '请先以相应角色登录后再试。'}
        </p>

        <div className="grid sm:grid-cols-3 gap-3 mb-8">
          <Link to="/" className="card p-4 hover:border-cyber-teal/30 transition-colors group text-left">
            <Home size={18} className="text-cyber-teal mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-200 mb-1">返回首页</div>
            <div className="text-[11px] text-gray-500">浏览公开漏洞库</div>
          </Link>
          {!currentUser ? (
            <Link to="/login" className="card p-4 hover:border-cyber-teal/30 transition-colors group text-left">
              <UserCheck2 size={18} className="text-cyber-teal mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-200 mb-1">登录账号</div>
              <div className="text-[11px] text-gray-500">选择对应角色</div>
            </Link>
          ) : (
            <Link to="/profile" className="card p-4 hover:border-cyber-teal/30 transition-colors group text-left">
              <LockKeyhole size={18} className="text-cyber-teal mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium text-gray-200 mb-1">申请权限</div>
              <div className="text-[11px] text-gray-500">升级访问级别</div>
            </Link>
          )}
          <button
            onClick={() => window.history.back()}
            className="card p-4 hover:border-cyber-teal/30 transition-colors group text-left text-left"
          >
            <ArrowLeft size={18} className="text-cyber-teal mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-medium text-gray-200 mb-1">返回上一页</div>
            <div className="text-[11px] text-gray-500">浏览其他内容</div>
          </button>
        </div>

        <div className="text-[11px] text-gray-600 font-mono-code">
          Event ID: SEC-403-{Math.random().toString(36).slice(2, 8).toUpperCase()}
        </div>
      </div>
    </div>
  );
}
