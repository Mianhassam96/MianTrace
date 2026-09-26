// MianTrace — shared TypeScript types
// These will be expanded in Phase 3–5

export type ConfidenceLevel = 'low' | 'moderate' | 'high';
export type SignalLevel = 'low' | 'medium' | 'high';
export type AnalyzerTab = 'text' | 'website';

export interface ContentStatistics {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  avgSentenceLength: number;
  minSentenceLength: number;
  maxSentenceLength: number;
  vocabularyDiversity: number;
}

export interface Signal {
  id: string;
  name: string;
  level: SignalLevel;
  score: number;
  description: string;
  suggestion?: string;
}

export interface AnalysisResult {
  aiLikelihood: number;
  confidence: ConfidenceLevel;
  statistics: ContentStatistics;
  signals: Signal[];
  explanation: string;
  limitations: string;
}

export interface WebsiteContent {
  url: string;
  title: string;
  description: string;
  content: string;
  wordCount: number;
}
