import { AlertTriangle, ShieldCheck } from 'lucide-react';

export function DisclaimerBar() {
  return (
    <div className="relative border-stripes pt-[3px]">
      <div className="bg-space-gray/95 backdrop-blur-sm border-x border-b border-white/5">
        <div className="container mx-auto px-4 xl:px-6 py-2.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <div className="flex items-center gap-2 text-sens-internal font-semibold">
              <div className="relative">
                <AlertTriangle size={14} className="animate-pulse" />
              </div>
              <span className="uppercase tracking-wider">免责声明</span>
            </div>
            <p className="flex-1 min-w-0 text-gray-400 leading-relaxed">
              本平台收录的所有漏洞 POC 代码及技术资料，<span className="text-gray-200 font-medium">仅限授权安全研究与合法授权测试场景使用</span>。
              严禁将本站内容用于未授权渗透、非法入侵、数据窃取等任何违反法律法规的用途。
              <span className="hidden sm:inline text-gray-500">使用者需自行承担相应法律责任。</span>
            </p>
            <div className="flex items-center gap-1.5 text-cyber-teal/80 border border-cyber-teal/20 bg-cyber-teal/5 px-2 py-0.5 rounded-sm">
              <ShieldCheck size={12} />
              <span className="text-[11px] font-medium">已启用访问控制</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BottomDisclaimerBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="pointer-events-auto border-stripes pt-[3px]">
        <div className="bg-space-gray/97 backdrop-blur-md border-t border-x border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
          <div className="container mx-auto px-4 xl:px-6 py-2">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2 shrink-0">
                <AlertTriangle size={14} className="text-sens-internal animate-pulse" />
                <span className="text-sens-internal font-bold uppercase tracking-wider hidden sm:inline">Disclaimer</span>
              </div>
              <p className="text-gray-400 leading-snug truncate">
                <span className="text-gray-200 font-medium">安全合规提示：</span>
                POC 仅供授权安全研究使用，严禁非法用途 · 访问即视为已阅读并遵守
                <a className="text-cyber-teal hover:underline mx-1" href="#">《漏洞资料使用协议》</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
