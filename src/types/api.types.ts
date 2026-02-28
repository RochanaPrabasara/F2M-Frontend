// src/types/api.types.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every type and interface used in services.
// All types are extracted exactly from your existing service files —
// nothing changed, just moved here.
//
// Usage in service files:
//   import type { User, Listing, BuyerNeed } from '../types/api.types';
// ─────────────────────────────────────────────────────────────────────────────


// ═════════════════════════════════════════════════════════════════════════════
// AUTH  (from auth.service.ts)
// ═════════════════════════════════════════════════════════════════════════════

export interface SignupData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'farmer' | 'buyer';
  district: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  fullName?: string;
  phone?: string;
  district?: string;
  bio?: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'farmer' | 'buyer';
  district: string;
  bio?: string | null;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface AvatarUploadResponse {
  success: boolean;
  message: string;
  avatar: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// LISTINGS  (from listing.service.ts)
// ═════════════════════════════════════════════════════════════════════════════

export interface ListingPayload {
  name: string;
  location: string;
  quantity: number;
  unit: string;
  price: number;
  quality: string;
  description: string;
  image?: string;
}

export type ListingStatus = 'available' | 'sold' | 'hidden';

export interface Listing {
  id: string;
  farmerId: string;
  name: string;
  location: string;
  quantity: string; // DECIMAL from Postgres returns as string
  unit: string;
  price: string;    // DECIMAL from Postgres returns as string
  quality: string;
  description: string | null;
  image: string | null;
  status: ListingStatus;
  createdAt: string;
  updatedAt: string;
  farmer?: {
    id: string;
    fullName: string;
  };
}

export interface ListingFilter {
  search?: string;
  category?: string;
  location?: string;
}

export interface ListingListResponse {
  success: boolean;
  listings: Listing[];
}

export interface ListingSingleResponse {
  success: boolean;
  message: string;
  listing: Listing;
}

export interface ListingCreateResponse {
  success: boolean;
  message: string;
  listing: Listing;
}

export interface ListingUpdateResponse {
  success: boolean;
  message: string;
  listing: Listing;
}

export interface ListingDeleteResponse {
  success: boolean;
  message: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// BUYER NEEDS  (from buyerNeed.service.ts)
// ═════════════════════════════════════════════════════════════════════════════

export type Urgency = 'low' | 'medium' | 'high';
export type BuyerNeedStatus = 'open' | 'closed';

export interface BuyerNeedPayload {
  cropName: string;
  quantity: number;
  unit: string;
  maxPrice: number;
  location: string;
  urgency: Urgency;
  description: string;
}

export interface BuyerNeed {
  id: string;
  buyerId: string;
  cropName: string;
  quantity: string;
  unit: string;
  maxPrice: string;
  currency: string;
  description: string;
  location: string;
  urgency: Urgency;
  status: BuyerNeedStatus;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: string;
    fullName: string;
  };
}

export interface BuyerNeedFilter {
  search?: string;
  urgency?: Urgency | 'all';
}

export interface NeedsListResponse {
  success: boolean;
  needs: BuyerNeed[];
}

export interface NeedCreateResponse {
  success: boolean;
  message: string;
  need: BuyerNeed;
}

export interface NeedUpdateResponse {
  success: boolean;
  message: string;
  need: BuyerNeed;
}

export interface NeedDeleteResponse {
  success: boolean;
  message: string;
}

// ═════════════════════════════════════════════════════════════════════════════
// FORECAST  (from forecast.service.ts)
// ═════════════════════════════════════════════════════════════════════════════

export interface ForecastRequest {
  commodity: string;
  region: string;
  weeksAhead: number;
  weather?: {
    temperature?: number;
    rainfall?: number;
    humidity?: number;
    crop_yield_impact?: number;
  };
}

export interface RawForecastPrediction {
  week: number;
  date: string; // 'YYYY-MM-DD'
  predicted_price: number;
  confidence_range: {
    low: number;
    high: number;
  };
}

export interface RawForecastResponse {
  success: boolean;
  error?: string;
  commodity: string;
  region: string;
  predictions: RawForecastPrediction[];
  current_date: string;
}

export interface ForecastPoint {
  week: number;
  date: string;
  predictedPrice: number;
  confidenceLow: number;
  confidenceHigh: number;
}

export interface RawCommoditiesResponse {
  success: boolean;
  commodities: string[];
}

export interface RawRegionsResponse {
  success: boolean;
  regions: string[];
}