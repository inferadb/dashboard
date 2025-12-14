import { useEffect, useRef, useCallback, useState } from "react";
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection, dropCursor } from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";
import { defaultKeymap, history, historyKeymap, indentWithTab } from "@codemirror/commands";
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from "@codemirror/language";
import { searchKeymap, highlightSelectionMatches } from "@codemirror/search";
import { lintGutter } from "@codemirror/lint";
import { closeBrackets, closeBracketsKeymap } from "@codemirror/autocomplete";
import { ipl } from "./ipl-language";
import { iplTheme } from "./ipl-theme";
import { iplAutocompletion } from "./ipl-autocomplete";
import { iplLinter, validateIPLDocument } from "./ipl-linter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Copy, Download, Loader2, Save, Upload } from "lucide-react";

export interface PolicyEditorProps {
  value: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => Promise<void>;
  readOnly?: boolean;
  className?: string;
  minHeight?: string;
  showToolbar?: boolean;
  showLineNumbers?: boolean;
  showValidation?: boolean;
}

export function PolicyEditor({
  value,
  onChange,
  onSave,
  readOnly = false,
  className,
  minHeight = "400px",
  showToolbar = true,
  showLineNumbers = true,
  showValidation = true,
}: PolicyEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationStatus, setValidationStatus] = useState<{
    valid: boolean;
    errorCount: number;
    warningCount: number;
  }>({ valid: true, errorCount: 0, warningCount: 0 });

  // Build extensions
  const getExtensions = useCallback((): Extension[] => {
    const extensions: Extension[] = [
      // Core
      history(),
      drawSelection(),
      dropCursor(),
      EditorState.allowMultipleSelections.of(true),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      highlightActiveLineGutter(),
      highlightSelectionMatches(),

      // IPL specific
      ipl(),
      iplTheme,
      iplAutocompletion,

      // Keymaps
      keymap.of([
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        indentWithTab,
      ]),

      // Features
      foldGutter(),
    ];

    if (showLineNumbers) {
      extensions.push(lineNumbers());
    }

    if (showValidation) {
      extensions.push(iplLinter);
      extensions.push(lintGutter());
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    // Update listener
    extensions.push(
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newValue = update.state.doc.toString();
          onChange?.(newValue);

          // Update validation status
          if (showValidation) {
            const result = validateIPLDocument(newValue);
            setValidationStatus({
              valid: result.valid,
              errorCount: result.errors.filter((e) => e.severity === "error").length,
              warningCount: result.errors.filter((e) => e.severity === "warning").length,
            });
          }
        }
      })
    );

    return extensions;
  }, [onChange, readOnly, showLineNumbers, showValidation]);

  // Initialize editor
  useEffect(() => {
    if (!editorRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: getExtensions(),
      }),
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Initial validation
    if (showValidation) {
      const result = validateIPLDocument(value);
      setValidationStatus({
        valid: result.valid,
        errorCount: result.errors.filter((e) => e.severity === "error").length,
        warningCount: result.errors.filter((e) => e.severity === "warning").length,
      });
    }

    return () => {
      view.destroy();
    };
  }, []);

  // Update editor when value changes externally
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (currentValue !== value) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
      }
    }
  }, [value]);

  // Handle save
  const handleSave = async () => {
    if (!onSave || isSaving) return;

    const currentValue = viewRef.current?.state.doc.toString() || value;
    const validation = validateIPLDocument(currentValue);

    if (!validation.valid) {
      // Don't save if there are errors
      return;
    }

    setIsSaving(true);
    try {
      await onSave(currentValue);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle copy to clipboard
  const handleCopy = async () => {
    const currentValue = viewRef.current?.state.doc.toString() || value;
    await navigator.clipboard.writeText(currentValue);
  };

  // Handle download
  const handleDownload = () => {
    const currentValue = viewRef.current?.state.doc.toString() || value;
    const blob = new Blob([currentValue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policy.ipl";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle file upload
  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ipl,.txt";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const text = await file.text();
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: text,
          },
        });
      }
      onChange?.(text);
    };
    input.click();
  };

  return (
    <div className={cn("flex flex-col rounded-md border bg-card", className)}>
      {showToolbar && (
        <div className="flex items-center justify-between border-b px-3 py-2">
          <div className="flex items-center gap-2">
            {showValidation && (
              <>
                {validationStatus.valid ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Valid
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationStatus.errorCount} error{validationStatus.errorCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                {validationStatus.warningCount > 0 && (
                  <Badge variant="warning" className="gap-1">
                    {validationStatus.warningCount} warning{validationStatus.warningCount !== 1 ? "s" : ""}
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              title="Download as .ipl file"
            >
              <Download className="h-4 w-4" />
            </Button>
            {!readOnly && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUpload}
                  title="Upload .ipl file"
                >
                  <Upload className="h-4 w-4" />
                </Button>
                {onSave && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving || !validationStatus.valid}
                    title={!validationStatus.valid ? "Fix errors before saving" : "Save policy"}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-1 h-4 w-4" />
                    )}
                    Save
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <div
        ref={editorRef}
        className="flex-1 overflow-auto"
        style={{ minHeight }}
      />
    </div>
  );
}

export default PolicyEditor;
