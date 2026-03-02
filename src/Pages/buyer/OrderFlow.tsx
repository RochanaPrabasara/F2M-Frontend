// src/Pages/buyer/OrderFlow.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
  ShoppingCart,
  CreditCard,
  FileCheck,
  MapPin,
  Scale,
  User,
  Leaf,
  Copy,
  CheckCheck,
  AlertTriangle,
  Minus,
  Plus,
} from 'lucide-react';

// `Card` import removed — was unused and caused TypeScript build error (TS6133)
import { getListingById } from '../../services/listing.service';
import axiosInstance from '../../config/axios.config';

const STEPS = [
  { id: 1, title: 'Review',  icon: Package     },
  { id: 2, title: 'Details', icon: ShoppingCart },
  { id: 3, title: 'Confirm', icon: FileCheck    },
  { id: 4, title: 'Payment', icon: CreditCard   },
];

export default function OrderFlow() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();

  const [listing, setListing]                       = useState<any>(null);
  const [primaryBankAccount, setPrimaryBankAccount] = useState<any>(null);
  const [loading, setLoading]                       = useState(true);
  const [currentStep, setCurrentStep]               = useState(1);
  const [quantity, setQuantity]                     = useState('');
  const [location, setLocation]                     = useState('');
  const [notes, setNotes]                           = useState('');
  const [placingOrder, setPlacingOrder]             = useState(false);
  const [copiedField, setCopiedField]               = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!listingId) { navigate('/buyer/browse'); return; }
      try {
        setLoading(true);
        const listingData = await getListingById(listingId);
        setListing(listingData);
        setLocation(listingData.location || '');
        if (listingData?.farmer?.id) {
          try {
            const bankRes = await axiosInstance.get(`/api/bank-accounts/farmer/${listingData.farmer.id}`);
            const accounts = bankRes.data.accounts || [];
            const primary = accounts.find((acc: any) => acc.isPrimary === true);
            setPrimaryBankAccount(primary || accounts[0] || null);
          } catch (bankErr) {
            console.warn('Could not load farmer bank accounts:', bankErr);
          }
        }
      } catch (err: any) {
        console.error('Error loading listing:', err);
        navigate('/buyer/browse');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [listingId, navigate]);

  const totalPrice      = listing && quantity ? Number(quantity) * Number(listing.price) : 0;
  const isValidQuantity = quantity && Number(quantity) > 0 && Number(quantity) <= Number(listing?.quantity || 0);
  const quickQuantities = [5, 10, 25, 50].filter((q) => q <= Number(listing?.quantity || 0));

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handlePlaceOrder = async () => {
    if (!isValidQuantity) return;
    setPlacingOrder(true);
    try {
      const res = await axiosInstance.post('/api/orders', {
        listingId,
        quantity: Number(quantity),
        location,
        notes,
        totalPrice,
      });
      const newOrder = res.data.order;
      setCurrentStep(4);
      setTimeout(() => {
        navigate('/buyer/orders', {
          state: { openBankFor: newOrder.id, bankDetails: primaryBankAccount },
        });
      }, 2000);
    } catch (err: any) {
      console.error('[OrderFlow] Failed to place order:', err);
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg shadow-green-200 animate-pulse">
            <Leaf className="h-7 w-7 text-white" />
          </div>
          <p className="text-stone-500 text-sm font-medium">Loading crop details…</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-3" />
          <p className="text-stone-700 font-semibold">Crop not found</p>
        </div>
      </div>
    );
  }

  const progressPct = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  return (
    <>
      <style>{`
        @keyframes stepIn {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes successBurst {
          0%   { transform: scale(0);    opacity: 0; }
          60%  { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(1);    opacity: 1; }
        }
        .step-enter    { animation: stepIn 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .pop-enter     { animation: popIn 0.32s cubic-bezier(0.16,1,0.3,1) both; }
        .success-burst { animation: successBurst 0.55s cubic-bezier(0.34,1.56,0.64,1) both; }

        .glass-card {
          background: rgba(255,255,255,0.88);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(231,229,228,0.8);
        }
        .account-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #f0fdf4 100%);
          border: 1.5px solid #86efac;
        }
        .qty-input::-webkit-inner-spin-button,
        .qty-input::-webkit-outer-spin-button { -webkit-appearance: none; }
        .qty-input { -moz-appearance: textfield; }
        .step-connector-fill {
          transition: width 0.6s cubic-bezier(0.16,1,0.3,1);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-green-50/30 pb-16">

        {/* ── Sticky Progress Header ─────────────────────────────────────── */}
        <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-100 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">

            <button
              onClick={() => currentStep === 1 ? navigate('/buyer/browse') : setCurrentStep(currentStep - 1)}
              className="flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-sm font-medium mb-5 transition-colors group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              {currentStep === 1 ? 'Back to Browse' : 'Previous Step'}
            </button>

            {/* Step indicators */}
            <div className="relative">
              <div className="absolute top-5 left-[5%] right-[5%] h-0.5 bg-stone-100 z-0" />
              <div
                className="absolute top-5 left-[5%] h-0.5 bg-green-500 z-0 step-connector-fill"
                style={{ width: `${progressPct * 0.9}%` }}
              />
              <div className="relative z-10 flex justify-between">
                {STEPS.map((step) => {
                  const Icon  = step.icon;
                  const done  = currentStep > step.id;
                  const active = currentStep === step.id;
                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                        ${done   ? 'bg-green-600 border-green-600 shadow-md shadow-green-200 text-white' : ''}
                        ${active ? 'bg-green-600 border-green-600 ring-4 ring-green-100 scale-110 shadow-lg shadow-green-200 text-white' : ''}
                        ${!done && !active ? 'bg-white border-stone-200 text-stone-400' : ''}
                      `}>
                        {done ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                      </div>
                      <span className={`text-xs font-semibold hidden sm:block transition-colors ${active ? 'text-green-700' : 'text-stone-400'}`}>
                        {step.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Content ───────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">

          {/* ════ STEP 1 · REVIEW ════ */}
          {currentStep === 1 && (
            <div className="step-enter space-y-8">
              <div className="text-center">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Step 1 of 4</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">Review Product</h1>
                <p className="text-stone-500 mt-2 text-sm">Make sure this is what you want before continuing</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-lg border border-stone-100">
                  <img
                    src={listing.image || 'https://via.placeholder.com/600x400?text=Crop'}
                    alt={listing.name}
                    className="w-full h-64 lg:h-full object-cover"
                    style={{ minHeight: 280 }}
                  />
                </div>

                <div className="lg:col-span-3 glass-card rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-3xl font-bold text-stone-900">{listing.name}</h2>
                        {listing.farmer?.fullName && (
                          <p className="text-stone-500 mt-1 text-sm flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            Sold by <span className="font-semibold text-stone-700 ml-0.5">{listing.farmer.fullName}</span>
                          </p>
                        )}
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold uppercase tracking-wide">
                        Grade {listing.quality}
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-green-700">LKR {Number(listing.price).toLocaleString()}</span>
                      <span className="text-stone-400 text-sm ml-1">/ {listing.unit}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                      <Scale className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Available</p>
                        <p className="text-sm font-semibold text-stone-800">{listing.quantity} {listing.unit}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                      <MapPin className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-stone-400 font-medium">Location</p>
                        <p className="text-sm font-semibold text-stone-800 truncate">{listing.location}</p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentStep(2)}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl shadow-md shadow-green-200 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    Continue to Order <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ════ STEP 2 · DETAILS ════ */}
          {currentStep === 2 && (
            <div className="step-enter space-y-8">
              <div className="text-center">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Step 2 of 4</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">Order Details</h1>
                <p className="text-stone-500 mt-2 text-sm">Set your quantity and delivery information</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">

                  {/* Quantity */}
                  <div className="glass-card rounded-2xl p-6 shadow-md">
                    <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-green-600" /> Quantity ({listing.unit})
                    </h3>
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => setQuantity(q => String(Math.max(1, Number(q || 0) - 1)))}
                        className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={listing.quantity}
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="0"
                        className="qty-input flex-1 border border-stone-200 rounded-xl px-4 py-2.5 text-center text-xl font-bold text-stone-900 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                      />
                      <button
                        onClick={() => setQuantity(q => String(Math.min(Number(listing.quantity), Number(q || 0) + 1)))}
                        className="w-10 h-10 rounded-xl border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="flex justify-between text-xs text-stone-400 mb-4 px-1">
                      <span>Min: 1 {listing.unit}</span>
                      <span>Max: {listing.quantity} {listing.unit}</span>
                    </div>

                    {quantity && Number(quantity) > Number(listing.quantity) && (
                      <p className="text-xs text-red-500 flex items-center gap-1.5 mb-3">
                        <AlertTriangle className="h-3.5 w-3.5" /> Exceeds available quantity
                      </p>
                    )}

                    {quickQuantities.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {quickQuantities.map((q) => (
                          <button
                            key={q}
                            onClick={() => setQuantity(q.toString())}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              quantity === q.toString()
                                ? 'bg-green-600 text-white shadow-sm shadow-green-200'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {q} {listing.unit}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Location & Notes */}
                  <div className="glass-card rounded-2xl p-6 shadow-md space-y-5">
                    <h3 className="font-bold text-stone-800 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" /> Location & Notes
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">Your Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Colombo, Kandy…"
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-500 uppercase tracking-wide mb-2">
                        Notes <span className="text-stone-300 font-normal normal-case">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Special delivery instructions, preferred contact time…"
                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Sticky summary */}
                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-6 shadow-md sticky top-28">
                    <div className="flex items-center gap-3 pb-5 border-b border-stone-100">
                      <img
                        src={listing.image || 'https://via.placeholder.com/64'}
                        alt={listing.name}
                        className="w-14 h-14 rounded-xl object-cover border border-stone-100"
                      />
                      <div>
                        <p className="font-bold text-stone-800 text-sm">{listing.name}</p>
                        <p className="text-xs text-stone-400">Grade {listing.quality}</p>
                      </div>
                    </div>
                    <div className="py-4 space-y-3 text-sm">
                      <div className="flex justify-between text-stone-500">
                        <span>Price / {listing.unit}</span>
                        <span className="font-medium text-stone-700">LKR {Number(listing.price).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Quantity</span>
                        <span className="font-medium text-stone-700">{quantity || '—'} {listing.unit}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-stone-100 mb-5">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Total</span>
                        <span className="text-2xl font-bold text-green-700">
                          LKR {totalPrice > 0 ? totalPrice.toLocaleString() : '—'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      disabled={!isValidQuantity || !location.trim()}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2
                        ${!isValidQuantity || !location.trim()
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 hover:-translate-y-0.5'
                        }`}
                    >
                      Review Order <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(1)}
                className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          )}

          {/* ════ STEP 3 · CONFIRM ════ */}
          {currentStep === 3 && (
            <div className="step-enter space-y-8">
              <div className="text-center">
                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Step 3 of 4</p>
                <h1 className="text-3xl sm:text-4xl font-bold text-stone-900">Confirm Order</h1>
                <p className="text-stone-500 mt-2 text-sm">Review everything before placing your order</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">

                  <div className="glass-card rounded-2xl p-6 shadow-md">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Product</h3>
                    <div className="flex items-start gap-4">
                      <img
                        src={listing.image || 'https://via.placeholder.com/100'}
                        alt={listing.name}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-100 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-bold text-stone-900">{listing.name}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">Grade {listing.quality} · {listing.location}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                          <span className="bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium">
                            {quantity} {listing.unit}
                          </span>
                          <span className="text-stone-400">×</span>
                          <span className="text-stone-600">LKR {Number(listing.price).toLocaleString()}</span>
                          <span className="text-stone-400">=</span>
                          <span className="font-bold text-green-700">LKR {totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card rounded-2xl p-6 shadow-md">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Seller</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-stone-400 text-xs mb-0.5">Farmer Name</p>
                        <p className="font-semibold text-stone-800">{listing.farmer?.fullName || '—'}</p>
                      </div>
                      <div>
                        <p className="text-stone-400 text-xs mb-0.5">Location</p>
                        <p className="font-semibold text-stone-800">{listing.location}</p>
                      </div>
                      {location && (
                        <div>
                          <p className="text-stone-400 text-xs mb-0.5">Delivery To</p>
                          <p className="font-semibold text-stone-800">{location}</p>
                        </div>
                      )}
                      {notes && (
                        <div className="col-span-2">
                          <p className="text-stone-400 text-xs mb-0.5">Notes</p>
                          <p className="font-medium text-stone-700 text-xs bg-stone-50 rounded-lg p-2 border border-stone-100">{notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl p-5 bg-amber-50 border border-amber-200 flex gap-3">
                    <CreditCard className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">Payment after order</p>
                      <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                        Transfer the amount to the farmer's bank account after placing, then upload proof in My Orders.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="glass-card rounded-2xl p-6 shadow-md sticky top-28">
                    <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-5">Order Total</h3>
                    <div className="space-y-3 text-sm pb-4 border-b border-stone-100">
                      <div className="flex justify-between text-stone-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-stone-700">LKR {totalPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-500">
                        <span>Delivery</span>
                        <span className="text-green-600 font-medium">Arranged later</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 mb-6">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wide">Total</span>
                      <span className="text-3xl font-bold text-green-700">LKR {totalPrice.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={handlePlaceOrder}
                      disabled={placingOrder || !isValidQuantity}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2
                        ${placingOrder || !isValidQuantity
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-200 hover:-translate-y-0.5'
                        }`}
                    >
                      {placingOrder ? (
                        <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Placing…</>
                      ) : (
                        <><Check className="h-4 w-4" /> Place Order</>
                      )}
                    </button>
                    <p className="text-center text-xs text-stone-400 mt-3">You can cancel before payment is confirmed</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                className="flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            </div>
          )}

          {/* ════ STEP 4 · SUCCESS + PAYMENT ════ */}
          {currentStep === 4 && (
            <div className="step-enter max-w-2xl mx-auto space-y-8">
              <div className="text-center">
                <div className="success-burst w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200">
                  <Check className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-stone-900 mb-2">Order Placed!</h1>
                <p className="text-stone-500 text-sm">Your order is confirmed. Complete your payment below.</p>
              </div>

              <div className="glass-card rounded-2xl p-6 sm:p-8 shadow-lg">
                <h3 className="text-xl font-bold text-stone-900 mb-1">Payment Instructions</h3>
                <p className="text-sm text-stone-500 mb-6">
                  Transfer <span className="font-bold text-green-700">LKR {totalPrice.toLocaleString()}</span> to the farmer's primary account:
                </p>

                {primaryBankAccount ? (
                  <>
                    <div className="account-card rounded-2xl p-5 mb-5 space-y-4">
                      {[
                        { label: 'Bank Name',        value: primaryBankAccount.bankName,            field: 'bank',   mono: false },
                        { label: 'Branch',           value: primaryBankAccount.branchName || '—',   field: 'branch', mono: false },
                        { label: 'Account Holder',   value: primaryBankAccount.accountHolderName,   field: 'holder', mono: false },
                        { label: 'Account Number',   value: primaryBankAccount.accountNumber,       field: 'number', mono: true  },
                      ].map(({ label, value, field, mono }) => (
                        <div key={field} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-green-700/70 uppercase tracking-wider">{label}</p>
                            <p className={`text-stone-900 font-semibold mt-0.5 truncate ${mono ? 'font-mono text-lg text-green-800' : 'text-base'}`}>
                              {value}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(value, field)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-white border border-green-200 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors"
                            title="Copy"
                          >
                            {copiedField === field
                              ? <CheckCheck className="h-3.5 w-3.5" />
                              : <Copy className="h-3.5 w-3.5" />
                            }
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">
                        After making the transfer, go to <strong>My Orders</strong> and upload the payment screenshot or bank receipt.
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-stone-500 text-sm">
                    <User className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                    The farmer hasn't set a primary bank account yet. Please contact them directly to arrange payment.
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => navigate('/buyer/browse')}
                  className="py-3.5 border border-stone-200 rounded-xl text-stone-700 hover:bg-stone-50 transition-colors text-sm font-semibold"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={() => navigate('/buyer/orders')}
                  className="py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-green-200 transition-all hover:-translate-y-0.5"
                >
                  View My Orders <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}