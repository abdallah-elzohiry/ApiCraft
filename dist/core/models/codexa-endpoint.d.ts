export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export type ParameterLocation = "query" | "path" | "header";
export interface CodeXaEndpoint {
    path: string;
    method: HttpMethod;
    operationId?: string;
    summary?: string;
    parameters: CodeXaParameter[];
    requestBody?: CodeXaRequestBody;
    response?: CodeXaResponse;
}
export interface CodeXaParameter {
    name: string;
    location: ParameterLocation;
    required: boolean;
    type: string;
}
export interface CodeXaRequestBody {
    required: boolean;
    type: string;
}
export interface CodeXaResponse {
    statusCode: number;
    type: string;
}
//# sourceMappingURL=codexa-endpoint.d.ts.map