import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import type { AvatarConfig } from '../types';

export const SKIN_OPTIONS = ['9e5622', 'ecad80', 'f2d3b1', '763900', '614335', 'ae5d29'];
export const HAIR_OPTIONS = [
  'short01', 'short02', 'short03', 'short04',
  'long01', 'long02', 'long03', 'long04',
];
export const HAIR_COLOR_OPTIONS = ['0e0e0e', '3a1a00', '85461e', 'b58143', 'cb6820', 'dba3be', '562306', 'ecdcbf'];
export const OUTFIT_COLOR_OPTIONS = ['FFE500', 'FF4D4D', '00FF88', '9B5DE5', '00D4FF', 'FF8C00'];

export const defaultAvatar = (): AvatarConfig => ({
  seed: 'guardian-' + Math.random().toString(36).slice(2, 8),
  name: '',
  skin: SKIN_OPTIONS[2],
  hair: HAIR_OPTIONS[0],
  hairColor: HAIR_COLOR_OPTIONS[0],
  outfitColor: OUTFIT_COLOR_OPTIONS[0],
  glasses: false,
  hat: false,
});

export function avatarSvg(cfg: AvatarConfig): string {
  return createAvatar(adventurer, {
    seed: cfg.seed,
    skinColor: [cfg.skin],
    hair: [cfg.hair as any],
    hairColor: [cfg.hairColor],
    backgroundColor: [cfg.outfitColor],
    glasses: cfg.glasses ? ['variant01', 'variant02', 'variant03'] : [],
    glassesProbability: cfg.glasses ? 100 : 0,
    features: cfg.hat ? ['birthmark'] : [],
  } as any).toString();
}

export function avatarDataUri(cfg: AvatarConfig): string {
  const svg = avatarSvg(cfg);
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
