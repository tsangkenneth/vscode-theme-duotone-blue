import type { SyntaxColors } from "../types.ts";

const namedTypes = [
  "namespace",
  "class",
  "enum",
  "interface",
  "struct",
  "type",
  "typeParameter",
  "function",
  "method",
  "macro",
  "decorator",
];

const definitionTypes = [
  "namespace",
  "class",
  "enum",
  "interface",
  "struct",
  "type",
  "function",
  "method",
  "macro",
];

export const getSemanticTokenColors = (
  syntax: SyntaxColors,
): Record<string, string> => ({
  ...Object.fromEntries(namedTypes.map((type) => [type, syntax.text])),
  ...Object.fromEntries(
    definitionTypes.map((type) => [`${type}.declaration`, syntax.definition]),
  ),
  ...Object.fromEntries(
    definitionTypes.map((type) => [`${type}.definition`, syntax.definition]),
  ),
  variable: syntax.text,
  parameter: syntax.text,
  property: syntax.text,
  enumMember: syntax.constant,
  "*.readonly": syntax.constant,
});
