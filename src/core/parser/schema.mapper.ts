import type { OpenAPIV3 } from "openapi-types";

import type {
    CodeXaModel,
    CodeXaProperty
} from "../models/codexa-model.js";

import { SchemaTypeMapper } from "./schema-type.mapper.js";

export class SchemaMapper {

    constructor(
        private readonly schemaTypeMapper: SchemaTypeMapper
    ) {}

    map(
        name: string,
        schema: OpenAPIV3.SchemaObject
    ): CodeXaModel {

        const properties: CodeXaProperty[] = [];

        for (const [
            propertyName,
            propertySchema
        ] of Object.entries(
            schema.properties ?? {}
        )) {

            properties.push({
                name: propertyName,

                type: this.schemaTypeMapper.map(
                    propertySchema
                ),

                required:
                    schema.required?.includes(
                        propertyName
                    ) ?? false
            });
        }

        return {
            name,
            properties
        };
    }
}