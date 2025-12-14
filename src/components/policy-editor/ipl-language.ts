import { LanguageSupport, StreamLanguage } from "@codemirror/language";

// IPL (Infera Policy Language) keywords
const IPL_KEYWORDS = [
  "schema",
  "entity",
  "module",
  "derived",
  "wasm",
  "function",
  "when",
  "match",
  "from",
  "to",
  "on",
  "allow",
  "deny",
  "true",
  "false",
  "self",
  "principal",
  "resource",
  "context",
  "action",
  "source",
  "revision",
  "capabilities",
  "limits",
  "exports",
  "permission",
];

const IPL_BLOCK_KEYWORDS = [
  "attributes",
  "relations",
  "permissions",
  "methods",
  "network",
];

const IPL_TYPES = [
  "UUID",
  "String",
  "Boolean",
  "Timestamp",
  "Set",
  "Enum",
  "Context",
  "Resource",
  "User",
];

const IPL_OPERATORS = ["and", "or", "not", "in", "in_cidr"];

const IPL_DECORATORS = ["@unique", "@indexed", "@default"];

// StreamLanguage parser for IPL
const iplParser = StreamLanguage.define({
  name: "ipl",
  startState: () => ({
    inString: false,
    inComment: false,
    inBlock: false,
  }),
  token: (stream, state) => {
    // Handle strings
    if (state.inString) {
      while (!stream.eol()) {
        if (stream.next() === '"' && stream.peek() !== "\\") {
          state.inString = false;
          return "string";
        }
      }
      return "string";
    }

    // Handle block comments
    if (state.inComment) {
      while (!stream.eol()) {
        if (stream.match("*/")) {
          state.inComment = false;
          return "comment";
        }
        stream.next();
      }
      return "comment";
    }

    // Skip whitespace
    if (stream.eatSpace()) return null;

    // Single line comments
    if (stream.match("#") || stream.match("//")) {
      stream.skipToEnd();
      return "comment";
    }

    // Block comments
    if (stream.match("/*")) {
      state.inComment = true;
      return "comment";
    }

    // Strings
    if (stream.match('"')) {
      state.inString = true;
      return "string";
    }

    // Decorators
    if (stream.match(/@\w+/)) {
      return "meta";
    }

    // Numbers
    if (stream.match(/^\d+(\.\d+)?/)) {
      return "number";
    }

    // Version numbers (e.g., v1.0)
    if (stream.match(/^v\d+(\.\d+)?/)) {
      return "number";
    }

    // Operators
    if (stream.match(/^(->|=>|::|:|{|}|\(|\)|\[|\]|,|\.|\|)/)) {
      return "punctuation";
    }

    // Comparison operators
    if (stream.match(/^(==|!=|<=|>=|<|>)/)) {
      return "operator";
    }

    // Words
    if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
      const word = stream.current();

      if (IPL_KEYWORDS.includes(word)) {
        return "keyword";
      }

      if (IPL_BLOCK_KEYWORDS.includes(word)) {
        return "keyword";
      }

      if (IPL_TYPES.includes(word)) {
        return "typeName";
      }

      if (IPL_OPERATORS.includes(word)) {
        return "operator";
      }

      // Check for type references (e.g., User#member)
      if (stream.peek() === "#") {
        return "typeName";
      }

      return "variableName";
    }

    // Hash for relation references
    if (stream.match("#")) {
      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
        return "propertyName";
      }
      return "punctuation";
    }

    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: "#", block: { open: "/*", close: "*/" } },
    closeBrackets: { brackets: ["(", "[", "{", '"'] },
    indentOnInput: /^\s*[}\]]$/,
  },
});

// Export the language support
export function ipl(): LanguageSupport {
  return new LanguageSupport(iplParser);
}

// Export keyword lists for autocomplete
export const iplKeywords = [...IPL_KEYWORDS, ...IPL_BLOCK_KEYWORDS];
export const iplTypes = IPL_TYPES;
export const iplOperators = IPL_OPERATORS;
export const iplDecorators = IPL_DECORATORS;

// Helper to extract entity names from IPL code
export function extractEntities(code: string): string[] {
  const entityRegex = /entity\s+(\w+)/g;
  const entities: string[] = [];
  let match;
  while ((match = entityRegex.exec(code)) !== null) {
    entities.push(match[1]);
  }
  return entities;
}

// Helper to extract relation names from IPL code
export function extractRelations(
  code: string
): { entity: string; relation: string }[] {
  const relations: { entity: string; relation: string }[] = [];
  const entityBlocks = code.split(/entity\s+(\w+)/);

  for (let i = 1; i < entityBlocks.length; i += 2) {
    const entityName = entityBlocks[i];
    const block = entityBlocks[i + 1];

    const relationMatch = block.match(/relations\s*{([^}]+)}/);
    if (relationMatch) {
      const relationDefs = relationMatch[1];
      const relationRegex = /(\w+):/g;
      let match;
      while ((match = relationRegex.exec(relationDefs)) !== null) {
        relations.push({ entity: entityName, relation: match[1] });
      }
    }
  }

  return relations;
}

// Helper to extract permission names from IPL code
export function extractPermissions(
  code: string
): { entity: string; permission: string }[] {
  const permissions: { entity: string; permission: string }[] = [];
  const entityBlocks = code.split(/entity\s+(\w+)/);

  for (let i = 1; i < entityBlocks.length; i += 2) {
    const entityName = entityBlocks[i];
    const block = entityBlocks[i + 1];

    const permissionMatch = block.match(/permissions\s*{([^}]+)}/);
    if (permissionMatch) {
      const permissionDefs = permissionMatch[1];
      const permissionRegex = /(\w+):/g;
      let match;
      while ((match = permissionRegex.exec(permissionDefs)) !== null) {
        permissions.push({ entity: entityName, permission: match[1] });
      }
    }
  }

  return permissions;
}
