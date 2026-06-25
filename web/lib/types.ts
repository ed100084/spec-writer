// Core types for the spec viewer/editor

export interface SpecChapter {
  id: string;
  number: string;
  title: string;
  level: number; // heading level 1-3
  content: SpecContent[];
  children: SpecChapter[];
}

export interface SpecContent {
  type: "paragraph" | "table" | "list";
  text?: string;
  html?: string;
  table?: string[][]; // rows of cells
}

export interface Annotation {
  id: string;
  chapterId: string;
  contentIndex: number; // index into chapter.content
  selectedText: string;
  comment: string;
  author: string;
  createdAt: string;
  resolved: boolean;
}

export interface ParsedDoc {
  fileName: string;
  chapters: SpecChapter[];
  rawHtml: string;
  annotations: Annotation[];
}

export interface SpecSchemaChapter {
  id: string;
  number: string;
  title: string;
  required: boolean;
  fields?: SpecSchemaField[];
  tables?: SpecSchemaTable[];
  sections?: SpecSchemaSection[];
}

export interface SpecSchemaField {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "select";
  required?: boolean;
  options?: string[];
  default?: string;
  placeholder?: string;
}

export interface SpecSchemaTable {
  id: string;
  title?: string;
  columns: string[];
  min_rows?: number;
  hint?: string;
  note?: string;
  fixed_rows?: string[][];
  default_rows?: string[][];
}

export interface SpecSchemaSection {
  id: string;
  title: string;
  note?: string;
  fields?: SpecSchemaField[];
  tables?: SpecSchemaTable[];
  subsections?: SpecSchemaSection[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  blocking: boolean;
  passed: boolean;
  note?: string;
  issue?: string;
  why?: string;
  recommendation?: string;
  necessity?: "required" | "recommended" | "optional";
}

export interface ChecklistCategory {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface ReviewResult {
  chapters: {
    id: string;
    title: string;
    found: boolean;
    required: boolean;
    issue?: string;
    why?: string;
    recommendation?: string;
    structure?: string[];
    necessity?: "required" | "recommended" | "optional";
  }[];
  checklist: ChecklistCategory[];
  ambiguousTerms: { term: string; context: string }[];
  score: { total: number; passed: number; percentage: number };
  verdict: "pass" | "conditional" | "fail";
}
