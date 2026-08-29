import SwaggerParser from "@apidevtools/swagger-parser";
import type { OpenAPIV3 } from "openapi-types";
import { ParameterMapper } from "./parameter.mapper.js";
import { RequestBodyMapper } from "./request-body.mapper.js";
import type { CodeXaDocument } from "../models/codexa-document.js";
import type {
  CodeXaEndpoint,
  HttpMethod
} from "../models/codexa-endpoint.js";

import { SchemaMapper } from "./schema.mapper.js";
import { ResponseMapper } from "./response.mapper.js";

export class OpenApiParser {
  private readonly schemaMapper = new SchemaMapper();
  private readonly parameterMapper = new ParameterMapper();
  private readonly responseMapper = new ResponseMapper();
  private readonly requestBodyMapper = new RequestBodyMapper();
  async parse(filePath: string): Promise<CodeXaDocument> {
    const document =
      await SwaggerParser.parse(filePath) as OpenAPIV3.Document;

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
        const operation =
          pathItem[
          method.toLowerCase() as keyof OpenAPIV3.PathItemObject
          ];

        if (!this.isOperation(operation)) {
          continue;
        }

        endpoints.push({
          path,
          method,
          operationId: operation.operationId,
          summary: operation.summary,

          parameters: this.mapParameters(
            operation.parameters
          ),

          requestBody: this.mapRequestBody(
            operation.requestBody
          ),

          response: this.responseMapper.map(
            operation.responses
          )
        });
      }
    }

    // =========================
    // Parse Models
    // =========================

    const models = [];

    for (const [name, schema] of Object.entries(
      document.components?.schemas ?? {}
    )) {
      if (!this.isSchemaObject(schema)) {
        continue;
      }

      const model = this.schemaMapper.map(
        name,
        schema
      );

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

  private mapParameters(
    parameters:
      | (
        | OpenAPIV3.ReferenceObject
        | OpenAPIV3.ParameterObject
      )[]
      | undefined
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
      .map((parameter) =>
        this.parameterMapper.map(parameter)
      );
  }
  private mapRequestBody(
    requestBody:
      | OpenAPIV3.RequestBodyObject
      | OpenAPIV3.ReferenceObject
      | undefined
  ): CodeXaEndpoint["requestBody"] {
    if (!requestBody || "$ref" in requestBody) {
      return undefined;
    }

    return this.requestBodyMapper.map(
      requestBody
    );
  }
}