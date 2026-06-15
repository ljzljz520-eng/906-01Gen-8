import {
  Upload,
  ClipboardCheck,
  Eraser,
  Share2,
  XCircle,
  Edit3,
} from 'lucide-react';
import { TimelineEvent as TimelineEventType, UserRole } from '@/types';
import { ROLE_META } from '@/utils/sensitivity';

const EVENT_ICON = {
  submit: { icon: Upload, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' },
  review: { icon: ClipboardCheck, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/30' },
  desensitize: { icon: Eraser, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/30' },
  publish: { icon: Share2, color: 'text-sens-public', bg: 'bg-sens-public/10', border: 'border-sens-public/30' },
  reject: { icon: XCircle, color: 'text-sens-topsecret', bg: 'bg-sens-topsecret/10', border: 'border-sens-topsecret/30' },
  update: { icon: Edit3, color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/30' },
};

const EVENT_LABEL: Record<string, string> = {
  submit: '提交漏洞报告',
  review: '开始审核',
  desensitize: '要求脱敏',
  publish: '审核通过发布',
  reject: '驳回提交',
  update: '更新内容',
};

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return `${diff} 秒前`;
  if (diff < 3600) return `${Math.floor(diff / 60)} 分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} 天前`;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function Timeline({ events }: { events: TimelineEventType[] }) {
  const sorted = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-cyber-teal/40 via-purple-500/20 to-transparent" />
      <ul className="space-y-5">
        {sorted.map((event, idx) => {
          const style = EVENT_ICON[event.type] ?? EVENT_ICON.update;
          const Icon = style.icon;
          const roleMeta = ROLE_META[event.operatorRole];
          const isLast = idx === sorted.length - 1;
          return (
            <li key={event.id} className="relative pl-10 animate-stagger-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div
                className={`absolute left-0 top-0 w-8 h-8 rounded-sm flex items-center justify-center border-2 ${style.bg} ${style.border} ${style.color} ${isLast ? 'shadow-[0_0_15px_rgba(0,212,170,0.3)]' : ''}`}
              >
                <Icon size={14} />
              </div>
              <div className={`pt-0.5 ${isLast ? '' : ''}`}>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-sm font-semibold ${style.color}`}>
                    {EVENT_LABEL[event.type] ?? event.type}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 ${roleMeta?.color ?? 'text-gray-400'}`}>
                    {event.operatorName}
                    <span className="text-gray-600">·</span>
                    <span>{roleMeta?.label ?? event.operatorRole}</span>
                  </span>
                  <span className="text-[11px] text-gray-500 ml-auto">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                {event.comment && (
                  <p className="text-xs text-gray-400 leading-relaxed bg-space-light/30 border border-white/5 rounded-sm px-3 py-2">
                    {event.comment}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
