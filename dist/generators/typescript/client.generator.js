import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export class TypeScriptClientGenerator {
    async generate(document, outputDirectory) {
        const clientsDirectory = path.join(outputDirectory, "clients");
        await mkdir(clientsDirectory, {
            recursive: true
        });
        const groupedEndpoints = this.groupByResource(document.endpoints);
        for (const [resource, endpoints] of groupedEndpoints) {
            const fileName = `${this.toFileName(resource)}.client.ts`;
            const content = this.generateClient(resource, endpoints);
            await writeFile(path.join(clientsDirectory, fileName), content, "utf8");
        }
    }
    generateClient(resource, endpoints) {
        const className = `${this.toPascalCase(resource)}Client`;
        const methods = endpoints
            .map((endpoint) => this.generateMethod(endpoint))
            .join("\n\n");
        const indentedMethods = this.indent(methods, 2);
        return `import type { HttpClient } from "../http-client.js";

${this.generateImports(endpoints)}

export class ${className} {
  constructor(
    private readonly http: HttpClient,
    private readonly baseUrl: string
  ) {}

${indentedMethods}
}
`;
    }
    generateImports(endpoints) {
        const imports = new Map();
        const primitiveTypes = new Set([
            "string",
            "number",
            "boolean",
            "unknown",
            "void",
            "Record<string, unknown>"
        ]);
        for (const endpoint of endpoints) {
            // Request body
            if (endpoint.requestBody &&
                !primitiveTypes.has(endpoint.requestBody.type)) {
                const type = this.getBaseType(endpoint.requestBody.type);
                imports.set(type, `import type { ${type} } from "../models/${this.toFileName(type)}.js";`);
            }
            // Response
            if (endpoint.response &&
                !primitiveTypes.has(endpoint.response.type)) {
                const type = this.getBaseType(endpoint.response.type);
                imports.set(type, `import type { ${type} } from "../models/${this.toFileName(type)}.js";`);
            }
        }
        return [...imports.values()].join("\n");
    }
    generateMethod(endpoint) {
        const methodName = endpoint.operationId ??
            this.generateMethodName(endpoint);
        // =========================
        // Path Parameters
        // =========================
        const pathParameters = endpoint.parameters
            .filter((parameter) => parameter.location === "path")
            .map((parameter) => `${parameter.name}: ${parameter.type}`);
        // =========================
        // Query Parameters
        // =========================
        const queryParameters = endpoint.parameters
            .filter((parameter) => parameter.location === "query")
            .map((parameter) => `${parameter.name}${parameter.required ? "" : "?"}: ${parameter.type}`);
        // =========================
        // Header Parameters
        // =========================
        const headerParameters = endpoint.parameters
            .filter((parameter) => parameter.location === "header")
            .map((parameter) => `${this.toParameterName(parameter.name)}${parameter.required ? "" : "?"}: ${parameter.type}`);
        // =========================
        // Method Parameters
        // =========================
        const parameters = [
            ...pathParameters,
            ...queryParameters,
            ...headerParameters
        ].join(",\n");
        // =========================
        // Request Body
        // =========================
        const requestParameter = endpoint.requestBody
            ? `${parameters
                ? `${parameters}, `
                : ""}request: ${endpoint.requestBody.type}`
            : parameters;
        // =========================
        // Response
        // =========================
        const returnType = endpoint.response?.type ?? "void";
        // =========================
        // URL
        // =========================
        const url = this.generateUrl(endpoint);
        // =========================
        // Body
        // =========================
        const body = endpoint.requestBody
            ? `body: request`
            : "";
        // =========================
        // Query
        // =========================
        const query = endpoint.parameters.filter((parameter) => parameter.location === "query").length > 0
            ? `query: {
${endpoint.parameters
                .filter((parameter) => parameter.location === "query")
                .map((parameter) => `      ${parameter.name}`)
                .join(",\n")}
    }`
            : "";
        const headers = endpoint.parameters.filter((parameter) => parameter.location === "header").length > 0
            ? `headers: {
${endpoint.parameters
                .filter((parameter) => parameter.location === "header")
                .map((parameter) => {
                const parameterName = this.toParameterName(parameter.name);
                return `      ...(${parameterName} !== undefined && {
        "${parameter.name}": ${parameterName}
      })`;
            })
                .join(",\n")}
    }`
            : "";
        // =========================
        // HTTP Request Options
        // =========================
        const requestOptions = [
            `method: "${endpoint.method}"`,
            `url: \`${url}\``
        ];
        if (query) {
            requestOptions.push(query);
        }
        if (headers) {
            requestOptions.push(headers);
        }
        if (body) {
            requestOptions.push(body);
        }
        // =========================
        // Generated Method
        // =========================
        return `async ${methodName}(${this.indent(requestParameter, 2)}): Promise<${returnType}> {
  const response = await this.http.request<${returnType}>({
    ${requestOptions.join(",\n    ")}
  });

  return response.data;
}`;
    }
    generateUrl(endpoint) {
        let url = `${"${this.baseUrl}"}${endpoint.path}`;
        for (const parameter of endpoint.parameters) {
            if (parameter.location === "path") {
                url = url.replace(`{${parameter.name}}`, `\${${parameter.name}}`);
            }
        }
        return url;
    }
    generateMethodName(endpoint) {
        const pathName = endpoint.path
            .replace(/[{}]/g, "")
            .split("/")
            .filter(Boolean)
            .join(" ");
        return `${endpoint.method.toLowerCase()}${this.toPascalCase(pathName)}`;
    }
    groupByResource(endpoints) {
        const groups = new Map();
        for (const endpoint of endpoints) {
            const resource = endpoint.path
                .split("/")
                .filter(Boolean)[0] ??
                "default";
            const existing = groups.get(resource) ?? [];
            existing.push(endpoint);
            groups.set(resource, existing);
        }
        return groups;
    }
    toPascalCase(value) {
        return value
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map((part) => part.charAt(0).toUpperCase() +
            part.slice(1))
            .join("");
    }
    toFileName(value) {
        return value
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .toLowerCase();
    }
    indent(value, spaces) {
        const indentation = " ".repeat(spaces);
        return value
            .split("\n")
            .map((line) => line.trim()
            ? indentation + line
            : line)
            .join("\n");
    }
    getBaseType(type) {
        return type.replace(/\[\]$/, "");
    }
    toParameterName(value) {
        return value
            .replace(/[-_]+(.)?/g, (_, char) => char ? char.toUpperCase() : "")
            .replace(/^([A-Z])/, (_, char) => char.toLowerCase());
    }
}
//# sourceMappingURL=client.generator.js.map