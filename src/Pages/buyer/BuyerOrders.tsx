// src/Pages/buyer/BuyerOrders.tsx
import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { connectSocket, getSocket } from '../../services/socket.service';
import axiosInstance from '../../config/axios.config';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { OrderCard } from '../../components/OrderCard';

export default function BuyerOrders() {
  const location = useLocation();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showProofModal, setShowProofModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [bankLoading, setBankLoading] = useState(false);
  const [proofImage, setProofImage] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const consumedNavState = useRef(false);

  useEffect(() => {
    const sock = connectSocket();
    loadOrders();

    const attachListeners = (s: ReturnType<typeof getSocket>) => {
      if (!s) return;

      s.on('order-confirmed', ({ orderId }: { orderId: string }) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'confirmed' } : o))
        );
      });

      s.on('order-completed', ({ orderId }: { orderId: string }) => {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
        );
      });
    };

    if (sock) {
      attachListeners(sock);
    } else {
      const timer = setTimeout(() => attachListeners(getSocket()), 800);
      return () => clearTimeout(timer);
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off('order-confirmed');
        s.off('order-completed');
      }
    };
  }, []);

  useEffect(() => {
    if (
      !consumedNavState.current &&
      location.state?.openBankFor &&
      !loading &&
      orders.length > 0
    ) {
      consumedNavState.current = true;
      const orderId: string = location.state.openBankFor;
      const passedBank = location.state.bankDetails || null;
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setBankDetails(passedBank);
        setShowBankModal(true);
      }
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, orders, loading, navigate, location.pathname]);

  const loadOrders = async () => {
    try {
      const res = await axiosInstance.get('/api/orders/my');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBankDetails = async (farmerId: string) => {
    setBankLoading(true);
    setBankDetails(null);
    try {
      const res = await axiosInstance.get(`/api/bank-accounts/farmer/${farmerId}`);
      const accounts: any[] = res.data.accounts || [];
      const primary = accounts.find((a: any) => a.isPrimary) || accounts[0] || null;
      setBankDetails(primary);
    } catch (err) {
      console.error('Failed to fetch bank details:', err);
      setBankDetails(null);
    } finally {
      setBankLoading(false);
    }
  };

  const handleViewBank = (order: any) => {
    setSelectedOrder(order);
    setShowBankModal(true);
    const farmerId = order.Listing?.farmer?.id || order.farmerId || order.Listing?.farmerId || null;
    if (farmerId) {
      fetchBankDetails(farmerId);
    } else {
      setBankDetails(null);
      setBankLoading(false);
    }
  };

  const handleUploadProof = (order: any) => {
    setSelectedOrder(order);
    setAmount(order.totalPrice?.toString() || '');
    setProofImage('');
    setReference('');
    setShowProofModal(true);
  };

  const submitProof = async () => {
    if (!proofImage || !amount) return alert('Please fill all required fields');
    setSubmitting(true);
    try {
      await axiosInstance.post(`/api/orders/${selectedOrder.id}/payment-proof`, {
        amount,
        reference,
        image: proofImage,
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: 'payment_uploaded' } : o
        )
      );
      setShowProofModal(false);
    } catch (err) {
      alert('Failed to upload proof. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const closeBankModal = () => {
    setShowBankModal(false);
    setBankDetails(null);
  };

  // ── Live counts derived from orders state ──────────────────────────────────
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => ['pending', 'payment_pending', 'payment_uploaded'].includes(o.status)).length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'payment_pending', 'payment_uploaded'].includes(order.status);
    if (activeTab === 'confirmed') return order.status === 'confirmed';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  if (loading) return <div className="text-center py-20">Loading orders...</div>;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Track your purchases and payments</p>
      </div>

      <Tabs
        tabs={[
          { id: 'all',       label: `All (${counts.all})` },
          { id: 'pending',   label: `Pending Payment (${counts.pending})` },
          { id: 'confirmed', label: `Confirmed (${counts.confirmed})` },
          { id: 'completed', label: `Completed (${counts.completed})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
        mobileLayout="grid"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <p className="text-gray-500 text-lg">No orders in this category</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={{
                id: order.id,
                cropName: order.Listing?.name || order.cropName || 'Crop Order',
                date: order.createdAt || new Date().toISOString(),
                quantity: order.quantity,
                unit: order.Listing?.unit || order.unit || 'units',
                totalPrice: order.totalPrice,
                status: order.status,
                paymentProof: order.paymentProof,
                farmerName: order.Listing?.farmer?.fullName || order.farmerName || 'Seller',
                farmerId: order.farmerId || order.Listing?.farmer?.id || null,
              }}
              userType="buyer"
              onViewBankDetails={handleViewBank}
              onUploadPayment={handleUploadProof}
            />
          ))
        )}
      </div>

      {/* Bank Details Modal */}
      <Modal isOpen={showBankModal} onClose={closeBankModal} title="Bank Details">
        {selectedOrder && (
          <div className="space-y-6">
            <p className="text-amber-700 font-medium">
              Transfer <strong>LKR {selectedOrder.totalPrice?.toLocaleString() || '—'}</strong> to the farmer's account:
            </p>

            {bankLoading && (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-sm text-stone-500">Loading bank details…</p>
              </div>
            )}

            {!bankLoading && bankDetails && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-stone-600">Bank</p>
                    <p className="font-medium">{bankDetails.bankName || '—'}</p>
                  </div>
                  <div>
                    <p className="text-stone-600">Branch</p>
                    <p className="font-medium">{bankDetails.branchName || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-stone-600">Account Holder</p>
                    <p className="font-medium">{bankDetails.accountHolderName || '—'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-stone-600">Account Number</p>
                    <p className="font-mono font-bold text-lg">{bankDetails.accountNumber || '—'}</p>
                  </div>
                </div>
                <p className="text-xs text-green-700 italic">Primary account – recommended for transfer.</p>
              </div>
            )}

            {!bankLoading && !bankDetails && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
                <p className="text-amber-800 text-sm">
                  This farmer hasn't added a bank account yet.<br />
                  Please contact them directly to arrange payment.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={closeBankModal} className="flex-1 py-3 bg-stone-200 text-stone-800 rounded-lg hover:bg-stone-300 transition-colors">Close</button>
              {['pending', 'payment_pending'].includes(selectedOrder.status) && (
                <button
                  onClick={() => { closeBankModal(); handleUploadProof(selectedOrder); }}
                  className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Upload Proof Now
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Payment Proof Upload Modal */}
      <Modal isOpen={showProofModal} onClose={() => setShowProofModal(false)} title="Upload Payment Proof">
        {selectedOrder ? (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Amount Paid (LKR)</label>
              <input type="number" placeholder="Enter amount you transferred" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Reference Number (optional)</label>
              <input type="text" placeholder="Transaction reference (if any)" value={reference} onChange={(e) => setReference(e.target.value)} className="w-full border border-stone-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Payment Proof (screenshot / receipt)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setProofImage(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
            </div>
            {proofImage && (
              <div>
                <p className="text-sm text-stone-600 mb-2">Preview:</p>
                <img src={proofImage} alt="Payment proof preview" className="w-full max-h-64 object-contain rounded-lg border border-stone-200" />
              </div>
            )}
            <button
              onClick={submitProof}
              disabled={!proofImage || !amount || submitting}
              className={`w-full py-3 rounded-lg text-white font-medium transition-colors ${!proofImage || !amount || submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {submitting ? 'Submitting…' : 'Submit Proof'}
            </button>
          </div>
        ) : (
          <p className="text-center text-stone-600">No order selected.</p>
        )}
      </Modal>
    </div>
  );
}