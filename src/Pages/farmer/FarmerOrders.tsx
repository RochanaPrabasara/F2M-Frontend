// src/Pages/farmer/FarmerOrders.tsx
import { useEffect, useState } from 'react';
import { connectSocket, getSocket } from '../../services/socket.service';
import axiosInstance from '../../config/axios.config';
import { Tabs } from '../../components/ui/Tabs';
import { OrderCard } from '../../components/OrderCard';

export default function FarmerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const sock = connectSocket();
    loadOrders();

    const attachListeners = (s: ReturnType<typeof getSocket>) => {
      if (!s) return;

      s.on('new-order', (newOrder: any) => {
        setOrders((prev) => {
          if (prev.some((o) => o.id === newOrder.id)) return prev;
          return [{ ...newOrder, paymentProof: null }, ...prev];
        });
      });

      s.on('payment-proof-uploaded', (data: any) => {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== data.orderId) return o;
            return {
              ...o,
              status: 'payment_uploaded',
              paymentProof: {
                imageUrl: data.proofImage || '',
                amount: Number(data.amount) || 0,
                referenceNumber: data.reference || undefined,
                uploadedAt: data.uploadedAt || new Date().toISOString(),
              },
            };
          })
        );
      });

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
        s.off('new-order');
        s.off('payment-proof-uploaded');
        s.off('order-confirmed');
        s.off('order-completed');
      }
    };
  }, []);

  const loadOrders = async () => {
    try {
      const res = await axiosInstance.get('/api/orders/farmer');
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Failed to load farmer orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (orderId: string) => {
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/confirm-payment`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'confirmed' } : o))
      );
    } catch (err) {
      console.error('Confirm payment failed:', err);
      alert('Failed to confirm payment. Please try again.');
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      await axiosInstance.patch(`/api/orders/${orderId}/complete`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: 'completed' } : o))
      );
    } catch (err) {
      console.error('Complete order failed:', err);
      alert('Failed to complete order. Please try again.');
    }
  };

  // ── Live counts derived from orders state ──────────────────────────────────
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => ['pending', 'payment_pending', 'payment_uploaded'].includes(o.status)).length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    completed: orders.filter(o => o.status === 'completed').length,
  };

  // Live counts — re-derived every render from orders state
  const pendingCount   = orders.filter(o => ['pending', 'payment_pending', 'payment_uploaded'].includes(o.status)).length;
  const confirmedCount = orders.filter(o => o.status === 'confirmed').length;
  const completedCount = orders.filter(o => o.status === 'completed').length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return ['pending', 'payment_pending', 'payment_uploaded'].includes(order.status);
    if (activeTab === 'confirmed') return order.status === 'confirmed';
    if (activeTab === 'completed') return order.status === 'completed';
    return true;
  });

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Loading incoming orders...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-stone-900">Incoming Orders</h1>
        <p className="text-gray-600 mt-2">Manage buyer orders in real-time</p>
      </div>

      <Tabs
        tabs={[
          { id: 'all',       label: `All (${counts.all})` },
          { id: 'pending',   label: `Pending / Proof Received (${counts.pending})` },
          { id: 'confirmed', label: `Confirmed (${counts.confirmed})` },
          { id: 'completed', label: `Completed (${counts.completed})` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
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
                id: order.id || order.orderId,
                cropName: order.Listing?.name || order.cropName || 'Crop Order',
                date: order.createdAt || new Date().toISOString(),
                quantity: order.quantity || 0,
                unit: order.unit || order.Listing?.unit || 'units',
                totalPrice: order.totalPrice || 0,
                status: order.status || 'pending',
                paymentProof: order.paymentProof
                  ? {
                      imageUrl: order.paymentProof.imageUrl || '',
                      amount: Number(order.paymentProof.amount) || 0,
                      referenceNumber: order.paymentProof.referenceNumber || undefined,
                      uploadedAt: order.paymentProof.uploadedAt || '',
                    }
                  : null,
                buyerName: order.buyer?.fullName || order.buyerName || 'Buyer',
              }}
              userType="farmer"
              onConfirmPayment={handleConfirmPayment}
              onCompleteOrder={handleCompleteOrder}
            />
          ))
        )}
      </div>
    </div>
  );
}