// src/api/events.api.ts
import apiClient from './client';

// Interface Event đầy đủ theo API
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
  status?: 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
  cover_image_url?: string;
  organization?: {
    id: string;
    name: string;
  };
  ticket_types?: Array<{
    id: string;
    name: string;
    price: number;
    quantity_total: number;
    quantity_sold: number;
  }>;
  _count?: {
    tickets: number;
  };
}

export const getEvents = async () => {
  const response = await apiClient.get('/events');
  return response.data.data || response.data; 
};