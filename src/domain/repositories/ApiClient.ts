export type ApiRequestOptions = {
  auth?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
}

export type ApiRequestWithBodyOptions = ApiRequestOptions & {
  body?: unknown
}

export type ApiClient = {
  delete<TResponse>(
    path: string,
    options?: ApiRequestWithBodyOptions,
  ): Promise<TResponse>
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>
  patch<TResponse>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<TResponse>
  post<TResponse>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<TResponse>
  put<TResponse>(
    path: string,
    body?: unknown,
    options?: ApiRequestOptions,
  ): Promise<TResponse>
}
