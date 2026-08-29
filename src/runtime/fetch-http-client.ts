import type {
    HttpClient,
    HttpRequest,
    HttpResponse
} from "./http-client.js";

export class FetchHttpClient implements HttpClient {
    async request<T>(
        request: HttpRequest
    ): Promise<HttpResponse<T>> {
        const url = this.buildUrl(
            request.url,
            request.query
        );

        const response = await fetch(url, {
            method: request.method,

            headers: {
                "Content-Type": "application/json",
                ...request.headers
            },

            body:
                request.body !== undefined
                    ? JSON.stringify(request.body)
                    : undefined
        });

        const contentType =
            response.headers.get("content-type");

        let data: unknown;

        if (contentType?.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        return {
            status: response.status,

            headers: Object.fromEntries(
                response.headers.entries()
            ),

            data: data as T
        };
    }

    private buildUrl(
        url: string,
        query?: Record<
            string,
            string | number | boolean | undefined
        >
    ): string {
        if (!query) {
            return url;
        }

        const searchParams =
            new URLSearchParams();

        for (const [key, value] of Object.entries(
            query
        )) {
            if (value !== undefined) {
                searchParams.append(
                    key,
                    String(value)
                );
            }
        }

        const queryString =
            searchParams.toString();

        if (!queryString) {
            return url;
        }

        return `${url}?${queryString}`;
    }
}