// 日文資料的字形規則（verify-consistency.mjs 使用）。
//
// 日文正文用日本常用漢字的字形：台灣字形 → 日本字形，例如 國→国、區→区、燈→灯。
// 只收日文寫法固定的字。刻意不收：龍（日文專有名詞兩種都用）、辨/辯/瓣（都會變成弁，意思會丟）、嶽。
// 2026-10-11 全面清理時套用了 368 處。

const PAIRS = `
國国 莊荘 巖巌 德徳 濟済 藏蔵 觀観 樂楽 瑤瑶 邊辺 靈霊 營営 溪渓 歲歳 峽峡 樓楼
廣広 應応 惠恵 會会 來来 與与 圖図 學学 體体 實実 寶宝 禮礼 齋斎 壽寿 燈灯 燒焼
爐炉 鐵鉄 號号 縣県 鄉郷 區区 單単 戰戦 獻献 圓円 團団 處処 聽聴 廳庁 傳伝 轉転
輕軽 經経 繼継 續続 綠緑 總総 隨随 險険 驗験 鹽塩 譯訳 讀読 變変 擇択 澤沢 釋釈
驛駅 舊旧 價価 雙双 歡歓 權権 勸勧 觸触 獨独 滿満 濱浜 稱称 齒歯 龜亀 豐豊 黨党
戲戯 劍剣 亞亜 惡悪 兒児 將将 專専 壓圧 從従 徑径 拜拝 拔抜 擔担 據拠 數数 斷断
晝昼 條条 榮栄 櫻桜 氣気 淺浅 溫温 灣湾 臺台 狀状 獵猟 畫画 當当 發発 盡尽 眾衆
碎砕 祕秘 稅税 穩穏 粹粋 絲糸 繪絵 聲声 肅粛 脫脱 腦脳 臟臓 舉挙 莖茎 萬万 蟲虫
裝装 覺覚 覽覧 謠謡 證証 讓譲 豬猪 貓猫 賣売 賴頼 踐践 辭辞 遙遥 遲遅 醫医 釀醸
錢銭 錄録 關関 隱隠 雜雑 顏顔 顯顕 餘余 騷騒 驅駆 髮髪 麥麦 黃黄 默黙 齊斉 齡齢
壯壮 爭争 乘乗 佛仏 假仮 僞偽 兩両 勞労 勳勲 卷巻 參参 嚴厳 囑嘱 圍囲 壞壊 奧奥
姬姫 寢寝 對対 屆届 屬属 巢巣 帶帯 廢廃 彈弾 徵徴 惱悩 慘惨 戀恋 拂払 擊撃 擴拡
攝摂 晉晋 曆暦 檢検 歷歴 殘残 殼殻 沒没 淚涙 渴渇 滯滞 潛潜 濕湿 瀨瀬 爲為 獸獣
盜盗 祿禄 禪禅 稻稲 穗穂 竝並 緣縁 繩縄 纖繊 舍舎 虛虚 蠶蚕 說説 讚賛 豫予 醉酔
醬醤 鑄鋳 閱閲 雞鶏 靜静 黑黒 內内 步歩 每毎 吳呉 晚晩 彥彦 眞真 卽即 揭掲 涉渉
戶戸 裡裏 卻却 麵麺 鍊錬 遞逓 擧挙 拋抛 曬晒
`
  .trim()
  .split(/\s+/);

export const JA_GLYPH_MAP = Object.fromEntries(PAIRS.map((p) => [...p]));

// 整個欄位保留原樣：地址與地圖／官網網址（讀者要複製去用）、籤詩原文、咒語內容（神聖本文逐字保留）。
export const isJaGlyphExempt = (base, key) =>
  ['address', 'poem', 'googleMap', 'url'].includes(key) || (base === 'culture-mantras' && key === 'content');

// 正文裡保留原樣的片段：佛光山（佛光山日本分院自稱「佛光山」），
// 以及後面緊接（…）說明的引用詞，例如「官將首（かんしょうしゅ）」——引號裡是台灣原本的寫法。
export const jaGlyphProtectedRanges = (s) => {
  const ranges = [];
  for (const m of s.matchAll(/佛光山/g)) ranges.push([m.index, m.index + m[0].length]);
  for (const m of s.matchAll(/「([^「」]{1,20})」?（/g)) ranges.push([m.index, m.index + m[0].length]);
  return ranges;
};

const JA_GLYPH_RE = new RegExp(`[${Object.keys(JA_GLYPH_MAP).join('')}]`, 'g');

/** 回傳字串裡應該換成日本字形、但還沒換的字（已排除保護片段）。 */
export const findTaiwanGlyphs = (s) => {
  const keep = jaGlyphProtectedRanges(s);
  return [...s.matchAll(JA_GLYPH_RE)]
    .filter((m) => !keep.some(([a, b]) => m.index >= a && m.index < b))
    .map((m) => m[0]);
};
