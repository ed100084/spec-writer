# 規格書送審前檢核表

> 用途：送資訊、資安、採購或主管審查前，由承辦窗口先行自檢。
> 判定：任一「阻擋項」未通過，不建議送審或公告。

---

## A. 文件控管

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| A1 | 檔名符合 `{案號}_{文件類別}_{版次}_YYYYMMDD.docx` | Pass / Fail | 是 |
| A2 | 文件內有版本紀錄表 | Pass / Fail | 是 |
| A3 | 文件狀態明確標示 Draft / Review / Final | Pass / Fail | 是 |
| A4 | 最終版放於 `FINAL/`，無多個疑似最終版 | Pass / Fail | 是 |
| A5 | 使用 `.docx`，未使用 `.doc` | Pass / Fail | 是 |
| A6 | 使用 Word Heading Styles，可自動產生目錄 | Pass / Fail | 否 |

---

## B. 章節完整性

| # | 必備章節 | 判定 | 阻擋項 |
|---|----------|------|--------|
| B1 | 專案概述（含背景、目標 KPI、預算） | Pass / Fail | 是 |
| B2 | 採購範圍（In-Scope / Out-of-Scope） | Pass / Fail | 是 |
| B3 | 系統需求（功能/非功能/介接） | Pass / Fail | 是 |
| B4 | 硬體與環境規格 / Infrastructure | Pass / Fail | 是 |
| B5 | 專案時程（里程碑、交付物、付款節點） | Pass / Fail | 是 |
| B6 | 驗收標準（Pass/Critical/Fail 定義） | Pass / Fail | 是 |
| B7 | 服務與維運 / SLA | Pass / Fail | 是 |
| B8 | 投標資格與評選 | Pass / Fail | 視案件 |
| B9 | 權利義務與責任罰則 | Pass / Fail | 是 |
| B10 | 費用與授權清單 / BOM | Pass / Fail | 是 |
| B11 | 附件清單 | Pass / Fail | 是 |

---

## C. 投標資格合規性（新增）

> 依據：政府採購法第 36、52、54 條；採購申訴審議判斷。基本資格不得與履約無關，認證應為加分項非門檻。

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| CQ-01 | 基本資格僅列法定最低要求（公司登記、稅務、無退票、非拒絕往來），無額外增加與履約無關之條件 | Pass / Fail | 是 |
| CQ-02 | 專業資格（實績）有量化標準：件數、金額、年限明確 | Pass / Fail | 是 |
| CQ-03 | 實績審查要求「合約 + 驗收證明 + 系統畫面」三齊備，缺一即不符合資格 | Pass / Fail | 是 |
| CQ-04 | ISO/IEC 等認證作為評分加分項（非投標門檻），除非法規強制要求 | Pass / Fail | 是 |
| CQ-05 | 有可疑實績之查核機制（到府查核或函查）及違法處理條款（依採購法第 101 條） | Pass / Fail | 是 |

---

## D. 需求品質

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| DQ-01 | 每項功能需求有唯一編號，例如 `FR-001` | Pass / Fail | 否 |
| DQ-02 | 每項 Must 需求都有對應驗收方式（測試案例編號） | Pass / Fail | 是 |
| DQ-03 | In-Scope / Out-of-Scope 清楚，避免廠商擴大或縮小解讀 | Pass / Fail | 是 |
| DQ-04 | 未使用模糊字眼：適當、良好、必要時、依需求、可支援等未量化描述 | Pass / Fail | 是 |
| DQ-05 | 需求有量化指標：數量、時間、容量、效能、可用率或測試條件 | Pass / Fail | 是 |
| DQ-06 | 授權模式、授權期間、授權數量、是否可轉移均明確 | Pass / Fail | 是 |

---

## E. 驗收標準

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| EA-01 | 定義 Pass / Conditional Pass / Fail 三級判定規則 | Pass / Fail | 是 |
| EA-02 | 「部分符合」是否可驗收，有明確補正條件與期限 | Pass / Fail | 是 |
| EA-03 | 功能驗收有測試案例（TC-XXX）與預期結果 | Pass / Fail | 是 |
| EA-04 | 效能驗收有 Response Time、Concurrent Users 或 Throughput | Pass / Fail | 視案件 |
| EA-05 | 連續運作測試時數明確，例如 72/168 小時 | Pass / Fail | 視案件 |
| EA-06 | 文件驗收清單完整，含操作手冊、維護手冊、API 文件、測試報告 | Pass / Fail | 是 |
| EA-07 | 付款節點與驗收節點一致，無「驗收未完成但需付款」的模糊空間 | Pass / Fail | 是 |

---

