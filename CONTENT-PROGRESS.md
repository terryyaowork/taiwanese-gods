# 內容故事化進度表

> 追蹤全站內容從「舊百科版」→「故事化版」（遵循 CONTENT-STYLE.md）的進度。
> 每完成一波更新這裡。想知道進度隨時看這張表。
>
> **本檔只管內容（地基層）。功能 / 服務層進度看 `PRODUCT-PROGRESS.md`。**
>
> **✅ 2026-07-05 全站故事化完成**：神明 46 + 原民 7 + 廟宇 57 + 文化 44 +
> 神明故事 10 + 路線 8，全部三語（zh/en/ja）故事化並上線。籤詩 60 /
> 神明指南 7 屬實用工具型，維持原文不故事化。

## 判定圖例

- ✅ 已故事化（三語一致）
- 🔄 進行中
- ⬜ 待處理（還是舊百科版）
- ➖ 不故事化（保持原文，如籤詩、咒語本文、實用 tips）

## 進度總表

| 內容型                      | 筆數 | zh  | en  | ja  | 備註                                                           |
| --------------------------- | ---- | --- | --- | --- | -------------------------------------------------------------- |
| **神明**                    |      |     |     |     |                                                                |
| 道教神明 taoist-gods        | 15   | ✅  | ✅  | ✅  | wave 1/2                                                       |
| 佛教神明 buddhist-gods      | 11   | ✅  | ✅  | ✅  | wave 1/2                                                       |
| 民間神明 folk-gods          | 13   | ✅  | ✅  | ✅  | wave 1/2                                                       |
| 客家神明 hakka-gods         | 7    | ✅  | ✅  | ✅  | wave 1/2                                                       |
| 原民信仰 indigenous-spirits | 7    | ✅  | ✅  | ✅  | wave 3                                                         |
| **廟宇**                    |      |     |     |     |                                                                |
| 北部廟宇 temples-north      | 21   | ✅  | ✅  | ✅  | wave 4 — description + history                                 |
| 中部廟宇 temples-central    | 12   | ✅  | ✅  | ✅  | wave 4                                                         |
| 南部廟宇 temples-south      | 13   | ✅  | ✅  | ✅  | wave 4                                                         |
| 東部廟宇 temples-east       | 11   | ✅  | ✅  | ✅  | wave 4                                                         |
| **文化**                    |      |     |     |     |                                                                |
| 習俗 culture-customs        | 10   | ✅  | ✅  | ✅  | wave 5                                                         |
| 節慶 culture-festivals      | 9    | ✅  | ✅  | ✅  | wave 5                                                         |
| 工藝 culture-heritage       | 7    | ✅  | ✅  | ✅  | wave 5                                                         |
| 儀式 culture-rituals        | 8    | ✅  | ✅  | ✅  | wave 5                                                         |
| 咒語介紹 culture-mantras    | 10   | ✅  | ✅  | ✅  | wave 5 — 咒語本文逐字保留、只改介紹文字                        |
| **其他**                    |      |     |     |     |                                                                |
| 神明故事 god-stories        | 10   | ✅  | ✅  | ✅  | 三語皆故事版（stage 一-b）                                     |
| 路線 routes                 | 8    | ✅  | ✅  | ✅  | wave 1/2 起、07-05 補到 8 條；8/8 皆配廟口美食                 |
| 神明指南 god-guide          | 7    | ➖  | ➖  | ➖  | 實用 tips 型、不故事化                                         |
| 籤詩 fortunes               | 60   | ➖  | ➖  | ➖  | 不故事化；poem 留漢詩、解說三語齊全（ja 2026-07-05 補齊 3→60） |

## 執行波次

- **Wave 3**：原民信仰 7 尊三語（補神明改寫遺漏）
- **Wave 4**：廟宇 57 間三語（description + history）— 最大宗，分區並行
- **Wave 5**：文化類 44 條三語（咒語本文保留）
- **收尾**：god-stories en/ja 補齊確認、全站 sortOrder 一致性複驗

## 進度確認方式

1. **這張表**：每波完成打勾更新
2. **三語一致性**：`npm run verify`（`scripts/verify-consistency.mjs`，2026-08-09 重建，**已納入 CI**）
   驗筆數 / id 順序 / **欄位齊全**，並順便對帳這張表的數字。首次執行即抓到 13 筆欄位缺口
   （ja 8 尊缺 worship/festivals、4 尊缺 festivals、en 孔子缺 festivals），已於同日補齊 —
   代表過去的「零缺口」只驗過筆數與順序。詳見 `PRODUCT-PROGRESS.md`。
3. **CI 三關**：每次 push 前 `npm run check` 必過（`astro build` 過 ≠ `astro check` 過）
4. **build**：`npx astro build` 頁數不減（2026-07-05 基準 736 頁）
