import { ACCENT_HEX, AccentKey } from '../types';

interface Props {
  value: number; // 0..1
  accent?: AccentKey;
  label?: string;
}

export default function BrutProgress({ value, accent = 'green', label }: Props) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div>
      <div
        className="relative h-5 rounded-brut overflow-hidden"
        style={{
          background: '#1A1A2E',
          border: '2px solid #F5F5F5',
          boxShadow: '4px 4px 0px #262626',
        }}
      >
        <div
          className="h-full transition-[width] duration-300"
          style={{ width: pct + '%', background: ACCENT_HEX[accent] }}
        />
      </div>
      {label && <p className="text-sm text-sub mt-1.5">{label}</p>}
    </div>
  );
}
