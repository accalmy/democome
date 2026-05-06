import { ACCENT_HEX, AccentKey } from '../types';

interface Props {
  label: string;
  active?: boolean;
  accent?: AccentKey;
  onClick?: () => void;
}

export default function BrutChip({ label, active, accent, onClick }: Props) {
  const color = accent ? ACCENT_HEX[accent] : '#F5F5F5';
  return (
    <button
      onClick={onClick}
      className="brut-btn display text-sm px-3 py-1.5 whitespace-nowrap"
      style={{
        background: active ? color : '#1A1A2E',
        color: active ? '#0F0F1A' : '#F5F5F5',
        borderColor: color,
      }}
    >
      {label}
    </button>
  );
}
