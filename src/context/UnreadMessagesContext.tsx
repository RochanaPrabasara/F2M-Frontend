// src/context/UnreadMessagesContext.tsx
import {
  createContext, useContext, useEffect, useRef, useState, useCallback,
} from 'react';
import axiosInstance from '../config/axios.config';
import { connectSocket, onSocketReady } from '../services/socket.service';
import { AuthContext } from './AuthContext';

interface UnreadCtx {
  totalUnread: number;
  incrementUnread: (participantId: string) => void;
  clearUnread: (participantId: string) => void;
  markRead: (participantId: string) => void;
  initUnread: (map: Record<string, number>) => void;
  setOpenConversation: (participantId: string | null) => void;
}

const UnreadMessagesContext = createContext<UnreadCtx>({
  totalUnread: 0,
  incrementUnread: () => {},
  clearUnread: () => {},
  markRead: () => {},
  initUnread: () => {},
  setOpenConversation: () => {},
});

function mergeMax(
  a: Record<string, number>,
  b: Record<string, number>,
): Record<string, number> {
  const result: Record<string, number> = {};
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach((id) => {
    const v = Math.max(a[id] ?? 0, b[id] ?? 0);
    if (v > 0) result[id] = v;
  });
  return result;
}

export function UnreadMessagesProvider({ children }: { children: React.ReactNode }) {
  const auth = useContext(AuthContext);
  const userId = auth?.user?.id ?? null;

  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({});

  // null  = user is NOT on the messages page (always increment)
  // string = user is on messages page AND has this conversation open (skip)
  const openConvRef     = useRef<string | null>(null);
  const handlerRef      = useRef<((msg: any) => void) | null>(null);
  const attachedSockRef = useRef<any>(null);
  const seededRef       = useRef(false);

  // ── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) {
      setUnreadMap({});
      openConvRef.current   = null;
      seededRef.current     = false;
      if (attachedSockRef.current && handlerRef.current) {
        attachedSockRef.current.off('new-message', handlerRef.current);
      }
      handlerRef.current    = null;
      attachedSockRef.current = null;
      return;
    }

    connectSocket();

    const handler = (msg: { senderId: string }) => {
      // Only skip increment when the user has THIS specific conversation
      // open right now. openConvRef is set to null the moment they leave
      // the messages page (see setOpenConversation below).
      if (openConvRef.current === msg.senderId) return;

      setUnreadMap((prev) => ({
        ...prev,
        [msg.senderId]: (prev[msg.senderId] ?? 0) + 1,
      }));
    };
    handlerRef.current = handler;

    const unsubscribe = onSocketReady((sock) => {
      // Swap socket instances cleanly
      if (attachedSockRef.current && attachedSockRef.current !== sock && handlerRef.current) {
        attachedSockRef.current.off('new-message', handlerRef.current);
      }
      sock.off('new-message', handlerRef.current!);
      sock.on('new-message', handlerRef.current!);
      attachedSockRef.current = sock;

      // Seed once per login
      if (!seededRef.current) {
        seededRef.current = true;
        axiosInstance
          .get('/api/messages/conversations')
          .then((r) => {
            const map: Record<string, number> = {};
            (r.data.conversations ?? []).forEach((c: any) => {
              if (c.unreadCount > 0) map[c.participant.id] = c.unreadCount;
            });
            setUnreadMap((prev) => mergeMax(prev, map));
          })
          .catch(() => { seededRef.current = false; });
      }
    });

    return () => {
      unsubscribe();
      if (attachedSockRef.current && handlerRef.current) {
        attachedSockRef.current.off('new-message', handlerRef.current);
      }
      handlerRef.current      = null;
      attachedSockRef.current = null;
      seededRef.current       = false;
      setUnreadMap({});
      openConvRef.current     = null;
    };
  }, [userId]);

  // ── Public API ────────────────────────────────────────────────────────────

  const initUnread = useCallback((map: Record<string, number>) => {
    setUnreadMap((prev) => mergeMax(prev, map));
  }, []);

  /**
   * Message pages call this with the participant ID when a conversation is
   * opened, and with null when the page unmounts or conversation is closed.
   *
   * IMPORTANT: passing null resets the guard immediately so messages
   * arriving after navigation are never blocked.
   */
  const setOpenConversation = useCallback((participantId: string | null) => {
    // Always update the ref synchronously — this is the guard the handler reads
    openConvRef.current = participantId;

    if (participantId) {
      // Clear the badge for whoever is now open
      setUnreadMap((prev) => {
        if (!prev[participantId]) return prev;
        const next = { ...prev };
        delete next[participantId];
        return next;
      });
    }
  }, []);

  const incrementUnread = useCallback((participantId: string) => {
    setUnreadMap((prev) => ({
      ...prev,
      [participantId]: (prev[participantId] ?? 0) + 1,
    }));
  }, []);

  const clearUnread = useCallback((participantId: string) => {
    setUnreadMap((prev) => {
      if (!prev[participantId]) return prev;
      const next = { ...prev };
      delete next[participantId];
      return next;
    });
  }, []);

  const markRead = clearUnread;

  const totalUnread = Object.values(unreadMap).reduce((sum, n) => sum + n, 0);

  return (
    <UnreadMessagesContext.Provider
      value={{ totalUnread, incrementUnread, clearUnread, markRead, initUnread, setOpenConversation }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
}

export const useUnreadMessages = () => useContext(UnreadMessagesContext);