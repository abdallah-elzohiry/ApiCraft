export class ParameterMapper {
    map(parameter) {
        return {
            name: parameter.name,
            location: this.mapLocation(parameter.in),
            required: parameter.required ?? false,
            type: this.mapType(parameter.schema)
        };
    }
    mapLocation(location) {
        switch (location) {
            case "path":
            case "query":
            case "header":
                return location;
            default:
                throw new Error(`Unsupported parameter location: ${location}`);
        }
    }
    mapType(schema) {
        if (!schema || "$ref" in schema) {
            return "unknown";
        }
        switch (schema.type) {
            case "integer":
            case "number":
                return "number";
            case "string":
                return "string";
            case "boolean":
                return "boolean";
            default:
                return "unknown";
        }
    }
}
//# sourceMappingURL=parameter.mapper.js.map