import { PromptData } from '../types';

const STORAGE_KEY = 'nanobanana_prompts_v1';
const BACKUP_KEY = 'nanobanana_prompts_backup';

export const getPrompts = (): PromptData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load prompts", e);
    return [];
  }
};

const createBackup = () => {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current) {
      localStorage.setItem(BACKUP_KEY, current);
    }
  } catch (e) {
    console.error("Backup creation failed", e);
  }
};

export const savePrompt = (prompt: PromptData): PromptData[] => {
  createBackup(); // Backup before modify
  
  const current = getPrompts();
  const existingIndex = current.findIndex(p => p.id === prompt.id);
  
  let updated: PromptData[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = prompt;
  } else {
    updated = [prompt, ...current];
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

export const savePrompts = (prompts: PromptData[]): void => {
  createBackup(); // Backup before bulk overwrite
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
};

export const deletePrompt = (id: string): PromptData[] => {
  createBackup(); // Backup before delete
  const current = getPrompts();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};

// Data Management Features

export const hasBackup = (): boolean => {
  return !!localStorage.getItem(BACKUP_KEY);
};

export const restoreFromBackup = (): PromptData[] => {
  const backup = localStorage.getItem(BACKUP_KEY);
  if (backup) {
    localStorage.setItem(STORAGE_KEY, backup);
    return JSON.parse(backup);
  }
  return [];
};

export const exportData = (): string => {
  const data = getPrompts();
  return JSON.stringify(data, null, 2);
};

export const exportAsCsv = (): string => {
  const prompts = getPrompts();
  const headers = ["Title", "Prompt Content", "Breakdown", "Tags", "Use Cases", "Source Link", "Created Date"];
  
  // Helper to escape CSV fields (handling quotes and newlines)
  const escape = (text: string | undefined | null) => {
    if (!text) return '""';
    const str = String(text);
    // Double quotes are used to escape quotes in CSV
    return `"${str.replace(/"/g, '""')}"`;
  };

  const rows = prompts.map(p => {
    return [
      escape(p.title),
      escape(p.content),
      escape(p.breakdown),
      escape(p.tags.join(', ')),
      escape(p.useCases?.join('\n') || ''), // Use newlines within the cell for use cases
      escape(p.sourceLink),
      escape(new Date(p.createdAt).toLocaleDateString())
    ].join(',');
  });

  // Add BOM (\ufeff) so Excel correctly recognizes UTF-8 characters (emojis, etc)
  return '\ufeff' + [headers.join(','), ...rows].join('\n');
};

export const importData = (jsonString: string): { prompts: PromptData[], stats: { added: number, updated: number } } => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("Invalid format: not an array");
    
    // Basic validation
    const validRaw = parsed.filter(p => p.id && p.content);
    if (validRaw.length === 0 && parsed.length > 0) throw new Error("No valid prompts found in file");

    createBackup(); // Backup existing before merge

    const currentPrompts = getPrompts();
    const promptMap = new Map(currentPrompts.map(p => [p.id, p]));
    
    let added = 0;
    let updated = 0;

    validRaw.forEach((p: any) => {
        // Ensure the imported object matches our PromptData structure basics
        const safePrompt: PromptData = {
            id: p.id,
            title: p.title || 'Untitled Prompt',
            content: p.content,
            breakdown: p.breakdown || '',
            tags: Array.isArray(p.tags) ? p.tags : [],
            useCases: Array.isArray(p.useCases) ? p.useCases : [],
            sourceLink: p.sourceLink,
            createdAt: p.createdAt || Date.now(),
            updatedAt: p.updatedAt || Date.now()
        };

        if (promptMap.has(safePrompt.id)) {
            updated++;
            // We overwrite with the imported version as "Import" usually implies "Restore/Update"
            promptMap.set(safePrompt.id, safePrompt);
        } else {
            added++;
            promptMap.set(safePrompt.id, safePrompt);
        }
    });

    const merged = Array.from(promptMap.values());
    // Sort by updated time descending
    merged.sort((a, b) => b.updatedAt - a.updatedAt);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    
    return { prompts: merged, stats: { added, updated } };
  } catch (e) {
    console.error("Import failed", e);
    throw e;
  }
};