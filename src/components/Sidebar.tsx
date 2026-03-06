// src/components/Sidebar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sprout, ShoppingBag, MessageSquare,
  User, LogOut, Search, Megaphone, Loader2, Menu, X, ChevronRight,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/useAuth';
import { LogoutConfirmModal } from './LogoutConfirmModal';
import { useUnreadMessages } from '../context/UnreadMessagesContext';
import { LanguageSwitcher } from './LanguageSwitcher';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const { totalUnread } = useUnreadMessages();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  if (!user) return null;

  const isOnMessages =
    location.pathname === '/farmer/messages' ||
    location.pathname === '/buyer/messages';

  const badgeCount = isOnMessages ? 0 : totalUnread;
  const badgeLabel = badgeCount > 99 ? '99+' : badgeCount > 0 ? String(badgeCount) : null;

  const farmerLinks = [
    { icon: LayoutDashboard, label: t('Dashboard'),   path: '/farmer/dashboard', badge: false },
    { icon: Megaphone,       label: t('Buyer Needs'), path: '/farmer/needs',     badge: false },
    { icon: Sprout,          label: t('My Listings'), path: '/farmer/listings',  badge: false },
    { icon: ShoppingBag,     label: t('Orders'),      path: '/farmer/orders',    badge: false },
    { icon: MessageSquare,   label: t('Messages'),    path: '/farmer/messages',  badge: true  },
    { icon: User,            label: t('Profile'),     path: '/farmer/profile',   badge: false },
  ];

  const buyerLinks = [
    { icon: LayoutDashboard, label: t('Dashboard'),    path: '/buyer/dashboard',  badge: false },
    { icon: Search,          label: t('Browse Crops'), path: '/buyer/browse',     badge: false },
    { icon: Megaphone,       label: t('Post Need'),    path: '/buyer/needs',      badge: false },
    { icon: ShoppingBag,     label: t('My Orders'),    path: '/buyer/orders',     badge: false },
    { icon: MessageSquare,   label: t('Messages'),     path: '/buyer/messages',   badge: true  },
    { icon: User,            label: t('Profile'),      path: '/buyer/profile',    badge: false },
  ];

  const links = user.role === 'farmer' ? farmerLinks : buyerLinks;

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user.fullName || 'User'
  )}&background=16a34a&color=fff`;

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setIsLoggingOut(true);
    try { await logout(); }
    catch (err) { console.error('Logout failed:', err); }
    finally { setIsLoggingOut(false); }
  };

  // ── Shared sidebar content ────────────────────────────────────────────────
  const NavContent = () => (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Brand — top */}
      <div className="shrink-0 px-6 py-5 flex items-center gap-3 border-b border-stone-100">
        <div className="bg-green-600 p-1.5 rounded-xl shadow-sm">
          <Sprout className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-stone-900 tracking-tight">Farm2Market</span>
      </div>

      {/* Nav links — scrollable middle */}
      <nav className="flex-1 min-h-0 overflow-y-auto px-3 py-4 flex flex-col gap-0.5">
        {links.map((link, i) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.path;
          const showBadge = link.badge && badgeLabel !== null;

          return (
            <Link
              key={link.path}
              to={link.path}
              style={{ animationDelay: `${i * 40}ms` }}
              className={`
                group relative flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-150 ease-out select-none
                ${isActive
                  ? 'bg-green-600 text-white shadow-md shadow-green-200'
                  : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                }
              `}
            >
              <Icon
                className={`shrink-0 transition-transform duration-150 ${
                  isActive
                    ? 'text-white'
                    : 'text-stone-400 group-hover:text-stone-600 group-hover:scale-110'
                }`}
                style={{ width: '1.125rem', height: '1.125rem' }}
              />
              <span className={`flex-1 text-sm font-medium ${isActive ? 'text-white' : ''}`}>
                {link.label}
              </span>
              {showBadge && (
                <span
                  key={badgeLabel}
                  className="badge-pop badge-pulse inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none shadow-sm"
                >
                  {badgeLabel}
                </span>
              )}
              {!isActive && !showBadge && (
                <ChevronRight className="h-3.5 w-3.5 text-stone-300 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User info + Logout — pinned to bottom */}
      <div className="shrink-0 border-t border-stone-100 px-3 py-3 space-y-1">
        <div className="px-1 py-1">
          <LanguageSwitcher compact className="w-full justify-between" />
        </div>
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50 border border-stone-100">
          <img
            src={avatarUrl}
            alt={user.fullName}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-green-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-stone-800 truncate leading-tight">{user.fullName}</p>
            <p className="text-[11px] text-stone-400 capitalize leading-tight">{user.role}</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-500 ring-2 ring-green-100 shrink-0" title="Online" />
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          disabled={isLoggingOut}
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-150
            ${isLoggingOut
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'text-red-500 hover:bg-red-50 hover:text-red-600 active:bg-red-100'
            }
          `}
        >
          {isLoggingOut
            ? <><Loader2 className="h-4 w-4 animate-spin" /><span>{t('Logging out…')}</span></>
            : <><LogOut className="h-4 w-4" /><span>{t('Logout')}</span></>
          }
        </button>
      </div>

    </div>
  );

  return (
    <>
      <style>{`
        @keyframes badgePop {
          0%   { transform: scale(0);   opacity: 0; }
          65%  { transform: scale(1.3); opacity: 1; }
          82%  { transform: scale(0.88);            }
          100% { transform: scale(1);  opacity: 1; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.45); }
          50%       { box-shadow: 0 0 0 5px rgba(239,68,68,0);  }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .badge-pop    { animation: badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .badge-pulse  { animation: badgePulse 2s ease-in-out infinite; }
        .sidebar-slide { animation: slideInLeft 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both; }
        .overlay-fade  { animation: fadeIn 0.22s ease both; }
      `}</style>

      {/* ── Mobile top bar ─────────────────────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-stone-200 flex items-center px-4 h-14 gap-3 shadow-sm">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-stone-600 hover:bg-stone-100 transition-colors"
          aria-label={t('Open menu')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2 flex-1">
          <div className="bg-green-600 p-1 rounded-lg">
            <Sprout className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-stone-900">Farm2Market</span>
        </div>

        {badgeLabel && (
          <span className="badge-pop inline-flex items-center justify-center min-w-5.5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
            {badgeLabel}
          </span>
        )}

        <img
          src={avatarUrl}
          alt={user.fullName}
          className="h-8 w-8 rounded-full object-cover ring-2 ring-green-200"
        />
      </header>

      {/* ── Mobile drawer overlay ───────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          onClick={() => setMobileOpen(false)}
        >
          <div className="overlay-fade absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div
            className="sidebar-slide relative w-72 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
              aria-label={t('Close menu')}
            >
              <X className="h-4 w-4" />
            </button>
            <NavContent />
          </div>
        </div>
      )}

      {/* ── Desktop sidebar ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-stone-200 fixed left-0 top-0 bottom-0 z-30">
        <NavContent />
      </aside>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
}