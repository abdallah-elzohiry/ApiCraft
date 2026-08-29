import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TypeScriptClientGenerator } from "../../generators/typescript/client.generator.js";
import { generateHttpClient } from "../../generators/typescript/http-client.generator.js";
export class TypeScriptGenerator {
    async generate(document, outputDirectory) {
        const modelsDirectory = path.join(outputDirectory, "models");
        await mkdir(modelsDirectory, {
            recursive: true
        });
        for (const model of document.models) {
            const fileName = this.toFileName(model.name);
            const content = this.generateModel(model);
            await writeFile(path.join(modelsDirectory, `${fileName}.ts`), content, "utf8");
        }
        await writeFile(path.join(outputDirectory, "index.ts"), this.generateIndex(document), "utf8");
        const clientGenerator = new TypeScriptClientGenerator();
        await clientGenerator.generate(document, outputDirectory);
        await generateHttpClient(outputDirectory);
    }
    generateModel(model) {
        const properties = model.properties
            .map((property) => {
            const optional = property.required ? "" : "?";
            return `  ${property.name}${optional}: ${property.type};`;
        })
            .join("\n");
        return `export interface ${model.name} {
${properties}
}
`;
    }
    generateIndex(document) {
        return document.models
            .map((model) => {
            const fileName = this.toFileName(model.name);
            return `export * from "./models/${fileName}.js";`;
        })
            .join("\n") + "\n";
    }
    toFileName(name) {
        return name
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/[\s_]+/g, "-")
            .toLowerCase();
    }
}
//# sourceMappingURL=typescript.generator.js.map