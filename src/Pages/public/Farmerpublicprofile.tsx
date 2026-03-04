// src/Pages/public/FarmerPublicProfile.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Sprout, MessageSquare, ArrowLeft,
  Package, Star, ShoppingCart, Scale, BadgeCheck,
  TrendingUp, Award, Clock,
} from 'lucide-react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';
import axiosInstance from '../../config/axios.config';
import authService from '../../services/auth.service';

interface FarmerData {
  id: string;
  fullName: string;
  district: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  completedOrders: number;
  totalListings: number;
}

interface ListingData {
  id: string;
  name: string;
  price: number;
  unit: string;
  quantity: number;
  quality: string;
  image: string | null;
  location: string;
  createdAt: string;
}

export default function FarmerPublicProfile() {
  const { farmerId } = useParams<{ farmerId: string }>();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const [farmer, setFarmer] = useState<FarmerData | null>(null);
  const [listings, setListings] = useState<ListingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!farmerId) return;
    axiosInstance
      .get(`/api/profiles/farmer/${farmerId}`)
      .then((res) => {
        setFarmer(res.data.farmer);
        setListings(res.data.listings || []);
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, [farmerId]);

  const handleStartChat = () => {
    if (!farmer) return;
    const role = currentUser?.role || 'buyer';
    const route = role === 'farmer' ? '/farmer/messages' : '/buyer/messages';
    navigate(route, { state: { openChatWith: { id: farmer.id, fullName: farmer.fullName } } });
  };

  const joinedDate = farmer?.createdAt
    ? new Date(farmer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
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
        <div className="w-9 h-9 border-[3px] border-stone-200 border-t-green-600 rounded-full animate-spin" />
        <p className="text-stone-500 text-sm">Loading profile…</p>
      </div>
    </div>
  );

  /* ── Error ── */
  if (error || !farmer) return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <Sprout className="w-7 h-7 text-red-400" />
        </div>
        <p className="text-red-600 font-medium">{error || 'Farmer not found'}</p>
        <button onClick={() => navigate(-1)} className="text-green-600 hover:underline text-sm">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 relative">

      {/* ── PARTICLES BACKGROUND ── */}
      <Particles
        id="farmer-particles"
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
            color: { value: '#16a34a' },
            links: {
              color: '#22c55e',
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
          {/* Show Message button in nav on scroll for quick access */}
          {currentUser?.id !== farmer.id && (
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold transition-all shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Message Farmer</span>
              <span className="sm:hidden">Message</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-6 space-y-6 relative z-10">

        {/* ── HERO BANNER ── */}
        <div className="relative rounded-2xl overflow-hidden shadow-xl bg-linear-to-br from-green-900 via-green-800 to-green-700">
          {/* Grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-green-950/40 blur-2xl pointer-events-none" />

          <div className="relative z-10 px-4 sm:px-7 pt-8 pb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">

              {/* Avatar */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0">
                <div
                  className="absolute -inset-1 rounded-full animate-spin"
                  style={{ background: 'conic-gradient(from 0deg, #4ade80, #22c55e, #16a34a, #4ade80)', animationDuration: '8s' }}
                />
                <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-green-800">
                  <img
                    src={farmer.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.fullName)}&background=166534&color=ffffff&size=256`}
                    alt={farmer.fullName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm mb-3">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified Farmer
                </span>
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{farmer.fullName}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-green-100/75 text-sm mb-4">
                  <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{farmer.district}, Sri Lanka</span>
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Since {joinedDate}</span>
                </div>
                {farmer.bio && (
                  <p className="text-green-100/80 text-sm leading-relaxed max-w-lg">{farmer.bio}</p>
                )}
              </div>

              {/* CTA */}
              {currentUser?.id !== farmer.id && (
                <div className="shrink-0 mx-auto md:mx-0">
                  <button
                    onClick={handleStartChat}
                    className="flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 active:scale-95 transition-all shadow-lg text-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message Farmer
                  </button>
                </div>
              )}
            </div>

            {/* Stats strip */}
            <div className="grid grid-cols-3 border-t border-white/10 bg-white/6 backdrop-blur-sm -mx-4 sm:-mx-7 px-4 sm:px-7 mt-6 pt-0 rounded-b-none">
              {[
                { val: farmer.totalListings, lbl: 'Active Listings', icon: <Package className="w-4 h-4" /> },
                { val: farmer.completedOrders, lbl: 'Orders Completed', icon: <TrendingUp className="w-4 h-4" /> },
                { val: <span className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />4.9</span>, lbl: 'Rating', icon: <Award className="w-4 h-4" /> },
              ].map((s, i) => (
                <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
                  <span className="flex items-center justify-center text-xl font-bold text-white">{s.val}</span>
                  <span className="text-[0.62rem] sm:text-[0.68rem] uppercase tracking-widest text-white/50">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── LISTINGS SECTION ── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-green-600" />
              Available Crops
              <span className="text-sm font-normal text-stone-400">({listings.length})</span>
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-dashed border-green-200 flex items-center justify-center mx-auto mb-3">
                <Sprout className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-stone-600 font-medium">No active listings right now</p>
              <p className="text-stone-400 text-sm mt-1">Check back soon</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {listings.map((listing) => (
                <div
                  key={listing.id}
                  onClick={() => navigate(`/buyer/listing/${listing.id}`)}
                  className="group bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-stone-100 overflow-hidden">
                    <img
                      src={listing.image || 'https://via.placeholder.com/400x200?text=Crop'}
                      alt={listing.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                    {/* Grade badge */}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-stone-700 text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                      Grade {listing.quality}
                    </span>
                    {/* Time badge */}
                    <span className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[0.65rem] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {timeAgo(listing.createdAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-stone-900 text-base mb-1">{listing.name}</h3>
                    <p className="text-xs text-stone-500 flex items-center gap-1 mb-3">
                      <MapPin className="w-3 h-3" />{listing.location}
                    </p>

                    <div className="flex items-end justify-between pt-3 border-t border-stone-100">
                      <div>
                        <p className="text-lg font-bold text-green-700">LKR {Number(listing.price).toLocaleString()}</p>
                        <p className="text-xs text-stone-400">per {listing.unit}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-stone-700 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-stone-400" />
                          {listing.quantity} {listing.unit}
                        </p>
                        <p className="text-xs text-stone-400">available</p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/buyer/order/${listing.id}`); }}
                      className="mt-3 w-full py-2.5 bg-green-600 hover:bg-green-700 active:scale-95 text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-green-200"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Order Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── FLOATING CHAT BUTTON (mobile) ── */}
        {currentUser?.id !== farmer.id && (
          <div className="fixed bottom-6 right-6 z-40 md:hidden">
            <button
              onClick={handleStartChat}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-full shadow-xl shadow-green-300/40 font-semibold text-sm transition-all active:scale-95"
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