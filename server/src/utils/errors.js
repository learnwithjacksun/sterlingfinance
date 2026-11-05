export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message, code = "BAD_REQUEST", details) =>
  new ApiError(400, code, message, details);
export const unauthorized = (message = "Authentication required", code = "UNAUTHORIZED") =>
  new ApiError(401, code, message);
export const forbidden = (message = "Forbidden", code = "FORBIDDEN") =>
  new ApiError(403, code, message);
export const notFound = (message = "Not found", code = "NOT_FOUND") =>
  new ApiError(404, code, message);
export const conflict = (message, code = "CONFLICT") => new ApiError(409, code, message);
