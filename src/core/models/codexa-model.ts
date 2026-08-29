import type { CodeXaType } from "./codexa-type.js";

export interface CodeXaModel {
    name: string;
    properties: CodeXaProperty[];
}

export interface CodeXaProperty {
    name: string;
    type: CodeXaType;
    required: boolean;
}