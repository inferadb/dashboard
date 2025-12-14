import { Diagnostic, linter } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import {
  extractEntities,
  extractRelations,
  extractPermissions,
} from "./ipl-language";

// IPL validation rules
interface ValidationError {
  line: number;
  from: number;
  to: number;
  message: string;
  severity: "error" | "warning" | "info";
}

// Validate IPL document
function validateIPL(doc: string): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = doc.split("\n");

  // Track defined entities and relations
  const definedEntities = new Set(extractEntities(doc));
  const definedRelations = extractRelations(doc);
  // Extract permissions for future permission expression validation
  extractPermissions(doc);

  // Track current context
  let currentEntity: string | null = null;
  let inBlock: string | null = null;
  let braceDepth = 0;
  let charOffset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const lineStart = charOffset;
    const lineEnd = charOffset + line.length;

    // Skip comments and empty lines
    if (trimmed.startsWith("#") || trimmed.startsWith("//") || !trimmed) {
      charOffset += line.length + 1;
      continue;
    }

    // Track brace depth
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceDepth += openBraces - closeBraces;

    // Check for entity declaration
    const entityMatch = trimmed.match(/^entity\s+(\w+)/);
    if (entityMatch) {
      currentEntity = entityMatch[1];

      // Check entity naming convention (PascalCase)
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(entityMatch[1])) {
        const start = line.indexOf(entityMatch[1]);
        errors.push({
          line: i,
          from: lineStart + start,
          to: lineStart + start + entityMatch[1].length,
          message: "Entity names should be in PascalCase (e.g., UserGroup)",
          severity: "warning",
        });
      }
    }

    // Check for block start
    const blockMatch = trimmed.match(
      /^(attributes|relations|permissions|methods)\s*{/
    );
    if (blockMatch) {
      inBlock = blockMatch[1];
    }

    // Check for block end
    if (trimmed === "}" && inBlock) {
      inBlock = null;
    }

    // Validate attribute definitions
    if (inBlock === "attributes") {
      const attrMatch = trimmed.match(/^(\w+):\s*(\w+)/);
      if (attrMatch) {
        const [, attrName, attrType] = attrMatch;

        // Check attribute naming convention (snake_case)
        if (!/^[a-z][a-z0-9_]*$/.test(attrName)) {
          const start = line.indexOf(attrName);
          errors.push({
            line: i,
            from: lineStart + start,
            to: lineStart + start + attrName.length,
            message:
              "Attribute names should be in snake_case (e.g., user_email)",
            severity: "warning",
          });
        }

        // Check for valid built-in types
        const validTypes = [
          "UUID",
          "String",
          "Boolean",
          "Timestamp",
          "Set",
          "Enum",
        ];
        const baseType = attrType.replace(/<.*$/, "");
        if (!validTypes.includes(baseType) && !definedEntities.has(baseType)) {
          const typeStart = line.indexOf(attrType);
          if (typeStart >= 0) {
            errors.push({
              line: i,
              from: lineStart + typeStart,
              to: lineStart + typeStart + attrType.length,
              message: `Unknown type "${attrType}". Valid types: ${validTypes.join(", ")}`,
              severity: "error",
            });
          }
        }
      }
    }

    // Validate relation definitions
    if (inBlock === "relations") {
      const relationMatch = trimmed.match(/^(\w+):\s*(.+)/);
      if (relationMatch) {
        const [, relationName, relationTargets] = relationMatch;

        // Check relation naming convention (snake_case)
        if (!/^[a-z][a-z0-9_]*$/.test(relationName)) {
          const start = line.indexOf(relationName);
          errors.push({
            line: i,
            from: lineStart + start,
            to: lineStart + start + relationName.length,
            message:
              "Relation names should be in snake_case (e.g., parent_folder)",
            severity: "warning",
          });
        }

        // Check that relation targets reference valid entities
        const targets = relationTargets.split("|").map((t) => t.trim());
        for (const target of targets) {
          // Extract base entity from "Entity#relation" format
          const entityRef = target.split("#")[0].trim();
          if (entityRef && !definedEntities.has(entityRef)) {
            // Check if it's a self-reference like "viewer"
            const relMatch = target.match(/^(\w+)$/);
            if (relMatch) {
              // It's a relation reference, not an entity - skip
              const isRelation = definedRelations.some(
                (r) => r.relation === relMatch[1]
              );
              if (!isRelation && !["self", "principal"].includes(relMatch[1])) {
                // Might be undefined relation in current entity
                const localRelation = definedRelations.find(
                  (r) => r.entity === currentEntity && r.relation === relMatch[1]
                );
                if (!localRelation) {
                  const targetStart = line.indexOf(target);
                  if (targetStart >= 0) {
                    errors.push({
                      line: i,
                      from: lineStart + targetStart,
                      to: lineStart + targetStart + target.length,
                      message: `Unknown entity or relation "${target}"`,
                      severity: "info",
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Validate permission definitions
    if (inBlock === "permissions") {
      const permMatch = trimmed.match(/^(\w+):\s*(.+)/);
      if (permMatch) {
        const [, permName] = permMatch;

        // Check permission naming convention (snake_case)
        if (!/^[a-z][a-z0-9_]*$/.test(permName)) {
          const start = line.indexOf(permName);
          errors.push({
            line: i,
            from: lineStart + start,
            to: lineStart + start + permName.length,
            message:
              "Permission names should be in snake_case (e.g., can_edit)",
            severity: "warning",
          });
        }
      }
    }

    // Check for schema declaration
    if (trimmed.startsWith("schema ")) {
      const schemaMatch = trimmed.match(/^schema\s+(\w+)\s+(v[\d.]+)/);
      if (!schemaMatch) {
        errors.push({
          line: i,
          from: lineStart,
          to: lineEnd,
          message: 'Schema declaration should be: schema <name> v<version>',
          severity: "error",
        });
      }
    }

    // Check for unclosed braces at end of file
    if (i === lines.length - 1 && braceDepth !== 0) {
      errors.push({
        line: i,
        from: lineEnd,
        to: lineEnd,
        message: `Unclosed brace${braceDepth > 1 ? "s" : ""} (${Math.abs(braceDepth)} ${braceDepth > 0 ? "open" : "extra closing"})`,
        severity: "error",
      });
    }

    // Check for common syntax errors
    if (trimmed.includes(";;")) {
      const doubleStart = line.indexOf(";;");
      errors.push({
        line: i,
        from: lineStart + doubleStart,
        to: lineStart + doubleStart + 2,
        message: "Unexpected double semicolon",
        severity: "error",
      });
    }

    // Check for tabs (prefer spaces)
    if (line.includes("\t")) {
      errors.push({
        line: i,
        from: lineStart,
        to: lineStart + 1,
        message: "Use spaces instead of tabs for indentation",
        severity: "info",
      });
    }

    charOffset += line.length + 1;
  }

  return errors;
}

// CodeMirror linter extension
export const iplLinter = linter(
  (view: EditorView): Diagnostic[] => {
    const doc = view.state.doc.toString();
    const errors = validateIPL(doc);

    return errors.map((error) => ({
      from: error.from,
      to: error.to,
      severity: error.severity,
      message: error.message,
      source: "IPL",
    }));
  },
  {
    delay: 500, // Debounce validation by 500ms
  }
);

// Export validation function for external use (e.g., before save)
export function validateIPLDocument(doc: string): {
  valid: boolean;
  errors: ValidationError[];
} {
  const errors = validateIPL(doc);
  const hasErrors = errors.some((e) => e.severity === "error");
  return { valid: !hasErrors, errors };
}
