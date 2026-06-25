# Spec Writer - 醫療招標規格書撰寫框架與稽核工具

## 📖 專案概述

本專案提供結構化的需求規格書撰寫框架、送審檢核機制與自動化稽核工具，專為醫療/政府招標專案設計。核心目標：**每一項需求必須可審查、可測試、可驗收、可追責**。

---

## 🗂️ 目錄結構

```
spec-writer/
├── templates/              # 核心文件（強制使用）
│   ├── mandatory-spec-template.md    # 【強制】10章標準規格書模板
│   ├── spec-review-checklist.md      # 【強制】送審前自檢表（A-K 七大類）
│   └── spec-framework.md             # 【參考】領域撰寫指引與最佳實踐
├── config/                 # 稽核規則配置
│   └── spec-audit-rules.json         # 關鍵字、模糊用語、檔名 pattern
├── scripts/                # 輔助工具
│   ├── audit_specs.py              # 批次稽核 .docx → 產出分數與缺失報告
│   ├── _read_specs.py              # 快速讀取 docx 內容與 Heading 結構
│   └── _compare_specs.py          # 多份規格書 Heading 結構比較
├── samples/                # 範例招標文件（參考用）
├── output/                 # 稽核產出存放區
│   ├── spec-audit-results.md       # 批次稽核結果報告
│   └── spec-review-report.md       # 送審審查報告
└── src/                    # 未來擴充（待開發）
```

---

## 🚀 快速開始

### 步驟 1：使用強制模板撰寫規格書

開啟 `templates/mandatory-spec-template.md`，以此作為新採購案的標準結構。每一章都有表格範例與填寫指引。

### 步驟 2：送審前自檢

使用 `templates/spec-review-checklist.md` 逐項檢查：
- **A** 文件控管 → **B** 章節完整性 → **C** 投標資格合規性（新增）
- **D** 需求品質 → **E** 驗收標準 → **F** 資安與個資
- **G** AI 應用專章 → **H** Infra/Cloud → **I** 履約退場 → **J** IP 授權合規性

> **判定規則**：任一「阻擋項」未通過，不建議送審或公告。

### 步驟 3：參考撰寫指引

`templates/spec-framework.md` 提供各領域的撰寫模式、常見陷阱與最佳實踐（投標資格設計、AI 規格、資安條款等）。

### 步驟 4：批次稽核既有文件

```powershell
$python = "C:\Users\ed100084\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
& $python .\scripts\audit_specs.py "C:\path\to\folder"
```

輸出會列出每份文件的分數、高/中風險缺失與 Heading 使用狀況。

---

## 📋 規格書標準章節（mandatory-spec-template.md）

| 編號 | 章節名稱 | 關鍵內容 |
|------|----------|----------|
| 0 | 文件控管 | 版本紀錄、狀態、窗口、最終版位置 |
| 1 | 專案概述 | 背景、目標 KPI、預算 |
| 2 | 採購範圍 | In-Scope / Out-of-Scope、授權方式 |
| 3 | 系統需求 | 功能/非功能/介接/AI/資安 |
| 4 | 硬體與環境規格 | Infra、雲端、網路、院內相容性 |
| 5 | 專案時程 | 里程碑、交付物、付款節點 |
| 6 | 驗收標準 | Pass/Critical/Fail 定義、測試案例 |
| 7 | 服務與維運 | SLA、RTO/RPO、教育訓練 |
| 8 | 投標資格與評選 | 基本/專業資格（三層架構）、評分項目 |
| 9 | 權利義務與責任罰則 | 違約金、智財權、Data Portability、禁用項目 |
| 10 | 費用與授權清單 | BOM、授權明細、付款節點對應 |

---

## 🛠️ 稽核工具

### audit_specs.py — 批次稽核

