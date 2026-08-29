export interface HttpRequest {
  method: string;
  url: string;

  headers?: Record<string, string>;

  query?: Record<
    string,
    string | number | boolean | undefined
  >;

  body?: unknown;
}

export interface HttpResponse<T = unknown> {
  status: number;

  headers: Record<string, string>;

  data: T;
}

export interface HttpInterceptor {
  onRequest(
    request: HttpRequest
  ): HttpRequest | Promise<HttpRequest>;

  onResponse<T>(
    response: HttpResponse<T>
  ): HttpResponse<T> | Promise<HttpResponse<T>>;
}

export interface HttpClient {
  request<T>(
    request: HttpRequest
  ): Promise<HttpResponse<T>>;
}