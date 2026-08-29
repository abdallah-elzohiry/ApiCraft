import { describe, expect, it } from "vitest";
import { BearerTokenInterceptor } from "../../src/runtime/bearer-token.interceptor.js";
describe("BearerTokenInterceptor", () => {
    it("should add Authorization header", async () => {
        const interceptor = new BearerTokenInterceptor(() => "abc123");
        const request = await interceptor.onRequest({
            method: "GET",
            url: "https://api.example.com/users"
        });
        expect(request.headers).toEqual({
            Authorization: "Bearer abc123"
        });
    });
    it("should not add Authorization when token is missing", async () => {
        const interceptor = new BearerTokenInterceptor(() => undefined);
        const request = await interceptor.onRequest({
            method: "GET",
            url: "https://api.example.com/users"
        });
        expect(request.headers).toBeUndefined();
    });
});
//# sourceMappingURL=bearer-token.interceptor.test.js.map