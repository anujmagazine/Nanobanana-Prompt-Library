import { PromptData } from '../types';

const STORAGE_KEY = 'nanobanana_prompts_v1';
const BACKUP_KEY = 'nanobanana_prompts_backup';

export const getPrompts = (): PromptData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load prompts", e);
    // Try to return backup if main fails? 
    // For now, return empty to avoid cascading errors, but log clearly.
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

export const importData = (jsonString: string): PromptData[] => {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("Invalid format: not an array");
    
    // Basic validation
    const valid = parsed.filter(p => p.id && p.content);
    if (valid.length === 0 && parsed.length > 0) throw new Error("No valid prompts found");

    createBackup(); // Backup existing before import
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return valid;
  } catch (e) {
    console.error("Import failed", e);
    throw e;
  }
};
