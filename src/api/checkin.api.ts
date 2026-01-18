import apiClient from './client';

// Interface cho thống kê - ĐẦY ĐỦ theo API response
export interface CheckinStats {
  // Core stats
  total_issued: number;      // Tổng vé đã phát hành
  total_tickets?: number;    // Alias cho total_issued (backward compatible)
  checked_in: number;        // Đã check-in
  not_checked_in: number;    // Chưa check-in
  
  // Extended stats
  revoked_count: number;     // Vé đã thu hồi
  refunded_count: number;    // Vé đã hoàn tiền
  
  // Scan stats
  total_scans: number;       // Tổng số lượt quét
  failed_scans: number;      // Số lượt quét thất bại
  success_rate: number;      // Tỷ lệ quét thành công (%)
  
  // Timing
  last_check_in_at?: string; // Thời gian check-in gần nhất
  
  // Computed (có thể từ server hoặc client)
  checkin_rate?: number;     // Tỷ lệ check-in (%)
  
  // Breakdown theo loại vé
  by_ticket_type?: Array<{
    ticket_type_id?: string;
    ticket_type_name: string;
    total: number;
    checked_in: number;
    rate: number;
  }>;
}

// Interface cho lịch sử
export interface CheckinHistoryItem {
  id: string;
  ticket_serial: string;
  attendee_name: string;
  attendee_email?: string;
  ticket_type_name: string;
  checked_in_at: string;
  gate: string;
  result: string;
  staff_name?: string;
}

// 1. API Lấy thống kê
export const getCheckinStats = async (eventId: string): Promise<CheckinStats> => {
  const response = await apiClient.get(`/check-in/events/${eventId}/stats`);
  const data = response.data;
  
  // Normalize response để đảm bảo compatibility
  return {
    ...data,
    total_tickets: data.total_issued || data.total_tickets || 0,
    checkin_rate: data.checkin_rate ?? (data.total_issued > 0 
      ? Math.round((data.checked_in / data.total_issued) * 100) 
      : 0),
  };
};

// 2. API Quét QR
export const scanQR = async (data: any) => {
  const response = await apiClient.post('/check-in/scan', data);
  return response.data;
};

// 3. API Lấy lịch sử
export const getCheckinHistory = async (eventId: string) => {
  const response = await apiClient.get(`/check-in/events/${eventId}/history`);
  // Trả về full response để HistoryScreen có thể access meta và filters
  return response.data; 
};