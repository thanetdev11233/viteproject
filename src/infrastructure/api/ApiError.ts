export class ApiError extends Error {
  readonly details: unknown
  readonly status: number

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.details = details
    this.status = status
  }
}
