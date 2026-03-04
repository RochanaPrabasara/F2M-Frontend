// src/Pages/buyer/BuyerMessage.tsx
import { useEffect, useState, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Send, MessageSquare, ShoppingBag, Trash2 } from 'lucide-react';
import { connectSocket, getSocket } from '../../services/socket.service';
import axiosInstance from '../../config/axios.config';
import authService from '../../services/auth.service';
import { useUnreadMessages } from '../../context/UnreadMessagesContext';
import ConversationMenu from '../../components/ConversationMenu';

interface Participant { id: string; fullName: string; role: string; }
interface ChatMessage { id: string; senderId: string; receiverId: string; text: string; read: boolean; createdAt: string; conversationId: string; }
interface Conversation { conversationId: string; participant: Participant; lastMessage: { text: string; createdAt: string }; unreadCount: number; }
type MessageWithNames = ChatMessage & {
  senderName?: string;
  receiverName?: string;
  sender?: { fullName?: string; role?: string };
  receiver?: { fullName?: string; role?: string };
};

export default function BuyerMessages() {
  const currentUser = authService.getCurrentUser();
  const myId = currentUser?.id || '';
  const { clearUnread, markRead, initUnread, setOpenConversation } = useUnreadMessages();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [convLoading, setConvLoading] = useState(true);
  const [msgLoading, setMsgLoading] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Conversation | null>(null);

  const selectedConvRef = useRef<Conversation | null>(null);

  const newMessageHandlerRef = useRef<((msg: ChatMessage) => void) | null>(null);
  const messageSentHandlerRef = useRef<((msg: ChatMessage) => void) | null>(null);
  const messageErrorHandlerRef = useRef<(() => void) | null>(null);
  const typingStartHandlerRef = useRef<((d: { senderId: string }) => void) | null>(null);
  const typingStopHandlerRef = useRef<((d: { senderId: string }) => void) | null>(null);

  const setSelectedConvAndRef = (conv: Conversation | null) => {
    selectedConvRef.current = conv;
    setSelectedConv(conv);
    setOpenConversation(conv ? conv.participant.id : null);
    if (conv) clearUnread(conv.participant.id);
  };

  useEffect(() => {
    return () => { setOpenConversation(null); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const location = useLocation();
  const navigate = useNavigate();
  const consumedChatState = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolveNameFromMessage = useCallback((msg: MessageWithNames, participantId: string): string | null => {
    const selected = selectedConvRef.current;
    if (selected?.participant.id === participantId && selected.participant.fullName) return selected.participant.fullName;
    if (msg.senderId === participantId) {
      return msg.sender?.fullName || msg.senderName || null;
    }
    if (msg.receiverId === participantId) {
      return msg.receiver?.fullName || msg.receiverName || null;
    }
    return null;
  }, []);

  const hydrateParticipant = useCallback(async (participantId: string) => {
    try {
      const res = await axiosInstance.get(`/api/messages/${participantId}`);
      const fullName = res.data.participant?.fullName;
      if (!fullName) return;

      setConversations((prev) => prev.map((c) => (
        c.participant.id === participantId
          ? {
              ...c,
              participant: {
                ...c.participant,
                fullName,
                role: res.data.participant.role || c.participant.role,
              },
            }
          : c
      )));

      setSelectedConv((prev) => {
        if (!prev || prev.participant.id !== participantId) return prev;
        const updated = {
          ...prev,
          participant: {
            ...prev.participant,
            fullName,
            role: res.data.participant.role || prev.participant.role,
          },
        };
        selectedConvRef.current = updated;
        return updated;
      });
    } catch {}
  }, []);

  // Socket setup
  useEffect(() => {
    const sock = connectSocket();
    const attachListeners = (s: ReturnType<typeof getSocket>) => {
      if (!s) return;

      const onNewMessage = (msg: ChatMessage) => {
        const namedMsg = msg as MessageWithNames;
        const currentConv = selectedConvRef.current;
        const isViewingThisSender = currentConv?.participant.id === msg.senderId;
        if (isViewingThisSender) {
          setMessages((m) => { if (m.some((x) => x.id === msg.id)) return m; return [...m, msg]; });
          axiosInstance.patch(`/api/messages/${msg.senderId}/read`).catch(() => {});
        }
        setConversations((prev) => {
          const existing = prev.find((c) => c.participant.id === msg.senderId);
          if (existing) {
            const updated = prev.map((c) => c.participant.id === msg.senderId
              ? { ...c, lastMessage: { text: msg.text, createdAt: msg.createdAt }, unreadCount: isViewingThisSender ? 0 : c.unreadCount + 1 }
              : c
            );
            return [
              updated.find((c) => c.participant.id === msg.senderId)!,
              ...updated.filter((c) => c.participant.id !== msg.senderId),
            ];
          }
          const resolvedName = resolveNameFromMessage(namedMsg, msg.senderId) || 'Farmer';
          const ph: Conversation = {
            conversationId: msg.conversationId,
            participant: { id: msg.senderId, fullName: resolvedName, role: namedMsg.sender?.role || 'farmer' },
            lastMessage: { text: msg.text, createdAt: msg.createdAt },
            unreadCount: isViewingThisSender ? 0 : 1,
          };
          if (!resolveNameFromMessage(namedMsg, msg.senderId)) hydrateParticipant(msg.senderId);
          return [ph, ...prev];
        });
      };
      if (newMessageHandlerRef.current) s.off('new-message', newMessageHandlerRef.current);
      newMessageHandlerRef.current = onNewMessage;
      s.on('new-message', onNewMessage);

      const onMessageSent = (msg: ChatMessage) => {
        const namedMsg = msg as MessageWithNames;
        setMessages((prev) => { if (prev.some((x) => x.id === msg.id)) return prev; return [...prev, msg]; });
        setConversations((prev) => {
          const existingByConversation = prev.find((c) => c.conversationId === msg.conversationId);
          const existingByParticipant = prev.find((c) => c.participant.id === msg.receiverId);
          const existing = existingByConversation || existingByParticipant;
          if (existing) {
            const updated = prev.map((c) => (
              c.conversationId === existing.conversationId
                ? { ...c, conversationId: msg.conversationId, lastMessage: { text: msg.text, createdAt: msg.createdAt } }
                : c
            ));
            return [
              updated.find((c) => c.conversationId === msg.conversationId || c.participant.id === msg.receiverId)!,
              ...updated.filter((c) => c.conversationId !== msg.conversationId && c.participant.id !== msg.receiverId),
            ];
          }
          const resolvedName = resolveNameFromMessage(namedMsg, msg.receiverId) || 'Farmer';
          const ph: Conversation = {
            conversationId: msg.conversationId,
            participant: { id: msg.receiverId, fullName: resolvedName, role: namedMsg.receiver?.role || 'farmer' },
            lastMessage: { text: msg.text, createdAt: msg.createdAt },
            unreadCount: 0,
          };
          if (!resolveNameFromMessage(namedMsg, msg.receiverId)) hydrateParticipant(msg.receiverId);
          return [ph, ...prev];
        });

        setSelectedConv((prev) => {
          if (!prev || prev.participant.id !== msg.receiverId) return prev;
          const updated = { ...prev, conversationId: msg.conversationId };
          selectedConvRef.current = updated;
          return updated;
        });

        setSending(false);
      };
      if (messageSentHandlerRef.current) s.off('message-sent', messageSentHandlerRef.current);
      messageSentHandlerRef.current = onMessageSent;
      s.on('message-sent', onMessageSent);

      const onMessageError = () => { setSending(false); alert('Failed to send message. Please try again.'); };
      if (messageErrorHandlerRef.current) s.off('message-error', messageErrorHandlerRef.current);
      messageErrorHandlerRef.current = onMessageError;
      s.on('message-error', onMessageError);

      const onTypingStart = ({ senderId }: { senderId: string }) => { if (selectedConvRef.current?.participant.id === senderId) setPartnerTyping(true); };
      if (typingStartHandlerRef.current) s.off('user-typing', typingStartHandlerRef.current);
      typingStartHandlerRef.current = onTypingStart;
      s.on('user-typing', onTypingStart);

      const onTypingStop = ({ senderId }: { senderId: string }) => { if (selectedConvRef.current?.participant.id === senderId) setPartnerTyping(false); };
      if (typingStopHandlerRef.current) s.off('user-stopped-typing', typingStopHandlerRef.current);
      typingStopHandlerRef.current = onTypingStop;
      s.on('user-stopped-typing', onTypingStop);
    };

    if (sock) attachListeners(sock);
    else { const t = setTimeout(() => attachListeners(getSocket()), 800); return () => clearTimeout(t); }

    return () => {
      const s = getSocket();
      if (s) {
        if (newMessageHandlerRef.current) s.off('new-message', newMessageHandlerRef.current);
        if (messageSentHandlerRef.current) s.off('message-sent', messageSentHandlerRef.current);
        if (messageErrorHandlerRef.current) s.off('message-error', messageErrorHandlerRef.current);
        if (typingStartHandlerRef.current) s.off('user-typing', typingStartHandlerRef.current);
        if (typingStopHandlerRef.current) s.off('user-stopped-typing', typingStopHandlerRef.current);
      }
    };
  }, [hydrateParticipant, resolveNameFromMessage]);

  // Load conversations
  useEffect(() => {
    axiosInstance.get('/api/messages/conversations')
      .then((r) => {
        const realConvs: Conversation[] = r.data.conversations || [];
        const map: Record<string, number> = {};
        realConvs.forEach((c) => { if (c.unreadCount > 0) map[c.participant.id] = c.unreadCount; });
        initUnread(map);
        setConversations((current) => {
          const merged = [...current];
          realConvs.forEach((real) => {
            const index = merged.findIndex(c => c.participant.id === real.participant.id);
            if (index !== -1) merged[index] = { ...merged[index], ...real, participant: { ...merged[index].participant, ...real.participant } };
            else merged.push(real);
          });
          merged.sort((a, b) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime());
          return merged;
        });
      })
      .catch((e) => console.error('Failed to load conversations:', e))
      .finally(() => setConvLoading(false));
  }, [initUnread]);

  // Auto-open from nav state
  useEffect(() => {
    if (convLoading) return;
    if (consumedChatState.current) return;
    if (!location.state?.openChatWith) return;
    consumedChatState.current = true;
    const { id, fullName } = location.state.openChatWith;
    setConversations((prev) => {
      const existingIndex = prev.findIndex(c => c.participant.id === id);
      if (existingIndex !== -1) { setSelectedConvAndRef(prev[existingIndex]); return prev; }
      const placeholder: Conversation = {
        conversationId: [myId, id].sort().join('_'),
        participant: { id, fullName, role: 'farmer' },
        lastMessage: { text: 'Starting new conversation...', createdAt: new Date().toISOString() },
        unreadCount: 0,
      };
      setSelectedConvAndRef(placeholder);
      return [placeholder, ...prev];
    });
    navigate(location.pathname, { replace: true, state: null });
  }, [convLoading, location.state, navigate, myId]);

  // Load messages when conversation selected
  useEffect(() => {
    if (!selectedConv) return;
    setMsgLoading(true);
    setMessages([]);
    setPartnerTyping(false);
    axiosInstance.get(`/api/messages/${selectedConv.participant.id}`)
      .then((r) => setMessages(r.data.messages || []))
      .catch((e) => console.error('Failed to load messages:', e))
      .finally(() => setMsgLoading(false));
    axiosInstance.patch(`/api/messages/${selectedConv.participant.id}/read`)
      .then(() => setConversations(prev => prev.map(c => c.conversationId === selectedConv.conversationId ? { ...c, unreadCount: 0 } : c)))
      .catch(() => {});
  }, [selectedConv?.conversationId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, partnerTyping]);

  const handleDeleteConversation = async (conv: Conversation) => {
    setDeletingId(conv.conversationId);
    setConfirmDelete(null);
    try {
      await axiosInstance.delete(`/api/messages/conversation/${conv.participant.id}`);
      markRead(conv.participant.id);
      setConversations(prev => prev.filter(c => c.conversationId !== conv.conversationId));
      if (selectedConvRef.current?.conversationId === conv.conversationId) { setSelectedConvAndRef(null); setMessages([]); }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
      alert('Failed to delete conversation. Please try again.');
    } finally { setDeletingId(null); }
  };

  const sendMessage = useCallback(() => {
    const text = input.trim();
    if (!text || !selectedConv || sending) return;
    const socket = getSocket();
    if (!socket || !socket.connected) { alert('Connection lost. Please refresh the page.'); return; }
    setSending(true);
    setInput('');
    socket.emit('typing-stop', { receiverId: selectedConv.participant.id });
    socket.emit('send-message', { receiverId: selectedConv.participant.id, text });
  }, [input, selectedConv, sending]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!selectedConv) return;
    const socket = getSocket(); if (!socket) return;
    socket.emit('typing-start', { receiverId: selectedConv.participant.id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => { socket.emit('typing-stop', { receiverId: selectedConv.participant.id }); }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => {
    const d = new Date(iso); const today = new Date(); const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const groupedMessages = messages.reduce<{ date: string; msgs: ChatMessage[] }[]>((acc, msg) => {
    const date = formatDate(msg.createdAt);
    const last = acc[acc.length - 1];
    if (last && last.date === date) { last.msgs.push(msg); } else { acc.push({ date, msgs: [msg] }); }
    return acc;
  }, []);

  const filteredConvs = conversations.filter(c => c.participant.fullName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-stone-50 rounded-2xl overflow-hidden shadow-sm border border-stone-200">

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 mx-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-stone-900 text-center mb-1">Delete Conversation</h3>
            <p className="text-sm text-stone-500 text-center mb-6">
              This conversation will be removed from your list (the other person will still see it).
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:bg-stone-50 transition-colors">Cancel</button>
              <button onClick={() => handleDeleteConversation(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors">Delete for me</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex h-full min-h-0">
        {/* Sidebar */}
        <div className="w-80 shrink-0 flex flex-col border-r border-stone-200 bg-white">
          <div className="px-5 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-stone-900 leading-none">Messages</h1>
                <p className="text-xs text-stone-400 mt-0.5">Chat with farmers</p>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
              <input type="text" placeholder="Search farmers..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-stone-400" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {convLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredConvs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center px-4">
                <ShoppingBag className="h-8 w-8 text-stone-300 mb-2" />
                <p className="text-sm text-stone-400">No conversations yet</p>
                <p className="text-xs text-stone-300 mt-1">Message a farmer to get started</p>
              </div>
            ) : (
              filteredConvs.map((conv) => {
                const isActive = selectedConv?.conversationId === conv.conversationId;
                const isDeleting = deletingId === conv.conversationId;
                return (
                  <div
                    key={conv.conversationId}
                    className={`relative group border-b border-stone-50 transition-all ${isActive ? 'bg-amber-50 border-l-2 border-l-amber-500' : 'hover:bg-stone-50'} ${isDeleting ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <button onClick={() => setSelectedConvAndRef(conv)} className="w-full px-4 py-3.5 flex items-start gap-3 text-left">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {conv.participant.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pr-8">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className={`text-sm font-semibold truncate ${isActive ? 'text-amber-800' : 'text-stone-800'}`}>{conv.participant.fullName}</p>
                          <span className="text-xs text-stone-400 shrink-0 ml-1">{formatTime(conv.lastMessage.createdAt)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-stone-500 truncate pr-2">{conv.lastMessage.text}</p>
                          {conv.unreadCount > 0 && (
                            <span className="shrink-0 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                              {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>

                    {/* ── Menu button — always rendered, visible on hover/active ── */}
                    <div className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                      <ConversationMenu
                        conversationId={conv.conversationId}
                        participantName={conv.participant.fullName}
                        accentColor="amber"
                        onDeleteClick={() => setConfirmDelete(conv)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedConv ? (
            <>
              <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-stone-100 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {selectedConv.participant.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-stone-900 text-sm leading-none">{selectedConv.participant.fullName}</p>
                  <p className="text-xs text-stone-400 mt-0.5 capitalize">
                    {selectedConv.participant.role}
                    {partnerTyping && <span className="text-amber-600 ml-1">· typing…</span>}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1 bg-stone-50">
                {msgLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                      <MessageSquare className="h-6 w-6 text-amber-500" />
                    </div>
                    <p className="text-stone-500 text-sm font-medium">No messages yet</p>
                    <p className="text-stone-400 text-xs mt-1">Say hello to get started!</p>
                  </div>
                ) : (
                  groupedMessages.map(({ date, msgs }) => (
                    <div key={date}>
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-stone-200" />
                        <span className="text-xs text-stone-400 font-medium px-2">{date}</span>
                        <div className="flex-1 h-px bg-stone-200" />
                      </div>
                      {msgs.map((msg, i) => {
                        const isMine = msg.senderId === myId;
                        const prevMsg = i > 0 ? msgs[i - 1] : null;
                        const showAvatar = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId);
                        return (
                          <div key={msg.id} className={`flex items-end gap-2 mb-1 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className="w-6 shrink-0">
                              {!isMine && showAvatar && (
                                <div className="w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold">
                                  {selectedConv.participant.fullName.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className={`max-w-[65%] group ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMine ? 'bg-amber-500 text-white rounded-br-sm' : 'bg-white text-stone-800 border border-stone-100 rounded-bl-sm'}`}>
                                {msg.text}
                              </div>
                              <span className="text-[10px] text-stone-400 mt-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
                {partnerTyping && (
                  <div className="flex items-end gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-linear-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {selectedConv.participant.fullName.charAt(0)}
                    </div>
                    <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="px-4 py-3 bg-white border-t border-stone-100">
                <div className="flex items-center gap-2 bg-stone-50 rounded-xl border border-stone-200 px-3 py-1.5 focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-400 transition-all">
                  <input ref={inputRef} type="text" value={input} onChange={handleInputChange} onKeyDown={handleKeyDown}
                    placeholder="Type a message…" className="flex-1 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none py-1.5" />
                  <button onClick={sendMessage} disabled={!input.trim() || sending}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${input.trim() && !sending ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm' : 'bg-stone-200 text-stone-400 cursor-not-allowed'}`}>
                    {sending ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 text-center mt-1.5">Press Enter to send</p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 text-center px-8">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <MessageSquare className="h-7 w-7 text-amber-500" />
              </div>
              <h3 className="text-stone-700 font-semibold text-base mb-1">Your messages</h3>
              <p className="text-stone-400 text-sm max-w-xs">Select a conversation from the left to start chatting with farmers</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}