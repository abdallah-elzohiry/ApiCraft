import type { HttpRequest, HttpResponse } from "./http-client.js";
import type { HttpInterceptor } from "./http-interceptor.js";
export declare class BearerTokenInterceptor implements HttpInterceptor {
    private readonly getToken;
    constructor(getToken: () => string | undefined | Promise<string | undefined>);
    onRequest(request: HttpRequest): Promise<HttpRequest>;
    onResponse<T>(response: HttpResponse<T>): HttpResponse<T>;
}
//# sourceMappingURL=bearer-token.interceptor.d.ts.map