/**
 * 內容資料裡有少量 markdown 粗體記號（`**像這樣**`），但頁面是把純文字切成 <p> 直接輸出、
 * 不經過 markdown 解析器 —— 所以線上會看到裸露的星號。2026-08-09 盤點時全站有 78 個欄位中招。
 *
 * 這裡只處理粗體一種記號：把一行切成「要不要加粗」的片段，由呼叫端決定怎麼包。
 * 不引入 markdown 套件，也不動資料（作者原本就是想強調，記號留著、改成正確渲染）。
 */

export interface TextSegment {
  text: string;
  bold: boolean;
}

/**
 * 依 `**` 切段。奇數序的片段是粗體。
 * 記號沒有成對時（`**` 出現奇數次）原樣輸出整行 —— 寧可顯示星號，也不要把後半段整段變粗體。
 */
export function boldSegments(line: string): TextSegment[] {
  const parts = line.split('**');
  if (parts.length % 2 === 0) return [{ text: line, bold: false }];

  return parts.map((text, i) => ({ text, bold: i % 2 === 1 })).filter((segment) => segment.text !== '');
}

/**
 * 拿掉粗體記號，只留文字。
 * 用在**不該有樣式**的位置：meta description、JSON-LD、列表卡片的摘要 ——
 * 那些地方的星號純粹是雜訊（還會被搜尋引擎吃進去）。
 */
export function stripBold(text: string): string {
  return text.replace(/\*\*/g, '');
}
