import { ACCENT_HEX, AccentKey } from '../types';

interface Props {
  selected: AccentKey;
  onChange: (a: AccentKey) => void;
  size?: number;
}

const KEYS: AccentKey[] = ['yellow', 'coral', 'green', 'violet', 'turquoise', 'orange'];

export default function AccentSwatch({ selected, onChange, size = 44 }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {KEYS.map((k) => {
        const active = selected === k;
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            aria-label={k}
            className="brut-btn"
            style={{
              width: size,
              height: size,
              background: ACCENT_HEX[k],
              borderColor: active ? '#F5F5F5' : '#0F0F1A',
              borderRadius: 999,
              boxShadow: active
                ? '4px 4px 0 #FFE500'
                : '4px 4px 0 #262626',
            }}
          />
        );
      })}
    </div>
  );
}
