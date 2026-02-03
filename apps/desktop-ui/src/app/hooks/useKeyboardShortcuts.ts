import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  description: string;
  category: "navigation" | "actions" | "window";
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  onOpenShortcutsModal?: () => void;
  onFocusSearch?: () => void;
  onNew?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
}

// Helper to detect platform
const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

// Format shortcut for display
export function formatShortcut(key: string, modifiers?: { ctrl?: boolean; shift?: boolean }): string {
  const parts: string[] = [];

  if (modifiers?.ctrl) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (modifiers?.shift) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  // Format special keys
  const keyDisplay = key === "Escape" ? "Esc" : key.toUpperCase();
  parts.push(keyDisplay);

  return parts.join(isMac ? "" : "+");
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    onOpenShortcutsModal,
    onFocusSearch,
    onNew,
    onSave,
    onEscape,
  } = options;

  const isSubPage = location.pathname.startsWith("/recipe/");
  const isIngredientsPage = location.pathname === "/ingredients";

  const shortcuts: Shortcut[] = [
    // Navigation
    {
      key: "1",
      ctrlKey: true,
      metaKey: true,
      description: "Go to Recipes",
      category: "navigation",
      action: () => navigate("/"),
    },
    {
      key: "2",
      ctrlKey: true,
      metaKey: true,
      description: "Go to Ingredients",
      category: "navigation",
      action: () => navigate("/ingredients"),
    },
    {
      key: "n",
      ctrlKey: true,
      metaKey: true,
      description: "New Recipe / Ingredient",
      category: "actions",
      action: () => {
        if (onNew) {
          onNew();
        } else if (!isIngredientsPage) {
          navigate("/recipe/new");
        }
      },
    },
    {
      key: "Escape",
      description: "Go back / Close panel",
      category: "navigation",
      action: () => {
        if (onEscape) {
          onEscape();
        } else if (isSubPage) {
          navigate("/");
        }
      },
    },
    // Actions
    {
      key: "k",
      ctrlKey: true,
      metaKey: true,
      description: "Focus search",
      category: "actions",
      action: () => onFocusSearch?.(),
    },
    {
      key: "s",
      ctrlKey: true,
      metaKey: true,
      description: "Save",
      category: "actions",
      action: () => onSave?.(),
    },
    // Help
    {
      key: "/",
      ctrlKey: true,
      metaKey: true,
      description: "Show keyboard shortcuts",
      category: "actions",
      action: () => onOpenShortcutsModal?.(),
    },
  ];

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      // Allow Escape and Ctrl+S even in input fields
      const allowInInput = event.key === "Escape" || (event.key === "s" && (event.ctrlKey || event.metaKey));

      if (isInputField && !allowInInput) {
        return;
      }

      for (const shortcut of shortcuts) {
        const modifierMatch =
          shortcut.ctrlKey || shortcut.metaKey
            ? event.ctrlKey || event.metaKey
            : !event.ctrlKey && !event.metaKey;

        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (
          event.key.toLowerCase() === shortcut.key.toLowerCase() &&
          modifierMatch &&
          shiftMatch
        ) {
          event.preventDefault();
          shortcut.action();
          return;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return { shortcuts, isMac };
}
