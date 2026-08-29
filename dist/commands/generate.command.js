import { Command } from "commander";
import { OpenApiParser } from "../core/parser/openapi.parser.js";
import { TypeScriptGenerator } from "../generators/typescript/typescript.generator.js";
export function createGenerateCommand() {
    return new Command("generate")
        .description("Generate code from an OpenAPI specification")
        .requiredOption("-i, --input <path>", "Path to OpenAPI specification")
        .option("-o, --output <path>", "Output directory", "./generated")
        .action(async (options) => {
        console.log("🚀 CodeXA Generate");
        const parser = new OpenApiParser();
        const document = await parser.parse(options.input);
        console.log();
        console.log("API:", document.title);
        console.log("Version:", document.version);
        console.log("Endpoints:", document.endpoints.length);
        console.log();
        for (const endpoint of document.endpoints) {
            console.log(`${endpoint.method.padEnd(6)} ${endpoint.path}`);
            for (const parameter of endpoint.parameters) {
                console.log(`${parameter.name}: ${parameter.type} (${parameter.location})`);
            }
            if (endpoint.requestBody) {
                console.log(`         Request: ${endpoint.requestBody.type}${endpoint.requestBody.required
                    ? " (required)"
                    : ""}`);
            }
            if (endpoint.response) {
                console.log(`Response: ${endpoint.response.statusCode} → ${endpoint.response.type}`);
            }
        }
        console.log();
        console.log("Models:", document.models.length);
        for (const model of document.models) {
            console.log();
            console.log(`Model: ${model.name}`);
            for (const property of model.properties) {
                console.log(`  ${property.name}: ${property.type}${property.required
                    ? " (required)"
                    : ""}`);
            }
        }
        // =========================
        // Generate TypeScript
        // =========================
        const generator = new TypeScriptGenerator();
        await generator.generate(document, options.output);
        console.log();
        console.log(`✅ Generated successfully: ${options.output}`);
    });
}
//# sourceMappingURL=generate.command.js.map