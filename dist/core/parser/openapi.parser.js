import SwaggerParser from "@apidevtools/swagger-parser";
import { ParameterMapper } from "./parameter.mapper.js";
import { RequestBodyMapper } from "./request-body.mapper.js";
import { SchemaMapper } from "./schema.mapper.js";
import { ResponseMapper } from "./response.mapper.js";
export class OpenApiParser {
    schemaMapper = new SchemaMapper();
    parameterMapper = new ParameterMapper();
    responseMapper = new ResponseMapper();
    requestBodyMapper = new RequestBodyMapper();
    async parse(filePath) {
        const document = await SwaggerParser.parse(filePath);
        // =========================
        // Parse Endpoints
        // =========================
        const endpoints = [];
        const methods = [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE"
        ];
        for (const [path, pathItem] of Object.entries(document.paths ?? {})) {
            if (!pathItem) {
                continue;
            }
            for (const method of methods) {
                const operation = pathItem[method.toLowerCase()];
                if (!this.isOperation(operation)) {
                    continue;
                }
                endpoints.push({
                    path,
                    method,
                    operationId: operation.operationId,
                    summary: operation.summary,
                    parameters: this.mapParameters(operation.parameters),
                    requestBody: this.mapRequestBody(operation.requestBody),
                    response: this.responseMapper.map(operation.responses)
                });
            }
        }
        // =========================
        // Parse Models
        // =========================
        const models = [];
        for (const [name, schema] of Object.entries(document.components?.schemas ?? {})) {
            if (!this.isSchemaObject(schema)) {
                continue;
            }
            const model = this.schemaMapper.map(name, schema);
            models.push(model);
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
    isOperation(value) {
        return (typeof value === "object" &&
            value !== null &&
            !Array.isArray(value));
    }
    isSchemaObject(value) {
        return (typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !("$ref" in value));
    }
    mapParameters(parameters) {
        if (!parameters) {
            return [];
        }
        return parameters
            .filter((parameter) => !("$ref" in parameter))
            .map((parameter) => this.parameterMapper.map(parameter));
    }
    mapRequestBody(requestBody) {
        if (!requestBody || "$ref" in requestBody) {
            return undefined;
        }
        return this.requestBodyMapper.map(requestBody);
    }
}
//# sourceMappingURL=openapi.parser.js.map