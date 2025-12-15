import { PromptData } from '../types';

const STORAGE_KEY = 'nanobanana_prompts_v1';

export const getPrompts = (): PromptData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load prompts", e);
    return [];
  }
};

export const savePrompt = (prompt: PromptData): PromptData[] => {
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

export const deletePrompt = (id: string): PromptData[] => {
  const current = getPrompts();
  const updated = current.filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
