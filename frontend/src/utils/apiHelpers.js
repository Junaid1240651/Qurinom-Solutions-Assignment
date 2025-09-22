
export const handleApiResponse = (response) => {
  if (response.data.success) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'API request failed');
  }
};


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

export const isSuccessResponse = (response) => {
  return response && response.success === true;
};

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

export const formatValidationErrors = (errors) => {
  if (!Array.isArray(errors)) {
    return 'Validation failed';
  }
  
  return errors
    .map(error => error.msg || error.message || error)
    .join(', ');
};