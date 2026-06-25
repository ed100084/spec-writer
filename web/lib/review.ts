"use client";

import type { ParsedDoc, ReviewResult, ChecklistCategory, ChecklistItem } from "./types";

const AMBIGUOUS_TERMS = [
  "良好", "適當", "必要時", "依需求", "視情況",
  "可支援", "高效", "穩定", "完善", "完整支援", "部分符合",
];

const CHAPTER_KEYWORDS: { id: string; title: string; keywords: string[]; required: boolean }[] = [
  { id: "ch0", title: "文件控管", keywords: ["文件控管", "版本", "案號"], required: true },
  { id: "ch1", title: "專案概述", keywords: ["專案概述", "專案背景", "計畫緣起", "Project Overview"], required: true },
  { id: "ch2", title: "採購範圍", keywords: ["採購範圍", "In-Scope", "Out-of-Scope", "Scope"], required: true },
  { id: "ch3", title: "系統需求", keywords: ["系統需求", "功能需求", "System Requirements"], required: true },
  { id: "ch4", title: "硬體與環境規格", keywords: ["硬體", "環境規格", "Infrastructure", "伺服器"], required: true },
  { id: "ch5", title: "專案時程", keywords: ["專案時程", "里程碑", "Timeline"], required: true },
  { id: "ch6", title: "驗收標準", keywords: ["驗收標準", "驗收", "Acceptance"], required: true },
  { id: "ch7", title: "服務與維運", keywords: ["服務與維運", "SLA", "維護", "Support"], required: true },
  { id: "ch8", title: "投標資格與評選", keywords: ["投標資格", "評選", "資格"], required: true },
  { id: "ch9", title: "權利義務與責任罰則", keywords: ["權利義務", "罰則", "違約金", "Penalties"], required: true },
  { id: "ch10", title: "費用與授權清單", keywords: ["費用", "授權清單", "BOM", "Bill of Materials"], required: true },
];

export function reviewDoc(doc: ParsedDoc): ReviewResult {
  const fullText = doc.chapters
    .flatMap((ch) => [ch.title, ...ch.content.map((c) => c.text || "")])
    .join("\n");

  // Chapter detection
  const chapters = CHAPTER_KEYWORDS.map((ch) => {
    const found = ch.keywords.some((kw) => fullText.includes(kw));
    const guidance = getChapterGuidance(ch.id);
    return {
      id: ch.id,
      title: ch.title,
      found,
      required: ch.required,
      necessity: ch.required ? "required" as const : "optional" as const,
      issue: found ? guidance.issueWhenFound : `${ch.title} 章節未明確出現`,
      why: found ? guidance.whyWhenFound : guidance.whyWhenMissing,
      recommendation: found ? guidance.recommendationWhenFound : guidance.recommendationWhenMissing,
      structure: guidance.structure,
    };
  });

  // Ambiguous terms scan
  const ambiguousTerms: { term: string; context: string }[] = [];
  for (const term of AMBIGUOUS_TERMS) {
    const idx = fullText.indexOf(term);
    if (idx >= 0) {
      const start = Math.max(0, idx - 20);
      const end = Math.min(fullText.length, idx + term.length + 20);
      ambiguousTerms.push({ term, context: fullText.substring(start, end) });
    }
  }

  // Checklist evaluation
  const checklist = enrichChecklist(evaluateChecklist(doc, fullText));

  // Score
  const allItems = checklist.flatMap((cat) => cat.items);
  const total = allItems.length;
  const passed = allItems.filter((item) => item.passed).length;
  const blockingFailed = allItems.filter((item) => item.blocking && !item.passed).length;

  let verdict: "pass" | "conditional" | "fail" = "pass";
  if (blockingFailed > 3) verdict = "fail";
  else if (blockingFailed > 0) verdict = "conditional";

  return {
    chapters,
    checklist,
    ambiguousTerms,
    score: { total, passed, percentage: total > 0 ? Math.round((passed / total) * 100) : 0 },
    verdict,
  };
}

