import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { TypeScriptClientGenerator } from "../../generators/typescript/client.generator.js";
import { generateHttpClient } from "../../generators/typescript/http-client.generator.js";
import { TypeScriptTypeRenderer } from "./typescript-type.renderer.js";
import { TypeScriptTypeMapper } from "./typescript-type.mapper.js";
import type { CodeGenerator } from "../../core/generator/code-generator.js";
import type { CodeXaDocument } from "../../core/models/codexa-document.js";

export class TypeScriptGenerator implements CodeGenerator {
    private readonly typeRenderer =
        new TypeScriptTypeRenderer();
    private readonly typeMapper =
        new TypeScriptTypeMapper();
    async generate(
        document: CodeXaDocument,
        outputDirectory: string
    ): Promise<void> {
        const modelsDirectory = path.join(
            outputDirectory,
            "models"
        );

        await mkdir(modelsDirectory, {
            recursive: true
        });

        for (const model of document.models) {
            const fileName = this.toFileName(
                model.name
            );

            const content =
                this.generateModel(model);

            await writeFile(
                path.join(
                    modelsDirectory,
                    `${fileName}.ts`
                ),
                content,
                "utf8"
            );
        }

        await writeFile(
            path.join(outputDirectory, "index.ts"),
            this.generateIndex(document),
            "utf8"
        );

        const clientGenerator =
            new TypeScriptClientGenerator();

        await clientGenerator.generate(
            document,
            outputDirectory
        );

        await generateHttpClient(
            outputDirectory
        );
    }

    private generateModel(
        model: CodeXaDocument["models"][number]
    ): string {
        const properties = model.properties
            .map((property) => {
                const optional = property.required
                    ? ""
                    : "?";

                const type =
                    this.typeRenderer.render(
                        property.type
                    );

                return `  ${property.name}${optional}: ${this.typeMapper.map(property.type)};`;
            })
            .join("\n");

        return `export interface ${model.name} {
${properties}
}
`;
    }

    private generateIndex(
        document: CodeXaDocument
    ): string {
        return document.models
            .map((model) => {
                const fileName =
                    this.toFileName(model.name);

                return `export * from "./models/${fileName}.js";`;
            })
            .join("\n") + "\n";
    }

    private toFileName(
        name: string
    ): string {
        return name
            .replace(
                /([a-z0-9])([A-Z])/g,
                "$1-$2"
            )
            .replace(
                /[\s_]+/g,
                "-"
            )
            .toLowerCase();
    }
}