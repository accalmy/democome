import { HTMLAttributes, ReactNode } from 'react';
import { ACCENT_HEX, AccentKey } from '../types';

interface Props extends HTMLAttributes<HTMLDivElement> {
  accent: AccentKey;
  selected?: boolean;
  pressable?: boolean;
  children: ReactNode;
}

export default function BrutCard({
  accent,
  selected,
  pressable,
  className = '',
  style,
  children,
  ...rest
}: Props) {
  const color = ACCENT_HEX[accent];
  return (
    <div
      {...rest}
      className={`relative rounded-brut p-4 ${pressable ? 'brut-btn cursor-pointer' : ''} ${className}`}
      style={{
        background: selected ? '#23233a' : '#1A1A2E',
        border: `2px solid ${color}`,
        boxShadow: '4px 4px 0px #262626',
        color: '#F5F5F5',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
