import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  defaultAvatar,
  HAIR_COLOR_OPTIONS,
  HAIR_OPTIONS,
  OUTFIT_COLOR_OPTIONS,
  SKIN_OPTIONS,
} from '../lib/dicebear';
import { AvatarConfig } from '../types';
import AvatarView from '../components/AvatarView';
import BrutButton from '../components/BrutButton';
import { celebrate } from '../lib/confetti';

interface Props {
  initial?: AvatarConfig;
  isEdit?: boolean;
  onSave: (a: AvatarConfig) => void;
  onCancel?: () => void;
}

export default function AvatarCreator({ initial, isEdit, onSave, onCancel }: Props) {
  const [cfg, setCfg] = useState<AvatarConfig>(initial ?? defaultAvatar());
  const [name, setName] = useState(initial?.name ?? '');
  const valid = name.trim().length > 0;

  const submit = () => {
    if (!valid) return;
    const final = { ...cfg, name: name.trim() };
    if (!isEdit) celebrate('big');
    onSave(final);
  };

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      <div className="max-w-screen-sm mx-auto px-5 pt-8 pb-12">
        <h1 className="display text-3xl mb-1">
          {isEdit ? 'Modifier ton avatar' : 'Crée ton avatar'}
        </h1>
        <p className="text-sub mb-6">
          {isEdit ? 'Change ce que tu veux.' : 'Ton compagnon de route. Choisis-le bien.'}
        </p>

        <div
          className="mx-auto mb-6 w-44 h-44 rounded-full grid place-items-center"
          style={{
            background: '#1A1A2E',
            border: '2px solid #FFE500',
            boxShadow: '6px 6px 0px #262626',
          }}
        >
          <motion.div
            key={JSON.stringify(cfg)}
            initial={{ scale: 0.92, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <AvatarView cfg={cfg} size={170} />
          </motion.div>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ton prénom"
          className="display text-xl w-full text-center px-4 py-3 mb-8 rounded-brut bg-card"
          style={{
            border: '2px solid #F5F5F5',
            boxShadow: '4px 4px 0px #262626',
          }}
          maxLength={20}
        />

        <Section title="Couleur de peau">
          <Pastilles
            options={SKIN_OPTIONS}
            selected={cfg.skin}
            onSelect={(v) => setCfg({ ...cfg, skin: v })}
          />
        </Section>

        <Section title="Style de cheveux">
          <div className="grid grid-cols-4 gap-3">
            {HAIR_OPTIONS.map((h) => {
              const preview: AvatarConfig = { ...cfg, hair: h };
              const active = cfg.hair === h;
              return (
                <button
                  key={h}
                  onClick={() => setCfg(preview)}
                  className="brut-btn p-1 grid place-items-center"
                  style={{
                    background: '#1A1A2E',
                    borderColor: active ? '#FFE500' : '#0F0F1A',
                    boxShadow: active ? '4px 4px 0 #FFE500' : '4px 4px 0 #262626',
                  }}
                >
                  <AvatarView cfg={preview} size={56} />
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Couleur des cheveux">
          <Pastilles
            options={HAIR_COLOR_OPTIONS}
            selected={cfg.hairColor}
            onSelect={(v) => setCfg({ ...cfg, hairColor: v })}
          />
        </Section>

        <Section title="Couleur de la tenue">
          <Pastilles
            options={OUTFIT_COLOR_OPTIONS}
            selected={cfg.outfitColor}
            onSelect={(v) => setCfg({ ...cfg, outfitColor: v })}
          />
        </Section>

        <Section title="Accessoires">
          <div className="flex gap-3">
            <ToggleBtn
              active={cfg.glasses}
              onClick={() => setCfg({ ...cfg, glasses: !cfg.glasses })}
              label="🤓 Lunettes"
            />
            <ToggleBtn
              active={cfg.hat}
              onClick={() => setCfg({ ...cfg, hat: !cfg.hat })}
              label="🎩 Chapeau"
            />
          </div>
        </Section>

        <div className="mt-8 flex flex-col gap-3">
          <BrutButton accent="yellow" size="lg" block onClick={submit} disabled={!valid}>
            {isEdit ? 'Enregistrer' : "C'est moi ! 🎉"}
          </BrutButton>
          {isEdit && (
            <BrutButton accent="ink" size="md" block onClick={onCancel}>
              Annuler
            </BrutButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="display text-sm uppercase tracking-wider mb-3 text-sub">{title}</p>
      {children}
    </div>
  );
}

function Pastilles({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((c) => {
        const active = selected === c;
        return (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className="brut-btn"
            style={{
              width: 44,
              height: 44,
              background: '#' + c,
              borderRadius: 999,
              borderColor: active ? '#FFE500' : '#0F0F1A',
              boxShadow: active ? '4px 4px 0 #FFE500' : '4px 4px 0 #262626',
            }}
          />
        );
      })}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="brut-btn display px-4 py-2.5"
      style={{
        background: active ? '#FFE500' : '#1A1A2E',
        color: active ? '#0F0F1A' : '#F5F5F5',
        borderColor: active ? '#0F0F1A' : '#FFE500',
      }}
    >
      {label}
    </button>
  );
}
