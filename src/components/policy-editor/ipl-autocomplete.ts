import {
  autocompletion,
  CompletionContext,
  CompletionResult,
  Completion,
} from "@codemirror/autocomplete";
import {
  iplKeywords,
  iplTypes,
  iplOperators,
  iplDecorators,
  extractEntities,
  extractRelations,
  extractPermissions,
} from "./ipl-language";

// Completion item types
const keywordCompletions: Completion[] = iplKeywords.map((kw) => ({
  label: kw,
  type: "keyword",
  detail: "keyword",
  boost: 1,
}));

const typeCompletions: Completion[] = iplTypes.map((t) => ({
  label: t,
  type: "type",
  detail: "type",
  boost: 0,
}));

const operatorCompletions: Completion[] = iplOperators.map((op) => ({
  label: op,
  type: "keyword",
  detail: "operator",
  boost: -1,
}));

const decoratorCompletions: Completion[] = iplDecorators.map((dec) => ({
  label: dec,
  type: "property",
  detail: "decorator",
  boost: 2,
}));

// Built-in attribute types with templates
const attributeTypeSnippets: Completion[] = [
  {
    label: "UUID",
    type: "type",
    detail: "Unique identifier",
    apply: "UUID",
  },
  {
    label: "String",
    type: "type",
    detail: "Text value",
    apply: "String",
  },
  {
    label: "Boolean",
    type: "type",
    detail: "True/false value",
    apply: "Boolean",
  },
  {
    label: "Timestamp",
    type: "type",
    detail: "Date and time",
    apply: "Timestamp",
  },
  {
    label: "Set<>",
    type: "type",
    detail: "Collection of values",
    apply: "Set<${}>",
  },
  {
    label: "Enum<>",
    type: "type",
    detail: "Enumerated values",
    apply: 'Enum<"${}", "">',
  },
];

// Block structure snippets
const blockSnippets: Completion[] = [
  {
    label: "entity",
    type: "keyword",
    detail: "Define entity",
    apply: "entity ${Name} {\n  attributes {\n    id: UUID\n  }\n}",
    boost: 3,
  },
  {
    label: "attributes",
    type: "keyword",
    detail: "Attribute block",
    apply: "attributes {\n  ${}\n}",
  },
  {
    label: "relations",
    type: "keyword",
    detail: "Relations block",
    apply: "relations {\n  ${}\n}",
  },
  {
    label: "permissions",
    type: "keyword",
    detail: "Permissions block",
    apply: "permissions {\n  ${}\n}",
  },
  {
    label: "methods",
    type: "keyword",
    detail: "Methods block",
    apply: "methods {\n  ${}\n}",
  },
  {
    label: "module",
    type: "keyword",
    detail: "Policy module",
    apply:
      "module ${name} {\n  function ${func_name}(${params}) -> Boolean {\n    ${}\n  }\n}",
    boost: 2,
  },
  {
    label: "wasm module",
    type: "keyword",
    detail: "WASM module",
    apply:
      'wasm module ${name} {\n  source: "${id}"\n  revision: "latest"\n  \n  capabilities {\n  }\n  \n  exports {\n  }\n}',
    boost: 2,
  },
  {
    label: "derived permission",
    type: "keyword",
    detail: "Derived permission",
    apply:
      "derived permission ${name} on ${Entity} {\n  allow principal to <action> when {\n    ${}\n  }\n}",
    boost: 2,
  },
];

// Permission expression snippets
const permissionSnippets: Completion[] = [
  {
    label: "when",
    type: "keyword",
    detail: "Conditional permission",
    apply: "when {\n  ${}\n}",
  },
  {
    label: "match",
    type: "keyword",
    detail: "Pattern matching",
    apply: 'match ${expr} {\n  "${value}" => ${result}\n}',
  },
  {
    label: "from",
    type: "keyword",
    detail: "Inherit from relation",
    apply: "from ${relation}",
  },
];

// Custom schema types (dynamically extracted from current document)
export interface SchemaContext {
  entities: string[];
  relations: { entity: string; relation: string }[];
  permissions: { entity: string; permission: string }[];
}

// Extract schema context from document
function getSchemaContext(doc: string): SchemaContext {
  return {
    entities: extractEntities(doc),
    relations: extractRelations(doc),
    permissions: extractPermissions(doc),
  };
}

