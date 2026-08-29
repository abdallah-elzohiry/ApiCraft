import type { CodeXaType } from "../../core/models/codexa-type.js";

export class TypeScriptTypeMapper {

    map(type: CodeXaType): string {
        switch (type.kind) {

            case "primitive":
                return type.name;

            case "reference":
                return type.name;

            case "array":
                return `${this.map(type.elementType)}[]`;

            case "object":
                return "Record<string, unknown>";

            default:
                return "unknown";
        }
    }

    getReferencedTypes(
        type: CodeXaType
    ): string[] {

        switch (type.kind) {

            case "reference":
                return [type.name];

            case "array":
                return this.getReferencedTypes(
                    type.elementType
                );

            case "object":
                return type.properties.flatMap(
                    property =>
                        this.getReferencedTypes(
                            property.type
                        )
                );

            case "primitive":
                return [];

            default:
                return [];
        }
    }
}