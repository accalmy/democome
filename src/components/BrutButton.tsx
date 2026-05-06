import { ButtonHTMLAttributes, forwardRef } from 'react';
import { ACCENT_HEX, AccentKey } from '../types';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  accent?: AccentKey | 'ink';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

const SIZE = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

const BrutButton = forwardRef<HTMLButtonElement, Props>(function BrutButton(
  { accent = 'yellow', size = 'md', block, className = '', style, children, ...rest },
  ref
) {
  const bg = accent === 'ink' ? '#F5F5F5' : ACCENT_HEX[accent];
  const color = accent === 'green' || accent === 'yellow' || accent === 'turquoise' || accent === 'ink' ? '#0F0F1A' : '#0F0F1A';
  return (
    <button
      ref={ref}
      {...rest}
      className={`brut-btn display ${SIZE[size]} ${block ? 'w-full' : ''} ${className}`}
      style={{ background: bg, color, ...style }}
    >
      {children}
    </button>
  );
});

export default BrutButton;
