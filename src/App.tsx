import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from './store/useStore';
import AvatarCreator from './screens/AvatarCreator';
import Home from './screens/Home';
import RouteScreen from './screens/RouteScreen';
import Tasks from './screens/Tasks';
import Memos from './screens/Memos';
import Settings from './screens/Settings';
import PlanDay from './screens/PlanDay';
import CloseDay from './screens/CloseDay';
import Focus from './screens/Focus';
import BottomNav, { TabKey } from './components/BottomNav';

type Modal =
  | { kind: 'plan' }
  | { kind: 'close' }
  | { kind: 'focus'; taskId: string }
  | { kind: 'avatar' }
  | null;

export default function App() {
  const avatar = useStore((s) => s.avatar);
  const bootstrapped = useStore((s) => s.bootstrapped);
  const [tab, setTab] = useState<TabKey>('home');
  const [modal, setModal] = useState<Modal>(null);

  useEffect(() => {
    if (!avatar) return;
    if (!bootstrapped) useStore.setState({ bootstrapped: true });
  }, [avatar, bootstrapped]);

  const openPlan = () => setModal({ kind: 'plan' });
  const openClose = () => setModal({ kind: 'close' });
  const openFocus = (taskId: string) => setModal({ kind: 'focus', taskId });
  const openAvatarEditor = () => setModal({ kind: 'avatar' });
  const closeModal = () => setModal(null);

  if (!avatar) {
    return (
      <AvatarCreator
        onSave={(a) => {
          useStore.getState().setAvatar(a);
          useStore.getState().setBootstrapped(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg text-ink font-body">
      <main className="max-w-screen-sm mx-auto safe-bottom">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === 'home' && (
              <Home
                onPlan={openPlan}
                onClose={openClose}
                onFocus={openFocus}
                onGoTasks={() => setTab('tasks')}
              />
            )}
            {tab === 'route' && <RouteScreen onFocus={openFocus} />}
            {tab === 'tasks' && <Tasks onFocus={openFocus} />}
            {tab === 'memos' && <Memos />}
            {tab === 'settings' && (
              <Settings onEditAvatar={openAvatarEditor} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={tab} onChange={setTab} />
      <AnimatePresence>
        {modal?.kind === 'plan' && <PlanDay onClose={closeModal} />}
        {modal?.kind === 'close' && <CloseDay onClose={closeModal} />}
        {modal?.kind === 'focus' && (
          <Focus taskId={modal.taskId} onClose={closeModal} />
        )}
        {modal?.kind === 'avatar' && (
          <AvatarCreator
            initial={avatar}
            isEdit
            onSave={(a) => {
              useStore.getState().setAvatar(a);
              closeModal();
            }}
            onCancel={closeModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
