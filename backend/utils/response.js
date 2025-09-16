
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };
  if (data) {
    response.data = data;
  }
  return res.status(statusCode).json(response);
};

export const sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

export const sendValidationError = (res, errors) => {
  return sendError(res, 400, 'Validation failed', errors);
};

export const sendAuthError = (res, message = 'Authentication failed') => {
  return sendError(res, 401, message);
};

export const sendForbiddenError = (res, message = 'Access forbidden') => {
  return sendError(res, 403, message);
};

export const sendNotFoundError = (res, message = 'Resource not found') => {
  return sendError(res, 404, message);
};