// src/Pages/farmer/FarmerListings.tsx
import { useEffect, useMemo, useState } from 'react';
import { Plus, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ListingForm } from '../../components/ListingForm';
import type { ListingFormValues } from '../../components/ListingForm';
import { CropCard } from '../../components/CropCard';

import {
  createListing,
  getMyListings,
  updateListing,
  deleteListing,
} from '../../services/listing.service';
import type { Listing } from '../../services/listing.service';

export default function FarmerListings() {
  const [isModalOpen, setIsModalOpen]   = useState(false);
  const [listings, setListings]         = useState<Listing[]>([]);
  const [loading, setLoading]           = useState(true);
  const [submitting, setSubmitting]     = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [editing, setEditing]           = useState<Listing | null>(null);
  const [confirmOpen, setConfirmOpen]   = useState(false);
  const [deletingId, setDeletingId]     = useState<string | null>(null);
  const [deleting, setDeleting]         = useState(false);

  const handleOpenCreate = () => { setEditing(null); setIsModalOpen(true); };
  const handleOpenEdit   = (listing: Listing) => { setEditing(listing); setIsModalOpen(true); };
  const handleCloseModal = () => setIsModalOpen(false);

  useEffect(() => {
    let cancelled = false;
    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyListings();
        if (!cancelled) setListings(data);
      } catch (err) {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Failed to load listings';
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchListings();
    return () => { cancelled = true; };
  }, []);

  const initialFormData = useMemo<Partial<ListingFormValues> | undefined>(() => {
    if (!editing) return undefined;
    return {
      name:        editing.name,
      location:    editing.location,
      quantity:    String(editing.quantity ?? ''),
      unit:        editing.unit,
      price:       String(editing.price ?? ''),
      quality:     editing.quality,
      description: editing.description ?? '',
      image:       editing.image ?? '',
    };
  }, [editing]);

  const handleSubmitListing = async (data: ListingFormValues) => {
    const toastId = toast.loading(editing ? 'Updating listing…' : 'Creating listing…');
    try {
      setSubmitting(true);
      const payload = {
        name:        data.name,
        location:    data.location,
        quantity:    Number(data.quantity),
        unit:        data.unit,
        price:       Number(data.price),
        quality:     data.quality,
        description: data.description,
        image:       data.image || undefined,
      };

      if (editing) {
        const updated = await updateListing(editing.id, payload);
        setListings((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        toast.success(`"${updated.name}" updated successfully!`, { id: toastId });
      } else {
        const created = await createListing(payload);
        setListings((prev) => [created, ...prev]);
        toast.success(`"${created.name}" listing created! Buyers can now see it.`, { id: toastId });
      }

      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save listing';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const askDeleteListing = (id: string) => {
    setDeletingId(id);
    setConfirmOpen(true);
  };

  const cancelDelete = () => {
    if (deleting) return;
    setConfirmOpen(false);
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const listingName = listings.find((l) => l.id === deletingId)?.name ?? 'Listing';
    const toastId = toast.loading('Deleting listing…');
    try {
      setDeleting(true);
      await deleteListing(deletingId);
      setListings((prev) => prev.filter((x) => x.id !== deletingId));
      setConfirmOpen(false);
      setDeletingId(null);
      toast.success(`"${listingName}" has been deleted.`, { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete listing';
      toast.error(msg, { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">My Listings</h1>
          <p className="text-stone-500">Manage your crop inventory</p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center px-4 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium shadow-sm hover:bg-green-700 active:bg-green-800 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Listing
        </button>
      </div>

      {/* Inline page-level error (network/server) */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-10 text-stone-500 text-sm">
            Loading your listings...
          </div>
        ) : listings.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-xl border border-stone-100 shadow-sm py-10 px-4 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
                <Sprout className="h-6 w-6 text-stone-400" />
              </div>
              <h2 className="text-sm font-semibold text-stone-900 mb-1">
                You haven't added any listings yet
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-md mb-4">
                Once you add crop listings, buyers will be able to discover and
                order your produce directly from this platform.
              </p>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="inline-flex items-center px-4 py-2 rounded-lg border border-green-600 text-green-700 text-xs font-medium hover:bg-green-50 active:bg-green-100 transition-colors"
              >
                <Plus className="h-3 w-3 mr-2" />
                Add Your First Listing
              </button>
            </div>
          </div>
        ) : (
          listings.map((listing) => (
            <CropCard
              key={listing.id}
              listing={{
                id:       listing.id,
                name:     listing.name,
                location: listing.location,
                quantity: listing.quantity,
                unit:     listing.unit,
                price:    listing.price,
                quality:  listing.quality,
                status:   listing.status,
                image:    listing.image,
              }}
              editable
              onEdit={()   => handleOpenEdit(listing)}
              onDelete={() => askDeleteListing(listing.id)}
            />
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editing ? 'Edit Listing' : 'Add New Crop Listing'}
      >
        <ListingForm
          onSubmit={handleSubmitListing}
          onCancel={handleCloseModal}
          isLoading={submitting}
          initialData={initialFormData}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Listing"
        message="Are you sure you want to delete this listing?"
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        isLoading={deleting}
      />
    </div>
  );
}