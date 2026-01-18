// src/store/eventStore.ts
// Quản lý state cho Events

import { create } from 'zustand';
import { getEvents } from '../api/events.api';
import { Event } from '../types';

interface EventState {
  // State
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: () => Promise<void>;
  setSelectedEvent: (event: Event | null) => void;
  clearEvents: () => void;
}

export const useEventStore = create<EventState>((set, get) => ({
  // Initial state
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,
  
  // Fetch danh sách events
  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const data = await getEvents();
      // Xử lý linh hoạt response
      const eventList = Array.isArray(data) ? data : (data as any)?.data || [];
      
      set({ 
        events: eventList, 
        isLoading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.message || 'Không thể tải danh sách sự kiện',
        isLoading: false 
      });
    }
  },
  
  // Set event được chọn
  setSelectedEvent: (event) => {
    set({ selectedEvent: event });
  },
  
  // Clear all events (khi logout)
  clearEvents: () => {
    set({ 
      events: [], 
      selectedEvent: null, 
      error: null 
    });
  },
}));
