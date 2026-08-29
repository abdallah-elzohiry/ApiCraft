export class ResponseMapper {
    map(responses) {
        const successResponse = Object.entries(responses)
            .find(([statusCode]) => {
            const status = Number(statusCode);
            return status >= 200 && status < 300;
        });
        if (!successResponse) {
            return undefined;
        }
        const [statusCode, response] = successResponse;
        if ("$ref" in response) {
            return undefined;
        }
        const schema = response.content?.["application/json"]?.schema;
        if (!schema) {
            return {
                statusCode: Number(statusCode),
                type: "void"
            };
        }
        return {
            statusCode: Number(statusCode),
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
//# sourceMappingURL=response.mapper.js.map