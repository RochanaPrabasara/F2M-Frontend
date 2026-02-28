// src/services/listing.service.ts
import axiosInstance from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  ListingPayload,
  ListingStatus,
  Listing,
  ListingFilter,
  ListingListResponse,
  ListingSingleResponse,
  ListingCreateResponse,
  ListingUpdateResponse,
  ListingDeleteResponse,
} from '../types/api.types';

// Re-export so components that import types from listing.service still work
export type {
  ListingPayload,
  ListingStatus,
  Listing,
  ListingFilter,
};

export async function createListing(payload: ListingPayload): Promise<Listing> {
  const res = await axiosInstance.post<ListingCreateResponse>(
    API_ENDPOINTS.LISTINGS.CREATE,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to create listing');
  }
  return res.data.listing;
}

export async function getListings(
  filter: ListingFilter = {}
): Promise<Listing[]> {
  const res = await axiosInstance.get<ListingListResponse>(
    API_ENDPOINTS.LISTINGS.ALL,
    {
      params: {
        search:   filter.search,
        category: filter.category,
        location: filter.location,
      },
    }
  );
  if (!res.data.success) {
    throw new Error('Failed to fetch listings');
  }
  return res.data.listings;
}

export async function getListingById(id: string): Promise<Listing> {
  const res = await axiosInstance.get<ListingSingleResponse>(
    API_ENDPOINTS.LISTINGS.BY_ID(id)
  );
  if (!res.data.success || !res.data.listing) {
    throw new Error(res.data.message || 'Listing not found');
  }
  return res.data.listing;
}

export async function getMyListings(): Promise<Listing[]> {
  const res = await axiosInstance.get<ListingListResponse>(
    API_ENDPOINTS.LISTINGS.MINE
  );
  if (!res.data.success) {
    throw new Error('Failed to fetch my listings');
  }
  return res.data.listings;
}

export async function updateListing(
  id: string,
  payload: Partial<ListingPayload> & { status?: ListingStatus }
): Promise<Listing> {
  const res = await axiosInstance.patch<ListingUpdateResponse>(
    API_ENDPOINTS.LISTINGS.UPDATE(id),
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to update listing');
  }
  return res.data.listing;
}

export async function deleteListing(id: string): Promise<void> {
  const res = await axiosInstance.delete<ListingDeleteResponse>(
    API_ENDPOINTS.LISTINGS.DELETE(id)
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to delete listing');
  }
}