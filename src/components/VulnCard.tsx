import { Link } from 'react-router-dom';
import { Calendar, Tag, Clock, ChevronRight, AlertTriangle } from 'lucide-react';
import { Vulnerability } from '@/types';
import { SensitivityBadge, StatusBadge, MetaDot } from './Badges';
import { SENSITIVITY_META } from '@/utils/sensitivity';

export function VulnCard({ vuln, index = 0 }: { vuln: Vulnerability; index?: number }) {
  const levelMeta = SENSITIVITY_META[vuln.sensitivityLevel];
  const date = new Date(vuln.submittedAt);
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return (
    <Link
      to={`/vuln/${vuln.id}`}
      className="group card-hoverable flex flex-col animate-stagger"
      style={{ animationDelay: `${Math.min(index * 40, 600)}ms` }}
    >
      <div className="flex items-stretch">
        <SensitivityBadge level={vuln.sensitivityLevel} asBar />
        <div className="flex-1 p-5 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono-code text-[11px] px-1.5 py-0.5 rounded-sm bg-space-light text-cyber-teal border border-cyber-teal/20">
                {vuln.vulnCode}
              </span>
              {vuln.cveId && (
                <span className="font-mono-code text-[11px] px-1.5 py-0.5 rounded-sm bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  {vuln.cveId}
                </span>
              )}
            </div>
            <SensitivityBadge level={vuln.sensitivityLevel} size="sm" />
          </div>

          <h3 className="text-[15px] font-semibold text-gray-100 group-hover:text-cyber-teal transition-colors leading-snug line-clamp-2">
            {vuln.title}
          </h3>

          <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 min-h-[2.25rem]">
            {vuln.description}
          </p>

          {vuln.affectedVersions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {vuln.affectedVersions.slice(0, 3).map((av, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-sm bg-space-light/80 text-gray-400 border border-white/5"
                >
                  <Tag size={9} className="text-cyber-teal/70" />
                  {av.product} {av.versionRange.split(' ')[0]}
                </span>
              ))}
              {vuln.affectedVersions.length > 3 && (
                <span className="text-[10px] text-gray-500 self-center">
                  +{vuln.affectedVersions.length - 3}
                </span>
              )}
            </div>
          )}

          {vuln.verificationStatus !== 'verified' && vuln.sensitivityLevel !== 'public' && (
            <div className={`flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-sm ${levelMeta.bgColor} ${levelMeta.color}`}>
              <AlertTriangle size={11} />
              <span>内容需授权访问</span>
            </div>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              <span className="inline-flex items-center gap-1">
                <Calendar size={11} />
                {dateStr}
              </span>
              <MetaDot color="bg-gray-600" />
              <span className="inline-flex items-center gap-1">
                <Clock size={11} />
                {vuln.submitterName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={vuln.verificationStatus} />
              <ChevronRight
                size={14}
                className="text-gray-500 group-hover:text-cyber-teal group-hover:translate-x-0.5 transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
