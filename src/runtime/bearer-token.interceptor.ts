import type {
    HttpRequest,
    HttpResponse
} from "./http-client.js";

import type {
    HttpInterceptor
} from "./http-interceptor.js";

export class BearerTokenInterceptor
    implements HttpInterceptor {
    constructor(
        private readonly getToken: () =>
            string | undefined | Promise<string | undefined>
    ) { }

    async onRequest(
        request: HttpRequest
    ): Promise<HttpRequest> {
        const token =
            await this.getToken();

        if (!token) {
            return request;
        }

        return {
            ...request,

            headers: {
                ...request.headers,

                Authorization:
                    `Bearer ${token}`
            }
        };
    }

    onResponse<T>(
        response: HttpResponse<T>
    ): HttpResponse<T> {
        return response;
    }
}