export interface RedFlag {
  risk: string;
  severity: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  summary: string;
  redFlags: RedFlag[];
  actionItems: string[];
  reasoning: string;
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}