import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, AccentKey, TaskGroup } from '../types';
import BrutButton from '../components/BrutButton';
import BrutCard from '../components/BrutCard';
import AccentSwatch from '../components/AccentSwatch';
import AvatarView from '../components/AvatarView';
import BottomSheet from '../components/BottomSheet';

interface Props { onEditAvatar: () => void; }

export default function Settings({ onEditAvatar }: Props) {
  const avatar = useStore((s) => s.avatar)!;
  const groups = useStore((s) => s.groups);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const exportJson = useStore((s) => s.exportJson);
  const addGroup = useStore((s) => s.addGroup);
  const updateGroup = useStore((s) => s.updateGroup);
  const removeGroup = useStore((s) => s.removeGroup);

  const [hyperOpen, setHyperOpen] = useState(false);
  const [groupOpen, setGroupOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<TaskGroup | undefined>();
  const [name, setName] = useState('');
  const [accent, setAccent] = useState<AccentKey>('yellow');

  const startNewGroup = () => {
    setEditingGroup(undefined);
    setName('');
    setAccent('yellow');
    setGroupOpen(true);
  };

  const startEditGroup = (g: TaskGroup) => {
    setEditingGroup(g);
    setName(g.name);
    setAccent(g.accent);
    setGroupOpen(true);
  };

  const saveGroup = () => {
    if (!name.trim()) return;
    if (editingGroup) {
      updateGroup(editingGroup.id, { name: name.trim(), accent });
    } else {
      addGroup({ id: crypto.randomUUID(), name: name.trim(), accent });
    }
    setGroupOpen(false);
  };

  const startHyper = (mins: number) => {
    const until = new Date(Date.now() + mins * 60_000).toISOString();
    updateSettings({ hyperfocusUntil: until });
    setHyperOpen(false);
    alert(`Mode Hyperconcentration actif pour ${mins} min.`);
  };

  const exportData = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-guardian-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="display text-2xl mb-4">Paramètres</h1>

      <BrutCard accent="yellow" className="mb-5 flex items-center gap-4">
        <AvatarView cfg={avatar} size={64} ring />
        <div className="flex-1 min-w-0">
          <p className="display text-lg truncate">{avatar.name}</p>
          <p className="text-sub text-xs">Modifier ton avatar / prénom</p>
        </div>
        <BrutButton accent="yellow" size="sm" onClick={onEditAvatar}>Modifier</BrutButton>
      </BrutCard>

      <Section title="Groupes de tâches">
        <div className="space-y-2">
          {groups.map((g) => (
            <div
              key={g.id}
              className="flex items-center gap-3 rounded-brut p-3"
              style={{ background: '#1A1A2E', border: `2px solid ${ACCENT_HEX[g.accent]}`, boxShadow: '4px 4px 0 #262626' }}
            >
              <span
                style={{
                  width: 16, height: 16, borderRadius: 999,
                  background: ACCENT_HEX[g.accent], border: '2px solid #0F0F1A',
                }}
              />
              <span className="display flex-1">{g.name}</span>
              <button onClick={() => startEditGroup(g)} className="text-sub">✏️</button>
              <button
                onClick={() => { if (confirm(`Supprimer "${g.name}" et ses tâches ?`)) removeGroup(g.id); }}
                className="text-sub"
              >
                🗑️
              </button>
            </div>
          ))}
          <BrutButton accent="green" block onClick={startNewGroup}>+ Nouveau groupe</BrutButton>
        </div>
      </Section>

      <Section title="Langue">
        <div className="flex gap-2">
          {(['fr', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => updateSettings({ language: l })}
              className="brut-btn display flex-1 py-2"
              style={{
                background: settings.language === l ? '#FFE500' : '#1A1A2E',
                color: settings.language === l ? '#0F0F1A' : '#F5F5F5',
                borderColor: '#FFE500',
              }}
            >
              {l === 'fr' ? '🇫🇷 Français' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Google Calendar">
        <BrutCard accent="turquoise">
          <p className="display mb-1">{settings.googleConnected ? 'Connecté ✅' : 'Non connecté'}</p>
          <p className="text-sub text-xs mb-3">
            Lecture + écriture (OAuth 2.0). Branche ton client ID Google dans le code.
          </p>
          <BrutButton
            accent="turquoise"
            block
            onClick={() => updateSettings({ googleConnected: !settings.googleConnected })}
          >
            {settings.googleConnected ? 'Déconnecter' : 'Connecter Google'}
          </BrutButton>
        </BrutCard>
      </Section>

      <Section title="Mode Hyperconcentration">
        <BrutCard accent="coral">
          <p className="text-sub text-sm mb-3">
            Désactive toutes les notifications pendant la durée choisie.
          </p>
          {settings.hyperfocusUntil && (
            <p className="display text-sm mb-2">
              Jusqu'à {new Date(settings.hyperfocusUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          <BrutButton accent="coral" block onClick={() => setHyperOpen(true)}>
            Démarrer 🛑
          </BrutButton>
        </BrutCard>
      </Section>

      <Section title="Pomodoro">
        <BrutCard accent="violet">
          <NumField
            label="Travail (min)"
            value={settings.pomodoroWorkMin}
            onChange={(v) => updateSettings({ pomodoroWorkMin: v })}
            min={5} max={90}
          />
          <NumField
            label="Pause (min)"
            value={settings.pomodoroBreakMin}
            onChange={(v) => updateSettings({ pomodoroBreakMin: v })}
            min={1} max={30}
          />
        </BrutCard>
      </Section>

      <Section title="Données">
        <BrutButton accent="yellow" block onClick={exportData}>
          Exporter en JSON 💾
        </BrutButton>
      </Section>

      <BottomSheet open={hyperOpen} onClose={() => setHyperOpen(false)} accent="coral" title="Hyperconcentration">
        <div className="grid grid-cols-2 gap-3">
          {[15, 30, 60, 90].map((m) => (
            <BrutButton key={m} accent="coral" size="lg" block onClick={() => startHyper(m)}>
              {m} min
            </BrutButton>
          ))}
        </div>
      </BottomSheet>

      <BottomSheet open={groupOpen} onClose={() => setGroupOpen(false)} accent="green" title={editingGroup ? 'Modifier groupe' : 'Nouveau groupe'}>
        <div className="space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom du groupe"
            className="display text-lg w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          />
          <div>
            <p className="display text-xs uppercase tracking-wider text-sub mb-2">Couleur</p>
            <AccentSwatch selected={accent} onChange={setAccent} />
          </div>
          <BrutButton accent="green" size="lg" block onClick={saveGroup}>Enregistrer</BrutButton>
        </div>
      </BottomSheet>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <p className="display text-xs uppercase tracking-wider text-sub mb-3">{title}</p>
      {children}
    </div>
  );
}

function NumField({ label, value, onChange, min, max }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  return (
    <div className="mb-3">
      <p className="display text-sm mb-1">{label}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="brut-btn display w-10 h-10"
          style={{ background: '#1A1A2E', borderColor: '#9B5DE5' }}
        >−</button>
        <span className="display text-xl w-12 text-center">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="brut-btn display w-10 h-10"
          style={{ background: '#1A1A2E', borderColor: '#9B5DE5' }}
        >+</button>
      </div>
    </div>
  );
}
