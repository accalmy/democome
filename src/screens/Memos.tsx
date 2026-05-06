import { useState } from 'react';
import { useStore } from '../store/useStore';
import { ACCENT_HEX, AccentKey, ChecklistItem, Memo, MemoKind } from '../types';
import BrutButton from '../components/BrutButton';
import BottomSheet from '../components/BottomSheet';

export default function Memos() {
  const memos = useStore((s) => s.memos);
  const tasks = useStore((s) => s.tasks);
  const groups = useStore((s) => s.groups);
  const removeMemo = useStore((s) => s.removeMemo);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Memo | undefined>();
  const [viewing, setViewing] = useState<Memo | undefined>();

  const accentForMemo = (m: Memo): AccentKey => {
    if (!m.taskId) return 'turquoise';
    const t = tasks.find((x) => x.id === m.taskId);
    const g = groups.find((x) => x.id === t?.groupId);
    return g?.accent ?? 'turquoise';
  };

  return (
    <div className="px-5 pt-6">
      <h1 className="display text-2xl mb-4">Mémos</h1>

      <div className="space-y-3 mb-24">
        {memos.length === 0 && (
          <div className="text-sub text-center py-12">Pas encore de mémo.</div>
        )}
        {memos.map((m) => {
          const acc = accentForMemo(m);
          const t = m.taskId ? tasks.find((x) => x.id === m.taskId) : undefined;
          return (
            <button
              key={m.id}
              onClick={() => setViewing(m)}
              className="w-full text-left rounded-brut p-3 brut-btn"
              style={{
                background: '#1A1A2E',
                border: `2px solid ${ACCENT_HEX[acc]}`,
                color: '#F5F5F5',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="display">
                    {kindEmoji(m.kind)} {m.title}
                  </p>
                  {t && <p className="text-xs text-sub">↪ {t.title}</p>}
                  {m.kind === 'note' && m.text && (
                    <p className="text-xs text-sub mt-1 line-clamp-2">{m.text.slice(0, 120)}</p>
                  )}
                  {m.kind === 'checklist' && (
                    <p className="text-xs text-sub mt-1">
                      {(m.items ?? []).filter((i) => i.done).length} / {(m.items ?? []).length} cochées
                    </p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => { setEditing(undefined); setOpen(true); }}
        className="fixed z-30 right-5 bottom-24 grid place-items-center brut-btn display"
        style={{ width: 64, height: 64, background: '#FFE500', color: '#0F0F1A', borderRadius: 999, fontSize: 32 }}
        aria-label="Nouveau mémo"
      >
        +
      </button>

      <MemoForm open={open} onClose={() => setOpen(false)} initial={editing} />
      <MemoView memo={viewing} onClose={() => setViewing(undefined)} onEdit={(m) => { setViewing(undefined); setEditing(m); setOpen(true); }} onDelete={(id) => { if (confirm('Supprimer ce mémo ?')) { removeMemo(id); setViewing(undefined); } }} />
    </div>
  );
}

function kindEmoji(k: MemoKind) {
  return k === 'note' ? '📝' : k === 'checklist' ? '✅' : '📎';
}

function MemoForm({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Memo }) {
  const tasks = useStore((s) => s.tasks);
  const [kind, setKind] = useState<MemoKind>(initial?.kind ?? 'note');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [text, setText] = useState(initial?.text ?? '');
  const [items, setItems] = useState<ChecklistItem[]>(initial?.items ?? []);
  const [taskId, setTaskId] = useState<string | undefined>(initial?.taskId);
  const [fileDataUrl, setFileDataUrl] = useState<string | undefined>(initial?.fileDataUrl);
  const [fileName, setFileName] = useState<string | undefined>(initial?.fileName);

  const reset = () => {
    setKind('note'); setTitle(''); setText(''); setItems([]); setTaskId(undefined);
    setFileDataUrl(undefined); setFileName(undefined);
  };

  const save = () => {
    if (!title.trim()) return;
    const base = {
      title: title.trim(),
      text: kind === 'note' ? text : undefined,
      items: kind === 'checklist' ? items : undefined,
      fileDataUrl: kind === 'document' ? fileDataUrl : undefined,
      fileName: kind === 'document' ? fileName : undefined,
      kind,
      taskId,
    };
    if (initial) {
      useStore.getState().updateMemo(initial.id, base);
    } else {
      useStore.getState().addMemo({
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...base,
      });
    }
    reset();
    onClose();
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setFileDataUrl(r.result as string);
      setFileName(f.name);
    };
    r.readAsDataURL(f);
  };

  return (
    <BottomSheet open={open} onClose={onClose} accent="turquoise" title={initial ? 'Modifier mémo' : 'Nouveau mémo'}>
      <div className="space-y-4">
        <div className="flex gap-2">
          {(['note', 'checklist', 'document'] as MemoKind[]).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className="brut-btn display flex-1 py-2"
              style={{
                background: kind === k ? '#00D4FF' : '#1A1A2E',
                color: kind === k ? '#0F0F1A' : '#F5F5F5',
                borderColor: '#00D4FF',
              }}
            >
              {kindEmoji(k)} {k === 'note' ? 'Note' : k === 'checklist' ? 'Liste' : 'Doc'}
            </button>
          ))}
        </div>

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre du mémo"
          className="display text-lg w-full px-3 py-2.5 rounded-brut bg-bg"
          style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
        />

        {kind === 'note' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Écris ton idée…"
            rows={6}
            className="display w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          />
        )}

        {kind === 'checklist' && (
          <div className="space-y-2">
            {items.map((it, idx) => (
              <div key={it.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={it.done}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...it, done: e.target.checked };
                    setItems(next);
                  }}
                  className="w-5 h-5 accent-accent-green"
                />
                <input
                  value={it.text}
                  onChange={(e) => {
                    const next = [...items];
                    next[idx] = { ...it, text: e.target.value };
                    setItems(next);
                  }}
                  className="flex-1 px-2 py-1.5 rounded-brut bg-bg"
                  style={{ border: '2px solid #F5F5F5' }}
                />
                <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-sub">
                  ✕
                </button>
              </div>
            ))}
            <BrutButton accent="turquoise" size="sm" onClick={() => setItems([...items, { id: crypto.randomUUID(), text: '', done: false }])}>
              + Item
            </BrutButton>
          </div>
        )}

        {kind === 'document' && (
          <div>
            <input type="file" accept="image/*,application/pdf" onChange={onFile} className="block text-sub" />
            {fileName && <p className="text-sub text-sm mt-2">📎 {fileName}</p>}
          </div>
        )}

        <div>
          <p className="display text-xs uppercase tracking-wider text-sub mb-2">Tâche associée — optionnel</p>
          <select
            value={taskId ?? ''}
            onChange={(e) => setTaskId(e.target.value || undefined)}
            className="display w-full px-3 py-2.5 rounded-brut bg-bg"
            style={{ border: '2px solid #F5F5F5', boxShadow: '4px 4px 0px #262626' }}
          >
            <option value="">Aucune</option>
            {tasks.filter((t) => !t.done).map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <BrutButton accent="green" size="lg" block onClick={save}>
          {initial ? 'Mettre à jour' : 'Créer le mémo ✅'}
        </BrutButton>
      </div>
    </BottomSheet>
  );
}

function MemoView({ memo, onClose, onEdit, onDelete }: { memo?: Memo; onClose: () => void; onEdit: (m: Memo) => void; onDelete: (id: string) => void }) {
  const updateMemo = useStore((s) => s.updateMemo);
  if (!memo) return null;

  return (
    <BottomSheet open={!!memo} onClose={onClose} accent="violet" title={`${kindEmoji(memo.kind)} ${memo.title}`}>
      <div className="space-y-4">
        {memo.kind === 'note' && <p className="whitespace-pre-wrap">{memo.text}</p>}
        {memo.kind === 'checklist' && (
          <div className="space-y-2">
            {(memo.items ?? []).map((it, idx) => (
              <label key={it.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={it.done}
                  onChange={(e) => {
                    const next = [...(memo.items ?? [])];
                    next[idx] = { ...it, done: e.target.checked };
                    updateMemo(memo.id, { items: next });
                  }}
                  className="w-5 h-5 accent-accent-green"
                />
                <span className={it.done ? 'line-through opacity-60' : ''}>{it.text}</span>
              </label>
            ))}
          </div>
        )}
        {memo.kind === 'document' && memo.fileDataUrl && (
          <div>
            {memo.fileDataUrl.startsWith('data:image') ? (
              <img src={memo.fileDataUrl} alt={memo.fileName} className="w-full rounded-brut" />
            ) : (
              <a
                href={memo.fileDataUrl}
                download={memo.fileName}
                className="display underline text-accent-yellow"
              >
                Télécharger {memo.fileName}
              </a>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <BrutButton accent="yellow" block onClick={() => onEdit(memo)}>Modifier ✏️</BrutButton>
          <BrutButton accent="coral" block onClick={() => onDelete(memo.id)}>Supprimer 🗑️</BrutButton>
        </div>
      </div>
    </BottomSheet>
  );
}
