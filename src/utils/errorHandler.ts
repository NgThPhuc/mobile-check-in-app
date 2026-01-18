// src/utils/errorHandler.ts
// Xử lý lỗi API toàn cục

import { ApiError } from '../types';

// Chuyển đổi lỗi thành message thân thiện với người dùng
export const handleApiError = (error: any): string => {
  // Nếu là AxiosError
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Dữ liệu không hợp lệ';
      case 401:
        return 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này';
      case 404:
        return data.message || 'Không tìm thấy dữ liệu';
      case 409:
        return data.message || 'Dữ liệu đã tồn tại';
      case 422:
        return data.message || 'Dữ liệu không đúng định dạng';
      case 429:
        return 'Quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      case 502:
      case 503:
      case 504:
        return 'Máy chủ tạm thời không khả dụng. Vui lòng thử lại sau.';
      default:
        return data.message || 'Đã có lỗi xảy ra';
    }
  }
  
  // Lỗi network (không có response)
  if (error.request) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  }
  
  // Lỗi khác
  return error.message || 'Đã có lỗi xảy ra';
};

// Kiểm tra xem có phải lỗi 401 không
export const isUnauthorizedError = (error: any): boolean => {
  return error.response?.status === 401;
};

// Kiểm tra xem có phải lỗi network không
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

// Kiểm tra lỗi có thể retry
export const isRetryableError = (error: any): boolean => {
  if (!error.response) return true; // Network errors
  const status = error.response.status;
  return status >= 500 || status === 429;
};

// Parse API error response
export const parseApiError = (error: any): ApiError => {
  if (error.response?.data) {
    return {
      statusCode: error.response.status,
      message: error.response.data.message || 'Unknown error',
      error: error.response.data.error,
    };
  }
  
  return {
    statusCode: 0,
    message: handleApiError(error),
  };
};

// Xử lý lỗi check-in
export const handleCheckinError = (error: any): { message: string; shouldRetry: boolean } => {
  const message = handleApiError(error);
  const shouldRetry = isRetryableError(error);
  
  return { message, shouldRetry };
};
