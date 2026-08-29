import type { HttpClient, HttpRequest, HttpResponse } from "./http-client.js";
export declare class FetchHttpClient implements HttpClient {
    request<T>(request: HttpRequest): Promise<HttpResponse<T>>;
    private buildUrl;
}
//# sourceMappingURL=fetch-http-client.d.ts.map