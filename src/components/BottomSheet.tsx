import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACCENT_HEX, AccentKey } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
  accent?: AccentKey;
  children: ReactNode;
  title?: string;
}

export default function BottomSheet({
  open,
  onClose,
  accent = 'yellow',
  children,
  title,
}: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-0 right-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto bg-card rounded-t-[20px]"
            style={{
              borderTop: `2px solid ${ACCENT_HEX[accent]}`,
              boxShadow: '0 -4px 0 #262626',
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1.5 w-12 rounded-full bg-sub/40" />
            </div>
            {title && (
              <h2 className="display text-2xl px-5 pb-2 pt-1">{title}</h2>
            )}
            <div className="px-5 pb-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
