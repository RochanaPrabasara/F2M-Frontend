// src/services/buyerNeed.service.ts
import axiosInstance from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  Urgency,
  BuyerNeedStatus,
  BuyerNeedPayload,
  BuyerNeed,
  BuyerNeedFilter,
  NeedsListResponse,
  NeedCreateResponse,
  NeedUpdateResponse,
  NeedDeleteResponse,
} from '../types/api.types';

// Re-export so components that import types from buyerNeed.service still work
export type {
  Urgency,
  BuyerNeedStatus,
  BuyerNeedPayload,
  BuyerNeed,
  BuyerNeedFilter,
};

export async function createBuyerNeed(
  payload: BuyerNeedPayload
): Promise<BuyerNeed> {
  const res = await axiosInstance.post<NeedCreateResponse>(
    API_ENDPOINTS.BUYER_NEEDS.CREATE,
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to create request');
  }
  return res.data.need;
}

export async function getBuyerNeeds(
  filter: BuyerNeedFilter = {}
): Promise<BuyerNeed[]> {
  const urgencyParam =
    filter.urgency && filter.urgency !== 'all' ? filter.urgency : undefined;

  const res = await axiosInstance.get<NeedsListResponse>(
    API_ENDPOINTS.BUYER_NEEDS.ALL,
    {
      params: {
        search:  filter.search,
        urgency: urgencyParam,
      },
    }
  );
  if (!res.data.success) {
    throw new Error('Failed to fetch buyer needs');
  }
  return res.data.needs;
}

export async function getMyBuyerNeeds(): Promise<BuyerNeed[]> {
  const res = await axiosInstance.get<NeedsListResponse>(
    API_ENDPOINTS.BUYER_NEEDS.MINE
  );
  if (!res.data.success) {
    throw new Error('Failed to fetch my requests');
  }
  return res.data.needs;
}

export async function updateBuyerNeed(
  id: string,
  payload: Partial<BuyerNeedPayload> & { status?: BuyerNeedStatus }
): Promise<BuyerNeed> {
  const res = await axiosInstance.patch<NeedUpdateResponse>(
    API_ENDPOINTS.BUYER_NEEDS.UPDATE(id),
    payload
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to update request');
  }
  return res.data.need;
}

export async function deleteBuyerNeed(id: string): Promise<void> {
  const res = await axiosInstance.delete<NeedDeleteResponse>(
    API_ENDPOINTS.BUYER_NEEDS.DELETE(id)
  );
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to delete request');
  }
}