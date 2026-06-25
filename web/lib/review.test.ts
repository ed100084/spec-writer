import { describe, expect, it } from "vitest";
import { reviewDoc } from "./review";
import type { ParsedDoc, SpecContent } from "./types";

function makeDoc(fileName: string, content: string, extraContent: SpecContent[] = []): ParsedDoc {
  return {
    fileName,
    rawHtml: "",
    annotations: [],
    chapters: [
      {
        id: "ch-0",
        number: "1",
        title: "測試文件",
        level: 1,
        children: [],
        content: [
          { type: "paragraph", text: content },
          { type: "table", table: [["項目", "內容"], ["Response Time", "<= 2 秒"]] },
          ...extraContent,
        ],
      },
    ],
  };
}

function findItem(result: ReturnType<typeof reviewDoc>, id: string) {
  const item = result.checklist.flatMap((category) => category.items).find((entry) => entry.id === id);
  if (!item) {
    throw new Error(`Missing checklist item: ${id}`);
  }
  return item;
}

const BASE_SPEC_TEXT = [
  "文件控管 案號 EDAH-HTSP-115-001 版本 v1.0 Draft",
  "專案概述 專案背景 Project Overview",
  "採購範圍 In-Scope Out-of-Scope Scope",
  "系統需求 功能需求 System Requirements FR-001 Must TC-001",
  "硬體與環境規格 Infrastructure 伺服器 CPU RAM Storage Network",
  "專案時程 里程碑 Timeline",
  "驗收標準 Acceptance Pass Conditional Fail 手冊 操作 維護 付款",
  "服務與維運 SLA Support Critical Major Minor RTO RPO Backup DR 備份 演練",
  "投標資格 評選 資格 公司登記 營業稅 退票 實績 3 件 金額 合約 驗收 畫面 評分 加分 ISO",
  "權利義務 罰則 違約金 Penalties 上限 Data Portability 資料交接 可攜",
  "費用 授權清單 BOM Bill of Materials 授權明細 Trial Express Community 禁止",
  "資訊安全 資安 Security 個資 PHI 敏感資料 Authentication Authorization 認證 權限 Audit Log 稽核 保存 弱點掃描 Critical High SBOM",
  "智財權 原始碼 甲方所有 第三方 元件 侵權 擔保 賠償",
].join("\n");

describe("reviewDoc", () => {
  it("passes a complete procurement spec baseline", () => {
    const result = reviewDoc(makeDoc("1_規格書_v1.0_20260625.docx", BASE_SPEC_TEXT));

    expect(result.verdict).toBe("pass");
    expect(result.ambiguousTerms).toHaveLength(0);
    expect(result.chapters.every((chapter) => chapter.found)).toBe(true);
  });

  it("flags ambiguous terms", () => {
    const result = reviewDoc(makeDoc("1_規格書_v1.0_20260625.docx", `${BASE_SPEC_TEXT}\n系統需穩定且依需求調整。`));

    expect(result.ambiguousTerms.map((item) => item.term)).toEqual(expect.arrayContaining(["穩定", "依需求"]));
    expect(findItem(result, "D4").passed).toBe(false);
    expect(result.contentFindings.some((finding) => finding.action === "revise")).toBe(true);
  });

  it("marks weak content for reviewer action", () => {
    const result = reviewDoc(makeDoc(
      "1_閬?筷v1.0_20260625.docx",
      BASE_SPEC_TEXT,
      [
        { type: "paragraph", text: "相關功能依廠商建議另行協議。" },
        { type: "paragraph", text: "系統應支援病歷資料查詢。" },
      ]
    ));

    expect(result.contentFindings.map((finding) => finding.action)).toEqual(
      expect.arrayContaining(["delete", "add-detail"])
    );
  });

  it("fails core AI checklist items when AI is mentioned without controls", () => {
    const result = reviewDoc(makeDoc("1_規格書_v1.0_20260625.docx", `${BASE_SPEC_TEXT}\n本案包含 AI 模型功能。`));

    expect(findItem(result, "G1").passed).toBe(false);
    expect(findItem(result, "G2").passed).toBe(false);
    expect(findItem(result, "G3").passed).toBe(false);
    expect(findItem(result, "G4").passed).toBe(false);
  });

  it("fails PHI security items when required controls are missing", () => {
    const incompleteSecurityText = BASE_SPEC_TEXT
      .replace("Authentication Authorization 認證 權限 ", "")
      .replace("Audit Log 稽核 保存 ", "")
      .replace("弱點掃描 Critical High ", "")
      .replace("Critical Major Minor ", "")
      .replace("SBOM", "");

    const result = reviewDoc(makeDoc("1_規格書_v1.0_20260625.docx", incompleteSecurityText));

    expect(findItem(result, "F2").passed).toBe(false);
    expect(findItem(result, "F3").passed).toBe(false);
    expect(findItem(result, "F4").passed).toBe(false);
    expect(findItem(result, "F5").passed).toBe(false);
  });
});
