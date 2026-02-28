// src/services/forecast.service.ts
import axiosInstance from '../config/axios.config';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  ForecastRequest,
  ForecastPoint,
  RawForecastResponse,
  RawCommoditiesResponse,
  RawRegionsResponse,
} from '../types/api.types';

// Re-export so components that import types from forecast.service still work
export type { ForecastRequest, ForecastPoint };

export async function getPriceForecast(
  payload: ForecastRequest
): Promise<ForecastPoint[]> {
  const res = await axiosInstance.post<RawForecastResponse>(
    API_ENDPOINTS.FORECAST.PREDICT,
    {
      commodity:  payload.commodity,
      region:     payload.region,
      weeksAhead: payload.weeksAhead,
      weather:    payload.weather,
    }
  );

  const data = res.data;
  if (!data.success) {
    throw new Error(data.error || 'Forecast request failed');
  }

  return data.predictions.map((p) => ({
    week:           p.week,
    date:           p.date,
    predictedPrice: p.predicted_price,
    confidenceLow:  p.confidence_range.low,
    confidenceHigh: p.confidence_range.high,
  }));
}

export async function getCommodities(): Promise<string[]> {
  const res = await axiosInstance.get<RawCommoditiesResponse>(
    API_ENDPOINTS.FORECAST.COMMODITIES
  );
  if (!res.data.success) {
    throw new Error('Failed to load commodities');
  }
  return res.data.commodities;
}

export async function getRegions(): Promise<string[]> {
  const res = await axiosInstance.get<RawRegionsResponse>(
    API_ENDPOINTS.FORECAST.REGIONS
  );
  if (!res.data.success) {
    throw new Error('Failed to load regions');
  }
  return res.data.regions;
}