# 內容故事化進度表

> 追蹤全站內容從「舊百科版」→「故事化版」（遵循 CONTENT-STYLE.md）的進度。
> 每完成一波更新這裡。想知道進度隨時看這張表。

## 判定圖例

- ✅ 已故事化（三語一致）
- 🔄 進行中
- ⬜ 待處理（還是舊百科版）
- ➖ 不故事化（保持原文，如籤詩、咒語本文、實用 tips）

## 進度總表

| 內容型                      | 筆數 | zh  | en  | ja  | 備註                                    |
| --------------------------- | ---- | --- | --- | --- | --------------------------------------- |
| **神明**                    |      |     |     |     |                                         |
| 道教神明 taoist-gods        | 15   | ✅  | ✅  | ✅  | wave 1/2                                |
| 佛教神明 buddhist-gods      | 11   | ✅  | ✅  | ✅  | wave 1/2                                |
| 民間神明 folk-gods          | 13   | ✅  | ✅  | ✅  | wave 1/2                                |
| 客家神明 hakka-gods         | 7    | ✅  | ✅  | ✅  | wave 1/2                                |
| 原民信仰 indigenous-spirits | 7    | ✅  | ✅  | ✅  | wave 3                                  |
| **廟宇**                    |      |     |     |     |                                         |
| 北部廟宇 temples-north      | 21   | ✅  | ✅  | ✅  | wave 4 — description + history          |
| 中部廟宇 temples-central    | 12   | ✅  | ✅  | ✅  | wave 4                                  |
| 南部廟宇 temples-south      | 13   | ✅  | ✅  | ✅  | wave 4                                  |
| 東部廟宇 temples-east       | 11   | ✅  | ✅  | ✅  | wave 4                                  |
| **文化**                    |      |     |     |     |                                         |
| 習俗 culture-customs        | 10   | ⬜  | ⬜  | ⬜  | **wave 5**                              |
| 節慶 culture-festivals      | 9    | ⬜  | ⬜  | ⬜  | wave 5                                  |
| 工藝 culture-heritage       | 7    | ⬜  | ⬜  | ⬜  | wave 5                                  |
| 儀式 culture-rituals        | 8    | ⬜  | ⬜  | ⬜  | wave 5                                  |
| 咒語介紹 culture-mantras    | 10   | ⬜  | ⬜  | ⬜  | wave 5 — **咒語本文不動、只改介紹文字** |
| **其他**                    |      |     |     |     |                                         |
| 神明故事 god-stories        | 10   | ✅  | —   | —   | 已是故事版（stage 一-b）；en/ja 待確認  |
| 路線 routes                 | 4    | ✅  | ✅  | ✅  | wave 1/2                                |
| 神明指南 god-guide          | 7    | ➖  | ➖  | ➖  | 實用 tips 型、不故事化                  |
| 籤詩 fortunes               | 60   | ➖  | ➖  | ➖  | 傳統籤詩原文、不改                      |

## 執行波次

- **Wave 3**：原民信仰 7 尊三語（補神明改寫遺漏）
- **Wave 4**：廟宇 57 間三語（description + history）— 最大宗，分區並行
- **Wave 5**：文化類 44 條三語（咒語本文保留）
- **收尾**：god-stories en/ja 補齊確認、全站 sortOrder 一致性複驗

## 進度確認方式

1. **這張表**：每波完成打勾更新
2. **三語一致性**：每波跑 `node verify-consistency.mjs`（比對 zh/en/ja 同檔 id 順序 + 欄位齊全）
3. **CI 三關**：每次 push 前 `npm run check` 必過
4. **build**：`npx astro build` 頁數不減
