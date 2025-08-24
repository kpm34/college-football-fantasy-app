export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export class UpstreamError extends AppError {
  constructor(message = 'Upstream service error', status = 502) {
    super(message, status);
  }
}
