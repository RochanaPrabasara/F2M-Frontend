// src/components/BankAccountManager.tsx
import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { ChevronDown, Plus, Pencil, Trash2, Star, CheckCircle2, X, Building } from 'lucide-react';

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

interface BankAccountManagerProps {
  accounts: BankAccount[];
  onAdd: (data: Omit<BankAccount, 'id' | 'addedDate' | 'isPrimary' | 'isActive'>) => void;
  onEdit: (id: string, updates: Partial<BankAccount>) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string) => void;
  onSetPrimary: (id: string) => void;
}

const SRI_LANKA_BANKS = [
  { name: "Bank of Ceylon", logo: "/assets/banks/bank-of-ceylon.png" },
  { name: "Commercial Bank", logo: "/assets/banks/commercial-bank-of-ceylon.png" },
  { name: "Hatton National Bank", logo: "/assets/banks/Hatton_National_Bank_.jpg" },
  { name: "Sampath Bank", logo: "/assets/banks/sampath.png" },
  { name: "People's Bank", logo: "/assets/banks/Peoplesbanklk.png" },
  { name: "National Savings Bank", logo: "/assets/banks/NSB-bank.jpg" },
  { name: "Seylan Bank", logo: "/assets/banks/seylan.jpg" },
  { name: "Nations Trust Bank", logo: "/assets/banks/NTB.jpg" },
  { name: "DFCC Bank", logo: "/assets/banks/dfcc.png" },
  { name: "NDB Bank", logo: "/assets/banks/ndb.jpeg" },
  { name: "Union Bank", logo: "/assets/banks/union.jpeg" },
  { name: "Pan Asia Bank", logo: "/assets/banks/panbank.png" },
  { name: "Amana Bank", logo: "/assets/banks/amana.jpg" },
];

export function BankAccountManager({
  accounts,
  onAdd,
  onEdit,
  onDelete,
  onToggleActive,
  onSetPrimary,
}: BankAccountManagerProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
  });

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

  const resetForm = () => {
    setForm({
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      branchName: '',
    });
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (acc: BankAccount) => {
    setForm({
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      accountHolderName: acc.accountHolderName,
      branchName: acc.branchName || '',
    });
    setEditingId(acc.id);
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.bankName.trim() || !form.accountNumber.trim() || !form.accountHolderName.trim()) {
      alert('Please fill in Bank Name, Account Number, and Account Holder Name');
      return;
    }

    if (editingId) {
      onEdit(editingId, form);
    } else {
      onAdd(form);
    }

    setShowModal(false);
    resetForm();
  };

  const handleFormChange = (updates: Partial<typeof form>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const activeCount = accounts.filter(a => a.isActive).length;
  const primaryAccount = accounts.find(a => a.isPrimary);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Bank Accounts</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeCount} active account{activeCount !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="bg-gray-50/70 border border-dashed border-gray-300 rounded-2xl p-6 sm:p-12 text-center">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">No bank accounts yet</h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Add your bank details securely to receive payments from crop sales.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            Add First Account
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {accounts.map(acc => {
            const bankInfo = SRI_LANKA_BANKS.find(b => b.name === acc.bankName);

            return (
              <div
                key={acc.id}
                className={`
                  p-5 rounded-xl border transition-all duration-200
                  ${acc.isPrimary
                    ? 'border-green-500/60 bg-linear-to-r from-green-50 to-white shadow-green-100/50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'}
                  ${!acc.isActive ? 'opacity-65 grayscale-[0.4]' : ''}
                `}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    {bankInfo?.logo ? (
                      <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center p-1.5 shadow-sm">
                        <img
                          src={bankInfo.logo}
                          alt={acc.bankName}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <Building className="w-7 h-7" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                        <h4 className="font-semibold text-gray-900 text-lg truncate">{acc.bankName}</h4>
                        {acc.isPrimary && (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                            <Star className="w-3.5 h-3.5 fill-green-700" />
                            Primary
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-1.5 text-sm">
                        <div>
                          <span className="text-gray-500">Holder:</span>{' '}
                          <span className="font-medium text-gray-800">{acc.accountHolderName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Account:</span>{' '}
                          <span className="font-mono text-gray-800">•••• {acc.accountNumber.slice(-4)}</span>
                        </div>
                        {acc.branchName && (
                          <div className="col-span-1 sm:col-span-2">
                            <span className="text-gray-500">Branch:</span>{' '}
                            <span className="text-gray-800">{acc.branchName}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-400 mt-3">
                        Added {new Date(acc.addedDate).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex w-full sm:w-auto items-center justify-end gap-1 sm:-mr-2 shrink-0 border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0">
                    {!acc.isPrimary && acc.isActive && (
                      <button
                        onClick={() => onSetPrimary(acc.id)}
                        className="p-2.5 rounded-lg hover:bg-blue-50 text-blue-600 hover:text-blue-700 transition-colors"
                        title="Set as primary"
                      >
                        <Star className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => onToggleActive(acc.id)}
                      className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors"
                      title={acc.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {acc.isActive ? (
                        <X className="w-5 h-5 text-red-600" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-2.5 rounded-lg hover:bg-indigo-50 text-indigo-600 hover:text-indigo-700 transition-colors"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(acc.id)}
                      className="p-2.5 rounded-lg hover:bg-red-50 text-red-600 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {primaryAccount && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-green-800">
          <strong>Primary Account:</strong> {primaryAccount.bankName} •••• {primaryAccount.accountNumber.slice(-4)} will be automatically shared with buyers when they place orders.
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          resetForm();
        }}
        title={editingId ? 'Edit Bank Account' : 'Add Bank Account'}
      >
        <div className="space-y-6 mt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Bank Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={form.bankName}
                onChange={e => handleFormChange({ bankName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200/50 bg-white shadow-sm appearance-none"
              >
                <option value="">Select a bank</option>
                {SRI_LANKA_BANKS.map(bank => (
                  <option key={bank.name} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {form.bankName && (
              <div className="mt-3 flex items-center gap-3 text-sm text-gray-700">
                {SRI_LANKA_BANKS.find(b => b.name === form.bankName)?.logo && (
                  <div className="w-10 h-10 rounded border border-gray-200 bg-white flex items-center justify-center p-1">
                    <img
                      src={SRI_LANKA_BANKS.find(b => b.name === form.bankName)?.logo}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                <span className="font-medium">{form.bankName}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={e => handleFormChange({ accountNumber: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200/50 shadow-sm"
              placeholder="Enter full account number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Account Holder Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.accountHolderName}
              onChange={e => handleFormChange({ accountHolderName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200/50 shadow-sm"
              placeholder="Name as registered with the bank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Branch Name (optional)
            </label>
            <input
              type="text"
              value={form.branchName}
              onChange={e => handleFormChange({ branchName: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200/50 shadow-sm"
              placeholder="e.g. Nugegoda Branch"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            🔒 Your bank details are encrypted and will only be shared with verified buyers after an order is confirmed.
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="flex-1 border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !form.bankName.trim() ||
                !form.accountNumber.trim() ||
                !form.accountHolderName.trim()
              }
              className={`flex-1 px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                !form.bankName.trim() ||
                !form.accountNumber.trim() ||
                !form.accountHolderName.trim()
                  ? 'bg-green-400 text-white cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white shadow-sm hover:shadow'
              }`}
            >
              {editingId ? 'Update Account' : 'Add Account'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}