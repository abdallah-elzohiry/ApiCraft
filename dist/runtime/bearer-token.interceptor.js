export class BearerTokenInterceptor {
    getToken;
    constructor(getToken) {
        this.getToken = getToken;
    }
    async onRequest(request) {
        const token = await this.getToken();
        if (!token) {
            return request;
        }
        return {
            ...request,
            headers: {
                ...request.headers,
                Authorization: `Bearer ${token}`
            }
        };
    }
    onResponse(response) {
        return response;
    }
}
//# sourceMappingURL=bearer-token.interceptor.js.map