export type CodeXaPrimitiveType =
    | "string"
    | "number"
    | "boolean"
    | "unknown";

export interface CodeXaPrimitive {
    kind: "primitive";
    name: CodeXaPrimitiveType;
}

export interface CodeXaNull {
    kind: "null";
}

export interface CodeXaReference {
    kind: "reference";
    name: string;
}

export interface CodeXaArray {
    kind: "array";
    elementType: CodeXaType;
}

export interface CodeXaObject {
    kind: "object";
    properties: CodeXaPropertyType[];
}

export interface CodeXaDictionary {
    kind: "dictionary";
    valueType: CodeXaType;
}

export interface CodeXaEnum {
    kind: "enum";
    values: (string | number | boolean)[];
}

export interface CodeXaOneOf {
    kind: "oneOf";
    types: CodeXaType[];
}

export interface CodeXaAnyOf {
    kind: "anyOf";
    types: CodeXaType[];
}

export interface CodeXaAllOf {
    kind: "allOf";
    types: CodeXaType[];
}

export interface CodeXaPropertyType {
    name: string;
    type: CodeXaType;
    required: boolean;
}

export type CodeXaType =
    | CodeXaPrimitive
    | CodeXaNull
    | CodeXaReference
    | CodeXaArray
    | CodeXaObject
    | CodeXaDictionary
    | CodeXaEnum
    | CodeXaOneOf
    | CodeXaAnyOf
    | CodeXaAllOf;