interface WaxSealProps {
  label: string;
  /** 'active' = solid terracotta stamp. 'muted' = outlined, for inactive/simulated states. */
  variant?: 'active' | 'muted';
  className?: string;
}

/**
 * A small circular "wax seal" stamp — the same visual language as sealing a
 * bottle or a certificate of authenticity, repurposed here as a status
 * badge (payment confirmed, live mode active, etc.) instead of a plain
 * colored pill.
 */
export default function WaxSeal({ label, variant = 'active', className = '' }: WaxSealProps) {
  const isActive = variant === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
        isActive ? 'bg-[#78350f] text-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]' : 'border border-[#78350f]/30 text-[#78350f]/80'
      } ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-white/80' : 'bg-[#78350f]/50'}`} />
      {label}
    </span>
  );
}
