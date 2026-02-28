// src/Pages/buyer/BuyerProfile.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, User, Pencil, Camera,
  Star, Megaphone, ChevronDown, Check, X, Phone, Mail,
  FileText, BadgeCheck,
} from 'lucide-react';

import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { BuyerNeedCard } from '../../components/BuyerNeedCard';

import authService from '../../services/auth.service';
import { getMyBuyerNeeds, type BuyerNeed } from '../../services/buyerNeed.service';

interface User {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  district: string;
  bio?: string | null;
  avatar?: string | null;
  createdAt: string;
}

const SRI_LANKA_DISTRICTS = [
  'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha',
  'Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kilinochchi','Kurunegala',
  'Mannar','Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya','Polonnaruwa',
  'Puttalam','Ratnapura','Trincomalee','Vavuniya',
];

export default function BuyerProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<BuyerNeed[]>([]);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ fullName: '', phone: '', district: '', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'requests'>('requests');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const currentUser = await authService.getCurrentUserFromServer();
        setUser(currentUser);
        setForm({
          fullName: currentUser.fullName || '',
          phone: currentUser.phone || '',
          district: currentUser.district || '',
          bio: currentUser.bio || '',
        });
        const myRequests = await getMyBuyerNeeds();
        setRequests(myRequests || []);
      } catch (err: any) {
        console.error('Buyer profile load error:', err);
        if (err.message?.includes('401') || err.message?.includes('expired')) {
          authService.logout();
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await authService.updateProfile({
        fullName: form.fullName, phone: form.phone, district: form.district, bio: form.bio,
      });
      setUser(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setAvatarPreview(reader.result as string); setShowAvatarModal(true); };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (!avatarPreview || !user) { alert('No photo selected or user not loaded'); return; }
    try {
      const { avatar } = await authService.uploadAvatar(avatarPreview);
      const refreshedUser = await authService.getCurrentUserFromServer();
      setUser(refreshedUser);
      setShowAvatarModal(false);
      setAvatarPreview(null);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Avatar upload failed';
      alert(`Upload failed: ${errorMsg}`);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';

  const tabs = [{ id: 'requests', label: `My Requests (${requests.length})` }];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-500">
      <div className="w-9 h-9 border-[3px] border-stone-200 border-t-blue-600 rounded-full animate-spin" />
      <span className="text-sm">Loading your profile…</span>
    </div>
  );

  if (!user) return (
    <div className="flex items-center justify-center py-24 text-red-600 text-sm">
      Please log in to continue.
    </div>
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Hidden file input */}
      <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />

      {/* ── HERO BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-linear-to-br from-blue-900 via-blue-800 to-indigo-700">
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Ambient glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-indigo-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-blue-950/50 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 px-8 pt-8 pb-6">
          {/* Avatar with spinning ring */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0 group">
            <div
              className="absolute -inset-1 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, #818cf8, #6366f1, #3b82f6, #818cf8)',
                animationDuration: '8s',
              }}
            />
            <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-blue-800">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=1e40af&color=ffffff&size=256`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 z-20 rounded-full bg-black/55 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-7 h-7 text-white" />
            </button>
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{user.fullName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-blue-100/75 text-sm mb-4">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{user.district}, Sri Lanka</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {joinedDate}</span>
              {user.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified Buyer
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-blue-200/60 hover:text-white underline transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 border-t border-white/10 bg-white/6 backdrop-blur-sm">
          {[
            { val: requests.length, lbl: 'Active Requests' },
            { val: 0, lbl: 'Completed Orders' },
            { val: <span className="flex items-center justify-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" />4.9</span>, lbl: 'Rating' },
          ].map((s, i) => (
            <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <span className="flex items-center justify-center text-xl font-bold text-white">{s.val}</span>
              <span className="text-[0.68rem] uppercase tracking-widest text-white/50">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: Personal Info ── */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Personal Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-semibold hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Check className="w-3 h-3" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="px-6 py-5 space-y-5">

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                <User className="w-2.5 h-2.5" /> Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-transparent hover:border-stone-200 transition-colors min-h-10.5">
                  <User className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className={`text-sm font-medium ${user.fullName ? 'text-stone-800' : 'text-stone-400 italic'}`}>
                    {user.fullName || 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                <Phone className="w-2.5 h-2.5" /> Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 77 000 0000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-transparent hover:border-stone-200 transition-colors min-h-10.5">
                  <Phone className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className={`text-sm font-medium ${user.phone ? 'text-stone-800' : 'text-stone-400 italic'}`}>
                    {user.phone || 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Email — read-only */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                <Mail className="w-2.5 h-2.5" /> Email
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-50 min-h-10.5">
                <Mail className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                <span className="text-sm text-stone-500 flex-1 truncate">{user.email}</span>
                <span className="text-[0.62rem] font-semibold text-stone-400 bg-stone-200 px-2 py-0.5 rounded-md shrink-0">
                  Read-only
                </span>
              </div>
            </div>

            {/* District */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                <MapPin className="w-2.5 h-2.5" /> District
              </label>
              {isEditing ? (
                <div className="relative">
                  <select
                    value={form.district}
                    onChange={e => setForm({ ...form, district: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer bg-white"
                  >
                    <option value="">Select district…</option>
                    {SRI_LANKA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-stone-50 border border-transparent hover:border-stone-200 transition-colors min-h-10.5">
                  <MapPin className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                  <span className={`text-sm font-medium ${user.district ? 'text-stone-800' : 'text-stone-400 italic'}`}>
                    {user.district ? `${user.district}, Sri Lanka` : 'Not set'}
                  </span>
                </div>
              )}
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[0.68rem] font-semibold uppercase tracking-widest text-stone-400">
                <FileText className="w-2.5 h-2.5" /> About / Bio
              </label>
              {isEditing ? (
                <textarea
                  value={form.bio}
                  onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={4}
                  placeholder="Tell farmers a little about yourself…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
                />
              ) : (
                <div className="px-3.5 py-3 rounded-xl bg-stone-50 border border-transparent hover:border-stone-200 transition-colors min-h-22">
                  <p className={`text-sm leading-relaxed ${user.bio ? 'text-stone-700' : 'text-stone-400 italic'}`}>
                    {user.bio || 'No bio added yet. Click Edit to add one.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tabs + Requests ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md flex flex-col" style={{ minHeight: 600 }}>
          {/* Tab bar */}
          <div className="px-6 pt-5 border-b border-stone-100 shrink-0">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as 'requests')}
            />
          </div>

          {/* Tab content */}
          <div className="flex-1 p-6">
            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-dashed border-blue-200 flex items-center justify-center">
                    <Megaphone className="w-7 h-7 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">No Requests Yet</h3>
                  <p className="text-sm text-stone-500 max-w-xs">
                    Post what you need and let farmers respond directly.
                  </p>
                  <button
                    onClick={() => navigate('/buyer/post-request')}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-200 transition-all hover:-translate-y-0.5"
                  >
                    <Megaphone className="w-4 h-4" />
                    Post a Request
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-125 overflow-y-auto pr-2">
                  {requests.map((req) => (
                    <BuyerNeedCard key={req.id} need={req} editable={false} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* ── AVATAR MODAL ── */}
      <Modal
        isOpen={showAvatarModal}
        onClose={() => { setShowAvatarModal(false); setAvatarPreview(null); }}
        title="Update Profile Photo"
      >
        <div className="py-5 space-y-5">
          {avatarPreview && (
            <div className="flex justify-center">
              <div className="relative w-40 h-40">
                <div
                  className="absolute -inset-1 rounded-full animate-spin"
                  style={{
                    background: 'conic-gradient(from 0deg, #818cf8, #6366f1, #3b82f6, #818cf8)',
                    animationDuration: '8s',
                  }}
                />
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="relative z-10 w-full h-full rounded-full object-cover border-2 border-white"
                />
              </div>
            </div>
          )}
          <p className="text-center text-sm text-stone-500">
            This photo will be visible to farmers and on your public profile.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowAvatarModal(false); setAvatarPreview(null); }}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-600 text-sm font-semibold hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveAvatar}
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              Save Photo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}