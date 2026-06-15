import { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-csharp';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-go';
import { Copy, Check, ChevronDown, ChevronUp, FileCode2 } from 'lucide-react';

const detectLang = (code: string): string => {
  if (/^#!\/.*(python|bash|sh)/m.test(code)) return 'bash';
  if (/import (requests|socket|flask|django)/.test(code)) return 'python';
  if (/(<\?php|echo\s*\$)/i.test(code)) return 'php';
  if (/^\s*(def |class |import |from )/.test(code) && /print\(/.test(code)) return 'python';
  if (/curl |wget |apt-get |systemctl |chmod /.test(code)) return 'bash';
  if (/Runtime\.getRuntime|public (static )?void|import java\./.test(code)) return 'java';
  if (/SELECT |INSERT |UPDATE |DELETE |UNION /i.test(code)) return 'sql';
  if (/(const |let |var |function |=>|\.then\()/.test(code) && /<script/.test(code)) return 'javascript';
  if (/^<[a-z!]/.test(code)) return 'markup';
  return 'python';
};

export function CodeBlock({
  code,
  lang,
  filename,
  collapsed = false,
  maxHeight,
  lineNumbers = true,
}: {
  code: string;
  lang?: string;
  filename?: string;
  collapsed?: boolean;
  maxHeight?: number;
  lineNumbers?: boolean;
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(!collapsed);
  const [wrap, setWrap] = useState(false);

  useEffect(() => {
    if (preRef.current) {
      Prism.highlightElement(preRef.current);
    }
  }, [code, lang]);

  const language = lang || detectLang(code);
  const lines = code.split('\n');
  const shouldCollapse = collapsed && lines.length > 6;
  const isExpanded = expanded || !shouldCollapse;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="code-block relative group">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#212121] border-b border-[#3a3a3a]">
        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <FileCode2 size={12} className="text-cyber-teal/70" />
          <span className="font-mono-code">{filename || `poc.${language}`}</span>
          <span className="text-gray-600">|</span>
          <span>{lines.length} 行</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWrap((w) => !w)}
            title={wrap ? '取消自动换行' : '自动换行'}
            className="px-2 py-0.5 text-[10px] text-gray-400 hover:text-cyber-teal hover:bg-white/5 rounded-sm transition-colors"
          >
            {wrap ? 'WRAP ON' : 'WRAP'}
          </button>
          {shouldCollapse && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-400 hover:text-cyber-teal hover:bg-white/5 rounded-sm transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp size={12} /> 收起
                </>
              ) : (
                <>
                  <ChevronDown size={12} /> 展开 {lines.length} 行
                </>
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] text-gray-400 hover:text-cyber-teal hover:bg-white/5 rounded-sm transition-colors"
          >
            {copied ? (
              <>
                <Check size={12} className="text-sens-public" /> 已复制
              </>
            ) : (
              <>
                <Copy size={12} /> 复制
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={`relative overflow-auto ${maxHeight ? 'overflow-y-auto' : ''}`}
        style={{ maxHeight: isExpanded ? (maxHeight ? `${maxHeight}px` : undefined) : '200px' }}
      >
        {shouldCollapse && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#2d2d2d] to-transparent pointer-events-none z-10" />
        )}
        <pre className="p-0 bg-transparent m-0" style={{ margin: 0, padding: 0, background: 'transparent' }}>
          <table className="w-full border-collapse" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <tbody>
              <tr>
                {lineNumbers && (
                  <td
                    className="select-none text-right pr-3 pl-3 py-3 text-[11px] font-mono-code text-gray-600 bg-[#262626] border-r border-[#3a3a3a] align-top whitespace-pre sticky left-0"
                    aria-hidden
                  >
                    {lines.map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </td>
                )}
                <td className={`align-top py-3 px-4 ${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}`}>
                  <code ref={preRef} className={`language-${language} font-mono-code text-xs leading-6`}>
                    {code}
                  </code>
                </td>
              </tr>
            </tbody>
          </table>
        </pre>
      </div>
    </div>
  );
}
