import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@costmate/ui";
import { formatShortcut, type Shortcut } from "../hooks/useKeyboardShortcuts";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: Shortcut[];
  isMac: boolean;
}

export default function KeyboardShortcutsModal({
  open,
  onOpenChange,
  shortcuts,
  isMac,
}: KeyboardShortcutsModalProps) {
  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      if (!acc[shortcut.category]) {
        acc[shortcut.category] = [];
      }
      acc[shortcut.category].push(shortcut);
      return acc;
    },
    {} as Record<string, Shortcut[]>
  );

  const categoryLabels: Record<string, string> = {
    navigation: "Navigation",
    actions: "Actions",
    window: "Window",
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Keyboard Shortcuts</AlertDialogTitle>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {categoryLabels[category] || category}
              </h3>
              <div className="space-y-1">
                {categoryShortcuts.map((shortcut) => (
                  <div
                    key={shortcut.key + shortcut.description}
                    className="flex items-center justify-between py-1.5"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs bg-muted rounded border font-mono">
                      {formatShortcut(shortcut.key, {
                        ctrl: shortcut.ctrlKey || shortcut.metaKey,
                        shift: shortcut.shiftKey,
                      })}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <span className="text-xs text-muted-foreground">
            {isMac ? "⌘" : "Ctrl"} = {isMac ? "Command" : "Control"} key
          </span>
          <AlertDialogCancel>Close</AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
