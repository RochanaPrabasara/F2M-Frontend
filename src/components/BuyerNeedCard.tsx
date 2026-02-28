import { MapPin, Scale, Tag, Clock, Pencil, Trash2, User } from 'lucide-react';
import { Card } from './ui/Card';
import { Link } from 'react-router-dom';
import type { BuyerNeed } from '../services/buyerNeed.service';

interface BuyerNeedCardProps {
  need: BuyerNeed & {
    buyer?: {
      id: string;
      fullName: string;
    };
  };
  editable?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const urgencyLabels: Record<'low' | 'medium' | 'high', string> = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'Urgent',
};

const urgencyBadgeClasses: Record<'low' | 'medium' | 'high', string> = {
  low: 'bg-stone-100 text-stone-700',
  medium: 'bg-amber-50 text-amber-700',
  high: 'bg-red-50 text-red-700',
};

export function BuyerNeedCard({ need, editable = false, onEdit, onDelete }: BuyerNeedCardProps) {
  const posted = new Date(need.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <Card hover className="flex flex-col h-full relative overflow-hidden">
      <div className="p-5 flex-1 flex flex-col">
        {/* ─── Updated header with buyer info ─── */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-stone-900 leading-tight mb-1">
              {need.cropName}
            </h3>

            {/* Buyer name + avatar link – always visible when !editable */}
            {need.buyer && !editable && (
              <Link
                to={`/farmer/buyer/${need.buyer.id}`}
                className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:text-green-800 hover:underline group"
                title="View buyer's profile"
              >
                <div className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 border border-green-100">
                  <User className="h-3 w-3 text-green-700" />
                </div>
                <span className="font-medium truncate max-w-[180px] sm:max-w-[220px]">
                  {need.buyer.fullName}
                </span>
              </Link>
            )}
          </div>

          {/* Urgency badge + edit controls */}
          <div className="flex items-center gap-2 shrink-0">
            {editable && onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="bg-stone-50 border border-stone-200 text-stone-700 px-2 py-1 rounded-full hover:bg-stone-100 transition-colors"
                aria-label="Edit request"
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
                className="bg-stone-50 border border-stone-200 text-red-600 px-2 py-1 rounded-full hover:bg-red-50 transition-colors"
                aria-label="Delete request"
                title="Delete"
              >
                <Trash2 className="h-4 w-4 cursor-pointer" />
              </button>
            )}

            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${urgencyBadgeClasses[need.urgency]}`}
            >
              {urgencyLabels[need.urgency]}
            </span>
          </div>
        </div>

        <p className="text-sm text-stone-600 mb-4 line-clamp-3">
          {need.description}
        </p>

        <div className="space-y-2.5 mb-5 flex-1 text-sm text-stone-600">
          <div className="flex items-center">
            <Scale className="h-4 w-4 mr-2 text-stone-400" />
            <span>
              {need.quantity} {need.unit} needed
            </span>
          </div>

          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2 text-stone-400" />
            <span>
              Budget: Up to {need.currency} {need.maxPrice}/{need.unit}
            </span>
          </div>

          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-stone-400" />
            <span>Buyer Location: {need.location}</span>
          </div>

          <div className="flex items-center text-stone-500">
            <Clock className="h-4 w-4 mr-2 text-stone-400" />
            <span>Posted {posted}</span>
          </div>
        </div>

        {/* Optional reinforcement link at bottom (very subtle) */}
        {need.buyer && !editable && (
          <div className="pt-3 mt-auto border-t border-stone-100">
            <Link
              to={`/farmer/buyer/${need.buyer.id}`}
              className="text-xs text-stone-500 hover:text-green-700 flex items-center justify-end gap-1"
            >
              View buyer profile →
            </Link>
          </div>
        )}
      </div>
    </Card>
  );
}