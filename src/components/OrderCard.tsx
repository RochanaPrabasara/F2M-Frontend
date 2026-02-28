// src/components/OrderCard.tsx
import { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  AlertCircle,
  Eye,
  Banknote,
} from 'lucide-react';
import { Card } from './ui/Card';
import { Modal } from './ui/Modal';

interface PaymentProof {
  imageUrl: string;
  amount: number;
  referenceNumber?: string;
  uploadedAt: string;
}

interface Order {
  id: string;
  cropName: string;
  date: string;
  quantity: number;
  unit: string;
  totalPrice: number;
  status: string;
  paymentProof?: PaymentProof | null;
  farmerName?: string;
  buyerName?: string;
  farmerId?: string | null;
}

interface OrderCardProps {
  order: Order;
  userType: 'farmer' | 'buyer';
  onUploadPayment?: (order: Order) => void;
  onViewBankDetails?: (order: Order) => void;
  onConfirmPayment?: (orderId: string) => void;
  onCompleteOrder?: (orderId: string) => void;
}

export function OrderCard({
  order,
  userType,
  onUploadPayment,
  onViewBankDetails,
  onConfirmPayment,
  onCompleteOrder,
}: OrderCardProps) {
  const [showProofModal, setShowProofModal] = useState(false);

  const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
    pending: {
      label: 'Awaiting Payment',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: AlertCircle,
    },
    payment_pending: {
      label: 'Awaiting Payment',
      bg: 'bg-amber-100',
      text: 'text-amber-700',
      icon: AlertCircle,
    },
    payment_uploaded: {
      label: userType === 'farmer' ? 'Proof Received – Review' : 'Proof Uploaded',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Upload,
    },
    confirmed: {
      label: 'Payment Confirmed',
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
    },
    shipped: {
      label: 'Shipped',
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      icon: Package,
    },
    completed: {
      label: 'Order Completed',
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: CheckCircle,
    },
    cancelled: {
      label: 'Cancelled',
      bg: 'bg-red-100',
      text: 'text-red-700',
      icon: XCircle,
    },
  };

  const status = statusConfig[order.status] || {
    label: order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' '),
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    icon: Clock,
  };

  const StatusIcon = status.icon;

  const counterpartName =
    userType === 'buyer' ? order.farmerName || 'Seller' : order.buyerName || 'Buyer';
  const counterpartLabel = userType === 'buyer' ? 'Seller' : 'Buyer';

  // ── Farmer: what action section to show ──────────────────────────────────────
  const farmerActionSection = () => {
    if (userType !== 'farmer') return null;

    // 1. New order – awaiting buyer payment
    if (['pending', 'payment_pending'].includes(order.status)) {
      return (
        <div className="pt-4 border-t border-stone-100">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-sm text-amber-700 flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Waiting for buyer to upload payment proof
            </p>
          </div>
        </div>
      );
    }

    // 2. Proof uploaded – show review UI (whether or not paymentProof object arrived yet)
    if (order.status === 'payment_uploaded') {
      return (
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900 mb-1 flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Payment Proof Received
            </p>
            <p className="text-xs text-blue-700">
              Review the proof and confirm if payment is received.
            </p>
          </div>

          {/* Only render detailed proof block when the imageUrl is present */}
          {order.paymentProof?.imageUrl ? (
            <div className="bg-stone-50 p-3 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-stone-700">Payment Details</p>
                <button
                  onClick={() => setShowProofModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                >
                  <Eye className="h-3 w-3" />
                  View Full Proof
                </button>
              </div>

              <div
                className="relative h-24 rounded overflow-hidden bg-stone-200 cursor-pointer"
                onClick={() => setShowProofModal(true)}
              >
                <img
                  src={order.paymentProof.imageUrl}
                  alt="Payment proof thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Amount paid:</span>
                  <span className="font-medium text-stone-900">
                    LKR {order.paymentProof.amount.toLocaleString()}
                  </span>
                </div>
                {order.paymentProof.referenceNumber && (
                  <div className="flex justify-between">
                    <span className="text-stone-500">Reference:</span>
                    <span className="font-medium text-stone-900">
                      {order.paymentProof.referenceNumber}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-stone-500">Uploaded:</span>
                  <span className="text-stone-600">
                    {order.paymentProof.uploadedAt
                      ? new Date(order.paymentProof.uploadedAt).toLocaleString()
                      : '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Status is payment_uploaded but proof object not yet arrived via WS — show placeholder
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-center">
              <p className="text-xs text-stone-500">Proof image loading…</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onConfirmPayment?.(order.id)}
              className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Payment
            </button>
            <button className="w-full py-2.5 px-4 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 active:bg-stone-100 transition-colors text-sm font-medium">
              Report Issue
            </button>
          </div>
        </div>
      );
    }

    // 3. Confirmed – ready for completion
    if (order.status === 'confirmed') {
      return (
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Payment Confirmed
            </p>
            <p className="text-xs text-green-700">Payment verified. Mark as completed after delivery.</p>
          </div>
          <button
            onClick={() => onCompleteOrder?.(order.id)}
            className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium"
          >
            Mark as Completed
          </button>
        </div>
      );
    }

    // 4. Completed
    if (order.status === 'completed') {
      return (
        <div className="pt-4 border-t border-stone-100 text-center">
          <p className="text-sm text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Order completed successfully!
          </p>
        </div>
      );
    }

    return null;
  };

  // ── Buyer: action section ────────────────────────────────────────────────────
  const buyerActionSection = () => {
    if (userType !== 'buyer') return null;

    return (
      <div className="pt-4 border-t border-stone-100 space-y-3">
        {['pending', 'payment_pending'].includes(order.status) && (
          <>
            <button
              onClick={() => onViewBankDetails?.(order)}
              className="w-full py-2.5 px-4 bg-white border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 active:bg-stone-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Banknote className="h-4 w-4" />
              View Bank Details
            </button>
            <button
              onClick={() => onUploadPayment?.(order)}
              className="w-full py-2.5 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Payment Proof
            </button>
          </>
        )}

        {order.status === 'payment_uploaded' && (
          <p className="text-sm text-amber-600 flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Waiting for farmer to confirm payment
          </p>
        )}

        {order.status === 'confirmed' && (
          <p className="text-sm text-green-600 flex items-center justify-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Payment confirmed! Order is being processed.
          </p>
        )}

        {order.status === 'completed' && (
          <p className="text-sm text-green-600 flex items-center justify-center gap-2 font-medium">
            <CheckCircle className="h-4 w-4" />
            Order completed successfully!
          </p>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-stone-900">{order.cropName}</h3>
            <p className="text-sm text-stone-500 mt-1">
              Order #{order.id.slice(0, 8)} •{' '}
              {new Date(order.date).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.label}
          </span>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
          <div>
            <p className="text-stone-500">Quantity</p>
            <p className="font-medium text-stone-900">
              {order.quantity} {order.unit || 'units'}
            </p>
          </div>
          <div>
            <p className="text-stone-500">Total Price</p>
            <p className="font-medium text-stone-900">
              LKR {order.totalPrice.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-stone-500">{counterpartLabel}</p>
            <p className="font-medium text-stone-900">{counterpartName}</p>
          </div>
        </div>

        {/* Action Sections */}
        {farmerActionSection()}
        {buyerActionSection()}
      </Card>

      {/* Full Proof Modal (farmer) */}
      {order.paymentProof?.imageUrl && (
        <Modal
          isOpen={showProofModal}
          onClose={() => setShowProofModal(false)}
          title="Payment Proof Details"
        >
          <div className="space-y-5">
            <div className="bg-stone-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-stone-700">Order Info</p>
                  <p className="text-xs text-stone-500">#{order.id.slice(0, 8)}</p>
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {order.cropName}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-stone-500">Order Total</p>
                  <p className="font-bold text-stone-900">
                    LKR {order.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-stone-500">Amount Paid</p>
                  <p className="font-bold text-green-600">
                    LKR {order.paymentProof.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              {order.paymentProof.referenceNumber && (
                <div>
                  <p className="text-xs text-stone-500">Reference</p>
                  <p className="font-mono text-sm font-medium text-stone-900">
                    {order.paymentProof.referenceNumber}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-stone-500">Uploaded At</p>
                <p className="text-sm text-stone-900">
                  {order.paymentProof.uploadedAt
                    ? new Date(order.paymentProof.uploadedAt).toLocaleString()
                    : '—'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-stone-700 mb-2">Receipt</p>
              <div className="rounded-lg overflow-hidden bg-stone-100 border-2 border-stone-200">
                <img
                  src={order.paymentProof.imageUrl}
                  alt="Payment proof"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>

            {userType === 'farmer' && order.status === 'payment_uploaded' && (
              <button
                onClick={() => {
                  onConfirmPayment?.(order.id);
                  setShowProofModal(false);
                }}
                className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm Payment Received
              </button>
            )}

            {order.status === 'confirmed' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800 flex items-center justify-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Payment already confirmed
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}