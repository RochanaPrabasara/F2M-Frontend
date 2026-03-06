// src/components/LogoutConfirmModal.tsx
import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Modal } from './ui/Modal';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

export function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut,
}: LogoutConfirmModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('Confirm Logout')}
    >
      <div className="space-y-6 pt-2">
        <p className="text-stone-600">
          {t('Are you sure you want to log out of your account?')}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className={`
              px-5 py-2.5 text-sm font-medium text-stone-700 
              bg-white border border-stone-300 rounded-lg 
              hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-stone-200
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
          >
            {t('Cancel')}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoggingOut}
            className={`
              px-6 py-2.5 text-sm font-medium text-white 
              rounded-lg flex items-center gap-2 shadow-sm
              transition-colors
              ${isLoggingOut 
                ? 'bg-red-400 cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-200 focus:ring-offset-2'}
            `}
          >
            {isLoggingOut && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggingOut ? t('Logging out...') : t('Yes, Log Out')}
          </button>
        </div>
      </div>
    </Modal>
  );
}