// Main completion function
function iplCompletions(context: CompletionContext): CompletionResult | null {
  const { state, pos } = context;
  const doc = state.doc.toString();
  const line = state.doc.lineAt(pos);
  const lineText = line.text;
  const lineBefore = lineText.slice(0, pos - line.from);

  // Get schema context for entity/relation completions
  const schemaCtx = getSchemaContext(doc);

  // Check for decorator completion (@)
  if (lineBefore.match(/@\w*$/)) {
    const match = lineBefore.match(/@(\w*)$/);
    if (match) {
      return {
        from: pos - match[0].length,
        options: decoratorCompletions,
      };
    }
  }

  // Check for type completion after colon
  if (lineBefore.match(/:\s*\w*$/)) {
    const match = lineBefore.match(/:\s*(\w*)$/);
    if (match) {
      const wordStart = pos - match[1].length;

      // Include entity names as relation types
      const entityTypeCompletions: Completion[] = schemaCtx.entities.map(
        (e) => ({
          label: e,
          type: "type",
          detail: "entity",
          boost: 1,
        })
      );

      return {
        from: wordStart,
        options: [...attributeTypeSnippets, ...entityTypeCompletions],
      };
    }
  }

  // Check for relation reference (Entity#)
  const relationRefMatch = lineBefore.match(/(\w+)#(\w*)$/);
  if (relationRefMatch) {
    const entityName = relationRefMatch[1];
    const partialRelation = relationRefMatch[2];
    const from = pos - partialRelation.length;

    // Get relations for this entity
    const entityRelations = schemaCtx.relations
      .filter((r) => r.entity === entityName)
      .map((r) => ({
        label: r.relation,
        type: "property",
        detail: `relation of ${entityName}`,
      }));

    if (entityRelations.length > 0) {
      return { from, options: entityRelations };
    }
  }

  // Check for permission definition (after entity name)
  if (
    lineBefore.match(/\b(delete|edit|view|share|read|write|manage|admin):\s*$/)
  ) {
    // Suggest relation names and special keywords
    const relationSuggestions: Completion[] = schemaCtx.relations.map((r) => ({
      label: r.relation,
      type: "property",
      detail: `relation`,
    }));

    return {
      from: pos,
      options: [
        ...relationSuggestions,
        ...permissionSnippets,
        { label: "principal", type: "keyword", detail: "permission subject" },
      ],
    };
  }

  // Check for "from" keyword context - suggest relations
  if (lineBefore.match(/\bfrom\s+\w*$/)) {
    const match = lineBefore.match(/\bfrom\s+(\w*)$/);
    if (match) {
      const relationSuggestions: Completion[] = schemaCtx.relations.map(
        (r) => ({
          label: r.relation,
          type: "property",
          detail: `relation of ${r.entity}`,
        })
      );
      return {
        from: pos - match[1].length,
        options: relationSuggestions,
      };
    }
  }

  // General word completion
  const wordMatch = lineBefore.match(/\b(\w+)$/);
  if (wordMatch) {
    const word = wordMatch[1];
    const from = pos - word.length;

    // Combine all completions
    const allCompletions: Completion[] = [
      ...blockSnippets,
      ...keywordCompletions,
      ...typeCompletions,
      ...operatorCompletions,
      ...permissionSnippets,
    ];

    // Add entity completions
    schemaCtx.entities.forEach((e) => {
      allCompletions.push({
        label: e,
        type: "type",
        detail: "entity",
      });
    });

    // Filter by prefix
    const filtered = allCompletions.filter((c) =>
      c.label.toLowerCase().startsWith(word.toLowerCase())
    );

    if (filtered.length > 0) {
      return { from, options: filtered };
    }
  }

  // If at start of line or after whitespace, show all options
  if (lineBefore.match(/^\s*$/) || context.explicit) {
    return {
      from: pos,
      options: [...blockSnippets, ...keywordCompletions],
    };
  }

  return null;
}

// Export autocomplete extension
export const iplAutocompletion = autocompletion({
  override: [iplCompletions],
  icons: true,
  closeOnBlur: true,
  defaultKeymap: true,
});
