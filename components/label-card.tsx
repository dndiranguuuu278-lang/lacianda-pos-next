import { GrapeClusterIcon } from './icons';
import type { LabelCardProps } from '@/types';

export default function LabelCard({
  children,
  className = '',
  crest = false,
  title,
  subtitle
}: LabelCardProps) {
  return (
    <div className={`rounded-xl border border-primary/20 bg-card/80 p-1 shadow-xs ${className}`}>
      <div className="rounded-lg border border-primary/25 bg-paper p-5 sm:p-6 transition-all">
        {crest && (
          <div className="mb-4 flex items-center justify-center gap-2 text-primary/70">
            <span className="h-px flex-1 bg-primary/20" />
            <GrapeClusterIcon className="h-4 w-4" />
            <span className="h-px flex-1 bg-primary/20" />
          </div>
        )}
        {title && (
          <div className="mb-3">
            <h3 className="text-sm font-bold text-primary tracking-tight">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
