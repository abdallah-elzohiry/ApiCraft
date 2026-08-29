import type {
    HttpRequest,
    HttpResponse
} from "./http-client.js";

export interface HttpInterceptor {
    onRequest(
        request: HttpRequest
    ): HttpRequest | Promise<HttpRequest>;

    onResponse<T>(
        response: HttpResponse<T>
    ): HttpResponse<T> | Promise<HttpResponse<T>>;
}