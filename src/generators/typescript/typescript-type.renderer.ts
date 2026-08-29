import type { CodeXaType } from "../../core/models/codexa-type.js";

export class TypeScriptTypeRenderer {

    render(
        type: CodeXaType
    ): string {

        switch (type.kind) {

            // =========================
            // Primitive
            // =========================

            case "primitive":
                return type.name;

            // =========================
            // Reference
            // =========================

            case "reference":
                return type.name;

            // =========================
            // Array
            // =========================

            case "array": {
                const elementType =
                    this.render(type.elementType);

                const needsParentheses =
                    type.elementType.kind === "oneOf" ||
                    type.elementType.kind === "anyOf" ||
                    type.elementType.kind === "allOf";

                return needsParentheses
                    ? `(${elementType})[]`
                    : `${elementType}[]`;
            }

            // =========================
            // Object
            // =========================

            case "object":
                return this.renderObject(type);

            // =========================
            // Dictionary
            // =========================

            case "dictionary":
                return `Record<string, ${this.render(
                    type.valueType
                )}>`;

            // =========================
            // Enum
            // =========================

            case "enum":
                return type.values
                    .map(value =>
                        typeof value === "string"
                            ? JSON.stringify(value)
                            : String(value)
                    )
                    .join(" | ");

            // =========================
            // oneOf
            // =========================

            case "oneOf":
                return type.types
                    .map(type =>
                        this.render(type)
                    )
                    .join(" | ");

            // =========================
            // anyOf
            // =========================

            case "anyOf":
                return type.types
                    .map(type =>
                        this.render(type)
                    )
                    .join(" | ");

            // =========================
            // allOf
            // =========================

            case "allOf":
                return type.types
                    .map(type =>
                        this.render(type)
                    )
                    .join(" & ");
            default:
                return "unknown";
        }
    }

    getReferences(
        type: CodeXaType
    ): string[] {

        switch (type.kind) {

            // =========================
            // Primitive
            // =========================

            case "primitive":
                return [];

            // =========================
            // Reference
            // =========================

            case "reference":
                return [type.name];

            // =========================
            // Array
            // =========================

            case "array":
                return this.getReferences(
                    type.elementType
                );

            // =========================
            // Object
            // =========================

            case "object":
                return type.properties.flatMap(
                    property =>
                        this.getReferences(
                            property.type
                        )
                );

            // =========================
            // Dictionary
            // =========================

            case "dictionary":
                return this.getReferences(
                    type.valueType
                );

            // =========================
            // Enum
            // =========================

            case "enum":
                return [];

            // =========================
            // oneOf / anyOf / allOf
            // =========================

            case "oneOf":
            case "anyOf":
            case "allOf":
                return [
                    ...new Set(
                        type.types.flatMap(
                            nestedType =>
                                this.getReferences(
                                    nestedType
                                )
                        )
                    )
                ];
            default:
                return [];
        }
    }

    private renderObject(
        type: Extract<
            CodeXaType,
            { kind: "object" }
        >
    ): string {

        if (
            type.properties.length === 0
        ) {
            return "Record<string, unknown>";
        }

        const properties =
            type.properties
                .map(property => {

                    const optional =
                        property.required
                            ? ""
                            : "?";

                    return `  ${property.name}${optional}: ${this.render(property.type)};`;
                })
                .join("\n");

        return `{
${properties}
}`;
    }
}