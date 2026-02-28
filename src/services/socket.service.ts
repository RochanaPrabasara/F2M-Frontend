// src/services/socket.service.ts
import { io, Socket } from 'socket.io-client';
import { useEffect } from 'react';
import { SOCKET_URL } from '../config/api.config';   // ← was hardcoded 'http://localhost:4000'
import authService from './auth.service';

let socket: Socket | null = null;
let currentUserId: string | null = null;

// ---------------------------------------------------------------------------
// Ready-callback registry
// Any module can call onSocketReady(cb) to be notified the moment a socket
// is live (connected + room joined). The callback also fires immediately if
// the socket is already connected when onSocketReady is called.
// ---------------------------------------------------------------------------
type ReadyCb = (s: Socket) => void;
const readyCallbacks = new Set<ReadyCb>();

export const onSocketReady = (cb: ReadyCb): (() => void) => {
  readyCallbacks.add(cb);
  // Fire immediately if already connected
  if (socket?.connected) cb(socket);
  return () => readyCallbacks.delete(cb);
};

const notifyReady = () => {
  if (!socket) return;
  readyCallbacks.forEach((cb) => {
    try { cb(socket!); } catch {}
  });
};

// ---------------------------------------------------------------------------
// connectSocket  – idempotent, call from anywhere
// ---------------------------------------------------------------------------
export const connectSocket = (): Socket | null => {
  const user = authService.getCurrentUser();
  if (!user?.id) return null;

  // Same user, already connected — reuse
  if (socket?.connected && currentUserId === user.id) return socket;

  // Different user — tear down old socket
  if (socket && currentUserId !== user.id) {
    socket.disconnect();
    socket = null;
  }

  // Already connecting for same user — reuse
  if (socket && !socket.connected && currentUserId === user.id) return socket;

  currentUserId = user.id;

  socket = io(SOCKET_URL, {           // ← env-driven: localhost in dev, prod URL in build
    autoConnect: false,
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  const joinRoom = () => {
    socket?.emit('join', { userId: user.id, role: user.role });
    console.log(`[Socket] join emitted for ${user.id}`);
  };

  socket.on('connect', () => {
    console.log('[Socket] connected:', socket?.id);
    joinRoom();
    notifyReady();
  });

  // socket.io v4 — reconnect fires on the Manager
  socket.io.on('reconnect', () => {
    console.log('[Socket] reconnected');
    joinRoom();
    notifyReady();
  });

  socket.on('joined', (room: string) => {
    console.log('[Socket] joined room:', room);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] connect_error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnected:', reason);
  });

  socket.connect();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    currentUserId = null;
  }
};

export const getSocket = (): Socket | null => socket;

// Hook for components that just need a connected socket
export const useSocket = (): Socket | null => {
  useEffect(() => { connectSocket(); }, []);
  return getSocket();
};