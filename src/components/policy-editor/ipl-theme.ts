import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// IPL syntax highlighting theme
const iplHighlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "#c678dd", fontWeight: "bold" },
  { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
  { tag: tags.string, color: "#98c379" },
  { tag: tags.number, color: "#d19a66" },
  { tag: tags.typeName, color: "#e5c07b" },
  { tag: tags.propertyName, color: "#61afef" },
  { tag: tags.variableName, color: "#abb2bf" },
  { tag: tags.operator, color: "#56b6c2" },
  { tag: tags.punctuation, color: "#abb2bf" },
  { tag: tags.meta, color: "#e06c75" },
]);

// Editor theme (dark theme matching dashboard)
const iplEditorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
      fontSize: "14px",
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    ".cm-content": {
      caretColor: "var(--primary)",
      padding: "16px 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--primary)",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "var(--primary)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "hsl(var(--primary) / 0.2)",
      },
    ".cm-panels": {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid var(--border)",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid var(--border)",
    },
    ".cm-searchMatch": {
      backgroundColor: "hsl(var(--warning) / 0.3)",
      outline: "1px solid hsl(var(--warning) / 0.5)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "hsl(var(--primary) / 0.3)",
    },
    ".cm-activeLine": {
      backgroundColor: "hsl(var(--muted) / 0.5)",
    },
    ".cm-selectionMatch": {
      backgroundColor: "hsl(var(--primary) / 0.15)",
    },
    "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket": {
      backgroundColor: "hsl(var(--primary) / 0.2)",
      outline: "1px solid hsl(var(--primary) / 0.5)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--card)",
      color: "var(--muted-foreground)",
      border: "none",
      borderRight: "1px solid var(--border)",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "hsl(var(--muted) / 0.5)",
    },
    ".cm-foldPlaceholder": {
      backgroundColor: "var(--muted)",
      border: "none",
      color: "var(--muted-foreground)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--popover)",
      color: "var(--popover-foreground)",
      border: "1px solid var(--border)",
      borderRadius: "var(--radius)",
      boxShadow:
        "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    },
    ".cm-tooltip .cm-tooltip-arrow:before": {
      borderTopColor: "var(--border)",
      borderBottomColor: "var(--border)",
    },
    ".cm-tooltip .cm-tooltip-arrow:after": {
      borderTopColor: "var(--popover)",
      borderBottomColor: "var(--popover)",
    },
    ".cm-tooltip-autocomplete": {
      "& > ul > li[aria-selected]": {
        backgroundColor: "hsl(var(--primary) / 0.1)",
        color: "var(--primary)",
      },
    },
    ".cm-completionIcon": {
      opacity: 0.8,
      marginRight: "4px",
    },
    ".cm-completionLabel": {
      color: "var(--foreground)",
    },
    ".cm-completionDetail": {
      color: "var(--muted-foreground)",
      marginLeft: "8px",
      fontStyle: "italic",
    },
    ".cm-lintRange-error": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23ef4444' fill='none' stroke-width='1.1'/%3E%3C/svg%3E")`,
    },
    ".cm-lintRange-warning": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%23f59e0b' fill='none' stroke-width='1.1'/%3E%3C/svg%3E")`,
    },
    ".cm-lintRange-info": {
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='3'%3E%3Cpath d='m0 3 l2 -2 l1 0 l2 2 l1 0' stroke='%233b82f6' fill='none' stroke-width='1.1'/%3E%3C/svg%3E")`,
    },
    ".cm-diagnostic": {
      padding: "4px 8px",
      marginLeft: "4px",
    },
    ".cm-diagnostic-error": {
      borderLeft: "3px solid #ef4444",
    },
    ".cm-diagnostic-warning": {
      borderLeft: "3px solid #f59e0b",
    },
    ".cm-diagnostic-info": {
      borderLeft: "3px solid #3b82f6",
    },
  },
  { dark: true }
);

// Light theme variant
const iplEditorThemeLight = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
      fontSize: "14px",
      fontFamily:
        'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
    },
    ".cm-content": {
      caretColor: "var(--primary)",
      padding: "16px 0",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--primary)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "hsl(var(--primary) / 0.15)",
      },
    ".cm-activeLine": {
      backgroundColor: "hsl(var(--muted) / 0.3)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--card)",
      color: "var(--muted-foreground)",
      border: "none",
      borderRight: "1px solid var(--border)",
    },
  },
  { dark: false }
);

// Light syntax highlighting
const iplHighlightStyleLight = HighlightStyle.define([
  { tag: tags.keyword, color: "#a626a4", fontWeight: "bold" },
  { tag: tags.comment, color: "#a0a1a7", fontStyle: "italic" },
  { tag: tags.string, color: "#50a14f" },
  { tag: tags.number, color: "#986801" },
  { tag: tags.typeName, color: "#c18401" },
  { tag: tags.propertyName, color: "#4078f2" },
  { tag: tags.variableName, color: "#383a42" },
  { tag: tags.operator, color: "#0184bc" },
  { tag: tags.punctuation, color: "#383a42" },
  { tag: tags.meta, color: "#e45649" },
]);

export const iplDarkTheme = [
  iplEditorTheme,
  syntaxHighlighting(iplHighlightStyle),
];

export const iplLightTheme = [
  iplEditorThemeLight,
  syntaxHighlighting(iplHighlightStyleLight),
];

// Default theme (auto-detects based on CSS variables)
export const iplTheme = iplDarkTheme;
