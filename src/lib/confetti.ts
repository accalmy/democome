import confetti from 'canvas-confetti';

export function celebrate(intensity: 'small' | 'big' = 'small') {
  const count = intensity === 'big' ? 200 : 80;
  confetti({
    particleCount: count,
    spread: intensity === 'big' ? 100 : 65,
    origin: { y: 0.6 },
    colors: ['#FFE500', '#FF4D4D', '#00FF88', '#9B5DE5', '#00D4FF', '#FF8C00'],
    scalar: intensity === 'big' ? 1.2 : 1,
    ticks: 200,
  });
}