function evaluateChecklist(doc: ParsedDoc, fullText: string): ChecklistCategory[] {
  const hasText = (keywords: string[]) => keywords.some((kw) => fullText.includes(kw));
  const hasTable = () => doc.chapters.some((ch) => ch.content.some((c) => c.type === "table"));

  const categories: ChecklistCategory[] = [
    {
      id: "A",
      title: "文件控管",
      items: [
        { id: "A1", text: "檔名符合命名規則", blocking: true, passed: /^\d+.*\.(docx|doc)$/.test(doc.fileName) },
        { id: "A2", text: "文件內有版本紀錄表", blocking: true, passed: hasText(["版本", "v1", "修訂"]) },
        { id: "A3", text: "文件狀態明確標示", blocking: true, passed: hasText(["Draft", "Review", "Final"]) },
        { id: "A4", text: "使用 Heading Styles", blocking: false, passed: doc.chapters.length > 1 },
      ],
    },
    {
      id: "B",
      title: "章節完整性",
      items: CHAPTER_KEYWORDS.map((ch) => ({
        id: `B-${ch.id}`,
        text: ch.title,
        blocking: true,
        passed: ch.keywords.some((kw) => fullText.includes(kw)),
      })),
    },
    {
      id: "C",
      title: "投標資格合規性",
      items: [
        { id: "C1", text: "基本資格僅列法定最低要求", blocking: true, passed: hasText(["公司登記", "營業稅", "退票"]) },
        { id: "C2", text: "專業資格有量化標準", blocking: true, passed: hasText(["實績", "件", "金額"]) },
        { id: "C3", text: "實績審查三齊備", blocking: true, passed: hasText(["合約", "驗收", "畫面"]) },
        { id: "C4", text: "認證為評分項非門檻", blocking: true, passed: hasText(["評分", "加分", "ISO"]) },
      ],
    },
    {
      id: "D",
      title: "需求品質",
      items: [
        { id: "D1", text: "功能需求有唯一編號", blocking: false, passed: /FR-\d{3}/.test(fullText) },
        { id: "D2", text: "Must 需求有對應驗收方式", blocking: true, passed: hasText(["Must", "TC-"]) },
        { id: "D3", text: "In-Scope / Out-of-Scope 清楚", blocking: true, passed: hasText(["In-Scope", "Out-of-Scope"]) },
        { id: "D4", text: "未使用模糊字眼", blocking: true, passed: !AMBIGUOUS_TERMS.some((t) => fullText.includes(t)) },
        { id: "D5", text: "需求有量化指標", blocking: true, passed: /\d+/.test(fullText) && hasTable() },
      ],
    },
    {
      id: "E",
      title: "驗收標準",
      items: [
        { id: "E1", text: "定義 Pass / Conditional / Fail 三級判定", blocking: true, passed: hasText(["Pass", "Conditional", "Fail"]) },
        { id: "E2", text: "功能驗收有測試案例", blocking: true, passed: /TC-\d{3}/.test(fullText) },
        { id: "E3", text: "文件驗收清單完整", blocking: true, passed: hasText(["手冊", "操作", "維護"]) },
        { id: "E4", text: "付款節點與驗收一致", blocking: true, passed: hasText(["付款", "驗收"]) },
      ],
    },
    {
      id: "F",
      title: "資安與個資",
      items: [
        { id: "F1", text: "說明是否處理個資", blocking: true, passed: hasText(["個資", "PHI", "敏感資料"]) },
        { id: "F2", text: "Authentication / Authorization 明確", blocking: true, passed: hasText(["Authentication", "Authorization", "認證", "權限"]) },
        { id: "F3", text: "Audit Log 範圍與保存年限", blocking: true, passed: hasText(["Audit Log", "稽核", "保存"]) },
        { id: "F4", text: "弱點掃描標準明確", blocking: true, passed: hasText(["弱點掃描", "Critical", "High"]) },
        { id: "F5", text: "要求 SBOM", blocking: true, passed: hasText(["SBOM"]) },
      ],
    },
    {
      id: "G",
      title: "AI 應用（有 AI 時必填）",
      items: [
        { id: "G1", text: "AI 模型來源明確", blocking: true, passed: !hasText(["AI", "人工智慧", "LLM", "模型"]) || hasText(["模型來源", "部署"]) },
        { id: "G2", text: "有客觀驗收指標", blocking: true, passed: !hasText(["AI", "人工智慧"]) || hasText(["準確率", "F1", "BLEU"]) },
        { id: "G3", text: "Hallucination 防護", blocking: true, passed: !hasText(["AI", "人工智慧"]) || hasText(["Hallucination", "幻覺", "覆核"]) },
        { id: "G4", text: "關鍵輸出有人工覆核", blocking: true, passed: !hasText(["AI", "人工智慧"]) || hasText(["覆核", "人工"]) },
        { id: "G5", text: "AI output 可稽核", blocking: true, passed: !hasText(["AI", "人工智慧"]) || hasText(["稽核", "prompt", "log"]) },
      ],
    },
    {
      id: "H",
      title: "基礎設施",
      items: [
        { id: "H1", text: "硬體規格明確", blocking: true, passed: hasText(["CPU", "RAM", "Storage", "Network"]) },
        { id: "H2", text: "RTO / RPO 分層", blocking: true, passed: hasText(["RTO", "RPO"]) },
        { id: "H3", text: "Backup / DR 演練", blocking: true, passed: hasText(["Backup", "DR", "備份", "演練"]) },
      ],
    },
    {
      id: "I",
      title: "履約與退場",
      items: [
        { id: "I1", text: "SLA 分級明確", blocking: true, passed: hasText(["SLA", "Critical", "Major", "Minor"]) },
        { id: "I2", text: "違約金計算明確", blocking: true, passed: hasText(["違約金", "罰款", "上限"]) },
        { id: "I3", text: "資料可攜性明確", blocking: true, passed: hasText(["Data Portability", "資料交接", "可攜"]) },
      ],
    },
    {
      id: "J",
      title: "IP 與授權",
      items: [
        { id: "J1", text: "BOM 完整", blocking: true, passed: hasText(["BOM", "授權明細", "授權清單"]) },
        { id: "J2", text: "禁止 Trial 版本", blocking: true, passed: hasText(["Trial", "Express", "Community", "禁止"]) },
        { id: "J3", text: "客製開發智財權歸屬", blocking: true, passed: hasText(["智財權", "原始碼", "甲方所有"]) },
        { id: "J4", text: "第三方元件清單", blocking: true, passed: hasText(["第三方", "元件", "SBOM"]) },
        { id: "J5", text: "侵權擔保條款", blocking: true, passed: hasText(["侵權", "擔保", "賠償"]) },
      ],
    },
  ];

  return categories;
}

