// src/Pages/farmer/BuyerNeeds.tsx
import { useEffect, useState } from 'react';
import { Search, ChevronDown, User } from 'lucide-react';
import { BuyerNeedCard } from '../../components/BuyerNeedCard';
import type { BuyerNeed } from '../../services/buyerNeed.service';

import {
  getBuyerNeeds,
  type BuyerNeedFilter,
} from '../../services/buyerNeed.service';

export default function BuyerNeeds() {
  const [needs, setNeeds]         = useState<BuyerNeed[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [searchTerm, setSearchTerm]       = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<BuyerNeedFilter['urgency']>('all');

  useEffect(() => {
    let cancelled = false;

    const fetchNeeds = async () => {
      try {
        setLoading(true);
        setError(null);

        const filter: BuyerNeedFilter = {
          search: searchTerm.trim() || undefined,
          urgency: urgencyFilter === 'all' ? undefined : urgencyFilter,
        };

        const data = await getBuyerNeeds(filter);
        if (!cancelled) setNeeds(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Could not load buyer requests');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNeeds();

    return () => { cancelled = true; };
  }, [searchTerm, urgencyFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Buyer Requests</h1>
          <p className="text-stone-600">
            See what buyers need and contact them directly
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search crop name or description..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Urgency */}
          <div>
            <div className="relative">
              <select
                className="w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value as any)}
              >
                <option value="all">All Priorities</option>
                <option value="high">Urgent</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-stone-500">
          Loading buyer requests...
        </div>
      ) : needs.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm py-12 px-6 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <User className="h-8 w-8 text-stone-400" />
          </div>
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            No open buyer requests at the moment
          </h2>
          <p className="text-stone-600 max-w-md mx-auto">
            Check back later or post your own listings to attract buyers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {needs.map((need) => (
            <div key={need.id} className="relative group">
              <BuyerNeedCard
                need={need}
                editable={false}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}