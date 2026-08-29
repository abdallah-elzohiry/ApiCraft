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

describe("Advanced OpenAPI → TypeScript", () => {

    let outputDirectory: string | undefined;

    afterEach(async () => {

        if (outputDirectory) {
            await rm(
                outputDirectory,
                {
                    recursive: true,
                    force: true
                }
            );
        }

    });

    it("should generate advanced TypeScript models and clients", async () => {

        const parser =
            new OpenApiParser();

        const fixturePath =
            path.resolve(
                "tests/fixtures/advanced.openapi.json"
            );

        const document =
            await parser.parse(fixturePath);

        // =========================
        // Document
        // =========================

        expect(document.title)
            .toBe("Advanced Users API");

        // =========================
        // Models
        // =========================

        expect(document.models)
            .toHaveLength(6);

        const modelNames =
            document.models.map(
                model => model.name
            );

        expect(modelNames)
            .toContain("UserDto");

        expect(modelNames)
            .toContain("CreateUserRequest");

        expect(modelNames)
            .toContain("AddressDto");

        expect(modelNames)
            .toContain("RoleDto");

        expect(modelNames)
            .toContain("AdminProfileDto");

        expect(modelNames)
            .toContain("UserProfileDto");

        // =========================
        // Endpoints
        // =========================

        expect(document.endpoints)
            .toHaveLength(3);

        // =========================
        // Generate
        // =========================

        outputDirectory =
            await mkdtemp(
                path.join(
                    os.tmpdir(),
                    "codexa-advanced-"
                )
            );

        const generator =
            new TypeScriptGenerator();

        await generator.generate(
            document,
            outputDirectory
        );

        // =========================
        // UserDto
        // =========================

        const userDto =
            await readFile(
                path.join(
                    outputDirectory,
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
                "email?: string;"
            );

        expect(userDto)
            .toContain(
                "isActive?: boolean;"
            );

        expect(userDto)
            .toContain(
                "address?: AddressDto;"
            );

        expect(userDto)
            .toContain(
                "roles?: RoleDto[];"
            );

        // =========================
        // CreateUserRequest
        // =========================

        const createUserRequest =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "create-user-request.ts"
                ),
                "utf8"
            );

        expect(createUserRequest)
            .toContain(
                "name: string;"
            );

        expect(createUserRequest)
            .toContain(
                "email: string;"
            );

        expect(createUserRequest)
            .toContain(
                "roleIds?: number[];"
            );

        // =========================
        // AddressDto
        // =========================

        const addressDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "address-dto.ts"
                ),
                "utf8"
            );

        expect(addressDto)
            .toContain(
                "city?: string;"
            );

        expect(addressDto)
            .toContain(
                "country?: string;"
            );

        // =========================
        // RoleDto
        // =========================

        const roleDto =
            await readFile(
                path.join(
                    outputDirectory,
                    "models",
                    "role-dto.ts"
                ),
                "utf8"
            );

        expect(roleDto)
            .toContain(
                "id?: number;"
            );

        expect(roleDto)
            .toContain(
                "name?: string;"
            );

        // =========================
        // Client
        // =========================

        const usersClient =
            await readFile(
                path.join(
                    outputDirectory,
                    "clients",
                    "users.client.ts"
                ),
                "utf8"
            );

        expect(usersClient)
            .toContain(
                "export class UsersClient"
            );

        expect(usersClient)
            .toContain(
                "getUser"
            );

        expect(usersClient)
            .toContain(
                "createUser"
            );

        expect(usersClient)
            .toContain(
                "deactivateUser"
            );

        // =========================
        // Path parameter
        // =========================

        expect(usersClient)
            .toContain(
                "id: number"
            );

        // =========================
        // Query parameter
        // =========================

        expect(usersClient)
            .toContain(
                "includeAddress?: boolean"
            );

        // =========================
        // Request body
        // =========================

        expect(usersClient)
            .toContain(
                "request: CreateUserRequest"
            );

        // =========================
        // Response
        // =========================

        expect(usersClient)
            .toContain(
                "Promise<UserDto>"
            );

        // =========================
        // Void response
        // =========================

        expect(usersClient)
            .toContain(
                "Promise<void>"
            );

    });

});
