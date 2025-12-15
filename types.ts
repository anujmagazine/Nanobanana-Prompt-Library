export interface PromptData {
  id: string;
  title: string;
  content: string;
  breakdown: string;
  tags: string[];
  sourceLink?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AnalysisResult {
  title: string;
  breakdown: string;
  tags: string[];
}