import {
    afterEach,
    describe,
    expect,
    it
} from "vitest";

import {
    mkdtemp,
    readFile,
    rm
} from "node:fs/promises";

import os from "node:os";
import path from "node:path";

import { OpenApiParser } from "../../src/core/parser/openapi.parser.js";
import { TypeScriptGenerator } from "../../src/generators/typescript/typescript.generator.js";

describe("OpenAPI → TypeScript", () => {
    let outputDirectory: string | undefined;

    afterEach(async () => {
        if (outputDirectory) {
            await rm(outputDirectory, {
                recursive: true,
                force: true
            });
        }
    });

    it("should generate TypeScript from OpenAPI", async () => {
        const parser =
            new OpenApiParser();

        const fixturePath =
            path.resolve(
                "tests/fixtures/users.openapi.json"
            );

        const document =
            await parser.parse(fixturePath);

        expect(document.title)
            .toBe("Users API");

        expect(document.models)
            .toHaveLength(3);

        expect(document.endpoints)
            .toHaveLength(1);

        const tempDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "codexa-integration-"
                )
            );

        outputDirectory = tempDirectory;

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            document,
            tempDirectory
        );

        const userDto =
            await readFile(
                path.join(
                    tempDirectory,
                    "models",
                    "user-dto.ts"
                ),
                "utf8"
            );

        expect(userDto)
            .toContain(
                "id: number;"
            );

        expect(userDto)
            .toContain(
                "name: string;"
            );

        expect(userDto)
            .toContain(
                "address?: AddressDto;"
            );

        expect(userDto)
            .toContain(
                "roles?: RoleDto[];"
            );
    });
});
