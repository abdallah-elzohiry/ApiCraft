export class SchemaMapper {
    map(name, schema) {
        const properties = [];
        for (const [propertyName, propertySchema] of Object.entries(schema.properties ?? {})) {
            if (!this.isSchemaObject(propertySchema)) {
                continue;
            }
            properties.push({
                name: propertyName,
                type: this.mapType(propertySchema),
                required: schema.required?.includes(propertyName) ?? false
            });
        }
        return {
            name,
            properties
        };
    }
    mapType(schema) {
        switch (schema.type) {
            case "integer":
            case "number":
                return "number";
            case "string":
                return "string";
            case "boolean":
                return "boolean";
            case "array":
                return "unknown[]";
            case "object":
                return "Record<string, unknown>";
            default:
                return "unknown";
        }
    }
    isSchemaObject(value) {
        return (typeof value === "object" &&
            value !== null &&
            !Array.isArray(value) &&
            !("$ref" in value));
    }
}
//# sourceMappingURL=schema.mapper.js.map