"use client";

import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import type { ParsedDoc, Annotation, SpecChapter, SpecContent, ReviewResult, ContentFinding } from "./types";

/**
 * Generate a .docx file from parsed doc + annotations.
 * Annotations are appended as a "審查意見" section at the end.
 */
export async function downloadDocx(doc: ParsedDoc, review?: ReviewResult | null): Promise<void> {
  const sections = buildSections(doc);
  const annotationSection = buildAnnotationSection(doc.annotations, review?.contentFindings ?? []);

  const docx = new Document({
    sections: [...sections, annotationSection],
  });

  const blob = await Packer.toBlob(docx);
  const fileName = doc.fileName.replace(/\.docx?$/, "") + "_review.docx";
  saveAs(blob, fileName);
}

function buildSections(doc: ParsedDoc) {
  const children: (Paragraph | Table)[] = [];

  // Cover page
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2400, after: 400 },
      children: [
        new TextRun({ text: doc.fileName.replace(/\.docx?$/, ""), bold: true, size: 44 }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "規格書檢視報告", size: 28 })],
    })
  );
  children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));

  // Chapters
  for (const chapter of doc.chapters) {
    children.push(
      new Paragraph({
        heading: chapter.level <= 2 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
        children: [new TextRun({ text: chapter.title })],
      })
    );

    for (const content of chapter.content) {
      const element = buildContentElement(content);
      if (element) children.push(element);
    }
  }

  return [{ children }];
}

function buildContentElement(content: SpecContent): Paragraph | Table | null {
  if (content.type === "paragraph" || content.type === "list") {
    return new Paragraph({
      children: [new TextRun({ text: content.text || "" })],
    });
  }

  if (content.type === "table" && content.table) {
    const rows = content.table.map(
      (rowData, rowIdx) =>
        new TableRow({
          children: rowData.map(
            (cellText) =>
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: cellText, bold: rowIdx === 0 })] })],
                width: { size: Math.floor(100 / rowData.length), type: WidthType.PERCENTAGE },
              })
          ),
        })
    );
    return new Table({ rows });
  }

  return null;
}

function buildContentFindingsTable(findings: ContentFinding[]) {
  return new Table({
    rows: [
      new TableRow({
        tableHeader: true,
        children: ["#", "章節", "動作", "問題點", "為什麼", "建議改法", "原文摘錄"].map(
          (header) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
            })
        ),
      }),
      ...findings.map((finding, idx) =>
        new TableRow({
          children: [
            String(idx + 1),
            finding.chapterTitle,
            finding.label,
            finding.issue,
            finding.why,
            finding.recommendation,
            finding.evidence,
          ].map((text) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text })] })],
            })
          ),
        })
      ),
    ],
  });
}

function buildAnnotationSection(annotations: Annotation[], contentFindings: ContentFinding[]) {
  const children: (Paragraph | Table)[] = [];

  if (contentFindings.length > 0) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: "逐段審查標註", bold: true })],
      })
    );
    children.push(buildContentFindingsTable(contentFindings));
  }

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "審查意見", bold: true })],
    })
  );

  if (annotations.length === 0 && contentFindings.length === 0) {
    children.push(new Paragraph({ children: [new TextRun({ text: "無審查意見。" })] }));
  } else if (annotations.length > 0) {
    const rows = annotations.map(
      (ann, idx) =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(idx + 1) })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: ann.selectedText })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: ann.comment })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: ann.author })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: ann.resolved ? "已解決" : "待處理" })] })],
            }),
          ],
        })
    );

    children.push(
      new Table({
        rows: [
          new TableRow({
            tableHeader: true,
            children: ["#", "原文片段", "意見", "批注者", "狀態"].map(
              (header) =>
                new TableCell({
                  children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
                })
            ),
          }),
          ...rows,
        ],
      })
    );
  }

  return { children };
}
