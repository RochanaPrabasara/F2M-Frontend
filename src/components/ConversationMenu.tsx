// src/components/ConversationMenu.tsx
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Trash2 } from 'lucide-react';

interface Props {
  conversationId: string;
  participantName: string;
  onDeleteClick: () => void;
  accentColor?: 'green' | 'amber';
}

export default function ConversationMenu({
  conversationId,
  participantName,
  onDeleteClick,
  accentColor = 'green',
}: Props) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Track whether the open click itself has finished propagating
  const justOpenedRef = useRef(false);

  const openMenu = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();

    // Position dropdown below-left of button, clamped to viewport
    const dropdownWidth = 192;
    const dropdownHeight = 48;
    let top = rect.bottom + 4;
    let left = rect.right - dropdownWidth;

    // Clamp so dropdown never goes off-screen bottom
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = rect.top - dropdownHeight - 4;
    }
    // Clamp left
    if (left < 8) left = 8;

    setDropdownPos({ top, left });

    // Toggle: if already open just close
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    // Mark that we just opened — the close listener should ignore
    // the current event cycle to prevent instant self-close
    justOpenedRef.current = true;
  };

  // Close when clicking anywhere outside — but skip the very click that opened it
  useEffect(() => {
    if (!open) return;

    const handleClose = () => {
      if (justOpenedRef.current) {
        // This is the tail of the same click that opened — ignore it
        justOpenedRef.current = false;
        return;
      }
      setOpen(false);
    };

    // Use setTimeout so the close listener is registered AFTER the current
    // event has fully propagated — eliminates the instant-close race
    const t = setTimeout(() => {
      document.addEventListener('click', handleClose);
    }, 0);

    return () => {
      clearTimeout(t);
      document.removeEventListener('click', handleClose);
    };
  }, [open]);

  // Close on scroll so dropdown doesn't float away from its button
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('scroll', close, true);
    return () => window.removeEventListener('scroll', close, true);
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const hoverColor = accentColor === 'amber' ? 'hover:bg-amber-100' : 'hover:bg-green-100';

  return (
    <>
      <button
        ref={buttonRef}
        onClick={openMenu}
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 ${hoverColor} transition-colors`}
        title="More options"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {open &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              top: dropdownPos.top,
              left: dropdownPos.left,
              zIndex: 9999,
              width: '12rem',
            }}
            // Stop clicks inside the dropdown from reaching the close listener
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-xl border border-stone-100 py-1 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
          >
            <button
              onClick={() => {
                setOpen(false);
                onDeleteClick();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5 flex-shrink-0" />
              Delete Conversation
            </button>
          </div>,
          document.body
        )}
    </>
  );
}