function enrichChecklist(categories: ChecklistCategory[]): ChecklistCategory[] {
  return categories.map((category) => ({
    ...category,
    items: category.items.map((item) => {
      const guidance = getChecklistGuidance(category.id, item);
      return {
        ...item,
        necessity: item.blocking ? "required" as const : "recommended" as const,
        issue: item.passed ? "已符合" : `未符合：${item.text}`,
        why: guidance.why,
        recommendation: guidance.recommendation,
      };
    }),
  }));
}

function getChecklistGuidance(categoryId: string, item: ChecklistItem) {
  const fallback = {
    why: item.blocking
      ? "此項會影響需求可驗收性、資安合規或採購責任界線。"
      : "此項主要影響文件可讀性與後續維護效率。",
    recommendation: "在對應章節補上明確欄位、判斷標準與可驗收文字，避免只用概念性描述。",
  };

  const byCategory: Record<string, { why: string; recommendation: string }> = {
    A: {
      why: "文件基本資訊不完整會造成版本控管、送審追溯與正式採購附件識別困難。",
      recommendation: "補齊文件編號、版本、狀態、日期、負責單位與修訂紀錄，並固定在首頁或文件資訊章節。",
    },
    B: {
      why: "必要章節缺漏會讓採購、驗收、資安與維運責任無法完整落地。",
      recommendation: "依建議章節架構補齊缺漏章節；不適用章節也應寫明「不適用原因」。",
    },
    C: {
      why: "資料與權限描述不足，會影響醫療資料保護、委外管理與稽核責任。",
      recommendation: "補上資料類型、資料擁有者、權限模型、存取控管、稽核紀錄與留存要求。",
    },
    D: {
      why: "需求若不可量測，廠商無法估價，院方也難以驗收與追責。",
      recommendation: "將需求改寫為 Must/Should/Could，並附 FR 編號、量化標準、測試案例與排除範圍。",
    },
    E: {
      why: "驗收標準不明會造成上線前爭議，尤其是醫療系統涉及流程、資安與可用性。",
      recommendation: "補上 Pass/Conditional/Fail 條件、TC 編號、測試資料、負責角色與簽核方式。",
    },
    F: {
      why: "資安控制不足會提高個資、醫療資料與系統存取風險，也會影響委外合規。",
      recommendation: "補上 Authentication、Authorization、Audit Log、弱點修補、SBOM、資料加密與事件通報要求。",
    },
    G: {
      why: "AI 功能若缺少治理，容易產生 Hallucination、資料外洩、責任歸屬不清與臨床風險。",
      recommendation: "補上 AI 使用範圍、人工覆核、輸出限制、模型/Prompt log、評估指標與錯誤處理流程。",
    },
    H: {
      why: "基礎架構、備援與復原目標不明會影響 SLA、容量規劃與災難復原。",
      recommendation: "補上 CPU、RAM、Storage、Network、RTO/RPO、Backup、DR 與監控告警要求。",
    },
    I: {
      why: "維運責任與服務等級不明，會造成上線後支援、罰則與資料移轉爭議。",
      recommendation: "補上 SLA 分級、回應/修復時間、罰則、資料可攜性、退場與交接要求。",
    },
    J: {
      why: "授權與 BOM 不清會造成日後費用、版權、弱點修補與第三方元件責任風險。",
      recommendation: "補上 BOM、授權類型、授權數量、Trial/Community 限制、SBOM 與授權證明文件。",
    },
  };

  return byCategory[categoryId] ?? fallback;
}

