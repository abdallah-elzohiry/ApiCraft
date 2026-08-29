import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaDocument } from "../models/codexa-document.js";
import type {
    CodeXaEndpoint,
    HttpMethod
} from "../models/codexa-endpoint.js";

import { OpenApiRefResolver } from "./openapi-ref-resolver.js";
import { SchemaTypeMapper } from "./schema-type.mapper.js";
import { SchemaMapper } from "./schema.mapper.js";
import { ParameterMapper } from "./parameter.mapper.js";
import { RequestBodyMapper } from "./request-body.mapper.js";
import { ResponseMapper } from "./response.mapper.js";

export class OpenApiParser {

    async parse(
        filePath: string
    ): Promise<CodeXaDocument> {

        const document =
            await SwaggerParser.parse(
                filePath
            ) as OpenAPIV3.Document;

        // =========================
        // Resolvers & Mappers
        // =========================

        const refResolver =
            new OpenApiRefResolver(document);

        const schemaTypeMapper =
            new SchemaTypeMapper(refResolver);

        const schemaMapper =
            new SchemaMapper(schemaTypeMapper);

        const parameterMapper =
            new ParameterMapper(
                schemaTypeMapper
            );

        const requestBodyMapper =
            new RequestBodyMapper(
                schemaTypeMapper
            );

        const responseMapper =
            new ResponseMapper(
                schemaTypeMapper
            );

        // =========================
        // Parse Endpoints
        // =========================

        const endpoints: CodeXaEndpoint[] = [];

        const methods: HttpMethod[] = [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ];

        for (const [path, pathItem] of Object.entries(
            document.paths ?? {}
        )) {

            if (!pathItem) {
                continue;
            }

            for (const method of methods) {

                const operationMap = {
                    GET: pathItem.get,
                    POST: pathItem.post,
                    PUT: pathItem.put,
                    PATCH: pathItem.patch,
                    DELETE: pathItem.delete
                } as const;

                const operation =
                    operationMap[method];

                if (!this.isOperation(operation)) {
                    continue;
                }

                endpoints.push({
                    path,

                    method,

                    operationId:
                        operation.operationId,

                    summary:
                        operation.summary,

                    parameters:
                        this.mapParameters(
                            operation.parameters,
                            parameterMapper
                        ),

                    requestBody:
                        this.mapRequestBody(
                            operation.requestBody,
                            requestBodyMapper
                        ),

                    response:
                        responseMapper.map(
                            operation.responses
                        )
                });
            }
        }

        // =========================
        // Parse Models
        // =========================

        const models: CodeXaDocument["models"] = [];

        for (const [
            name,
            schema
        ] of Object.entries(
            document.components?.schemas ?? {}
        )) {

            if (!this.isSchemaObject(schema)) {
                continue;
            }

            models.push(
                schemaMapper.map(
                    name,
                    schema
                )
            );
        }

        // =========================
        // Create CodeXA Document
        // =========================

        return {
            title: document.info.title,
            version: document.info.version,
            endpoints,
            models
        };
    }

    // =========================
    // Type Guards
    // =========================

    private isOperation(
        value: unknown
    ): value is OpenAPIV3.OperationObject {

        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
        );
    }

    private isSchemaObject(
        value: unknown
    ): value is OpenAPIV3.SchemaObject {

        return (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !("$ref" in value)
        );
    }

    // =========================
    // Parameters
    // =========================

    private mapParameters(
        parameters:
            | (
                | OpenAPIV3.ReferenceObject
                | OpenAPIV3.ParameterObject
            )[]
            | undefined,

        parameterMapper: ParameterMapper

    ): CodeXaEndpoint["parameters"] {

        if (!parameters) {
            return [];
        }

        return parameters
            .filter(
                (
                    parameter
                ): parameter is OpenAPIV3.ParameterObject =>
                    !("$ref" in parameter)
            )
            .map(
                parameter =>
                    parameterMapper.map(
                        parameter
                    )
            );
    }

    // =========================
    // Request Body
    // =========================

    private mapRequestBody(
        requestBody:
            | OpenAPIV3.RequestBodyObject
            | OpenAPIV3.ReferenceObject
            | undefined,

        requestBodyMapper: RequestBodyMapper

    ): CodeXaEndpoint["requestBody"] {

        if (
            !requestBody ||
            "$ref" in requestBody
        ) {
            return undefined;
        }

        return requestBodyMapper.map(
            requestBody
        );
    }
}