import {afterEach,describe,expect,it} from "vitest";
import {mkdtemp,readFile,rm} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { TypeScriptGenerator } from "../../../src/generators/typescript/typescript.generator.js";

describe("TypeScriptGenerator", () => {
    let outputDirectory: string;

    afterEach(async () => {
        if (outputDirectory) {
            await rm(outputDirectory, {
                recursive: true,
                force: true
            });
        }
    });

    it("should generate TypeScript models", async () => {
        outputDirectory = await mkdtemp(
            path.join(
                os.tmpdir(),
                "codexa-"
            )
        );

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            {
                title: "Demo API",
                version: "1.0.0",

                endpoints: [],

                models: [
                    {
                        name: "UserDto",
                        properties: [
                            {
                                name: "id",
                                type: {
                                    kind: "primitive",
                                    name: "number"
                                },
                                required: true
                            },
                            {
                                name: "name",
                                type: {
                                    kind: "primitive",
                                    name: "string"
                                },
                                required: true
                            },
                            {
                                name: "email",
                                type: {
                                    kind: "primitive",
                                    name: "string"
                                },
                                required: false
                            },
                            {
                                name: "roles",
                                type: {
                                    kind: "array",
                                    elementType: {
                                        kind: "reference",
                                        name: "RoleDto"
                                    }
                                },
                                required: false
                            }
                        ]
                    }
                ]
            },
            outputDirectory
        );

        const userDtoPath = path.join(
            outputDirectory,
            "models",
            "user-dto.ts"
        );

        const content =
            await readFile(
                userDtoPath,
                "utf8"
            );

        expect(content).toContain(
            "id: number;"
        );

        expect(content).toContain(
            "name: string;"
        );

        expect(content).toContain(
            "email?: string;"
        );

        expect(content).toContain(
            "roles?: RoleDto[];"
        );
    });
});