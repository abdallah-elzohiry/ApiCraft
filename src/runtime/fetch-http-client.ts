import { HttpError } from "./http-error.js";

import { BaseHttpClient } from "./base-http-client.js";

import type {
    HttpInterceptor,
    HttpRequest,
    HttpResponse
} from "./http-client.js";

export class FetchHttpClient
    extends BaseHttpClient {

    constructor(
        interceptors: HttpInterceptor[] = []
    ) {
        super(interceptors);
    }

    protected async execute<T>(
        request: HttpRequest
    ): Promise<HttpResponse<T>> {
        const url = this.buildUrl(
            request.url,
            request.query
        );

        const response = await fetch(url, {
            method: request.method,

            headers: {
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

        if (
            contentType?.includes(
                "application/json"
            )
        ) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        const headers =
            Object.fromEntries(
                response.headers.entries()
            );

        if (!response.ok) {
            throw new HttpError(
                `HTTP request failed with status ${response.status}`,
                response.status,
                data,
                headers
            );
        }

        return {
            status: response.status,
            headers,
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

        const params =
            new URLSearchParams();

        for (
            const [key, value]
            of Object.entries(query)
        ) {
            if (value !== undefined) {
                params.append(
                    key,
                    String(value)
                );
            }
        }

        const queryString =
            params.toString();

        return queryString
            ? `${url}?${queryString}`
            : url;
    }
}