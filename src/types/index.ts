// src/types/index.ts
// Định nghĩa các TypeScript interfaces chung cho ứng dụng

// ============== USER ==============
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  platform_role: 'ADMIN' | 'CUSTOMER';
  is_verified: boolean;
  organizations?: UserOrganization[];
}

export interface UserOrganization {
  organization_id: string;
  organization_name: string;
  role: 'ORGANIZER_ADMIN' | 'EVENT_MANAGER' | 'CHECKIN_STAFF';
}

// ============== AUTH ==============
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ============== EVENT ==============
export interface Event {
  id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  start_at: string;
  end_at?: string;
  timezone?: string;
  venue_name: string;
  address_line1?: string;
  district?: string;
  city?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  cover_image_url?: string;
  organization?: {
    id: string;
    name: string;
  };
  ticket_types?: TicketType[];
  _count?: {
    tickets: number;
  };
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  quantity_total: number;
  quantity_sold: number;
}

// ============== CHECK-IN ==============
export interface CheckinStats {
  total_tickets: number;
  checked_in: number;
  not_checked_in: number;
  checkin_rate: number;
  by_ticket_type?: TicketTypeStat[];
}

export interface TicketTypeStat {
  ticket_type_id?: string;
  ticket_type_name: string;
  total: number;
  checked_in: number;
  rate: number;
}

export interface CheckinHistoryItem {
  id: string;
  ticket_id?: string;
  ticket_serial: string;
  attendee_name: string;
  attendee_email?: string;
  ticket_type_name: string;
  checked_in_at: string;
  gate: string;
  staff_name?: string;
  result?: string;
}

export interface ScanQRRequest {
  qr_payload: string;
  gate?: string;
  device_id?: string;
}

export interface ScanQRResponse {
  success: boolean;
  message: string;
  result?: ScanResultCode;
  ticket?: TicketInfo;
}

export type ScanResultCode = 
  | 'SUCCESS' 
  | 'ALREADY_USED' 
  | 'NOT_FOUND' 
  | 'REVOKED' 
  | 'REFUNDED' 
  | 'EVENT_NOT_ACTIVE' 
  | 'INVALID_STATUS'
  | 'ERROR';

export interface TicketInfo {
  id: string;
  ticket_serial: string;
  attendee_name: string;
  attendee_email?: string;
  attendee_phone?: string;
  ticket_type: string;
  event_id?: string;
  event_title?: string;
  checkin_status: 'CHECKED_IN' | 'NOT_CHECKED_IN';
  checked_in_at?: string;
  checked_in_by?: string;
  scan_count?: number;
}

// ============== API RESPONSE ==============
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
