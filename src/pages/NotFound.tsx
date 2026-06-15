import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft, Search } from 'lucide-react';
import { useState } from 'react';

export default function NotFound() {
  const [wiggle, setWiggle] = useState(false);
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center py-12 px-4">
      <div className="absolute inset-0 opacity-40 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 20%, rgba(0, 212, 170, 0.08), transparent)',
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'linear-gradient(rgba(0, 212, 170, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      <div className="relative z-10 max-w-xl w-full text-center animate-stagger-in">
        <div className="relative mb-8 inline-block">
          <div className="font-mono-display text-[104px] md:text-[144px] leading-none font-bold bg-gradient-to-br from-cyber-teal via-cyan-300 to-purple-500 bg-clip-text text-transparent select-none">
            404
          </div>
          <div className="absolute -right-4 top-2 rotate-12">
            <div
              className={`w-16 h-16 rounded-full bg-purple-500/10 border-2 border-purple-500/30 flex items-center justify-center ${
                wiggle ? 'animate-bounce' : ''
              }`}
              onClick={() => setWiggle(true)}
              onAnimationEnd={() => setWiggle(false)}
            >
              <Compass size={28} className="text-purple-400" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyber-teal/30 bg-cyber-teal/5 mb-5">
          <span className="text-[11px] font-mono-code text-cyber-teal font-bold tracking-widest">
            RESOURCE_NOT_FOUND
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-3">
          这片区域还未被安全探索
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed max-w-md mx-auto">
          您访问的漏洞条目、页面或资源不存在。
          可能已被管理员移除、链接有误或需要从主路径访问。
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 mb-10">
          <Link to="/" className="btn-primary min-w-[160px]">
            <Home size={16} /> 返回首页
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary min-w-[160px]"
          >
            <ArrowLeft size={16} /> 返回上一页
          </button>
        </div>

        <div className="card p-5 text-left max-w-md mx-auto border-cyber-teal/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-100 mb-3">
            <Search size={14} className="text-cyber-teal" />
            试试这些内容？
          </div>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to="/"
                className="text-gray-400 hover:text-cyber-teal transition-colors inline-flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-cyber-teal" /> 浏览公开漏洞库
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="text-gray-400 hover:text-cyber-teal transition-colors inline-flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-cyber-teal" /> 切换身份登录查看更多资源
              </Link>
            </li>
            <li>
              <Link
                to="/submit"
                className="text-gray-400 hover:text-cyber-teal transition-colors inline-flex items-center gap-1.5"
              >
                <span className="w-1 h-1 rounded-full bg-cyber-teal" /> 作为研究员提交新的漏洞 POC
              </Link>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-[11px] text-gray-600 font-mono-code">
          Trace: 404 · {window.location.pathname}
        </div>
      </div>
    </div>
  );
}
