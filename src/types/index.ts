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

export interface SentenceContribution {
  /** Short label for what triggered this */
  reason: string;
  /** Which signal id it maps to */
  signalId: string;
}

export interface SentenceAnalysis {
  /** The original sentence text */
  text: string;
  /** 0–1 score of how much this sentence contributes to AI-likelihood */
  score: number;
  /** low / medium / high signal level for this sentence */
  level: SignalLevel;
  /** Zero-based index in the original sentence list */
  index: number;
  /** Specific reasons this sentence contributed to the result */
  contributions: SentenceContribution[];
}

export interface AnalysisResult {
  aiLikelihood: number;
  confidence: ConfidenceLevel;
  statistics: ContentStatistics;
  signals: Signal[];
  explanation: string;
  limitations: string;
  /** Per-sentence breakdown (Phase 7) */
  sentenceAnalyses: SentenceAnalysis[];
}

export interface WebsiteContent {
  url: string;
  title: string;
  description: string;
  content: string;
  wordCount: number;
}
