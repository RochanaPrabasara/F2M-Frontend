// src/Pages/buyer/BuyerBrowse.tsx
import { useEffect, useState } from 'react';
import { Search, ChevronDown, ShoppingBag } from 'lucide-react';
import { CropCard } from '../../components/CropCard';
import type { Listing } from '../../services/listing.service';

import {
  getListings,
  type ListingFilter,
} from '../../services/listing.service';

export default function BuyerBrowse() {
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  useEffect(() => {
    let cancelled = false;

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError(null);

        const filter: ListingFilter = {
          search: searchTerm.trim() || undefined,
          category: selectedCategory || undefined,
          location: selectedLocation || undefined,
        };

        const data = await getListings(filter);
        if (!cancelled) setListings(data);
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Could not load available crops');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchListings();

    return () => { cancelled = true; };
  }, [searchTerm, selectedCategory, selectedLocation]);

  const CATEGORIES = ['Carrot', 'Potato', 'Cabbage', 'Tomato', 'Onion', 'Leeks', 'Beans', 'Brinjal'];
  const LOCATIONS  = [
    'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo','Galle','Gampaha',
    'Hambantota','Jaffna','Kalutara','Kandy','Kegalle','Kurunegala','Matale',
    'Matara','Monaragala','Nuwara Eliya','Polonnaruwa','Puttalam','Ratnapura',
    'Trincomalee'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Available Crops</h1>
        <p className="text-stone-600">
          Fresh produce directly from farmers in your area
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Search crops
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Carrot, Tomato, Leeks..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Crop Type
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option value="">All Crops</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              Location
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-white pl-3 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
              >
                <option value="">All Districts</option>
                {LOCATIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
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
          Loading available crops...
        </div>
      ) : listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm py-12 px-6 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-stone-400 mb-4" />
          <h2 className="text-lg font-semibold text-stone-900 mb-2">
            No matching crops found
          </h2>
          <p className="text-stone-600 max-w-md mx-auto">
            Try adjusting your filters or check back later for new listings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="relative group">
              <CropCard
                listing={listing}
                editable={false}
                showOrderButton={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}