"use client";

import mammoth from "mammoth";
import type { ParsedDoc, SpecChapter, SpecContent } from "./types";

/**
 * Parse a .docx File into structured chapters.
 * Uses mammoth.js to convert to HTML, then extracts headings and content.
 */
export async function parseDocx(file: File): Promise<ParsedDoc> {
  const arrayBuffer = await file.arrayBuffer();

  const result = await mammoth.convertToHtml(
    { arrayBuffer },
    {
      styleMap: [
        "p[style-name='Heading 1'] => h1:fresh",
        "p[style-name='Heading 2'] => h2:fresh",
        "p[style-name='Heading 3'] => h3:fresh",
        "p[style-name='Heading 4'] => h4:fresh",
        "p[style-name='Title'] => h1.doc-title:fresh",
      ],
    }
  );

  const html = result.value;
  const chapters = extractChapters(html);

  return {
    fileName: file.name,
    chapters,
    rawHtml: html,
    annotations: [],
  };
}

function extractChapters(html: string): SpecChapter[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const chapters: SpecChapter[] = [];
  let currentChapter: SpecChapter | null = null;
  let currentContent: SpecContent[] = [];

  const body = doc.body;
  const elements = Array.from(body.children);

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();

    if (tag === "h1" || tag === "h2") {
      // Save previous chapter
      if (currentChapter) {
        currentChapter.content = currentContent;
        chapters.push(currentChapter);
      }
      currentContent = [];

      const level = parseInt(tag.substring(1));
      currentChapter = {
        id: `ch-${chapters.length}`,
        number: extractChapterNumber(el.textContent || ""),
        title: el.textContent || "",
        level,
        content: [],
        children: [],
      };
    } else if (tag === "h3" || tag === "h4") {
      // Sub-heading: add as content
      if (currentContent.length > 0 || currentChapter) {
        currentContent.push({
          type: "paragraph",
          text: el.textContent || "",
          html: el.outerHTML,
        });
      }
    } else if (tag === "p") {
      const text = el.textContent?.trim();
      if (text) {
        currentContent.push({
          type: "paragraph",
          text,
          html: el.outerHTML,
        });
      }
    } else if (tag === "table") {
      const tableData = parseTable(el as HTMLTableElement);
      currentContent.push({
        type: "table",
        table: tableData,
        html: el.outerHTML,
      });
    } else if (tag === "ul" || tag === "ol") {
      currentContent.push({
        type: "list",
        text: el.textContent || "",
        html: el.outerHTML,
      });
    }
  }

  // Don't forget the last chapter
  if (currentChapter) {
    currentChapter.content = currentContent;
    chapters.push(currentChapter);
  }

  // If no headings found, create a single chapter with all content
  if (chapters.length === 0 && elements.length > 0) {
    chapters.push({
      id: "ch-0",
      number: "",
      title: "未分類內容",
      level: 1,
      content: elements.map((el) => ({
        type: el.tagName.toLowerCase() === "table" ? "table" as const : "paragraph" as const,
        text: el.textContent || undefined,
        html: el.outerHTML,
        table: el.tagName.toLowerCase() === "table" ? parseTable(el as HTMLTableElement) : undefined,
      })),
      children: [],
    });
  }

  return chapters;
}

function extractChapterNumber(text: string): string {
  const match = text.match(/^(\d+|[零一二三四五六七八九十壹貳參肆伍陸柒捌玖拾]+)/);
  return match ? match[1] : "";
}

function parseTable(table: HTMLTableElement): string[][] {
  const rows: string[][] = [];
  for (let i = 0; i < table.rows.length; i++) {
    const row = table.rows[i];
    const cells: string[] = [];
    for (let j = 0; j < row.cells.length; j++) {
      cells.push(row.cells[j].textContent?.trim() || "");
    }
    rows.push(cells);
  }
  return rows;
}