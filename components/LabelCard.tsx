import { GrapeClusterIcon } from './icons';

interface LabelCardProps {
  children: React.ReactNode;
  className?: string;
  /** Shows a small centered grape-cluster divider above the content, like a label crest. */
  crest?: boolean;
}

/**
 * A card treatment styled after a wine bottle label: an outer hairline
 * border, an inset second border with breathing room between them, and a
 * warm parchment fill instead of flat white — the signature visual motif
 * for this app, used anywhere a plain card would otherwise feel generic.
 */
export default function LabelCard({ children, className = '', crest = false }: LabelCardProps) {
  return (
    <div className={`rounded-lg border border-[#78350f]/25 p-1 ${className}`}>
      <div className="rounded-md border border-[#78350f]/40 bg-[#fdfbf6] p-5 sm:p-6">
        {crest && (
          <div className="mb-4 flex items-center justify-center gap-2 text-[#78350f]/70">
            <span className="h-px flex-1 bg-[#78350f]/20" />
            <GrapeClusterIcon className="h-4 w-4" />
            <span className="h-px flex-1 bg-[#78350f]/20" />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