function getChapterGuidance(chapterId: string) {
  const common = {
    issueWhenFound: "章節已存在，需檢查內容是否足以支持驗收與採購決策。",
    whyWhenFound: "章節存在不代表內容完整；仍需確認是否有可量測標準、責任角色與例外條件。",
    whyWhenMissing: "必要章節缺漏會讓規格書無法完整支撐估價、驗收、維運或資安審查。",
    recommendationWhenFound: "依建議結構補齊缺漏欄位，避免只保留敘述性文字。",
    recommendationWhenMissing: "新增此章節；若確實不適用，保留章節並寫明不適用原因與核准角色。",
    structure: ["目的", "範圍", "必要要求", "驗收標準", "責任角色", "例外與限制"],
  };

  const chapterGuidance: Record<string, typeof common> = {
    ch0: {
      ...common,
      structure: ["文件名稱", "文件編號", "版本", "狀態", "修訂紀錄", "送審/核准單位"],
    },
    ch1: {
      ...common,
      structure: ["專案背景", "目標", "利害關係人", "現況痛點", "預期效益", "不做事項"],
    },
    ch2: {
      ...common,
      structure: ["In-Scope", "Out-of-Scope", "系統邊界", "介接範圍", "資料範圍", "假設與限制"],
    },
    ch3: {
      ...common,
      structure: ["需求編號", "Must/Should/Could", "功能描述", "輸入/輸出", "例外情境", "驗收案例"],
    },
    ch4: {
      ...common,
      structure: ["部署架構", "環境需求", "網路需求", "帳號權限", "監控", "備份與 DR"],
    },
    ch5: {
      ...common,
      structure: ["里程碑", "交付項目", "時程", "前置條件", "院方配合事項", "延遲處理"],
    },
    ch6: {
      ...common,
      structure: ["驗收範圍", "測試案例", "Pass 條件", "Conditional 條件", "Fail 條件", "簽核流程"],
    },
    ch7: {
      ...common,
      structure: ["SLA 分級", "服務時間", "回應時間", "修復時間", "通報方式", "罰則"],
    },
    ch8: {
      ...common,
      structure: ["資料分類", "資料擁有者", "存取權限", "稽核紀錄", "留存/刪除", "資料移轉"],
    },
    ch9: {
      ...common,
      structure: ["權利義務", "責任歸屬", "違約情境", "罰則", "終止條件", "退場交接"],
    },
    ch10: {
      ...common,
      structure: ["BOM", "授權模式", "授權數量", "第三方元件", "SBOM", "證明文件"],
    },
  };

  return chapterGuidance[chapterId] ?? common;
}
