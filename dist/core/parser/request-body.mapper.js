export class RequestBodyMapper {
    map(requestBody) {
        if (!requestBody) {
            return undefined;
        }
        const schema = requestBody.content?.["application/json"]?.schema;
        if (!schema) {
            return undefined;
        }
        return {
            required: requestBody.required ?? false,
            type: this.mapSchema(schema)
        };
    }
    mapSchema(schema) {
        if ("$ref" in schema) {
            return this.extractReferenceName(schema.$ref);
        }
        if (schema.type === "array") {
            if (!schema.items) {
                return "unknown[]";
            }
            return `${this.mapSchema(schema.items)}[]`;
        }
        switch (schema.type) {
            case "integer":
            case "number":
                return "number";
            case "string":
                return "string";
            case "boolean":
                return "boolean";
            case "object":
                return "Record<string, unknown>";
            default:
                return "unknown";
        }
    }
    extractReferenceName(reference) {
        return reference.split("/").pop() ?? "unknown";
    }
}
//# sourceMappingURL=request-body.mapper.js.map