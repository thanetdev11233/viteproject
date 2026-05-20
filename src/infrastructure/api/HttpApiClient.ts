import type {
  ApiClient,
  ApiRequestOptions,
  ApiRequestWithBodyOptions,
} from '../../domain/repositories/ApiClient'
import { ApiError } from './ApiError'

type HttpApiClientConfig = {
  baseUrl: string
  getIdToken?: () => Promise<string | null>
}

type HttpMethod = 'DELETE' | 'GET' | 'PATCH' | 'POST' | 'PUT'

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '')
}

function normalizePath(path: string) {
  return path.startsWith('/') ? path : `/${path}`
}

function isJsonResponse(response: Response) {
  return response.headers.get('content-type')?.includes('application/json')
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined
  }

  if (isJsonResponse(response)) {
    return response.json()
  }

  return response.text()
}

function getErrorMessage(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = body.message

    if (typeof message === 'string') {
      return message
    }
  }

  if (typeof body === 'string' && body) {
    return body
  }

  return fallback
}

export class HttpApiClient implements ApiClient {
  private readonly baseUrl: string
  private readonly getIdToken?: () => Promise<string | null>

  constructor({ baseUrl, getIdToken }: HttpApiClientConfig) {
    this.baseUrl = normalizeBaseUrl(baseUrl)
    this.getIdToken = getIdToken
  }

  delete<TResponse>(
    path: string,
    options: ApiRequestWithBodyOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('DELETE', path, options)
  }

  get<TResponse>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('GET', path, options)
  }

  patch<TResponse>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('PATCH', path, { ...options, body })
  }

  post<TResponse>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('POST', path, { ...options, body })
  }

  put<TResponse>(
    path: string,
    body?: unknown,
    options: ApiRequestOptions = {},
  ): Promise<TResponse> {
    return this.request<TResponse>('PUT', path, { ...options, body })
  }

  private async request<TResponse>(
    method: HttpMethod,
    path: string,
    options: ApiRequestWithBodyOptions,
  ): Promise<TResponse> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (options.auth !== false) {
      const idToken = await this.getIdToken?.()

      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`
      }
    }

    const init: RequestInit = {
      headers,
      method,
      signal: options.signal,
    }

    if (options.body !== undefined) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json'
      init.body = JSON.stringify(options.body)
    }

    const response = await fetch(
      `${this.baseUrl}${normalizePath(path)}`,
      init,
    )
    const body = await parseResponseBody(response)

    if (!response.ok) {
      throw new ApiError(
        getErrorMessage(body, `Request failed with status ${response.status}.`),
        response.status,
        body,
      )
    }

    return body as TResponse
  }
}
