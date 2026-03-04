// src/Pages/buyer/BuyerPostNeed.tsx
import { useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { BuyerNeedForm } from '../../components/BuyerNeedForm';
import type { BuyerNeedFormValues } from '../../components/BuyerNeedForm';
import { BuyerNeedCard } from '../../components/BuyerNeedCard';

import {
  createBuyerNeed,
  getMyBuyerNeeds,
  updateBuyerNeed,
  deleteBuyerNeed,
} from '../../services/buyerNeed.service';
import type { BuyerNeed } from '../../services/buyerNeed.service';

export default function BuyerPostNeed() {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [needs, setNeeds]             = useState<BuyerNeed[]>([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [editing, setEditing]         = useState<BuyerNeed | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [deleting, setDeleting]       = useState(false);

  const handleOpenCreate = () => { setEditing(null); setIsModalOpen(true); };
  const handleOpenEdit   = (need: BuyerNeed) => { setEditing(need); setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const myNeeds = await getMyBuyerNeeds();
        if (!cancelled) setNeeds(myNeeds);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : t('Failed to load requests');
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const initialFormData = useMemo<Partial<BuyerNeedFormValues> | undefined>(() => {
    if (!editing) return undefined;
    return {
      cropName:    editing.cropName,
      quantity:    String(editing.quantity ?? ''),
      unit:        editing.unit,
      maxPrice:    String(editing.maxPrice ?? ''),
      location:    editing.location,
      urgency:     editing.urgency,
      description: editing.description,
    };
  }, [editing]);

  const handleSubmitNeed = async (data: BuyerNeedFormValues) => {
    const toastId = toast.loading(editing ? t('Updating request…') : t('Posting request…'));
    try {
      setSubmitting(true);
      const payload = {
        cropName:    data.cropName,
        quantity:    Number(data.quantity),
        unit:        data.unit,
        maxPrice:    Number(data.maxPrice),
        location:    data.location,
        urgency:     data.urgency as 'low' | 'medium' | 'high',
        description: data.description,
      };

      if (editing) {
        const updated = await updateBuyerNeed(editing.id, payload);
        setNeeds((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        toast.success(t('"{{name}}" request updated successfully!', { name: updated.cropName }), { id: toastId });
      } else {
        const created = await createBuyerNeed(payload);
        setNeeds((prev) => [created, ...prev]);
        toast.success(t('"{{name}}" request posted !!!', { name: created.cropName }), { id: toastId });
      }

      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('Failed to save request');
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const askDeleteNeed = (id: string) => { setDeletingId(id); setConfirmOpen(true); };

  const cancelDelete = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const needName = needs.find((n) => n.id === deletingId)?.cropName ?? t('Request');
    const toastId = toast.loading(t('Deleting request…'));
    try {
      setDeleting(true);
      await deleteBuyerNeed(deletingId);
      setNeeds((prev) => prev.filter((x) => x.id !== deletingId));
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success(t('"{{name}}" request has been deleted.', { name: needName }), { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : t('Failed to delete request');
      toast.error(msg, { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900">My Requests</h1>
          <p className="text-sm sm:text-base text-stone-500">Post what you need and let farmers come to you</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex w-full sm:w-auto justify-center items-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Post New Request
        </button>
      </div>

      {/* Info Card */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6">
        <h3 className="font-semibold text-green-900 mb-2">How it works</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• Post what vegetables you need with your budget</li>
          <li>• Farmers will see your request and can respond</li>
          <li>• You'll receive messages from interested farmers</li>
          <li>• Negotiate and finalize the deal directly</li>
        </ul>
      </div>

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-stone-500 text-sm">
            Loading your requests...
          </div>
        ) : needs.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-stone-500 text-sm sm:text-base">
              You haven't posted any requests yet
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-4 inline-flex items-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post Your First Request
            </button>
          </div>
        ) : (
          needs.map((need) => (
            <BuyerNeedCard
              key={need.id}
              need={need}
              editable
              onEdit={()   => handleOpenEdit(need)}
              onDelete={() => askDeleteNeed(need.id)}
            />
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editing ? 'Edit Request' : 'Post a New Request'}
      >
        <BuyerNeedForm
          onSubmit={handleSubmitNeed}
          onCancel={handleCloseModal}
          isLoading={submitting}
          initialData={initialFormData}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Request"
        message="Are you sure you want to delete this request?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
      />
    </div>
  );
}