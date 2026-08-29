import type {
    HttpClient,
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "./http-client.js";

export abstract class BaseHttpClient
    implements HttpClient {
    constructor(
        protected readonly interceptors: HttpInterceptor[] = []
    ) { }

    async request<T>(
        request: HttpRequest
    ): Promise<HttpResponse<T>> {
        let currentRequest = request;

        for (const interceptor of this.interceptors) {
            currentRequest =
                await interceptor.onRequest(
                    currentRequest
                );
        }

        let response =
            await this.execute<T>(currentRequest);

        for (
            let i = this.interceptors.length - 1;
            i >= 0;
            i--
        ) {
            response =
                await this.interceptors[i].onResponse(
                    response
                );
        }

        return response;
    }

    protected abstract execute<T>(
        request: HttpRequest
    ): Promise<HttpResponse<T>>;
}