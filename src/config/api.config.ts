export const API_ENDPOINTS = {

  //AUTH 
  AUTH: {
    SIGNUP:         '/api/auth/signup',
    LOGIN:          '/api/auth/login',
    LOGOUT:         '/api/auth/logout',
    ME:             '/api/auth/me',
    UPDATE_PROFILE: '/api/auth/profile',
    UPLOAD_AVATAR:  '/api/auth/avatar',
  },

  //LISTINGS
  LISTINGS: {
    ALL:    '/api/listings',
    MINE:   '/api/listings/mine',
    CREATE: '/api/listings',
    BY_ID:   (id: string) => `/api/listings/${id}`,
    UPDATE:  (id: string) => `/api/listings/${id}`,
    DELETE:  (id: string) => `/api/listings/${id}`,
  },

  //BUYER NEEDS
  BUYER_NEEDS: {
    ALL:    '/api/buyer-needs',
    MINE:   '/api/buyer-needs/mine',
    CREATE: '/api/buyer-needs',
    BY_ID:  (id: string) => `/api/buyer-needs/${id}`,
    UPDATE: (id: string) => `/api/buyer-needs/${id}`,
    DELETE: (id: string) => `/api/buyer-needs/${id}`,
  },

  //ORDERS
  ORDERS: {
    CREATE:        '/api/orders',
    MINE:          '/api/orders/my',
    FARMER_ORDERS: '/api/orders/farmer',
    BUYER_ORDERS:  '/api/orders/buyer',
    BY_ID:         (id: string) => `/api/orders/${id}`,
    UPDATE_STATUS: (id: string) => `/api/orders/${id}/status`,
  },

  //MESSAGES
  MESSAGES: {
    CONVERSATIONS: '/api/messages/conversations',
    UNREAD_COUNT:  '/api/messages/unread/count',
    SEND:          '/api/messages',
    THREAD:    (userId: string) => `/api/messages/${userId}`,
    MARK_READ: (userId: string) => `/api/messages/${userId}/read`,
  },

  //PUBLIC PROFILES
  PROFILES: {
    FARMER_PUBLIC: (farmerId: string) => `/api/profiles/farmer/${farmerId}`,
    BUYER_PUBLIC:  (buyerId:  string) => `/api/profiles/buyer/${buyerId}`,
  },

  //BANK ACCOUNTS
  BANK_ACCOUNTS: {
    ALL:    '/api/bank-accounts',
    ADD:    '/api/bank-accounts',
    DELETE: (id: string) => `/api/bank-accounts/${id}`,
  },

  //FORECAST / AI PRICING
  FORECAST: {
    PREDICT:     '/api/forecast/predict',
    COMMODITIES: '/api/forecast/commodities',
    REGIONS:     '/api/forecast/regions',
  },

  //DASHBOARD
  DASHBOARD: {
    FARMER: '/api/dashboard/farmer',
    BUYER:  '/api/dashboard/buyer',
  },

} as const;

//SOCKET
export const SOCKET_URL = import.meta.env.VITE_API_URL as string;

//HTTP config
export const API_CONFIG = {
  TIMEOUT: 10000,
} as const;

export default API_ENDPOINTS;