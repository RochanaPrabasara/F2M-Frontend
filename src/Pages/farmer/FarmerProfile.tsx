// src/Pages/farmer/FarmerProfile.tsx
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, User, Pencil, Camera, Sprout, Wallet,
  Shield, ChevronDown, Check, X, Phone, Mail, FileText, BadgeCheck,
} from 'lucide-react';

import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { CropCard } from '../../components/CropCard';
import { BankAccountManager } from '../../components/BankAccountManager';

import authService from '../../services/auth.service';
import { getMyListings, type Listing } from '../../services/listing.service';
import axiosInstance from '../../config/axios.config';

interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  branchName?: string;
  isPrimary: boolean;
  isActive: boolean;
  addedDate: string;
}

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

export default function FarmerProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ fullName: '', phone: '', district: '', bio: '' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'listings' | 'finance'>('listings');

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
        const myListings = await getMyListings();
        setListings(myListings);
        const bankRes = await axiosInstance.get('/api/bank-accounts');
        if (bankRes.data.success) setBankAccounts(bankRes.data.accounts || []);
      } catch (err: any) {
        console.error('Profile load error:', err);
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
    if (!avatarPreview || !user) return;
    try {
      const { avatar } = await authService.uploadAvatar(avatarPreview);
      setUser({ ...user, avatar });
      setShowAvatarModal(false);
      setAvatarPreview(null);
    } catch (err: any) {
      alert(err.message || 'Avatar upload failed');
    }
  };

  const handleAddAccount = async (data: any) => {
    try {
      const res = await axiosInstance.post('/api/bank-accounts', data);
      if (res.data.success) setBankAccounts([...bankAccounts, res.data.account]);
    } catch { alert('Failed to add bank account'); }
  };

  const handleEditAccount = async (id: string, updates: any) => {
    try {
      const res = await axiosInstance.patch(`/api/bank-accounts/${id}`, updates);
      if (res.data.success) setBankAccounts(bankAccounts.map(a => a.id === id ? res.data.account : a));
    } catch { alert('Failed to update bank account'); }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!window.confirm('Delete this account?')) return;
    try {
      const res = await axiosInstance.delete(`/api/bank-accounts/${id}`);
      if (res.data.success) setBankAccounts(bankAccounts.filter(a => a.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const acc = bankAccounts.find(a => a.id === id);
      if (!acc) return;
      const res = await axiosInstance.patch(`/api/bank-accounts/${id}`, { isActive: !acc.isActive });
      if (res.data.success) setBankAccounts(bankAccounts.map(a => a.id === id ? res.data.account : a));
    } catch { alert('Failed to update status'); }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      const res = await axiosInstance.patch(`/api/bank-accounts/${id}/primary`);
      if (res.data.success) setBankAccounts(bankAccounts.map(a => ({ ...a, isPrimary: a.id === id })));
    } catch { alert('Failed to set primary'); }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    : '—';

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-stone-500">
      <div className="w-9 h-9 border-[3px] border-stone-200 border-t-green-600 rounded-full animate-spin" />
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
        {/* Ambient glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-green-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-green-950/50 blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6 px-4 sm:px-8 pt-8 pb-6">
          {/* Avatar with spinning ring */}
          <div className="relative w-28 h-28 md:w-32 md:h-32 shrink-0 mx-auto md:mx-0 group">
            <div
              className="absolute -inset-1 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, #4ade80, #22c55e, #16a34a, #4ade80)',
                animationDuration: '8s',
              }}
            />
            <div className="relative z-10 w-full h-full rounded-full overflow-hidden border-2 border-white/20 bg-green-800">
              <img
                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=166534&color=ffffff&size=256`}
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
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>

          {/* Name + meta */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">{user.fullName}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-x-5 gap-y-1.5 text-green-100/75 text-sm mb-4">
              <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{user.district}, Sri Lanka</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Joined {joinedDate}</span>
              {user.email && <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{user.email}</span>}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-white border border-white/20 backdrop-blur-sm">
                <BadgeCheck className="w-3.5 h-3.5" />
                Verified Farmer
              </span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-green-200/60 hover:text-white underline transition-colors"
              >
                Change photo
              </button>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative z-10 grid grid-cols-3 border-t border-white/10 bg-white/6 backdrop-blur-sm">
          {[
            { val: listings.length, lbl: 'Active Listings' },
            { val: bankAccounts.filter(a => a.isActive).length, lbl: 'Bank Accounts' },
            { val: user.district, lbl: 'Region' },
          ].map((s, i) => (
            <div key={i} className={`py-4 text-center ${i < 2 ? 'border-r border-white/10' : ''}`}>
              <span className="block text-xl font-bold text-white">{s.val}</span>
              <span className="text-[0.68rem] uppercase tracking-widest text-white/50">{s.lbl}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── LEFT: Profile Info ── */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-md overflow-hidden">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 sm:px-6 py-4 border-b border-stone-100">
            <h2 className="text-sm font-semibold text-stone-800 flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              Profile Information
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 text-stone-500 text-xs font-semibold hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-all"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-stone-500 text-xs font-medium hover:bg-stone-100 transition-colors"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-xs font-semibold shadow-sm transition-all"
                >
                  <Check className="w-3 h-3" />
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className="px-4 sm:px-6 py-5 space-y-5">

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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
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
                    className="w-full appearance-none px-3.5 py-2.5 pr-9 rounded-xl border border-stone-200 text-sm text-stone-800 font-medium outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all cursor-pointer bg-white"
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
                  placeholder="Tell buyers a little about your farm…"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm text-stone-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all resize-none leading-relaxed"
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

        {/* ── RIGHT: Tabs + Scrollable Content ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-md flex flex-col min-h-0 lg:min-h-150">
          {/* Tab bar */}
          <div className="px-4 sm:px-6 pt-5 border-b border-stone-100 shrink-0">
            <Tabs
              tabs={[
                { id: 'listings', label: 'My Listings' },
                { id: 'finance', label: 'Financial Details' },
              ]}
              activeTab={activeTab}
              onChange={(id) => setActiveTab(id as 'listings' | 'finance')}
            />
          </div>

          {/* Tab content area */}
          <div className="flex-1 p-4 sm:p-6">

            {/* LISTINGS TAB */}
            {activeTab === 'listings' && (
              listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-dashed border-green-200 flex items-center justify-center">
                    <Sprout className="w-7 h-7 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-800">No listings yet</h3>
                  <p className="text-sm text-stone-500 max-w-xs">
                    Create your first crop listing to start selling directly to buyers.
                  </p>
                  <button
                    onClick={() => navigate('/farmer/listings')}
                    className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm shadow-green-200 transition-all hover:-translate-y-0.5"
                  >
                    <Sprout className="w-4 h-4" />
                    Add Your First Listing
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:max-h-125 md:overflow-y-auto md:pr-2">
                  {listings.map((l) => (
                    <CropCard key={l.id} listing={l} editable />
                  ))}
                </div>
              )
            )}

            {/* FINANCE TAB */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                {/* Header info box */}
                <div className="flex items-start gap-4 p-5 rounded-xl bg-linear-to-br from-green-50 to-emerald-50 border border-green-200">
                  <div className="p-2.5 rounded-xl bg-green-600 text-white shrink-0 shadow-sm">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900 flex items-center gap-2 mb-1">
                      Bank Accounts
                      <span className="text-[0.62rem] font-bold uppercase tracking-wider text-green-700 bg-green-100 border border-green-300 px-2 py-0.5 rounded-full">
                        🔒 Secure
                      </span>
                    </h3>
                    <p className="text-sm text-green-800 leading-relaxed">
                      Your primary account is automatically shared with buyers when they confirm orders.
                    </p>
                  </div>
                </div>

                {/* Scrollable bank accounts */}
                <div className="md:max-h-100 md:overflow-y-auto md:pr-2">
                  <BankAccountManager
                    accounts={bankAccounts}
                    onAdd={handleAddAccount}
                    onEdit={handleEditAccount}
                    onDelete={handleDeleteAccount}
                    onToggleActive={handleToggleActive}
                    onSetPrimary={handleSetPrimary}
                  />
                </div>

                {/* Security card */}
                <div className="p-5 rounded-xl bg-stone-50 border border-stone-200">
                  <h4 className="flex items-center gap-2 text-sm font-semibold text-stone-800 mb-3">
                    <Shield className="w-4 h-4 text-green-600" />
                    Security & Privacy
                  </h4>
                  <ul className="space-y-2.5">
                    {[
                      'Bank details encrypted & stored securely',
                      'Never shown on your public profile',
                      'Only shared after order confirmation',
                    ].map(text => (
                      <li key={text} className="flex items-center gap-2.5 text-sm text-stone-600">
                        <span className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Check className="w-2.5 h-2.5 text-green-600" />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
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
                    background: 'conic-gradient(from 0deg, #4ade80, #22c55e, #16a34a, #4ade80)',
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
            This photo will appear on your profile and public listings.
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
              className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              Save Photo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}