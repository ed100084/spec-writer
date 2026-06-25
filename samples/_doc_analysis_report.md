# Legacy .doc Sample Analysis Report

## Overview

| File | Size | Project Name | Structure Type | Extractable Content |
|------|------|--------------|----------------|---------------------|
| `01-3規格說明書-SOC-5.doc` | 197KB | SOC資安威脅偵測管理與安全檢測服務 | 壹、貳、參 (Traditional) | TOC + ~2 meaningful paragraphs |
| `01-3規格說明書0320.doc` | 203KB | 智慧輸液系統採購案 | 第一章、第二章 (Modern) | TOC + ~3 meaningful paragraphs |
| `01-3規格說明書_014.doc` | 318KB | 整合式智慧化護理應用通訊網絡系統 | 第一章、第二章 (Modern) | TOC + ~5 meaningful paragraphs |

## Key Finding: Word Internal Format Contamination

All three .doc files contain **massive amounts of Word internal formatting metadata** mixed with actual content. The WordDocument OLE stream contains:

- **Unicode CJK Extension B characters** (U+20000+) like `ᔧ텨鈅ᘀ`, `ᔤ텨鈅ᘀ` — these are NOT text, they are Word's internal paragraph/character style references
- **Binary formatting sequences** mixed with Chinese text
- **TOC fields** with proper Hyperlink/PAGEREF structure

This makes .doc extraction significantly harder than .docx because:
1. No clean XML structure to parse
2. Text and formatting metadata are interleaved in binary stream
3. UTF-16LE decoding produces ~70% garbage characters

## Extractable Content Summary

### File 1: SOC-5.doc — Security Service Spec

**Title:** 義大醫療財團法人義大醫院 SOC資安威脅偵測管理與安全檢測服務需求說明書

**TOC Structure:**
```
壹、專案說明
  一、專案名稱
  二、專案目標
```

**Extractable Content Snippets:**
- Event notification handling procedures (事件通報單處理過程)
- Vendor handles max 5 events/year, 6 hosts each (廠商每年至多處理五件、每件牽涉至多六台主機設備事件進行分析)
- ISO 27001 analyst certification requirement (ISO 27001 Lead Auditor/Implementer or CISA/CISM)

### File 2: 0320.doc — Smart Infusion System Spec

**Title:** 義大醫療財團法人義大醫院 智慧輸液系統採購案 採購規範書

**TOC Structure:**
```
第一章、專案概述
  一、專案名稱
  二、專案背景
  三、專案目的
  四、專案經費
第二章、專案範圍
  一、採購目的
  二、採購項目
  三、採購範圍說明
  四、系統規劃架構
  五、運作流程概述
  六、注意事項
第三章、設備及系統規格需求
```

**Extractable Content Snippets:**
- System management permission handover after acceptance (系統管理權限、帳號設定及授權文件正式移交予院方)
- Training requirements: minimum 10 sessions per batch, 0.5 hours each (現場教育訓練每批次導入至少需提供10場實機訓練，每次0.5小時以上)
- Education and system go-live at least 14 days in advance (教育訓練與系統上線至少提前 14 天完成)

### File 3: _014.doc — Smart Nursing Communication Network Spec

**Title:** 義大醫療財團法人義大醫院 整合式智慧化護理應用通訊網絡系統採購案 規格說明書

**TOC Structure:**
```
第一章、專案概述
  一、專案名稱
  二、專案背景
  三、專案目的
  四、專案經費
第二章、專案範圍
  一、採購目的
  二、採購項目
  三、基礎架構建置
  四、整合建置及API服務協助導入
  五、管理與維運介面
  六、注意事項
第三章、設備及系統規格需求
```

**Extractable Content Snippets:**
- Post-handover system maintenance per Chapters 7 & 9 (交接後之系統維護與支援作業，依本規格書第七章及第九章辦理)
- Training for management, IT (MIS), and clinical units (管理單位、資訊單位（MIS）及臨床單位能充分熟悉系統操作與 API 開發技術)
- System architecture explanation, API interface call standards, SDK example programs (系統架構說明、API 介面呼叫規範、SDK 範例程式演示)

## Comparison: .doc vs .docx Structure Patterns

| Aspect | .doc Files | .docx Files |
|--------|-----------|-------------|
| **Section numbering** | Mixed: File 1 uses 壹/貳/參; Files 2-3 use 第一章/第二章 | Mixed: File 1 uses 【】brackets; File 2 uses 壹/貳; File 3 uses A/B/C/D/E |
| **Heading styles** | Word has heading styles but they're buried in binary format | No heading styles applied (Normal text only) |
| **TOC presence** | ✅ All three have proper TOC with Hyperlink fields | ❌ None have TOC |
| **Content extractability** | ⚠️ ~5-10% meaningful content after filtering garbage | ✅ 100% readable but unstructured |
| **Table usage** | Unknown (tables embedded in binary) | Minimal — specs scattered as paragraphs |

## Implications for Framework Design

### What .doc Files Confirm:

1. **TOC is the only reliable structure marker** — All three .doc files have proper Word TOC fields that survive extraction, even when content is garbled
2. **Traditional Chinese numbering (壹貳參) still used** — File 1 uses this older style, suggesting some vendors follow traditional government document conventions
3. **Modern numbering (第一章/第二章) also common** — Files 2-3 use this style, showing inconsistency even within the same hospital
4. **Content quality is uniformly poor** — Even with clean .docx parsing, the actual spec content lacks:
   - Structured requirement tables
   - Clear qualification criteria hierarchy
   - IP/licensing detail
   - Security control matrices

### Framework Recommendations Based on .doc Findings:

1. **TOC-based validation** — The audit tool should check for TOC presence as a minimum quality gate, since even garbled .doc files preserve this structure
2. **Section numbering normalization** — Accept both 壹/貳/參 and 第一章/第二章 formats in the checklist
3. **Content density threshold** — Set minimum meaningful character count (excluding formatting metadata) to detect overly brief specs
4. **.doc file support** — The audit script should attempt olefile extraction as a fallback when python-docx fails

## Technical Note: .doc Extraction Method

Successful extraction requires:
1. `olefile` to open the OLE2 compound document
2. Read `WordDocument` stream (binary)
3. UTF-16LE decoding with error ignore
4. Split by null bytes (`\x00`)
5. Filter segments containing Chinese characters (U+4E00-U+FFFF)
6. Exclude Unicode CJK Extension B characters (U+20000+) which are Word formatting metadata

Approximately 70% of extracted segments are garbage — the key is recognizing that **TOC fields and short clean paragraphs** are the only reliable content sources in legacy .doc files.
