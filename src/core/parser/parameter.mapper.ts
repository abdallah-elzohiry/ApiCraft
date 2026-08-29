import type { OpenAPIV3 } from "openapi-types";

import type { CodeXaParameter } from "../models/codexa-endpoint.js";

import { SchemaTypeMapper } from "./schema-type.mapper.js";

export class ParameterMapper {

    constructor(
        private readonly schemaTypeMapper: SchemaTypeMapper
    ) {}

    map(
        parameter: OpenAPIV3.ParameterObject
    ): CodeXaParameter {

        return {
            name: parameter.name,

            location:
                parameter.in as
                    | "path"
                    | "query"
                    | "header",

            type: this.schemaTypeMapper.map(
                parameter.schema ?? {
                    type: "string"
                }
            ),

            required:
                parameter.required ?? false
        };
    }
}