/**
 * API response helper utilities
 */

/**
 * Handle API response and extract data
 * @param {Object} response - Axios response object
 * @returns {Object} Extracted data
 */
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'API request failed');
  }
};

/**
 * Handle API error and extract error message
 * @param {Object} error - Axios error object
 * @returns {string} Error message
 */
export const handleApiError = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.errors) {
    // Handle validation errors
    const validationErrors = error.response.data.errors;
    if (Array.isArray(validationErrors)) {
      return validationErrors.map(err => err.msg || err.message).join(', ');
    }
  }
  
  return error.message || 'An unexpected error occurred';
};

/**
 * Create async thunk with consistent error handling
 * @param {string} actionType - Action type name
 * @param {Function} apiCall - API call function
 * @returns {Function} Async thunk function
 */
export const createAsyncThunkWithErrorHandling = (actionType, apiCall) => {
  return async (payload, { rejectWithValue }) => {
    try {
      const response = await apiCall(payload);
      return handleApiResponse({ data: response });
    } catch (error) {
      return rejectWithValue(handleApiError(error));
    }
  };
};

/**
 * Check if response indicates success
 * @param {Object} response - API response
 * @returns {boolean} True if successful
 */
export const isSuccessResponse = (response) => {
  return response && response.success === true;
};

/**
 * Extract error message from various error formats
 * @param {*} error - Error object or string
 * @returns {string} Formatted error message
 */
export const getErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Format validation errors for display
 * @param {Array} errors - Array of validation errors
 * @returns {string} Formatted error message
 */
export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) {
    return 'Validation failed';
  }
  
  return errors
    .map(error => error.msg || error.message || error)
    .join(', ');
};