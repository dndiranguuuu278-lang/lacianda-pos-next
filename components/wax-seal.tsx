import type { WaxSealProps } from '@/types';

export default function WaxSeal({ label, variant = 'active', className = '' }: WaxSealProps) {
  const getStyle = () => {
    switch (variant) {
      case 'void':
        return 'bg-red-700 text-white border-2 border-dashed border-red-300 shadow-md';
      case 'muted':
        return 'border border-primary/30 text-primary/80 bg-paper';
      case 'active':
      default:
        return 'bg-primary text-primary-foreground shadow-sm';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase select-none ${getStyle()} ${className}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          variant === 'muted' ? 'bg-primary/50' : 'bg-white/80'
        }`}
      />
      {label}
    </span>
  );
}
