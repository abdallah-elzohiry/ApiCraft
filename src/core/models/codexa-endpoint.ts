import type { CodeXaType } from "./codexa-type.js";

export interface CodeXaParameter {
    name: string;
    location: "path" | "query" | "header";
    type: CodeXaType;
    required: boolean;
}

export interface CodeXaRequestBody {
    type: CodeXaType;
    required: boolean;
}

export interface CodeXaResponse {
    statusCode: number;
    type: CodeXaType;
}

export type HttpMethod =
    | "GET"
    | "POST"
    | "PUT"
    | "PATCH"
    | "DELETE";

export interface CodeXaEndpoint {
    path: string;
    method: HttpMethod;
    operationId?: string;
    summary?: string;
    parameters: CodeXaParameter[];
    requestBody?: CodeXaRequestBody;
    response?: CodeXaResponse;
}