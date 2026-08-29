import type { RefResolver } from "./ref-resolver.js";

export class OpenApiRefResolver
    implements RefResolver {
    constructor(
        private readonly document: unknown
    ) { }

    resolve<T = unknown>(
        ref: string
    ): T {
        if (!ref.startsWith("#/")) {
            throw new Error(
                `Only local references are supported: ${ref}`
            );
        }

        const parts = ref
            .slice(2)
            .split("/")
            .map(this.decodePointer);

        let current: unknown =
            this.document;

        for (const part of parts) {
            if (
                current === null ||
                typeof current !== "object" ||
                !(part in current)
            ) {
                throw new Error(
                    `Unable to resolve reference: ${ref}`
                );
            }

            current = (
                current as Record<string, unknown>
            )[part];
        }

        return current as T;
    }

    private decodePointer(
        value: string
    ): string {
        return value
            .replace(/~1/g, "/")
            .replace(/~0/g, "~");
    }
}