## F. 資安與個資

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| FA-01 | 說明是否處理個資、病歷、PHI 或敏感資料 | Pass / Fail | 是 |
| FA-02 | 涉個資/PHI 時要求 DPIA（資料保護衝擊評估） | Pass / Fail | 是 |
| FA-03 | Authentication / Authorization 機制明確（含 MFA 要求） | Pass / Fail | 是 |
| FA-04 | Audit Log 範圍（登入、存取、修改、匯出）與保存年限明確 | Pass / Fail | 是 |
| FA-05 | 弱點掃描標準明確，Critical/High 不得存在 | Pass / Fail | 是 |
| FA-06 | 驗收前是否要求 Penetration Test（依風險判定） | Pass / Fail | 視風險 |
| FA-07 | 軟體案要求 SBOM（SPDX/CycloneDX 格式） | Pass / Fail | 是 |
| FA-08 | 禁用中資背景硬體、軟體、雲端服務、SDK、APP | Pass / Fail | 是 |
| FA-09 | 資料是否離院或境外傳輸有明確說明及控制措施 | Pass / Fail | 是 |
| FA-10 | 資安事件通報時程明確（4 小時內通知、24 小時初步報告） | Pass / Fail | 是 |
| FA-11 | 禁用弱加密演算法（MD5、SHA-1、DES、RC4） | Pass / Fail | 是 |

---

## G. AI 應用專章（有 AI 時必填）

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| GA-01 | AI 模型來源與部署位置明確（自建 / 第三方 API / 混合） | Pass / Fail | 是 |
| GA-02 | 訓練資料、推論資料、留存政策明確 | Pass / Fail | 是 |
| GA-03 | 若使用第三方 API，個資與 PHI 是否外送說明清楚 | Pass / Fail | 是 |
| GA-04 | 有客觀驗收指標（F1 Score、BLEU、WER、醫師盲測通過率） | Pass / Fail | 是 |
| GA-05 | Hallucination 防護機制明確（原文比對、信心分數、人工覆核） | Pass / Fail | 是 |
| GA-06 | 醫療紀錄或診斷相關輸出有 100% 人工覆核流程 | Pass / Fail | 是 |
| GA-07 | AI output、模型版本、覆核紀錄可稽核（留存 prompt/input/output） | Pass / Fail | 是 |

---

## H. Infra / Cloud / Integration

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| HI-01 | CPU、RAM、Storage、IOPS、Network 規格明確 | Pass / Fail | 是 |
| HI-02 | RTO / RPO 依系統重要性分層（醫療關鍵 vs 一般行政） | Pass / Fail | 是 |
| HI-03 | Backup / Restore / DR 演練要求明確（含演練頻率） | Pass / Fail | 是 |
| HI-04 | Firewall Port、資料流向、網路區域（內網/DMZ/Internet）明確 | Pass / Fail | 是 |
| HI-05 | 與 HIS、PACS、AD、API Gateway 等既有系統相容性明確 | Pass / Fail | 是 |
| HI-06 | Cloud / SaaS 服務區域、資料保存地、出口機制明確 | Pass / Fail | 是 |

---

## I. 履約與退場

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| IE-01 | SLA 分 Critical / Major / Minor 三級，回應/修復時間明確 | Pass / Fail | 是 |
| IE-02 | 違約金計算公式明確（含上限） | Pass / Fail | 是 |
| IE-03 | 保固期與維護內容明確（更新、升級、弱點修補） | Pass / Fail | 是 |
| IE-04 | 合約終止後 Data Portability 明確（交接時點、期限、格式） | Pass / Fail | 是 |
| IE-05 | 資料交接驗證方式明確（筆數核對、Hash 驗證、抽測匯入） | Pass / Fail | 是 |
| IE-06 | 廠商不得以費用爭議或商業機密拒絕交接院方資料 | Pass / Fail | 是 |

---

## J. IP 與授權合規性（新增）

> 目的：確保軟體授權、智財權歸屬、第三方元件揭露完整，避免產後糾紛。

| # | 檢核項目 | 判定 | 阻擋項 |
|---|----------|------|--------|
| JP-01 | BOM 附件包含完整授權明細（品項/版本/類型/數量/期間/單價） | Pass / Fail | 是 |
| JP-02 | 明確禁止 Express / Community / Trial / Developer 版本 | Pass / Fail | 是 |
| JP-03 | 客製開發程式碼智財權歸屬明確（應歸甲方所有，交付原始碼） | Pass / Fail | 是 |
| JP-04 | COTS 授權模式明確（非專屬、不可轉讓、永久使用或訂閱期間） | Pass / Fail | 是 |
| JP-05 | 第三方元件清單完整（名稱/版本/授權類型/供應商/已知漏洞） | Pass / Fail | 是 |
| JP-06 | 侵權擔保條款存在（廠商承擔侵權所致全部法律責任及賠償） | Pass / Fail | 是 |
| JP-07 | Data Portability 涵蓋軟體授權轉移或資料匯出機制 | Pass / Fail | 是 |

---

## K. 審查結論

| 結論 | 條件 |
|------|------|
| **可送審** | 所有阻擋項 Pass |
| **補正後送審** | 阻擋項 Fail ≤ 3 且無資安/AI/驗收重大缺失 |
| **不建議送審** | 任一 AI/資安/驗收阻擋項 Fail，或阻擋項 Fail > 3 |

### 補正清單

| # | 缺失（章節 + 項目編號） | 責任單位 | 期限 | 完成狀態 |
|---|------------------------|----------|------|----------|
| 1 |  |  |  |  |
