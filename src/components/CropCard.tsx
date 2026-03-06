// src/components/CropCard.tsx
import { MapPin, Package, Tag, Pencil, Trash2, ShoppingBag, User } from 'lucide-react';
import { Card } from './ui/Card';
import { Link } from 'react-router-dom';

export interface CropCardListing {
  id: string;
  name: string;
  location: string;
  quantity: string | number;
  unit: string;
  price: string | number;
  quality?: string | null;
  status?: 'available' | 'sold' | 'hidden';
  image?: string | null; // base64 data URL
  farmer?: {
    id: string;
    fullName: string;
  };
}

interface CropCardProps {
  listing: CropCardListing;
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  showOrderButton?: boolean;
}

const PLACEHOLDER_SVG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="450">
    <rect width="100%" height="100%" fill="#f5f5f4"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      fill="#78716c" font-family="Arial" font-size="28">No Image</text>
  </svg>
`);

export function CropCard({
  listing,
  editable = false,
  onEdit,
  onDelete,
  showOrderButton = false,
}: CropCardProps) {
  const imgSrc =
    listing.image && listing.image.trim() !== '' ? listing.image : PLACEHOLDER_SVG;

  const statusLabel =
    listing.status === 'sold'
      ? 'Sold Out'
      : listing.status === 'hidden'
      ? 'Hidden'
      : 'In Stock';

  return (
    <Card hover className="flex flex-col h-full cursor-default relative overflow-hidden">
      <div className="relative h-44 w-full overflow-hidden bg-stone-200">
        <img
          src={imgSrc}
          alt={listing.name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
        />

        <div className="absolute top-3 right-3 flex items-center gap-2">
          {editable && onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-stone-700 border border-stone-200 hover:bg-stone-50 transition-colors"
              aria-label="Edit listing"
              title="Edit"
            >
              <Pencil className="h-4 w-4 cursor-pointer" />
            </button>
          )}

          {editable && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="bg-white/90 backdrop-blur px-2 py-1 rounded-full text-red-600 border border-stone-200 hover:bg-red-50 transition-colors"
              aria-label="Delete listing"
              title="Delete"
            >
              <Trash2 className="h-4 w-4 cursor-pointer" />
            </button>
          )}

          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              listing.status === 'available'
                ? 'bg-green-50 text-green-700'
                : 'bg-stone-100 text-stone-700'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {listing.quality && (
          <div className="absolute top-3 left-3">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
              Grade {listing.quality}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Farmer info + name moved here – always visible when browsing */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">
              {listing.name}
            </h3>

            {listing.farmer && !editable && (
              <Link
                to={`/buyer/farmer/${listing.farmer.id}`}
                className="inline-flex items-center gap-2 text-sm text-green-700 hover:text-green-800 group"
                title="View farmer's profile"
              >
                <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center shrink-0 border border-green-100 shadow-sm">
                  <User className="h-3.5 w-3.5 text-green-700" />
                </div>
                <span className="font-medium truncate max-w-45 sm:max-w-60 group-hover:underline">
                  {listing.farmer.fullName}
                </span>
              </Link>
            )}
          </div>

          <span className="text-base sm:text-lg font-bold text-green-700 shrink-0 self-start sm:self-auto">
            LKR {listing.price}
            <span className="text-xs text-stone-500 font-normal">/{listing.unit}</span>
          </span>
        </div>

        <div className="space-y-2.5 mb-5 flex-1 text-sm text-stone-600">
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2.5 text-stone-400" />
            <span>
              {listing.quantity} {listing.unit} available
            </span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2.5 text-stone-400" />
            <span>{listing.location}</span>
          </div>

          {listing.quality && (
            <div className="flex items-center">
              <Tag className="h-4 w-4 mr-2.5 text-stone-400" />
              <span>Quality Grade {listing.quality}</span>
            </div>
          )}
        </div>

        {showOrderButton && (
          <Link
            to={`/buyer/order/${listing.id}`}
            className="
              mt-auto w-full 
              bg-green-600 hover:bg-green-700 active:bg-green-800
              text-white text-center py-3 px-5 
              rounded-lg font-medium 
              transition-all shadow-sm 
              flex items-center justify-center gap-2.5
              focus:outline-none focus:ring-2 focus:ring-green-300 focus:ring-offset-2
            "
          >
            <ShoppingBag className="h-5 w-5" />
            View & Order
          </Link>
        )}
      </div>
    </Card>
  );
}