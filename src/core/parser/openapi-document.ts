import type {
    OpenAPIV3,
    OpenAPIV3_1
} from "openapi-types";

export type CodeXaOpenApiDocument =
    | OpenAPIV3.Document
    | OpenAPIV3_1.Document;

export function isOpenApi31(
    document: CodeXaOpenApiDocument
): document is OpenAPIV3_1.Document {

    return document.openapi.startsWith("3.1");
}