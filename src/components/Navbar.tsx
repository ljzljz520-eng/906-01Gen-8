import { useEffect, useState } from 'react';
import {
  ShieldHalf,
  Search,
  UserRound,
  LogOut,
  Menu,
  X,
  Upload,
  ClipboardCheck,
  Home,
  UserCog,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';
import { RoleBadge } from './Badges';

const NAV_ITEMS: Array<{
  to: string;
  label: string;
  icon: typeof Home;
  role?: UserRole[];
}> = [
  { to: '/', label: '漏洞库', icon: Home },
  { to: '/submit', label: '提交', icon: Upload, role: [UserRole.RESEARCHER, UserRole.AUTHORIZED, UserRole.ADMIN] },
  { to: '/review', label: '审核台', icon: ClipboardCheck, role: [UserRole.ADMIN] },
  { to: '/profile', label: '个人中心', icon: UserCog, role: [UserRole.RESEARCHER, UserRole.AUTHORIZED, UserRole.ADMIN] },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout, canAccessReview, canSubmit, initStore } = useAppStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    initStore();
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [initStore]);

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.role) return true;
    if (!currentUser) return false;
    return item.role.includes(currentUser.role);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.pathname !== '/') navigate('/');
    setTimeout(() => {
      useAppStore.getState().setFilters({ keyword: searchVal.trim() });
    }, 0);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 backdrop-blur-md transition-all duration-300 ${
          scrolled
            ? 'bg-deep-space/90 border-b border-cyber-teal/10 shadow-[0_4px_30px_rgba(0,212,170,0.05)]'
            : 'bg-deep-space/60 border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-4 xl:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-cyber-teal/30 blur-md rounded-full group-hover:bg-cyber-teal/50 transition-all" />
                <div className="relative w-9 h-9 rounded-sm bg-gradient-to-br from-cyber-teal to-cyan-600 flex items-center justify-center shadow-cyber-glow-50">
                  <ShieldHalf size={20} className="text-deep-space" strokeWidth={2.5} />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-mono-display font-bold text-base text-gradient tracking-tight">
                  SecureVault
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest -mt-0.5">
                  POC Repository
                </div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {visibleItems.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-sm ${
                      active
                        ? 'text-cyber-teal'
                        : 'text-gray-400 hover:text-gray-100 hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={16} />
                      {item.label}
                    </span>
                    {active && (
                      <span className="absolute left-4 right-4 -bottom-px h-px bg-gradient-to-r from-transparent via-cyber-teal to-transparent animate-glow-pulse" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full group">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-cyber-teal transition-colors"
                />
                <input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  placeholder="搜索漏洞编号、CVE、关键词..."
                  className="w-full pl-9 pr-4 py-2 bg-space-gray/60 border border-white/5 text-sm text-gray-200 placeholder-gray-500 rounded-sm focus:outline-none focus:ring-1 focus:ring-cyber-teal/50 focus:border-cyber-teal/40 transition-all"
                />
                <div className="absolute inset-0 rounded-sm pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity shadow-[0_0_20px_rgba(0,212,170,0.1)]" />
              </div>
            </form>

            <div className="flex items-center gap-2">
              {currentUser ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-xs font-medium text-gray-200">
                      {currentUser.displayName.split('·')[0].trim()}
                    </span>
                    <RoleBadge role={currentUser.role} />
                  </div>
                  <div className="relative">
                    <button
                      onClick={logout}
                      className="w-10 h-10 rounded-sm bg-space-light border border-white/10 flex items-center justify-center text-gray-300 hover:text-cyber-teal hover:border-cyber-teal/40 transition-colors"
                      title="退出登录"
                    >
                      <LogOut size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="btn-secondary !py-1.5 !px-3 text-xs"
                >
                  <UserRound size={14} />
                  登录
                </Link>
              )}

              <button
                className="lg:hidden w-10 h-10 rounded-sm border border-white/10 flex items-center justify-center text-gray-300"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-white/5 bg-deep-space/95 backdrop-blur-md">
            <div className="container mx-auto px-4 py-3 space-y-2">
              <form onSubmit={handleSearch} className="md:hidden mb-3">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    value={searchVal}
                    onChange={(e) => setSearchVal(e.target.value)}
                    placeholder="搜索漏洞..."
                    className="w-full pl-9 pr-4 py-2 bg-space-gray/60 border border-white/5 text-sm rounded-sm"
                  />
                </div>
              </form>
              {visibleItems.map((item) => {
                const active = location.pathname === item.to;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm ${
                      active
                        ? 'bg-cyber-teal/10 text-cyber-teal border border-cyber-teal/20'
                        : 'text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <Icon size={16} /> {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
      <div aria-hidden className="pointer-events-none h-0.5 bg-gradient-to-r from-transparent via-cyber-teal/30 to-transparent" />
    </>
  );
}
