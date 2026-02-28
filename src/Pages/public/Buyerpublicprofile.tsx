// src/Pages/public/BuyerPublicProfile.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, ShoppingBag, MessageSquare, ArrowLeft,
  Star, Megaphone, Tag, Scale, Clock, BadgeCheck,
  TrendingUp, Award,
} from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import axiosInstance from '../../config/axios.config';
import authService from '../../services/auth.service';

interface BuyerData {
  id: string;
  fullName: string;
  district: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  completedOrders: number;
  totalRequests: number;
}

interface RequestData {
  id: string;
  cropName: string;
  quantity: number;
  unit: string;
  maxPrice: number;
  location: string;
  description: string | null;
  createdAt: string;
}

export default function BuyerPublicProfile() {
  const { buyerId } = useParams<{ buyerId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const [buyer, setBuyer] = useState<BuyerData | null>(null);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!buyerId) return;
    axiosInstance
      .get(`/api/profiles/buyer/${buyerId}`)
      .then((res) => {
        setBuyer(res.data.buyer);
        setRequests(res.data.requests || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [buyerId]);

  const handleStartChat = () => {
    if (!buyer) return;
    const role = currentUser?.role || 'farmer';
    const route = role === 'buyer' ? '/buyer/messages' : '/farmer/messages';
    navigate(route, { state: { openChatWith: { id: buyer.id, fullName: buyer.fullName } } });
  };

  const joinedDate = buyer?.createdAt
    ? new Date(buyer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';

  const timeAgo = (iso: string) => {
    const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  /* ── Loading ── */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-9 h-9 border-[3px] border-stone-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !buyer) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-red-600 font-medium">{error || 'Buyer not found'}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 relative">

      {/* ── PARTICLES BACKGROUND ── */}
      <Particles
        id="buyer-particles"
        init={particlesInit}
        options={{
          background: { color: { value: '#fafaf9' } },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: { enable: true, mode: 'grab' },
              onClick: { enable: true, mode: 'push' },
            },
            modes: {
              grab: { distance: 200, links: { opacity: 0.4 } },
              push: { quantity: 4 },
            },
          },
          particles: {
            color: { value: '#2563eb' },
            links: {
              color: '#3b82f6',
              distance: 150,
              enable: true,
              opacity: 0.3,
              width: 1,
            },
            move: { enable: true, speed: 0.5 },
            number: { density: { enable: true, area: 800 }, value: 80 },
            opacity: { value: 0.5 },
            size: { value: { min: 1, max: 3 } },
          },
          detectRetina: true,
        }}
        className="absolute inset-0 z-0"
      />

      {/* ── TOP NAV BAR ── */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-stone-200/60 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-stone-500 hover:text-stone-800 text-sm font-medium transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          {currentUser?.id !== buyer.id && (
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message Buyer
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6 relative z-10">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-700">
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-blue-950/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 px-7 pt-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* Avatar */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0">
                <div
                  className="absolute -inset-1 rounded-full animate-spin"
                  style={{ background: 'conic-gradient(from 0deg, #818cf8, #6366f1, #3b82f6, #818cf8)', animationDuration: '8s' }}
                />
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-blue-800">
                  <img
                    src={buyer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(buyer.fullName)}&background=1e40af&color=ffffff&size=256`}
                    alt={buyer.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm mb-3">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified Buyer
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{buyer.fullName}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-blue-100/75 text-sm mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{buyer.district}, Sri Lanka</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Since {joinedDate}</span>
                </div>
                {buyer.bio && (
                  <p className="text-blue-100/80 text-sm leading-relaxed max-w-lg">{buyer.bio}</p>
                )}
              </div>

              {/* CTA */}
              {currentUser?.id !== buyer.id && (
                <div className="shrink-0 mx-auto md:mx-0">
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-2 bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 active:scale-95 transition-all shadow-lg text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Buyer
                  </button>
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 border-t border-white/10 bg-white/[0.06] backdrop-blur-sm -mx-7 px-7 mt-6">
              {[
                { val: buyer.totalRequests, lbl: 'Active Requests', icon: <Megaphone className="w-4 h-4" /> },
                { val: buyer.completedOrders, lbl: 'Orders Completed', icon: <TrendingUp className="w-4 h-4" /> },
                { val: <span className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />4.9</span>, lbl: 'Rating', icon: <Award className="w-4 h-4" /> },
              ].map((s, i) => (
                <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
                  <span className="flex items-center justify-center text-xl font-bold text-white">{s.val}</span>
                  <span className="text-[0.68rem] uppercase tracking-widest text-white/50">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── REQUESTS SECTION ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Active Requests
              <span className="text-sm font-normal text-stone-400">({requests.length})</span>
            </h2>
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center mx-auto mb-3">
                <Megaphone className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-stone-600 font-medium">No active requests right now</p>
              <p className="text-stone-400 text-sm mt-1">This buyer hasn't posted any crop requests yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
                >
                  {/* Colored accent top */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />

                  {/* Header strip with crop name + time */}
                  <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-2 border-b border-stone-50">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <ShoppingBag className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="font-bold text-stone-900 text-base leading-tight">{req.cropName}</h3>
                    </div>
                    <span className="flex items-center gap-1 text-[0.65rem] text-stone-400 shrink-0 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(req.createdAt)}
                    </span>
                  </div>

                  <div className="p-5">
                    {req.description && (
                      <p className="text-xs text-stone-500 mb-4 leading-relaxed line-clamp-2 bg-stone-50 rounded-lg px-3 py-2">
                        {req.description}
                      </p>
                    )}

                    {/* Key details */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 flex items-center gap-1.5">
                          <Scale className="w-3.5 h-3.5 text-stone-400" />
                          Quantity needed
                        </span>
                        <span className="text-xs font-semibold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full">
                          {req.quantity} {req.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-stone-400" />
                          Max price
                        </span>
                        <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full">
                          LKR {Number(req.maxPrice).toLocaleString()} / {req.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-stone-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-stone-400" />
                          Location
                        </span>
                        <span className="text-xs font-medium text-stone-700">{req.location}</span>
                      </div>
                    </div>

                    {/* Respond button */}
                    {currentUser?.id !== buyer.id && (
                      <button
                        onClick={handleStartChat}
                        className="mt-4 w-full py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-200"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Respond to Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FLOATING CHAT BUTTON (mobile) ── */}
        {currentUser?.id !== buyer.id && (
          <div className="fixed bottom-6 right-6 z-40 md:hidden">
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-full shadow-xl shadow-blue-300/40 font-semibold text-sm transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
        )}

      </div>
    </div>
  );
}