```powershell
# Markdown 輸出（預設）
& $python .\scripts\audit_specs.py "C:\path\to\folder"

# JSON 輸出（方便程式處理）
& $python .\scripts\audit_specs.py "C:\path\to\file.docx" --json

# 自訂規則檔
& $python .\scripts\audit_specs.py "C:\path\to\folder" --rules config\spec-audit-rules.json
```

**稽核項目：**
| 檢查類型 | 說明 | 嚴重度 |
|----------|------|--------|
| 檔名格式 | 是否符合 `{案號}_{文件類別}_{版次}_YYYYMMDD.docx` | MEDIUM |
| Heading 結構 | 是否使用 Word Heading Styles | MEDIUM |
| 必備章節 | 11 個必備章節的關鍵字匹配 | HIGH |
| 條件章節 | AI 模組、個資/PHI 觸發時檢查 required keywords | HIGH |
| 模糊用語 | 檢測 10+ 種禁用模糊詞 | MEDIUM |

**評分公式：** `100 - (HIGH × 12) - (MEDIUM × 5)`，最低 0 分。

### _read_specs.py / _compare_specs.py — 結構分析工具

```powershell
# 讀取多份文件的 Heading 結構與內容預覽
& $python .\scripts\_read_specs.py "C:\path\to\folder"

# 比較多份規格書的 H1 章節結構
& $python .\scripts\_compare_specs.py "C:\path\to\folder"
```

---

## 📋 檢核表總覽（spec-review-checklist.md）

| 類別 | 項目數 | 阻擋項數 | 說明 |
|------|--------|----------|------|
| A. 文件控管 | 6 | 5 | 檔名、版本紀錄、格式 |
| B. 章節完整性 | 11 | 9 | 10 章必備 + 附件清單 |
| **C. 投標資格合規性** | **5** | **5** | **新增：採購法合規檢查** |
| D. 需求品質 | 6 | 4 | 編號、量化、模糊用語 |
| E. 驗收標準 | 7 | 5 | Pass/Fail 定義、測試案例 |
| F. 資安與個資 | 11 | 9 | DPIA、SBOM、Audit Log、中資禁用 |
| G. AI 應用專章 | 7 | 7 | 模型來源、Hallucination、人工覆核 |
| H. Infra / Cloud | 6 | 6 | RTO/RPO、DR、Cloud 區域 |
| I. 履約與退場 | 6 | 6 | SLA、Data Portability |
| **J. IP 與授權合規性** | **7** | **7** | **新增：BOM、智財權、第三方元件** |

---

## 📝 五痛點標準流程

本專案框架已針對以下常見問題提供標準化解決方案：

| # | 痛點 | 對應文件/章節 |
|---|------|--------------|
| 1 | 廠商資格限制 vs 採購法合規 | `mandatory-spec-template.md` Ch.8（三層架構法）+ `spec-review-checklist.md` C 類 |
| 2 | 如何驗證廠商實績能力 | `mandatory-spec-template.md` Ch.8（實績三齊備原則）+ `spec-framework.md` §1.3 |
| 3 | 各單位規格寫法不一致 | 強制使用 `mandatory-spec-template.md` + `audit_specs.py` 自動化檢查 |
| 4 | 軟體授權與版權要求 | `mandatory-spec-template.md` Ch.9.2 + Ch.10（IP 矩陣、BOM 明細）+ `spec-review-checklist.md` J 類 |
| 5 | 資安條款約束力 | `mandatory-spec-template.md` §3.5（控制項矩陣+罰則）+ `spec-framework.md` §4 + `spec-review-checklist.md` F 類 |

---

## 🛠️ Skills 整合

| Skill | 用途 |
|-------|------|
| **docx** | 讀取、建立、編輯 Word 規格書文件 |
| **chandra-ocr** | PDF/掃描文件 OCR → Markdown（既有紙本規格書數位化） |
| **book-to-skill** | 將優質範例規格書轉為 AI 學習 Skill |

---

## 📅 建立日期：2026-06-22 ｜最後更新：2026-06-25
