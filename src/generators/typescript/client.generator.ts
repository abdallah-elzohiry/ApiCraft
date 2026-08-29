import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type { CodeXaDocument } from "../../core/models/codexa-document.js";
import type { CodeXaEndpoint } from "../../core/models/codexa-endpoint.js";

import { TypeScriptTypeMapper } from "./typescript-type.mapper.js";

export class TypeScriptClientGenerator {

    private readonly typeMapper =
        new TypeScriptTypeMapper();

    async generate(
        document: CodeXaDocument,
        outputDirectory: string
    ): Promise<void> {

        const clientsDirectory =
            path.join(
                outputDirectory,
                "clients"
            );

        await mkdir(clientsDirectory, {
            recursive: true
        });

        const groupedEndpoints =
            this.groupByResource(
                document.endpoints
            );

        for (
            const [resource, endpoints]
            of groupedEndpoints
        ) {

            const fileName =
                `${this.toFileName(resource)}.client.ts`;

            const content =
                this.generateClient(
                    resource,
                    endpoints
                );

            await writeFile(
                path.join(
                    clientsDirectory,
                    fileName
                ),
                content,
                "utf8"
            );
        }
    }

    private generateClient(
        resource: string,
        endpoints: CodeXaEndpoint[]
    ): string {

        const className =
            `${this.toPascalCase(resource)}Client`;

        const methods =
            endpoints
                .map(endpoint =>
                    this.generateMethod(endpoint)
                )
                .join("\n\n");

        const indentedMethods =
            this.indent(methods, 2);

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

    private generateImports(
        endpoints: CodeXaEndpoint[]
    ): string {

        const imports =
            new Map<string, string>();

        for (const endpoint of endpoints) {

            // =========================
            // Request Body
            // =========================

            if (endpoint.requestBody) {

                const references =
                    this.typeMapper.getReferencedTypes(
                        endpoint.requestBody.type
                    );

                for (const reference of references) {

                    imports.set(
                        reference,
                        `import type { ${reference} } from "../models/${this.toFileName(reference)}.js";`
                    );
                }
            }

            // =========================
            // Response
            // =========================

            if (endpoint.response) {

                const references =
                    this.typeMapper.getReferencedTypes(
                        endpoint.response.type
                    );

                for (const reference of references) {

                    imports.set(
                        reference,
                        `import type { ${reference} } from "../models/${this.toFileName(reference)}.js";`
                    );
                }
            }

            // =========================
            // Parameters
            // =========================

            for (
                const parameter
                of endpoint.parameters
            ) {

                const references =
                    this.typeMapper.getReferencedTypes(
                        parameter.type
                    );

                for (const reference of references) {

                    imports.set(
                        reference,
                        `import type { ${reference} } from "../models/${this.toFileName(reference)}.js";`
                    );
                }
            }
        }

        return [...imports.values()].join("\n");
    }

    private generateMethod(
        endpoint: CodeXaEndpoint
    ): string {

        const methodName =
            endpoint.operationId ??
            this.generateMethodName(endpoint);

        // =========================
        // Path Parameters
        // =========================

        const pathParameters =
            endpoint.parameters
                .filter(
                    parameter =>
                        parameter.location === "path"
                )
                .map(
                    parameter =>
                        `${parameter.name}: ${this.typeMapper.map(
                            parameter.type
                        )}`
                );

        // =========================
        // Query Parameters
        // =========================

        const queryParameters =
            endpoint.parameters
                .filter(
                    parameter =>
                        parameter.location === "query"
                )
                .map(
                    parameter =>
                        `${parameter.name}${parameter.required ? "" : "?"
                        }: ${this.typeMapper.map(
                            parameter.type
                        )}`
                );

        // =========================
        // Header Parameters
        // =========================

        const headerParameters =
            endpoint.parameters
                .filter(
                    parameter =>
                        parameter.location === "header"
                )
                .map(
                    parameter =>
                        `${this.toParameterName(
                            parameter.name
                        )}${parameter.required ? "" : "?"
                        }: ${this.typeMapper.map(
                            parameter.type
                        )}`
                );

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

        const requestParameter =
            endpoint.requestBody
                ? `${parameters
                    ? `${parameters}, `
                    : ""
                }request: ${this.typeMapper.map(
                    endpoint.requestBody.type
                )}`
                : parameters;

        // =========================
        // Response
        // =========================

        const returnType =
            endpoint.response
                ? this.typeMapper.map(
                    endpoint.response.type
                )
                : "void";

        // =========================
        // URL
        // =========================

        const url =
            this.generateUrl(endpoint);

        // =========================
        // Body
        // =========================

        const body =
            endpoint.requestBody
                ? "body: request"
                : "";

        // =========================
        // Query
        // =========================

        const query =
            endpoint.parameters.filter(
                parameter =>
                    parameter.location === "query"
            ).length > 0
                ? `query: {
${endpoint.parameters
                    .filter(
                        parameter =>
                            parameter.location === "query"
                    )
                    .map(
                        parameter =>
                            `      ${parameter.name}`
                    )
                    .join(",\n")}
    }`
                : "";

        // =========================
        // Headers
        // =========================

        const headers =
            endpoint.parameters.filter(
                parameter =>
                    parameter.location === "header"
            ).length > 0
                ? `headers: {
${endpoint.parameters
                    .filter(
                        parameter =>
                            parameter.location === "header"
                    )
                    .map(
                        parameter => {

                            const parameterName =
                                this.toParameterName(
                                    parameter.name
                                );

                            return `      ...(${parameterName} !== undefined && {
        "${parameter.name}": ${parameterName}
      })`;
                        }
                    )
                    .join(",\n")}
    }`
                : "";

        // =========================
        // HTTP Request Options
        // =========================

        const requestOptions: string[] = [
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

        return `async ${methodName}(${this.indent(
            requestParameter,
            2
        )}): Promise<${returnType}> {

  const response = await this.http.request<${returnType}>({
    ${requestOptions.join(",\n    ")}
  });

  return response.data;

}`;
    }

    private generateUrl(
        endpoint: CodeXaEndpoint
    ): string {

        let url =
            `${"${this.baseUrl}"}${endpoint.path}`;

        for (
            const parameter
            of endpoint.parameters
        ) {

            if (
                parameter.location === "path"
            ) {

                url = url.replace(
                    `{${parameter.name}}`,
                    `\${${parameter.name}}`
                );
            }
        }

        return url;
    }

    private generateMethodName(
        endpoint: CodeXaEndpoint
    ): string {

        const pathName =
            endpoint.path
                .replace(/[{}]/g, "")
                .split("/")
                .filter(Boolean)
                .join(" ");

        return `${endpoint.method.toLowerCase()}${this.toPascalCase(
            pathName
        )}`;
    }

    private groupByResource(
        endpoints: CodeXaEndpoint[]
    ): Map<string, CodeXaEndpoint[]> {

        const groups =
            new Map<string, CodeXaEndpoint[]>();

        for (const endpoint of endpoints) {

            const resource =
                endpoint.path
                    .split("/")
                    .filter(Boolean)[0] ??
                "default";

            const existing =
                groups.get(resource) ?? [];

            existing.push(endpoint);

            groups.set(
                resource,
                existing
            );
        }

        return groups;
    }

    private toPascalCase(
        value: string
    ): string {

        return value
            .split(/[-_\s]+/)
            .filter(Boolean)
            .map(
                part =>
                    part.charAt(0).toUpperCase() +
                    part.slice(1)
            )
            .join("");
    }

    private toFileName(
        value: string
    ): string {

        return value
            .replace(
                /([a-z0-9])([A-Z])/g,
                "$1-$2"
            )
            .toLowerCase();
    }

    private indent(
        value: string,
        spaces: number
    ): string {

        const indentation =
            " ".repeat(spaces);

        return value
            .split("\n")
            .map(line =>
                line.trim()
                    ? indentation + line
                    : line
            )
            .join("\n");
    }

    private toParameterName(
        value: string
    ): string {

        return value
            .replace(
                /[-_]+(.)?/g,
                (_, char) =>
                    char
                        ? char.toUpperCase()
                        : ""
            )
            .replace(
                /^([A-Z])/,
                (_, char) =>
                    char.toLowerCase()
            );
    }
}
