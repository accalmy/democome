import { useMemo } from 'react';
import { AvatarConfig } from '../types';
import { avatarDataUri } from '../lib/dicebear';

interface Props {
  cfg: AvatarConfig;
  size?: number;
  className?: string;
  ring?: boolean;
}

export default function AvatarView({ cfg, size = 64, className = '', ring }: Props) {
  const src = useMemo(() => avatarDataUri(cfg), [cfg]);
  return (
    <img
      src={src}
      alt={cfg.name || 'avatar'}
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{
        background: '#1A1A2E',
        border: ring ? '2px solid #F5F5F5' : 'none',
        boxShadow: ring ? '4px 4px 0 #262626' : undefined,
        width: size,
        height: size,
      }}
    />
  );
}
